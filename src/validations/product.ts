import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(2, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL'),
  images: z.array(z.string().url()).optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  featured: z.boolean().optional(),
});

export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(12),
});
