# Design système « Cendre »

Le design système de l'IHM d'Agent C. Les jetons sont dans
[`ihm/public/styles/tokens.css`](../ihm/public/styles/tokens.css), les composants dans
[`app.css`](../ihm/public/styles/app.css).

## D'où il vient

Il synthétise dix références fournies par Kanemonium, et reprend le substrat du système Épure
(papier crème, encre, cristal orange) pour rester cohérent avec ses autres projets.

| Référence | Ce qui en est retenu |
|---|---|
| Affiches éditoriales (titres géants, fond crème, carré orange) | le titre géant en capitales serrées, le carré orange qui porte une donnée, les mentions en coin |
| Fiches « 50 plugins », « 5 UX laws » | pilules à contour, numéros dans un rond noir, filets fins, hiérarchie par la taille |
| Gestionnaire de mots de passe | cartes arrondies douces, liste à gauche et détail à droite |
| Rubans de flux | la vue Horizon : des rubans relient problèmes, livrables et prix |
| Sommets et dangerosité | les étiquettes noires à texte blanc en capitales étroites |
| Cercle UNESCO, Wind & Words, cercle de mobilité | la carte radiale : secteurs en bandes, libellés tournés sur le pourtour, liens courbes |
| Sphère du Covid | la frise en bas de page, les libellés en caractères à chasse fixe |
| Les trois références sombres | le thème « Carbone » |

## Trois règles

1. **L'orange désigne ce qui est en cours.** Nulle part ailleurs. Si de l'orange apparaît,
   c'est qu'il se passe quelque chose à cet endroit.
2. **Pointillé = structure, trait plein = actif.** Une piste à explorer est un contour en
   pointillé ; une piste en cours ou validée est pleine. La règle vient d'Épure.
3. **La couleur ne porte jamais seule une information.** Un statut a toujours un signe
   (rond vide, rond plein, croix, losange) et un libellé. Le domaine d'une piste se lit à sa
   position et au nom écrit sur la bande, pas à une teinte.

## Jetons

### Couleurs

| Rôle | Papier | Carbone | Emploi |
|---|---|---|---|
| `--papier` | `#F9F7F3` | `#1A1816` | fond |
| `--surface` | `#FFFDFA` | `#24211E` | cartes |
| `--papier-creux` | `#F1EEE7` | `#141211` | colonnes, zones en retrait |
| `--encre` | `#2E2B28` | `#F2EEE7` | texte, formes pleines |
| `--encre-60` | `#6B645E` | `#B1AAA2` | texte secondaire |
| `--encre-40` | `#928982` | `#8C847C` | trait actif |
| `--structure` | `#BBB5B0` | `#5E5852` | trait de structure, pointillé |
| `--filet` | `#E2DDD5` | `#35312D` | séparateurs |
| `--cristal` | `#D9843F` | `#E8975A` | **en cours** (aplats) |
| `--cristal-fonce` | `#A95E1E` | `#F3B27E` | en cours (texte, contours) |
| `--alerte` | `#C9553A` | `#E8795F` | impasse, bloqué — toujours avec une croix |

Le thème Carbone n'est pas une inversion automatique : chaque valeur est choisie.
Les cinq pastels d'Épure (`--cat-*`) ne servent qu'aux pictos de navigation.

### Typographie

| Jeton | Police | Emploi |
|---|---|---|
| `--f-titre` | Inter Tight 700–900 | titres ; `.geant` et `.grand` en capitales, interlettrage négatif |
| `--f-cond` | Barlow Condensed 500–600 | étiquettes, navigation, libellés de la carte (capitales espacées) |
| `--f-mono` | JetBrains Mono | identifiants, dates, mentions (`.meta`) |
| `--f-texte` | Inter | texte courant |

### Forme

Rayons `--rayon` 14 px (cartes) et `--rayon-petit` 8 px ; pilules à 999 px ; espacements sur
une échelle 4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 ; une seule ombre, très diffuse.

## Composants

| Classe | Rôle |
|---|---|
| `.geant`, `.grand`, `.titre`, `.cond`, `.meta` | niveaux typographiques |
| `.carte` | surface de contenu |
| `.pilule[data-statut]` | statut, avec son signe |
| `.etiquette` | bloc noir à texte blanc (identifiants, drapeaux) |
| `.numero` | chiffre dans un rond noir |
| `.bouton`, `.bouton.discret`, `.bouton.mini` | actions |
| `.champ` | saisie |
| `.liste` | lignes séparées par un filet |
| `.bulle` | aperçu au survol et au focus clavier |
| `.ep-picto` | pictos Épure de la navigation (24 × 24, trait 1,3) |

## Visualisations

- **Carte radiale** (`vues/carte.js`). Le défi au centre ; un secteur par domaine, nommé sur une
  bande d'encre ; un créneau angulaire par piste ; le libellé sur le pourtour. Rond = piste,
  losange = décision. Une vue « Liste » donne le même contenu sous forme d'arbre.
- **Rubans** (`vues/horizon.js`). Problèmes → livrables → prix. L'épaisseur dit la confiance
  (faible, moyenne, forte). Survoler un élément éclaire toute sa chaîne.
- **Frise** (`vues/horizon.js`). D'aujourd'hui au 25 juin 2027 : drapeaux noirs pour les
  échéances fixes, losanges pour les fins de mois, ronds pour les livrables projetés.

## Accessibilité

Tout nœud de la carte et tout point de la frise est atteignable au clavier et porte un nom
lisible par un lecteur d'écran. Les animations se coupent avec `prefers-reduced-motion`.
La mise en page tient jusqu'à 375 px de large.
