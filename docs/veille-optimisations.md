# Veille : aller plus vite et voir plus net

Veille du 2026-11-16, demandée par Kanemonium avant tout nouvel entraînement (décision D-011) : tout ce
qui peut réduire le temps d'entraînement ou de prédiction, tenir dans 8 Go, ou améliorer la qualité des
cartes d'encre. Trois terrains : le code et les propositions de
[ScrollPrize/villa](https://github.com/ScrollPrize/villa), ce que la communauté du défi a publié ou vu
primé, et la littérature hors du défi.

**Comment lire ce document.** Rien ici n'est mesuré chez nous. Les chiffres sont ceux des sources, sur leurs
machines et leurs modèles, presque toujours différents des nôtres. Chaque point porte l'une de ces marques :

- **[vérifié]** : Agent C. a rouvert lui-même la source (code de notre installation, texte de la proposition, page) ;
- **[relevé]** : relevé par un relecteur automatique, source citée mais pas rouverte par Agent C. ;
- **[idée]** : piste à adapter, sans précédent trouvé sur notre problème.

Le relevé complet (211 fiches, avec leurs extraits) est gardé hors dépôt, dans `local/releves/veille/`.

## 1. Ce qui ne coûte qu'un réglage

Ces options existent déjà dans notre installation de villa (commit `2d3fb38`). **[vérifié]** pour leur présence dans le code.

| Levier | Réglage | Ce qu'en dit la source |
|---|---|---|
| Blocs de 256, comme la recette | `"patch_size": [64, 256, 256]`, `"batch_size": 1`, `"grad_acc_steps": 2` | Sur une RTX 3080 de 10 Go sous WSL2 : 0,37 s par itération en lot de 1, 9,5 s en lot de 2 ([villa #2298](https://github.com/ScrollPrize/villa/pull/2298), LynnHenry). **[vérifié]** La nôtre a 8 Go : à mesurer. |
| Savoir où part le temps | `"benchmark": {"enabled": true}` | Mesure intégrée du débit et de l'attente des données. Effet non chiffré. |
| Plus de processus de chargement | `"dataloader_workers": 2` à `4` | Nous sommes à 1. Risque : nos 6,8 Go de mémoire vive. |
| Prédire sans compilation, lot plus grand | `--batch-size 8 --no-compile` | 61,6 s en lot de 4 compilé contre 11,6 à 11,9 s, sur RTX 4090 et un autre modèle ([villa #2428](https://github.com/ScrollPrize/villa/pull/2428), gomyway). **[vérifié]** Notre réglage actuel est justement le lot de 4 compilé. |
| Lire les blocs par des fils, avec un cache | `--loader-threads 8 --chunk-cache-size 64` | 11,6 s ramenés à 10,1 s, même mesure. **[vérifié]** |
| Essayer sur une petite zone | `--roi …` ou `--mask-path zone.tif` | Évite d'attendre 5 h 34 pour juger un réglage. Nous utilisons déjà `--roi`. |
| Moyenne en miroir à la prédiction | `--tta-mirror` | « Plus lent, un peu meilleur » selon le tutoriel. **[relevé]** |
| Plusieurs points de sauvegarde ensemble | `--ensemble-checkpoint …` | Gains chiffrés sur les modèles à 9 µm seulement. **[relevé]** |
| Moyenne glissante des poids | `"ema": {"enabled": true}` | Effet non documenté pour notre modèle. |

Absents du paquet d'encre : `channels_last`, la compilation à l'entraînement, l'export vers un moteur plus
rapide, la moyenne de points de sauvegarde. **[vérifié]** pour `channels_last`.

**Un piège à connaître** : sous WSL2, manquer de mémoire vidéo ne produit pas d'erreur mais un
ralentissement d'environ 25 fois (villa #2298). **[vérifié]** Un essai « qui marche mais rame » peut
simplement déborder.

## 2. Mesurer avant d'améliorer

C'est le manque que tout le reste révèle.

- **Un harnais de validation existe pour notre segment exact**, `w00_20231016151002` :
  [khj1222/vesuvius-challenge](https://github.com/khj1222/vesuvius-challenge), licence MIT, primé 1 000 $.
  Il met de côté des régions annotées entières. Ses constats : une amélioration de moins de 0,03 de F1 est
  du bruit ; le dernier point de sauvegarde n'est pas le meilleur (deux entraînements sur trois culminent à
  17 000 pas sur 20 000) ; l'encre se situe vers les couches 16 à 36 sur 64. Mesuré sur une RTX 5090.
  **[vérifié]** sur sa page d'accueil ; ses commandes exactes sont dans des fichiers non lus.
- **villa sait choisir le meilleur point de sauvegarde** si une zone de validation existe :
  `"best_checkpoint_metric": "val_balanced_accuracy"`. **[vérifié]** dans le code.
- **Une commande d'évaluation est proposée**, qui note séparément la zone de validation et la zone
  d'entraînement ([villa #2210](https://github.com/ScrollPrize/villa/pull/2210), teddywasserman, ouverte).
  Son auteur prévient que noter sur la zone d'entraînement donne 0,99 partout et ne départage rien.
  **[vérifié]** C'est exactement ce que vaut notre Dice de 0,50 mesuré sur X-003.

## 3. Le fond gris de notre modèle

- **Donner au modèle du fond propre à apprendre.** Le tutoriel dit que les pixels de fond comptent autant
  que l'encre dans la zone de supervision. **[relevé]** Notre zone de supervision ne couvre que 5,8 % de
  l'image : l'étendre à du papyrus visiblement vierge est la première chose à essayer.
- **Ne compter dans la perte que ce qui est annoté** (perte partielle) : publié hors du défi, 0,817 de
  Dice avec des annotations en gribouillis contre 0,858 en annotation complète. **[relevé]** villa le fait
  déjà par son masque de supervision.
- **Un papyrus vierge comme contrôle** : un banc d'essai communautaire mesure qu'un modèle marque 5,5 % d'un
  papyrus vierge comme encre, un autre 57,6 %. **[relevé]** Nous n'avons pas ce chiffre pour le nôtre.

## 4. Les deux idées de Kanemonium

**Effacer la trame des fibres (P-350).**

- Des filtres de suppression de rayures par ondelettes et Fourier existent dans les outils de tomographie
  (TomoPy, Sarepy). Aucune application à la trame des fibres n'a été trouvée. **[relevé]**
- L'article le plus proche porte sur le retrait de la trame des toiles sur des radiographies de tableaux
  (Cornelis et al., 2017). Il n'a pas pu être ouvert : à lire.
- Une couche de Fourier a déjà été essayée sur les fragments d'Herculanum en 2023, pour un gain très mince
  (0,47 contre 0,46). **[relevé]** C'était dans le réseau, pas en nettoyage de la carte.
- Un article de 2009 applique un filtrage de Fourier à la restauration d'images de papyrus (Sparavigna).
  Son résumé ne parle pas des fibres. **[vérifié]**
- Donner au réseau des canaux supplémentaires (crêtes, orientation locale) est publié pour d'autres images,
  sans chiffre. **[relevé]**

**Les jeux de lettres grecques (P-360).** Rien de plus que ce que dit la fiche K-28 : utilisable seulement
en aval de la détection.

## 5. Le 3D natif dans 8 Go

Le tutoriel annonce dix heures sur une carte bien plus grosse, pour un résultat « encore loin d'une bonne
lecture » sur un segment jamais vu. **[relevé]** Pistes pour le faire tenir, de la plus simple à la plus lourde :

1. **Accumulation de gradient et précision mixte** : déjà dans villa. **[vérifié]**
2. **Recalculer les étapes intermédiaires au lieu de les garder** (`torch.utils.checkpoint`) : outil de
   PyTorch, sans réécrire le modèle ; gain non chiffré par sa documentation. **[relevé]**
3. **Réseau en U partiellement réversible** (Brügger, Baumgartner, Konukoglu, 2019) : même principe, bâti
   dans l'architecture. Le résumé annonce des économies de mémoire « substantielles » **[vérifié]** ; le
   chiffre de 6 646 Mo ramenés à 4 138 Mo pour des blocs de 128³, à qualité équivalente et 50 % de temps
   en plus, vient du texte complet. **[relevé]**
4. **Convolutions creuses**, qui ne calculent que là où il y a du signal : environ 26 fois moins
   d'opérations sur des scènes d'intérieur. **[relevé]** Incertain chez nous : un rouleau serré est dense.
5. **Modèles plus petits** : les modèles à 9 µm de l'équipe font 34 millions de paramètres, un modèle
   communautaire 5,5 millions, contre 102 pour le nôtre. **[relevé]**

Constat utile de la littérature : à comparaison rigoureuse, les architectures plus récentes ne font pas
mieux qu'un réseau en U à convolutions bien réglé. **[relevé]** Changer d'architecture n'est donc pas la
première chose à faire.

## 6. Ce qui n'a pas marché, selon ceux qui l'ont essayé

Tous **[relevé]**, sur les modèles à 9 µm pour la plupart.

- Agrandir le pas de la fenêtre glissante dégrade la carte : un pas de 48 coûte 0,021 d'AUC, 64 coûte 0,037.
- Moyenner les poids de deux entraînements de graines différentes donne un résultat pire que le hasard.
  Moyenner des points de sauvegarde d'un même entraînement, en revanche, aide.
- L'écart entre rouleaux est un biais, pas de la variance : moyenner deux graines ne rattrape presque rien.
- Les adaptations sans étiquettes essayées (dont un ajustement de spectre) sont sans effet ou nuisibles.
- Filtrer des pseudo-étiquettes par ressemblance retire de la vraie encre.
- Réduire la fenêtre de profondeur à 5 couches accélère de 60 %, mais casse le modèle si la surface est
  décalée.

## 7. Un outil que nous cherchions

Au premier jour, Kanemonium demandait si nous avions utilisé l'outil qui ramène le jeu de données de 92 Go à
2,4 Go. Il existe : c'est la proposition villa #2298, encore ouverte, donc absente de notre installation.
Son texte donne 2,95 Go pour la recette du tutoriel et 2,42 Go avec des blocs de 128. **[vérifié]**

## 8. Ordre d'essai proposé

Du moins cher au plus cher. À décider par Kanemonium.

1. **Mesurer nos réglages gratuits sur une petite zone** : prédiction en lot de 8 sans compilation, fils de
   lecture, puis processus de chargement à l'entraînement avec la mesure intégrée. Quelques minutes par essai.
2. **Installer le harnais de validation** sur notre segment et réentraîner une fois, en gardant le meilleur
   point de sauvegarde. Deux heures. C'est ce qui rend tout le reste mesurable.
3. **Essayer les blocs de 256** en lot de 1 : quelques centaines d'itérations suffisent pour voir si la
   carte tient.
4. **Étendre la zone de supervision au fond propre**, et mesurer avec le harnais.
5. **Effacer la trame** sur la carte de X-003 (T-013), noté avec le harnais.
6. **Le 3D natif**, en commençant par le recalcul des étapes intermédiaires.

## Ce que cette veille ne couvre pas

- Les fils du Discord : non relus pour cette veille.
- Seize pages de propositions villa sur l'encre : cinq lues.
- La plupart des articles : lus par leur résumé seulement.
- Plusieurs dépôts communautaires : début de leur page d'accueil seulement.
- Trois outils vus sur le Discord (offset-sweep, protocole de récupérabilité, moteur inkrs) n'ont pas été
  retrouvés dans les pages du défi.
