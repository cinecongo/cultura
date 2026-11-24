import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { en } from '@/lib/i18n/messages/en';
import { fr } from '@/lib/i18n/messages/fr';
import { pt } from '@/lib/i18n/messages/pt';

/**
 * Garde-fous éditoriaux et structurels (ADR-002 §1 et §6, glossaire §8).
 *
 * Le scan des composants passe par l'AST TypeScript, pas par des expressions
 * régulières : une regex sur le fichier confond le code et le JSX et produit
 * des faux positifs (déjà observé sur un type générique suivi d'un `return`).
 */

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const tsxFiles = walk(SRC).filter((file) => file.endsWith('.tsx'));

/** Attributs dont la valeur est lue par un humain ou un lecteur d'écran. */
const VISIBLE_ATTRIBUTES = new Set([
  'aria-label',
  'aria-description',
  'aria-placeholder',
  'title',
  'alt',
  'placeholder',
]);

const HAS_LETTERS = /\p{L}{2,}/u;

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function literalTexts(file: string): string[] {
  const source = parse(file);
  const found: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      const text = node.text.trim();
      if (HAS_LETTERS.test(text)) found.push(`texte JSX « ${text} »`);
    }

    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      VISIBLE_ATTRIBUTES.has(node.name.text) &&
      node.initializer !== undefined &&
      ts.isStringLiteral(node.initializer)
    ) {
      const text = node.initializer.text.trim();
      if (HAS_LETTERS.test(text)) found.push(`attribut ${node.name.text} « ${text} »`);
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return found;
}

function hardcodedHrefs(file: string): string[] {
  const source = parse(file);
  const found: string[] = [];

  const visit = (node: ts.Node): void => {
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'href' &&
      node.initializer !== undefined &&
      ts.isStringLiteral(node.initializer) &&
      node.initializer.text.startsWith('/')
    ) {
      found.push(`href="${node.initializer.text}"`);
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return found;
}

describe('textes d’interface', () => {
  it('ne contient aucun texte visible écrit en dur dans un composant', () => {
    const violations = tsxFiles.flatMap((file) =>
      literalTexts(file).map((detail) => `${relative(ROOT, file)} : ${detail}`),
    );

    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('passe toujours par routePath pour les liens internes', () => {
    const violations = tsxFiles.flatMap((file) =>
      hardcodedHrefs(file).map((detail) => `${relative(ROOT, file)} : ${detail}`),
    );

    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('détecte réellement un texte en dur (le test précédent n’est pas vide)', () => {
    const fake = join(ROOT, 'tests', '__fixture__.tsx');
    const source = ts.createSourceFile(
      fake,
      'export const X = () => <p aria-label="Libellé">Bonjour</p>;',
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const found: string[] = [];

    const visit = (node: ts.Node): void => {
      if (ts.isJsxText(node) && HAS_LETTERS.test(node.text.trim())) {
        found.push(node.text.trim());
      }
      ts.forEachChild(node, visit);
    };
    visit(source);

    expect(found).toEqual(['Bonjour']);
  });
});

describe('termes interdits', () => {
  const FORBIDDEN: ReadonlyArray<{ pattern: RegExp; instead: string }> = [
    { pattern: /\bpublicaç(ão|ões)\b/iu, instead: 'anúncio cultural' },
    { pattern: /\bpublication(s)?\b/iu, instead: 'annonce culturelle' },
    { pattern: /\bposts?\b/iu, instead: 'annonce culturelle' },
    { pattern: /\bplataformas?\b/iu, instead: 'a agenda' },
    { pattern: /\bplateformes?\b/iu, instead: 'la Cultura' },
    { pattern: /\butilizador(es)?\b/iu, instead: 'o público' },
    { pattern: /\butilisateur(s)?\b/iu, instead: 'le public' },
    { pattern: /\bconta de artista\b/iu, instead: 'conta de agente cultural' },
    { pattern: /\bcompte (d’|d')?artiste\b/iu, instead: 'compte acteur culturel' },
    { pattern: /\bseguidor(es)?\b/iu, instead: 'non applicable au MVP' },
    { pattern: /\bfollowers?\b/iu, instead: 'non applicable au MVP' },
    { pattern: /\babonnés\b/iu, instead: 'non applicable au MVP' },
  ];

  const catalogs = { pt, fr, en } as const;

  it('n’apparaît dans aucun catalogue', () => {
    const violations: string[] = [];

    for (const [locale, catalog] of Object.entries(catalogs)) {
      for (const [key, value] of Object.entries(catalog)) {
        const texts = typeof value === 'string' ? [value] : [value.one, value.other];
        for (const text of texts) {
          for (const { pattern, instead } of FORBIDDEN) {
            if (pattern.test(text)) {
              violations.push(`${locale}.${key} : « ${text} » → utiliser ${instead}`);
            }
          }
        }
      }
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('laisse passer les formes verbales exigées par la mention éditoriale', () => {
    const mention = 'Informação publicada pela equipa Cultura com base numa fonte pública.';
    expect(FORBIDDEN.some(({ pattern }) => pattern.test(mention))).toBe(false);
  });
});
