import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractProductInfo } from '@/lib/ai-utils';
import { scrapeUrl } from '@/lib/firecrawl';
import { ProductInfo } from '@/lib/types';

// Request schema for product comparison
const RequestSchema = z.object({
  sourceUrl: z.string().url('Source URL must be a valid URL'),
  targetUrl: z.string().url('Target URL must be a valid URL'),
});

// Calculate similarity score between two strings (0-100)
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 && !str2) return 100; // Both empty = perfect match
  if (!str1 || !str2) return 0;   // One empty = no match

  // Convert to lowercase for better comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Simple Jaccard similarity for a basic measure
  const set1 = new Set(s1.split(/\s+/));
  const set2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return Math.round((intersection.size / union.size) * 100);
}

// Calculate similarity between arrays (like features)
function calculateArraySimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 100;
  if (arr1.length === 0 || arr2.length === 0) return 0;
  
  // Join arrays to strings for comparison
  const str1 = arr1.join(' ');
  const str2 = arr2.join(' ');
  
  return calculateSimilarity(str1, str2);
}

// Calculate similarity between product variants
function calculateVariantsSimilarity(
  variants1: ProductInfo['productVariants'] = [], 
  variants2: ProductInfo['productVariants'] = []
): number {
  if (!variants1?.length && !variants2?.length) return 100;
  if (!variants1?.length || !variants2?.length) return 0;
  
  // Convert variants to strings for comparison
  const str1 = variants1.map(v => `${v.name || ''} ${v.options?.join(' ') || ''} ${v.price || ''}`).join(' ');
  const str2 = variants2.map(v => `${v.name || ''} ${v.options?.join(' ') || ''} ${v.price || ''}`).join(' ');
  
  return calculateSimilarity(str1, str2);
}

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
    
    // Calculate similarity scores for each feature
    const comparisonResult = [
      {
        element: "Product Title",
        sourceContent: sourceProduct.productTitle,
        targetContent: targetProduct.productTitle,
        similarityScore: calculateSimilarity(sourceProduct.productTitle, targetProduct.productTitle),
      },
      {
        element: "Description",
        sourceContent: sourceProduct.description,
        targetContent: targetProduct.description,
        similarityScore: calculateSimilarity(sourceProduct.description, targetProduct.description),
      },
      {
        element: "Price",
        sourceContent: sourceProduct.price,
        targetContent: targetProduct.price,
        similarityScore: calculateSimilarity(sourceProduct.price, targetProduct.price),
      },
      {
        element: "Features",
        sourceContent: sourceProduct.features.join('\n'),
        targetContent: targetProduct.features.join('\n'),
        similarityScore: calculateArraySimilarity(sourceProduct.features, targetProduct.features),
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
        similarityScore: calculateVariantsSimilarity(sourceProduct.productVariants, targetProduct.productVariants),
      },
      {
        element: "Warranty",
        sourceContent: sourceProduct.warranty || '',
        targetContent: targetProduct.warranty || '',
        similarityScore: calculateSimilarity(sourceProduct.warranty || '', targetProduct.warranty || ''),
      },
    ];
    
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