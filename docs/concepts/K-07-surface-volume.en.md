---
id: K-07
langue: en
titre: "The surface volume"
resume: "A thick slab cut around the sheet, then laid flat: this is what the ink model looks at."
domaine: depliage
ordre: 7
pistes: [P-310]
image: img/K-07-surface-volume.svg
source: https://scrollprize.org/2026_open_problems
date: 2026-11-14
---

# The surface volume

*A thick slab cut around the sheet, then laid flat: this is what the ink model looks at.*

![A curved sheet with parallel layers on both sides, then those layers stacked flat](img/K-07-surface-volume.svg)

## The idea

The ink signal lies on, or near, the recovered writing surface. So a small thickness of scan is taken on both sides of the sheet and flattened with it.

## How it works

1. **The traced sheet** in the volume (the segment, K-06).
2. **The normals**: at each point, the direction perpendicular to the sheet. The scan is sampled along it, on both sides.
3. **The central layer** is the surface itself.
4. **The stack**: a few dozen flat layers, like a mille-feuille.

*Numbers refer to the plate.*

## Why it matters here

In the tutorial this is the segment's `.zarr` file: the input of the model. A slightly misplaced surface is one of the possible causes of failure listed by the team (P-320).
