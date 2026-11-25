/**
 * Active le hook pré-commit versionné (`.githooks/`).
 *
 * Appelé par `npm install` via le script `prepare`. Ne doit jamais faire échouer
 * une installation : hors dépôt Git (tarball, cache CI), il ne fait rien.
 */

const { execFileSync } = require('node:child_process');
const { chmodSync } = require('node:fs');

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

try {
  if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') {
    process.exit(0);
  }

  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });

  // Sur les systèmes POSIX, le bit exécutable doit être posé une fois.
  try {
    chmodSync('.githooks/pre-commit', 0o755);
  } catch {
    // Windows : sans objet.
  }

  console.log('[hooks] pré-commit actif (ESLint + gitleaks).');
} catch {
  // Pas de Git, ou configuration impossible : ne jamais casser `npm install`.
}
