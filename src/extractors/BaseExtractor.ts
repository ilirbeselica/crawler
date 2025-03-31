import { ContentExtractor, ExtractedContent } from './interfaces';
import * as cheerio from 'cheerio';

export abstract class BaseExtractor implements ContentExtractor {
    abstract canExtract(url: string): boolean;

    abstract extract(url: string, html: string, options: any): Promise<ExtractedContent>;

    protected parseHtml(html: string) {
        return cheerio.load(html);
    }

    protected cleanText(text: string): string {
        return text.replace(/\s+/g, ' ').trim();
    }
}