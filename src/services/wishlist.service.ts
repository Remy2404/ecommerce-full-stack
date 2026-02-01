import api from './api';
import { Product } from '@/types/product';

// Backend response type matches Java ProductResponse
interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string | null; 
  rating: number;
}

/**
 * Transform backend product response to frontend Product type
 */
function transformProduct(product: ProductResponse): Product {
  // Parse images string
  let images: string[] = [];
  if (product.images) {
    try {
      // Handle potential formats: JSON array string, comma-separated, or single URL
      if (product.images.startsWith('[') && product.images.endsWith(']')) {
         const content = product.images.substring(1, product.images.length - 1);
         images = content.split(',').map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
      } else {
        images = product.images.split(',').map(s => s.trim());
      }
    } catch (e) {
      console.warn('Failed to parse product images', product.images);
      images = [];
    }
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: '', 
    basePrice: product.price,
    salePrice: product.comparePrice || undefined,
    sku: '', 
    stock: product.stock || 0,
    images: images,
    isFeatured: false,
    isActive: true, 
    rating: product.rating,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getWishlist(): Promise<Product[]> {
  const response = await api.get<ProductResponse[]>('/wishlist');
  return response.data.map(transformProduct);
}

export async function addToWishlist(productId: string): Promise<Product> {
  const response = await api.post<ProductResponse>('/wishlist/add', { productId });
  return transformProduct(response.data);
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await api.delete(`/wishlist/remove/${productId}`);
}

export async function checkWishlistStatus(productId: string): Promise<boolean> {
  const wishlist = await getWishlist();
  return wishlist.some(p => p.id === productId);
}
