// Mock data for development/testing when database is not available
export const mockProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones Pro',
    slug: 'premium-wireless-headphones-pro',
    description: 'Experience crystal-clear audio with our flagship wireless headphones. Features active noise cancellation, 40-hour battery life, and premium comfort.',
    price: '299.99',
    comparePrice: '399.99',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    ],
    rating: '4.8',
    reviewCount: 124,
    isFeatured: true,
    categoryId: 'cat-1',
    merchantId: 'merch-1',
    createdAt: new Date('2024-12-01'),
  },
  {
    id: '2',
    name: 'Minimalist Leather Watch',
    slug: 'minimalist-leather-watch',
    description: 'A timeless design meets modern craftsmanship. Swiss movement, sapphire crystal, and genuine Italian leather strap.',
    price: '189.00',
    comparePrice: null,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ],
    rating: '4.9',
    reviewCount: 89,
    isFeatured: true,
    categoryId: 'cat-2',
    merchantId: 'merch-1',
    createdAt: new Date('2024-11-28'),
  },
  {
    id: '3',
    name: 'Smart Home Speaker',
    slug: 'smart-home-speaker',
    description: 'Voice-controlled smart speaker with premium 360° audio and smart home integration.',
    price: '149.00',
    comparePrice: '199.00',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80',
    ],
    rating: '4.6',
    reviewCount: 203,
    isFeatured: false,
    categoryId: 'cat-1',
    merchantId: 'merch-2',
    createdAt: new Date('2024-11-25'),
  },
  {
    id: '4',
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-tshirt',
    description: 'Sustainably sourced 100% organic cotton. Soft, breathable, and eco-friendly.',
    price: '45.00',
    comparePrice: null,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    ],
    rating: '4.5',
    reviewCount: 67,
    isFeatured: false,
    categoryId: 'cat-3',
    merchantId: 'merch-3',
    createdAt: new Date('2024-11-20'),
  },
  {
    id: '5',
    name: 'Designer Sunglasses',
    slug: 'designer-sunglasses',
    description: 'UV400 protection with polarized lenses. Titanium frame for ultimate durability and style.',
    price: '275.00',
    comparePrice: '350.00',
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    ],
    rating: '4.7',
    reviewCount: 45,
    isFeatured: false,
    categoryId: 'cat-2',
    merchantId: 'merch-1',
    createdAt: new Date('2024-11-15'),
  },
  {
    id: '6',
    name: 'Portable Power Bank',
    slug: 'portable-power-bank',
    description: '20000mAh capacity with fast charging support. Charge multiple devices simultaneously.',
    price: '59.99',
    comparePrice: '79.99',
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
    ],
    rating: '4.4',
    reviewCount: 312,
    isFeatured: false,
    categoryId: 'cat-1',
    merchantId: 'merch-2',
    createdAt: new Date('2024-11-10'),
  },
  {
    id: '7',
    name: 'Ceramic Coffee Mug Set',
    slug: 'ceramic-coffee-mug-set',
    description: 'Handcrafted ceramic mugs. Set of 4 in earthy tones. Microwave and dishwasher safe.',
    price: '48.00',
    comparePrice: null,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80',
    ],
    rating: '4.8',
    reviewCount: 156,
    isFeatured: false,
    categoryId: 'cat-4',
    merchantId: 'merch-4',
    createdAt: new Date('2024-11-05'),
  },
  {
    id: '8',
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description: 'Extra thick 6mm cushioning with non-slip surface. Perfect for yoga, pilates, and workouts.',
    price: '65.00',
    comparePrice: '85.00',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
    ],
    rating: '4.6',
    reviewCount: 89,
    isFeatured: false,
    categoryId: 'cat-5',
    merchantId: 'merch-5',
    createdAt: new Date('2024-11-01'),
  },
];

export const mockCategories = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics', icon: '📱' },
  { id: 'cat-2', name: 'Accessories', slug: 'accessories', icon: '⌚' },
  { id: 'cat-3', name: 'Clothing', slug: 'clothing', icon: '👕' },
  { id: 'cat-4', name: 'Home & Living', slug: 'home-living', icon: '🏠' },
  { id: 'cat-5', name: 'Sports & Fitness', slug: 'sports-fitness', icon: '🏃' },
];

// Helper to convert mock product to the format expected by components
export function formatMockProduct(product: typeof mockProducts[0]) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: parseFloat(product.price),
    comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
    images: product.images,
    rating: parseFloat(product.rating),
    reviewCount: product.reviewCount,
    stock: product.stock,
    isFeatured: product.isFeatured,
  };
}

export function getFormattedMockProducts() {
  return mockProducts.map(formatMockProduct);
}

export function getFeaturedMockProducts() {
  return mockProducts.filter(p => p.isFeatured).map(formatMockProduct);
}
