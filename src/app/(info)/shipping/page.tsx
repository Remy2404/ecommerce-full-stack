import { Truck, Clock, MapPin, Package, Globe, Shield } from 'lucide-react';

export const metadata = {
  title: 'Shipping Information | Store',
  description: 'Learn about our shipping options, delivery times, and coverage areas.',
};

const shippingOptions = [
  {
    name: 'Standard Shipping',
    time: '3-5 business days',
    price: '$5.00',
    description: 'Available for all orders within Cambodia',
    icon: Truck,
  },
  {
    name: 'Express Shipping',
    time: '1-2 business days',
    price: '$12.00',
    description: 'Priority handling and faster delivery',
    icon: Clock,
  },
  {
    name: 'International Shipping',
    time: '7-14 business days',
    price: 'Calculated at checkout',
    description: 'Available to most countries worldwide',
    icon: Globe,
  },
];

const deliveryRegions = [
  { region: 'Phnom Penh', standardTime: '1-2 days', expressTime: 'Same day' },
  { region: 'Siem Reap', standardTime: '2-3 days', expressTime: '1-2 days' },
  { region: 'Sihanoukville', standardTime: '2-3 days', expressTime: '1-2 days' },
  { region: 'Battambang', standardTime: '3-4 days', expressTime: '1-2 days' },
  { region: 'Other Provinces', standardTime: '3-5 days', expressTime: '2-3 days' },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Truck className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Shipping Information
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Fast, reliable shipping to your doorstep. Free shipping on orders over $100.
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold">Shipping Options</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {shippingOptions.map((option) => (
            <div
              key={option.name}
              className="rounded-design-lg border border-border bg-card p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-design-sm bg-primary/10 text-primary">
                <option.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{option.name}</h3>
              <p className="mt-1 text-2xl font-bold text-primary">{option.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{option.time}</p>
              <p className="mt-4 text-muted-foreground">{option.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free Shipping Banner */}
      <section className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-design-lg bg-primary px-6 py-8 text-center text-primary-foreground">
          <Package className="mx-auto h-8 w-8" />
          <h3 className="mt-4 text-xl font-bold">Free Shipping on Orders Over $100</h3>
          <p className="mt-2 text-primary-foreground/80">
            No code needed. Automatically applied at checkout.
          </p>
        </div>
      </section>

      {/* Delivery Times by Region */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold">Delivery Times by Region</h2>
        <div className="overflow-hidden rounded-design-lg border border-border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Region</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Standard</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Express</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deliveryRegions.map((region) => (
                <tr key={region.region}>
                  <td className="px-6 py-4 font-medium">{region.region}</td>
                  <td className="px-6 py-4 text-muted-foreground">{region.standardTime}</td>
                  <td className="px-6 py-4 text-muted-foreground">{region.expressTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Policies */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-2xl font-bold">Shipping Policies</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <MapPin className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Delivery Address</h3>
                <p className="mt-1 text-muted-foreground">
                  Please ensure your shipping address is accurate. We cannot be responsible 
                  for packages delivered to incorrect addresses provided by the customer.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Shield className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Package Protection</h3>
                <p className="mt-1 text-muted-foreground">
                  All orders are insured during transit. If your package is lost or damaged, 
                  please contact us within 48 hours of the expected delivery date.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Clock className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Order Processing</h3>
                <p className="mt-1 text-muted-foreground">
                  Orders placed before 2 PM are processed the same business day. 
                  Orders placed on weekends or holidays are processed the next business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
