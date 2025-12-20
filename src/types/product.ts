export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  category: string | null;
  imageUrl: string | null;
  images: string[];
  stock: number;
  rating: string;
  numReviews: number;
  featured: boolean;
};
