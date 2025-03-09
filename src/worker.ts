import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { CrawlJobData } from './interfaces';
import { crawlUrl } from './crawler';
import { scrapeUrl } from './scraper';
import { extractor } from './extractor';
import { openrouterWriter } from './writers/openrouterWriter';
import { translateText } from './translators';

const connection = new IORedis();

const cralwWorker = new Worker<CrawlJobData>(
  'crawlQueue',
  async job => {
    console.log(`Processing job ${job.id} for URL: ${job.data.url}`);

    let result;
    // Dispatch based on job name
    switch (job.name) {
      case 'crawlJob':
        result = await crawlUrl(job.data.url, job.data.options);
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
  },
  { connection }
);

const rewriteWorker = new Worker(
  'rewriteQueue',
  async job => {
    let result;
    console.log(job.name)
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
  },
  { connection }
);

cralwWorker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

cralwWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});

rewriteWorker.on('error', err => {
  console.error(`Worker error: ${err.message}`);
});

rewriteWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});