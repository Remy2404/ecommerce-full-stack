import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ProductDetail } from '@/components/products/product-detail';
import { mockProducts, formatMockProduct } from '@/lib/mock-data';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for static generation
export function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Shop ${product.name} at Store`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  // Find product by slug (using mock data)
  const rawProduct = mockProducts.find((p) => p.slug === slug);
  
  if (!rawProduct) {
    notFound();
  }

  // Format product for the component
  const product = {
    id: rawProduct.id,
    name: rawProduct.name,
    slug: rawProduct.slug,
    description: rawProduct.description,
    price: parseFloat(rawProduct.price),
    comparePrice: rawProduct.comparePrice ? parseFloat(rawProduct.comparePrice) : null,
    stock: rawProduct.stock,
    images: rawProduct.images,
    rating: parseFloat(rawProduct.rating),
    reviewCount: rawProduct.reviewCount,
    isFeatured: rawProduct.isFeatured,
  };

  return <ProductDetail product={product} />;
}
