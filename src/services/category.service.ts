import api from './api';

// ============================================================================
// Types
// ============================================================================

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount?: number;
}

// ============================================================================
// Category Service
// ============================================================================

/**
 * Get all categories
 */
export async function getCategories(): Promise<CategoryResponse[]> {
  try {
    const response = await api.get<CategoryResponse[]>('/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryResponse | null> {
  try {
    const response = await api.get<CategoryResponse>(`/categories/${slug}`);
    return response.data;
  } catch {
    return null;
  }
}
