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

At midnight on October 22 (Cairo time) the page switches to its birthday version: the countdown reads zero and the nav shows "It's today!". The birthday version stays up through October 28, then the page goes back to counting down to the next birthday.

Open `dist/preview-birthday.html` to see it before the day.

## To change things

- **Family PIN**: search for `FAMILY_PIN` near the top of the `<script>` in `src/template.html`. It's currently `221098` (22-10-98).
- **The photo behind the whole page**: `BACKDROP_PHOTO` in the `<script>` of `src/template.html`, a file name from `media/compressed/`. It's blurred and veiled in cream; how much is `blur(...)` and the `70%` in the `#backdrop` CSS.
- **The photos behind the countdown**: `COUNTDOWN_PHOTOS` in the `<script>` of `src/template.html` — four file names from `media/compressed/`, for the days, hours, minutes and seconds cells in that order.
- **The line under the countdown**: in the markup, `#hero-line` in `src/template.html`. It types itself out when the page opens; the speeds are `HERO_LINE_PACE` in the `<script>`.
- **The age under the countdown**: the age she's turning, with a photo between its two digits, the way the 2021 page showed it. The photo changes every `AGE_PACE` milliseconds (3 seconds), going through `AGE_PHOTOS` in the same file, in that order — file names from `media/compressed/`, picked because they sit well in a circle. If none are found, the banner is left off.
- **The typed lines above the photos**: `STORY_LINES` in the same file, typed in that order, each erased before the next (the last one stays on screen), beside the photo named in `STORY_PHOTO` (the first time Ahmed saw her). That photo is left off the board so it doesn't show twice; its caption is in `pinnedFirst` in `scripts/build.js`. The typing speeds are in `STORY_PACE`.
- **The poem under the story**: its couplets are in the markup, in the `.poem` block right after the story, each `<p class="bayt">` holding its two halves. The photo beside it is `POEM_PHOTO` in the `<script>`; like the story's photo, it's left off the board.
- **The short poems and their carousels** (طفلةُ المانجا, شايُ ما بعدَ الغداء, بداية بالطاعة, بحرُ علياء, إلى بلوتو, then إلى زوجتي علياء, under the first poem): each poem is in the markup, in its `.poem-wrap` block next to its carousel. The photos each carousel turns through are in `CAROUSELS` in the `<script>`, keyed by the carousel's id, in that order, and are left off the board. Their captions are the usual ones from `scripts/build.js` (`pinnedFirst`, or the month for dated photos). How long each photo stays up is `CAROUSEL_PACE`. To add another, copy a `.poem-wrap.short` block with a new carousel id and add that id to `CAROUSELS`. A carousel's frame is portrait (3:4) unless it has the `square` class, which the umrah one uses since some of its photos are landscape.
- **The notes at the end** (لولي ابنتي, then Hoda's, Heba's, Najwa's and Mohamed's): in the markup, each a `.poem.letter` block after the last poem, one `<p>` per line (`.long` for a long one, set smaller and right-aligned). Each types itself out when it scrolls into view; the speeds are `LETTER_PACE`. Their photos are `carousel-letter`, `carousel-hoda`, `carousel-heba`, `carousel-najwa` and `carousel-mohamed` (a `wide` 3:2 frame, for its landscape photos) in `CAROUSELS`, captioned in `pinnedFirst` in `scripts/build.js`.
- **Photo captions and order**: `pinnedFirst` in `scripts/build.js` gives particular photos their own caption; all of those are now beside the story or in a carousel rather than on the board. Any other photo with a date in its file name is captioned with its month; the rest get a caption from `genericCaptions`. The board shows dated photos oldest first, then the undated ones.
- **Leaving a photo off the page**: add its `media/compressed/` file name (or a video's `media/video/` file name) to `leftOut` in `scripts/build.js`. Don't just delete the file — `resize.ps1` would bring it back from the original. Every photo that isn't beside the story or a poem is currently left out, so the board under the poems is empty; a new photo that's neither left out nor in a carousel shows up there.
- **How long the birthday version stays up**: `BIRTHDAY_MODE_DAYS` in the same file (7 = the 22nd through the 28th).
- After any edit to `src/template.html`, `media/`, or new photos, re-run:
  ```
  cd scripts
  node build.js
  ```
  then push to `master` (GitHub Pages serves `docs/` on `master` at https://aswly11.github.io/keepsake-countdown/ and rebuilds on every push) and/or re-publish `dist/artifact-fragment.html` to update the Claude Artifact link.

## Known limitations

- The "family word" gate is a friendly speed bump, not real security — there's no way to verify an actual phone number or email for a static page like this. Real privacy comes from only sharing the link with people you trust.
- This repo is **public** (GitHub Pages' free tier only serves Pages from public repos), so the photos and letter text are technically discoverable via GitHub itself, not just via the site link — same content the gate already relied on client-side obscurity for, just also reachable through the repo browser now.
- `IMG_6040.HEIC` from the original folder isn't included — this machine's photo codec could read its metadata but not decode the actual pixels (missing HEVC codec). Convert it to JPEG on a phone and drop it into the parent folder, then re-run `resize.ps1` and `build.js`, to add it.
