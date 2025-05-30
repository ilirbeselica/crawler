import { CrawlOptions } from './interfaces';
import { getBrowser } from './browserInstance';

export async function scrapeUrl(seedUrl: string, options?: CrawlOptions): Promise<string[]> {
    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log(`Crawling URL: ${seedUrl} ...`);
        await page.goto(seedUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForSelector(options!.bodySelector, { timeout: options!.timeout, state: 'attached' });
        await page.waitForTimeout(5000);
        const bodySelector = options?.bodySelector || 'body';
        console.log(`Waiting for selector: ${bodySelector}`);
        // extract content inside the bodySelector
        // use page.evaluate, get title from the page and add it sinde bodySelector
        await page.evaluate((bodySelector) => {
            const title = document.querySelector('title')?.innerText || '';
            const body = document.querySelector(bodySelector);
            if (body) {
                const titleElement = document.createElement('title');
                titleElement.innerText = title;
                body.prepend(titleElement);
            }
        }, bodySelector)

        let htmlContent = await page.$eval(bodySelector, (el: Element) => el.innerHTML);
        


        return [htmlContent];
    } catch (error) {
        console.log('Error crawling URL:', error);
        throw error;
    } finally {
        await page.close();
        await context.close();
    }
}
