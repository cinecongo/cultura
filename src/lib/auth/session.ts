import 'server-only';

import { authServerClient, currentUser } from './clients';

export type Role = 'membre' | 'acteur' | 'editeur' | 'admin';

export type SessionProfile = {
  readonly id: string;
  readonly email: string;
  readonly role: Role;
  readonly langue_preferee: 'pt' | 'fr' | 'en';
  readonly emailConfirmedAt: string | null;
};

/**
 * Le rôle est relu en base à chaque appel : il n'est jamais déduit d'un champ
 * modifiable par l'utilisateur, ni du JWT seul.
 */
export async function currentProfile(): Promise<SessionProfile | null> {
  const user = await currentUser();
  if (!user) return null;

  const { data, error } = await authServerClient()
    .from('users')
    .select('id, email, role, langue_preferee')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: user.id,
    email: data.email,
    role: data.role as Role,
    langue_preferee: data.langue_preferee as 'pt' | 'fr' | 'en',
    emailConfirmedAt: user.email_confirmed_at ?? null,
  };
}

/** Révoque la session courante et toutes les autres sessions de l'utilisateur. */
export async function signOutEverywhere(): Promise<void> {
  await authServerClient().auth.signOut({ scope: 'global' });
}

/** Après changement de mot de passe : garde la session courante, révoque les autres. */
export async function signOutOtherSessions(): Promise<void> {
  await authServerClient().auth.signOut({ scope: 'others' });
}
