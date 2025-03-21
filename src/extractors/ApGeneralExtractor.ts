import { ExtractedContent } from './interfaces';
import { BaseExtractor } from './BaseExtractor';

export class ApGeneralExtractor extends BaseExtractor {

    canExtract(url: string): boolean {
        const apNewsRegex = /https:\/\/apnews\.com\/article\/[a-z0-9-]+-\w{32}/;
        return apNewsRegex.test(url);
    }

    async extract(url: string, html: string): Promise<ExtractedContent> {
        const $ = this.parseHtml(html);
        const result: ExtractedContent = {
            title: '',
            paragraphs: [],
            images: []
        };

        // Extract title
        const titleElement = $('title').text();
        console.log('Title element:', titleElement);
        if (titleElement) result.title = this.cleanText(titleElement);
        if (!result.title) result.title = this.cleanText($('h1').first().text());

        // Extract paragraphs from the article content
        $('.RichTextStoryBody p').each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
                result.paragraphs!.push(text);
            }
        });

        // Extract images
        $('img').each((i, el) => {
            const imgUrl = $(el).attr('src') || '';
            
            // Skip duplicates (by URL) and empty URLs
            if (imgUrl && !result.images!.includes(imgUrl)) {
                result.images!.push(imgUrl);
            }
        });

        // Extract author
        const authorText = $('.Page-authors a').text().trim();
        if (authorText) {
            result.author = authorText;
        }

        return result;
    }
}