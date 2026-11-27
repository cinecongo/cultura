import { authServerClient } from '@/lib/auth/clients';
import { AuthError, tooManyRequests } from '@/lib/auth/errors';
import { authErrorResponse, authJson, readJsonBody } from '@/lib/auth/http';
import { internalUrl } from '@/lib/auth/links';
import { isAllowedPostOrigin } from '@/lib/auth/origin';
import { clientIp, consumeRateLimit } from '@/lib/auth/rate-limit';
import { signOutOtherSessions } from '@/lib/auth/session';
import { callbackSchema, parseOrThrow } from '@/lib/auth/validation';
import { sendTransactionalMail } from '@/lib/mail/php-mailer';
import { welcomeMail } from '@/lib/mail/templates';

export const runtime = 'nodejs';

/**
 * Échange serveur du jeton reçu dans le fragment d'URL. Le jeton n'apparaît
 * jamais dans une URL envoyée au serveur : ce handler reçoit un POST du navigateur.
 * La cible de redirection est toujours interne et dérivée de la locale validée.
 */
export async function POST(request: Request) {
  try {
    if (!isAllowedPostOrigin(request)) {
      throw new AuthError(403, 'auth.error.generic');
    }

    const input = parseOrThrow(callbackSchema.safeParse(await readJsonBody(request)));

    if (!(await consumeRateLimit('callback', clientIp(request), 20, 3600))) {
      throw tooManyRequests(3600);
    }

    const { data, error } = await authServerClient().auth.verifyOtp({
      token_hash: input.token_hash,
      type: input.type,
    });
    if (error || !data.user) {
      throw new AuthError(400, 'auth.link.invalid');
    }

    if (input.type === 'recovery') {
      await signOutOtherSessions();
      return authJson({
        status: 'ok',
        kind: 'password',
        redirectTo: internalUrl(input.locale, { name: 'password' }).pathname,
      });
    }

    if (data.user.email) {
      const content = welcomeMail(input.locale);
      await sendTransactionalMail({
        template: 'welcome',
        to: data.user.email,
        locale: input.locale,
        ...content,
      });
    }

    return authJson({
      status: 'ok',
      kind: 'verified',
      redirectTo: `${internalUrl(input.locale, { name: 'verify' }).pathname}?status=success`,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
