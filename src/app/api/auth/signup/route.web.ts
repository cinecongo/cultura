import { authAdminClient } from '@/lib/auth/clients';
import { AuthError, tooManyRequests } from '@/lib/auth/errors';
import { authJson, authErrorResponse, readJsonBody } from '@/lib/auth/http';
import { authCallbackUrl } from '@/lib/auth/links';
import { isAllowedPostOrigin } from '@/lib/auth/origin';
import { clientIp, consumeRateLimit } from '@/lib/auth/rate-limit';
import { verifyTurnstile } from '@/lib/auth/turnstile';
import { parseOrThrow, signupSchema } from '@/lib/auth/validation';
import { sendTransactionalMail } from '@/lib/mail/php-mailer';
import { verifyMail } from '@/lib/mail/templates';

export const runtime = 'nodejs';

/**
 * Inscription : le rôle est toujours `membre`, l'email est repris de
 * `auth.users`, et tout champ `role` envoyé par le client est ignoré par le
 * schéma zod (`.strip()`). Aucune session n'est créée avant confirmation.
 */
export async function POST(request: Request) {
  try {
    if (!isAllowedPostOrigin(request)) {
      throw new AuthError(403, 'auth.error.generic');
    }

    const input = parseOrThrow(signupSchema.safeParse(await readJsonBody(request)));
    await verifyTurnstile(input.turnstileToken, 'signup');

    if (!(await consumeRateLimit('signup', clientIp(request), 5, 3600))) {
      throw tooManyRequests(3600);
    }
    if (!(await consumeRateLimit('signup', input.email, 3, 3600))) {
      throw tooManyRequests(3600);
    }

    const admin = authAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'signup',
      email: input.email,
      password: input.password,
      options: { data: { nom: input.nom, langue_preferee: input.locale } },
    });

    // Réponse identique quoi qu'il arrive : aucune énumération de comptes.
    if (error || !data?.user?.email || !data.properties.hashed_token) {
      return authJson({ status: 'sent' });
    }

    const { error: profileError } = await admin.from('users').upsert(
      {
        id: data.user.id,
        nom: input.nom,
        email: data.user.email,
        role: 'membre',
        langue_preferee: input.locale,
      },
      { onConflict: 'id' },
    );
    if (profileError) throw new AuthError(400, 'auth.error.generic');

    const content = verifyMail(
      input.locale,
      authCallbackUrl(data.properties.hashed_token, 'signup', input.locale).toString(),
    );
    await sendTransactionalMail({
      template: 'verify',
      to: data.user.email,
      locale: input.locale,
      ...content,
    });

    return authJson({ status: 'sent' });
  } catch (error) {
    return authErrorResponse(error);
  }
}
