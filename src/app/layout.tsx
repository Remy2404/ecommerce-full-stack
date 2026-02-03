import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { MobileNav } from "@/components/common/mobile-nav";
import { AuthProvider } from "@/hooks/auth-context";
import { CartProvider } from "@/hooks/cart-context";
import { WishlistProvider } from "@/hooks/wishlist-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toaster } from "sonner";
import { GoogleOAuthProviderWrapper } from "@/components/providers/google-oauth-provider";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Store | Premium E-commerce",
    template: "%s | Store",
  },
  description: "Discover premium products curated for modern living. Quality meets style in every item we offer.",
  keywords: ["e-commerce", "online shopping", "premium products", "fashion", "electronics"],
  authors: [{ name: "Store" }],
  creator: "Store",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://store.com",
    siteName: "Store",
    title: "Store | Premium E-commerce",
    description: "Discover premium products curated for modern living.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Store - Premium E-commerce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Store | Premium E-commerce",
    description: "Discover premium products curated for modern living.",
    images: ["/og-image.jpg"],
    creator: "@store",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <GoogleOAuthProviderWrapper>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <MobileNav />
                  <CartDrawer />
                  <Toaster position="top-right" richColors closeButton />
                </div>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProviderWrapper>
      </body>
    </html>
  );
}
