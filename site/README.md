# Aliaa's Keepsake Box

A private birthday countdown + memory site for October 22. Single self-contained HTML page — no server, no build step needed to view it.

## Open it

Just open `dist/index.html` in a browser. To share it privately with relatives, publish it as a Claude Artifact (that's how the live link was created) or host the file anywhere that serves static HTML.

## Structure

- `src/template.html` — the actual site (markup, CSS, JS). Edit this file for any content/design change.
- `media/compressed/` — resized/compressed copies of the original photos (checked into git; the originals in the parent folder are not).
- `media/video/` — the video clip, as-is.
- `scripts/resize.ps1` — regenerates `media/compressed/` from the original photos one folder up. Only needed if you add new photos.
- `scripts/build.js` — inlines everything in `media/` as base64 into `src/template.html`, producing `dist/index.html`. Run with `node build.js` from inside `scripts/`.

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
  then re-publish `dist/index.html` to update the live link.

## Known limitations

- The "family word" gate is a friendly speed bump, not real security — there's no way to verify an actual phone number or email for a static page like this. Real privacy comes from only sharing the link with people you trust.
- `IMG_6040.HEIC` from the original folder isn't included — this machine's photo codec could read its metadata but not decode the actual pixels (missing HEVC codec). Convert it to JPEG on a phone and drop it into the parent folder, then re-run `resize.ps1` and `build.js`, to add it.
