# Contributing

This is a small research repository; issues and pull requests are welcome.

- **One idea per pull request.** Say what changed and how you checked it.
- **Run the checks** before pushing: `npm run verifier` and `npm test`
  (and `ruff check .` / `pytest` once you touch the Python code).
- **No data, no secrets.** Never commit scroll data, model weights or anything from `.env`.
  Record the command that downloads an input instead.
- **Leave a trace.** If a change comes from a finding or a dead end, add or update the
  matching file in `pilotage/pistes/` so the reasoning is kept with the code.

By contributing you agree that your work is released under the MIT license.
