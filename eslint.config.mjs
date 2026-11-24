import next from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'android/**',
      'coverage/**',
      'next-env.d.ts',
      'supabase/.temp/**',
    ],
  },
  ...next,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Le projet interdit `any` non justifié (AGENTS.md §3.5, verifier).
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      // App Router uniquement : pas de dossier `pages`, donc la règle est sans objet.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    files: ['tests/**/*.ts', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Outils en ligne de commande exécutés par Node, hors bundle applicatif :
    // CommonJS et sortie console y sont légitimes.
    files: ['scripts/**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },
];

export default config;
