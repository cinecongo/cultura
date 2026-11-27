import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Charge les variables nécessaires aux tests d'intégration dans le processus
 * Node de Playwright. Aucune valeur n'est journalisée et une variable déjà
 * injectée par la CI garde la priorité.
 */
const file = join(process.cwd(), '.env.local');
if (existsSync(file)) {
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match?.[1] || match[2] === undefined) continue;
    if (process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

/** Le client admin n'existe que côté test : jamais dans le bundle navigateur. */
export const testAdmin = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  key: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
};
