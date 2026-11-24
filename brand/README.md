# brand/ — actifs de marque

| Fichier | Type | Usage |
|---|---|---|
| `../logo.svg` | vectoriel, 1344 × 756 | logotype horizontal (symbole + mot + signature) |
| `../Icone.svg` | vectoriel, 1024 × 1024 | symbole seul (icône, favicon source) |
| `../logo.jpg` | raster 355 646 o | référence de la planche d'origine |
| `../Icone.jpg` | raster 393 415 o | référence de la planche d'origine |
| `logo-apercu.png` | raster 1344 × 756 | aperçu de contrôle (rendu Edge headless) |
| `icone-apercu.png` | raster 1024 × 1024 | aperçu de contrôle (rendu Edge headless) |

Les deux SVG ont été fournis le 2026-11-23, brièvement absents du disque, puis rétablis et **versionnés le 2026-11-24**. Ils ne contiennent ni script, ni référence externe, ni entité XML — vérifié avant commit.

**Qualité :** vectorisation automatique d'un JPEG. Elle conserve donc (a) des micro-traces beiges de compression, (b) un `viewBox` plus grand que le dessin, (c) plusieurs valeurs de couleur très proches de la palette. Voir `DESIGN.md` §15.

**À produire avant P1.5 :**

1. Master nettoyé : SVG recadré à la boîte englobante, couleurs ramenées aux tokens, sans bruit.
2. Variantes : verticale, claire sur charbon, monochrome.
3. Favicon 32 px, icône 180 px, icône maskable 512 px, gabarit OG 1200 × 630.

**Interdit :** utiliser les JPG comme logo de production, et ne jamais insérer un SVG fourni par un utilisateur sans le nettoyer (règle de sécurité `AGENTS.md` §7).
