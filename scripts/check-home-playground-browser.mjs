import assert from 'node:assert/strict';

// Pass a connected browser tab to exercise real React navigation and remounts.
export async function checkHomePauseRoundTrip(tab){
  const pause=()=>tab.playwright.locator('.playground-footer button');
  const pressed=()=>pause().getAttribute('aria-pressed');
  if(await pressed()==='true')await pause().press('Enter');
  await pause().press('Enter');
  assert.equal(await pressed(),'true','Pause is enabled before leaving Home');
  await tab.playwright.locator('.playground-character[href*="/lens/ai/"]').press('Enter');
  await tab.playwright.locator('.near-ai').waitFor({state:'visible'});
  await tab.back();
  await tab.playwright.locator('.home-playground').waitFor({state:'visible'});
  assert.equal(await pressed(),'true','Browser Back must preserve explicit pause');
  await tab.playwright.locator('.playground-character[href*="/lens/ai/"]').press('Enter');
  await tab.playwright.locator('.near-ai').waitFor({state:'visible'});
  await tab.playwright.locator('.view-line a').first().press('Enter');
  await tab.playwright.locator('.home-playground').waitFor({state:'visible'});
  assert.equal(await pressed(),'true','Return Home must preserve explicit pause');
  await tab.reload();
  await tab.playwright.getByRole('button',{name:/继续活动|Resume motion/}).waitFor({state:'visible'});
  assert.equal(await pressed(),'true','Pause survives document recreation in this tab');
  await pause().press('Enter');
  assert.equal(await pressed(),'false','Explicit Resume clears pause');
  return 'PASS: pause survives Back, Return Home and reload; Resume clears it.';
}
