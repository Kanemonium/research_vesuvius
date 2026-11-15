---
id: K-15
langue: en
titre: "The checkpoint"
resume: "What a training run produces: a file holding the model as it is at a given moment. Neither an image nor a reading."
domaine: apprentissage
ordre: 15
pistes: [P-310]
image: img/K-15-checkpoint.svg
source: https://scrollprize.org/tutorial5
date: 2026-11-15
---

# The checkpoint

*What a training run produces: a file holding the model as it is at a given moment. Neither an image nor a reading.*

![A file holding a grid of dots, sliders and a tag; two arrows leave it, one towards a loop, the other towards an image where a letter shows](img/K-15-checkpoint.svg)

## The idea

Training a model means adjusting millions of numbers. The checkpoint is a snapshot of those numbers, written to disk at regular intervals. It is the actual result of two hours of computing.

## How it works

1. **The weights**: all the internal settings of the network. In our file this is about half the room; the other half is the optimiser state.
2. **The optimiser and scheduler state**: what is needed to resume training at the step where this checkpoint was written.
3. **The configuration and the step number**: which settings this model was trained with, and how far.
4. **Two uses**: resume training, or run the model on a segment to get an ink image (inference).

*Numbers refer to the plate.*

## Why it matters here

X-002 wrote 20 checkpoints of 816 MB, one every 1,000 iterations. The last one, `ckpt_020000.pth`, lists 202,467,329 numbers in 500 arrays for the network, of which 101,938,593 are distinct, in 256 arrays (the others are the same ones under a second name), plus as many numbers for the optimiser. We put no weights in the repository (a rule of this project, not of the challenge): they stay on the machine, and what we publish is the command that produces them. The tutorial notes, about its ten-hour native 3D training, that a prediction can be run on an intermediate checkpoint to watch the predictions improve.
