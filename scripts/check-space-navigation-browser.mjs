import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

// Serve dist after npm run build, then pass the static server URL to this check.
const [base, playwright = 'playwright'] = process.argv.slice(2);
const {chromium} = createRequire(import.meta.url)(playwright);
const browser = await chromium.launch({channel:'chrome',ignoreDefaultArgs:['--disable-back-forward-cache']});
const results = [];
const path = page => new URL(page.url()).pathname + new URL(page.url()).search + new URL(page.url()).hash;
const expectPath = (page, expected) => assert.equal(path(page), expected);
async function hydrated(page) {
  await page.locator('astro-island[ssr]').waitFor({state:'detached'});
  await page.waitForFunction(() => document.querySelector('.pb-language')?.href.includes(location.search));
}
async function visit(page, target) {
  await page.goto(base + target);
  await hydrated(page);
}
async function row(page, selector, scroll = false) {
  const link = page.locator(selector).first();
  await link.scrollIntoViewIfNeeded();
  if (scroll) await link.evaluate(element => element.scrollIntoView({block:'center'}));
  const state = await link.evaluate(element => ({id:element.id, scroll:window.scrollY}));
  await link.press('Enter');
  await hydrated(page);
  return state;
}
async function restored(page, selector, query, state) {
  await hydrated(page);
  await page.waitForFunction(id => document.activeElement?.id === id, state.id, {timeout:3000});
  assert.equal(await page.locator(selector).inputValue(), query);
  assert.ok(Math.abs(await page.evaluate(() => window.scrollY) - state.scroll) <= 2);
}
async function check(name, run) {
  const page = await browser.newPage({viewport:{width:1100,height:520}});
  page.setDefaultTimeout(8000);
  try { await run(page); results.push(`PASS ${name}`); }
  catch(error) { results.push(`FAIL ${name}\n${error.stack}`); process.exitCode = 1; }
  finally { await page.close(); }
}

try {
  for (const slug of ['tracework','weave']) {
    await check(`${slug} case/support round trip and translated return`, async page => {
      await visit(page, '/lens/taste/');
      await page.locator('main a[href*="/projects/?from=taste"]').click();
      await hydrated(page);
      await page.locator('#project-search').fill(slug);
      const state = await row(page, `#${slug}`);
      expectPath(page, `/work/${slug}/?from=projects&via=taste`);
      await page.locator('.pb-language').click();
      await hydrated(page);
      expectPath(page, `/zh/work/${slug}/?from=projects&via=taste`);
      await page.locator(`main a[href*="/projects/${slug}/"]`).click();
      expectPath(page, `/zh/projects/${slug}/?from=work&via=projects&origin=taste`);
      assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).search, '');
      await page.locator('[data-story-support]').click();
      expectPath(page, `/zh/support/?project=${slug}&via=projects&origin=taste`);
      await page.locator('.legacy-settings summary').click();
      await page.locator('[data-language]').click();
      expectPath(page, `/support/?project=${slug}&via=projects&origin=taste`);
      await page.locator('[data-support-back]').click();
      expectPath(page, `/projects/${slug}/?from=work&via=projects&origin=taste#case`);
      await page.locator('.legacy-settings summary').click();
      await page.locator('[data-language]').click();
      expectPath(page, `/zh/projects/${slug}/?from=work&via=projects&origin=taste#case`);
      await page.locator('.legacy-settings summary').click();
      await page.locator('[data-language]').click();
      await page.locator('[data-project-back]').first().click();
      await hydrated(page);
      expectPath(page, `/work/${slug}/?from=projects&via=taste`);
      await page.waitForFunction(() => document.activeElement?.matches('[data-story-link]'));
      assert.equal(await page.locator(':focus').getAttribute('href'), `/projects/${slug}/?from=work&via=projects&origin=taste`);
      await page.locator('.pb-back').click();
      expectPath(page, '/projects/?from=taste');
      await restored(page, '#project-search', slug, state);
      await row(page, `#${slug}`);
      await page.locator('.pb-language').click();
      await hydrated(page);
      await page.locator('.pb-back').click();
      expectPath(page, '/zh/projects/?from=taste');
      await restored(page, '#project-search', slug, state);
      await visit(page, '/zh/projects/?from=taste');
      assert.equal(await page.locator('#project-search').inputValue(), '');
    });
  }
  await check('Writing inline and top return restore the same list', async page => {
    const index = '/notes/?from=ai&topic=ai';
    await visit(page, index);
    await page.locator('#writing-search').fill('ai');
    const selector = '.writing-rows li:nth-child(4) a';
    const state = await row(page, selector, true);
    await page.locator('.space-writing-detail .space-links a[data-scene]').click();
    expectPath(page, index);
    await restored(page, '#writing-search', 'ai', state);
    await row(page, selector, true);
    await page.locator('.pb-back').click();
    expectPath(page, index);
    await restored(page, '#writing-search', 'ai', state);
    await visit(page, '/zh/notes/?from=ai&topic=ai');
    assert.equal(await page.locator('#writing-search').inputValue(), '');
  });
  await check('Case and support links resolve before external modules load', async page => {
    await page.route('**/_astro/*.js', route => route.abort());
    await page.goto(base + '/projects/weave/?from=work&via=projects&origin=taste');
    assert.equal(await page.locator('[data-project-back]').first().getAttribute('href'), '/work/weave/?from=projects&via=taste');
    await page.locator('[data-story-support]').click();
    expectPath(page, '/support/?project=weave&via=projects&origin=taste');
    await page.waitForLoadState('domcontentloaded');
    assert.equal(await page.locator('[data-language]').getAttribute('href'), '/zh/support/?project=weave&via=projects&origin=taste');
    await page.locator('[data-support-back]').click();
    expectPath(page, '/projects/weave/?from=work&via=projects&origin=taste#case');
  });
  await check('Writing keeps query-dependent UI inactive before hydration', async page => {
    await page.route('**/_astro/*.js', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue().catch(() => {});
    });
    await page.goto(base + '/notes/?from=ai&topic=memory', {waitUntil:'commit'});
    await page.locator('main h1').waitFor({state:'attached'});
    assert.equal(await page.locator('astro-island[ssr]').count(), 1);
    assert.equal(await page.locator('.pb-back').isVisible(), false);
    assert.equal(await page.locator('.space-query-status').isVisible(), true);
    assert.equal(await page.locator('.space-index button[aria-pressed="true"]').isVisible(), false);
    await hydrated(page);
    assert.equal(await page.locator('.pb-back').getAttribute('href'), '/lens/ai/');
    assert.equal(await page.locator('.space-index button[aria-pressed="true"]').textContent(), 'Memory');
    await page.goto(base + '/zh/notes/ai/2060032007506334292/?from=notes&via=ai&topic=ai', {waitUntil:'commit'});
    const returnLink = page.locator('.space-writing-detail [data-space-return]');
    await returnLink.waitFor({state:'attached'});
    assert.equal(await page.locator('astro-island[ssr]').count(), 1);
    assert.equal(await page.locator('.space-writing-detail h1').isVisible(), true);
    assert.equal(await returnLink.isVisible(), false);
    await hydrated(page);
    assert.equal(await returnLink.getAttribute('href'), '/zh/notes/?from=ai&topic=ai');
  });
} finally {
  await browser.close();
  console.log(results.join('\n'));
}
