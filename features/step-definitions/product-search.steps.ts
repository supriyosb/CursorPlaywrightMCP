import { Given, When, Then, BeforeAll, AfterAll, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, BrowserContext, chromium, Page, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { SearchResultsPage } from '../../pages/SearchResultsPage';

// Set default timeout for all steps to 30 seconds
setDefaultTimeout(30 * 1000);

let browser: Browser;
let context: BrowserContext;
let page: Page;
let homePage: HomePage;
let searchResultsPage: SearchResultsPage;
const timestamp = Date.now();

// Helper function to attach screenshot
async function attachScreenshot(world: any, name: string, page: Page) {
    const screenshot = await page.screenshot();
    world.attach(screenshot, { mediaType: 'image/png', fileName: `${name}.png` });
}

BeforeAll(async () => {
    try {
        browser = await chromium.launch({ 
            headless: false, // Run in headed mode
            args: ['--disable-dev-shm-usage'],
            slowMo: 500 // Add a small delay between actions for better visibility
        });
    } catch (error) {
        console.error('Failed to launch browser:', error);
        throw error;
    }
});

AfterAll(async () => {
    try {
        await browser?.close();
    } catch (error) {
        console.error('Failed to close browser:', error);
    }
});

Before(async () => {
    try {
        context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            ignoreHTTPSErrors: true
        });
        page = await context.newPage();
        homePage = new HomePage(page);
        searchResultsPage = new SearchResultsPage(page);
    } catch (error) {
        console.error('Failed to set up test context:', error);
        throw error;
    }
});

After(async function () {
    try {
        if (page) {
            await attachScreenshot(this, 'test-end', page);
        }
        await context?.close();
    } catch (error) {
        console.error('Failed in After hook:', error);
    }
});

Given('I am on the home page', async function () {
    try {
        await homePage.navigateTo();
        // Wait for critical elements to be ready
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('networkidle');
        await attachScreenshot(this, 'home-page', page);
    } catch (error) {
        console.error('Failed to navigate to home page:', error);
        throw error;
    }
});

When('I search for {string}', async function (searchTerm: string) {
    try {
        await homePage.searchProduct(searchTerm);
        // Wait for search results to load
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('#center_column', { state: 'visible' });
        await attachScreenshot(this, 'after-search', page);
    } catch (error) {
        console.error(`Failed to search for ${searchTerm}:`, error);
        throw error;
    }
});

Then('I should see {string} in the search results', async function (productName: string) {
    try {
        await searchResultsPage.verifyProductInResults(productName);
        await attachScreenshot(this, 'search-results', page);
    } catch (error) {
        console.error(`Failed to verify product ${productName} in results:`, error);
        throw error;
    }
});

Then('the search results count should be greater than {int}', async function (count: number) {
    try {
        const resultsCount = await searchResultsPage.getSearchResultsCount();
        expect(resultsCount).toBeGreaterThan(count);
        await attachScreenshot(this, 'results-count', page);
    } catch (error) {
        console.error(`Failed to verify search results count > ${count}:`, error);
        throw error;
    }
}); 