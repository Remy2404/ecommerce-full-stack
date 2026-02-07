import { getProducts } from '@/actions/product.actions';
import DomeGallery from '@/components/reactbit/DomeGallery';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const dynamic = 'force-dynamic';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const tokenParam = params?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const { products: galleryProducts } = await getProducts({ limit: 12 });

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left side - DomeGallery */}
      <div className="relative hidden w-0 flex-1 lg:block overflow-hidden bg-black">
        <DomeGallery
          images={galleryProducts.map(p => ({
            src: p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
            alt: p.name,
            href: `/products/${p.slug}`
          }))}
          fit={0.7}
          minRadius={500}
          maxRadius={800}
          overlayBlurColor="rgba(0,0,0,0.8)"
          grayscale={false}
          imageBorderRadius="24px"
        />

        {/* Overlay content */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-12 text-center">
          <div className="max-w-md bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10">
            <h2 className="text-4xl font-bold tracking-tight text-white">
              {token ? 'Almost there' : 'Forgot your password?'}
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              {token 
                ? 'Set your new password and get back to shopping.'
                : 'No worries, we\'ll send you reset instructions.'}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <ResetPasswordForm token={token} />
    </div>
  );
}
