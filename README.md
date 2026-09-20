# Bawa Cardealership

A luxury car dealership website built with Next.js (App Router), Tailwind CSS,
a Neon Postgres database, and Vercel Blob for image storage. Includes a
password-protected dealer panel for adding, editing, and deleting car
listings — with photo upload — without touching any code.

## Tech stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS, red-and-white theme with rounded cards
- **Database:** Neon (serverless Postgres)
- **Image storage:** Vercel Blob
- **Customer accounts:** NextAuth (Google sign-in + email/password)
- **Hosting:** Vercel
- **Source control:** GitHub

## What's included

- **Public site** — home, inventory (search, make, body type, price, year,
  mileage sort), and car detail pages. Anyone can browse without signing in.
- **Mobile navigation** — a hamburger menu on small screens with the same
  links and sign-in options as desktop.
- **Customer accounts** — sign up or sign in with Google or a plain
  email/password.
- **Favorites** — signed-in customers can save cars (heart icon on every
  card, "Save Vehicle" on the detail page) and compare up to 3 side by side
  from their account page.
- **"Request More Details" enquiry flow** — the card + modal design from
  your reference, on every car page. Viewable at `/admin/enquiries`.
- **Test drive booking** — a date/time modal on every car page. Bookings
  and their status (pending/confirmed/completed/cancelled) are managed at
  `/admin/bookings`.
- **Financing** — a public `/financing` page explaining terms and taking
  applications, viewable at `/admin/financing`.
- **Customer account dashboard** (`/account`) — saved vehicles, enquiry
  history, test drive bookings, and financing applications, all scoped to
  the signed-in customer.
- **Dealer panel** — password-protected `/admin` for managing inventory
  (add/edit/delete cars with photo upload), enquiries, bookings, financing
  applications, and a customers list — separate from customer accounts.

### Not built yet
A few things from a fuller spec are intentionally left for later, since
they need either more infrastructure or more design decisions than fit
here:
- Multiple photos or videos per car listing (currently one photo each)
- Price-drop email notifications on saved cars (needs an email service
  like Resend or SendGrid, not currently configured)
- Saving a customer's preferred search/filter, and personalized
  recommendations

## Security

This project has been hardened against the common ways a small dealership
site actually gets attacked:

- **Dependencies kept current** — `npm audit` is clean apart from one
  accepted low-risk item (see below). Notably, Next.js is pinned to
  15.5.25: the 14.x line had several real vulnerabilities — including an
  unauthenticated RCE in the Image Optimization API — that were only ever
  patched in 15.x, not backported. `@vercel/blob` is on 2.8.0 for the same
  reason (a critical `undici` vulnerability in older versions).
- **Rate limiting** on every public write endpoint (dealer login, customer
  signup, credentials login, enquiries, test drives, financing
  applications) — backed by a `rate_limits` table in your existing Neon
  database, no extra service needed. It fails open (allows the request) if
  the database is briefly unreachable, so an outage there never takes down
  the whole site.
- **Honeypot fields** on every public form (signup, enquiry, test drive,
  financing) to quietly filter out basic bot spam without adding a CAPTCHA
  or third-party service.
- **Timing-safe password comparison** for the dealer admin login, and
  bcrypt hashing for every customer password — never stored in plain text.
- **Signed, `httpOnly` session cookies** for the dealer panel; NextAuth's
  own session handling for customers. Neither can be read or forged from
  JavaScript in the browser.
- **Security headers** on every response: `X-Frame-Options` (blocks
  clickjacking), `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, and `Strict-Transport-Security`.
- **Upload validation** checks the actual bytes of an uploaded file
  against its claimed image type (not just the filename or the
  browser-reported MIME type, which is trivial to fake), on top of a file
  size cap and an allow-list of image formats.
- **Parameterized SQL everywhere** — every database query uses tagged
  template parameters, so there's no SQL injection surface.

**Known accepted risk:** `npm audit` still flags a moderate/high advisory
in a `postcss` copy bundled *inside* Next.js's own build tooling. It's
used internally by the framework, not exposed to anything a visitor
submits, so it isn't reachable through this app. The only fix is jumping
to Next.js 16, a newer major version with its own migration risk that
didn't seem worth taking for an unreachable advisory — revisit this if
you plan a bigger refactor down the line.

**Still worth adding if this site grows:** a real CAPTCHA (hCaptcha or
Cloudflare Turnstile) if spam gets past the honeypot; a Web Application
Firewall in front of Vercel if you see targeted attacks; and per-admin
accounts instead of one shared dealer password if more than one or two
people need panel access.

## Project structure

```
app/
  page.tsx                 Home page (video hero, featured cars, why-bawa, CTA)
  inventory/page.tsx        Full inventory with search/filter/sort
  cars/[id]/page.tsx        Car detail: enquiry card, save, test drive, financing link
  financing/page.tsx        Public financing info + application form
  account/page.tsx          Customer dashboard: favorites, enquiries, bookings, financing
  login/, signup/            Customer auth pages
  privacy/page.tsx          Privacy policy
  admin/
    login/page.tsx          Dealer login
    page.tsx                Dealer dashboard
    new/, edit/[id]/          Add / edit a car
    enquiries/page.tsx       View enquiry submissions
    bookings/page.tsx        View & update test drive bookings
    financing/page.tsx       View financing applications
    customers/page.tsx       View registered customers
  api/
    cars/, cars/[id]/          Car CRUD
    upload/route.ts           Uploads a photo to Vercel Blob
    admin/login/, admin/logout/  Dealer session cookie
    auth/[...nextauth]/       NextAuth (Google + credentials)
    auth/signup/route.ts      Email/password account creation
    favorites/route.ts        List / toggle a customer's saved cars
    enquiries/route.ts        Submit / list "Request More Details" leads
    test-drives/, test-drives/[id]/  Book / list / update test drives
    financing/route.ts        Submit / list financing applications
components/                  Navbar, Footer, CarCard, CarForm, EnquiryCard,
                              TestDriveModal, FavoriteButton, FinancingForm, etc.
lib/
  db.ts                      Neon SQL client + Car type
  auth.ts                    Signed dealer-session cookie helpers
  auth-options.ts            NextAuth configuration (Google + credentials)
  format.ts                  Price / mileage formatting
middleware.ts                Protects /admin pages, write APIs, and admin-only reads
scripts/init-db.mjs          Creates all tables (+ optional seed data)
```

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → your project → **Connection Details** |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → your project → **Storage → Blob** (create a store) |
| `ADMIN_PASSWORD` | Any password you choose for the dealer panel |
| `ADMIN_SESSION_SECRET` | A random string — generate with `openssl rand -hex 32` |
| `NEXTAUTH_SECRET` | A different random string — generate with `openssl rand -hex 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` locally; your real domain on Vercel |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | See "Set up Google sign-in" below. Optional — leave blank to disable Google login and keep email/password only |

Create the database tables (`cars`, `users`, `enquiries`, `favorites`,
`test_drives`, `financing_applications`, `rate_limits`) and a few sample listings:

```bash
npm run db:init
```

Run the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site, and
`http://localhost:3000/admin/login` to sign in to the dealer panel.

## 2. Set up Neon (database)

1. Create a free account at [neon.tech](https://neon.tech) and a new project.
2. Copy the connection string shown on the project dashboard — it looks like
   `postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require`.
3. Put it in `DATABASE_URL` (locally in `.env.local`, and later in Vercel's
   environment variables — see below).
4. Run `npm run db:init` once to create the `cars`, `users`, `enquiries`,
   `favorites`, `test_drives`, `financing_applications`, and `rate_limits` tables.

## 3. Set up Google sign-in (optional)

Customers can already sign up with email/password with no extra setup. To
also enable "Continue with Google":

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a project (or use an existing one), then **Create Credentials →
   OAuth client ID → Web application**.
3. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google` (for local testing)
   - `https://your-domain.vercel.app/api/auth/callback/google` (for production)
4. Copy the generated **Client ID** and **Client Secret** into
   `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. If you skip this step, the "Continue with Google" button won't appear —
   the site detects missing credentials and falls back to email/password
   only, so nothing breaks either way.

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Bawa Cardealership"
git branch -M main
git remote add origin https://github.com/<your-username>/bawa-cardealership.git
git push -u origin main
```

(This project already has a `.gitignore` that excludes `node_modules`,
`.next`, and your `.env*` files, so secrets never get committed.)

## 5. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub
   repository you just pushed.
2. Vercel will detect Next.js automatically — no build settings to change.
3. Before the first deploy, add these **Environment Variables** in the
   Vercel project settings (Settings → Environment Variables):
   - `DATABASE_URL`
   - `BLOB_READ_WRITE_TOKEN`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` — set this to your real deployed URL, e.g.
     `https://bawa-cardealership.vercel.app`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional, see step 3 above)
4. To get `BLOB_READ_WRITE_TOKEN`: in your Vercel project, go to
   **Storage → Create Database → Blob**, create a store, and connect it to
   this project. Vercel can auto-populate this token for you, or you can
   copy it manually into the same environment variable list.
5. Deploy. Your site will be live at `your-project.vercel.app` (or a custom
   domain you attach later). If you added Google credentials, go back and
   add the production redirect URI (step 3) once you know your final URL.

## 6. Using the dealer panel

- Go to `/admin/login` and sign in with `ADMIN_PASSWORD`.
- **Add a Car** — fill in the details, upload a photo, save. It appears on
  the site immediately (mark it "Featured" to show it on the homepage).
- **Edit** any car from the dealer dashboard to update details or swap the
  photo.
- **Delete** removes a listing permanently.
- Mark a car's status as **Reserved** or **Sold** instead of deleting it if
  you want to keep the record but stop it from being sold twice.
- **Sign Out** from the dashboard when you're done.

## Notes

- The site renders cars fetched fresh from Neon on each request/interval
  (`revalidate` is set short on public pages), so new or edited listings
  show up within seconds.
- All write actions (add/edit/delete a car, upload a photo, and the admin
  pages themselves) are protected by `middleware.ts`, which checks a signed
  session cookie — no one can hit the API directly without the password.
- Swap the placeholder contact details (phone, email, address) in
  `components/Footer.tsx` and `app/cars/[id]/page.tsx` for your real ones.
