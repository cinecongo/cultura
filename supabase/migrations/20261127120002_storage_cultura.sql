-- Cultura — stockage des images (P2.5)
-- Source : CULTURA_GUIDE_IA.md §7.2 (uploads), CULTURA_CAHIER_DES_CHARGES_v1.3 §10
-- Dépend de : ADR-005 (migrations en ligne, sans Docker), ADR-006 (connexion pooler)
--
-- Bucket unique `cultura-media`, **privé** : la lecture publique se fait via une
-- URL signée générée côté serveur (arrivée en P4.5 / P6). Aucun accès anonyme.
-- Politiques strictes : taille maximale + types MIME limités au pipeline WebP.
-- L'application applique en amont le MIME vérifié, la taille max, le redimensionnement
-- WebP et le nom de fichier généré (guide §7.2) ; ces contraintes bucket sont la
-- dernière barrière côté infrastructure.

insert into storage.buckets (
  id,
  name,
  owner,
  public,
  created_at,
  updated_at,
  type,
  versioning_status,
  file_size_limit,
  allowed_mime_types
)
values (
  'cultura-media',
  'cultura-media',
  null,
  false,
  now(),
  now(),
  'STANDARD',
  'DISABLED',
  10485760,
  ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/avif']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/avif'],
      versioning_status = 'DISABLED',
      updated_at = now();
