import { test, expect } from '@playwright/test';

// Titles retrieved from PostgreSQL `film` table via MCP
const movieTitles = [
  'Academy Dinosaur',
  'Ace Goldfinger',
  'Adaptation Holes',
  'Affair Prejudice',
  'African Egg',
];

// Helper: best-effort consent handler for Google variants
async function dismissGoogleConsent(page) {
  const selectors = [
    'button:has-text("I agree")',
    'button:has-text("Accept all")',
    'button:has-text("Accept")',
    'button[aria-label="Accept all"]',
    '#L2AGLb', // common id for consent on some locales
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

test('Google search for film titles from PostgreSQL', async ({ page }) => {
  // Use English locale to stabilize selectors
  const homeUrl = 'https://www.google.co.in/?hl=en';

  await page.goto(homeUrl, { waitUntil: 'domcontentloaded' });
  await dismissGoogleConsent(page);

  for (const title of movieTitles) {
    // Ensure we are on the home page for a clean search box each iteration
    if (!page.url().startsWith('https://www.google.')) {
      await page.goto(homeUrl, { waitUntil: 'domcontentloaded' });
      await dismissGoogleConsent(page);
    }

    const searchBox = page.locator('textarea[name="q"], input[name="q"]');
    await searchBox.first().click();
    await searchBox.first().fill(title);
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/google\.[^/]+\/search\?q=/, { timeout: 20000 });
    await expect(page.locator('#search')).toBeVisible({ timeout: 20000 });

    // Navigate back to the home page for the next title
    await page.goto(homeUrl, { waitUntil: 'domcontentloaded' });
    // No-op if consent already dismissed
    await dismissGoogleConsent(page);
  }
}); 