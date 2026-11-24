# DESIGN.md — Système de design Cultura

- **Version :** 0.2 (validée en Gate G0 le 2026-11-23)
- **Statut :** **validé** — les composants peuvent être construits à partir de ce document
- **Source produit :** `CULTURA_CAHIER_DES_CHARGES_v1.3.md`
- **Source méthode :** `CULTURA_GUIDE_IA.md` §10
- **Source identité :** `logo.svg`, `Icone.svg`, `logo.jpg`, `Icone.jpg`
- **Source contenu :** `CULTURA_MEDIA_GUIDE_v1.0.docx` §10 (gabarits, hiérarchie)

> Ce document fait foi pour l'interface **et** pour les visuels réseaux sociaux. Le guide média ne redéfinit ni la palette ni les polices.

---

## 1. Principe directeur

**Cultura n'est pas un tableau de bord. C'est un programme affiché.**

Le produit doit évoquer l'affiche de concert de rue, le panneau de salle et la page d'agenda imprimée : l'heure domine, les lignes sont tirées, l'information se lit debout, en 5 secondes, sur un téléphone à 360 px.

Trois règles qui en découlent :

1. **L'heure est le héros.** Elle ouvre la page « Hoje », elle structure l'agenda, elle est toujours en chiffres tabulaires.
2. **Le papier, pas la carte.** Pas de grille de cartes identiques, pas d'ombres, pas de dégradés. Des aplats, des filets, des images.
3. **Un seul geste mémorable : la réglette horaire.** Tout le reste est sobre.

Ce que nous refusons explicitement : le look « startup culturelle » (crème + serif + terracotta + cartes arrondies + dégradés), le look « dashboard SaaS », et le look « app générique » (une carte = une ombre = un rayon de 12 px).

---

## 2. Ancrage dans le sujet

Le vernaculaire visuel vient de :

- **l'affiche de concert** : hiérarchie brutale (nom, date, heure, lieu), typographie d'affichage large, noir sur papier ;
- **le programme de salle** : colonne d'horaires, filets, listes, pas de fioritures ;
- **la signalétique de quartier** : pictogrammes simples, flèches rares, texte lisible de loin ;
- **la nuit de Luanda** : le charbon de la page « Hoje » répond aux photos de scène, pas à un « mode sombre » décoratif.

**Neutralité politique.** La combinaison rouge/noir/jaune du drapeau est écartée comme système. La terracotta et l'ocre viennent du logo, pas du drapeau, et ne sont jamais associées en drapeau.

---

## 3. Palette

Cinq couleurs de marque + deux neutres fonctionnels. Rien d'autre.

| Token | Nom | Hex | Rôle |
|---|---|---|---|
| `--paper` | Marfim | `#FBF9F5` | Fond principal, texte sur fonds sombres |
| `--sand` | Areia | `#F2ECE3` | Surface secondaire, survol, bandeaux |
| `--line` | Linha | `#DDD5C8` | Filets 1 px, séparateurs, contours |
| `--ink` | Carvão | `#1A1A1A` | Texte, aplats sombres, bouton primaire |
| `--stone` | Pedra | `#6E655B` | Texte secondaire sur clair |
| `--terra` | Terra | `#422E27` | Variante sombre, pied de page, survol du bouton primaire |
| `--stone-light` | Pedra clara | `#B9AFA3` | Texte secondaire sur fond sombre |
| `--terracotta` | Terracota | `#C84B31` | Marqueur « maintenant », règle active, marqueur de catégorie |
| `--terracotta-text` | Terracota texto | `#A33520` | Texte/lien accessible sur clair, erreurs |
| `--ochre` | Ocre | `#D99B26` | Vérification, gratuité, ticks de la réglette, focus sur sombre |

### 3.1 Contrastes mesurés (WCAG)

| Paire | Ratio | Usage autorisé |
|---|---|---|
| `ink` sur `paper` | 16,55 | Texte courant |
| `stone` sur `paper` | 5,43 | Texte secondaire |
| `stone` sur `sand` | 4,87 | Texte secondaire |
| `terracotta-text` sur `paper` | 6,47 | Liens, erreurs |
| `terracotta` sur `paper` | 4,43 | **Texte ≥ 24 px ou gras ≥ 19 px uniquement**, traits, icônes |
| `ochre` sur `ink` | 7,18 | Accent, texte sur sombre |
| `ink` sur `ochre` | 7,18 | Texte sur aplat ocre |
| `ochre` sur `paper` | 2,30 | **Jamais du texte** ; uniquement aplat, point, tick |
| `stone-light` sur `ink` | 8,06 | Texte secondaire sur sombre |
| `paper` sur `ink` | 16,55 | Texte sur sombre |

**Règles**

- L'ocre n'est jamais une couleur de texte sur fond clair.
- La terracotta n'est jamais la couleur d'un paragraphe.
- Aucune information portée par la seule couleur : un statut a toujours un libellé.
- Pas de vert/rouge « feu tricolore ». Le refus s'exprime en `terracotta-text` + libellé + icône.

---

## 4. Typographie

**Une seule famille : Archivo** (SIL Open Font License), auto-hébergée, sous-ensemble latin + latin étendu (ã, õ, ç, á, ê…), fichier variable `wght` + `wdth`, `font-display: swap`.

- Pourquoi Archivo : grotesque géométrique proche du logotype, excellente lisibilité à petite taille, axe de largeur pour l'affichage, accents PT complets.
- **Aucune serif. Aucun italique décoratif. Aucun mot accentué en couleur dans un titre.**
- Chiffres tabulaires (`font-variant-numeric: tabular-nums`) pour heures, prix, compteurs.
- Graisses utilisées : 400, 500, 700, 800. Rien d'autre.

### 4.1 Échelle

| Token | Mobile (px/lh) | Desktop (px/lh) | Graisse | Usage |
|---|---|---|---|---|
| `display` | 34 / 38 | 56 / 58 | 800, `font-stretch: 112%` | Date du jour, titre de page exceptionnel |
| `h1` | 28 / 32 | 40 / 44 | 800 | Titre de page |
| `h2` | 22 / 28 | 28 / 34 | 700 | Section (ville, « Esta semana ») |
| `h3` | 18 / 24 | 20 / 26 | 700 | Titre d'événement, d'annonce |
| `body-lg` | 17 / 26 | 18 / 28 | 400 | Chapeau, biographie |
| `body` | 16 / 24 | 16 / 26 | 400 | Texte courant, champs |
| `meta` | 13 / 18 | 13 / 18 | 400 / 500 | Lieu, ville, date secondaire |
| `micro` | 11 / 15 | 11 / 15 | 500 | Mentions légales uniquement |

- Interlignage des titres : 1,05 à 1,15. Corps : 1,5.
- Interlettrage : `-0.02em` sur `display`/`h1` uniquement. **Jamais d'interlettrage positif.**
- Longueur de ligne : 60–70 caractères.
- Taille de corps minimum : 16 px. Pas de 14 px pour du contenu.

---

## 5. Grille, espacement, formes

### 5.1 Espacement (base 4)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

- Marges mobile : 16 px. Desktop : 24 px minimum.
- Hauteur de section : 48 px mobile, 80 px desktop.
- Espacement titre → contenu : 12 px. Contenu → filet : 16 px.

### 5.2 Grille

- Mobile : 4 colonnes, gouttière 12 px, conception à **360 px**.
- Tablette : 8 colonnes.
- Desktop : 12 colonnes, largeur max **1120 px**, gouttière 24 px. Colonne de lecture 680 px max.
- Points de rupture : 360, 480, 768, 1024, 1280.

### 5.3 Formes

| Élément | Rayon | Bordure | Ombre |
|---|---|---|---|
| Images, vidéos, aplats | 0 | aucune | aucune |
| Boutons, champs, puces de filtre | 2 px | 1 px `line` | aucune |
| Cartes de flux | 0 | filet supérieur 1 px | aucune |
| Fenêtres modales | 2 px | 1 px `line` | aucune (voile `ink` 60 %) |
| Badges | 2 px | aucune | aucune |

**Aucune ombre portée dans tout le produit.** Le relief vient du contraste des aplats et des filets.
**Aucune pilule** (rayon ≥ 999 px). Les filtres sont des rectangles à angles légèrement adoucis.

---

## 6. L'élément signature : la réglette horaire

```
      12h        15h        18h        20h        22h      02h
  ─────┼──────────┼──────────┼────●─────┼────●─────┼────●────┼─────
                            (3 eventos)   (1)       (2)
```

- Composant `TimeRuler`, affiché **une seule fois** par page, en haut de « Hoje », sur l'aplat `ink`.
- Graduations toutes les heures, hauteur 6 px ; heures pleines 10 px ; texte `meta` en `stone-light`.
- Chaque événement du jour place un point `ochre` de 4 px à son heure ; au-delà de 3 événements sur la même heure, un trait vertical de 2 px.
- Animation unique : les graduations apparaissent en 400 ms (décalage 20 ms), une fois, au premier chargement. `prefers-reduced-motion` → rendu immédiat.
- Sur mobile, la réglette défile horizontalement si la plage dépasse la largeur ; jamais de compression illisible.

C'est le seul moment « spectaculaire » du produit. Le reste ne bouge pas.

---

## 7. Navigation et en-tête

### 7.1 En-tête

- Hauteur 56 px mobile, 64 px desktop. Fond `paper`, filet inférieur 1 px.
- À gauche : **logotype vectoriel** `logo.svg` (version horizontale), hauteur 24 px mobile / 28 px desktop, largeur libre, jamais déformé. En attendant une version détourée, repli typographique : symbole « C » + mot « CULTURA » en 800, 15 px, `-0.01em`.
- À droite : sélecteur de langue (`PT ▾`), recherche (icône 20 px + libellé accessible), compte.
- Desktop : navigation inline `Hoje · Semana · Atores · Cidades` à droite du logo. Item actif : texte `ink` + filet `terracotta` 3 px sous le mot, à 6 px.
- Mobile : pas de menu hamburger pour la navigation principale — barre basse.

### 7.1.1 Le logotype (acquis le 2026-11-23)

Le logotype est **peint au pinceau**, pas composé en Archivo :

- un « C » brossé, noir, avec une **flèche bicolore** (terracotta en haut, ocre en bas) pointant vers la droite ;
- le mot `CULTURA` en capitales, tracé irrégulier ;
- la signature `AGENDA CULTURAL DE ANGOLA` en petites capitales, sous le mot.

Règles :

- Le logotype est **une image**, jamais recomposé en HTML/CSS. Aucun `<h1>` ne contient le mot « CULTURA » en police d'interface.
- Il ne remplace pas Archivo : Archivo reste la seule police d'interface. Le contraste pinceau / grotesque est **voulu** — c'est la main de l'afficheur contre la rigueur du programme.
- La flèche du « C » est le seul motif autorisé en dehors de la réglette : elle peut servir de puce de lien sortant, jamais de décoration répétée.
- Les fichiers fournis (`logo.svg`, `Icone.svg`) sont des **vectorisations automatiques** du visuel : ils contiennent le bruit de compression du JPEG d'origine (traits beiges parasites), des marges vides et plusieurs valeurs de couleur très proches. Voir §15 pour le nettoyage requis avant P1.5.

---

### 7.2 Barre de navigation mobile

- 4 items : `Hoje`, `Semana`, `Atores`, `Cidades`.
- Hauteur 56 px + `env(safe-area-inset-bottom)`. Fond `paper`, filet supérieur 1 px.
- Icône 20 px + libellé 11 px. Item actif : icône et texte `ink`, filet `terracotta` 2 px en haut de l'item ; inactif : `stone`.
- Cible tactile ≥ 48 × 48 px.

### 7.3 Hiérarchie des titres

Un seul `h1` par page. Les villes sont des `h2`. Les titres d'événements sont des `h3` (ou des liens dans une liste). Pas de saut de niveau.

---

## 8. Composants

### 8.1 Ligne d'événement (`EventRow`) — composant central

```
┌──────────────────────────────────────────────────────┐
│ 18h00   Concerto · Telma Lee                    [icône]│
│         Stade XYZ · Talatona · Luanda            Grátis│
└──────────────────────────────────────────────────────┘
```

- Filet supérieur 1 px `line`, pas de fond, pas de rayon, pas d'ombre.
- Colonne horaire fixe 56 px, `h3` tabulaire, alignée à gauche.
- Titre `h3` sur 2 lignes max ; méta `meta` `stone` sur 1 ligne (tronquée avec `…`).
- Icône de catégorie 20 px à droite, `stone`.
- Prix : `Grátis` en `meta` + point `ochre` 6 px. Prix payant : « 5 000 Kz » en `meta`.
- Zone cliquable : toute la ligne, hauteur ≥ 64 px. Focus visible sur toute la ligne.
- Aucun chevron. Aucun effet de survol autre que le titre souligné.

### 8.2 Carte de flux — trois variantes, jamais une grille uniforme

1. **Lead** (1re annonce) : image 3:2 pleine largeur, titre 22/28, méta, actions.
2. **Compacte** : vignette 96 × 72 à gauche, texte à droite, filet supérieur.
3. **Pleine image** : image 4:5, utilisée toutes les 6 annonces pour casser le rythme.

Règles communes : rayon 0, aucune ombre, onglet de catégorie (carré `paper` 32 px avec icône `ink`) posé en bas à gauche de l'image, jamais d'étiquette en majuscules au-dessus du titre.

Actions sous la carte : `Gosto`, `Favorito`, `Partilhar`, `Denunciar` — icônes 20 px + libellé `meta` (le libellé n'est jamais masqué sur mobile). Cibles 44 px.

### 8.3 Bandeau de ville (`CityHeader`)

```
Luanda · 3 eventos
────────────────────────────────────────
```

- `h2`, casse normale, `ink`.
- Compteur en `meta` `stone`, séparé par un point médian (seul usage autorisé de `·`).
- Filet `line` sous le bandeau, pleine largeur du contenu.

### 8.4 Boutons

| Variante | Fond | Texte | Bordure | Usage |
|---|---|---|---|---|
| Primaire | `ink` | `paper` | aucune | Action unique d'un écran (« Publicar anúncio », « Validar ») |
| Secondaire | transparent | `ink` | 1 px `ink` | Action alternative |
| Tertiaire | transparent | `ink` | aucune, souligné au survol | Navigation, « Ver agenda » |
| Destructive | `paper` | `terracotta-text` | 1 px `terracotta-text` | Refus, suppression (avec confirmation) |
| Désactivé | 40 % d'opacité | — | — | État non actionnable |

- Hauteur 44 px minimum, padding horizontal 20 px, rayon 2 px, graisse 700, casse normale.
- Libellé = verbe explicite : « Publicar o anúncio », jamais « Enviar ».
- Pas d'icône `→` systématique. Une flèche seulement si elle indique une navigation réelle.

### 8.5 Filtres

- Puces rectangulaires 2 px, hauteur 36 px, bordure `line`, texte `ink`.
- Sélectionnée : fond `ink`, texte `paper`, bordure `ink`. Pas de coche.
- Défilement horizontal sur mobile, avec coupure nette sur les bords (pas de dégradé).
- Filtre `Grátis` : point `ochre` devant le libellé quand actif, fond `ink`.

### 8.6 Formulaires

- Label au-dessus, `body` 500, 8 px d'écart. Champ 48 px, bordure 1 px `line`, rayon 2 px, fond `paper`.
- Focus : bordure `ink` 2 px + `outline` 2 px `ink` décalé de 2 px (voir 12).
- Erreur : bordure et texte `terracotta-text`, icône 16 px, message sous le champ, `aria-describedby`.
- Aide : `meta` `stone`. Obligatoire : astérisque + légende en tête de formulaire.
- Bouton primaire à droite sur desktop, pleine largeur sur mobile.
- Aucun placeholder utilisé comme label.

### 8.7 Badges et mentions

- **Vérifié** : sceau `ochre` 16 px + « Verificado » `meta` `ink`. Jamais un badge vert.
- **Grátis** : point `ochre` + « Grátis ».
- **Fiche gérée par l'équipe** : encadré 1 px `line`, fond `sand`, icône information, phrase complète : « Informação publicada pela equipa Cultura com base numa fonte pública. » + deux actions.
- **Statut admin** : libellé + point coloré (`ochre` en attente, `ink` validé, `terracotta-text` refusé). Jamais la couleur seule.

### 8.8 États vides, chargement, erreur

- **Vide** : titre `h2` + une phrase qui explique + une action. Exemple : « Ainda não há eventos hoje em Benguela. » / « Ver a semana completa ».
- **Chargement** : squelettes aux dimensions réservées (aucun saut de mise en page), pas de spinner plein écran.
- **Erreur** : phrase simple, action « Tentar novamente », aucune stack trace.
- **Hors-ligne (mobile)** : bandeau `ink` fin, texte `paper` : « Sem ligação. A mostrar os eventos de ontem. »

### 8.9 Statistiques (espace acteur)

- 4 chiffres en haut : `display` tabulaire, libellé `meta`.
- Graphique : barres `ochre` sur piste `sand`, 7 ou 30 jours, pas de grille, pas de dégradé, valeurs au survol/focus.
- Aucun camembert, aucune jauge circulaire.

---

## 9. Écrans — wireframes

### 9.1 « Hoje » — mobile 360 px

```
┌────────────────────────────────────────┐
│ CULTURA                      PT  Busca │
├────────────────────────────────────────┤
│ ██████████ aplat carvão ██████████████ │
│ Segunda, 24 de novembro                │
│ 8 eventos em 5 cidades                 │
│                                        │
│ 12h   15h   18h   20h   22h   02h      │
│ ─┼─────┼─────┼──●──┼──●──┼──●──┼──     │
├────────────────────────────────────────┤
│ Luanda · 3 eventos                     │
│ ────────────────────────────────────── │
│ 18h00  Concerto · Telma Lee      [♪]   │
│        Stade XYZ · Talatona       Grátis│
│ ────────────────────────────────────── │
│ 20h00  Cinema · « Njinga »       [▣]   │
│        Cine Kilamba · Kilamba          │
│ ────────────────────────────────────── │
│ 22h00  Show · Yuri da Cunha      [♪]   │
│        Lounge 9 · Ilha                 │
├────────────────────────────────────────┤
│ Benguela · 1 evento                    │
│ ────────────────────────────────────── │
│ 19h00  Exposição · …             [▢]   │
├────────────────────────────────────────┤
│ Esta semana                            │
│ 24 — 30 de novembro      Ver agenda →  │
├────────────────────────────────────────┤
│ Agora no fluxo                         │
│ ┌────────────────────────────────────┐ │
│ │            imagem 3:2              │ │
│ └────────────────────────────────────┘ │
│ Música · Novo single de …              │
│ Yuri da Cunha · há 2 h                 │
│ ♡ Gosto  ⭐ Favorito  ↗ Partilhar      │
├────────────────────────────────────────┤
│ Hoje    Semana    Atores    Cidades    │
└────────────────────────────────────────┘
```

### 9.2 « Hoje » — desktop 1120 px

```
┌────────────────────────────────────────────────────────────────┐
│ CULTURA      Hoje  Semana  Atores  Cidades        PT  Busca    │
├────────────────────────────────────────────────────────────────┤
│ ██████████████████████████████████████████████████████████████ │
│ Segunda, 24 de novembro                    8 eventos · 5 cidades│
│ ──┼──────┼──────┼───●──┼───●──┼───●──┼──────                   │
│ [Luanda] [Benguela] [Huambo] [Cabinda] [Lubango]               │
├───────────────────────────────────┬────────────────────────────┤
│ Luanda · 3 eventos                │ Esta semana                │
│ ───────────────────────────────── │ 25 nov · Teatro · …        │
│ 18h00  Concerto · Telma Lee   [♪] │ 27 nov · Festival · …      │
│ 20h00  Cinema · « Njinga »    [▣] │                            │
│ 22h00  Show · Yuri da Cunha   [♪] │ Cidades                    │
│                                   │ Luanda · Benguela · …      │
│ Benguela · 1 evento               │                            │
│ 19h00  Exposição · …          [▢] │                            │
├───────────────────────────────────┴────────────────────────────┤
│ Fluxo                                                          │
│ ┌──────────────┐ ┌───────────────────────────────────────────┐ │
│ │ image 3:2    │ │ Música · Novo single …                    │ │
│ │              │ │ Yuri da Cunha · há 2 h                    │ │
│ └──────────────┘ └───────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 9.3 Flux

```
┌────────────────────────────────────────┐
│ CULTURA                      PT  Busca │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │          image 3:2 (lead)          │ │
│ └────────────────────────────────────┘ │
│ Música · Novo single de Yuri da Cunha  │
│ Yuri da Cunha · há 2 horas             │
│ ♡ 12  ⭐ Guardar  ↗ WhatsApp  ⚑         │
├────────────────────────────────────────┤
│ ┌────────┐ Cinema                      │
│ │ 96×72  │ « Njinga » estreia em …     │
│ └────────┘ Cine Kilamba · há 3 horas   │
│ ♡ 4   ⭐ Guardar   ↗ WhatsApp   ⚑       │
├────────────────────────────────────────┤
│ (2 compactes, puis 1 pleine image 4:5) │
└────────────────────────────────────────┘
```

### 9.4 Agenda et filtres

```
┌────────────────────────────────────────┐
│ Agenda                                 │
│ [ Hoje ][ Semana ][ Mês ]              │
│ Cidade: Luanda ▾   Comuna: Todas ▾     │
│ [Música][Cinema][Teatro][Dança][+ …]   │
│ [• Grátis]                             │
├────────────────────────────────────────┤
│ 24 nov · segunda                       │
│ 18h00  Concerto · Telma Lee            │
│ 20h00  Cinema · « Njinga »             │
├────────────────────────────────────────┤
│ 25 nov · terça                         │
│ 19h00  Teatro · …                      │
└────────────────────────────────────────┘
```

- Mobile : liste groupée par jour + bandeau de semaine.
- Desktop : même liste à gauche, calendrier mensuel optionnel à droite (bascule « Lista / Calendário »).
- Tous les filtres sont reflétés dans l'URL, partageable.

### 9.5 Fiche d'acteur culturel

```
┌────────────────────────────────────────┐
│ ← Atores                               │
│ ┌────────────────────────────────────┐ │
│ │        portrait 1:1               │ │
│ └────────────────────────────────────┘ │
│ Telma Lee  [sceau ocre] Verificado     │
│ Artista · Luanda · Talatona            │
│ Semba · Kizomba                        │
│                                        │
│ Biografia …                            │
│                                        │
│ [ embed YouTube 16:9 ]                 │
│                                        │
│ Próximos eventos                       │
│ 24 nov · 18h00 · …                     │
│                                        │
│ Últimos anúncios                       │
│ ┌────┐ Música · …                      │
│ └────┘ há 2 dias                       │
├────────────────────────────────────────┤
│ (si non revendiquée)                   │
│ ┌────────────────────────────────────┐ │
│ │ ℹ Ficha gerida pela equipa Cultura │ │
│ │   com base numa fonte pública.     │ │
│ │ [ Reclamar esta ficha ]            │ │
│ │ [ Pedir correção ou remoção ]      │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

### 9.6 Admin — file de modération

```
┌──────────────────┬─────────────────────────────────────┐
│ Fila · 23        │ Pré-visualização                    │
│ ──────────────── │ ┌─────────────────────────────────┐ │
│ ▸ Evento · 24 nov│ │ image                           │ │
│   Telma Lee      │ └─────────────────────────────────┘ │
│ ▸ Anúncio · …    │ Título                              │
│ ▸ Revendicação   │ Ator · origem · fonte (URL)         │
│ ▸ Denúncia       │ Campos do formato                   │
│                  │                                     │
│                  │ [ Recusar ]        [ Validar ]      │
│                  │ Motivo obrigatório ao recusar       │
└──────────────────┴─────────────────────────────────────┘
```

- Desktop : deux colonnes 380 px / 1fr. Mobile : empilé, la file devient une liste.
- Aucune carte arrondie, aucune ombre ; des lignes, des libellés, des états.
- Navigation clavier complète : `J`/`K` pour parcourir, `V` valider, `R` refuser (documenté).

---

## 10. Gabarits médias (réseaux sociaux)

Alignés sur le guide média §10, sans nouvelle couleur.

| Code | Gabarit | Contenu | Limite |
|---|---|---|---|
| G1 | Hoje | Date, ville, 3 à 5 événements (heure, nom, lieu) | 5 lignes |
| G2 | Este fim de semana | Agenda par jour et par ville | lisible sans zoom, partageable tel quel |
| G3 | Lançamento | Pochette, artiste, titre, date, où écouter | 1 image + 4 lignes |
| G4 | Retrato | Portrait, nom, ville, genre, projet | photo fournie ou autorisée |
| G5 | Top / Grátis | Liste classée ou liste gratuite | 7 lignes |
| G6 | Story / Statut | Version verticale de G1/G2 | zones de sécurité |
| G7 | Couverture de Reel | Série + date | lisible en miniature |

Règles : hiérarchie fixe (date → ville → heures → mention Cultura discrète) ; texte ≥ 36 px sur 1080 px de large ; un seul jeu de pictogrammes ; aucune image générée par IA pour représenter un événement, un artiste ou un public ; sous-titres PT sur toutes les vidéos.

---

## 11. Mouvement

| Usage | Durée | Courbe |
|---|---|---|
| Changement d'état (couleur, soulignement) | 120 ms | `cubic-bezier(.2,.65,.25,1)` |
| Ouverture de panneau / modale | 220 ms | idem |
| Réglette (une fois) | 400 ms, décalage 20 ms | idem |

- **Interdit** : animation d'entrée sur chaque section, apparition au scroll, parallaxe, survol qui soulève une carte, dégradé animé, curseur personnalisé.
- `prefers-reduced-motion: reduce` : aucune animation, aucun décalage, tout est visible immédiatement.

---

## 12. Accessibilité

- WCAG 2.1 AA. Contrastes : voir §3.1.
- Focus visible partout : `outline: 2px solid var(--ink); outline-offset: 2px` sur fond clair ; `2px solid var(--ochre)` sur fond sombre. Jamais `outline: none`.
- Cibles tactiles ≥ 44 × 44 px (48 px pour la barre basse).
- Labels de formulaire explicites, erreurs annoncées (`aria-live`), `aria-describedby`.
- Images : `alt` réel pour les affiches (« Affiche : {titre} — {lieu}, {date} »), `alt=""` pour le décoratif.
- Zoom 200 % sans perte ; pas de texte dans les images porteuses d'information (sauf gabarits médias, qui ont un équivalent texte).
- Navigation clavier complète, lien « saltar para o conteúdo ».
- Un seul `h1`, hiérarchie cohérente, landmarks (`header`, `nav`, `main`, `footer`).
- Langue déclarée : `<html lang="pt-AO">` (ou `fr`, `en`).
- Aucune information par la couleur seule.

---

## 13. Performance et contraintes d'image

- Budget : JS initial ≤ 150 Ko gzip par page publique ; LCP < 2,5 s ; charge utile < 3 s sur 3G.
- Images : `srcset`, WebP/AVIF, dimensions réservées, `loading="lazy"` sauf image LCP.
- Ratios : lead 3:2 (1200 × 800), portrait 1:1 (800 × 800), pleine image 4:5 (1080 × 1350), vignette 4:3 (192 × 144).
- Poids max : 200 Ko par image de carte, 350 Ko pour une image pleine largeur.
- Polices : un seul fichier variable, préchargé, `font-display: swap`.
- Icônes : SVG inline, jamais de police d'icônes, jamais d'emoji en production.
- Aucune bibliothèque d'animation, aucun carrousel automatique.
- Mode économe : bouton global « Sem imagens » (préférence mémorisée), images remplacées par un aplat `sand` + titre.

---

## 14. Revue anti-« look IA » (guide §10.3)

| Cliché | Risque | Décision Cultura |
|---|---|---|
| Fond crème + serif contrasté + accent terracotta | **Élevé** (la marque est crème/terracotta) | Aucune serif ; Archivo grotesque. La terracotta est un **marqueur** (heure, règle active), jamais la couleur des boutons. L'aplat charbon casse la page crème. |
| Fond quasi noir + un seul accent acide | Moyen | Le noir n'est pas un thème : c'est le bandeau « Hoje » et les pieds de page. Trois accents (terracotta, ocre, terra) + photos. |
| Grille de cartes identiques, même rayon, même ombre | Élevé | Pas de grille uniforme : 3 variantes de cartes, rayons 0, **aucune ombre**. Les événements sont des lignes, pas des cartes. |
| Étiquettes en majuscules espacées au-dessus des titres | Élevé | Aucune étiquette. La catégorie est un onglet d'image ou une méta en fin de ligne. Aucun interlettrage positif. |
| Chaînes `A · B · C` partout | Moyen | Le point médian est réservé à la ligne de méta (lieu · quartier · ville) et au compteur. |
| `→` sur tous les boutons | Moyen | Flèche uniquement pour une navigation réelle (« Ver agenda »). |
| Numérotation 01/02/03 | Faible | Interdite hors séquence réelle (étapes d'un formulaire). |
| Un mot du titre en italique/couleur | Faible | Interdit. |
| Fondu + glissement sur chaque section | Élevé | Un seul mouvement : la réglette. Le reste est statique. |
| Un seul élément mémorable | — | **La réglette horaire.** Tout le reste est sobre. |
| Textes creux, « Bienvenue sur… » | Moyen | Verbes d'action et informations réelles. Zéro lorem ipsum. |
| États vides génériques | Moyen | Chaque état vide nomme le lieu, la date et l'action suivante. |
| Emoji de catégorie hétéroclites | Élevé | Un seul jeu d'icônes dessinées, 24 px, trait 1,75 px. Zéro emoji dans le produit. |

**Ce qui a changé après revue :**

1. La terracotta n'est plus une couleur de CTA : elle marque le temps et l'état actif.
2. Les événements ne sont pas des cartes : ce sont des lignes de programme.
3. L'aplat charbon du bandeau « Hoje » remplace le fond crème uniforme.
4. La typographie est unique, grotesque, large — pas de serif « éditorial ».
5. Le seul moment animé est la réglette ; aucune apparition au scroll.
6. Les photos sont réelles et autorisées ; aucune image IA de concert.

---

## 15. Gouvernance et éléments manquants

**Reçus le 2026-11-23 :**

- [x] Logo vectoriel : `logo.svg` (symbole + mot + signature, horizontal) et `Icone.svg` (symbole seul, carré 1024 × 1024) — **versionnés le 2026-11-24**, contrôlés (aucun script, aucune référence externe).
- [x] Références raster de la marque : `logo.jpg`, `Icone.jpg`.

**Qualité des fichiers reçus — à corriger avant P1.5 :**

| Problème | Détail | Correction |
|---|---|---|
| Bruit de vectorisation | Les deux SVG contiennent des dizaines de micro-traces beiges issues de la compression du JPEG d'origine | Nettoyer ou retracer depuis un PNG propre à 2048 px |
| Couleurs non normalisées | Terracotta `#c95136` / `#c94e32`, ocre `#d89b2d` / `#d99a28`, papier `#f8f7f2` / `#fdfdfa`, noir `#0e0e0b` / `#1d1d1d` | Ramener à `#C84B31`, `#D99B26`, `#FBF9F5`, `#1A1A1A` |
| Marges vides | Le dessin n'occupe qu'une partie du `viewBox` (beaucoup de blanc autour) | Recadrer à la boîte englobante exacte |
| Poids | 189 Ko et 146 Ko pour un logotype | Viser < 20 Ko par fichier après nettoyage |
| Variantes absentes | Pas de version verticale, pas de version claire sur fond sombre, pas de monochrome | Décliner depuis le master nettoyé |

**Encore à fournir :**

- [ ] Master propre : SVG recadré, couleurs normalisées, sans bruit (ou AI/EPS source).
- [ ] Variantes : verticale, claire sur charbon, monochrome (pour l'APK et les tampons).
- [ ] Favicon 32 px, icône 180 px, icône maskable 512 px, image de partage OG 1200 × 630 (gabarit).
- [ ] Confirmation de la licence de la police (Archivo, SIL OFL) et des fichiers source.
- [x] Validation de la palette et du concept (§1) par l'humain — 2026-11-23.
- [x] Validation des wireframes des 4 écrans clés — 2026-11-23.
- [ ] Relecture du vocabulaire PT-AO (`i18n/GLOSSAIRE.md`).

**Règle de modification :** toute évolution du design passe par une mise à jour de ce fichier, une capture avant/après et la revue `designer-critic`. Pas de couleur ou de police ajoutée à la volée dans un composant.

---

*Fin du plan de design v0.1 — à valider avant le premier composant.*
