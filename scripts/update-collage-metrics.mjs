// Refresh the collage's public GitHub snapshots without exposing credentials to visitors.
// Failed requests retain their last successful value and timestamp.
import {execFileSync} from 'node:child_process';
import {readFile, writeFile, rename} from 'node:fs/promises';

const file = new URL('../src/data/collage-metrics.json', import.meta.url);
const repos = ['Cinnamon/kotaemon', 'KKenny0/obsidian-kami', 'KKenny0/videowipe', 'KKenny0/script-weaver'];
let snapshot;
try { snapshot = JSON.parse(await readFile(file, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; snapshot = {}; }
let failures = 0;
for (const repo of repos) {
  try {
    const response = execFileSync('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '25', '-H', 'Accept: application/vnd.github+json', '-H', 'User-Agent: collage-snapshot', `https://api.github.com/repos/${repo}`], {encoding: 'utf8'});
    const data = JSON.parse(response);
    if (data.full_name?.toLowerCase() !== repo.toLowerCase() || !Number.isSafeInteger(data.stargazers_count) || data.stargazers_count < 0) throw new Error('Unexpected repository response');
    snapshot[repo] = {stars: data.stargazers_count, fetchedAt: new Date().toISOString()};
    console.log(`${repo}: ${data.stargazers_count} stars`);
  } catch (error) {
    failures++;
    console.error(`${repo}: refresh failed; retaining previous snapshot if available (${error.message})`);
  }
}
// The community site renders the theme's count in its details table. Check both
// page identity and the unique labeled field so a changed page fails closed.
const themeUrl = 'https://community.obsidian.md/themes/kami-reader';
const pluginStatsUrl = 'https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json';
for (const [key, url, parse] of [
  ['kami-reader-theme-downloads', themeUrl, html => {
    if (!html.includes('<link rel="canonical" href="https://community.obsidian.md/themes/kami-reader"/>') || !html.includes('<title>Kami Reader - Obsidian Theme</title>')) throw new Error('Unexpected theme page');
    const matches = [...html.matchAll(/<div class="text-muted">Downloads<\/div><div class="">([\d,]+)<\/div>/g)];
    if (matches.length !== 1 || !/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(matches[0][1])) throw new Error('Theme downloads field missing or ambiguous');
    return Number(matches[0][1].replaceAll(',', ''));
  }],
  ['kami-reader-companion-downloads', pluginStatsUrl, body => JSON.parse(body)['kami-reader-companion']?.downloads]
]) {
  try {
    const body = execFileSync('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '25', '-H', 'User-Agent: collage-snapshot', url], {encoding: 'utf8', maxBuffer: 20 * 1024 * 1024});
    const downloads = parse(body);
    if (!Number.isSafeInteger(downloads) || downloads < 0) throw new Error('Unexpected downloads count');
    snapshot[key] = {downloads, fetchedAt: new Date().toISOString(), source: url};
    console.log(`${key}: ${downloads} downloads`);
  } catch (error) {
    failures++;
    console.error(`${key}: refresh failed; retaining previous snapshot if available (${error.message})`);
  }
}
const temporary = new URL('./collage-metrics.json.tmp', file);
await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n');
await rename(temporary, file);
if (failures) process.exitCode = 1;
