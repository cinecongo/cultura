import { describe, expect, it } from 'vitest';

import { capabilitiesFor, resolveBuildTarget } from '@/lib/platform/target';

describe('resolveBuildTarget', () => {
  it('reconnaît la cible mobile', () => {
    expect(resolveBuildTarget('mobile')).toBe('mobile');
  });

  it('retombe sur le web pour tout le reste', () => {
    expect(resolveBuildTarget('web')).toBe('web');
    expect(resolveBuildTarget(undefined)).toBe('web');
    expect(resolveBuildTarget('')).toBe('web');
    expect(resolveBuildTarget('MOBILE')).toBe('web');
    expect(resolveBuildTarget('desktop')).toBe('web');
  });
});

describe('capabilitiesFor', () => {
  it('active le rendu serveur uniquement sur le web', () => {
    expect(capabilitiesFor('web').serverRendering).toBe(true);
    expect(capabilitiesFor('mobile').serverRendering).toBe(false);
  });

  it('active la coquille native et le partage natif uniquement sur mobile', () => {
    const mobile = capabilitiesFor('mobile');
    expect(mobile.nativeShell).toBe(true);
    expect(mobile.nativeShare).toBe(true);

    const web = capabilitiesFor('web');
    expect(web.nativeShell).toBe(false);
    expect(web.nativeShare).toBe(false);
  });

  it("désactive l'optimisation d'image côté mobile (export statique)", () => {
    expect(capabilitiesFor('web').imageOptimization).toBe(true);
    expect(capabilitiesFor('mobile').imageOptimization).toBe(false);
  });

  it('reste cohérent : jamais serveur et coquille native en même temps', () => {
    for (const target of ['web', 'mobile'] as const) {
      const c = capabilitiesFor(target);
      expect(c.serverRendering && c.nativeShell).toBe(false);
    }
  });
});
