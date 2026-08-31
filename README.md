# SMA — Subscription Management App

A full-stack mobile app for tracking personal subscriptions and understanding where your money goes each month. Add the services you pay for, see what's renewing soon, cancel or reactivate them, and get a monthly breakdown of your spending by category.

Built with React Native (Expo) and TypeScript on the front end, and a custom Node/Express + MongoDB API on the back end, with authentication handled by Clerk.

- **Frontend repo:** https://github.com/madihamamdouh/SMA
- **Backend repo:** https://github.com/madihamamdouh/SMA-backend
- **Live API:** https://sma-backend-jrbz.onrender.com

---

## Features

- **Authentication** — email/password sign-up and sign-in with email-code verification, powered by Clerk. Every API request is tied to the signed-in user.
- **Subscription tracking** — create, view, edit, and delete subscriptions, each with a name, price, billing cycle, category, payment method, and renewal date.
- **Cancel & reactivate** — soft-cancel a subscription (keeping its history) and reactivate it later, rather than deleting it outright.
- **Swipe to delete** — swipe a subscription to permanently remove it, with a confirmation prompt.
- **Upcoming renewals** — the home screen surfaces subscriptions renewing within the next 7 days so nothing charges you by surprise, with a "view all" modal for the full renewal schedule.
- **Monthly insights** — a spending-by-category chart and a real monthly-spend total, with yearly plans normalized to their monthly cost.
- **Search & filter** — quickly find subscriptions by name, category, plan, or status.
- **Loading & error states** — every data fetch shows a loading state and a retry option on failure.

---

## Screenshots

| Home | Insights | Subscriptions | Sign In |
|------|----------|---------------|---------|
| ![Home](screenshots/home.png) | ![Insights](screenshots/insights.png) | ![Subscriptions](screenshots/subscriptions.png) | ![Sign In](screenshots/signin.png) |

---

## Tech Stack

**Frontend**
- React Native (Expo) + TypeScript
- Expo Router (file-based navigation)
- NativeWind (Tailwind for React Native)
- Zustand (state management)
- Clerk (authentication)
- dayjs (date handling)
- PostHog (analytics)

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Clerk (token verification)
- Hosted on Render, database on MongoDB Atlas

---

## Architecture

The project is split into two repositories:

- **Frontend (this repo)** — the Expo mobile app. It handles the UI, authentication flow, and talks to the backend over a REST API. Subscription state lives in a Zustand store; each screen reads from it and triggers fetches through a small API client.
- **Backend** ([SMA-backend](https://github.com/madihamamdouh/SMA-backend)) — an Express REST API with full CRUD for subscriptions, Clerk-verified authentication scoping every record to its owner, and a MongoDB aggregation endpoint that computes spending grouped by category.

The app authenticates with Clerk, attaches the session token to each request, and the backend verifies that token before returning or modifying any data — so a user only ever sees and edits their own subscriptions.

---

## Getting Started

### Prerequisites
- Node.js (v20+)
- Expo Go app on your phone, or an iOS/Android simulator
- A Clerk account (for auth keys)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/madihamamdouh/SMA.git
   cd SMA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root with your Clerk publishable key:
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. Point the app at the API. In `lib/api.ts`, set `API_BASE_URL` to the live backend (or your own local instance):
   ```ts
   const API_BASE_URL = "https://sma-backend-jrbz.onrender.com";
   ```

5. Start the app:
   ```bash
   npx expo start
   ```
   Scan the QR code with Expo Go, or open it in a simulator.

> Note: the backend runs on a free Render tier, which sleeps after inactivity. The first request after an idle period may take 30–50 seconds while the service wakes up.

---

## What I Built

I wrote all of the code in this project myself to learn full-stack development end to end — not just the UI, but the entire backend, authentication, data layer, analytics, and deployment. Highlights:

- Designed and built the **REST API from scratch** (Express + Mongoose), including the data model, per-user authorization, and input validation.
- Implemented **Clerk authentication** across both the app and the API, including token verification on the server.
- Built the **Insights** feature, including a **MongoDB aggregation pipeline** that computes spending grouped by category on the database.
- Implemented the full **subscription lifecycle** — create, cancel/reactivate, swipe-to-delete — with client-side state management in Zustand.
- Handled **deployment** — the backend on Render, the database on MongoDB Atlas.

---

## Author

**Madiha Mamdouh** — [@madihamamdouh](https://github.com/madihamamdouh)
