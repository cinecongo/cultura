# Glossaire produit PT-AO / FR / EN

- **Version :** 0.1 (proposition P0.4)
- **Statut :** à valider par un locuteur angolais avant P8.4
- **Portée :** toute l'interface, les emails transactionnels, les messages d'erreur et les visuels réseaux sociaux.
- **Règle :** aucune chaîne d'interface n'est écrite en dur ; chaque terme ci-dessous devient une clé i18n.

> Le portugais d'Angola est la langue principale. Le français et l'anglais sont secondaires mais complets dès la V1. Le contenu publié reste dans sa langue d'origine.

---

## 1. Termes produit

| FR | PT-AO | EN | Notes |
|---|---|---|---|
| annonce culturelle | anúncio cultural | cultural announcement | Remplace « publication ». Jamais « publicação », « post ». |
| acteur culturel | agente cultural | cultural professional | Couvre artiste, promoteur, salle, festival, organisation. « Ator cultural » est l'alternative à valider. |
| espace acteur culturel | espaço de agente cultural | cultural professional space | Espace protégé de l'acteur culturel (P3.2). |
| espace d'administration | espaço de administração | administration space | Espace protégé de l'administration (P3.2). |
| fiche | ficha | profile | Page d'un acteur culturel. |
| revendiquer une fiche | reclamar a ficha | claim a profile | Action d'un acteur inscrit. |
| fiche gérée par l'équipe | ficha gerida pela equipa | team-managed profile | Mention obligatoire, pas de badge vérifié. |
| équipe Cultura | equipa Cultura | Cultura team | Toujours avec « Cultura ». |
| page « Aujourd'hui » | página « Hoje » | “Today” page | Écran d'accueil. |
| agenda culturel | agenda cultural | cultural agenda | |
| événement | evento | event | |
| sortie musicale | lançamento musical | music release | |
| mise en avant | destaque | featured | Sponsorisé le cas échéant. |
| source publique | fonte pública | public source | URL obligatoire pour le contenu équipe. |
| seuil de lancement | limiar de lançamento | launch threshold | Configurable en base (50 par défaut). |
| acteur actif | agente ativo | active cultural professional | ≥ 1 contenu publié sur 90 jours (à confirmer). |
| vérifié | verificado | verified | Badge admin uniquement. |
| membre | membro | member | Compte connecté non acteur. |
| éditeur | editor | editor | Rôle interne. |
| administrateur | administrador | administrator | |
| visiteur | visitante | visitor | Non connecté. |

---

## 2. Navigation et actions

| FR | PT-AO | EN |
|---|---|---|
| Aujourd'hui | Hoje | Today |
| Cette semaine | Esta semana | This week |
| Ce mois | Este mês | This month |
| Acteurs culturels | Agentes culturais | Cultural professionals |
| Villes | Cidades | Cities |
| Agenda | Agenda | Agenda |
| Rechercher | Pesquisar | Search |
| Se connecter | Entrar | Sign in |
| Créer un compte | Criar conta | Create account |
| Se déconnecter | Sair | Sign out |
| Publier une annonce | Publicar anúncio | Publish announcement |
| Publier un événement | Publicar evento | Publish event |
| Enregistrer le brouillon | Guardar rascunho | Save draft |
| Soumettre pour validation | Enviar para análise | Submit for review |
| J'aime | Gosto | Like |
| Favori | Favorito | Save |
| Suivre une ville | Seguir cidade | Follow city |
| Partager | Partilhar | Share |
| Partager sur WhatsApp | Partilhar no WhatsApp | Share on WhatsApp |
| Signaler | Denunciar | Report |
| Demander une correction ou un retrait | Pedir correção ou remoção | Request correction or removal |
| Voir l'agenda | Ver agenda | View agenda |
| Charger plus | Carregar mais | Load more |
| Réessayer | Tentar novamente | Try again |
| Annuler | Cancelar | Cancel |
| Confirmer | Confirmar | Confirm |
| Valider | Validar | Approve |
| Refuser | Recusar | Reject |
| Motif | Motivo | Reason |
| Retour | Voltar | Back |

---

## 3. Champs et données

| FR | PT-AO | EN | Remarque |
|---|---|---|---|
| Titre | Título | Title | |
| Description | Descrição | Description | |
| Contenu | Conteúdo | Content | |
| Catégorie | Categoria | Category | |
| Format | Formato | Format | |
| Date | Data | Date | |
| Heure | Hora | Time | |
| Date de fin | Data de fim | End date | |
| Ville | Cidade | City | |
| Commune | Comuna | Commune | Subdivision administrative angolaise. |
| Quartier | Bairro | Neighbourhood | Saisie libre, normalisée par l'admin. |
| Lieu | Local | Venue | |
| Organisateur | Organizador | Organiser | |
| Prix | Preço | Price | |
| Gratuit | Grátis | Free | |
| Contact | Contacto | Contact | |
| Langue | Língua | Language | |
| Photo | Fotografia | Photo | |
| Lien YouTube | Link do YouTube | YouTube link | |
| Lien Spotify | Link do Spotify | Spotify link | |
| Genre artistique | Género artístico | Artistic genre | |
| Biographie | Biografia | Biography | |
| Réseaux sociaux | Redes sociais | Social links | |

---

## 4. Statuts

| FR | PT-AO | EN |
|---|---|---|
| Brouillon | Rascunho | Draft |
| En attente | Em análise | Pending review |
| Validé | Validado | Approved |
| Refusé | Recusado | Rejected |
| Annulé | Cancelado | Cancelled |
| Reporté | Adiado | Postponed |
| Ouvert (signalement) | Aberto | Open |
| Traité | Tratado | Handled |
| En attente (revendication) | Pendente | Pending |
| Approuvée | Aprovada | Approved |
| Refusée | Recusada | Rejected |

---

## 5. Catégories et formats

**Catégories proposées** (à arbitrer — voir `QUESTIONS.md` D1) :
`Música` · `Cinema` · `Teatro` · `Dança` · `Literatura` · `Exposição`.

**Formats d'annonce** (cahier §6) :
`Actualidade` → actualite · `Evento` → evenement · `Lançamento musical` → sortie_musicale · `Vídeo` → video · `Filme / Cinema` → film · `Exposição` → exposition · `Anúncio oficial` → annonce_officielle.

> Les formats sont des valeurs techniques en base (dernière colonne, en français) ; les libellés affichés sont ceux des colonnes PT/EN.

---

## 6. Formats de date, heure et monnaie

| Élément | PT-AO | FR | EN |
|---|---|---|---|
| Date longue | 24 de novembro de 2026 | 24 novembre 2026 | 24 November 2026 |
| Date courte | 24 nov 2026 | 24 nov. 2026 | 24 Nov 2026 |
| Jour | segunda-feira | lundi | Monday |
| Heure | 18h00 | 18 h 00 | 18:00 |
| Plage | 18h00 — 22h00 | 18 h 00 — 22 h 00 | 18:00–22:00 |
| Nombre | 1 500 | 1 500 | 1,500 |
| Monnaie | 1 500 Kz | 1 500 Kz | 1,500 Kz |
| Compteur | 8 eventos | 8 événements | 8 events |

- Espace insécable avant `Kz` et dans les milliers.
- Fuseau d'affichage : `Africa/Luanda` (UTC+1, sans heure d'été). Stockage en UTC.
- Pluriel géré par `Intl.PluralRules`, jamais par concaténation manuelle.

---

## 7. Ton et style

Source : guide média §3.

- Naturel, direct, souriant, jamais institutionnel. Phrases courtes, une idée par phrase.
- On s'adresse au public au pluriel : « vocês ».
- Pas de points d'exclamation dans l'interface.
- Pas de jargon produit : ni « plateforme », ni « application », ni « utilisateurs », ni « fonctionnalité ».
- On ne vend pas Cultura : on montre l'information. Une seule mention utilitaire en fin de contenu social.
- Les erreurs expliquent comment corriger : « O título é obrigatório. » plutôt que « Erreur 422 ».
- Les états vides invitent à agir.

---

## 8. Termes interdits → remplacement

| Interdit | Remplacer par |
|---|---|
| publication, post, publicação | annonce culturelle / anúncio cultural |
| compte artiste, conta de artista | compte acteur culturel / conta de agente cultural |
| utilisateurs, utilizadores | le public / quem gosta de cultura |
| plateforme, plataforma | a Cultura / a agenda |
| application, app (copy publique) | a Cultura |
| « Inscrivez-vous », « Inscreva-se » (contenu social) | rien : montrer la fiche existante |
| followers, abonnés | non applicable au MVP |
| story, reel (dans l'interface produit) | nom de la série éditoriale uniquement |
| scraping, agrégation automatique | saisie manuelle / fonte pública |

**Contrôle automatique (P1.4)** : un test échoue si l'une de ces chaînes apparaît dans les catalogues i18n ou le JSX, hors exceptions documentées (cette page de glossaire, `BACKLOG.md`).

---

## 9. Modèles de messages

### États vides

| Contexte | PT-AO | FR | EN |
|---|---|---|---|
| Aucun événement aujourd'hui | Ainda não há eventos hoje em {cidade}. | Aucun événement aujourd'hui à {ville}. | No events today in {city}. |
| Action | Ver a semana completa | Voir la semaine complète | See the full week |
| Aucune annonce | Ainda não há anúncios. | Aucune annonce pour le moment. | No announcements yet. |
| Aucun résultat | Não encontrámos nada para « {termo} ». | Aucun résultat pour « {terme} ». | No results for “{term}”. |
| Hors-ligne | Sem ligação. A mostrar os eventos de ontem. | Hors ligne. Affichage des événements d'hier. | Offline. Showing yesterday's events. |

### Erreurs

| Contexte | PT-AO | FR | EN |
|---|---|---|---|
| Champ requis | {campo} é obrigatório. | {champ} est obligatoire. | {field} is required. |
| Date passée | A data já passou. | La date est déjà passée. | The date has already passed. |
| URL non autorisée | Este link não é permitido. | Ce lien n'est pas autorisé. | This link is not allowed. |
| Action interdite | Não tem permissão para esta ação. | Vous n'avez pas la permission. | You don't have permission. |
| Doublon possible | Já existe um evento parecido. Quer continuar? | Un événement similaire existe. Continuer ? | A similar event exists. Continue? |

### Mention éditoriale obligatoire

- **PT :** « Informação publicada pela equipa Cultura com base numa fonte pública. »
- **FR :** « Information publiée par l'équipe Cultura d'après une source publique. »
- **EN :** “Information published by the Cultura team from a public source.”

---

## 10. Noms propres

Tenir une liste validée (artistes, salles, quartiers, orthographe) dans un fichier maintenu par l'éditeur de contenu, conformément au guide média (annexe F). Cette liste alimente aussi les tests de recherche et les données de seed.

---

## 11. Points à valider par un locuteur angolais

1. « agente cultural » vs « ator cultural » (terme générique).
2. « Gosto » vs « Curtir » pour l'action « j'aime ».
3. « Favorito » vs « Guardar » pour l'action « enregistrer ».
4. « Ecrã », « ligação », « utilizador » : éviter « tela », « conexão », « usuário » (brésilianismes).
5. Orthographe des noms d'artistes, salles et quartiers.
6. « Comuna » et « bairro » : usage local exact dans les formulaires.

---

*Fin du glossaire v0.1 — à valider avant P1.4.*
