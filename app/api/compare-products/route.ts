import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateArrayEmbeddingSimilarity, calculateEmbeddingSimilarity, calculateVariantsEmbeddingSimilarity, extractProductInfo } from '@/lib/ai-utils';
import { scrapeUrl } from '@/lib/firecrawl';

// Request schema for product comparison
const RequestSchema = z.object({
  sourceUrl: z.string().url('Source URL must be a valid URL'),
  targetUrl: z.string().url('Target URL must be a valid URL'),
});

// Calculate similarity score using embeddings and cosine similarity
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { sourceUrl, targetUrl } = RequestSchema.parse(body);
    
    // Scrape and extract product info from source URL
    console.log(`Scraping source URL: ${sourceUrl}`);
    const [sourceResult, targetResult] = await Promise.all([
      scrapeUrl(sourceUrl, { formats: ['markdown'] }),
      scrapeUrl(targetUrl, { formats: ['markdown'] })
    ]);

    const sourceMarkdown = sourceResult.markdown || '';
    const targetMarkdown = targetResult.markdown || '';
    
    if (!sourceMarkdown || !targetMarkdown) {
      throw new Error('Failed to extract markdown from one or both URLs');
    }
    
    // Extract product information from both markdowns
    const [sourceProduct, targetProduct] = await Promise.all([
      extractProductInfo(sourceMarkdown),
      extractProductInfo(targetMarkdown)
    ]);
    
    // Calculate similarity scores for each feature using embeddings
    const comparisonResult = await Promise.all([
      {
        element: "Product Title",
        sourceContent: sourceProduct.productTitle,
        targetContent: targetProduct.productTitle,
        similarityScore: await calculateEmbeddingSimilarity(
          sourceProduct.productTitle, 
          targetProduct.productTitle
        ),
      },
      {
        element: "Description",
        sourceContent: sourceProduct.description,
        targetContent: targetProduct.description,
        similarityScore: await calculateEmbeddingSimilarity(
          sourceProduct.description, 
          targetProduct.description
        ),
      },
      {
        element: "Price",
        sourceContent: sourceProduct.price,
        targetContent: targetProduct.price,
        similarityScore: await calculateEmbeddingSimilarity(
          sourceProduct.price, 
          targetProduct.price
        ),
      },
      {
        element: "Features",
        sourceContent: sourceProduct.features.join('\n'),
        targetContent: targetProduct.features.join('\n'),
        similarityScore: await calculateArrayEmbeddingSimilarity(
          sourceProduct.features, 
          targetProduct.features
        ),
      },
      {
        element: "Variants",
        sourceContent: sourceProduct.productVariants 
          ? sourceProduct.productVariants.map(v => 
              `${v.name || ''}: ${v.options?.join(', ') || ''} ${v.price ? `(${v.price})` : ''}`
            ).join('\n')
          : '',
        targetContent: targetProduct.productVariants
          ? targetProduct.productVariants.map(v => 
              `${v.name || ''}: ${v.options?.join(', ') || ''} ${v.price ? `(${v.price})` : ''}`
            ).join('\n')
          : '',
        similarityScore: await calculateVariantsEmbeddingSimilarity(
          sourceProduct.productVariants, 
          targetProduct.productVariants
        ),
      },
      {
        element: "Warranty",
        sourceContent: sourceProduct.warranty || '',
        targetContent: targetProduct.warranty || '',
        similarityScore: await calculateEmbeddingSimilarity(
          sourceProduct.warranty || '', 
          targetProduct.warranty || ''
        ),
      },
    ]);
    
    // Calculate overall similarity score (average of all scores)
    const overallScore = Math.round(
      comparisonResult.reduce((sum, item) => sum + item.similarityScore, 0) / comparisonResult.length
    );
    
    return NextResponse.json({
      success: true,
      sourceUrl,
      targetUrl,
      overallSimilarityScore: overallScore,
      comparison: comparisonResult,
      sourceProduct,
      targetProduct,
    });
  } catch (error) {
    console.error('Error comparing products:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 