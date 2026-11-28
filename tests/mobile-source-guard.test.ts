import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { segmentsFor } from '@/lib/platform';

/**
 * Garde de séparation des cibles (ADR-001 §1, ADR-008 §3).
 *
 * Le plugin sécurisé a un repli web fondé sur `localStorage` : il doit rester
 * hors de tout chemin importable par la cible web. Ces gardes sont indépendantes
 * des builds, donc exécutées à chaque `npm test`.
 */

const ROOT = process.cwd();

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk(join(ROOT, 'src'));
const read = (path: string): string => readFileSync(path, 'utf8');

describe('séparation des cibles mobile et web', () => {
  it('confine les imports Capacitor et du plugin aux modules *.native.ts', () => {
    const offenders = sourceFiles.filter(
      (file) =>
        !file.endsWith('.native.ts') &&
        /from ['"](?:@capacitor\/|@aparajita\/capacitor-secure-storage)/u.test(read(file)),
    );
    expect(offenders.map((file) => relative(ROOT, file))).toEqual([]);
  });

  it('n’utilise ni localStorage ni cookie de session dans les fichiers mobile', () => {
    const mobileFiles = sourceFiles.filter(
      (file) => file.endsWith('.native.ts') || file.endsWith('.mobile.tsx'),
    );
    expect(mobileFiles.length).toBeGreaterThan(0);
    const offenders = mobileFiles.filter((file) =>
      /localStorage|sessionStorage|document\.cookie/u.test(
        read(file)
          .replace(/\/\*[\s\S]*?\*\//gu, '')
          .replace(/^\s*\/\/.*$/gmu, ''),
      ),
    );
    expect(offenders.map((file) => relative(ROOT, file))).toEqual([]);
  });

  it('ne réexporte pas le stockage natif depuis la couche platform publique', () => {
    expect(read(join(ROOT, 'src/lib/platform/index.ts'))).not.toMatch(/session-storage\.native/u);
  });

  it('configure le client mobile sans callback d’URL ni secret serveur', () => {
    const client = read(join(ROOT, 'src/lib/auth/mobile-client.native.ts'));
    expect(client).toMatch(/detectSessionInUrl:\s*false/u);
    expect(client).toMatch(/persistSession:\s*true/u);
    expect(client).not.toMatch(/getServerEnv|authAdminClient|service_role|sb_secret_/u);
  });

  it('ne réutilise pas les composants web dépendants du serveur', () => {
    for (const file of sourceFiles.filter(
      (name) => name.includes('mobile') && name.endsWith('.tsx'),
    )) {
      const content = read(file);
      expect(content).not.toMatch(
        /@supabase\/ssr|server-only|from ['"][^'"]*\/(auth-page|auth-form)['"]/u,
      );
    }
  });

  it('embarque les fichiers statiques sans serveur distant ni débogage WebView', () => {
    const config = read(join(ROOT, 'capacitor.config.ts'))
      .replace(/\/\*[\s\S]*?\*\//gu, '')
      .replace(/^\s*\/\/.*$/gmu, '');
    expect(config).toMatch(/webDir:\s*'out'/u);
    expect(config).not.toMatch(/server\s*:|cleartext/u);
    expect(config).not.toMatch(/webContentsDebuggingEnabled:\s*true/u);
  });

  it('fournit les couples locale/segment réels pour connexion et compte', () => {
    for (const locale of ['pt', 'fr', 'en'] as const) {
      const segments = segmentsFor(locale);
      for (const name of ['signin', 'account'] as const) {
        const path = join(
          ROOT,
          'src/app/(localized)/[locale]/(auth)',
          segments[name],
          'page.mobile.tsx',
        );
        expect(read(path)).toMatch(/mobileAuthPage/u);
        expect(read(path)).toContain(`mobileAuthPage('${name}', '${segments[name]}')`);
      }
    }
  });

  it('ouvre l’APK sur un écran de session, pas sur le résolveur de langue public', () => {
    const group = join(ROOT, 'src/app/(default)');
    // Un `page.tsx` sans suffixe serait valide dans les deux cibles et
    // l'emporterait sur `page.mobile.tsx` (Next ne trie pas par préférence
    // de suffixe) : le résolveur public reviendrait dans l'APK.
    expect(readdirSync(group)).not.toContain('page.tsx');
    expect(readdirSync(group)).toContain('page.web.tsx');
    const root = read(join(group, 'page.mobile.tsx'));
    expect(root).toContain('MobileSession');
    expect(read(join(ROOT, 'src/components/auth/mobile-session.tsx'))).toContain(
      'mobileCurrentUser',
    );
  });
});
