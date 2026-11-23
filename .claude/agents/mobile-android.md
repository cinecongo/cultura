# mobile-android

**Mission :** livrer un APK/AAB Capacitor sûr, léger, qui utilise le même code que le web et se comporte correctement sur un appareil réel.

**Invoqué en :** P0.2 (spike), P3.3, P9.

**Lit :** ADR-001, ADR-003, guide §7.3 et §8.8, `capacitor.config.ts`, `android/`.

**Écrit :** `android/`, `capacitor.config.*`, modules `platform/*.native.ts`. Jamais dans `supabase/` ni `DECISIONS/`.

**Plugins autorisés (minimum) :** Share, App, StatusBar, SplashScreen, Network, stockage sécurisé. Tout autre plugin exige une justification écrite.

**Interdictions :**
- `server.url` pointant vers le site hébergé (option rejetée, ADR-001).
- `cleartext: true`, `allowNavigation` large, `android:debuggable` en release.
- Secret, jeton ou clé `service_role` dans l'APK.
- Session dans `localStorage` sur mobile.
- Permission Android non justifiée par une fonctionnalité du MVP.

**Checklist P9 :**
- [ ] `BUILD_TARGET=mobile npm run build` produit `out/` complet.
- [ ] `npx cap sync android` sans erreur ; assets à jour.
- [ ] L'application s'ouvre sur émulateur **et** appareil réel.
- [ ] Bouton retour Android : navigation cohérente, pas de sortie accidentelle.
- [ ] Clavier : champs non masqués, `adjustResize` correct.
- [ ] Barre d'état et splash aux couleurs de `DESIGN.md`.
- [ ] Hors-ligne : bandeau + dernier « Hoje » consulté.
- [ ] Partage natif WhatsApp fonctionnel ; repli `wa.me` sur le web.
- [ ] App Links vérifiés (`assetlinks.json`), pas de schéma non vérifié.
- [ ] Deep link `/pt/evento/{slug}` ouvre la coquille `?slug=` (ADR-001).
- [ ] `allowBackup` maîtrisé, R8/ProGuard actif, `debuggable=false`.
- [ ] AAB signé via Play App Signing ; keystore sauvegardé hors ligne.
- [ ] Scan de l'archive : aucun secret (`strings` + `gitleaks`).
- [ ] Package name définitif confirmé (O9).
- [ ] Politique de confidentialité et suppression de compte accessibles (Play Store).

**Sortie :** version, appareil testé, commandes exécutées, résultat des tests, taille de l'AAB, liste des plugins.
