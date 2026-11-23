# Connexion aux outils — préparation (après Gate G0)

> **Objectif :** brancher GitHub, Supabase et Vercel **sans écrire de code applicatif**, puis exécuter le spike P0.2.
> **Règle de sécurité :** aucun secret n'est collé dans une conversation, un ticket ou un fichier versionné. Les clés vivent dans `.env.local` (local) ou dans les secrets GitHub/Vercel.

---

## 1. État de la machine (mesuré le 2026-11-23)

| Outil | Version / état | Usage |
|---|---|---|
| Node.js | 24.22.1 | Next.js, scripts |
| npm | 11.19.1 | dépendances |
| Git | 2.55.0 | dépôt |
| Supabase CLI | 3.1.0 (3.3.0 disponible) | migrations, types, advisors |
| Java (Temurin) | 17.0.20.1 | build Android (P9) |
| GitHub CLI (`gh`) | **absent** | création du dépôt, secrets |
| gitleaks | **absent** | scan de secrets (P1.2) |
| adb / Android Studio | **absent** | émulateur (P9) |

**À installer avant P1.2/P9 :**
- `gh` (winget : `winget install GitHub.cli`)
- `gitleaks` (winget : `winget install Gitleaks.Gitleaks`)
- Android Studio + SDK + un appareil ou émulateur (P9 uniquement)
- Mise à jour Supabase CLI : `npm i -g supabase@latest`

---

## 2. Ordre de connexion recommandé

```
GitHub (dépôt + protection)
   ↓
Supabase « dev » (projet isolé, schéma à venir en P2)
   ↓
Spike P0.2 en local (build web + build mobile, données de test)
   ↓
Vercel (aperçu, puis production en P10)
```

Ne pas créer le projet `prod` avant P10. Ne jamais utiliser la base `prod` en développement.

---

## 3. GitHub

1. Créer l'organisation (ou utiliser le compte) : `cultura-ao`.
2. Créer le dépôt privé `cultura` (sans README, sans `.gitignore` : ils existent déjà).
3. Ajouter `origin`, pousser la branche `main`.
4. Protéger `main` : pas de push direct, PR obligatoire, CI verte, 1 revue.
5. Ajouter les collaborateurs et les secrets d'action (voir §6).

```bash
git remote add origin git@github.com:<org>/cultura.git
git add .
git commit -m "docs: fondations P0 et fichiers de pilotage"
git branch -M main
git push -u origin main
```

> Le commit initial est en attente : `user.name` et `user.email` ne sont pas configurés sur la machine.

---

## 4. Supabase

1. Créer l'organisation, puis **trois projets séparés** : `cultura-dev`, `cultura-staging`, `cultura-prod`.
2. Choisir la région la plus proche de Luanda (à confirmer selon l'offre disponible).
3. Récupérer dans `Settings > API` : URL du projet, clé `anon`, clé `service_role` (serveur uniquement).
4. Renseigner `.env.local` à partir de `.env.example`. **Ne rien coller dans le chat.**
5. Lier le projet local :

```bash
supabase login          # ouvre le navigateur, session personnelle
supabase link --project-ref <ref-dev>
supabase projects list  # preuve de connexion
```

6. Les migrations seront créées en P2.1 puis appliquées avec `supabase db push` (dev uniquement).
7. Les types seront générés après chaque migration :

```bash
supabase gen types typescript --linked > src/lib/supabase/types.ts
```

8. Activer la protection contre les fuites de mot de passe, la confirmation d'email et les limites d'inscription.
9. Ne jamais copier la clé `service_role` dans le client, Vercel `NEXT_PUBLIC_*` ou l'APK.

---

## 5. Vercel

1. Importer le dépôt GitHub dans une équipe Vercel.
2. Créer les environnements `Development`, `Preview`, `Production` avec des variables **séparées**.
3. Renseigner uniquement les variables listées dans `.env.example` ; `service_role` en « Sensitive », jamais `NEXT_PUBLIC_`.
4. Ajouter le domaine (à confirmer : `cultura.ao`) et forcer HTTPS.
5. Vérifier qu'un aperçu de PR déploie bien le build `web`, et que le build `mobile` n'est pas déclenché sur Vercel.
6. La production n'est ouverte qu'en P10.4, après la checklist de déploiement.

---

## 6. Secrets et accès

| Secret | Où | Qui |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local`, Vercel (Sensitive), GitHub Secrets | serveur uniquement |
| `SUPABASE_ACCESS_TOKEN` | GitHub Secrets | CI migrations |
| `RESEND_API_KEY` | Vercel, GitHub Secrets | serveur |
| `TURNSTILE_SECRET_KEY` | Vercel, GitHub Secrets | serveur |
| Keystore Android + mots de passe | hors ligne + Play App Signing | responsable mobile |
| `NEXT_PUBLIC_*` | client, Vercel, APK | public par conception |

**En cas de fuite :** révoquer immédiatement, rotation, puis nettoyage de l'historique. Supprimer le fichier ne suffit pas.

---

## 7. Ce dont j'ai besoin pour continuer (sans secret)

| # | Information | Exemple |
|---|---|---|
| 1 | Organisation / compte GitHub | `cultura-ao` |
| 2 | Nom du dépôt | `cultura` |
| 3 | Projets Supabase créés (dev/staging/prod) + région | `cultura-dev`, Afrique du Sud |
| 4 | Domaine retenu | `cultura.ao` |
| 5 | Compte Vercel (équipe) | `cultura` |
| 6 | Fournisseur email + domaine d'envoi | Resend, `no-reply@cultura.ao` |
| 7 | Nom de package Android | `ao.cultura.app` |
| 8 | Identité Git configurée | nom + email professionnels |

Les clés, elles, sont saisies **par vous** dans `.env.local` et dans les interfaces Vercel/GitHub. Je ne les demande jamais dans la conversation.

---

## 8. Checklist de fin de connexion

- [ ] `git remote -v` pointe vers le bon dépôt.
- [ ] `main` protégée ; première PR possible.
- [ ] `supabase projects list` affiche le projet `dev`.
- [ ] `.env.local` rempli localement ; `git status` ne montre aucun `.env`.
- [ ] `npm run dev` (à venir en P1.5) démarre sans erreur.
- [ ] Un déploiement d'aperçu Vercel se construit.
- [ ] Aucun secret dans `git log`, les captures ou les issues.
- [ ] `gitleaks detect` : 0 fuite (après installation).

---

*Préparation datée du 23 novembre 2026. Cette page ne contient aucun secret et ne doit jamais en contenir.*
