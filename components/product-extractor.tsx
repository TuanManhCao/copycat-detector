'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProductInfo } from '@/lib/types';

type InputMode = 'markdown' | 'url';

export function ProductExtractor() {
  const [inputMode, setInputMode] = useState<InputMode>('markdown');
  const [markdown, setMarkdown] = useState('');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ProductInfo | null>(null);
  const [rawMarkdown, setRawMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMode === 'markdown' && !markdown) {
      setError('Please enter markdown text');
      return;
    }
    
    if (inputMode === 'url' && !url) {
      setError('Please enter a URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    setRawMarkdown(null);
    setProgress(10);
    
    try {
      const payload = inputMode === 'markdown' 
        ? { markdown } 
        : { url };
      
      const response = await fetch('/api/extract-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
        if (data.rawMarkdown) {
          setRawMarkdown(data.rawMarkdown);
        }
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
          <Label>Input Method</Label>
          <RadioGroup 
            value={inputMode} 
            onValueChange={(value: string) => setInputMode(value as InputMode)}
            className="flex space-x-4"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="markdown" id="markdown-input" />
              <Label htmlFor="markdown-input">Markdown Text</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="url" id="url-input" />
              <Label htmlFor="url-input">Product URL</Label>
            </div>
          </RadioGroup>
        </div>
        
        {inputMode === 'markdown' ? (
          <div className="space-y-2">
            <Label htmlFor="markdown">Markdown Text</Label>
            <Textarea
              id="markdown"
              placeholder="Paste your product markdown here..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              disabled={isLoading}
              className="h-64"
              required={inputMode === 'markdown'}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="url">Product URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required={inputMode === 'url'}
            />
          </div>
        )}
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Processing...' : 'Extract Product Information'}
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
          
          {rawMarkdown && (
            <div className="space-y-2">
              <div className="font-medium">Extracted Markdown</div>
              <Textarea
                value={rawMarkdown}
                readOnly
                className="h-64 font-mono text-sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 