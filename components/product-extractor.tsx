'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ProductInfo } from '@/lib/types';

export function ProductExtractor() {
  const [markdown, setMarkdown] = useState('');
  const [result, setResult] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!markdown) {
      setError('Please enter markdown text');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(10);
    
    try {
      const response = await fetch('/api/extract-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown,
        }),
      });
      
      setProgress(70);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }
      
      const data = await response.json();
      setProgress(100);
      
      if (data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Failed to extract product information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Information Extractor</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="markdown">Markdown Text</Label>
          <Textarea
            id="markdown"
            placeholder="Paste your product markdown here..."
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            disabled={isLoading}
            className="h-64"
            required
          />
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Extracting...' : 'Extract Product Information'}
        </Button>
      </form>
      
      {isLoading && (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Processing...</div>
          <Progress value={progress} className="w-full" />
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md dark:bg-red-900 dark:text-red-100">
          {error}
        </div>
      )}
      
      {result && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Extracted Product Information</h3>
          
          <div className="space-y-2">
            <div className="font-medium">Product Title</div>
            <div className="p-3 bg-gray-50 rounded-md dark:bg-gray-700">{result.productTitle}</div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium">Description</div>
            <div className="p-3 bg-gray-50 rounded-md dark:bg-gray-700">{result.description}</div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium">Price</div>
            <div className="p-3 bg-gray-50 rounded-md dark:bg-gray-700">{result.price}</div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium">Features</div>
            <ul className="p-3 bg-gray-50 rounded-md dark:bg-gray-700 list-disc list-inside">
              {result.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          
          {result.productVariants && result.productVariants.length > 0 && (
            <div className="space-y-2">
              <div className="font-medium">Product Variants</div>
              <div className="p-3 bg-gray-50 rounded-md dark:bg-gray-700">
                {result.productVariants.map((variant, index) => (
                  <div key={index} className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                    <div><strong>Name:</strong> {variant.name}</div>
                    {variant.options && (
                      <div>
                        <strong>Options:</strong> {variant.options.join(', ')}
                      </div>
                    )}
                    {variant.price && <div><strong>Price:</strong> {variant.price}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {result.warranty && (
            <div className="space-y-2">
              <div className="font-medium">Warranty</div>
              <div className="p-3 bg-gray-50 rounded-md dark:bg-gray-700">{result.warranty}</div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="font-medium">Raw JSON</div>
            <Textarea
              value={JSON.stringify(result, null, 2)}
              readOnly
              className="h-64 font-mono text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
} 