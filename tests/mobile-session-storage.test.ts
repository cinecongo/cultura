import { beforeEach, describe, expect, it, vi } from 'vitest';

const native = vi.hoisted(() => ({ isNativePlatform: vi.fn(() => true) }));
const plugin = vi.hoisted(() => ({
  setKeyPrefix: vi.fn(async (): Promise<void> => undefined),
  getItem: vi.fn(async (): Promise<string | null> => null),
  setItem: vi.fn(async (): Promise<void> => undefined),
  removeItem: vi.fn(async (): Promise<void> => undefined),
}));

vi.mock('@capacitor/core', () => ({ Capacitor: native }));
vi.mock('@aparajita/capacitor-secure-storage', () => ({ SecureStorage: plugin }));

import {
  SESSION_STORAGE_PREFIX,
  secureSessionStorage,
} from '@/lib/platform/session-storage.native';

describe('stockage de session mobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    native.isNativePlatform.mockReturnValue(true);
  });

  it('utilise un préfixe non vide et n’écrit jamais dans localStorage', async () => {
    const hostile = {
      getItem: () => {
        throw new Error('localStorage interdit');
      },
      setItem: () => {
        throw new Error('localStorage interdit');
      },
    };
    vi.stubGlobal('localStorage', hostile);
    vi.stubGlobal('sessionStorage', hostile);

    await secureSessionStorage.setItem('sb-ref-auth-token', '{"access_token":"x"}');
    expect(plugin.setKeyPrefix).toHaveBeenCalledWith(SESSION_STORAGE_PREFIX);
    expect(SESSION_STORAGE_PREFIX.length).toBeGreaterThan(0);
    expect(plugin.setItem).toHaveBeenCalledWith('sb-ref-auth-token', '{"access_token":"x"}');

    vi.unstubAllGlobals();
  });

  it('transmet la chaîne telle quelle (aucun double encodage JSON)', async () => {
    const raw = '{"access_token":"jeton","refresh_token":"rafraîchissement"}';
    await secureSessionStorage.setItem('cle', raw);
    expect(plugin.setItem).toHaveBeenCalledWith('cle', raw);

    plugin.getItem.mockResolvedValueOnce(raw);
    await expect(secureSessionStorage.getItem('cle')).resolves.toBe(raw);
  });

  it('renvoie null pour une clé absente et propage la suppression', async () => {
    plugin.getItem.mockResolvedValueOnce(null);
    await expect(secureSessionStorage.getItem('absente')).resolves.toBeNull();

    await secureSessionStorage.removeItem('cle');
    expect(plugin.removeItem).toHaveBeenCalledWith('cle');
  });

  it('refuse explicitement toute exécution hors coquille native', async () => {
    native.isNativePlatform.mockReturnValue(false);
    await expect(secureSessionStorage.getItem('cle')).rejects.toThrow(/hors coquille native/);
    expect(plugin.getItem).not.toHaveBeenCalled();
  });
});
