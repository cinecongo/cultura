import {
  collectStoragePaths,
  purgeAccountRateLimits,
  removeStorageObjects,
} from '@/lib/account/data';
import { confirmPhraseMatches } from '@/lib/account/delete-phrase';
import { authAdminClient, verifyAccountPassword } from '@/lib/auth/clients';
import { AuthError, tooManyRequests } from '@/lib/auth/errors';
import { authErrorResponse, authJson, readJsonBody } from '@/lib/auth/http';
import { readLocaleCookie } from '@/lib/i18n/cookie';
import { isAllowedPostOrigin } from '@/lib/auth/origin';
import { consumeRateLimit } from '@/lib/auth/rate-limit';
import { currentProfile, signOutEverywhere } from '@/lib/auth/session';
import { accountDeleteSchema, parseOrThrow } from '@/lib/auth/validation';

export const runtime = 'nodejs';

/** Suppression définitive : mot de passe et phrase vérifiés côté serveur. */
export async function POST(request: Request) {
  try {
    if (!isAllowedPostOrigin(request)) {
      throw new AuthError(403, 'auth.error.generic');
    }
    const input = parseOrThrow(accountDeleteSchema.safeParse(await readJsonBody(request)));
    const profile = await currentProfile();
    if (!profile) throw new AuthError(401, 'auth.error.generic');

    const admin = authAdminClient();

    // Garde-fou journal avant toute écriture, y compris la limitation : un
    // compte référencé par une décision de l'équipe Cultura n'est pas supprimable.
    const journal = await admin
      .from('moderation_log')
      .select('id')
      .eq('admin_id', profile.id)
      .limit(1);
    if (journal.error) throw new AuthError(400, 'auth.error.generic');
    if ((journal.data?.length ?? 0) > 0) {
      throw new AuthError(409, 'auth.account.delete.error.journaled');
    }

    if (!(await consumeRateLimit('accountDelete', profile.id, 5, 3600))) {
      throw tooManyRequests(3600);
    }

    // La langue vient du cookie ou du profil en base, jamais du corps JSON.
    const locale = readLocaleCookie(request.headers.get('cookie')) ?? profile.langue_preferee;

    if (!(await verifyAccountPassword(profile.email, input.password))) {
      throw new AuthError(400, 'auth.account.delete.error.password');
    }
    if (!confirmPhraseMatches(locale, input.confirmPhrase)) {
      throw new AuthError(400, 'auth.account.delete.error.phrase');
    }

    const paths = await collectStoragePaths(admin, profile.id, profile.email);
    await removeStorageObjects(admin, paths);

    const { error: rpcError } = await admin.rpc('cultura_delete_account_data', {
      p_user_id: profile.id,
      p_email: profile.email,
    });
    if (rpcError) throw new AuthError(400, 'auth.error.generic');

    await purgeAccountRateLimits(admin, profile);
    await signOutEverywhere();

    const { error: deleteError } = await admin.auth.admin.deleteUser(profile.id);
    if (deleteError) throw new AuthError(400, 'auth.error.generic');

    return authJson({ status: 'deleted' });
  } catch (error) {
    return authErrorResponse(error);
  }
}
