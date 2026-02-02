import api from './api';
import { 
  Product, 
  ProductApiResponse, 
  WishlistApiResponse, 
  mapProduct 
} from '@/types';

export async function getWishlist(): Promise<Product[]> {
  try {
    const response = await api.get<ProductApiResponse[]>('/wishlist');
    return response.data.map(mapProduct);
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    return [];
  }
}

export async function addToWishlist(productId: string): Promise<Product> {
  const response = await api.post<ProductApiResponse>('/wishlist/add', { productId });
  return mapProduct(response.data);
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await api.delete(`/wishlist/remove/${productId}`);
}

export async function checkWishlistStatus(productId: string): Promise<boolean> {
  const wishlist = await getWishlist();
  return wishlist.some(p => p.id === productId);
}
export const isInWishlist = checkWishlistStatus;
