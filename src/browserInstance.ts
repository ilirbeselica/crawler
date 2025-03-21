import { chromium, Browser } from 'playwright';

let browser: Browser;

export async function getBrowser(): Promise<Browser> {
    try {
        if (!browser) {
            console.log('Launching browser...');
            console.log('DISPLAY environment variable:', process.env.DISPLAY);
            
            browser = await chromium.launch({ 
                headless: false,  
            });
            
            console.log('Browser launched successfully');
        }
        return browser;
    } catch (error) {
        console.error('Browser launch error:', error);
        throw error;
    }
}