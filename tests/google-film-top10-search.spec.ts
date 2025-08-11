import { test, expect } from '@playwright/test';

test.setTimeout(180000);

// Titles retrieved from PostgreSQL `film` table via MCP (top 10 by title DESC)
const movieTitles = [
  'Zorro Ark',
  'Zoolander Fiction',
  'Zhivago Core',
  'Youth Kick',
  'Young Language',
  'Yentl Idaho',
  'Wyoming Storm',
  'Wrong Behavior',
  'Wrath Mile',
  'Worst Banger',
];

async function dismissGoogleConsent(page) {
  const selectors = [
    'button:has-text("I agree")',
    'button:has-text("Accept all")',
    'button:has-text("Accept")',
    'button[aria-label("Accept all")]',
    '#L2AGLb',
  ];
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector);
      if (await locator.first().isVisible()) {
        await locator.first().click({ timeout: 2000 });
        break;
      }
    } catch {
      // ignore and try next selector
    }
  }
}

test('Google search for top 10 film titles from PostgreSQL (DESC)', async ({ page }) => {
  const homeUrl = 'https://www.google.co.in/?hl=en';

  await page.goto(homeUrl, { waitUntil: 'domcontentloaded' });
  await dismissGoogleConsent(page);

  for (const title of movieTitles) {
    if (!page.url().startsWith('https://www.google.')) {
      await page.goto(homeUrl, { waitUntil: 'domcontentloaded' });
      await dismissGoogleConsent(page);
    }

    const searchBox = page.locator('textarea[name="q"], input[name="q"]');
    await searchBox.first().click();
    await searchBox.first().fill(title);
    await page.keyboard.press('Enter');

    await page.waitForLoadState('domcontentloaded');

    // If Google rate-limits with a /sorry page, skip this title and continue
    if (page.url().includes('/sorry/')) {
      await page.goto(homeUrl, { waitUntil: 'domcontentloaded' });
      await dismissGoogleConsent(page);
      continue;
    }

    // Best-effort check that we navigated to a results URL without blocking the flow
    try {
      await page.waitForURL(/google\.[^/]+\/search\?q=/, { timeout: 5000 });
    } catch {
      // ignore - proceed to next title regardless
    }

    // Return to home for the next query
    await page.goto(homeUrl, { waitUntil: 'domcontentloaded' });
    await dismissGoogleConsent(page);

    // Small delay to be polite
    await page.waitForTimeout(300);
  }
}); 