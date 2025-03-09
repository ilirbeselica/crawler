import { ExtractorFactory } from './extractors/ExtractorFactory';
import { ExtractedContent } from './extractors/interfaces';

export async function extractor(html: string, url?: string): Promise<ExtractedContent> {
  try {
    if (!url) {
      throw new Error('URL is required for extraction');
    }
    
    const extractor = ExtractorFactory.getExtractor(url);
    return await extractor.extract(url, html);
  } catch (error: any) {
    console.error(`Error extracting content: ${error}`);
    return {
      title: 'Extraction failed',
      paragraphs: [`Error extracting content: ${error.message}`],
      images: []
    };
  }
}