# Concepts

Short illustrated notes on the ideas this project runs into: what each one is, how it works, and why it matters for reading the scrolls. Each note exists in English and in French.

*Fiches illustrées sur les notions rencontrées dans ce projet. Chaque fiche existe en français et en anglais.*

| | English | Français |
|---|---|---|
| K-01 | [The papyrus scroll](K-01-papyrus-scroll.en.md) | [Le rouleau de papyrus](K-01-papyrus-scroll.fr.md) |
| K-02 | [Carbon ink](K-02-carbon-ink.en.md) | [L'encre au carbone](K-02-carbon-ink.fr.md) |
| K-03 | [X-ray tomography](K-03-x-ray-tomography.en.md) | [La tomographie à rayons X](K-03-x-ray-tomography.fr.md) |
| K-04 | [Voxels and resolution](K-04-voxel-and-resolution.en.md) | [Le voxel et la résolution](K-04-voxel-and-resolution.fr.md) |
| K-05 | [Phase contrast](K-05-phase-contrast.en.md) | [Le contraste de phase](K-05-phase-contrast.fr.md) |
| K-06 | [Virtual unwrapping](K-06-virtual-unwrapping.en.md) | [Le dépliage virtuel](K-06-virtual-unwrapping.fr.md) |
| K-07 | [The surface volume](K-07-surface-volume.en.md) | [Le volume de surface](K-07-surface-volume.fr.md) |
| K-08 | [Ink detection](K-08-ink-detection.en.md) | [La détection d'encre](K-08-ink-detection.fr.md) |
| K-09 | [Pseudo-labelling](K-09-pseudo-labeling.en.md) | [Le pseudo-étiquetage](K-09-pseudo-labeling.fr.md) |
| K-10 | [Chunked data](K-10-chunked-data.en.md) | [Les données par morceaux](K-10-chunked-data.fr.md) |
| K-11 | [The U-shaped network](K-11-u-net.en.md) | [Le réseau en U](K-11-u-net.fr.md) |
| K-12 | [The patch and "2.5D"](K-12-patch-and-2-5d.en.md) | [Le bloc et le « 2,5D »](K-12-patch-and-2-5d.fr.md) |
| K-13 | [Loss and learning rate](K-13-loss-and-learning-rate.en.md) | [La perte et le taux d'apprentissage](K-13-loss-and-learning-rate.fr.md) |
| K-14 | [Mixed precision](K-14-mixed-precision.en.md) | [La précision mixte](K-14-mixed-precision.fr.md) |
| K-15 | [The checkpoint](K-15-checkpoint.en.md) | [Le point de sauvegarde](K-15-checkpoint.fr.md) |
| K-16 | [Held-out validation](K-16-held-out-validation.en.md) | [La validation tenue à l'écart](K-16-held-out-validation.fr.md) |
| K-17 | [villa, the shared repository of the challenge](K-17-villa.en.md) | [villa, le dépôt commun du défi](K-17-villa.fr.md) |
| K-18 | [Crackle](K-18-crackle.en.md) | [Le craquelé](K-18-crackle.fr.md) |
| K-19 | [Fragments and ground truth](K-19-fragment-ground-truth.en.md) | [Le fragment et la vérité terrain](K-19-fragment-ground-truth.fr.md) |
| K-20 | [Cross-scroll generalisation](K-20-cross-scroll-generalisation.en.md) | [La généralisation entre rouleaux](K-20-cross-scroll-generalisation.fr.md) |
| K-21 | [Hallucination and window size](K-21-hallucination-window.en.md) | [L'hallucination et la taille de fenêtre](K-21-hallucination-window.fr.md) |
| K-22 | [Depth ambiguity and 3D ink](K-22-depth-ambiguity-3d-ink.en.md) | [L'ambiguïté de profondeur et l'encre en 3D](K-22-depth-ambiguity-3d-ink.fr.md) |
| K-23 | [Learning without labels](K-23-learning-without-labels.en.md) | [Apprendre sans étiquettes](K-23-learning-without-labels.fr.md) |
| K-24 | [Pretraining and transfer](K-24-pretraining-and-transfer.en.md) | [Le pré-entraînement et le transfert](K-24-pretraining-and-transfer.fr.md) |
| K-25 | [TimeSformer](K-25-timesformer.en.md) | [TimeSformer](K-25-timesformer.fr.md) |
| K-26 | [The Dice score](K-26-dice-score.en.md) | [Le score Dice](K-26-dice-score.fr.md) |
| K-27 | [The papyrus weave, and how to remove it](K-27-papyrus-weave-removal.en.md) | [La trame du papyrus, et comment l’effacer](K-27-papyrus-weave-removal.fr.md) |
| K-28 | [Greek letter datasets](K-28-greek-letter-datasets.en.md) | [Les jeux de lettres grecques](K-28-greek-letter-datasets.fr.md) |

Facts come from the [Vesuvius Challenge](https://scrollprize.org) site as read on 2026-11-14; each note links its source.
Notes K-11 to K-16 cover the training code: they also rely on the `ScrollPrize/villa` source at commit `2d3fb38` and on our own measured runs (`experiments/`).
The same notes are shown in the cockpit under the "Doc" tab (`npm run ihm`).
Notes K-18 to K-24 cover what the community has achieved on ink detection and what remains open: they rely on the scrollprize.org pages kept in `ScrollPrize/villa` (`scrollprize.org/docs/`) at commit `2d3fb38`, read on 2026-11-15.
Notes K-25 and K-26 go back to the original sources: the TimeSformer paper (arXiv:2102.05095) and the code of `ScrollPrize/villa` that uses it (`deprecated/ink-detection/`), and the Dice score as used in villa's ink loss.
Notes K-27 and K-28 describe two untested ideas of ours (removing the papyrus weave from an ink map; using Greek letter datasets downstream of ink detection). K-27 also relies on the Wikipedia article "Image noise" for periodic noise and notch filtering, K-28 on the AL-PUB v2 dataset page (Apache 2.0).
