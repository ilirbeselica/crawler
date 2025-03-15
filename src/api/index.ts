import { post } from './instance';

/**
 * Job status type definition
 */
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Updates job status in the Laravel dashboard
 * 
 * @param jobId - The ID of the job
 * @param status - Current job status
 * @param error - Optional error message if job failed
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  error?: string
): Promise<void> {
  try {
    await post('/api/crawler/jobs/status', { jobId, status, error });
    console.log(`Updated job ${jobId} status to ${status}`);
  } catch (err) {
    // Don't let status update failures break the main process
    console.error(`Failed to update job status for ${jobId}:`,
      err instanceof Error ? err.message : String(err));
  }
}

/**
 * Get job details from Laravel
 */
export async function getJobDetails(jobId: string) {
  try {
    return await post('/api/crawler/jobs/details', { jobId });
  } catch (err) {
    console.error(`Failed to get job details for ${jobId}`);
    throw err;
  }
}

/**
 * Save crawled URLs to the Laravel dashboard
 * 
 * @param sourceUrl - The URL that was crawled
 * @param urls - Array of unique URLs found during crawling
 * @returns Promise with the response data
 */
export async function saveCrawledUrls(
  sourceUrl: string,
  urls: string[]
): Promise<{ stored: number; total: number; }> {
  try {
    const response = await post<{ stored: number; total: number; }>('/api/crawler/crawled-urls', {
      sourceUrl,
      urls
    });

    console.log(`Saved ${response.stored} URLs (out of ${response.total}) from ${sourceUrl}`);
    return response;
  } catch (err) {
    // Don't let URL saving failures break the main process
    console.error(`Failed to save crawled URLs from ${sourceUrl}:`,
      err instanceof Error ? err.message : String(err));

    return { stored: 0, total: urls.length };
  }
}

/**
 * Save scraped article data to the Laravel dashboard
 * 
 * @param url - The URL that was scraped
 * @param data - Article data including title, paragraphs, images, author
 * @returns Promise with the response data
 */
export async function saveScrapedArticle(
  url: string,
  data: {
    title?: string;
    paragraphs?: string[];
    images?: string[];
    author?: string;
    metadata?: Record<string, any>;
  }
): Promise<{ article_id: number }> {
  try {
    const response = await post<{ article_id: number; message: string }>('/api/scraped-articles', {
      url,
      title: data.title,
      paragraphs: data.paragraphs || [],
      images: data.images || [],
      author: data.author,
      metadata: data.metadata || {}
    });

    console.log(`Saved scraped article from ${url} with ID ${response.article_id}`);
    return response;
  } catch (err) {
    // Don't let article saving failures break the main process
    console.log(err)
    console.error(`Failed to save scraped article from ${url}:`,
      err instanceof Error ? err.message : String(err));
    throw err;
  }
}