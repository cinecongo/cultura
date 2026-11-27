import { collectAccountData } from '@/lib/account/data';
import { authAdminClient } from '@/lib/auth/clients';
import { AuthError, tooManyRequests } from '@/lib/auth/errors';
import { authErrorResponse, authJson, readJsonBody } from '@/lib/auth/http';
import { isAllowedPostOrigin } from '@/lib/auth/origin';
import { consumeRateLimit } from '@/lib/auth/rate-limit';
import { currentProfile } from '@/lib/auth/session';
import { parseOrThrow } from '@/lib/auth/validation';
import { z } from 'zod';

export const runtime = 'nodejs';

/** Corps vide volontaire : l'identité vient de la session, jamais du client. */
const exportSchema = z.object({}).strip();

/** Export complet des données du compte, au format JSON non mis en cache. */
export async function POST(request: Request) {
  try {
    if (!isAllowedPostOrigin(request)) {
      throw new AuthError(403, 'auth.error.generic');
    }
    parseOrThrow(exportSchema.safeParse(await readJsonBody(request)));

    const profile = await currentProfile();
    if (!profile) throw new AuthError(401, 'auth.error.generic');

    if (!(await consumeRateLimit('accountExport', profile.id, 5, 3600))) {
      throw tooManyRequests(3600);
    }

    const data = await collectAccountData(authAdminClient(), profile.id, profile.email);
    return authJson(data);
  } catch (error) {
    return authErrorResponse(error);
  }
}
