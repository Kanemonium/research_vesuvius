---
id: P-370
titre: "Simuler la physique du scan pour séparer l'encre du papyrus"
type: piste
domaine: encre
statut: a-explorer
parent: P-300
date: 2026-11-17
---

## Constat

Idée de Kanemonium. Ne plus chercher l'encre par la valeur d'un pixel comparée à l'ensemble, mais donner à chaque pixel une grandeur physique (sa « teneur »), en simulant ce que le faisceau de rayons X devient dans le papyrus seul et dans le papyrus encré, puis en regardant la différence. La même simulation, faite dans toutes les directions comme le scanner, pourrait aussi rendre nettes les zones floues (P-110) et aider le dépliage.

## Cause racine

Non établie. Rien n'est mesuré. Les premières remarques d'Agent C. ci-dessous étaient écrites de mémoire ; elles ont été sourcées le jour même, et corrigées là où les sources disaient autre chose (fiches K-29 à K-32).

## Réflexions

- **Kanemonium** (2026-11-17) : simuler la diffraction du « graphite + papyrus » et du « graphite + encre », récupérer les vecteurs de déplacement des pixels de chaque simulation, faire la différence, et voir si la matrice des différences fait apparaître l'encre. Ce n'est qu'une simulation, mais comme il ne faut qu'une différence, pas besoin d'être pile sur la réalité physique. Si les valeurs théoriques manquent, se contenter d'un ordre (laquelle est plus grande que l'autre).
- **Kanemonium** (2026-11-17) : peut-on simplifier par une convolution, quitte à projeter en 2,5D ? Simuler dans toutes les directions pour lever le flou, puis reconstruire une version nette du rouleau, par exemple par lancer de rayons. Déduire la teneur des cas corrigés par les papyrologues, puis étendre.
- **Agent C.** (2026-11-17) : ce qui tient, à sourcer. Le « déplacement » existe : c'est la réfraction, que le contraste de phase rend visible (K-05). Les grandeurs théoriques existent aussi et se calculent à partir de la composition et de la densité d'une matière : une pour l'absorption, une pour le décalage de l'onde. Et oui, la simplification par convolution existe déjà : dans le cas simple d'une seule matière, retrouver la phase revient à appliquer un filtre à l'image. La 2,5D convient.
- **Agent C.** (2026-11-17) : la limite principale. Une simulation ne rend que ce qu'on y met. La différence entre encre et papyrus n'apparaîtra dans nos volumes que si le scanner l'a enregistrée ; simuler ne recrée pas une information perdue à la mesure. Or le papyrus carbonisé et l'encre sont tous deux du carbone (K-02) : une « teneur en graphite » risque d'être la même des deux côtés. Ce qui peut différer est la densité ou la structure fine, pas l'élément.
- **Agent C.** (2026-11-17) : deuxième limite. Refaire le calcul du scanner dans toutes les directions demande les projections d'origine, pas le volume déjà reconstruit. À vérifier : sont-elles publiées, et les volumes du défi ont-ils déjà reçu le filtre de phase ? Sans elles, il reste le défloutage du volume lui-même (déconvolution), qui est une convolution inverse.
- **Agent C.** (2026-11-17) : trois formes que l'idée peut prendre chez nous, de la moins chère à la plus lourde. (1) Calculer sur le volume des grandeurs inspirées de la physique (bords, courbure, profil en profondeur) et mesurer si elles séparent l'encre étiquetée du fond : c'est P-380. (2) Poser de l'encre simulée sur du vrai papyrus pour fabriquer des exemples d'entraînement dont le corrigé est connu. (3) Déflouter un morceau de volume et regarder si le dépliage ou l'encre y gagnent.
- **Agent C.** (2026-11-17), après lecture des sources. Ce qui est confirmé : les deux nombres d'une matière se calculent à partir de sa formule et de sa densité (K-29), et retrouver la phase est bien un filtre, donc une convolution (K-30).
- **Agent C.** (2026-11-17), ce que j'ignorais. Sur les scans récents faits à l'ESRF, l'équipe a déjà appliqué ce filtre, puis redonné de la netteté, avant de reconstruire ([Angelotti, Parsons, Nicolardi et al., 2026](https://arxiv.org/abs/2606.29085)). La même prépublication dit que, sur PHerc. Paris. 4 scanné avec le protocole optimisé, l'encre est directement visible dans le volume, en dépôts clairs à la surface. Une différence mesurable existe donc au moins dans ces scans-là ; nous ne savons pas de quel scan vient le segment du tutoriel.
- **Agent C.** (2026-11-17), ce qui est fermé. Les projections brutes ne sont pas partagées ([ScrollPrize/open-data](https://github.com/ScrollPrize/open-data)) : refaire le calcul du scanner dans toutes les directions n'est pas faisable sur les rouleaux (K-31). Exception à vérifier : un rouleau d'essai fabriqué par l'équipe, dont les photos brutes seraient publiées.
- **Agent C.** (2026-11-17), sur la diffraction. Nous n'avons trouvé aucun travail qui sépare l'encre du papyrus carbonisé par diffraction ; une cartographie de diffraction a accompagné l'étude du plomb dans l'encre ([ESRF, 2016](https://www.esrf.fr/home/UsersAndScience/Publications/Highlights/highlights-2016/XNP/XNP04.html)), sans que nous ayons pu lire ce qu'elle a montré. Ce n'est pas une preuve d'absence. De toute façon, nos volumes n'enregistrent pas de figure de diffraction : seulement une valeur par voxel.
- **Agent C.** (2026-11-17), ce qui est retenu et ce qui ne l'est pas. Retenu : la forme (1), mesurée dans P-380 par T-017 ; la forme (3), le défloutage du volume, gardée comme essai possible avec ses réserves (K-32). En attente : la forme (2), l'encre simulée ; un projet de la communauté fabrique déjà des échantillons d'encre ([Seth Stewart, Ink Generator](https://github.com/StewartSethA/VesuviusInkGenerator)), que nous n'avons pas lu. Non retenu : recalculer le scan depuis les projections, et une « teneur en graphite » par pixel, puisque l'encre et le papyrus ont presque la même densité ([ESRF, 2015](https://www.esrf.fr/home/UsersAndScience/Publications/Highlights/highlights-2015/cbs/cbs10.html)).

## Suite

Fiches : K-29 (les deux nombres d'une matière), K-30 (le filtre de phase), K-31 (projections et reconstruction), K-32 (flou et déconvolution). T-018 reste ouverte pour ce qui n'est pas trouvé : de quel scan vient notre segment et ce qu'il a subi, des tables au-delà de 30 keV, le rouleau d'essai et ses photos brutes. La forme (1) est mesurée dans P-380. Rien n'est mesuré.
