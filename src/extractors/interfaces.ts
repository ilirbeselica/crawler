export interface ExtractedContent {
    title?: string;
    paragraphs?: string[];
    images?: string[];
    author?: string;
}

export interface ContentExtractor {
    canExtract(url: string): boolean;
    extract(url: string, html: string, options?: any): Promise<ExtractedContent>;
}