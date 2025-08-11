import { test, expect } from '@playwright/test';

// Titles retrieved from PostgreSQL earlier in this session
const movieTitlesFromDb: string[] = [
  'Academy Dinosaur',
  'Ace Goldfinger',
  'Adaptation Holes',
  'Affair Prejudice',
  'African Egg',
];

async function selectCityKolkata(page) {
  // Start at root as per scenario, then select city or fallback to direct city URL
  await page.goto('https://in.bookmyshow.com/', { waitUntil: 'domcontentloaded' });

  // Try common patterns to select city "Kolkata" if a picker is shown
  const possibleCityLocators = [
    page.getByRole('link', { name: /^Kolkata$/i }),
    page.getByRole('button', { name: /^Kolkata$/i }),
    page.getByText(/^Kolkata$/i),
  ];

  let citySelected = false;
  for (const locator of possibleCityLocators) {
    try {
      if (await locator.first().isVisible({ timeout: 2000 })) {
        await locator.first().click({ timeout: 5000 });
        citySelected = true;
        break;
      }
    } catch {}
  }

  // Fallback: navigate directly to Kolkata home if city picker wasn't used
  if (!citySelected) {
    await page.goto('https://in.bookmyshow.com/explore/home/kolkata', { waitUntil: 'domcontentloaded' });
  }

  // Verify we are on a Kolkata context by URL including /kolkata
  await expect(page).toHaveURL(/kolkata/i, { timeout: 15000 });
}

async function openSearch(page) {
  // Try to open the search UI if it's not already visible
  const searchInputCandidates = [
    'input[placeholder*="Search"]',
    'input[aria-label*="Search" i]',
    'input[type="text"]',
  ];

  // Try clicking any visible search button/icon first
  const searchOpeners = [
    page.getByRole('button', { name: /search/i }),
    page.locator('[data-test*="search" i]'),
    page.locator('header svg[title="Search"], header [aria-label*="Search" i]'),
  ];
  for (const opener of searchOpeners) {
    try {
      if (await opener.first().isVisible({ timeout: 1500 })) {
        await opener.first().click({ timeout: 3000 });
        break;
      }
    } catch {}
  }

  // Wait for an input to become available
  for (const selector of searchInputCandidates) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
      return selector;
    } catch {}
  }

  // As a last resort, reload city homepage and try again
  await page.goto('https://in.bookmyshow.com/explore/home/kolkata', { waitUntil: 'domcontentloaded' });
  for (const selector of searchInputCandidates) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
      return selector;
    } catch {}
  }

  throw new Error('Search input not found');
}

async function performSearch(page, searchInputSelector: string, query: string) {
  // Clear input if needed, then type query and submit
  await page.fill(searchInputSelector, '');
  await page.type(searchInputSelector, query, { delay: 50 });

  // Wait for suggestions or results
  const suggestions = page.locator(
    'div:has-text("Top Results"), [class*="SearchedItems"], [data-test*="suggestions" i]'
  );
  try {
    await suggestions.first().waitFor({ state: 'visible', timeout: 4000 });
  } catch {}

  // Press Enter to go to results page
  await page.keyboard.press('Enter');

  // Either a results page or quick result card should contain the movie title
  const possibleResultLocators = [
    page.getByRole('link', { name: new RegExp(query, 'i') }),
    page.getByRole('heading', { name: new RegExp(query, 'i') }),
    page.locator(`[title*="${query}"]`),
    page.locator(`text=${query}`),
  ];

  let found = false;
  for (const locator of possibleResultLocators) {
    try {
      await locator.first().waitFor({ state: 'visible', timeout: 6000 });
      found = true;
      break;
    } catch {}
  }

  expect(found, `Expected search results to contain: ${query}`).toBeTruthy();
}

test.describe('BookMyShow - Search movies from DB in Kolkata', () => {
  test('Search each DB movie title on BookMyShow (Kolkata)', async ({ page }, testInfo) => {
    const timestamp = Date.now();

    await selectCityKolkata(page);
    await testInfo.attach('city-selected', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    const searchInputSelector = await openSearch(page);

    for (const movieTitle of movieTitlesFromDb) {
      await performSearch(page, searchInputSelector, movieTitle);
      await testInfo.attach(`search-${movieTitle}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      // Re-open search to prepare for the next query if the UI resets
      try {
        await openSearch(page);
      } catch {
        // If search input remains, reuse it; otherwise navigate back to city home
        try {
          await page.waitForSelector(searchInputSelector, { state: 'visible', timeout: 2000 });
        } catch {
          await page.goto('https://in.bookmyshow.com/explore/home/kolkata', { waitUntil: 'domcontentloaded' });
          await openSearch(page);
        }
      }
    }
  });
}); 