# Design système « Cendre »

Le design système de Hephaist'OS, l'IHM du projet. Les jetons sont dans
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

1. **L'orange « cristal » désigne ce qui est en cours.** Dans les statuts, les liens et les
   rubans, il ne sert qu'à ça.
2. **Pointillé = structure, trait plein = actif.** Une piste à explorer est un contour en
   pointillé ; une piste en cours ou validée est pleine. La règle vient d'Épure.
   Trois états ont leur couleur et leur signe : **orange qui pulse** = en cours,
   **vert coché** = validé ou fait, **losange bleu** = décision.
3. **Les emblèmes disent de quoi il s'agit, jamais dans quel état.** L'éventail de couleurs
   franches est réservé à l'identité : une vue, un domaine, un type d'objet.
4. **La couleur ne porte jamais seule une information.** Un statut a toujours un signe
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
| `--valide` | `#2C9A57` | `#3DB26B` | validé, fait — toujours avec une coche blanche |
| `--decision` | `#2F7FD6` | `#4B9BEF` | décision — toujours un losange |

Le thème Carbone n'est pas une inversion automatique : chaque valeur est choisie.

### L'éventail (emblèmes)

| Jeton | Valeur | | Jeton | Valeur |
|---|---|---|---|---|
| `--ev-nuit` | `#2B3654` | | `--ev-violet` | `#9B3DF0` |
| `--ev-braise` | `#F0593A` | | `--ev-pre` | `#3FB56F` |
| `--ev-soleil` | `#F7C93B` | | `--ev-rose` | `#F27BB3` |
| `--ev-ciel` | `#4BA6F5` | | `--ev-turquoise` | `#22B8B0` |

En thème Carbone, seul `--ev-nuit` s'éclaircit (`#4A5A8C`) pour rester visible sur fond sombre.

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
| `.embleme` | pastille colorée d'identité (voir ci-dessous) |
| `.lien-id` | lien interne vers un identifiant, précédé de l'emblème de son onglet |
| carte à liseré (`.tache`, `.etape-corps`, `.exe-carte`, `.note`, `.bilan-carte`) | bord gauche **plat** de 4 px qui dit le statut ou le genre ; arrondis sur les coins droits seulement |
| `.glisse` | deux volets côte à côte ; le premier sort par la gauche quand on ouvre le second |
| `.credit` + `.portrait` | lien vers GitHub précédé de la photo de profil de l'auteur (rond de 18 px) ; posé seul sur tout lien GitHub du carnet. Sert à citer le travail des autres |
| `.avancement` | barre de progression d'une exécution : orange en cours, verte terminée, rouge arrêtée ; l'état est aussi écrit dessous |
| `.journal-bouton` | ouvre le journal : un témoin qui émet une onde tant que l'exécution tourne, vert une fois terminée |
| `.journal-fenetre` | fenêtre du journal, mise à jour toutes les secondes et demie pendant l'exécution |
| `.code-bloc` + `.notes` | extrait de code numéroté et, à sa droite, les notes qui l'expliquent ; survoler une note éclaire ses lignes |

### Le nom et le logo

L'outil s'appelle **Hephaist'OS** (D-007). Agent C. est l'assistant, pas l'outil. Le logo, une
enclume et sa flamme en pixels fournie par Kanemonium, est `ihm/public/logo.png` ; il est
affiché sans lissage (`image-rendering: pixelated`). Il ramène à l'accueil, qui n'est pas un onglet.

## Emblèmes

Définis dans [`ihm/public/emblemes.js`](../ihm/public/emblemes.js). Une pastille ronde sur une
grille 32 × 32, trois à cinq aplats, aucun contour fin : lisible dès 20 px.

| Famille | Emblèmes |
|---|---|
| Vues | `carte` (nœuds), `taches` (case cochée), `executions` (invite de commande), `github` (branche), `horizon` (soleil levant), `doc` (livre ouvert) ; `cap` (boussole) reste dessiné mais l'accueil s'ouvre par le logo |
| Domaines | `defi` (volcan), `scan` (faisceau), `depliage` (spirale et feuille à plat), `encre` (goutte), `apprentissage` (trois neurones reliés), `outils` (écrou), `pilotage` (cible) |
| Objets | `boite`, `mouvement`, `probleme`, `livrable`, `prix` |

Un emblème accompagne toujours un texte : il aide à repérer, il ne remplace pas le libellé.
Le nombre de jours de l'accueil est le seul texte en relief ; il se recalcule à chaque jour.

## Planches des fiches

Chaque fiche de `docs/concepts/` a une planche SVG de 640 × 360 : fond papier, aplats de
l'éventail, **aucun texte**, des repères numérotés (rond noir, chiffre blanc) repris dans la
liste « Comment ça marche ». Une planche sert ainsi aux deux langues et reste lisible sur GitHub.
Le fond papier est fixe : en thème Carbone, la planche apparaît comme une page imprimée.

## Visualisations

- **Carte radiale** (`vues/carte.js`). Le défi au centre ; un secteur par domaine, nommé sur une
  bande d'encre ; un créneau angulaire par piste ; le libellé sur le pourtour. Rond = piste,
  losange = décision. Elle occupe tout l'écran sous la barre, sans barre de défilement : molette
  pour zoomer, glisser pour déplacer, double-clic pour recentrer. Une piste en cours émet une
  onde et sa branche scintille. Une vue « Liste » donne le même contenu sous forme d'arbre.
- **Rubans** (`vues/horizon.js`). Problèmes → livrables → prix. L'épaisseur dit la confiance
  (faible, moyenne, forte). Survoler un élément éclaire toute sa chaîne. Un livrable dont une
  tâche est en cours porte une bordure orange qui tourne ; un livrable fait, une bordure verte.
- **Parcours d'une tâche** (`vues/taches.js`). Étapes numérotées et bugs sur un fil pointillé.
  Une étape porte un rond numéroté, un bug le triangle d'alerte et une étiquette rouge ; l'état
  est toujours écrit (Faite, Corrigé, Contourné, Ouvert).
- **Code annoté** (`vues/executions.js`). Le code sur fond sombre dans les deux thèmes, numéros de
  ligne du fichier d'origine. Chaque note a un genre, dit par un mot et une pastille de l'éventail :
  paramétrage (ciel), architecture (violet), optimisation (braise), données (turquoise), mesure (pré).
- **Courbes** (`vues/executions.js`). Une seule série par courbe, trait d'encre de 2 px, grille
  discrète, valeur exacte au survol ou au clavier. Deux mesures d'échelles différentes font deux
  courbes côte à côte, jamais deux axes.
- **Frise** (`vues/horizon.js`). D'aujourd'hui au 25 juin 2027 : drapeaux noirs pour les
  échéances fixes, losanges pour les fins de mois, ronds pour les livrables projetés.

## Accessibilité

Tout nœud de la carte et tout point de la frise est atteignable au clavier et porte un nom
lisible par un lecteur d'écran. Les transitions de confort se coupent avec `prefers-reduced-motion` ; les animations d'état et le
glissement du tableau des tâches, demandés par Kanemonium, restent.
La mise en page tient jusqu'à 375 px de large.
