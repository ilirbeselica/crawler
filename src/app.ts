import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Queue } from 'bullmq';
import { CrawlJobData, RewriteJobData } from './interfaces';
import { authMiddleware, AuthRequest } from './middleware/auth';
import { v4 as uuidv4 } from 'uuid';

import connection from './redisClient';
const app = express();
app.use(authMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Add this line to parse form data


// Initialize BullMQ queue with default Redis settings
const crawlQueue = new Queue<CrawlJobData>('crawlQueue', { connection });
const rewriteQueue = new Queue<RewriteJobData>('rewriteQueue', { connection });

app.post('/crawl', async (req: AuthRequest, res: any) => {
  console.log(req.body);
  const { url, options, jobId = uuidv4() } = req.body;
  if (!url) {
    console.error('Missing required url parameter');
    return res.status(400).json({ error: 'Missing required url parameter' });
  }

  try {
    const job = await crawlQueue.add('crawlJob', { url, options }, { jobId });
    console.log(`Added job to queue: ${job.id}`);
    res.json({ jobId: job.id });
  } catch (error) {
    console.error('Failed to add job to queue:', error);
    res.status(500).json({ error: 'Failed to add job to queue' });
  }
});

app.post('/scrape', async (req: AuthRequest, res: any) => {
  console.log(req.body);
  const { url, options, jobId = uuidv4() } = req.body;
  if (!url) {
    console.error('Missing required url parameter');
    return res.status(400).json({ error: 'Missing required url parameter' });
  }

  try {
    const job = await crawlQueue.add('scrapeJob', { url, options }, { jobId });
    console.log(`Added job to queue: ${job.id}`);
    res.json({ jobId: job.id });
  } catch (error) {
    console.error('Failed to add job to queue:', error);
    res.status(500).json({ error: 'Failed to add job to queue' });
  }
});

app.post('/extract', async (req: AuthRequest, res: any) => {
  const { url, html, jobId = uuidv4() } = req.body;
  
  if (!html) {
    console.error('Missing required html parameter');
    return res.status(400).json({ error: 'Missing required html parameter' });
  }

  try {
    let decodedHtml = html;
    
    // Check if the html is base64 encoded
    if (typeof html === 'string' && html.startsWith('base64:')) {
      decodedHtml = Buffer.from(html.replace('base64:', ''), 'base64').toString('utf-8');
    }
    
    const job = await crawlQueue.add('extractData', { 
      url, 
      html: decodedHtml 
    }, { jobId });
    
    console.log(`Added job to queue: ${job.id}`);
    res.json({ jobId: job.id });
  } catch (error) {
    console.error('Failed to add job to queue:', error);
    res.status(500).json({ error: 'Failed to add job to queue' });
  }
});

app.post('/rewrite-text', async (req: AuthRequest, res: any) => {
  const { text, url, model, apiKey, jobId = uuidv4() } = req.body;
  if (!text) {
    console.error('Missing required text parameter');
    return res.status(400).json({ error: 'Missing required text parameter' });
  }

  if (!url) {
    console.error('Missing required url parameter');
    return res.status(400).json({ error: 'Missing required url parameter' });
  }

  try {
    const job = await rewriteQueue.add('rewriteText', { url, text, model, apiKey }, { jobId });
    console.log(`Added job to queue: ${job.id}`);
    res.json({ jobId: job.id });
  } catch (error) {
    console.error('Failed to add job to queue:', error);
    res.status(500).json({ error: 'Failed to add job to queue' });
  }
});

app.post('/translate', async (req: AuthRequest, res: any) => {
  const { url, text, targetLang, sourceLang, jobId = uuidv4() } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing required text parameter' });
  if (!url) return res.status(400).json({ error: 'Missing required url parameter' });
  if (!targetLang) return res.status(400).json({ error: 'Missing required targetLang parameter' });
  if (!sourceLang) return res.status(400).json({ error: 'Missing required sourceLang parameter' });

  try {
    const job = await rewriteQueue.add('translateText', { url, text, targetLang, sourceLang }, { jobId });
    console.log(`Added job to queue: ${job.id}`);
    res.json({ jobId: job.id });
  } catch (error) {
    console.error('Failed to add job to queue:', error);
    res.status(500).json({ error: 'Failed to add job to queue' });
  }
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});