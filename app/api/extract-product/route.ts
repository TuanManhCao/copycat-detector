import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { ProductInfoSchema } from '@/lib/types';
import { extractProductInfo } from '@/lib/ai-utils'

// Request schema
const RequestSchema = z.object({
  markdown: z.string().min(1, 'Markdown text is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { markdown } = RequestSchema.parse(body);

    // Extract product information using utility function
    const validatedData = await extractProductInfo(markdown);
    return NextResponse.json({
      success: true,
      data: validatedData,
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