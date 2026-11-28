#!/usr/bin/env node
/*
 * Garde de séparation des bundles — ADR-001 §1, ADR-008 §3.
 *
 * Usage : node scripts/check-mobile-bundles.cjs web|mobile
 * À exécuter juste après le build correspondant (les deux cibles partagent
 * `.next` : les builds ne doivent pas tourner en parallèle).
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const target = process.argv[2];
if (target !== 'web' && target !== 'mobile') {
  console.error('Usage : node scripts/check-mobile-bundles.cjs web|mobile');
  process.exit(2);
}

const root = path.resolve(
  __dirname,
  '..',
  target === 'web' ? path.join('.next', 'static') : path.join('out', '_next', 'static'),
);

if (!fs.existsSync(root)) {
  console.error(`Dossier introuvable : ${root}`);
  process.exit(1);
}

/**
 * Côté web : aucun indice de plugin natif ni de client mobile.
 * Côté mobile : le plugin est attendu, mais aucun secret ni chemin de module
 * natif ne doit apparaître en clair dans les chunks.
 *
 * `detectSessionInUrl` est une option standard de `@supabase/auth-js` : sa
 * valeur par défaut (`true`) est présente dans le bundle web, indépendamment
 * de notre code. La valeur `false` de la cible mobile est vérifiée dans le
 * code source par `tests/mobile-source-guard.test.ts`, pas ici.
 *
 * `sb_secret_` apparaît aussi comme simple chaîne dans le code de détection
 * de clé de Supabase : seule une valeur réelle (suffixe d'au moins 20 chars)
 * constitue une fuite.
 */
const SECRET_VALUE = /sb_secret_[A-Za-z0-9_-]{20,}/u;
const FORBIDDEN_WEB = /@capacitor|@aparajita|secure-storage|session-storage\.native/u;
const FORBIDDEN_MOBILE = /session-storage\.native/u;
const forbidden = target === 'web' ? FORBIDDEN_WEB : FORBIDDEN_MOBILE;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith('.js') ? [full] : [];
  });
}

const files = walk(root);
const offenders = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const match = forbidden.exec(content) ?? SECRET_VALUE.exec(content);
  if (match) offenders.push(`${path.relative(process.cwd(), file)} : ${match[0]}`);
}

if (target === 'mobile') {
  // Un couple locale/segment invalide produirait une page __next_error__ :
  // on exige les six couples réels, pas six chemins arbitraires.
  const needed = [
    'out/index.html',
    'out/pt/entrar/index.html',
    'out/fr/connexion/index.html',
    'out/en/signin/index.html',
    'out/pt/conta/index.html',
    'out/fr/compte/index.html',
    'out/en/account/index.html',
  ];
  for (const file of needed) {
    const full = path.resolve(__dirname, '..', file);
    if (!fs.existsSync(full)) {
      offenders.push(`${file} : page de session absente de l'export`);
    } else if (fs.readFileSync(full, 'utf8').includes('__next_error__')) {
      offenders.push(`${file} : page d'erreur au lieu de la page de session`);
    }
  }
  const api = path.resolve(__dirname, '..', 'out', 'api');
  if (fs.existsSync(api)) offenders.push('out/api : route serveur présente dans l’export');
}

if (offenders.length > 0) {
  console.error(`Garde ${target} échouée :`);
  for (const line of offenders.slice(0, 20)) console.error(`  - ${line}`);
  process.exit(1);
}

console.log(`Garde ${target} OK : ${files.length} fichiers JS analysés, 0 occurrence interdite.`);
