import { RefreshCw, Package, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Returns & Exchanges | Store',
  description: 'Our hassle-free 30-day return policy. Learn how to return or exchange your items.',
};

const returnSteps = [
  {
    step: 1,
    title: 'Start Your Return',
    description: 'Log in to your account and go to Orders. Select the item you want to return and click "Return Item".',
  },
  {
    step: 2,
    title: 'Pack Your Item',
    description: 'Place the item in its original packaging with all tags attached. Include the return slip we emailed you.',
  },
  {
    step: 3,
    title: 'Ship It Back',
    description: 'Drop off your package at any shipping partner location. Use the prepaid label we provided.',
  },
  {
    step: 4,
    title: 'Get Your Refund',
    description: 'Once we receive and inspect your return, we\'ll process your refund within 5-7 business days.',
  },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <RefreshCw className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Returns & Exchanges
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Not 100% satisfied? No problem. We offer hassle-free returns within 30 days.
            </p>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-4 rounded-design-lg border border-border bg-card p-6">
            <Clock className="h-8 w-8 flex-shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">30-Day Window</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Return any item within 30 days of delivery, no questions asked.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-design-lg border border-border bg-card p-6">
            <Package className="h-8 w-8 flex-shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Free Returns</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We provide prepaid shipping labels for all returns within Cambodia.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-design-lg border border-border bg-card p-6">
            <RefreshCw className="h-8 w-8 flex-shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Easy Exchanges</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Want a different size or color? We'll ship the new item for free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Return */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold">How to Return an Item</h2>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {returnSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {step.step}
                  </div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-2xl font-bold">Return Eligibility</h2>
          
          <div className="space-y-6">
            <div className="rounded-design-lg border border-success/20 bg-success/5 p-6">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-semibold">Eligible for Return</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Items in original, unused condition</li>
                <li>• Products with all original tags and packaging</li>
                <li>• Items returned within 30 days of delivery</li>
                <li>• Electronics in original sealed packaging</li>
              </ul>
            </div>
            
            <div className="rounded-design-lg border border-destructive/20 bg-destructive/5 p-6">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <h3 className="font-semibold">Not Eligible for Return</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Personalized or custom-made items</li>
                <li>• Intimate apparel and swimwear</li>
                <li>• Items marked as "Final Sale"</li>
                <li>• Products showing signs of use or damage</li>
              </ul>
            </div>
            
            <div className="rounded-design-lg border border-warning/20 bg-warning/5 p-6">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-semibold">Important Notes</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Refunds are processed to the original payment method</li>
                <li>• Please allow 5-7 business days for refund processing</li>
                <li>• International returns may require additional shipping fees</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Need Help?</h2>
          <p className="mt-2 text-muted-foreground">
            Our support team is available to assist you with returns and exchanges.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
