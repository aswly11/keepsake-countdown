// Builds site/dist/index.html by inlining every compressed photo/video from
// site/media as base64 data URIs into site/src/template.html.
// Run with: node build.js   (from anywhere; paths are relative to this file)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const compressedDir = path.join(root, 'media', 'compressed');
const videoDir = path.join(root, 'media', 'video');
const templatePath = path.join(root, 'src', 'template.html');
// dist/index.html — a complete standalone document, for opening the file
// directly or hosting it anywhere. dist/artifact-fragment.html — the raw
// fragment (no <html>/<head>/<body>), for publishing via the Claude Artifact
// tool, which wraps fragments in its own document skeleton automatically.
const standaloneOutPath = path.join(root, 'dist', 'index.html');
const fragmentOutPath = path.join(root, 'dist', 'artifact-fragment.html');

const genericCaptions = [
  "Just us, being us.",
  "This one made me smile for days.",
  "Still my favorite view.",
  "A little moment I never want to forget.",
  "You, in your most you.",
  "Caught you smiling again.",
  "One of my favorites of you.",
  "This day, exactly like this.",
  "Simple. Happy. Us.",
  "I could look at this all day.",
  "A memory I keep coming back to.",
  "You make ordinary days feel like this.",
];

// Undated photos that get their own caption instead of a generic one. None of
// them are on the board any more: they're all shown beside the typed story or
// in a poem's carousel (CAROUSELS in src/template.html).
const pinnedFirst = [
  // in the carousel beside the mango poem
  { file: '819e2223-0910-4897-bf84-58cc72c95e4b.jpg', caption: "Where your story begins." },
  { file: '549ab911-0665-422d-83b4-79c37554ce84.jpg', caption: "Tiny you, taking it all in." },
  { file: 'ae74627a-ced9-4c45-8cd3-de150aa6f326.jpg', caption: "Little you, big smile." },
  // The photos from the 2021 birthday page (the aliaaBirthdayGift repo), in
  // that page's order, all in the carousel beside the Pluto poem except where
  // noted. Its one dated photo, gift2021_03_2021-05-02.jpg, is left out of
  // this list so it's captioned with its month like any dated photo.
  { file: 'gift2021_01.jpg', caption: "By the water, all calm." },
  // in the carousel beside the sea poem
  { file: 'gift2021_02.jpg', caption: "Golden hour, that hat." },
  { file: 'gift2021_04.jpg', caption: "Best seat in the café." },
  { file: 'gift2021_05.jpg', caption: "The one from your 23rd." },
  { file: 'gift2021_06.jpg', caption: "That laugh of yours." },
  { file: 'gift2021_07.jpg', caption: "Flawless. Still true." },
  { file: 'gift2021_08.jpg', caption: "This smile, exactly." },
  { file: 'gift2021_09.jpg', caption: "Mid-study selfie break." },
  // beside the typed story
  { file: 'gift2021_10.jpg', caption: "The first time I saw you." },
  { file: 'gift2021_11.jpg', caption: "Perfection. I saw it." },
  { file: 'gift2021_12.jpg', caption: "All dressed up." },
  { file: 'gift2021_13.jpg', caption: "Smart and beautiful." },
  { file: 'gift2021_14.jpg', caption: "You and that donut." },
  { file: 'gift2021_15.jpg', caption: "Scarf season." },
  // in the carousel beside the letter (لولي ابنتي)
  { file: 'wedding_day_selfie.jpg', caption: "On your wedding day." },
  { file: 'letter_2.jpg', caption: "Cheek to cheek." },
  { file: 'letter_3.jpg', caption: "The same smile, twice." },
  { file: 'letter_4.jpg', caption: "Side by side." },
  // in the carousel beside Hoda's note (الملكة علياء)
  { file: 'WhatsApp_Image_2026-10-21_at_7_52_01_PM__1_.jpg', caption: "Matching in pink." },
  { file: 'WhatsApp_Image_2026-10-21_at_7_52_01_PM.jpg', caption: "Sisters, always." },
];

// Photos in media/compressed (and videos in media/video) that are left off the
// page entirely. Listed here rather than deleted, since resize.ps1 would
// regenerate the photos from the originals.
const leftOut = [
  'WhatsApp_Image_2026-09-04_at_10_05_52_AM.jpg',
  // the same Madinah photo as IMG_2304__1_.jpg, which the umrah carousel shows
  'photo_5780788018209213033_y.jpg',
  // the last of the board, taken off it
  'gift2021_03_2021-05-02.jpg',
  'IMG-20241118-WA0012.jpg',
  'IMG-20241123-WA0003.jpg',
  'photo_5780788018209213034_y.jpg',
  'VID-20240210-WA0014.mp4',
  // WhatsApp originals of wedding_day_selfie.jpg and letter_2..4.jpg, in case
  // a full resize.ps1 run ever compresses them under these names too
  'WhatsApp_Image_2026-10-21_at_8_17_25_PM.jpg',
  'WhatsApp_Image_2026-10-21_at_8_25_18_PM.jpg',
  'WhatsApp_Image_2026-10-21_at_8_25_18_PM__1_.jpg',
  'WhatsApp_Image_2026-10-21_at_8_25_18_PM__2_.jpg',
];

function extractDate(name) {
  let m = name.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = name.match(/(20\d{2})(\d{2})(\d{2})/);
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return new Date(Date.UTC(y, mo - 1, d));
  }
  return null;
}

function formatMonth(d) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

const files = fs.readdirSync(compressedDir).filter(f => f.toLowerCase().endsWith('.jpg') && !leftOut.includes(f));

const items = files.map(f => {
  const full = path.join(compressedDir, f);
  const pin = pinnedFirst.findIndex(p => p.file === f);
  const date = pin === -1 ? extractDate(f) : null;
  return { file: f, full, date, pin };
});

pinnedFirst.forEach(p => {
  if (!files.includes(p.file)) console.warn('Pinned photo not found in media/compressed:', p.file);
});

items.sort((a, b) => {
  if (a.pin !== -1 || b.pin !== -1) {
    if (a.pin === -1) return 1;
    if (b.pin === -1) return -1;
    return a.pin - b.pin;
  }
  if (a.date && b.date) return a.date - b.date;
  if (a.date) return -1;
  if (b.date) return 1;
  return a.file.localeCompare(b.file);
});

let capIdx = 0;
const mediaItems = items.map(it => {
  const buf = fs.readFileSync(it.full);
  const b64 = buf.toString('base64');
  const caption = it.pin !== -1 ? pinnedFirst[it.pin].caption
    : it.date ? formatMonth(it.date)
    : genericCaptions[capIdx++ % genericCaptions.length];
  // file: lets the page pick out one specific photo (the age banner and the carousels do)
  return { type: 'image', file: it.file, src: `data:image/jpeg;base64,${b64}`, caption };
});

// video
const videoFiles = fs.existsSync(videoDir) ? fs.readdirSync(videoDir).filter(f => f.toLowerCase().endsWith('.mp4') && !leftOut.includes(f)) : [];
videoFiles.forEach(vf => {
  const vbuf = fs.readFileSync(path.join(videoDir, vf));
  const vb64 = vbuf.toString('base64');
  mediaItems.push({ type: 'video', file: vf, src: `data:video/mp4;base64,${vb64}`, caption: 'A little clip I love rewatching.' });
});

let html = fs.readFileSync(templatePath, 'utf8');

function inject(marker, jsonValue) {
  if (!html.includes(marker)) {
    console.error('Marker not found in template:', marker);
    process.exit(1);
  }
  html = html.replace(marker, JSON.stringify(jsonValue));
}

inject('/*__MEDIA_ITEMS_JSON__*/', mediaItems);

// pull the <title> out so it can sit in a real <head> for the standalone doc
const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
const title = titleMatch ? titleMatch[1] : "Aliaa's Keepsake Box";
const fragmentBody = titleMatch ? html.slice(titleMatch[0].length) : html;

const standaloneHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
</head>
<body>
${fragmentBody}
</body>
</html>
`;

fs.mkdirSync(path.dirname(standaloneOutPath), { recursive: true });
fs.writeFileSync(fragmentOutPath, html, 'utf8');
fs.writeFileSync(standaloneOutPath, standaloneHtml, 'utf8');

// keep the GitHub Pages copy (repo-root docs/index.html) in sync too
const pagesOutPath = path.join(root, '..', 'docs', 'index.html');
fs.mkdirSync(path.dirname(pagesOutPath), { recursive: true });
fs.writeFileSync(pagesOutPath, standaloneHtml, 'utf8');

// dist/preview-birthday.html — a local-only copy for checking the birthday
// version ahead of time: the same page, but its clock starts at 9am Cairo
// time on the coming October 22. Git-ignored, so it never gets published.
const previewOutPath = path.join(root, 'dist', 'preview-birthday.html');
const buildTime = Date.now();
let previewAt = Date.UTC(new Date(buildTime).getUTCFullYear(), 9, 22, 7);
if (previewAt < buildTime) previewAt = Date.UTC(new Date(buildTime).getUTCFullYear() + 1, 9, 22, 7);
const previewClock = `<script>(function(){var R=Date,off=${previewAt}-R.now();window.Date=class extends R{constructor(){if(arguments.length===0){super(R.now()+off)}else{super(...arguments)}}static now(){return R.now()+off}};})();</script>`;
const previewBanner = '<div style="position:fixed;left:0;right:0;bottom:0;z-index:999;padding:8px 12px;background:#2c1a30;color:#fffaf2;font:13px/1.4 system-ui,sans-serif;text-align:center">Preview only — this is how the page will look on October 22</div>';
const previewHtml = standaloneHtml
  .replace('</head>', () => previewClock + '\n</head>')
  .replace('<body>', () => '<body>\n' + previewBanner);
fs.writeFileSync(previewOutPath, previewHtml, 'utf8');

const sizeMB = (Buffer.byteLength(standaloneHtml, 'utf8') / (1024 * 1024)).toFixed(2);
console.log(`Wrote ${standaloneOutPath}, ${pagesOutPath} (GitHub Pages), and ${fragmentOutPath} (for Artifact publish) — ${sizeMB} MB, ${mediaItems.length} media items`);
console.log(`Wrote ${previewOutPath} (local birthday preview, not published)`);
