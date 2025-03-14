'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

type Operation = 'scrape' | 'crawl' | 'map';

export function FirecrawlDemo() {
  const [url, setUrl] = useState('');
  const [operation, setOperation] = useState<Operation>('scrape');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult('');
    setProgress(10);
    
    try {
      const response = await fetch('/api/firecrawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          operation,
          options: {
            formats: ['markdown'],
          },
        }),
      });
      
      setProgress(70);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }
      
      const data = await response.json();
      setProgress(100);
      
      // Format the result based on the operation
      if (operation === 'scrape') {
        setResult(data.data?.markdown || JSON.stringify(data, null, 2));
      } else if (operation === 'crawl') {
        setResult(JSON.stringify(data.data || data, null, 2));
      } else if (operation === 'map') {
        setResult(JSON.stringify(data.data || data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Firecrawl Demo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">URL to Process</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Operation</Label>
          <RadioGroup 
            value={operation} 
            onValueChange={(value: string) => setOperation(value as Operation)}
            className="flex space-x-4"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="scrape" id="scrape" />
              <Label htmlFor="scrape">Scrape</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="crawl" id="crawl" />
              <Label htmlFor="crawl">Crawl</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="map" id="map" />
              <Label htmlFor="map">Map</Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Processing...' : 'Process URL'}
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
        <div className="space-y-2">
          <Label htmlFor="result">Result</Label>
          <Textarea
            id="result"
            value={result}
            readOnly
            className="h-96 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
} 