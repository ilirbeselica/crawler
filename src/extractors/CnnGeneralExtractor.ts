import { ExtractedContent } from './interfaces';
import { BaseExtractor } from './BaseExtractor';

export class CnnGeneralExtractor extends BaseExtractor {

    canExtract(url: string): boolean {
        const cnnHealthRegex = /https:\/\/edition\.cnn\.com\/\d{4}\/\d{2}\/\d{2}\/.*\/index\.html/;
        return cnnHealthRegex.test(url);
    }

    async extract(url: string, html: string): Promise<ExtractedContent> {
        console.log('Extracting content from CNN Health URL:', url);
        const $ = this.parseHtml(html);
        const result: ExtractedContent = {
            title: '',
            paragraphs: [],
            images: []
        };

        const titleElement = $('title').text();
        console.log('Title element:', titleElement);
        if (titleElement) result.title = this.cleanText(titleElement);
        if (! result.title) result.title = this.cleanText($('h1.headline__text').text());

        $('.paragraph').each((i, el) => {
            const text = $(el).text().trim();
            if (text && !text.startsWith('Related article')) {
                result.paragraphs!.push(text);
            }
        });

        $('img.image__dam-img').each((i, el) => {
            let imgUrl = $(el).attr('src') || '';
            const questionMarkIndex = imgUrl.indexOf('?');
            if (questionMarkIndex !== -1) {
                imgUrl = imgUrl.substring(0, questionMarkIndex);
            }

            if (imgUrl && !result.images!.includes(imgUrl)) {
                result.images!.push(imgUrl);
            }
        });

        const authorText = $('.source__text').text().trim();
        if (authorText) {
            result.author = authorText;
        }

        return result;
    }
}