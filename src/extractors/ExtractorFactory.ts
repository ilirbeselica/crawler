import { ContentExtractor } from './interfaces';
import { CnnGeneralExtractor } from './CnnGeneralExtractor';
import { ApGeneralExtractor } from './ApGeneralExtractor';

export class ExtractorFactory {
  private static extractors: ContentExtractor[] = [
    new CnnGeneralExtractor(),
    new ApGeneralExtractor(),
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
    
    throw new Error(`No extractor found for URL: ${url}`);
  }
}