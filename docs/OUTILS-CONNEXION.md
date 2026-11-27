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
| Docker | 29.9.3 (démon inactif) | **non utilisé** — migrations en ligne (ADR-005) |
| Java (Temurin) | 17.0.20.1 | build Android (P9) |
| Edge headless | présent | rendu PNG des SVG, captures |
| GitHub CLI (`gh`) | **absent** | création du dépôt, secrets |
| gitleaks | **8.30.1 installé** (`~/.cultura/bin`, PATH utilisateur) | scan de secrets (P1.2) |
| adb / Android Studio | **absent** | émulateur (P9) |

**À installer avant P9 :**
- Android Studio + SDK + un appareil ou émulateur
- `gh` si l'installation devient possible (winget absent sur cette machine : télécharger l'archive officielle)
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

## 3. GitHub — **fait le 2026-11-23**

| Élément | Valeur |
|---|---|
| Dépôt | `https://github.com/cinecongo/cultura` (privé) |
| Branche | `main` → suit `origin/main` |
| Commit | `9fba525` — `docs: fondations P0 et fichiers de pilotage` |
| Transport | HTTPS + Git Credential Manager |
| SSH | non configuré sur ce PC (clé sur le Mac) |

```bash
# déjà exécuté
git init
git config user.name "cinecongo"
git config user.email "cinecongo@users.noreply.github.com"
git add .
git commit -m "docs: fondations P0 et fichiers de pilotage"
git branch -M main
git remote add origin https://github.com/cinecongo/cultura.git
git push -u origin main
```

**Reste à faire (côté humain) :**
1. Protéger `main` : pas de push direct, PR obligatoire, CI verte, 1 revue.
2. Ajouter les collaborateurs.
3. Ajouter les secrets d'action (voir §6).
4. (Optionnel) ajouter une clé SSH sur ce PC Windows.

```bash
# vérification
git remote -v
git status -sb
git log --oneline -1
```

---

## 4. Supabase — **nouveau projet depuis le 2026-11-27**

> L'ancien projet `cultura-dev` (`rfjoxvlgejcvknowvztj`, org `hhwqgrjtriyimllqwhrp`) est **abandonné**. Toute la suite se fait sur le projet ci-dessous.

| Élément | Valeur |
|---|---|
| Projet | `cultura-dev` — `exsemqskhkgfsogdtvpz` |
| URL | `https://exsemqskhkgfsogdtvpz.supabase.co` |
| Clés | clé **publishable** (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY` ; clé **secrète** (`sb_secret_…`) → `SUPABASE_SERVICE_ROLE_KEY` |
| Région | à confirmer (l'ancien projet était en `eu-west-1`) |
| Liaison CLI | **à refaire** : nécessite `SUPABASE_ACCESS_TOKEN` dans `.env.local` |
| `.env.local` | 4 variables renseignées ; valeurs jamais affichées, fichier ignoré par Git |

### 4.1 Refus de Docker — migrations en ligne (ADR-005, ADR-006)

Docker n'est **pas** utilisé : pas de `supabase start`, pas de `db reset`, pas de base locale. Les migrations s'écrivent dans `supabase/migrations/` puis s'appliquent au projet distant avec des garde-fous.

**Connexion obligatoire par le pooler** (la connexion directe est IPv6 seulement et cette machine n'a pas d'IPv6) :

```text
hôte      aws-1-eu-west-1.pooler.supabase.com
port      5432            (mode session)
utilisateur  postgres.exsemqskhkgfsogdtvpz
```

```bash
# 1. aperçu, sans rien appliquer
supabase db push --dry-run --db-url "postgresql://postgres.exsemqskhkgfsogdtvpz:<mot-de-passe>@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# 2. sauvegarde avant application — pg_dump NATIF (jamais `supabase db dump` : il exige Docker)
pg_dump --dbname "<même URL>" --file .backups/avant-push.sql

# 3. application, après revue SQL et validation humaine
supabase db push --db-url "<même URL>"

# 4. état des migrations
supabase migration list --db-url "<même URL>"
```

Détail et justifications : `DECISIONS/ADR-005-migrations-en-ligne.md` et `ADR-006-connexion-base-sans-docker.md`.

### 4.2 Liaison du nouveau projet

```bash
# prérequis : jeton PERSONNEL (non scopé) dans SUPABASE_ACCESS_TOKEN
supabase link --project-ref exsemqskhkgfsogdtvpz
```

Mesuré le 2026-11-27 : le jeton `sbp_…` fourni est **scopé** — l'API Management répond `403 This endpoint requires a user-scoped access token`, puis `missing_permissions: projects_read / organizations_read / project_admin_read`. Il faut un jeton personnel complet (Dashboard → Account → Access Tokens).

La liaison n'est **pas indispensable** : `db push`, `migration list` et les tests RLS passent par `--db-url`. Elle ne sert qu'à `gen types --linked` et aux commandes Management API.

**Pièges connus :**

- `--size micro` est **refusé** sur le plan gratuit (`entitlement_required`).
- La CLI peut étiqueter le projet `environment: production` : c'est un **libellé**, pas la nature du projet. Toujours vérifier le `project-ref` avant un `db push`.
- Ne jamais copier la clé secrète dans le client, Vercel `NEXT_PUBLIC_*` ou l'APK.

**Reste à faire :**

1. **Jeton personnel complet** : révoquer le jeton scopé, en créer un nouveau (Account → Access Tokens), le placer dans `.env.local` (`SUPABASE_ACCESS_TOKEN`).
2. **Mot de passe de la base** : le réinitialiser (Project Settings → Database → Reset database password), puis le placer dans `.env.local` (`SUPABASE_DB_PASSWORD`) et dans `%USERPROFILE%\.cultura\supabase-dev-db-password.txt`. Celui de l'ancien projet échoue (`28P01`).
3. **`pg_dump` natif** (PostgreSQL 17) pour les sauvegardes — avant la première donnée réelle.
4. **Rotation des clés** exposées dans un message le 2026-11-27 (secret `sb_secret_…`, secret JWT legacy, jeton `sbp_…`) — voir `QUESTIONS.md` O12.
5. Créer `cultura-staging` et `cultura-prod` — **plus tard**, avant P10.

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

| # | Information | Exemple | État |
|---|---|---|---|
| 1 | Organisation / compte GitHub | `cinecongo` | **reçu** |
| 2 | Nom du dépôt | `cultura` | **reçu** |
| 3 | Projet Supabase dev + région | `cultura-dev`, `eu-west-1` | **reçu** |
| 4 | Domaine retenu | `cultura.ao` | **à fournir** |
| 5 | Compte Vercel (équipe) | `cultura` | **à fournir** |
| 6 | Fournisseur email + domaine d'envoi | Resend, `no-reply@cultura.ao` | **à fournir** |
| 7 | Nom de package Android | `ao.cultura.app` | **à confirmer** |
| 8 | Identité Git configurée | `cinecongo` + noreply | **fait (locale)** |
| 9 | Relecteur PT-AO | nom d'une personne | **à fournir** |
| 10 | Logo master nettoyé | SVG recadré, couleurs normalisées | **à fournir** |

Les clés, elles, sont saisies **par vous** dans `.env.local` et dans les interfaces Vercel/GitHub. Je ne les demande jamais dans la conversation.

---

## 8. Checklist de fin de connexion

- [ ] `git remote -v` pointe vers le bon dépôt.
- [ ] `main` protégée ; première PR possible.
- [ ] `supabase projects list` affiche le projet `dev` (`exsemqskhkgfsogdtvpz`).
- [ ] `supabase/.temp/project-ref` = `exsemqskhkgfsogdtvpz` (liaison refaite).
- [ ] `.env.local` rempli localement ; `git status` ne montre aucun `.env`.
- [ ] `npm run dev` (à venir en P1.5) démarre sans erreur.
- [ ] Un déploiement d'aperçu Vercel se construit.
- [ ] Aucun secret dans `git log`, les captures ou les issues.
- [ ] `gitleaks detect` : 0 fuite (après installation).

---

*Préparation datée du 23 novembre 2026 ; section Supabase révisée le 27 novembre 2026 (nouveau projet, migrations en ligne). Cette page ne contient aucun secret et ne doit jamais en contenir.*
