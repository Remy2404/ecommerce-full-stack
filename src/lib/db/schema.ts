import { pgTable, serial, varchar, text, integer, decimal, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  password: varchar('password', { length: 255 }), // Hashed
  image: text('image'),
  role: varchar('role', { length: 50 }).default('user'), // 'user' or 'admin'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Products Table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }),
  imageUrl: text('image_url'),
  images: jsonb('images').default([]), // Array of image URLs
  stock: integer('stock').default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  numReviews: integer('num_reviews').default(0),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Carts Table
export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }), // For guest users
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Cart Items Table
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: integer('cart_id').references(() => carts.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders Table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 50 }).default('pending'), // pending, processing, shipped, delivered, cancelled
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'),
  paymentId: varchar('payment_id', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  shippingAddress: jsonb('shipping_address'), // JSON object
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order Items Table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  quantity: integer('quantity'),
  imageUrl: text('image_url'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  carts: many(carts),
}));

export const productsRelations = relations(products, ({ many }) => ({
  cartItems: many(cartItems),
  orderItems: many(orderItems),
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
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
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
}));
