# Project Context: E-commerce Frontend

## Overview
This is a modern, responsive E-commerce frontend built with **Next.js 16 (App Router)**. It features a "Minimalist 2.0" design, real-time functionality via WebSockets, and a robust backend integration using Server Actions and Drizzle ORM.


## Tech Stack
- **Framework:** Next.js 16 (App Router, Server & Client Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Radix UI, Framer Motion, tailwindcss-animate
- **Database:** PostgreSQL (accessed via Drizzle ORM)
- **Authentication:** NextAuth.js v5 (Auth.js) - Google OAuth & Credentials
- **State Management:** React Server Actions (mutations), WebSockets (real-time updates)
- **Validation:** Zod
- **Payments:** Stripe (planned), KHQR (planned)

## Architecture
The project follows a feature-based modular architecture within the `src` directory.

### Key Directories
- **`src/app`**: Route definitions (App Router).
  - `(auth)`: Authentication routes (login, register).
  - `(shop)`: Main shopping routes (products, cart, checkout).
  - `api`: API route handlers (Webhooks, etc.).
- **`src/actions`**: Server Actions for data mutations (auth, cart, order, product).
- **`src/components`**: UI components organized by domain.
  - `ui`: Reusable primitives (buttons, inputs) - likely Shadcn/Radix.
  - `common`: Layout components (header, footer).
  - `products`, `cart`, `checkout`: Domain-specific components.
- **`src/lib`**: Core utilities and configuration.
  - `db`: Drizzle ORM setup and schema.
  - `auth`: NextAuth configuration.
  - `validations`: Zod schemas.
  - `websocket`: Socket.IO setup.

### Design Patterns
- **Server Components:** Used by default for data fetching and rendering static content.
- **Client Components:** Used for interactivity (forms, animations, real-time updates).
- **Server Actions:** Used for form submissions and data mutations, replacing traditional API routes for internal logic.
- **WebSockets:** Used for real-time cart updates and order status tracking.

## Database Schema (Drizzle ORM)
Defined in `src/lib/db/schema.ts`.
- **Users:** `id`, `name`, `email`, `password`, `role` (user/admin).
- **Products:** `id`, `name`, `slug`, `price`, `stock`, `images` (JSONB).
- **Carts:** `id`, `userId`, `sessionId`.
- **CartItems:** Link products to carts with quantity.
- **Orders:** `id`, `orderNumber`, `status`, `paymentStatus`, `shippingAddress` (JSONB).
- **OrderItems:** Snapshot of products at purchase time.

## Development Workflow

### Scripts
- `pnpm run dev`: Start development server.
- `pnpm run build`: Build for production.
- `pnpm run start`: Start production server.
- `pnpm run db:generate`: Generate SQL migrations from schema.
- `pnpm run db:migrate`: Apply migrations to the database.
- `pnpm run db:push`: Push schema changes directly (prototyping).
- `pnpm run db:studio`: Open Drizzle Studio to view data.

### Conventions
- **Strict TypeScript:** No `any`.
- **Validation:** All inputs (API & Forms) must be validated with Zod schemas in `src/lib/validations`.
- **Mobile-First:** Tailwind classes should prioritize mobile layouts.
- **Security:** Protected routes via Proxy (`src/proxy.ts`) and Auth Guard components.
