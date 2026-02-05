import api from './api';
import { CategoryApiResponse, Category, mapCategory } from '@/types/category';

// ============================================================================
// Category Service
// ============================================================================

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get<CategoryApiResponse[]>('/categories');
    return response.data.map(mapCategory);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response = await api.get<CategoryApiResponse>(`/categories/${slug}`);
    return mapCategory(response.data);
  } catch {
    return null;
  }
}
