---
id: P-420
titre: "Entraîner avec 8 Go de mémoire vidéo"
type: piste
domaine: outils
statut: en-cours
parent: P-400
date: 2026-11-14
---

## Constat

Notre carte est une RTX 3080 Laptop avec 8 Go de mémoire vidéo. Nous ne savons pas encore si la recette du tutoriel y tient.

## Cause racine

Mesurée le 2026-11-14. Avec les blocs de 256 du tutoriel, la mémoire vidéo est saturée (7 996 Mo sur 8 192) et chaque itération prend 21,7 secondes. Avec des blocs de 128, elle retombe à 4 895 Mo et la vitesse est multipliée par 66. La lenteur vient donc de la saturation, pas de la puissance de la carte. Explication probable, non vérifiée directement : mémoire vidéo pleine, le pilote Windows déborde sur la mémoire ordinaire.

## Réflexions

- **Agent C.** (2026-11-14) : relevé depuis Ubuntu, 1,9 Go sur les 8 Go sont déjà pris par l'affichage de Windows : il reste environ 6 Go pour l'entraînement. Le tutoriel prévoit le cas : passer à un lot de 1, ou réduire les blocs à 64 × 128 × 128. WSL ne reçoit par défaut que 6 Go de mémoire vive sur les 13,7 de la machine.

- **Agent C.** (2026-11-14) : un second mur est apparu avant celui-ci, la mémoire vive. Le segment est une image de 32 249 × 51 380 pixels ; le programme atteint 4,4 Go rien qu'en chargeant les étiquettes, et le système l'a tué. Contourné par 12 Go de fichier d'échange dans Ubuntu (`scripts/wsl/ajouter-echange.sh`).
- **Agent C.** (2026-11-14) : ce que les mesures ne disent pas. Soixante itérations ne jugent pas la qualité ; des blocs de 128 voient moins de contexte que des blocs de 256, effet inconnu.
- **Agent C.** (2026-11-14, soir) : l'entraînement complet est allé au bout avec des blocs de 128 : 20 000 itérations en 1 h 53 min 51 s, 4 959 Mo de mémoire vidéo au plus. La question « est-ce que ça tient » a sa réponse. Celle de la qualité n'en a pas : sans zone de validation dans la configuration, villa saute la validation et n'écrit aucun aperçu. La perte d'entraînement passe de 0,514 à 0,393 en moyenne, l'essentiel de la baisse sur les 5 000 dernières itérations.
- **Agent C.** (2026-11-16) : lu sur le Discord du défi, dans un fil du forum d'encre. L'auteur du modèle Reader v2 (pseudonyme KLAVIS) y explique que lancer un modèle entraîné sur des carreaux de 128 avec une fenêtre plus grande change la carte produite, parce que ses couches de normalisation prennent leurs statistiques de la fenêtre reçue. Notre modèle utilise le même type de couche (`InstanceNorm3d`, relevé dans le journal de X-002) et a été entraîné sur des blocs de 128 au lieu des 256 de la recette. Conséquence à garder en tête : nos résultats ne sont pas ceux du tutoriel « en plus petit », et une prédiction doit se faire à la taille de bloc de l'entraînement. Non vérifié chez nous.
- **Agent C.** (2026-11-17) : tri des points de sauvegarde, décidé par Kanemonium. Une archive compressée ne gagnait que 7 % (815 Mo ramenés à 758 Mo, mesuré sur un fichier). Gardés : l'itération 20 000 de X-002 ; les itérations 19 000 et 20 000 de X-008 et le fichier gardé par villa. Supprimés : 37 fichiers, 29 Go dans Ubuntu. La place libre sur C: n'a pas bougé : le disque virtuel de WSL ne rétrécit pas seul, il faut le compacter, WSL arrêté.
- **Agent C.** (2026-11-17) : premier essai de compactage, avec l'accord de Kanemonium : le mode « sparse » de WSL (`wsl --manage … --set-sparse true`), puis `fstrim`. Sans effet mesuré : le fichier occupe toujours 144,6 Go. Mode retiré, WSL remis dans son état d'origine. Reste la méthode classique, `diskpart` en administrateur, que seul Kanemonium peut lancer.

## Suite

T-004 faite. Prochaine étape, T-005 : produire une prédiction et la regarder. Pour comparer honnêtement 128 et 256, il faudra d'abord une zone de validation mise de côté.
