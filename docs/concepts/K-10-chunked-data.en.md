---
id: K-10
langue: en
titre: "Chunked data"
resume: "A full-resolution scroll is too big to simply download to a laptop: only the small block that is needed gets read."
domaine: outils
ordre: 10
pistes: [P-310, P-410]
image: img/K-10-chunked-data.svg
source: https://scrollprize.org/2026_open_problems
date: 2026-11-14
---

# Chunked data

*A full-resolution scroll is too big to simply download to a laptop: only the small block that is needed gets read.*

![A volume cut into blocks with a single one coloured, a pyramid of resolutions, and a cloud sending one block to a computer](img/K-10-chunked-data.svg)

## The idea

The challenge volumes are stored in a cloud-friendly format, OME-Zarr. The volume is cut into small independent blocks and kept at several resolutions.

## How it works

1. **Chunks**: to read a region, only the chunks involved are loaded.
2. **The pyramid**: the same volume at full resolution, then halved, quartered… to look from afar without loading everything.
3. **Remote reading**: tools fetch chunks straight from the challenge's public storage.

*Numbers refer to the plate.*

## Why it matters here

This is what spares contributors from copying tens of terabytes locally, which would shut most of them out. The ink tutorial downloads a single segment, about 25 GB, not the whole scroll. Any tool we write will have to read this way, in chunks, to be useful to others.
