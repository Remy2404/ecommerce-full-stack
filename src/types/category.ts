/**
 * Category-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface CategoryApiResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Frontend Domain Models ---

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Transformation Logic ---

export function mapCategory(raw: CategoryApiResponse): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    image: raw.image,
    icon: raw.icon,
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}
