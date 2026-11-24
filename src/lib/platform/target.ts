/**
 * Cible de build et capacités associées (ADR-001).
 *
 * `BUILD_TARGET` est lue une seule fois, ici. Un composant ne doit jamais
 * tester `process.env` directement : il interroge `capabilities`.
 */

export type BuildTarget = 'web' | 'mobile';

export function resolveBuildTarget(value: string | undefined): BuildTarget {
  return value === 'mobile' ? 'mobile' : 'web';
}

export const buildTarget: BuildTarget = resolveBuildTarget(process.env.BUILD_TARGET);

export type Capabilities = {
  /** Rendu serveur, ISR, routes API : disponibles sur le web uniquement. */
  readonly serverRendering: boolean;
  /** L'application tourne dans une WebView Capacitor. */
  readonly nativeShell: boolean;
  /** `next/image` peut optimiser côté serveur. */
  readonly imageOptimization: boolean;
  /** Le partage passe par la feuille native, pas par `navigator.share`. */
  readonly nativeShare: boolean;
};

export function capabilitiesFor(target: BuildTarget): Capabilities {
  const isWeb = target === 'web';
  return {
    serverRendering: isWeb,
    nativeShell: !isWeb,
    imageOptimization: isWeb,
    nativeShare: !isWeb,
  };
}

export const capabilities: Capabilities = capabilitiesFor(buildTarget);
