import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl, crawlWebsite, mapWebsite } from '@/lib/firecrawl';


/**
 * API handler for scraping a single URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, operation = 'scrape', options = {} } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case 'scrape':
        result = await scrapeUrl(url, options);
        break;
      case 'crawl':
        result = await crawlWebsite(url, options);
        break;
      case 'map':
        result = await mapWebsite(url);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Use "scrape", "crawl", or "map".' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Firecrawl API error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 