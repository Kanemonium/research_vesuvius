---
id: K-24
langue: en
titre: "Pretraining and transfer"
resume: "Start from a model that has already learned elsewhere, then adjust it to our data, instead of starting from scratch."
domaine: apprentissage
ordre: 24
pistes: [P-320, P-310]
image: img/K-24-pretraining-and-transfer.svg
source: https://github.com/ScrollPrize/villa/blob/2d3fb38d33a18b257230c0bd23986436c3d4722e/scrollprize.org/docs/36_firstscroll.md
date: 2026-11-15
---

# Pretraining and transfer

*Start from a model that has already learned elsewhere, then adjust it to our data, instead of starting from scratch.*

![A model learned elsewhere, its backbone reused, a new head added, then fine-tuning on our labels](img/K-24-pretraining-and-transfer.svg)

## The idea

A model need not start from random values. It can reuse those found by another training run, on other data, and continue from there. This is transfer; the original run is called pretraining.

## How it works

1. **A model trained elsewhere**: for instance on video. A video and a scan volume are both three-dimensional data.
2. **The backbone** of that model, the part extracting shapes, is reused as is.
3. **A new head** is added for our question: is there ink?
4. **Fine-tuning**: training continues on our ink labels.

*Numbers refer to the plate.*

## Why it matters here

The six models that made PHerc. 1667 readable share such a backbone (ResNet3D-50, weights learned on the Kinetics-700 video set), followed by a 2D U-shaped decoder (K-11). In 2023 Youssef Nader adapted the fragment-winning models to scrolls: unsupervised pretraining on scroll data, then fine-tuning on fragment labels.
