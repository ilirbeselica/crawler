import fs from 'fs';
import path from 'path';
import { extractor } from './extractor';

async function testExtraction() {
  try {
    // Load the HTML content from your scraped file
    const html = fs.readFileSync(path.join(__dirname, '../scraped.html'), 'utf-8');
    
    // URLs to test with
    const testUrls = [
      'https://www.cnn.com/health/article-test',
      'https://www.nytimes.com/article/something', // This will use GenericExtractor
    ];
    
    for (const url of testUrls) {
      console.log(`\n===== Testing extraction for URL: ${url} =====\n`);
      
      // Extract content
      const result = await extractor(html, url);
      
      // Print the results in a readable format
      console.log('TITLE:', result.title);
      console.log('\nAUTHOR:', result.author || 'None');
      console.log('\nPARAGRAPHS:', result.paragraphs?.length || 0);
      if (result.paragraphs && result.paragraphs.length > 0) {
        console.log('\nFirst paragraph:', result.paragraphs[0]);
        console.log('Last paragraph:', result.paragraphs[result.paragraphs.length - 1]);
      }
      
      console.log('\nIMAGES:', result.images?.length || 0);
      if (result.images && result.images.length > 0) {
        console.log('\nFirst few image URLs:');
        result.images.slice(0, 3).forEach(img => console.log(`- ${img}`));
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testExtraction();