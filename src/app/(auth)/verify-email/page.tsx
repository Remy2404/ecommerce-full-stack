import { Suspense } from 'react';
import { getProducts, ProductResult } from '@/actions/product.actions';
import DomeGallery from '@/components/reactbit/DomeGallery';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm';

interface VerifyEmailPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : undefined;

  const productsResult = await getProducts({ limit: 20 });
  const products = productsResult.products || [];

  const productImages = products
    .filter((product: ProductResult) => product.images && product.images.length > 0)
    .map((product: ProductResult) => ({
      src: product.images![0],
      alt: product.name,
    }));

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left side - Dome Gallery (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 lg:relative">
        <DomeGallery images={productImages} />
      </div>

      {/* Right side - Verification Form */}
      <div className="flex flex-1 items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyEmailForm token={token} />
        </Suspense>
      </div>
    </div>
  );
}
