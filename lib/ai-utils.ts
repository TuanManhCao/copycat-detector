import { openai } from '@ai-sdk/openai';
import { cosineSimilarity, embedMany, generateObject } from 'ai';
import { ProductInfo, ProductInfoSchema } from './types';

/**
 * Extract product information from markdown text
 * @param markdownText The markdown text to extract information from
 * @returns Structured product information
 */
export async function extractProductInfo(markdownText: string): Promise<ProductInfo> {
  try {
    const prompt = `
      You are a product information extraction assistant. 
      Extract structured product information from the provided markdown text.
      
      Return ONLY a JSON object with the following structure:
      {
        "productTitle": "The title of the product",
        "description": "A concise description of the product",
        "price": "The price of the product (include currency symbol)",
        "features": ["Feature 1", "Feature 2", ...],
        "productVariants": [
          {
            "name": "Variant name (e.g., 'Color', 'Size')",
            "options": ["Option 1", "Option 2", ...],
            "price": "Price if different from base price (include currency symbol)"
          }
        ],
        "warranty": "Warranty information if available"
      }
      
      If any field is not found in the text, use an empty string for string fields, 
      an empty array for array fields, or omit optional fields.
      
      DO NOT include any explanations, only return the JSON object.
    `;

    const { object } = await generateObject({
      model: openai('gpt-4-turbo'),
      prompt: prompt + '\n' + markdownText,
      schema: ProductInfoSchema,
      temperature: 0.1
    });
    
    return object as ProductInfo;
  } catch (error) {
    console.error('Error extracting product information:', error);
    throw new Error('Failed to extract product information from the provided text');
  }
}


export async function calculateEmbeddingSimilarity(str1: string, str2: string): Promise<number> {
  if (!str1 && !str2) return 100 // Both empty = perfect match
  if (!str1 || !str2) return 0   // One empty = no match

  try {
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: [str1, str2],
    })

    // Convert cosine similarity (-1 to 1) to a percentage (0 to 100)
    const similarity = cosineSimilarity(embeddings[0], embeddings[1])
    // Scale from [-1,1] to [0,100]
    return Math.round((similarity + 1) * 50)
  } catch (error) {
    console.error('Error calculating embedding similarity:', error)
    // Fallback to a basic similarity measure
    return calculateBasicSimilarity(str1, str2)
  }
}

// Fallback similarity calculation if embeddings fail
function calculateBasicSimilarity(str1: string, str2: string): number {
  // Convert to lowercase for better comparison
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  // Simple Jaccard similarity for a basic measure
  const set1 = new Set(s1.split(/\s+/))
  const set2 = new Set(s2.split(/\s+/))

  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return Math.round((intersection.size / union.size) * 100)
}

// Calculate similarity between arrays (like features)
export async function calculateArrayEmbeddingSimilarity(arr1: string[], arr2: string[]): Promise<number> {
  if (arr1.length === 0 && arr2.length === 0) return 100
  if (arr1.length === 0 || arr2.length === 0) return 0

  // Join arrays to strings for comparison
  const str1 = arr1.join(' ')
  const str2 = arr2.join(' ')

  return await calculateEmbeddingSimilarity(str1, str2)
}

// Calculate similarity between product variants
export async function calculateVariantsEmbeddingSimilarity(
  variants1: ProductInfo['productVariants'] = [],
  variants2: ProductInfo['productVariants'] = []
): Promise<number> {
  if (!variants1?.length && !variants2?.length) return 100
  if (!variants1?.length || !variants2?.length) return 0

  // Convert variants to strings for comparison
  const str1 = variants1.map(v => `${v.name || ''} ${v.options?.join(' ') || ''} ${v.price || ''}`).join(' ')
  const str2 = variants2.map(v => `${v.name || ''} ${v.options?.join(' ') || ''} ${v.price || ''}`).join(' ')

  return await calculateEmbeddingSimilarity(str1, str2)
}



export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 && !str2) return 100 // Both empty = perfect match
  if (!str1 || !str2) return 0   // One empty = no match

  // Convert to lowercase for better comparison
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  // Simple Jaccard similarity for a basic measure
  const set1 = new Set(s1.split(/\s+/))
  const set2 = new Set(s2.split(/\s+/))

  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return Math.round((intersection.size / union.size) * 100)
}

// Calculate similarity between arrays (like features)
export function calculateArraySimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 100
  if (arr1.length === 0 || arr2.length === 0) return 0

  // Join arrays to strings for comparison
  const str1 = arr1.join(' ')
  const str2 = arr2.join(' ')

  return calculateSimilarity(str1, str2)
}

// Calculate similarity between product variants
export function calculateVariantsSimilarity(
  variants1: ProductInfo['productVariants'] = [],
  variants2: ProductInfo['productVariants'] = []
): number {
  if (!variants1?.length && !variants2?.length) return 100
  if (!variants1?.length || !variants2?.length) return 0

  // Convert variants to strings for comparison
  const str1 = variants1.map(v => `${v.name || ''} ${v.options?.join(' ') || ''} ${v.price || ''}`).join(' ')
  const str2 = variants2.map(v => `${v.name || ''} ${v.options?.join(' ') || ''} ${v.price || ''}`).join(' ')

  return calculateSimilarity(str1, str2)
}
