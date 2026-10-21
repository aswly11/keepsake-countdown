# Aliaa's Keepsake Box

A private birthday countdown + memory site for October 22. Single self-contained HTML page — no server, no build step needed to view it.

## Open it

Double-click `dist/index.html` (or open it from a browser's File > Open) — it's a complete, self-contained page, no server needed.

## Structure

- `src/template.html` — the actual site (markup, CSS, JS). Edit this file for any content/design change. It's a *fragment* (no `<html>`/`<head>`/`<body>`) by design — see below.
- `media/compressed/` — resized/compressed copies of the original photos (checked into git; the originals in the parent folder are not). The `gift2021_*` ones are the 15 photos from the 2021 birthday page (the `aliaaBirthdayGift` repo, `aliaaBirthday/wwwroot/img/Screenshot_1..15.png`), numbered as they were there.
- `media/video/` — the video clip, as-is.
- `scripts/resize.ps1` — regenerates `media/compressed/` from the original photos (`.jpg`, `.jpeg`, `.png`) one folder up. Only needed if you add new photos.
- `scripts/build.js` — inlines everything in `media/` as base64 into `src/template.html`, producing these copies of the built page:
  - `site/dist/index.html` — a complete standalone HTML document. Open this one locally.
  - `site/dist/artifact-fragment.html` — the raw fragment, for publishing through the Claude Artifact tool (which wraps fragments in its own document shell — publishing the standalone file there would double-wrap it).
  - `docs/index.html` (repo root) — same as `dist/index.html`, kept here so GitHub Pages can serve it (Pages only serves from a repo's root or its `/docs` folder).
  - `site/dist/preview-birthday.html` — a local-only copy whose clock is set to October 22, for checking the birthday version ahead of time. Git-ignored, never published.

  Run with `node build.js` from inside `scripts/`.

## What happens on the 22nd

At midnight on October 22 (Cairo time) the page switches to its birthday version: the countdown reads zero, the letter in "The 22nd" section unlocks, and a "Surprise" section with a gift box to open appears right under the countdown (plus a "Surprise" link in the nav). Before that, the section and its link are hidden. The birthday version stays up through October 28, then the page goes back to counting down to the next birthday.

Open `dist/preview-birthday.html` to see it before the day.

## To change things

- **Family PIN**: search for `FAMILY_PIN` near the top of the `<script>` in `src/template.html`. It's currently `221098` (22-10-98).
- **Birthday surprise**: the `SURPRISE` object in the same file — `{ title, photo, body }`, shown when the gift box is opened. `photo` is a file name from `media/compressed/`; it appears between the two digits of her age at the top of the note, the way the 2021 page showed it. If the file isn't found, the note just shows without that banner.
- **The typed lines above the photos**: `STORY_LINES` in the same file, typed in that order, each erased before the next (the last one stays on screen), beside the photo named in `STORY_PHOTO` (the first time Ahmed saw her). That photo is left off the board so it doesn't show twice; its caption is in `pinnedFirst` in `scripts/build.js`. The typing speeds are in `STORY_PACE`.
- **The poem under the story**: its couplets are in the markup, in the `.poem` block right after the story, each `<p class="bayt">` holding its two halves. The photo beside it is `POEM_PHOTO` in the `<script>`; like the story's photo, it's left off the board.
- **Photo captions and order**: `pinnedFirst` in `scripts/build.js` lists the photos that open the board, each with its own caption. Any other photo with a date in its file name is captioned with its month; the rest get a caption from `genericCaptions`.
- **How long the birthday version stays up**: `BIRTHDAY_MODE_DAYS` in the same file (7 = the 22nd through the 28th).
- After any edit to `src/template.html`, `media/`, or new photos, re-run:
  ```
  cd scripts
  node build.js
  ```
  then push to `main` (the GitHub Pages site auto-updates from `docs/`) and/or re-publish `dist/artifact-fragment.html` to update the Claude Artifact link.

## Known limitations

- The "family word" gate is a friendly speed bump, not real security — there's no way to verify an actual phone number or email for a static page like this. Real privacy comes from only sharing the link with people you trust.
- This repo is **public** (GitHub Pages' free tier only serves Pages from public repos), so the photos and letter text are technically discoverable via GitHub itself, not just via the site link — same content the gate already relied on client-side obscurity for, just also reachable through the repo browser now.
- `IMG_6040.HEIC` from the original folder isn't included — this machine's photo codec could read its metadata but not decode the actual pixels (missing HEVC codec). Convert it to JPEG on a phone and drop it into the parent folder, then re-run `resize.ps1` and `build.js`, to add it.
