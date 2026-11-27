import 'server-only';

import { NextResponse } from 'next/server';

import { AuthError } from './errors';

/** En-têtes obligatoires de toute réponse `/api/auth/*`. */
export const AUTH_RESPONSE_HEADERS: Readonly<Record<string, string>> = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

export function authJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: AUTH_RESPONSE_HEADERS });
}

export function authRedirect(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  for (const [name, value] of Object.entries(AUTH_RESPONSE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}

/**
 * Convertit une erreur en réponse publique. Les erreurs inattendues deviennent
 * un message générique : aucun stderr, aucun detail Supabase, aucun jeton.
 */
export function authErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return authJson(
      { errorKey: error.key, ...(error.count === undefined ? {} : { count: error.count }) },
      error.status,
    );
  }
  return authJson({ errorKey: 'auth.error.generic' }, 400);
}

/** Lit un corps JSON avec une borne de taille ; jamais de log du contenu. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const raw = await request.text();
  if (raw.length > 16_384) {
    throw new AuthError(413, 'auth.error.generic');
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('invalid body');
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new AuthError(400, 'auth.error.generic');
  }
}
