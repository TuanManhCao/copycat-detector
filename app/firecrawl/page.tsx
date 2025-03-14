import { FirecrawlDemo } from '@/components/firecrawl-demo';

export const metadata = {
  title: 'Firecrawl Demo',
  description: 'Demonstrate Firecrawl functionality for scraping, crawling, and mapping websites',
};

export default function FirecrawlPage() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Firecrawl Integration</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        This demo shows how to use Firecrawl to scrape, crawl, and map websites. 
        Enter a URL and select an operation to see the results.
      </p>
      
      <FirecrawlDemo />
    </main>
  );
} 