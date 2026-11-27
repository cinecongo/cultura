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
  /** Binaire PHP utilisé par le mailer ; « php » par défaut si absent. */
  PHP_BINARY: z.string().min(1).optional(),
  /** Bac à sable fichier du mailer en développement / e2e (hors Git). */
  MAIL_OUTBOX_FILE: z.string().min(1).optional(),
  MAIL_SMTP_HOST: z.string().min(1).optional(),
  MAIL_SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  MAIL_SMTP_USER: z.string().optional(),
  MAIL_SMTP_PASS: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  /** Clé HMAC des identifiants de limitation ; dérivée de service_role si absente. */
  AUTH_RATE_LIMIT_SECRET: z.string().min(1).optional(),
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
