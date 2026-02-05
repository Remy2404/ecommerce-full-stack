'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Calendar, 
  ChevronRight,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Order } from '@/types';

interface OrderDetailClientProps {
  order: Order;
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(price));
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped':
      case 'delivering': return 'warning';
      case 'processing':
      case 'preparing':
      case 'ready':
      case 'confirmed':
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const steps = [
    { label: 'Placed', icon: Clock, completed: true, date: order.createdAt },
    { label: 'Processing', icon: AlertCircle, completed: ['confirmed', 'preparing', 'ready', 'delivering', 'delivered'].includes(order.status.toLowerCase()) },
    { label: 'Shipped', icon: Truck, completed: ['delivering', 'delivered'].includes(order.status.toLowerCase()) },
    { label: 'Delivered', icon: CheckCircle2, completed: order.status.toLowerCase() === 'delivered' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/orders"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Order #{order.orderNumber}</h1>
              <Badge variant={getStatusVariant(order.status)} className="text-sm px-3 py-1">
                {order.status}
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Download Invoice</Button>
            <Button>Track Order</Button>
          </div>
        </div>
      </div>

      {/* Order Progress */}
      <Card className="mb-8 overflow-hidden">
        <CardContent className="pt-8 pb-10">
          <div className="relative flex justify-between">
            {/* Progress Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-muted" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500" 
              style={{ width: `${(steps.filter(s => s.completed).length - 1) * 33.33}%` }}
            />
            
            {steps.map((step, i) => (
              <div key={step.label} className="relative flex flex-col items-center z-10">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                  step.completed ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="absolute top-12 whitespace-nowrap text-center">
                  <p className={`text-sm font-semibold ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {step.completed && i === 0 && (
                     <p className="text-[10px] text-muted-foreground">
                       {new Date(order.createdAt).toLocaleDateString()}
                     </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - Items */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-6 hover:bg-muted/30 transition-colors">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-design bg-muted border">
                      {item.productImage ? (
                        <img 
                          src={item.productImage} 
                          alt={item.productName} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-lg">{item.productName}</h4>
                          <p className="font-bold text-lg">{formatPrice(item.subtotal)}</p>
                        </div>
                        {item.variantName && (
                          <p className="text-sm text-muted-foreground mt-1">Variant: {item.variantName}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button variant="ghost" size="sm" asChild>
                           <Link href={`/products/${item.productSlug || item.productId}`} className="text-xs">
                             Buy Again
                             <ChevronRight className="h-3 w-3 ml-1" />
                           </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping and Payment Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {order.shippingAddress ? (
                  <>
                    <p className="font-medium text-foreground mb-1">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode || ''}</p>
                    <p>{order.shippingAddress.country}</p>
                  </>
                ) : (
                  <p>No shipping address provided</p>
                )}
                {order.notes && (
                  <div className="mt-4 p-3 rounded-design bg-muted/50 text-xs">
                    <p className="font-semibold text-foreground mb-1">Instructions:</p>
                    {order.notes}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                 <Badge 
                   variant={order.paymentStatus === 'PAID' ? 'success' : 'secondary'} 
                   className="capitalize"
                 >
                   {order.paymentStatus}
                 </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar - Summary */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{Number(order.deliveryFee) === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm text-destructive">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
               <h4 className="font-bold mb-2">WingPoints Earned</h4>
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">W</div>
                 <div>
                   <p className="text-2xl font-bold">+{(Number(order.total) * 10).toFixed(0)}</p>
                   <p className="text-xs text-muted-foreground">Points will be added after delivery</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
