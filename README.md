# research_vesuvius

Open research notebook and tooling for the [Vesuvius Challenge](https://scrollprize.org):
reading the carbonized Herculaneum scrolls without opening them.

*Version française : [README.fr.md](README.fr.md).*

This repository is worked on in the open, from day one. It holds four things:

| Folder | What it is |
|---|---|
| [`pilotage/`](pilotage/) | The research record: every path explored, why, what blocked it, what was decided. Plain Markdown and YAML, versioned with the code. |
| [`src/vesuvius_lab/`](src/vesuvius_lab/), [`experiments/`](experiments/) | The research code and one folder per experiment (config, command, result). |
| [`docs/concepts/`](docs/concepts/) | Short illustrated notes on each idea we run into (papyrology, scanning, ink detection), in English and French. |
| [`ihm/`](ihm/) | A local cockpit ("Hephaist'OS") that reads `pilotage/` and the GitHub activity and shows them as a map, a task board and a forecast. |

## Status

Day one. No model has been trained and no result is claimed yet.
The next step is the official ink detection tutorial on one segment of PHerc. Paris. 4.

## Run the cockpit

Requires Node.js 22 or later.

```bash
npm ci
npm run ihm
```

Then open <http://127.0.0.1:4173>. The GitHub panel needs a token in `.env`
(see [`.env.example`](.env.example)); everything else works without one.

## Checks

```bash
npm run verifier   # the research record is consistent (ids, links, statuses)
npm test           # unit tests of the record loader
```

## Data

No scroll data is stored here. Scans, segments and labels are downloaded from the
official sources (the Vesuvius Challenge S3 bucket and Hugging Face) into `data/`,
which is ignored by git. Each experiment records the exact command used to fetch its inputs.

## License and challenge rules

Code and documentation are released under the [MIT license](LICENSE), as the challenge
requires a permissive license for any prize-winning method. Scroll data belongs to its
respective institutions and is governed by the Vesuvius Challenge data terms;
see [`docs/defi.md`](docs/defi.md) for the rules this project follows.

## Acknowledgements

Built on the work of the Vesuvius Challenge team and community, in particular the
[`ScrollPrize/villa`](https://github.com/ScrollPrize/villa) repository.
Research assistance by Claude (Anthropic), acting here as "Agent C.".
