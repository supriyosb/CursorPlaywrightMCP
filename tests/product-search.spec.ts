import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';

test.describe('Product Search', () => {
    test('should find Faded Short Sleeve T-shirts in search results', async ({ page }, testInfo) => {
        const homePage = new HomePage(page);
        const searchResultsPage = new SearchResultsPage(page);
        const timestamp = Date.now();
        
        // Navigate to the home page
        await homePage.navigateTo();
        const homePageScreenshot = await page.screenshot({ 
            path: `screenshots/${timestamp}-01-home-page.png` 
        });
        await testInfo.attach('home-page', { 
            body: homePageScreenshot, 
            contentType: 'image/png' 
        });
        
        // Search for T-Shirts
        await homePage.searchProduct('T-Shirts');
        await page.waitForLoadState('networkidle'); // Wait for all network requests to complete
        const afterSearchScreenshot = await page.screenshot({ 
            path: `screenshots/${timestamp}-02-after-search.png` 
        });
        await testInfo.attach('after-search', { 
            body: afterSearchScreenshot, 
            contentType: 'image/png' 
        });
        
        // Verify search results
        await searchResultsPage.verifyProductInResults('Faded Short Sleeve T-shirts');
        const resultsCount = await searchResultsPage.getSearchResultsCount();
        expect(resultsCount).toBeGreaterThan(0);
        
        // Take a screenshot of the search results
        const searchResultsScreenshot = await page.screenshot({ 
            path: `screenshots/${timestamp}-03-search-results.png`,
            fullPage: true // Capture the entire page
        });
        await testInfo.attach('search-results', { 
            body: searchResultsScreenshot, 
            contentType: 'image/png' 
        });
    });
}); 