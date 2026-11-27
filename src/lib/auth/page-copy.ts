import type { StringKey } from '@/lib/i18n';

/** Clés i18n des métadonnées des écrans d'authentification (aucun texte en dur). */
export type AuthScreenName = 'signup' | 'signin' | 'verify' | 'reset' | 'password' | 'account';

export const AUTH_META: Record<
  AuthScreenName,
  { readonly title: StringKey; readonly description: StringKey }
> = {
  signup: { title: 'meta.signup.title', description: 'meta.signup.description' },
  signin: { title: 'meta.signin.title', description: 'meta.signin.description' },
  verify: { title: 'meta.verify.title', description: 'meta.verify.description' },
  reset: { title: 'meta.reset.title', description: 'meta.reset.description' },
  password: { title: 'meta.password.title', description: 'meta.password.description' },
  account: { title: 'auth.account.title', description: 'meta.guard.description' },
};

export const AUTH_LEAD: Partial<Record<AuthScreenName, StringKey>> = {
  signup: 'auth.signup.lead',
  signin: 'auth.signin.lead',
  reset: 'auth.reset.lead',
};
