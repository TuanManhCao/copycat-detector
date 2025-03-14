import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractProductInfo } from '@/lib/ai-utils';
import { scrapeUrl } from '@/lib/firecrawl';

// Request schema with two possible inputs: direct markdown or URL
const RequestSchema = z.object({
  markdown: z.string().optional(),
  url: z.string().url().optional(),
}).refine(data => data.markdown || data.url, {
  message: "Either 'markdown' or 'url' must be provided",
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validatedInput = RequestSchema.parse(body);
    
    let markdownContent: string;
    
    // If URL is provided, scrape it using Firecrawl
    if (validatedInput.url) {
      try {
        console.log(`Scraping URL: ${validatedInput.url}`);
        const scrapeResult = await scrapeUrl(validatedInput.url, {
          formats: ['markdown'],
        });
            
        const markdown = scrapeResult.markdown
        
        if (!markdown) {
          throw new Error('Failed to extract markdown from the provided URL');
        }
        
        markdownContent = markdown;
      } catch (scrapeError) {
        console.error('Error scraping URL:', scrapeError);
        return NextResponse.json(
          { 
            success: false,
            error: scrapeError instanceof Error ? scrapeError.message : 'Failed to scrape the provided URL' 
          },
          { status: 500 }
        );
      }
    } else if (validatedInput.markdown) {
      // Use provided markdown directly
      markdownContent = validatedInput.markdown;
    } else {
      // This should never happen due to the schema refinement, but just in case
      return NextResponse.json(
        { 
          success: false,
          error: 'Either markdown or URL must be provided' 
        },
        { status: 400 }
      );
    }
    
    // Extract product information from the markdown
    const validatedData = await extractProductInfo(markdownContent);
    
    return NextResponse.json({
      success: true,
      data: validatedData,
      source: validatedInput.url ? 'url' : 'markdown',
      ...(validatedInput.url && { url: validatedInput.url }),
      ...(validatedInput.url && { rawMarkdown: markdownContent }),
    });
  } catch (error) {
    console.error('Error extracting product information:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 