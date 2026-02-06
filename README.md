# Ecommerce Frontend

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://gsap.com/)

A high-performance, minimalist e-commerce platform built with Next.js 16 and modern web technologies. Focuses on premium aesthetics, real-time interactivity, and a robust server-side architecture.

## Overview

This project serves as the primary frontend for a modern e-commerce experience. It utilizes the latest features of Next.js, including the App Router and Server Actions, to provide a seamless and secure shopping interface. The design philosophy adheres to "Minimalist 2.0," emphasizing clean lines, purposeful animations, and a refined user journey.

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    Client[Client Browser]
    Frontend[Next.js 16 Frontend<br/>Port 3000]
    Backend[Spring Boot Backend<br/>Port 8080]
    DB[(PostgreSQL Database<br/>Port 5432)]
    KHQR[KHQR/Bakong API<br/>NBC Cambodia]
    Email[Email Service<br/>SMTP]
    
    Client -->|HTTPS| Frontend
    Frontend -->|REST API| Backend
    Frontend -->|Real-time| Backend
    Backend -->|JPA/Hibernate| DB
    Backend -->|Payment Verification| KHQR
    Backend -->|Notifications| Email
    
    style Frontend fill:#61dafb
    style Backend fill:#6db33f
    style DB fill:#336791
    style KHQR fill:#ff6b6b
```

## Core Features

- **Real-time Synchronization** – Integrated with Socket.IO for live cart updates and order tracking notifications.
- **Server-Driven Logic** – Leveraging React Server Actions for secure and efficient data mutations and form handling.
- **Premium Aesthetics** – Dynamic UI components built with Framer Motion, GSAP, and Three.js for a high-end visual experience.
- **Secure Authentication** – Robust user management via NextAuth.js v5, supporting both OAuth providers and credential-based login.
- **Type-Safe Development** – End-to-end type safety using TypeScript and Zod for schema-based validation.
- **Database Architecture** – High-performance data access layer using Drizzle ORM with PostgreSQL.

### Interactive Highlights

- **Dynamic Hero Sections** – Implemented using Three.js and `three-custom-shader-material` for immersive landing experiences.
- **Smooth Content Transitions** – Powered by GSAP and Framer Motion for non-intrusive, fluid UI feedback.
- **Responsive Animations** – Optimized motion paths that adapt to device capabilities and user preferences.

## Technology Stack

### Framework & Language
- Next.js 16 (App Router)
- TypeScript
- React 19

### Interface & Styling
- Tailwind CSS 4
- Framer Motion
- GSAP
- Radix UI Primitives
- Lucide React Icons

### State & Data Handling
- Zod (Validation)
- Socket.IO (WebSockets)
- Axios

### Visuals & Motion
- Three.js
- Tailwind CSS Animate

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (Recommended) or npm

### Environment Configuration

Create a `.env.local` file in the root directory and configure the following variables:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID from the Google Cloud Console for OAuth. |
| `NEXT_PUBLIC_API_URL` | The base URL of your backend API (e.g., `http://localhost:8080`). |
| `NEXT_PUBLIC_APP_URL` | The base URL of your application (e.g., `http://localhost:3000`). |

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/laytonglee/ecommerce-frontend.git
   cd ecommerce-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Start the development server:
```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `pnpm run dev` – Starts the development server.
- `pnpm run build` – Compiles the application for production.
- `pnpm run start` – Runs the built production server.
- `pnpm run lint` – Executes ESLint to check for code quality.

## Production Build Notes (Windows + Docker/CI)

This project supports a standard `next build` output for local builds and an opt-in standalone output for Docker/CI.

### Windows-safe build (default)

```bash
pnpm run build
```

### Standalone build (Docker/CI)

PowerShell:
```powershell
$env:NEXT_STANDALONE_OUTPUT='true'; pnpm run build
```

Bash:
```bash
NEXT_STANDALONE_OUTPUT=true pnpm run build
```

## License

This project is privately licensed. See the project owner for details.
