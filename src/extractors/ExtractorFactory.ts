import { ContentExtractor } from './interfaces';
import { CnnHealthExtractor } from './CnnHealthExtractor';

export class ExtractorFactory {
  private static extractors: ContentExtractor[] = [
    new CnnHealthExtractor(),
    // Add more extractors as you create them
  ];
  
  /**
   * Returns an appropriate extractor for the given URL
   * @param url The URL to find an extractor for
   * @returns The first extractor that can extract content from this URL
   */
  public static getExtractor(url: string): ContentExtractor {
    for (const extractor of this.extractors) {
      if (extractor.canExtract(url)) {
        return extractor;
      }
    }
    
    // This should never happen as GenericExtractor accepts all URLs
    return this.extractors[this.extractors.length - 1];
  }
}