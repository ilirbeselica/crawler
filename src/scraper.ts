import { CrawlOptions } from './interfaces';
import { getBrowser } from './browserInstance.';

export async function scrapeUrl(seedUrl: string, options?: CrawlOptions): Promise<string[]> {
    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log(`Crawling URL: ${seedUrl} ...`);
        await page.goto(seedUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForSelector(options!.waitSelector, { timeout: options!.timeout, state: 'attached' });
        await page.waitForTimeout(3000);
        const bodySelector = options?.bodySelector || 'body';
        console.log(`Waiting for selector: ${bodySelector}`);
        // extract content inside the bodySelector
        const htmlContent = await page.$eval(bodySelector, (el: Element) => el.innerHTML);
        // save to file
        const fs = require('fs');
        fs.writeFileSync('./scraped.html', htmlContent);
        return [htmlContent];
    } catch (error) {
        console.log('Error crawling URL:', error);
        throw error;
    } finally {
        await page.close();
        await context.close();
    }
}
