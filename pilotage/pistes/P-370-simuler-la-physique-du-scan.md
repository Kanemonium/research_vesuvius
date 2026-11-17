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

Non établie. Rien n'est mesuré, et les affirmations de physique ci-dessous sont écrites de mémoire par Agent C. : elles sont à sourcer (T-018) avant d'entrer dans une fiche.

## Réflexions

- **Kanemonium** (2026-11-17) : simuler la diffraction du « graphite + papyrus » et du « graphite + encre », récupérer les vecteurs de déplacement des pixels de chaque simulation, faire la différence, et voir si la matrice des différences fait apparaître l'encre. Ce n'est qu'une simulation, mais comme il ne faut qu'une différence, pas besoin d'être pile sur la réalité physique. Si les valeurs théoriques manquent, se contenter d'un ordre (laquelle est plus grande que l'autre).
- **Kanemonium** (2026-11-17) : peut-on simplifier par une convolution, quitte à projeter en 2,5D ? Simuler dans toutes les directions pour lever le flou, puis reconstruire une version nette du rouleau, par exemple par lancer de rayons. Déduire la teneur des cas corrigés par les papyrologues, puis étendre.
- **Agent C.** (2026-11-17) : ce qui tient, à sourcer. Le « déplacement » existe : c'est la réfraction, que le contraste de phase rend visible (K-05). Les grandeurs théoriques existent aussi et se calculent à partir de la composition et de la densité d'une matière : une pour l'absorption, une pour le décalage de l'onde. Et oui, la simplification par convolution existe déjà : dans le cas simple d'une seule matière, retrouver la phase revient à appliquer un filtre à l'image. La 2,5D convient.
- **Agent C.** (2026-11-17) : la limite principale. Une simulation ne rend que ce qu'on y met. La différence entre encre et papyrus n'apparaîtra dans nos volumes que si le scanner l'a enregistrée ; simuler ne recrée pas une information perdue à la mesure. Or le papyrus carbonisé et l'encre sont tous deux du carbone (K-02) : une « teneur en graphite » risque d'être la même des deux côtés. Ce qui peut différer est la densité ou la structure fine, pas l'élément.
- **Agent C.** (2026-11-17) : deuxième limite. Refaire le calcul du scanner dans toutes les directions demande les projections d'origine, pas le volume déjà reconstruit. À vérifier : sont-elles publiées, et les volumes du défi ont-ils déjà reçu le filtre de phase ? Sans elles, il reste le défloutage du volume lui-même (déconvolution), qui est une convolution inverse.
- **Agent C.** (2026-11-17) : trois formes que l'idée peut prendre chez nous, de la moins chère à la plus lourde. (1) Calculer sur le volume des grandeurs inspirées de la physique (bords, courbure, profil en profondeur) et mesurer si elles séparent l'encre étiquetée du fond : c'est P-380. (2) Poser de l'encre simulée sur du vrai papyrus pour fabriquer des exemples d'entraînement dont le corrigé est connu. (3) Déflouter un morceau de volume et regarder si le dépliage ou l'encre y gagnent.

## Suite

T-018 : sourcer la physique (valeurs théoriques pour le carbone, filtre de phase, disponibilité des projections) avant tout calcul. La forme (1) est mesurée dans P-380. Rien n'est mesuré.
