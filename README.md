# ✂️ DhakaCut 2.0 — Premium Male Grooming Booking Platform

> A full-stack, production-ready salon booking web application for Dhaka's premier male grooming chain. Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Firebase (Firestore + Auth)**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Modes: Mock vs Firebase](#modes-mock-vs-firebase)
- [Demo Accounts](#demo-accounts)
- [Application Routes](#application-routes)
- [User Guide](#user-guide)
  - [Customer Flow](#customer-flow)
  - [Admin Flow](#admin-flow)
- [Database Seeding](#database-seeding)
- [Firestore Security Rules](#firestore-security-rules)
- [Deployment](#deployment)
- [Data Models](#data-models)
- [Contributing](#contributing)

---

## Overview

**DhakaCut 2.0** is a complete salon appointment booking platform serving 10 DhakaCut branches across Dhaka. Customers can discover salons, browse stylists, select services, and book a precise 30-minute time slot — all in under 60 seconds. Admins have a full management dashboard to oversee branches, staff, services, and bookings.

The app supports two modes:
- **Mock Mode** — fully functional offline using `localStorage` (no Firebase setup needed)
- **Firebase Mode** — live cloud database with Firestore + Firebase Auth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Backend / Database | Firebase Firestore |
| Authentication | Firebase Auth (Email/Password + Google OAuth) |
| Maps | React Leaflet + Leaflet.js |
| Icons | Lucide React |
| Hosting | Vercel / Firebase Hosting |

---

## Features

### Customer Features
- **Home Page** — Hero section, value propositions, 6 featured salon cards, and CTA
- **Salon Listing** — Browse all branches with live search, area filter, min-rating filter, sort (by rating / name / area), and pagination
- **Salon Detail** — View full branch info, stylist roster with ratings, service menu with pricing, interactive map pin, and customer reviews
- **5-Step Booking Wizard** (modal):
  1. Pick a **stylist** (photo, role, experience, specializations, rating)
  2. Pick a **service** (name, duration, price)
  3. Pick a **date** (rolling 14-day calendar)
  4. Pick a **time slot** (09:00 AM – 06:30 PM in 30-min increments; booked slots greyed out)
  5. **Checkout summary** with payment method selector (Cash / Card / bKash / Nagad)
- **Map Search Page** — Interactive Leaflet map showing all salon pins; "Use My Location" to find nearest branches
- **Customer Dashboard** — Upcoming & Past bookings tabs, reschedule modal, cancellation with reason, post-service review form
- **Review System** — 1–5 star rating + comment; prevents duplicate reviews per booking

### Auth Features
- Email/password Sign Up and Login
- Google OAuth sign-in
- Password reset via email
- Protected routes (dashboard requires login; admin routes require `role: 'admin'`)
- Session persistence via `localStorage`

### Admin Features (requires admin role)

| Page | Capabilities |
|---|---|
| `/admin` | Stats dashboard — total bookings, revenue, staff count, salon count, pending bookings, top services |
| `/admin/salons` | Create / Edit / Delete salon branches |
| `/admin/staff` | Create / Edit / Delete stylists; assign to salon |
| `/admin/services` | Create / Edit / Delete services with price and duration |
| `/admin/bookings` | View all bookings; approve, complete, or cancel individual bookings |

---

## Project Structure

```
DhakaCut2.0/
├── public/                  # Static assets
├── src/
│   ├── App.tsx              # Root component — routes, providers, global modals
│   ├── main.tsx             # Vite entry point
│   ├── components/          # Reusable UI components
│   │   ├── AdminRoute.tsx   # Guards admin-only routes
│   │   ├── AdminTable.tsx   # Generic sortable table for admin pages
│   │   ├── BookingModal.tsx # 5-step booking wizard modal
│   │   ├── Button.tsx       # Styled button with variants (primary/outline/white)
│   │   ├── Card.tsx         # Card / CardHeader / CardBody primitives
│   │   ├── DebugPanel.tsx   # Dev-only panel (visible in dev mode only)
│   │   ├── Footer.tsx       # Site-wide footer
│   │   ├── Input.tsx        # Styled form input
│   │   ├── Modal.tsx        # Generic modal overlay
│   │   ├── Navbar.tsx       # Top navigation bar with auth state
│   │   ├── ReviewForm.tsx   # Star rating + comment form
│   │   ├── SalonCard.tsx    # Salon listing card
│   │   ├── SalonMapView.tsx # Leaflet map component
│   │   ├── StaffCard.tsx    # Stylist card with rating
│   │   ├── TimeSlotPicker.tsx # Time grid with availability
│   │   └── Toast.tsx        # Toast notification system
│   ├── context/
│   │   ├── AuthContext.tsx  # Global auth state (login / signup / logout)
│   │   ├── BookingContext.tsx# Booking wizard state machine
│   │   └── ToastContext.tsx # Toast notification context
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useAvailableSlots.ts
│   │   ├── useBooking.ts
│   │   ├── useBookings.ts
│   │   ├── useNearbySearch.ts
│   │   ├── useReviews.ts
│   │   ├── useSalon.ts
│   │   ├── useSalons.ts
│   │   ├── useServices.ts
│   │   ├── useStaff.ts
│   │   └── useToast.ts
│   ├── pages/               # Route-level page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── SalonListingPage.tsx
│   │   ├── SalonDetailPage.tsx
│   │   ├── BookingPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MapSearchPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminSalons.tsx
│   │   ├── AdminStaff.tsx
│   │   ├── AdminServices.tsx
│   │   ├── AdminBookings.tsx
│   │   ├── SeedPage.tsx     # One-time Firestore seeding tool
│   │   └── NotFoundPage.tsx
│   ├── services/
│   │   ├── firebase.ts      # Firebase app initialization
│   │   ├── firestoreService.ts # Unified service exports
│   │   └── firestore/       # Per-domain service modules
│   │       ├── auth.ts      # Sign up, login, Google OAuth, password reset
│   │       ├── bookings.ts  # CRUD for bookings + time-slot availability
│   │       ├── core.ts      # isMockMode flag, localStorage helpers, MOCK data
│   │       ├── reviews.ts   # Review CRUD
│   │       ├── salons.ts    # Salon CRUD
│   │       ├── services.ts  # Service CRUD
│   │       └── staff.ts     # Staff CRUD
│   ├── styles/
│   │   ├── globals.css      # Base resets
│   │   ├── theme.css        # CSS custom properties (colors, shadows)
│   │   └── animations.css   # Keyframe animations
│   ├── types/               # TypeScript interfaces
│   │   ├── index.ts         # Re-exports
│   │   ├── booking.ts       # Booking interface
│   │   ├── review.ts        # Review interface
│   │   ├── salon.ts         # Salon interface
│   │   ├── service.ts       # Service interface
│   │   ├── staff.ts         # Staff interface
│   │   └── user.ts          # User interface (with role: 'customer' | 'admin')
│   └── utils/
│       ├── formatters.ts    # Currency, date, duration formatters
│       └── helpers.ts       # ID generation, date utilities
├── .env.example             # Environment variable template
├── firestore.rules          # Firestore security rules
├── firebase.json            # Firebase Hosting / Firestore config
├── tailwind.config.js       # Tailwind theme customization
├── vite.config.ts           # Vite build configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- *(Optional)* A Firebase project if you want live Firestore mode

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/A-N-I-K-Khondokar/DhakaCut2.0.git
cd DhakaCut2.0

# 2. Install dependencies
npm install
```

### Environment Variables

Copy the example file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

> If you skip this step and run without a `.env`, the app will fall back to **Mock Mode** automatically.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Other commands:

```bash
npm run build    # Production build → /dist
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

---

## Modes: Mock vs Firebase

The `isMockMode` flag in `src/services/firestore/core.ts` controls which backend is used.

| | Mock Mode | Firebase Mode |
|---|---|---|
| **Data storage** | `localStorage` | Firestore cloud database |
| **Auth** | Simulated (no real Firebase Auth) | Firebase Auth (email + Google) |
| **Setup required** | None — works out of the box | Firebase project + `.env` credentials |
| **Data persistence** | Browser only (clears on `localStorage.clear()`) | Cloud — persists across devices |
| **When is it active?** | `isMockMode = true` in `core.ts` | `isMockMode = false` (default) |

**To switch to Mock Mode**, edit line 25 of `src/services/firestore/core.ts`:

```ts
// Change this:
export const isMockMode = false;
// To this:
export const isMockMode = true;
```

---

## Demo Accounts

Use these pre-seeded accounts to explore the app instantly (works in **both** Mock and Firebase modes after seeding):

| Role | Email | Password |
|---|---|---|
| Customer | `customer@dhakacut.com` | `123456` |
| Admin | `anik19116@gmail.com` | *(set during signup or Firebase Auth)* |

> **Admin access** is granted automatically to any account with the email `anik19116@gmail.com`. All other accounts are assigned the `customer` role.

---

## Application Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page with featured salons |
| `/salons` | Public | Full salon listing with filters |
| `/salons/:id` | Public | Individual salon detail + booking trigger |
| `/salon/:id` | Public | Alias for `/salons/:id` |
| `/map` or `/map-search` | Public | Interactive map to find nearby salons |
| `/login` | Public | Login with email/password or Google |
| `/signup` | Public | Create a new customer account |
| `/booking` | Public | Booking confirmation page |
| `/dashboard` | Auth required | Customer appointment dashboard |
| `/admin` | Admin only | Admin stats and overview |
| `/admin/salons` | Admin only | Branch management |
| `/admin/staff` | Admin only | Stylist management |
| `/admin/services` | Admin only | Service and pricing management |
| `/admin/bookings` | Admin only | All bookings management |
| `/seed` | Public | One-time Firestore database seeder |

---

## User Guide

### Customer Flow

#### 1. Browse Salons
- Go to **`/salons`** to see all DhakaCut branches
- Use the **search bar** to filter by salon name
- Use the **area dropdown** to filter by neighborhood (Banani, Gulshan, Dhanmondi, etc.)
- Set a **minimum star rating** to filter by quality
- Sort by **Rating**, **Name**, or **Area**
- Click **"View Salon"** on any card to open the detail page

#### 2. Find a Salon Near You
- Go to **`/map`** or click "Find Salon Near Me" on the homepage
- Click **"Use My Location"** to detect your GPS position
- The map highlights the nearest branches; click any pin or card to book

#### 3. Book an Appointment
From any salon detail page, click **"Book Now"** to open the 5-step wizard:

| Step | What to do |
|---|---|
| **Step 1 – Stylist** | Browse stylist cards (photo, role, years of experience, specializations, star rating). Click to select. |
| **Step 2 – Service** | Choose from available services showing name, duration, and price (e.g. Classic Haircut ৳250 / 30 min). |
| **Step 3 – Date** | Pick any date within the next 14 days from the calendar. |
| **Step 4 – Time** | Click an available 30-minute slot (greyed-out slots are already booked). |
| **Step 5 – Checkout** | Review your booking summary and pick a payment method (Cash / Card / bKash / Nagad). Click "Confirm Booking". |

> You must be **logged in** to complete a booking. If not, you will be redirected to the login page.

#### 4. Manage Your Bookings (Dashboard)
- Go to **`/dashboard`** after logging in
- **Upcoming tab** — see confirmed future appointments with options to:
  - Reschedule — pick a new date and time slot
  - Cancel — provide a reason and cancel the booking
  - Rate — leave a review after the appointment
- **Past tab** — history of completed/cancelled bookings with review status

---

### Admin Flow

> Admin accounts are identified by the email `anik19116@gmail.com`. Navigate to `/admin` after logging in.

#### Admin Dashboard (`/admin`)
Real-time stats cards:
- Total bookings, total revenue, number of salons, number of staff
- Pending approval count
- Recent bookings list

#### Manage Salons (`/admin/salons`)
- **Add** a new branch (name, area, address, phone, lat/lng, image URL, operating hours)
- **Edit** any existing branch details
- **Delete** a branch

#### Manage Staff (`/admin/staff`)
- **Add** a stylist (name, role, experience, specializations, assigned salon, phone, image)
- **Edit** stylist details
- **Delete** a stylist

#### Manage Services (`/admin/services`)
- **Add** a service (name, description, price in BDT, duration in minutes, category)
- **Edit** pricing or duration
- **Delete** a service

#### Manage Bookings (`/admin/bookings`)
- View all bookings across all branches with status badges
- **Approve** a pending booking — sets status to `confirmed`
- **Complete** a booking — sets status to `completed`
- **Cancel** any booking

---

## Database Seeding

When running in **Firebase Mode** for the first time, you need to populate Firestore with the initial dataset (10 salons, ~20 staff, 5 services).

1. Make sure your `.env` is configured and `isMockMode = false`
2. Navigate to **`/seed`** in your browser
3. Click **"Seed Database"** — this writes all mock data to your Firestore collections
4. Once complete, navigate away. **Do not run the seeder again** (it will duplicate data)

> The Firestore rules temporarily allow open writes to `salons`, `services`, and `staff` for seeding. After seeding, you should lock these rules in `firestore.rules`.

---

## Firestore Security Rules

The rules in `firestore.rules` enforce:

| Collection | Read | Write |
|---|---|---|
| `salons` | Public | Open (temporary for seeding — lock after) |
| `services` | Public | Open (temporary for seeding — lock after) |
| `staff` | Public | Open (temporary for seeding — lock after) |
| `users` | Owner or Admin | Owner (create/update), Admin (delete) |
| `bookings` | Any authenticated user | Owner (create/update), Admin (delete) |
| `reviews` | Public | Owner (create/update), Admin (delete) |

**To deploy rules to Firebase:**

```bash
npx firebase-tools deploy --only firestore:rules
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add your `VITE_FIREBASE_*` environment variables in the Vercel project dashboard under **Settings → Environment Variables**.

### Firebase Hosting

```bash
# Build first
npm run build

# Deploy to Firebase Hosting
npx firebase-tools deploy --only hosting
```

---

## Data Models

### Salon
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique ID |
| `name` | string | Branch name |
| `area` | string | Dhaka neighborhood |
| `address` | string | Full street address |
| `phone` | string | Contact number |
| `lat` / `lng` | number | GPS coordinates for map |
| `image` | string | Cover image URL |
| `rating` | number | Average star rating |
| `operatingHours` | `{open, close}` | e.g. "09:00" – "20:00" |

### Booking
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique booking ID |
| `userId` | string | Customer's user ID |
| `salonId` | string | Salon branch ID |
| `staffId` | string | Assigned stylist ID |
| `serviceId` | string | Booked service ID |
| `date` | string | YYYY-MM-DD format |
| `time` | string | HH:MM 24-hour format |
| `status` | string | `pending`, `confirmed`, `completed`, or `cancelled` |
| `totalPrice` | number | Price in BDT (Bangladeshi Taka) |
| `paymentMethod` | string | `cash`, `card`, `bkash`, or `nagad` |

### User
| Field | Type | Description |
|---|---|---|
| `id` | string | Firebase Auth UID |
| `email` | string | User email address |
| `displayName` | string | Full name |
| `phone` | string | Phone number |
| `role` | string | `customer` or `admin` |
| `createdAt` | string | ISO timestamp |

### Staff
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique ID |
| `salonId` | string | Assigned branch |
| `name` | string | Stylist name |
| `role` | string | e.g. Senior Stylist, Master Barber |
| `experience` | number | Years of experience |
| `specialization` | string[] | List of skills |
| `avgRating` | number | Average star rating |
| `reviewCount` | number | Number of reviews |
| `image` | string | Profile photo URL |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

*Built with love in Dhaka, Bangladesh.*
