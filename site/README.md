# Aliaa's Keepsake Box

A private birthday countdown + memory site for October 22. Single self-contained HTML page — no server, no build step needed to view it.

## Open it

Double-click `dist/index.html` (or open it from a browser's File > Open) — it's a complete, self-contained page, no server needed.

## Structure

- `src/template.html` — the actual site (markup, CSS, JS). Edit this file for any content/design change. It's a *fragment* (no `<html>`/`<head>`/`<body>`) by design — see below.
- `media/compressed/` — resized/compressed copies of the original photos (checked into git; the originals in the parent folder are not).
- `media/video/` — the video clip, as-is.
- `scripts/resize.ps1` — regenerates `media/compressed/` from the original photos one folder up. Only needed if you add new photos.
- `scripts/build.js` — inlines everything in `media/` as base64 into `src/template.html`, producing two files in `dist/`:
  - `dist/index.html` — a complete standalone HTML document (`<!doctype>`, `<head>` with a viewport tag, etc). **This is the one to open locally or host anywhere.**
  - `dist/artifact-fragment.html` — the raw fragment, for publishing through the Claude Artifact tool (which wraps fragments in its own document shell — publishing the standalone file there would double-wrap it).

  Run with `node build.js` from inside `scripts/`.

## To change things

- **Family PIN**: search for `FAMILY_PIN` near the top of the `<script>` in `src/template.html`. It's currently `221098` (22-10-98).
- **Letters**: the `LETTERS` array in the same file — each is `{ title, body }`.
- **28 Reasons**: the `REASONS` array — plain strings, edit freely (some are guesses about her habits — fix anything that isn't true!).
- **Wishes email**: hardcoded to `aswly98@gmail.com` in `setupWishes()`.
- After any edit to `src/template.html`, `media/`, or new photos, re-run:
  ```
  cd scripts
  node build.js
  ```
  then re-publish `dist/artifact-fragment.html` to update the live link.

## Known limitations

- The "family word" gate is a friendly speed bump, not real security — there's no way to verify an actual phone number or email for a static page like this. Real privacy comes from only sharing the link with people you trust.
- `IMG_6040.HEIC` from the original folder isn't included — this machine's photo codec could read its metadata but not decode the actual pixels (missing HEVC codec). Convert it to JPEG on a phone and drop it into the parent folder, then re-run `resize.ps1` and `build.js`, to add it.
