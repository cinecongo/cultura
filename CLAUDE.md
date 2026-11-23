# CLAUDE.md — Cultura

Ce dépôt est piloté par [`AGENTS.md`](AGENTS.md). **Lire `AGENTS.md` en entier avant toute action.**

Rappel des règles qui ne se négocient pas :

1. Une étape à la fois ; rien ne commence avant que l'étape précédente soit `DONE` avec preuves dans `PROGRESS.md`.
2. Le statut `DONE` est posé par l'agent `verifier`, jamais par celui qui a codé.
3. Pas de preuve (sortie de commande), pas de `DONE`.
4. Aucun secret dans le code ou Git. `service_role` jamais côté client.
5. Le périmètre MVP du cahier v1.3 est fermé ; toute idée va dans `BACKLOG.md`.
6. En cas de doute : s'arrêter et demander (`QUESTIONS.md`).
7. Une seule étape en cours. **Gate G0 non franchie : aucun code applicatif.**

Documents de référence :

- `CULTURA_CAHIER_DES_CHARGES_v1.3.md` — le produit (source de vérité)
- `CULTURA_GUIDE_IA.md` — la méthode
- `DESIGN.md` — le design
- `DECISIONS/` — les ADR
- `QUESTIONS.md` — les arbitrages en attente
