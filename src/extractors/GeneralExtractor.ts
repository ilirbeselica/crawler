import { ExtractedContent } from './interfaces';
import { BaseExtractor } from './BaseExtractor';

export class GeneralExtractor extends BaseExtractor {
    canExtract(url: string): boolean {
        return true;
    }

    async extract(url: string, html: string, options?: any): Promise<ExtractedContent> {
        const $ = this.parseHtml(html);
        
        if (options?.discardSelectors && Array.isArray(options.discardSelectors)) {
        
            for (const selector of options.discardSelectors) {
                console.log(selector)
                $(selector).remove();
            }
        }
    
        // Extract title
        const title = this.cleanText($('title').text() || $('h1').first().text() || '');
        console.log(`Title extracted: ${title}`);
        
        // Extract images
        const images: string[] = [];
        
        // Use custom image selector if provided, otherwise use default
        const imageSelector = options?.imageSelector || 'img';
        
        $(imageSelector).each((_, img) => {
            const src = $(img).attr('src');
            if (src && !src.includes('1x1.gif') && !src.includes('tracking') && !src.includes('pixel')) {
                // Convert relative URLs to absolute
                const fullSrc = src.startsWith('http') ? src : new URL(src, url).href;
                images.push(fullSrc);
            }
        });

        console.log(`Found ${images.length} images`);
        
        // Extract author
        const authorSelectors = [
            'meta[name="author"]',
            '.author',
            '.byline',
            '[rel="author"]',
            '[itemprop="author"]',
            '.article-author'
        ];
        
        let author;
        for (const selector of authorSelectors) {
            const authorElem = $(selector);
            if (authorElem.length) {
                author = authorElem.attr('content') || this.cleanText(authorElem.text());
                if (author) break;
            }
        }
        
        // Use entire HTML as a single paragraph
        const paragraphs = [$.html()]; // Use the modified HTML after discarding elements
        
        return {
            title,
            paragraphs,
            images,
            author
        };
    }
}