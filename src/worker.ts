import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { CrawlJobData } from './interfaces';
import { crawlUrl } from './crawler';
import { scrapeUrl } from './scraper';
import { extractor } from './extractor';
import { openrouterWriter } from './writers/openrouterWriter';
import { translateText } from './translators';
import { updateJobStatus, saveCrawledUrls } from './api';

const connection = new IORedis();

const cralwWorker = new Worker<CrawlJobData>(
  'crawlQueue',
  async job => {
    console.log(`Processing job ${job.id} for URL: ${job.data.url}`);
    
    // Update job status to processing when starting
    await updateJobStatus(job.id as string, 'processing');

    let result;
    try {
      // Dispatch based on job name
      switch (job.name) {
        case 'crawlJob':
          result = await crawlUrl(job.data.url, job.data.options);
          await saveCrawledUrls(job.data.url, result);
          break;
        case 'scrapeJob':
          result = await scrapeUrl(job.data.url, job.data.options);
          break;
        case 'extractData':
          result = await extractor(job.data.html, job.data.url);
          break;
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
      return result;
    } catch (error) {
      // Update job status to failed if there's an error
      const errorMessage = error instanceof Error ? error.message : String(error);
      await updateJobStatus(job.id as string, 'failed', errorMessage);
      throw error;
    }
  },
  { connection }
);

const rewriteWorker = new Worker(
  'rewriteQueue',
  async job => {
    // Update job status to processing when starting
    await updateJobStatus(job.id as string, 'processing');
    
    let result;
    try {
      console.log(job.name);
      switch (job.name) {
        case 'rewriteJob':
          const { url, text, model, apiKey } = job.data;
          result = await openrouterWriter({
            apiKey,
            model,
            prompt: text,
            url
          });
          break;
        case 'translateText':
          result = await translateText(job.data.text, job.data.sourceLang, job.data.targetLang);
          console.log(result);
          break;
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
      
      return result;
    } catch (error) {
      // Update job status to failed if there's an error
      const errorMessage = error instanceof Error ? error.message : String(error);
      await updateJobStatus(job.id as string, 'failed', errorMessage);
      throw error;
    }
  },
  { connection }
);

// Update job status to completed when job is successful
cralwWorker.on('completed', async job => {
  console.log(`Job ${job.id} completed`);
  await updateJobStatus(job.id as string, 'completed');
});

// Handle job failures
cralwWorker.on('failed', async (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
  await updateJobStatus(job?.id as string, 'failed', err.message);
});

// Handle generic worker errors
rewriteWorker.on('error', err => {
  console.error(`Worker error: ${err.message}`);
});

// Update job status to completed when job is successful
rewriteWorker.on('completed', async job => {
  console.log(`Job ${job.id} completed`);
  await updateJobStatus(job.id as string, 'completed');
});

// Handle job failures
rewriteWorker.on('failed', async (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
  await updateJobStatus(job?.id as string, 'failed', err.message);
});