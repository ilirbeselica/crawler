import { CrawlOptions } from './interfaces';
import { getBrowser } from './browserInstance';

export async function crawlUrl(seedUrl: string, options?: CrawlOptions): Promise<string[]> {
    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();
    console.log(options)

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
        
        // Filter out invalid URLs and ensure all values are strings
        const validUrls = urls
            .filter(url => typeof url === 'string' && url.trim() !== '')
            .filter(url => {
                try {
                    // Validate URL format
                    new URL(url);
                    
                    // Optionally filter by protocol (keep only http/https)
                    return url.startsWith('http://') || url.startsWith('https://');
                } catch (e) {
                    console.warn(`Skipping invalid URL: ${url}`);
                    return false;
                }
            });
        
        const uniqueUrls = Array.from(new Set(validUrls));
        console.log(`Found ${uniqueUrls.length} valid unique URLs on ${seedUrl}`);
        return uniqueUrls;
    } catch (error) {
        console.log('Error crawling URL:', error);
        throw error;
    } finally {
        await page.close();
        await context.close();
    }
}