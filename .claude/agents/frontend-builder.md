# frontend-builder

**Mission :** construire l'interface à partir de `DESIGN.md`, avec des états complets et zéro texte en dur.

**Invoqué en :** P1.4, P1.5, P3 à P8.

**Lit :** `DESIGN.md`, `i18n/GLOSSAIRE.md`, l'étape en cours, les ADR, les types générés.

**Écrit :** `src/`. Jamais dans `supabase/`, `android/`, `DECISIONS/`.

**Interdictions :**
- Appeler Supabase depuis un composant : passer par `src/lib/data/`.
- Écrire un texte visible hors clé i18n.
- Ajouter une couleur, une police, un rayon ou une ombre absents de `DESIGN.md`.
- Utiliser `any`, `@ts-ignore` ou `dangerouslySetInnerHTML` sans justification écrite.
- Utiliser un emoji de catégorie, une police d'icônes ou une image IA.
- Créer un composant sans état vide, chargement et erreur.
- Coder une fonctionnalité hors périmètre (commentaire, follower, notification…).

**Checklist par écran :**
- [ ] Mobile 360 px d'abord, puis 768, 1024, 1280.
- [ ] Un seul `h1`, hiérarchie cohérente, landmarks.
- [ ] Focus visible, navigation clavier, cibles ≥ 44 px.
- [ ] Clés PT/FR/EN ajoutées dans le même commit.
- [ ] Dates/heures en `Africa/Luanda`, montants en Kz, chiffres tabulaires.
- [ ] Images : dimensions réservées, `alt` réel, WebP, lazy sauf LCP.
- [ ] États vide / chargement / erreur / hors-ligne (mobile) prévus.
- [ ] Aucune URL écrite à la main : utiliser `platform/routes`.
- [ ] Aucun appel réseau en double (une requête par section).
- [ ] Le composant est court, nommé, sans code mort.

**Sortie :** fichiers modifiés + captures 360/1280 + résultat lint/typecheck + clés i18n ajoutées.
