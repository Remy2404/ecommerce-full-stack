# Next.js E-commerce MVP - Full Stack Project Plan

## Project Overview

**Timeline**: 6-8 weeks for MVP
**Team Size**: 4 developers
**Tech Stack**: Next.js 14 (App Router), PostgreSQL, Drizzle ORM, NextAuth.js

---

## Tech Stack

### Core Framework
- **Next.js 14** (App Router with Server Components)
- **TypeScript** for type safety
- **React 18** with Server & Client Components

### Database & ORM
- **PostgreSQL** for database
- **Drizzle ORM** for database operations
- **Drizzle Kit** for migrations
- **Zod** for schema validation

### Authentication
- **NextAuth.js v5** for authentication
- Email/Password + Google OAuth
- JWT sessions

### UI & Styling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **tailwindcss-animate** for Tailwind animations
- **tailwind-merge** & **clsx** for class management
- **Lucide React** for icons

### API & Communication
- **Axios** for API calls (client-side)
- **WebSocket** for real-time updates
- **Server Actions** for server-side mutations

### Environment & Config
- **dotenv** for environment variables
- **TypeScript** strict mode

---

## MVP Feature Scope

### Core Features (Must Have)

1. **User Authentication**
   - Register/Login/Logout (NextAuth.js)
   - JWT-based sessions
   - Google OAuth integration
   - Password recovery
   - Email verification

2. **Product Catalog**
   - Product listing with pagination
   - Product detail page
   - Category filtering
   - Search functionality (full-text search)
   - Sort by price/name
   - Real-time stock updates (WebSocket)

3. **Shopping Cart**
   - Add/Remove items
   - Update quantities
   - Cart persistence (database)
   - Real-time cart updates (WebSocket)
   - Cart summary

4. **Checkout Process**
   - Shipping information form with Zod validation
   - Order summary
   - Payment processing KHQR 
   - Order confirmation

5. **Order Management**
   - Order history for users
   - Real-time order status tracking (WebSocket)
   - Order details view
   - Download invoice (PDF)

---

## Project Structure

```
ecommerce-nextjs/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/                       # Auth group routes
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── reset-password/
│   │   │       └── page.tsx
│   │   ├── (shop)/                       # Shop group routes
│   │   │   ├── products/
│   │   │   │   ├── page.tsx              # Product listing
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Product detail
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── api/                         
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── cart/
│   │   │   │   └── route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── payments/
│   │   │   │   ├── create-intent/
│   │   │   │   │   └── route.ts
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts
│   │   │   └── websocket/
│   │   │       └── route.ts
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home page
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                           # Radix UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   └── tabs.tsx
│   │   ├── common/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── search-bar.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── loading-spinner.tsx
│   │   ├── products/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-list.tsx
│   │   │   ├── product-detail.tsx
│   │   │   ├── product-filters.tsx
│   │   │   ├── product-search.tsx
│   │   │   └── product-image-gallery.tsx
│   │   ├── cart/
│   │   │   ├── cart-item.tsx
│   │   │   ├── cart-summary.tsx
│   │   │   ├── cart-drawer.tsx
│   │   │   └── cart-badge.tsx
│   │   ├── checkout/
│   │   │   ├── checkout-form.tsx
│   │   │   ├── shipping-form.tsx
│   │   │   ├── payment-form.tsx
│   │   │   └── order-summary.tsx
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── google-auth-button.tsx
│   │   │   └── auth-guard.tsx
│   │   └── animations/
│   │       ├── fade-in.tsx
│   │       ├── slide-in.tsx
│   │       └── scale-in.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                  # Drizzle client
│   │   │   ├── schema.ts                 # Database schema
│   │   │   └── migrations/
│   │   ├── auth/
│   │   │   ├── auth.config.ts            # NextAuth config
│   │   │   └── auth.ts                   # NextAuth setup
│   │   ├── validations/
│   │   │   ├── auth.ts                   # Zod schemas for auth
│   │   │   ├── product.ts                # Zod schemas for products
│   │   │   ├── order.ts                  # Zod schemas for orders
│   │   │   └── cart.ts                   # Zod schemas for cart
│   │   ├── utils/
│   │   │   ├── cn.ts                     # Class name utility
│   │   │   ├── format.ts                 # Format helpers
│   │   │   └── validators.ts
│   │   ├── api/
│   │   │   ├── client.ts                 # Axios client config
│   │   │   └── endpoints.ts              # API endpoints
│   │   ├── websocket/
│   │   │   ├── client.ts                 # WebSocket client
│   │   │   └── server.ts                 # WebSocket server
│   │   └── constants.ts
│   │
│   ├── actions/                          # Server Actions
│   │   ├── auth.actions.ts
│   │   ├── product.actions.ts
│   │   ├── cart.actions.ts
│   │   └── order.actions.ts
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-cart.ts
│   │   ├── use-products.ts
│   │   ├── use-websocket.ts
│   │   └── use-toast.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── cart.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── images/
│   └── icons/
│
├── drizzle/
│   ├── migrations/
│   └── schema.ts
│
├── .env.local.example
├── .env.local
├── drizzle.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Database Schema (Drizzle ORM)

### File: `src/lib/db/schema.ts`

```typescript
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
```

---

## Zod Validation Schemas

### File: `src/lib/validations/product.ts`

```typescript
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(2, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL'),
  images: z.array(z.string().url()).optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  featured: z.boolean().optional(),
});

export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(12),
});
```

### File: `src/lib/validations/auth.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

### File: `src/lib/validations/order.ts`

```typescript
import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'Zip code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().positive(),
  })),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['stripe', 'paypal']),
});
```

---

## Team Assignment & Responsibilities

### **Ramy: Frontend Lead - Product Pages & UI System**

**Focus**: Product catalog, UI components with Radix UI, animations with Framer Motion

**Responsibilities**:
- Set up Next.js 14 project with App Router
- Configure Tailwind CSS + Radix UI + Framer Motion
- Create reusable UI component library (Button, Input, Card, Dialog, etc.)
- Build product listing page with Server Components
- Implement product detail page with image gallery
- Create product filters and search (client components)
- Implement animations with Framer Motion (page transitions, cards, etc.)
- Set up responsive design system
- Product sorting and pagination
- Loading and error states

**Key Deliverables**:
- Complete Radix UI component library
- Product listing with filters, search, pagination
- Product detail page with animated gallery
- Responsive layout system
- Animated transitions and micro-interactions

**Estimated Time**: 2-3 weeks

---

### **Rith: Authentication & User Management**

**Focus**: NextAuth.js setup, user authentication, protected routes

**Responsibilities**:
- NextAuth.js v5 configuration
- Email/Password authentication with bcrypt
- Google OAuth integration
- Protected route middleware
- User registration with email verification
- Password reset flow
- User profile page
- Role-based access control (admin/user)
- Session management
- Auth UI components with Radix UI
- Integration with Drizzle ORM for user data

**Key Deliverables**:
- Complete authentication system
- Google OAuth integration
- Protected routes and middleware
- User profile management
- Admin role checking
- Email verification system

**Estimated Time**: 1.5-2 weeks

---

### **Tong: Shopping Cart & Checkout with WebSocket**

**Focus**: Cart functionality, checkout flow, real-time updates

**Responsibilities**:
- Shopping cart with Drizzle ORM
- Cart CRUD operations (Server Actions)
- Cart drawer component (Radix UI Dialog)
- Real-time cart updates with WebSocket
- Cart badge with item count
- Multi-step checkout form with Zod validation
- Shipping form with validation
- Stripe payment integration
- Order confirmation page
- Cart persistence in database
- Work with Peaktra on WebSocket server

**Key Deliverables**:
- Fully functional shopping cart
- Real-time cart updates (WebSocket)
- Multi-step checkout flow
- Stripe payment integration
- Order confirmation system

**Estimated Time**: 2-3 weeks

---

### **Peaktra: Backend - Database, API & WebSocket**

**Focus**: Drizzle ORM setup, API routes, WebSocket server, order management

**Responsibilities**:
- PostgreSQL database setup
- Drizzle ORM configuration and migrations
- Database schema design
- Seed data for products
- API routes for products, cart, orders
- Server Actions for data mutations
- WebSocket server setup for real-time updates
- Order creation and management
- Payment webhook handling (Stripe)
- Admin API endpoints
- Database queries optimization
- Order status updates via WebSocket

**Key Deliverables**:
- Complete database setup with Drizzle
- All API routes
- WebSocket server for real-time features
- Order management system
- Payment processing logic
- Admin endpoints

**Estimated Time**: 2-3 weeks

---

## Development Phases

### **Week 1-2: Foundation**

**All**:
- Next.js project setup
- PostgreSQL + Drizzle ORM setup
- Git workflow and coding standards
- Environment variables setup

**Ramy**:
- Tailwind CSS + Radix UI setup
- UI component library
- Basic layouts and routing
- Framer Motion setup

**Rith**:
- NextAuth.js configuration
- Auth pages (login, register)
- Database schema for users

**Tong**:
- Cart schema design
- Cart components structure
- WebSocket client setup

**Peaktra**:
- Database migrations
- Product schema and seed data
- Basic API routes
- WebSocket server setup

---

### **Week 3-4: Core Features**

**Ramy**:
- Product listing page
- Product filters and search
- Product card animations
- Pagination component

**Rith**:
- Complete auth flow
- Google OAuth
- Protected routes
- User profile

**Tong**:
- Shopping cart functionality
- Add/remove items
- Cart drawer
- Cart Server Actions

**Peaktra**:
- Product API routes
- Cart API integration
- WebSocket for cart updates
- Product queries optimization

---

### **Week 5-6: Integration & Advanced Features**

**Ramy**:
- Product detail page
- Image gallery with animations
- Loading states
- Error handling

**Rith**:
- Admin role implementation
- Admin middleware
- Email verification

**Tong**:
- Checkout flow
- Stripe integration
- Order confirmation
- Real-time cart updates

**Peaktra**:
- Order creation system
- Payment webhooks
- Order status WebSocket
- Admin order management

---

### **Week 7-8: Testing & Polish**

**All**:
- Bug fixes
- Cross-feature testing
- Performance optimization
- Code review
- UI/UX improvements
- Documentation
- Deployment preparation

---

## Key Configuration Files

### `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### `src/lib/auth/auth.config.ts` (NextAuth)

```typescript
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/validations/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);
        
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });
          
          if (!user || !user.password) return null;
          
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) return user;
        }
        
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      
      const user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(token.sub)),
      });
      
      if (user) {
        token.role = user.role;
      }
      
      return token;
    },
  },
} satisfies NextAuthConfig;
```

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... add more Radix UI colors
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

## WebSocket Implementation

### Server: `src/lib/websocket/server.ts`

```typescript
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initWebSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-cart', (userId: string) => {
      socket.join(`cart-${userId}`);
    });

    socket.on('join-order', (orderId: string) => {
      socket.join(`order-${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('WebSocket not initialized');
  return io;
};

// Emit cart update
export const emitCartUpdate = (userId: string, cart: any) => {
  const io = getIO();
  io.to(`cart-${userId}`).emit('cart-updated', cart);
};

// Emit order status update
export const emitOrderUpdate = (orderId: string, order: any) => {
  const io = getIO();
  io.to(`order-${orderId}`).emit('order-updated', order);
};