import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ProductDetail } from '@/components/products/product-detail';
import { getProductBySlug, getProducts } from '@/actions/product.actions';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for static generation
export async function generateStaticParams() {
  const { products } = await getProducts({ limit: 100 });
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
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
      images: (product.images && product.images[0]) ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  // Fetch product by slug from database
  const rawProduct = await getProductBySlug(slug);
  
  if (!rawProduct) {
    notFound();
  }

  // Format product for the component
  const product = {
    id: rawProduct.id,
    name: rawProduct.name,
    slug: rawProduct.slug,
    description: rawProduct.description,
    price: parseFloat(rawProduct.price as string),
    comparePrice: rawProduct.comparePrice ? parseFloat(rawProduct.comparePrice as string) : null,
    stock: rawProduct.stock,
    images: (rawProduct.images && Array.isArray(rawProduct.images)) ? rawProduct.images : [],
    rating: parseFloat(rawProduct.rating as string),
    reviewCount: rawProduct.reviewCount ?? 0,
    isFeatured: rawProduct.isFeatured,
  };

  return <ProductDetail product={product} />;
}
