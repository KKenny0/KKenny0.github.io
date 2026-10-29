import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

// Originals remain available for full-size viewing and future exports.
const projectSource = await readFile('src/data/projects.ts', 'utf8');
const projects = JSON.parse(projectSource.match(/export const projects: Project\[\] = (\[[\s\S]*?\]);/)[1]);
const sources = new Set([
  '/assets/img/practices/walk.png', '/assets/img/practices/read.png',
  '/assets/img/about/self.png', '/assets/img/about/conference.jpg',
  ...['thousand-brains.png','a2a-cover.png','research-stages.png','kami.png','kami-reading.webp','self-profo.jpg','videowipe-before.jpg','videowipe-after.jpg','online.webp','taste.webp','ai.webp','execution.webp','ai-perch.webp','playground-scenery.png'].map(name=>'/assets/space/'+name),
  ...projects.filter(p => p.focus).map(p => p.focus.src),
]);
await mkdir('public/assets/optimized', { recursive: true });
const manifest = {};
for (const src of sources) {
  const input = `public${src}`;
  const metadata = await sharp(input).metadata();
  const { width, height } = metadata;
  if (src.endsWith('.svg')) {
    manifest[src] = { width, height, src, srcset: '' };
    continue;
  }
  const requested = (src.includes('/practices/') || /\/(online|taste|ai|execution|ai-perch)\.webp$/.test(src)) ? [160, 320, 480]
    : src.includes('/about/') ? [192, 384, 768] : [480, 960, 1520];
  const widths = [...new Set(requested.map(w => Math.min(w, width)))];
  const stem = src.replace('/assets/', '').replace(/\.[^.]+$/, '').replaceAll('/', '-');
  const variants = [];
  for (const w of widths) {
    const target = `/assets/optimized/${stem}-${w}.webp`;
    await sharp(input).resize({ width: w, withoutEnlargement: true }).webp({ quality: 90, effort: 6 }).toFile(`public${target}`);
    variants.push({ src: target, width: w });
  }
  manifest[src] = { width, height, src: variants[1]?.src ?? variants[0].src,
    srcset: variants.map(v => `${v.src} ${v.width}w`).join(', ') };
}
await sharp('public/assets/img/awkward-neck-profile-avatar-v2.png').resize(32, 32).png().toFile('public/assets/optimized/favicon-32.png');
await writeFile('src/data/images.generated.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated responsive images for ${sources.size} assets and a 32px favicon.`);
