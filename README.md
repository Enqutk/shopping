<p align="center">
  <img src="docs/luxe-logo.svg" alt="LUXE" width="180" />
</p>

# LUXE Shopping

Hi! This is my internship first task project: an online fashion store with a customer-facing shop and an admin panel. Customers can sign in with **Google**, browse products, add to cart, place orders, and pay (demo checkout). Admins can manage products, confirm payments, and see live activity on the dashboard.

**Tech:** Next.js (frontend), NestJS (API), PostgreSQL, Drizzle ORM. Real-time updates use Socket.IO (order status, admin notifications).

---

## What to open after setup

| What | URL |
|------|-----|
| Shop (homepage, products, cart) | http://localhost:4200 |
| Admin dashboard | http://localhost:4200/admin |
| API (for testing) | http://localhost:3000/api |

The frontend runs on **port 4200** and the API on **port 3000**. Both need to be running at the same time.

---

## Before you start

You will need:

- **Node.js 20+** and **npm**
- **Docker Desktop** (easiest way to run the database)

If you do not use Docker, you can use any local Postgres database named `shopping` and update `DATABASE_URL` in `.env`.

---

## How to run it (step by step)

Open a terminal in the project folder and follow these steps in order.

**1. Install packages**

```bash
npm install
```

**2. Start the database**

```bash
docker compose up postgres -d
```

Give it a few seconds, then check it is running with `docker compose ps`.

**3. Set up environment variables**

```bash
cp .env.example .env
```

Open `.env` in the root folder and fill in:

- `JWT_SECRET` (any long random string, 32+ characters)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (required for Google sign-in; see step below)
- `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`

The other defaults in `.env.example` are fine for local development.

**4. Set up Google sign-in**

This was part of the project requirements. You need a Google Cloud OAuth client before login will work fully.

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Create credentials** → **OAuth client ID** → type **Web application**.
2. Under **Authorized redirect URIs**, add exactly:

   ```
   http://localhost:3000/api/auth/google/callback
   ```

3. Copy the **Client ID** and **Client secret** into `.env`:

   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true
   ```

4. On the OAuth consent screen, set the app name to **LUXE** (or similar) so the Google button does not show a random project name.

Email/password register and login also work, but please test **Continue with Google** on http://localhost:4200/login after the servers are running.

**5. Create the database tables**

```bash
npx drizzle-kit migrate
```

**6. Start the API** (keep this terminal open)

```bash
npx nx serve api
```

Wait until you see something like: `Application is running on: http://localhost:3000/api`

**7. Start the website** (open a second terminal)

```bash
npx nx dev frontend
```

**8. Optional: add sample products**

If the shop looks empty:

```bash
npx tsx scripts/seed-products.ts
```

Then open http://localhost:4200 in your browser.

---

## Admin panel

There is no built-in admin login. To try the admin side:

1. Register a normal account on the site (http://localhost:4200/register).
2. Open the database:

   ```bash
   docker compose exec postgres psql -U postgres -d shopping
   ```

3. Make your account an admin (use the email you registered with):

   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your.email@example.com';
   ```

4. Log out, log back in, then go to http://localhost:4200/admin

---

## Main features (for review)

**Customer side**
- Product catalog with search and budget filter
- Cart (saved per user when logged in)
- Checkout and demo payment flow
- Order tracking with status updates and notifications
- **Google sign-in** (OAuth) plus email/password register and login

**Admin side**
- Dashboard with sales overview
- Product CRUD
- Order list and detail, update status, confirm payments
- Live activity feed (last 24 hours + real-time events)

---

## If something goes wrong

**"Port 3000 is already in use"**  
The API needs port 3000. The website should use 4200 (`npx nx dev frontend`). Do not run the frontend on 3000.

**Login or API calls fail / 403**  
Check `.env`: `FRONTEND_URL=http://localhost:4200` and `NEXT_PUBLIC_API_URL=http://localhost:3000/api`. Restart both servers after changing `.env`.

**Database errors like "relation does not exist"**  
Run migrations again: `npx drizzle-kit migrate`

**Google login fails (`invalid_client`, 401, or button missing)**  
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` must be real values from Google Cloud, not empty.
- Redirect URI in Google Cloud must match `GOOGLE_CALLBACK_URL` exactly.
- `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` and restart both API and frontend after editing `.env`.

---

## Project structure (quick map)

```
apps/frontend/   → Next.js shop + admin UI
apps/api/        → NestJS backend
libs/database/   → database schema (Drizzle)
drizzle/         → migration files
scripts/         → seed script for demo products
```

---

## Docker (all-in-one, optional)

If you prefer running everything in containers:

```bash
cp .env.example .env
docker compose up postgres -d
npx drizzle-kit migrate
docker compose up --build
```

Same URLs: shop on :4200, API on :3000.

---

Thanks for taking the time to review this. If anything in the setup does not work on your machine, let me know and I can help.
