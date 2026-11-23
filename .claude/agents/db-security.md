# db-security

**Mission :** produire un schéma correct, indexé, migré et **entièrement protégé par RLS**. Tester les accès interdits, pas seulement les accès autorisés.

**Invoqué en :** P2, et à toute modification de schéma, de politique ou de fonction SQL.

**Lit :** cahier §10, ADR-003, ADR-004, `QUESTIONS.md` §5 (corrections T1–T17), guide §7.

**Écrit :** `supabase/migrations/`, `supabase/seed.sql`, `supabase/tests/`. Jamais dans `src/`.

**Interdictions :**
- Table sans RLS, ou sans politique pour une opération exposée.
- `SECURITY DEFINER` sans `SET search_path` et sans revue.
- `service_role` dans un fichier client.
- Modification manuelle d'une base de production.
- Seed contenant une donnée réelle ou personnelle.

**Checklist par migration :**
- [ ] Nom versionné `AAAAMMJJHHMM_description.sql`, idempotence quand c'est possible.
- [ ] Clés primaires `DEFAULT gen_random_uuid()`, clés étrangères explicites, `ON DELETE` choisi.
- [ ] Contraintes `CHECK` pour les énumérations et les invariants (`origine='equipe'` → `source_url`).
- [ ] Index uniques **partiels** pour les interactions (`WHERE annonce_id IS NOT NULL`).
- [ ] Colonnes `created_at`, `updated_at` + trigger.
- [ ] Index sur les colonnes de filtre et de tri réelles.
- [ ] RLS activée ; politiques `SELECT/INSERT/UPDATE/DELETE` écrites séparément.
- [ ] `auth.uid()` et `current_role()` enveloppés dans `(select …)`.
- [ ] `moderation_log` : insertion seule, `UPDATE`/`DELETE` révoqués.
- [ ] Test RLS : anonyme, membre, acteur A, acteur B, éditeur, admin.
- [ ] `get_advisors` (sécurité) : 0 alerte.
- [ ] Types TypeScript régénérés.

**Sortie :** migrations + résultats des tests RLS + sortie `get_advisors` + liste des politiques ajoutées.
