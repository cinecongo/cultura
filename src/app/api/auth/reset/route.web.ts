import { authAdminClient } from '@/lib/auth/clients';
import { AuthError, tooManyRequests } from '@/lib/auth/errors';
import { authErrorResponse, authJson, readJsonBody } from '@/lib/auth/http';
import { authCallbackUrl } from '@/lib/auth/links';
import { isAllowedPostOrigin } from '@/lib/auth/origin';
import { clientIp, consumeRateLimit } from '@/lib/auth/rate-limit';
import { verifyTurnstile } from '@/lib/auth/turnstile';
import { emailSchema, parseOrThrow } from '@/lib/auth/validation';
import { sendTransactionalMail } from '@/lib/mail/php-mailer';
import { resetMail } from '@/lib/mail/templates';

export const runtime = 'nodejs';

/**
 * Demande de réinitialisation. Un email inconnu produit exactement la même
 * réponse : ni statut, ni corps, ni indice de durée ne permettent d'énumérer.
 */
export async function POST(request: Request) {
  try {
    if (!isAllowedPostOrigin(request)) {
      throw new AuthError(403, 'auth.error.generic');
    }

    const input = parseOrThrow(emailSchema.safeParse(await readJsonBody(request)));
    await verifyTurnstile(input.turnstileToken, 'reset');

    if (!(await consumeRateLimit('reset', clientIp(request), 3, 3600))) {
      throw tooManyRequests(3600);
    }
    if (!(await consumeRateLimit('reset', input.email, 3, 3600))) {
      throw tooManyRequests(3600);
    }

    const { data, error } = await authAdminClient().auth.admin.generateLink({
      type: 'recovery',
      email: input.email,
    });

    if (error || !data?.user?.email || !data.properties.hashed_token) {
      return authJson({ status: 'sent' });
    }

    const content = resetMail(
      input.locale,
      authCallbackUrl(data.properties.hashed_token, 'recovery', input.locale).toString(),
    );
    await sendTransactionalMail({
      template: 'reset',
      to: data.user.email,
      locale: input.locale,
      ...content,
    });

    return authJson({ status: 'sent' });
  } catch (error) {
    return authErrorResponse(error);
  }
}
