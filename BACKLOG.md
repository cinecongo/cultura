# BACKLOG — idées hors périmètre MVP

> Règle : **on ne code rien de cette page sans décision humaine explicite** (guide §0.6, §11).
> Une idée entre ici avec sa date et son motif. Elle n'entre dans le périmètre que par un amendement validé du cahier.

## Produit

| Idée | Date | Motif / valeur | Statut |
|---|---|---|---|
| Commentaires modérés sous les annonces | 2026-11-23 | Engagement, mais coût de modération élevé | Exclu V1 (cahier §5.2) |
| Messagerie privée acteur ↔ public | 2026-11-23 | Relation directe, mais concurrence WhatsApp | Exclu V1 |
| Followers / abonnements aux acteurs | 2026-11-23 | Remplacé par « suivre une ville » | Exclu V1 |
| Notifications push | 2026-11-23 | Rétention, mais data et permissions | Exclu V1 |
| Stories / fils éphémères | 2026-11-23 | Hors positionnement | Exclu V1 |
| Billetterie en ligne | 2026-11-23 | Commission 5–10 %, dépend de la phase 2 | Phase 3 (cahier §11.3) |
| Recommandations par IA | 2026-11-23 | Nécessite volume et données | Exclu V1 |
| Agrégation automatique des réseaux sociaux | 2026-11-23 | Risque juridique et manifeste | V3+ (cahier §13) |
| Application iOS | 2026-11-23 | Même code Capacitor possible | Après validation Android |
| Galerie multi-images par annonce | 2026-11-23 | Richesse visuelle, coût data | À évaluer |
| Récurrence d'événements (hebdomadaire) | 2026-11-23 | Utile pour les salles | À évaluer |
| QR code d'entrée / check-in | 2026-11-23 | Preuve de présence pour les acteurs | Après billetterie |
| Profils « lieu » enrichis (plan, transport) | 2026-11-23 | Utile en ville, coût de données | À évaluer |
| Mode « quartier » avec carte | 2026-11-23 | Géolocalisation fine | Après V1 (pas de GPS en V1) |
| Export calendrier (.ics) | 2026-11-23 | Faible coût, forte utilité | Candidat V1.x |
| Multi-langue du contenu (traduction) | 2026-11-23 | Le contenu reste dans sa langue | Exclu V1 (A6) |
| Espace annonceurs en libre-service | 2026-11-23 | Phase 2, paiement manuel d'abord | Phase 2 |
| Tableau de bord revenus | 2026-11-23 | Phase 2 | Phase 2 |
| API publique pour partenaires | 2026-11-23 | Écosystème, mais support | Après 1.0 |
| Widget « Hoje » intégrable | 2026-11-23 | Diffusion chez les partenaires | Après 1.0 |
| Version PWA installable (hors Play Store) | 2026-11-23 | Alternative légère à l'APK | À évaluer |

## Technique

| Idée | Date | Motif | Statut |
|---|---|---|---|
| Rate limiting distribué (Redis/Upstash) | 2026-11-23 | Plus robuste que le SQL seul | Si abus constatés |
| Recherche externe (Meilisearch/Typesense) | 2026-11-23 | Meilleure pertinence | Si `pg_trgm` insuffisant |
| CDN d'images dédié | 2026-11-23 | Quotas Supabase | Si 1 Go dépassé |
| Vues matérialisées pour le flux | 2026-11-23 | Performance à volume | Si lenteur mesurée |
| Tests de charge k6 | 2026-11-23 | Valider 3G et pics | Avant 1.0 |
| Mode hors-ligne complet (PWA + IndexedDB) | 2026-11-23 | Data coûteuse | Après V1 |
| Journal d'audit étendu (toutes les écritures) | 2026-11-23 | Conformité | Après P10.1 |
| Sauvegarde chiffrée hors site | 2026-11-23 | Continuité | Avant 1.0 |
| Feature flags en base | 2026-11-23 | Déploiements progressifs | Si besoin |
| Tests visuels de régression | 2026-11-23 | Design system | Après P8.5 |

---

*Toute entrée doit être supprimée si elle est rejetée définitivement, ou déplacée dans le cahier si elle est acceptée.*
