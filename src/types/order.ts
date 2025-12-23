import { orders, orderItems, payments, deliveries, promotions, promotionUsage, orderStatusEnum, paymentStatusEnum, paymentMethodEnum, deliveryStatusEnum } from '../lib/db/schema';

// Enums
export type OrderStatus = typeof orderStatusEnum.enumValues[number];
export type PaymentStatus = typeof paymentStatusEnum.enumValues[number];
export type PaymentMethod = typeof paymentMethodEnum.enumValues[number];
export type DeliveryStatus = typeof deliveryStatusEnum.enumValues[number];

// Inferred types
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = typeof deliveries.$inferInsert;

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

export type PromotionUsage = typeof promotionUsage.$inferSelect;
export type InsertPromotionUsage = typeof promotionUsage.$inferInsert;
