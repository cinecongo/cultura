import 'server-only';

import { cache } from 'react';
import { z } from 'zod';

import { authServerClient, currentUser } from './clients';

export const roleSchema = z.enum(['membre', 'acteur', 'editeur', 'admin']);
const profileSchema = z.object({
  id: z.string().min(1),
  email: z.email().max(254),
  role: roleSchema,
  langue_preferee: z.enum(['pt', 'fr', 'en']),
});

export type Role = z.infer<typeof roleSchema>;

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
export const currentProfile = cache(async (): Promise<SessionProfile | null> => {
  const user = await currentUser();
  if (!user) return null;

  const { data, error } = await authServerClient()
    .from('users')
    .select('id, email, role, langue_preferee')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) return null;

  return {
    id: user.id,
    email: parsed.data.email,
    role: parsed.data.role,
    langue_preferee: parsed.data.langue_preferee,
    emailConfirmedAt: user.email_confirmed_at ?? null,
  };
});

/** Révoque la session courante et toutes les autres sessions de l'utilisateur. */
export async function signOutEverywhere(): Promise<void> {
  await authServerClient().auth.signOut({ scope: 'global' });
}

/** Après changement de mot de passe : garde la session courante, révoque les autres. */
export async function signOutOtherSessions(): Promise<void> {
  await authServerClient().auth.signOut({ scope: 'others' });
}
