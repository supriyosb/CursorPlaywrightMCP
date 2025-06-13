import { Page, expect } from '@playwright/test';

export class SearchResultsPage {
    private page: Page;
    
    // Locators
    private readonly searchResultsContainer = '#center_column';
    private readonly searchCounterSelector = '.heading-counter';
    
    constructor(page: Page) {
        this.page = page;
    }
    
    async verifyProductInResults(productName: string) {
        try {
            // Wait for search results container
            await this.page.waitForSelector(this.searchResultsContainer, { 
                state: 'visible', 
                timeout: 10000 
            });
            
            const productLocator = this.page.locator(this.searchResultsContainer)
                .getByRole('heading', { name: productName, level: 5 });
            
            // Wait for the product to be visible
            await expect(productLocator).toBeVisible({ timeout: 10000 });
        } catch (error: any) {
            console.error(`Failed to verify product ${productName} in results:`, error);
            throw new Error(`Product verification failed: ${error.message || 'Unknown error'}`);
        }
    }
    
    async getSearchResultsCount(): Promise<number> {
        try {
            // Wait for the counter element
            await this.page.waitForSelector(this.searchCounterSelector, { 
                state: 'visible', 
                timeout: 10000 
            });
            
            const countText = await this.page.locator(this.searchCounterSelector).textContent();
            const matches = countText?.match(/\d+/);
            
            if (!matches) {
                throw new Error('Could not find search results count in the page');
            }
            
            return parseInt(matches[0]);
        } catch (error: any) {
            console.error('Failed to get search results count:', error);
            throw new Error(`Getting results count failed: ${error.message || 'Unknown error'}`);
        }
    }
} 