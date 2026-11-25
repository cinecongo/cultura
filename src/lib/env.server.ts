import 'server-only';

import { z } from 'zod';

/**
 * Secrets serveur. Ce module ne doit JAMAIS être importé depuis un composant
 * client : il lève une erreur immédiate si `window` existe.
 *
 * Les valeurs ne sont jamais journalisées ni sérialisées (AGENTS.md §7).
 */

if (typeof window !== 'undefined') {
  throw new Error(
    'src/lib/env.server.ts a été importé côté navigateur. ' +
      'Les secrets serveur ne doivent jamais entrer dans le bundle client.',
  );
}

export const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, 'clé service_role manquante ou tronquée'),
  SUPABASE_PROJECT_ID: z.string().min(1).optional(),
  SUPABASE_ACCESS_TOKEN: z.string().min(1).optional(),
  SUPABASE_DB_PASSWORD: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  ANDROID_PACKAGE_NAME: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    const names = [
      ...new Set(result.error.issues.map((issue) => issue.path.join('.') || '(racine)')),
    ];
    throw new Error(
      `Variables d'environnement serveur invalides : ${names.join(', ')}. ` +
        'Renseigner .env.local (jamais versionné).',
    );
  }

  return result.data;
}

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}

/** Réservé aux tests : vide le cache. */
export function resetServerEnvCache(): void {
  cached = undefined;
}
