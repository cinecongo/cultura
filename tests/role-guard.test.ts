import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthError } from '@/lib/auth/errors';
import {
  canAccessSpace,
  roleSpaceFromToken,
  roleSpaceTokenSchema,
  spaceAccessError,
} from '@/lib/auth/guard';
import { roleSchema } from '@/lib/auth/session';

vi.mock('@/lib/auth/guard', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/lib/auth/guard');
  return { ...actual, assertApiSpaceAccess: vi.fn() };
});

vi.mock('@/lib/auth/rate-limit', () => ({
  clientIp: vi.fn(() => 'unitaire'),
  consumeRateLimit: vi.fn(async () => true),
}));

import { GET } from '@/app/api/roles/[space]/route.web';
import { AuthError as ConcreteAuthError } from '@/lib/auth/errors';
import { assertApiSpaceAccess } from '@/lib/auth/guard';
import { consumeRateLimit } from '@/lib/auth/rate-limit';

function context(space: string): { params: Promise<{ space: string }> } {
  return { params: Promise.resolve({ space }) };
}

const request = new Request('http://localhost/api/roles/actor');

async function expectPublicError(response: Response, status: number): Promise<void> {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  expect(await response.json()).toEqual({ errorKey: 'auth.error.generic' });
}

describe('matrice des rôles', () => {
  it('n’accorde aucun espace à un rôle absent, inconnu ou membre', () => {
    expect(canAccessSpace(null, 'actorSpace')).toBe(false);
    expect(canAccessSpace(null, 'adminSpace')).toBe(false);
    expect(canAccessSpace('membre', 'actorSpace')).toBe(false);
    expect(canAccessSpace('membre', 'adminSpace')).toBe(false);
  });

  it('applique la matrice décidée : acteur, editeur, admin / admin seul', () => {
    expect(canAccessSpace('acteur', 'actorSpace')).toBe(true);
    expect(canAccessSpace('acteur', 'adminSpace')).toBe(false);
    expect(canAccessSpace('editeur', 'actorSpace')).toBe(true);
    expect(canAccessSpace('editeur', 'adminSpace')).toBe(false);
    expect(canAccessSpace('admin', 'actorSpace')).toBe(true);
    expect(canAccessSpace('admin', 'adminSpace')).toBe(true);
  });

  it('rejette un rôle hors énumération, même venant d’une métadonnée', () => {
    expect(roleSchema.safeParse('admin').success).toBe(true);
    expect(roleSchema.safeParse('Admin').success).toBe(false);
    expect(roleSchema.safeParse('root').success).toBe(false);
  });

  it('distingue 401 et 403 sans révéler le rôle', () => {
    const anonymous = spaceAccessError(null) as AuthError;
    const insufficient = spaceAccessError('acteur') as AuthError;
    expect(anonymous.status).toBe(401);
    expect(insufficient.status).toBe(403);
    expect(anonymous.key).toBe('auth.error.generic');
    expect(insufficient.key).toBe('auth.error.generic');
  });
});

describe('sonde API des espaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(consumeRateLimit).mockResolvedValue(true);
    vi.mocked(assertApiSpaceAccess).mockResolvedValue(undefined);
  });

  it('n’accepte que les jetons actor et admin', () => {
    expect(roleSpaceTokenSchema.safeParse('actor').success).toBe(true);
    expect(roleSpaceTokenSchema.safeParse('admin').success).toBe(true);
    for (const bad of ['', 'Admin', '../admin', 'admin%2Fx', 'role', 12, ['admin']]) {
      expect(roleSpaceTokenSchema.safeParse(bad).success, String(bad)).toBe(false);
    }
    expect(roleSpaceFromToken('actor')).toBe('actorSpace');
    expect(roleSpaceFromToken('admin')).toBe('adminSpace');
  });

  it('valide le jeton avant d’appeler la base', async () => {
    await expectPublicError(await GET(request, context('../admin')), 400);
    expect(assertApiSpaceAccess).not.toHaveBeenCalled();
    expect(consumeRateLimit).not.toHaveBeenCalled();
  });

  it('répond 200 sans donnée personnelle quand l’accès est accordé', async () => {
    const response = await GET(request, context('actor'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ allowed: true });
  });

  it('convertit un refus en 403 générique', async () => {
    vi.mocked(assertApiSpaceAccess).mockRejectedValueOnce(
      new ConcreteAuthError(403, 'auth.error.generic'),
    );
    await expectPublicError(await GET(request, context('admin')), 403);
  });

  it('convertit une session absente en 401 générique', async () => {
    vi.mocked(assertApiSpaceAccess).mockRejectedValueOnce(
      new ConcreteAuthError(401, 'auth.error.generic'),
    );
    await expectPublicError(await GET(request, context('actor')), 401);
  });

  it('applique la limitation de débit avant la décision d’accès', async () => {
    vi.mocked(consumeRateLimit).mockResolvedValueOnce(false);
    const response = await GET(request, context('actor'));
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      errorKey: 'auth.error.tooManyRequests',
      count: 60,
    });
    expect(assertApiSpaceAccess).not.toHaveBeenCalled();
  });
});
