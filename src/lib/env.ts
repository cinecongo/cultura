import { z } from 'zod';

import { defaultLocale, locales } from './i18n/locale';

/**
 * Variables publiques : préfixe NEXT_PUBLIC_, embarquées dans le JavaScript
 * du navigateur et dans l'APK. Aucun secret ici (AGENTS.md §7).
 *
 * Ce module est sûr côté client : il ne lit que des variables publiques.
 */

const isUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

export const appTargets = ['web', 'mobile'] as const;

export type AppTarget = (typeof appTargets)[number];

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .refine(isUrl, 'doit être une URL absolue http(s), sans slash final'),
  NEXT_PUBLIC_APP_TARGET: z.enum(appTargets).default('web'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(locales).default(defaultLocale),
  NEXT_PUBLIC_SUPABASE_URL: z.string().refine(isUrl, 'doit être une URL absolue http(s)'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, 'clé anon manquante ou tronquée'),
  // Clé de site Turnstile : publique par conception. Vide tant que O7 n'est pas
  // renseigné en production ; le widget est alors désactivé (échec fermé).
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().default(''),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

/**
 * Valide un ensemble de variables et renvoie l'objet typé.
 * Ne journalise jamais les valeurs : le message d'erreur ne cite que les noms.
 */
export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicEnvSchema.safeParse(source);

  if (!result.success) {
    const names = [
      ...new Set(result.error.issues.map((issue) => issue.path.join('.') || '(racine)')),
    ];
    throw new Error(
      `Variables d'environnement publiques invalides : ${names.join(', ')}. ` +
        'Voir .env.example.',
    );
  }

  return result.data;
}

let cached: PublicEnv | undefined;

/**
 * Accès paresseux : la validation n'a lieu qu'au premier appel.
 *
 * Les clés sont citées explicitement : Next ne remplace dans le bundle client
 * que les `process.env.NEXT_PUBLIC_*` écrits littéralement. Passer `process.env`
 * entier à zod laisserait le navigateur sans aucune valeur.
 */
export function getPublicEnv(): PublicEnv {
  cached ??= parsePublicEnv({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_TARGET: process.env.NEXT_PUBLIC_APP_TARGET,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  });
  return cached;
}

/** Réservé aux tests : vide le cache. */
export function resetPublicEnvCache(): void {
  cached = undefined;
}
