import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dataPath = resolve(root, "src/data/writings.json");
const topics = new Set(["memory", "context", "agents"]);
const articleUrlPattern = /^https:\/\/zhuanlan\.zhihu\.com\/p\/(\d+)$/;

function validateArticle(article, label) {
  if (!article || typeof article !== "object" || Array.isArray(article)) {
    throw new Error(`${label} must be an object`);
  }

  const requiredStrings = ["id", "title", "url", "date", "teaser", "source", "topic"];
  for (const key of requiredStrings) {
    if (typeof article[key] !== "string" || !article[key].trim()) {
      throw new Error(`${label}.${key} must be a non-empty string`);
    }
  }

  const urlMatch = article.url.match(articleUrlPattern);
  if (!urlMatch || urlMatch[1] !== article.id || !/^\d+$/.test(article.id)) {
    throw new Error(`${label} must use a canonical Zhihu article URL whose id matches article.id`);
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(article.date)) {
    throw new Error(`${label}.date must use YYYY-MM`);
  }
  if (article.source !== "知乎") {
    throw new Error(`${label}.source must be 知乎`);
  }
  if (!topics.has(article.topic)) {
    throw new Error(`${label}.topic must be memory, context, or agents`);
  }
  if (article.teaser.trim().length < 24 || article.teaser.trim().length > 220) {
    throw new Error(`${label}.teaser must contain 24-220 characters`);
  }

  return {
    id: article.id.trim(),
    title: article.title.trim(),
    url: article.url.trim(),
    date: article.date.trim(),
    teaser: article.teaser.trim(),
    source: "知乎",
    topic: article.topic,
  };
}

async function readData() {
  const parsed = JSON.parse(await readFile(dataPath, "utf8"));
  if (!Array.isArray(parsed.articles)) throw new Error("writings.json articles must be an array");

  const seen = new Set();
  parsed.articles = parsed.articles.map((article, index) => {
    const validated = validateArticle(article, `articles[${index}]`);
    if (seen.has(validated.id)) throw new Error(`duplicate article id in writings.json: ${validated.id}`);
    seen.add(validated.id);
    return validated;
  });
  return parsed;
}

async function atomicWrite(data) {
  const candidatePath = `${dataPath}.candidate`;
  await writeFile(candidatePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  JSON.parse(await readFile(candidatePath, "utf8"));
  await rename(candidatePath, dataPath);
}

const args = process.argv.slice(2);
if (args.includes("--check")) {
  const data = await readData();
  console.log(`VALID ${data.articles.length} notes`);
  process.exit(0);
}

const inputFlag = args.indexOf("--input");
if (inputFlag === -1 || !args[inputFlag + 1]) {
  throw new Error("Usage: node scripts/merge-zhihu-notes.mjs --input <new-articles.json>");
}

const inputPath = resolve(process.cwd(), args[inputFlag + 1]);
const incomingRaw = JSON.parse(await readFile(inputPath, "utf8"));
const incomingArticles = Array.isArray(incomingRaw) ? incomingRaw : incomingRaw.articles;
if (!Array.isArray(incomingArticles)) {
  throw new Error("input must be an article array or an object with an articles array");
}

const data = await readData();
const existingIds = new Set(data.articles.map((article) => article.id));
const incomingIds = new Set();
const additions = incomingArticles.map((article, index) => {
  const validated = validateArticle(article, `incoming[${index}]`);
  if (incomingIds.has(validated.id)) throw new Error(`duplicate incoming article id: ${validated.id}`);
  incomingIds.add(validated.id);
  return validated;
}).filter((article) => !existingIds.has(article.id));

if (additions.length === 0) {
  console.log("NO_CHANGES");
  process.exit(0);
}

data.articles = [...additions, ...data.articles];
await atomicWrite(data);
console.log(`MERGED ${additions.length}`);
