import { assertApiSpaceAccess, roleSpaceTokenSchema } from '@/lib/auth/guard';
import { AuthError, tooManyRequests } from '@/lib/auth/errors';
import { authErrorResponse, authJson } from '@/lib/auth/http';
import { clientIp, consumeRateLimit } from '@/lib/auth/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ space: string }> };

/**
 * Sonde d'autorisation en API directe. Elle juge la session courante relue en
 * base : aucun rôle n'est accepté depuis l'URL, le corps ou un en-tête.
 * Ordre fixe : validation zod → limitation de débit → décision d'accès.
 */
export async function GET(request: Request, { params }: Context) {
  try {
    const { space: rawSpace } = await params;
    const parsed = roleSpaceTokenSchema.safeParse(rawSpace);
    if (!parsed.success) {
      throw new AuthError(400, 'auth.error.generic');
    }

    if (!(await consumeRateLimit('roles', clientIp(request), 30, 60))) {
      throw tooManyRequests(60);
    }

    await assertApiSpaceAccess(parsed.data);
    return authJson({ allowed: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
