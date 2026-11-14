---
id: K-06
langue: en
titre: "Virtual unwrapping"
resume: "Find the sheet inside the volume, follow it, then flatten it on screen, without touching the scroll."
domaine: depliage
ordre: 6
pistes: [P-200, P-210, P-220]
image: img/K-06-virtual-unwrapping.svg
source: https://scrollprize.org/2026_open_problems
date: 2026-11-14
---

# Virtual unwrapping

*Find the sheet inside the volume, follow it, then flatten it on screen, without touching the scroll.*

![Three steps: one wrap located in a slice, a curved mesh, then the flattened sheet](img/K-06-virtual-unwrapping.svg)

## The idea

The scan gives a block of matter, not a sheet. Virtual unwrapping means finding where the sheet runs, following it step by step, then laying it flat so that writing can be looked for.

## How it works

1. **Locate**: in each slice, a model predicts where the written surface of each wrap lies.
2. **Follow**: a mesh is built, a grid of points that hugs the sheet in 3D. The resulting piece is called a segment.
3. **Flatten**: each point is given a 2D position, with as little distortion as possible.

*Numbers refer to the plate.*

## Why it matters here

This is the subject of the Grand Prize. Three errors keep coming back: holes, two neighbouring sheets merged, and a jump from one sheet to the next. A single one is enough to mix two passages of the text. We leave this area aside to begin with (D-001).
