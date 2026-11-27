import { z } from 'zod';

import { locales } from '@/lib/i18n/locale';
import { AuthError } from './errors';

export const PASSWORD_MIN = 12;
export const SITE_KEY_TEST_PATTERN = /^1x0{4}/;

/** Actions autorisées : une par formulaire, jamais une chaîne libre du client. */
export const TURNSTILE_ACTIONS = ['signup', 'signin', 'reset'] as const;
export type TurnstileAction = (typeof TURNSTILE_ACTIONS)[number];

export const localeSchema = z.enum(locales);

/**
 * Les champs inconnus sont ignorés (`strip`) : un client peut envoyer
 * `{ role: 'admin' }`, il est retiré ici et jamais transmis en base.
 */
export const signupSchema = z
  .object({
    nom: z.string().trim().min(2).max(80),
    email: z.email().max(254),
    password: z.string().min(PASSWORD_MIN).max(200).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    locale: localeSchema,
    turnstileToken: z.string().min(1).max(2048),
    terms: z.literal(true),
  })
  .strip();

export const signinSchema = z
  .object({
    email: z.email().max(254),
    password: z.string().min(1).max(200),
    locale: localeSchema,
    turnstileToken: z.string().min(1).max(2048),
  })
  .strip();

export const emailSchema = z
  .object({
    email: z.email().max(254),
    locale: localeSchema,
    turnstileToken: z.string().min(1).max(2048),
  })
  .strip();

export const passwordSchema = z
  .object({
    password: z.string().min(PASSWORD_MIN).max(200).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    passwordConfirm: z.string().max(200),
    locale: localeSchema,
  })
  .strip()
  .refine((value) => value.password === value.passwordConfirm, {
    path: ['passwordConfirm'],
  });

export const callbackSchema = z
  .object({
    token_hash: z.string().min(10).max(2048),
    type: z.enum(['signup', 'invite', 'recovery']),
    locale: localeSchema,
  })
  .strip();

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type CallbackInput = z.infer<typeof callbackSchema>;

/** Traduit un échec zod en clé i18n, sans exposer la contrainte technique. */
export function validationError(result: z.ZodError): AuthError {
  const paths = new Set(result.issues.map((issue) => String(issue.path[0] ?? '')));
  if (paths.has('terms')) {
    return new AuthError(400, 'validation.termsRequired');
  }
  if (paths.has('email')) {
    return new AuthError(400, 'validation.emailInvalid');
  }
  if (paths.has('password') || paths.has('passwordConfirm')) {
    return new AuthError(
      400,
      paths.has('passwordConfirm') ? 'validation.passwordMismatch' : 'validation.passwordWeak',
    );
  }
  if (paths.has('nom')) {
    return new AuthError(400, 'validation.required', undefined);
  }
  return new AuthError(400, 'auth.error.generic');
}

export function parseOrThrow<T>(result: z.ZodSafeParseResult<T>): T {
  if (!result.success) {
    throw validationError(result.error);
  }
  return result.data;
}
