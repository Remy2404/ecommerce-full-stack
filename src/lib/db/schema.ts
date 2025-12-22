import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'merchant', 'admin', 'delivery']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['wing', 'card', 'cash']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 50 }).unique(),
  password: varchar('password', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').default('customer').notNull(),
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Addresses table
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  label: varchar('label', { length: 50 }), // 'home', 'office', etc
  street: text('street').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }),
  province: varchar('province', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Merchants table
export const merchants = pgTable('merchants', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  storeName: varchar('store_name', { length: 255 }).notNull(),
  description: text('description'),
  logo: text('logo'),
  banner: text('banner'),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }),
  addressId: uuid('address_id').references(() => addresses.id),
  isVerified: boolean('is_verified').default(false).notNull(),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalOrders: integer('total_orders').default(0),
  commission: decimal('commission', { precision: 5, scale: 2 }).default('0'), // 0% commission like WingMall
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  description: text('description'),
  icon: text('icon'),
  image: text('image'),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => merchants.id).notNull(),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal('compare_price', { precision: 10, scale: 2 }), // Original price for discount
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }), // Merchant's cost
  stock: integer('stock').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  images: jsonb('images'), // Array of image URLs
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  weight: decimal('weight', { precision: 10, scale: 2 }), // in kg
  dimensions: jsonb('dimensions'), // { length, width, height }
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  soldCount: integer('sold_count').default(0),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product variants (size, color, etc)
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(), // 'Small', 'Red', etc
  sku: varchar('sku', { length: 100 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').default(0).notNull(),
  image: text('image'),
  attributes: jsonb('attributes'), // { size: 'M', color: 'Red' }
  isActive: boolean('is_active').default(true).notNull(),
});

// Shopping cart
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').references(() => carts.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id),
  quantity: integer('quantity').default(1).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Price at time of adding
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 50 }).unique().notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  merchantId: uuid('merchant_id').references(() => merchants.id).notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).default('0').notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  deliveryAddressId: uuid('delivery_address_id').references(() => addresses.id).notNull(),
  deliveryInstructions: text('delivery_instructions'),
  estimatedDeliveryTime: timestamp('estimated_delivery_time'),
  deliveredAt: timestamp('delivered_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancelReason: text('cancel_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order items
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id),
  productName: varchar('product_name', { length: 255 }).notNull(), // Snapshot
  productImage: text('product_image'),
  variantName: varchar('variant_name', { length: 100 }),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  transactionId: varchar('transaction_id', { length: 255 }).unique(),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  gatewayResponse: jsonb('gateway_response'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Deliveries
export const deliveries = pgTable('deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  driverId: uuid('driver_id').references(() => users.id),
  status: deliveryStatusEnum('status').default('pending').notNull(),
  pickupTime: timestamp('pickup_time'),
  deliveredTime: timestamp('delivered_time'),
  currentLatitude: decimal('current_latitude', { precision: 10, scale: 8 }),
  currentLongitude: decimal('current_longitude', { precision: 11, scale: 8 }),
  driverNotes: text('driver_notes'),
  photoProof: text('photo_proof'), // Delivery photo
  signature: text('signature'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// WingPoints loyalty program
export const wingPoints = pgTable('wing_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  points: integer('points').default(0).notNull(),
  totalEarned: integer('total_earned').default(0).notNull(),
  totalSpent: integer('total_spent').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// WingPoints transactions
export const wingPointsTransactions = pgTable('wing_points_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  points: integer('points').notNull(), // Positive for earn, negative for spend
  type: varchar('type', { length: 50 }).notNull(), // 'earned', 'spent', 'expired'
  description: text('description'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reviews and ratings
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  images: jsonb('images'), // Array of review photos
  isVerifiedPurchase: boolean('is_verified_purchase').default(true).notNull(),
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Promotions and coupons
export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'percentage', 'fixed', 'free_delivery'
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  perUserLimit: integer('per_user_limit').default(1),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  applicableCategories: jsonb('applicable_categories'), // Array of category IDs
  applicableMerchants: jsonb('applicable_merchants'), // Array of merchant IDs
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Promotion usage tracking
export const promotionUsage = pgTable('promotion_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  promotionId: uuid('promotion_id').references(() => promotions.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Wishlists
export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'order', 'promotion', 'delivery', etc
  relatedId: uuid('related_id'), // ID of related order, product, etc
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
  merchant: one(merchants),
  wingPoints: one(wingPoints),
}));

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  user: one(users, {
    fields: [merchants.userId],
    references: [users.id],
  }),
  products: many(products),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [products.merchantId],
    references: [merchants.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  merchant: one(merchants, {
    fields: [orders.merchantId],
    references: [merchants.id],
  }),
  orderItems: many(orderItems),
  payment: one(payments),
  delivery: one(deliveries),
}));

// Additional relations for proper Drizzle Studio support
export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id],
  }),
  driver: one(users, {
    fields: [deliveries.driverId],
    references: [users.id],
  }),
}));

export const wingPointsRelations = relations(wingPoints, ({ one }) => ({
  user: one(users, {
    fields: [wingPoints.userId],
    references: [users.id],
  }),
}));

export const wingPointsTransactionsRelations = relations(wingPointsTransactions, ({ one }) => ({
  user: one(users, {
    fields: [wingPointsTransactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [wingPointsTransactions.orderId],
    references: [orders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}));

export const promotionUsageRelations = relations(promotionUsage, ({ one }) => ({
  promotion: one(promotions, {
    fields: [promotionUsage.promotionId],
    references: [promotions.id],
  }),
  user: one(users, {
    fields: [promotionUsage.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [promotionUsage.orderId],
    references: [orders.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));