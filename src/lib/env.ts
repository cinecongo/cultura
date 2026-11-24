import { z } from 'zod';

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

export const locales = ['pt', 'fr', 'en'] as const;
export const appTargets = ['web', 'mobile'] as const;

export type Locale = (typeof locales)[number];
export type AppTarget = (typeof appTargets)[number];

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .refine(isUrl, 'doit être une URL absolue http(s), sans slash final'),
  NEXT_PUBLIC_APP_TARGET: z.enum(appTargets).default('web'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(locales).default('pt'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().refine(isUrl, 'doit être une URL absolue http(s)'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, 'clé anon manquante ou tronquée'),
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

/** Accès paresseux : la validation n'a lieu qu'au premier appel. */
export function getPublicEnv(): PublicEnv {
  cached ??= parsePublicEnv(process.env);
  return cached;
}

/** Réservé aux tests : vide le cache. */
export function resetPublicEnvCache(): void {
  cached = undefined;
}
