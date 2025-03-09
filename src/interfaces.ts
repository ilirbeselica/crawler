export interface CrawlOptions {
  regexFilter?: string;
  maxDepth?: number;
  timeout?: number;
  waitSelector: string;
  bodySelector: string;
}

export interface CrawlJobData {
  url: string;
  options?: CrawlOptions;
  html?: any;
  text?: string;
}

export interface RewriteJobData {
  url: string;
  text: string;
  model?: string;
  apiKey?: string;
  sourceLang?: string;
  targetLang?: string;
}