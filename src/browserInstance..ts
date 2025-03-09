import { chromium, Browser } from 'playwright';

let browser: Browser;

export async function getBrowser(): Promise<Browser> {
    if (! browser) {    
        console.log('Launching browser...');
        browser = await chromium.launch({ headless: false });
    }

    return browser;
}