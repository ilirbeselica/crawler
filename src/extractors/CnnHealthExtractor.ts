import { ExtractedContent } from './interfaces';
import { BaseExtractor } from './BaseExtractor';

export class CnnHealthExtractor extends BaseExtractor {
   
    canExtract(url: string): boolean {
        const cnnHealthRegex = /https?:\/\/(www\.)?cnn\.com\/health/;
        return cnnHealthRegex.test(url);
    }

    async extract(url: string, html: string): Promise<ExtractedContent> {
        const $ = this.parseHtml(html);
        const result: ExtractedContent = {
            title: '',
            paragraphs: [],
            images: []
        };
        
        // Extract title
        result.title = this.cleanText($('h1.headline__text').text());
        
        // Extract paragraphs
        $('.paragraph').each((i, el) => {
            const text = $(el).text().trim();
            if (text && !text.startsWith('Related article')) {
                result.paragraphs!.push(text);
            }
        });
        
        // Extract all images (including main and related content)
        $('img.image__dam-img').each((i, el) => {
            const imgUrl = $(el).attr('src') || '';
            
            // Skip duplicates (by URL) and empty URLs
            if (imgUrl && !result.images!.includes(imgUrl)) {
                result.images!.push(imgUrl);
            }
        });
        
        // Extract author
        const authorText = $('.source__text').text().trim();
        if (authorText) {
            result.author = authorText;
        }
        
        return result;
    }
}