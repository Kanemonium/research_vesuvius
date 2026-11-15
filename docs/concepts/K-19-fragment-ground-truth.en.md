---
id: K-19
langue: en
titre: "Fragments and ground truth"
resume: "A detached piece where the ink can be seen: the place where both the scan and a photo serving as the answer key exist."
domaine: encre
ordre: 19
pistes: [P-250, P-320]
image: img/K-19-fragment-ground-truth.svg
source: https://github.com/ScrollPrize/villa/blob/2d3fb38d33a18b257230c0bd23986436c3d4722e/scrollprize.org/docs/26_grandprize.md
date: 2026-11-15
---

# Fragments and ground truth

*A detached piece where the ink can be seen: the place where both the scan and a photo serving as the answer key exist.*

![A detached fragment, its infrared photo, its scan, then the aligned pair used for training](img/K-19-fragment-ground-truth.svg)

## The idea

A fragment is a piece of scroll whose written face is exposed. It can be photographed and scanned. The photo says where the ink is; the scan is what the model will see. Together they make a corrected example: the ground truth.

## How it works

1. **The fragment**: detached from the scroll, its writing is visible.
2. **The photo**, often infrared, where ink stands out.
3. **The scan** of the same fragment, where ink can barely be told apart.
4. **Alignment** of both: for each area of the scan we know whether there is ink. This is the training pair.

*Numbers refer to the plate.*

## Why it matters here

Stephen Parsons showed on fragments that machine learning can recover ink, and the 2023 Kaggle competition used them. Two limits: these models did not seem to work on the flattened segments of a closed scroll, and a photo only gives a flat label, not the depth at which ink sits (K-22). In a closed scroll no such truth exists, hence pseudo-labelling (K-09).
