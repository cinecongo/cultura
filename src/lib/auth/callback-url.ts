/**
 * Fragment d'URL des liens d'authentification. Le jeton reste dans le fragment
 * (`#…`) : il n'est jamais envoyé au serveur dans la requête de la page, donc
 * jamais écrit dans les journaux ni transmis comme `Referer`.
 */

export const AUTH_CALLBACK_TYPES = ['signup', 'invite', 'recovery'] as const;
export type AuthCallbackType = (typeof AUTH_CALLBACK_TYPES)[number];

export function authCallbackFragment(tokenHash: string, type: AuthCallbackType): string {
  return new URLSearchParams({ token_hash: tokenHash, type }).toString();
}

export function parseAuthCallbackFragment(
  hash: string,
): { readonly tokenHash: string; readonly type: AuthCallbackType } | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return null;

  const params = new URLSearchParams(raw);
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  if (!tokenHash || tokenHash.length < 10 || tokenHash.length > 2048) return null;
  if (!type || !(AUTH_CALLBACK_TYPES as readonly string[]).includes(type)) return null;
  return { tokenHash, type: type as AuthCallbackType };
}
