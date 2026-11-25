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
 * régulières : une regex sur le fichier confond le code et le JSX.
 *
 * Cas couverts : texte JSX, expression JSX (`{'texte'}`), attributs lus par un
 * humain (y compris `aria-label={'…'}`, `title={`…`}`), et `title` /
 * `description` des objets `metadata` (texte visible dans l'onglet et en SEO).
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

const literalValue = (node: ts.Node): string | null => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
};

/** Textes réellement visibles dans un composant, avec leur emplacement. */
function visibleTexts(file: string): { where: string; text: string }[] {
  const source = parse(file);
  const found: { where: string; text: string }[] = [];

  const visit = (node: ts.Node): void => {
    // Enfant JSX littéral : <p>Bonjour</p>
    if (ts.isJsxText(node)) {
      const text = node.text.trim();
      if (HAS_LETTERS.test(text)) found.push({ where: 'texte JSX', text });
    }

    // Enfant JSX en expression littérale : <p>{'Bonjour'}</p>
    if (ts.isJsxExpression(node) && node.expression) {
      const text = literalValue(node.expression)?.trim();
      if (text && HAS_LETTERS.test(text)) found.push({ where: 'expression JSX', text });
    }

    // Attributs lisibles par un humain, y compris en expression littérale.
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      VISIBLE_ATTRIBUTES.has(node.name.text)
    ) {
      const initializer = node.initializer;
      const value = initializer
        ? ts.isStringLiteral(initializer)
          ? initializer.text
          : ts.isJsxExpression(initializer) && initializer.expression
            ? literalValue(initializer.expression)
            : null
        : null;
      const text = value?.trim();
      if (text && HAS_LETTERS.test(text)) {
        found.push({ where: `attribut ${node.name.text}`, text });
      }
    }

    // `metadata = { title: '…', description: '…' }` : visible en SEO.
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      (node.name.text === 'title' || node.name.text === 'description')
    ) {
      const text = literalValue(node.initializer)?.trim();
      if (text && HAS_LETTERS.test(text)) {
        found.push({ where: `metadata.${node.name.text}`, text });
      }
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
      const href = node.initializer.text;
      // Les fichiers statiques (police, image, icône) ne sont pas des routes :
      // eux seuls ont une extension.
      if (!/\/[^/]+\.[a-z0-9]+$/i.test(href)) found.push(`href="${href}"`);
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return found;
}

describe('textes d’interface', () => {
  it('ne contient aucun texte visible écrit en dur dans un composant', () => {
    const violations = tsxFiles.flatMap((file) =>
      visibleTexts(file).map(({ where, text }) => `${relative(ROOT, file)} : ${where} « ${text} »`),
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
    const source = ts.createSourceFile(
      join(ROOT, 'tests', '__fixture__.tsx'),
      `export const metadata = { title: 'Accueil' };\n` +
        `export const X = () => <p aria-label={'Libellé'} title={\`Titre\`}>Bonjour {'monde'}</p>;`,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    const found: string[] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isJsxText(node) && HAS_LETTERS.test(node.text.trim())) found.push(node.text.trim());
      if (ts.isJsxExpression(node) && node.expression) {
        const text = literalValue(node.expression)?.trim();
        if (text && HAS_LETTERS.test(text)) found.push(text);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);

    expect(found).toHaveLength(4);
    expect(found).toEqual(expect.arrayContaining(['Bonjour', 'monde', 'Libellé', 'Titre']));
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
    { pattern: /\bapplication(s)?\b/iu, instead: 'a Cultura' },
    { pattern: /\bstor(y|ies)\b/iu, instead: 'non applicable au MVP' },
    { pattern: /\breels?\b/iu, instead: 'non applicable au MVP' },
    { pattern: /\bscraping\b/iu, instead: 'non applicable au MVP' },
  ];

  const catalogs = { pt, fr, en } as const;

  const catalogueTexts = Object.entries(catalogs).flatMap(([locale, catalog]) =>
    Object.entries(catalog).flatMap(([key, value]) =>
      (typeof value === 'string' ? [value] : [value.one, value.other]).map((text) => ({
        origin: `${locale}.${key}`,
        text,
      })),
    ),
  );

  const jsxTexts = tsxFiles.flatMap((file) =>
    visibleTexts(file).map(({ where, text }) => ({
      origin: `${relative(ROOT, file)} (${where})`,
      text,
    })),
  );

  it('n’apparaît dans aucun catalogue', () => {
    const violations: string[] = [];

    for (const { origin, text } of catalogueTexts) {
      for (const { pattern, instead } of FORBIDDEN) {
        if (pattern.test(text)) violations.push(`${origin} : « ${text} » → utiliser ${instead}`);
      }
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('n’apparaît dans aucun texte visible d’un composant', () => {
    const violations: string[] = [];

    for (const { origin, text } of jsxTexts) {
      for (const { pattern, instead } of FORBIDDEN) {
        if (pattern.test(text)) violations.push(`${origin} : « ${text} » → utiliser ${instead}`);
      }
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('laisse passer les formes verbales exigées par la mention éditoriale', () => {
    const mention = 'Informação publicada pela equipa Cultura com base numa fonte pública.';
    expect(FORBIDDEN.some(({ pattern }) => pattern.test(mention))).toBe(false);
  });
});
