import { authServerClient } from '@/lib/auth/clients';
import { AuthError, tooManyRequests } from '@/lib/auth/errors';
import { authErrorResponse, authJson, readJsonBody } from '@/lib/auth/http';
import { isAllowedPostOrigin } from '@/lib/auth/origin';
import { consumeRateLimit } from '@/lib/auth/rate-limit';
import { currentProfile, signOutOtherSessions } from '@/lib/auth/session';
import { parseOrThrow, passwordSchema } from '@/lib/auth/validation';

export const runtime = 'nodejs';

/** Changement de mot de passe : session obligatoire, autres sessions révoquées. */
export async function POST(request: Request) {
  try {
    if (!isAllowedPostOrigin(request)) {
      throw new AuthError(403, 'auth.error.generic');
    }

    const input = parseOrThrow(passwordSchema.safeParse(await readJsonBody(request)));
    const profile = await currentProfile();
    if (!profile) throw new AuthError(401, 'auth.error.generic');

    if (!(await consumeRateLimit('password', profile.id, 5, 3600))) {
      throw tooManyRequests(3600);
    }

    const { error } = await authServerClient().auth.updateUser({ password: input.password });
    if (error) throw new AuthError(400, 'auth.error.generic');

    await signOutOtherSessions();
    return authJson({ status: 'updated' });
  } catch (error) {
    return authErrorResponse(error);
  }
}
