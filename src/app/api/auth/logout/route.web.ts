import { AuthError } from '@/lib/auth/errors';
import { authErrorResponse, authJson } from '@/lib/auth/http';
import { isAllowedPostOrigin } from '@/lib/auth/origin';
import { signOutEverywhere } from '@/lib/auth/session';

export const runtime = 'nodejs';

/** Déconnexion : révocation serveur de la session et des autres sessions. */
export async function POST(request: Request) {
  try {
    if (!isAllowedPostOrigin(request)) {
      throw new AuthError(403, 'auth.error.generic');
    }
    await signOutEverywhere();
    return authJson({ status: 'signed_out' });
  } catch (error) {
    return authErrorResponse(error);
  }
}
