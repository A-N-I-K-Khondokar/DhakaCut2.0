# DhakaCut 2.0 - Premium Salon Booking Application

DhakaCut 2.0 is a complete, production-ready male grooming reservation system built with React 19, Vite, TypeScript, and Tailwind CSS, featuring full integration support with Firebase Auth and Firestore.

## Features

1. **Dual-Mode Backend Architecture**:
   - **Local Mock Mode**: Fallback database pre-seeded with salon branches, stylists, services, and reviews. Instantly functional without configurations.
   - **Firebase Mode**: Uses real cloud database operations when standard `.env` variables are active.
2. **5-Step Booking Wizard**:
   - Stylist selection with experience and specialization cards.
   - Service select displaying durations and pricing.
   - Date picker displaying a rolling 14-day booking calendar.
   - Time slot picking (09:00 AM - 06:30 PM, graying out reserved times).
   - Checkout summary with payment selection dropdowns.
3. **Advanced Customer Listing & Filters**:
   - Grid browsing with search, area selectors, minimum ratings, and sort order.
4. **Client Dashboard**:
   - Tabs for "Upcoming" and "Past" appointments.
   - Reschedule modal to dynamically update reservation slots.
   - Cancellation warnings.
5. **Staff reviews**: Rating updates dynamically.
6. **Admin CRUD suite**: Branch management, stylist cataloguing, service pricing, and booking approvals.
7. **Premium Styling**: Sleek Inter fonts, subtle micro-animations, and responsive grids.

## Folder Directory Structure

```
src/
├── components/   # UI elements (Cards, Tables, Toast notification alerts)
├── context/      # AuthContext session and BookingContext wizard state
├── hooks/        # Custom react hooks wrapping queries and mutations
├── pages/        # Client panel pages and Admin portal views
├── services/     # Firebase connections and Firestore local fallbacks
├── styles/       # CSS theme rules and Tailwind directives
├── types/        # Model interfaces (User, Salon, Service, Staff, Booking)
└── utils/        # Price formatters and email/phone regex validators
```

## Running the Project Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment variables
Duplicate `.env.example` as `.env` and fill in your Firebase credentials if you wish to run on the cloud. By default, the application runs in a simulated local-first playground mode using local storage.
```bash
cp .env.example .env
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demonstration Accounts

To test the application immediately:
- **Regular Customer Profile**:
  - Email: `customer@dhacut.com`
  - Password: `123456`
- **Branch Administrator Suite**:
  - Email: `admin@dhacut.com`
  - Password: `123456`
# DhakaCut2.0
