export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'wing' | 'card' | 'cash';

export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  merchantId: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  deliveryAddressId: string;
  deliveryInstructions?: string;
  estimatedDeliveryTime?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  productName: string;
  productImage?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
};

export type Payment = {
  id: string;
  orderId: string;
  transactionId?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayResponse?: Record<string, any>;
  paidAt?: Date;
  createdAt: Date;
};

export type Delivery = {
  id: string;
  orderId: string;
  driverId?: string;
  status: DeliveryStatus;
  pickupTime?: Date;
  deliveredTime?: Date;
  currentLatitude?: number;
  currentLongitude?: number;
  driverNotes?: string;
  photoProof?: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Promotion = {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  applicableCategories?: string[];
  applicableMerchants?: string[];
  createdAt: Date;
};

export type PromotionUsage = {
  id: string;
  promotionId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  createdAt: Date;
};
