import { z } from 'zod';

/**
 * Product variant schema
 */
export const ProductVariantSchema = z.object({
  name: z.string().optional(),
  options: z.array(z.string()).optional(),
  price: z.string().optional(),
});

/**
 * Product information schema
 */
export const ProductInfoSchema = z.object({
  productTitle: z.string(),
  description: z.string(),
  price: z.string(),
  features: z.array(z.string()),
  productVariants: z.array(ProductVariantSchema).optional(),
  warranty: z.string().optional(),
});

/**
 * Product information type
 */
export type ProductInfo = z.infer<typeof ProductInfoSchema>;

/**
 * Product variant type
 */
export type ProductVariant = z.infer<typeof ProductVariantSchema>; 