import { CrawlOptions } from './interfaces';
import { getBrowser } from './browserInstance.';

export async function crawlUrl(seedUrl: string, options?: CrawlOptions): Promise<string[]> {
    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log(`Crawling URL: ${seedUrl} ...`);
        await page.goto(seedUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForSelector(options!.waitSelector, { timeout: options!.timeout, state: 'attached' });

        const urls = await page.$$eval('a', (anchors, regexStr) => {
            const regex = regexStr ? new RegExp(regexStr) : null;
            return anchors
                .map(a => (a as HTMLAnchorElement).href)
                .filter(href => regex ? regex.test(href) : true);
        }, options?.regexFilter);
        
        const uniqueUrls = Array.from(new Set(urls));
        console.log(`Found ${uniqueUrls.length} URLs on ${seedUrl}`);
        return uniqueUrls;
    } catch (error) {
        console.log('Error crawling URL:', error);
        return [];
    } finally {
        await page.close();
        await context.close();
    }
}
