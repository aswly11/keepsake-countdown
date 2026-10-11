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

// Undated photos that get a fixed spot and their own caption instead of a
// generic one. They open the board in the order listed here (oldest first)
// and stay out of the timeline.
const pinnedFirst = [
  { file: '819e2223-0910-4897-bf84-58cc72c95e4b.jpg', caption: "Where your story begins." },
  { file: '549ab911-0665-422d-83b4-79c37554ce84.jpg', caption: "Tiny you, taking it all in." },
  { file: 'ae74627a-ced9-4c45-8cd3-de150aa6f326.jpg', caption: "Little you, big smile." },
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

const files = fs.readdirSync(compressedDir).filter(f => f.toLowerCase().endsWith('.jpg'));

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
  return { type: 'image', src: `data:image/jpeg;base64,${b64}`, caption, dateKey: it.date ? it.date.toISOString().slice(0, 7) : null };
});

// timeline: group dated items by year-month
const groups = new Map();
mediaItems.forEach((m, i) => {
  if (!m.dateKey) return;
  if (!groups.has(m.dateKey)) groups.set(m.dateKey, []);
  groups.get(m.dateKey).push(i);
});
const timeline = Array.from(groups.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([key, idxs]) => ({
    label: formatMonth(new Date(key + '-01T00:00:00Z')),
    count: idxs.length,
    thumbIndex: idxs[0],
  }));

// video
const videoFiles = fs.existsSync(videoDir) ? fs.readdirSync(videoDir).filter(f => f.toLowerCase().endsWith('.mp4')) : [];
videoFiles.forEach(vf => {
  const vbuf = fs.readFileSync(path.join(videoDir, vf));
  const vb64 = vbuf.toString('base64');
  mediaItems.push({ type: 'video', src: `data:video/mp4;base64,${vb64}`, caption: 'A little clip I love rewatching.', dateKey: null });
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
inject('/*__TIMELINE_JSON__*/', timeline);

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

const sizeMB = (Buffer.byteLength(standaloneHtml, 'utf8') / (1024 * 1024)).toFixed(2);
console.log(`Wrote ${standaloneOutPath}, ${pagesOutPath} (GitHub Pages), and ${fragmentOutPath} (for Artifact publish) — ${sizeMB} MB, ${mediaItems.length} media items, ${timeline.length} timeline months`);
