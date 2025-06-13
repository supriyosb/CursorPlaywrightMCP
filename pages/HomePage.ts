import { Page } from '@playwright/test';

export class HomePage {
    private page: Page;
    
    // Locators
    private readonly searchBox = 'input[name="search_query"]';
    private readonly searchButton = 'button[name="submit_search"]';
    
    constructor(page: Page) {
        this.page = page;
    }
    
    async navigateTo() {
        try {
            await this.page.goto('http://www.automationpractice.pl/index.php', {
                waitUntil: 'networkidle',
                timeout: 30000
            });
            
            // Wait for critical elements
            await this.page.waitForSelector(this.searchBox, { state: 'visible', timeout: 10000 });
            await this.page.waitForSelector(this.searchButton, { state: 'visible', timeout: 10000 });
        } catch (error: any) {
            console.error('Failed to navigate to home page:', error);
            throw new Error(`Navigation failed: ${error.message || 'Unknown error'}`);
        }
    }
    
    async searchProduct(productName: string) {
        try {
            // Wait for and fill search box
            await this.page.waitForSelector(this.searchBox, { state: 'visible', timeout: 10000 });
            await this.page.fill(this.searchBox, productName);
            
            // Wait for and click search button
            await this.page.waitForSelector(this.searchButton, { state: 'visible', timeout: 10000 });
            await this.page.click(this.searchButton);
            
            // Wait for navigation
            await this.page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch (error: any) {
            console.error(`Failed to search for product ${productName}:`, error);
            throw new Error(`Search failed: ${error.message || 'Unknown error'}`);
        }
    }
} 