import { authServerClient } from '@/lib/auth/clients';
import { AuthError, tooManyRequests } from '@/lib/auth/errors';
import { authErrorResponse, authJson, readJsonBody } from '@/lib/auth/http';
import { isAllowedPostOrigin } from '@/lib/auth/origin';
import { clientIp, consumeRateLimit } from '@/lib/auth/rate-limit';
import { signOutEverywhere } from '@/lib/auth/session';
import { verifyTurnstile } from '@/lib/auth/turnstile';
import { parseOrThrow, signinSchema } from '@/lib/auth/validation';

export const runtime = 'nodejs';

/** Connexion : cookie de session HttpOnly, jamais de jeton dans le navigateur. */
export async function POST(request: Request) {
  try {
    if (!isAllowedPostOrigin(request)) {
      throw new AuthError(403, 'auth.error.generic');
    }

    const input = parseOrThrow(signinSchema.safeParse(await readJsonBody(request)));
    await verifyTurnstile(input.turnstileToken, 'signin');

    if (!(await consumeRateLimit('signin', clientIp(request), 8, 900))) {
      throw tooManyRequests(900);
    }
    if (!(await consumeRateLimit('signin', input.email, 5, 900))) {
      throw tooManyRequests(900);
    }

    const { data, error } = await authServerClient().auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user) {
      throw new AuthError(401, 'auth.signin.error.credentials');
    }
    if (!data.user.email_confirmed_at) {
      await signOutEverywhere();
      throw new AuthError(401, 'auth.signin.error.unverified');
    }

    return authJson({ status: 'signed_in' });
  } catch (error) {
    return authErrorResponse(error);
  }
}
