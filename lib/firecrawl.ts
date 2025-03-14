import FirecrawlApp, { CrawlParams, ScrapeParams } from '@mendable/firecrawl-js';

/**
 * Firecrawl client for website scraping and crawling
 * Initialized with API key from environment variable or passed directly
 */
export const getFirecrawlClient = (apiKey?: string) => {
  const key = apiKey || process.env.FIRECRAWL_API_KEY;
  
  if (!key) {
    throw new Error('Firecrawl API key is required. Set FIRECRAWL_API_KEY environment variable or pass it as a parameter.');
  }
  
  return new FirecrawlApp({ apiKey: key });
};

/**
 * Scrape a single URL and return the content in specified formats
 */
export async function scrapeUrl(url: string, options?: Partial<ScrapeParams>) {
  const client = getFirecrawlClient();
  
  const defaultOptions: Partial<ScrapeParams> = {
    formats: ['markdown'],
    ...options
  };
  
  const response = await client.scrapeUrl(url, defaultOptions);
  
  if (!response.success) {
    throw new Error(`Failed to scrape URL: ${response.error}`);
  }
  
  return response;
}

/**
 * Crawl a website starting from a URL with specified options
 */
export async function crawlWebsite(url: string, options?: Partial<CrawlParams>) {
  const client = getFirecrawlClient();
  
  const defaultOptions: Partial<CrawlParams> = {
    limit: 100,
    scrapeOptions: {
      formats: ['markdown'],
    },
    ...options
  };
  
  const response = await client.crawlUrl(url, defaultOptions);
  
  if (!response.success) {
    throw new Error(`Failed to crawl website: ${response.error}`);
  }
  
  return response;
}

/**
 * Start an asynchronous crawl and return the job ID
 */
export async function startAsyncCrawl(url: string, options?: Partial<CrawlParams>) {
  const client = getFirecrawlClient();
  
  const defaultOptions: Partial<CrawlParams> = {
    limit: 100,
    scrapeOptions: {
      formats: ['markdown'],
    },
    ...options
  };
  
  const response = await client.asyncCrawlUrl(url, defaultOptions);
  
  if (!response.success) {
    throw new Error(`Failed to start async crawl: ${response.error}`);
  }
  
  return response;
}

/**
 * Check the status of an asynchronous crawl job
 */
export async function checkCrawlStatus(crawlId: string) {
  const client = getFirecrawlClient();
  
  const response = await client.checkCrawlStatus(crawlId);
  
  if (!response.success) {
    throw new Error(`Failed to check crawl status: ${response.error}`);
  }
  
  return response;
}

/**
 * Cancel an ongoing asynchronous crawl job
 */
export async function cancelCrawl(crawlId: string) {
  const client = getFirecrawlClient();
  
  const response = await client.cancelCrawl(crawlId);
  
  if (!response.success) {
    throw new Error(`Failed to cancel crawl: ${response.error}`);
  }
  
  return response;
}

/**
 * Map a website structure
 */
export async function mapWebsite(url: string) {
  const client = getFirecrawlClient();
  
  const response = await client.mapUrl(url);
  
  if (!response.success) {
    throw new Error(`Failed to map website: ${response.error}`);
  }
  
  return response;
} 