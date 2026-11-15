---
id: K-22
langue: en
titre: "Depth ambiguity and 3D ink"
resume: "A flat label does not say how deep the ink is. Marking ink voxel by voxel could reduce that ambiguity, when ink can be seen."
domaine: encre
ordre: 22
pistes: [P-330, P-250]
image: img/K-22-depth-ambiguity-3d-ink.svg
source: https://github.com/ScrollPrize/villa/blob/2d3fb38d33a18b257230c0bd23986436c3d4722e/scrollprize.org/docs/37_2026_open_problems.md
date: 2026-11-15
---

# Depth ambiguity and 3D ink

*A flat label does not say how deep the ink is. Marking ink voxel by voxel could reduce that ambiguity, when ink can be seen.*

![A flat label, a stack of layers with ink at an unknown depth, a projection, then ink marked voxel by voxel](img/K-22-depth-ambiguity-3d-ink.svg)

## The idea

The scan is a volume; ink labels are images. Something is missing in between: within the thickness of the papyrus, where exactly is the signal?

## How it works

1. **The label** is flat: white where there is ink.
2. **The volume** has thickness: the ink is in one of these layers, which one is unknown.
3. **The usual setting** (2.5D, K-12): the model looks at the block as a volume, then collapses depth to return a flat image.
4. **Direct 3D segmentation**: marking ink voxel by voxel in the volume, when it is visible enough.

*Numbers refer to the plate.*

## Why it matters here

In 2026, on a 2.4 µm scan of PHerc. Paris. 4, ink is directly visible in the volume and could be segmented in 3D; projected onto the page it matches the text read in 2023. It is a cleaner target than flat labels. But the team warns that not every scroll will behave this way, that the released model is specific to this scroll, and that densely labelled 3D data is the bottleneck. A volumetric ink model, with no segmentation or flattening, had already received a prize in April 2024.
