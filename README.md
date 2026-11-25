# Equipment Rental Platform — Client Application

## Project Purpose

This is the frontend of an equipment rental marketplace connecting customers, equipment owners, and administrators. Built with Next.js App Router, it provides role-based dashboards, equipment browsing and booking, Stripe Checkout integration, and real-time analytics.

## Live URLs

- **Frontend:** https://equipment-rental-platform-client-zeta.vercel.app/
- **Backend API:** https://server-uzzal6090.vercel.app/

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| React | React 19 |
| Styling | Tailwind CSS v4, shadcn/ui components |
| Auth | Better Auth (email/password + Google OAuth) |
| State/Forms | React Hook Form, Zod validation |
| Charts | Recharts (dashboard analytics) |
| UI/UX | Framer Motion, Lucide React, Sonner toasts |
| Build | Turbopack, ESLint 9 |

**Verified dependencies from `package.json`:**
- `@base-ui/react`, `@fontsource-variable/inter`, `@hookform/resolvers`
- `better-auth`, `class-variance-authority`, `clsx`, `cn`
- `framer-motion`, `lucide-react`, `next`, `next-themes`
- `react`, `react-dom`, `react-hook-form`, `recharts`
- `shadcn`, `sonner`, `tailwind-merge`, `tw-animate-css`, `zod`

## Features

All features below are implemented and confirmed in source code:

### Authentication
- Email/password signup and signin
- Google OAuth integration
- JWT-based session management with Better Auth
- Role-based access: Customer, Owner, Admin

### Customer Features
- Equipment browsing with search, filters, sorting, pagination
- Equipment details with image gallery
- Favorites (save/unsave equipment)
- Booking with date selection and quantity
- Stripe Checkout integration for payments
- Booking status tracking (success/cancel pages)
- Rental history
- Profile management (name, phone, address)
- Profile image upload (ImgBB)

### Owner Features
- Equipment CRUD (create, read, update, delete)
- Equipment image upload (ImgBB)
- Owner dashboard with analytics (earnings, bookings charts)
- Rental management for owned equipment
- Owner equipment list with all statuses

### Admin Features
- Admin dashboard with platform analytics
- User management (list users, update roles)
- Equipment moderation (approve/reject/delete any equipment)
- Admin rental overview (all rentals across platform)

## Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth group (login, register)
│   │   ├── bookings/           # Booking success/cancel pages
│   │   ├── dashboard/          # Role-based dashboards
│   │   │   ├── admin/          # Admin: users, equipment, rentals
│   │   │   ├── customer/       # Customer dashboard
│   │   │   └── owner/          # Owner: add equipment, my equipment, rentals
│   │   ├── equipment/          # Equipment listing & details
│   │   ├── favorites/          # Customer favorites page
│   │   ├── profile/            # Profile management
│   │   ├── rentals/            # Customer rental history
│   │   ├── globals.css         # Global styles + Tailwind
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Homepage
│   │   └── providers.tsx       # Client providers (theme, auth, toasts)
│   ├── assets/                 # Static assets (brand, images)
│   ├── components/             # React components
│   │   ├── auth/               # Auth forms, Google sign-in
│   │   ├── brand/              # Logo, brand components
│   │   ├── dashboard/          # Charts, sidebar, profile context
│   │   ├── equipment/          # Equipment cards, image upload
│   │   ├── home/               # Homepage sections (hero, categories, reviews, etc.)
│   │   ├── layout/             # Footer, layout components
│   │   ├── nav/                # Navbar, navigation
│   │   ├── profile/            # Profile image upload
│   │   ├── shared/             # Shared components
│   │   └── ui/                 # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── constants/              # Categories, validation rules, reviews
│   ├── features/               # Feature-specific logic
│   ├── hooks/                  # Custom React hooks (use-auth-session)
│   ├── lib/                    # Utilities & API clients
│   │   ├── api.ts              # API base URL, auth token, request helper
│   │   ├── auth-client.ts      # Better Auth React client
│   │   └── utils.ts            # cn() utility for class merging
│   ├── providers/              # React context providers
│   └── types/                  # TypeScript type definitions
├── public/                     # Static public assets
├── .env.example                # Environment template
├── .env.local                  # Local overrides (gitignored)
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
└── components.json             # shadcn/ui config
```

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Yes | Backend auth base URL (Better Auth) | `http://localhost:5000` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `http://localhost:5000` |
| `NEXT_PUBLIC_DEBUG_AUTH` | No | Enable auth debug logging | `false` |

**Usage in code:**
- `NEXT_PUBLIC_BETTER_AUTH_URL` → `src/lib/auth-client.ts:5` (Better Auth client `baseURL`)
- `NEXT_PUBLIC_API_URL` → `src/lib/api.ts:4` (API base URL for all requests)
- `NEXT_PUBLIC_DEBUG_AUTH` → `src/lib/api.ts:30,40,48` (conditional debug logs)

Create `.env.local` from `.env.example` for local development. Never commit actual secrets.

## Installation & Development

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

**Verified scripts from `package.json`:**
- `dev` — `next dev`
- `build` — `next build`
- `start` — `next start`
- `lint` — `eslint`

## API Integration

The client communicates with the backend via two mechanisms:

1. **Direct API calls** — `src/lib/api.ts` uses `NEXT_PUBLIC_API_URL` as the base URL for all authenticated requests (equipment, bookings, favorites, profile, dashboards). JWT tokens are retrieved from the Better Auth `/api/auth/token` endpoint and sent as `Authorization: Bearer <token>` headers.

2. **Next.js Rewrites (API Proxy)** — `next.config.ts` defines rewrites when `BACKEND_ORIGIN` is set:
   ```
   /api/:path*  →  ${BACKEND_ORIGIN}/api/:path*
   ```
   This proxies `/api/*` requests to the backend, enabling cookie-based auth (Better Auth session cookies) to work seamlessly in development and production. On Vercel, `BACKEND_ORIGIN` is configured as an environment variable pointing to the backend deployment.

## Deployment

- **Platform:** Vercel
- **Frontend URL:** https://equipment-rental-platform-client-zeta.vercel.app/
- **Backend URL:** https://server-uzzal6090.vercel.app/
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Environment Variables:** Configure `NEXT_PUBLIC_BETTER_AUTH_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DEBUG_AUTH`, and `BACKEND_ORIGIN` in Vercel project settings.

The Next.js rewrites in `next.config.ts` ensure `/api/*` routes proxy to the backend when `BACKEND_ORIGIN` is set, allowing cookie-based authentication to function on Vercel.

---

*Generated for Assignment 9 — Equipment Rental Platform*