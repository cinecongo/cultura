# Agents Cultura

Dix agents, définis par `CULTURA_GUIDE_IA.md` §6.2. Ils sont des **rôles de revue et d'exécution**, pas des personnes.

| Agent | Rôle | Écrit dans |
|---|---|---|
| [`architect.md`](architect.md) | ADR, structure, choix techniques | `DECISIONS/` |
| [`db-security.md`](db-security.md) | Migrations, RLS, tests RLS, advisors | `supabase/` |
| [`frontend-builder.md`](frontend-builder.md) | UI, pages, composants, i18n | `src/` |
| [`designer-critic.md`](designer-critic.md) | Revue visuelle vs `DESIGN.md` | aucun (lecture) |
| [`i18n-auditor.md`](i18n-auditor.md) | Complétude PT/FR/EN, textes en dur | aucun (lecture) |
| [`security-reviewer.md`](security-reviewer.md) | Secrets, OWASP, RLS, CSP | aucun (lecture) |
| [`qa-tester.md`](qa-tester.md) | Tests unitaires, RLS, e2e | `tests/` |
| [`perf-a11y-auditor.md`](perf-a11y-auditor.md) | Performance, Lighthouse, WCAG | aucun (lecture) |
| [`mobile-android.md`](mobile-android.md) | Capacitor, plugins, signature | `android/`, `capacitor.config.*` |
| [`verifier.md`](verifier.md) | Valide ou refuse une étape | `PROGRESS.md` (statut + verdict) |

**Règle absolue :** celui qui construit ne valide pas. `frontend-builder` et `db-security` ne peuvent jamais s'auto-valider. Seul `verifier` écrit `DONE`.

**Format de sortie commun**

```
Étape : [P0.1]
Verdict : VALIDÉ | REFUSÉ | BLOQUÉ
Motifs :
- …
Preuves relues / relancées :
- commande → résultat
Actions demandées :
- …
```
