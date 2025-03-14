import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
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