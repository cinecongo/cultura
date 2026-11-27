import type { PluralKey, StringKey } from '@/lib/i18n';

/**
 * Erreur d'une route d'authentification. `key` est une clé i18n : aucun
 * message brut, aucune valeur de jeton, aucune adresse email dans l'erreur.
 */
export class AuthError extends Error {
  constructor(
    readonly status: number,
    readonly key: StringKey | PluralKey,
    readonly count?: number,
  ) {
    // Message technique fixe : il ne doit jamais arriver au navigateur.
    super('AuthError');
    this.name = 'AuthError';
  }
}

export function authError(status: number, key: StringKey | PluralKey, count?: number): AuthError {
  return new AuthError(status, key, count);
}

export function tooManyRequests(seconds: number): AuthError {
  return authError(429, 'auth.error.tooManyRequests', seconds);
}
