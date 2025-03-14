import { ProductExtractor } from '@/components/product-extractor';

export const metadata = {
  title: 'Product Information Extractor',
  description: 'Extract structured product information from markdown text using AI',
};

export default function ProductExtractorPage() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Product Information Extractor</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        This tool uses AI to extract structured product information from markdown text. 
        Paste your product markdown and get structured data including title, description, price, features, variants, and warranty.
      </p>
      
      <ProductExtractor />
      
      <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Sample Markdown</h2>
        <pre className="text-sm bg-white dark:bg-gray-900 p-4 rounded overflow-auto">
{`# Premium Wireless Noise-Cancelling Headphones XM5

Experience the ultimate in sound quality with our Premium Wireless Noise-Cancelling Headphones XM5. These headphones deliver crystal-clear audio with deep bass and exceptional noise cancellation.

## Price: $349.99

### Features:
- Industry-leading noise cancellation with dual processors
- Up to 30 hours of battery life
- Crystal-clear hands-free calling with 4 beamforming microphones
- Touch sensor controls for easy playback, calls, and volume control
- Speak-to-chat technology automatically pauses playback when you speak
- Wearing detection pauses playback when headphones are removed
- Multipoint connection allows connection to multiple devices

### Available Colors:
- Midnight Black
- Platinum Silver
- Midnight Blue
- Desert Sand

### Warranty:
2-year limited manufacturer's warranty covering defects in materials and workmanship.`}
        </pre>
      </div>
    </main>
  );
} 