# Afro-Latina Party — VAS

Premium event website with a lightweight ticketing back-office for the **VAS
Afro-Latina Party** (Worms, 17 July 2026). Public visitors confirm their
attendance, optionally pay online, and receive a QR ticket; organizers manage
everything from an admin dashboard and scan tickets at the door.

- **Frontend:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion
- **Database:** Supabase (Postgres) — accessed only server-side
- **Emails:** Gmail SMTP (nodemailer) + React Email (FR / EN / DE)
- **i18n:** next-intl (French, English, German — no URL prefix, cookie-based)
- **Payment:** manual (paypal.me link) — no PayPal API
- **Hosting:** Vercel

---

## Table of contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Quick start](#quick-start)
4. [Environment variables](#environment-variables)
5. [Supabase setup](#supabase-setup)
6. [Emails (Gmail) setup](#emails-gmail-setup)
7. [Admin account](#admin-account)
8. [Commands](#commands)
9. [Deploying to Vercel](#deploying-to-vercel)
10. [How the workflows work](#how-the-workflows-work)
11. [Project structure](#project-structure)

---

## Features

**Public site**
- Cinematic landing page (hero + live countdown, event, why join, entry prices, location, CTA)
- Attendance form (first name, last name, email, phone) + entry tier with conditional logic
  (VAS member / engaged member require a membership number; students show their card at the door)
- Optional "pay now" → PayPal link by email; otherwise pay at the door
- Confirmation email sent immediately, adapted to each case
- Fully translated (FR / EN / DE), responsive, accessible, reduced-motion aware

**Ticketing**
- Secure QR ticket (random token, no personal data encoded)
- Web ticket page at `/ticket/<token>`
- One ticket per person, guaranteed by a database unique constraint

**Admin dashboard** (`/admin`)
- Cookie-based login (single admin), middleware-protected
- Live stats, searchable/filterable registrations table, detail drawer
- Actions: approve/reject member, approve/reject engaged member, mark payment received
  (→ generates + emails the ticket), undo payment, resend ticket, admin notes
- Camera QR **scanner** with VALID / ALREADY USED / INVALID / NOT FOUND screens + check-in history

---

## Prerequisites

- **Node.js 20+** and npm
- A free [Supabase](https://supabase.com) project
- A Gmail account with 2-step verification (for sending real emails)

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run dev                    # http://localhost:3000
```

The site runs without Supabase/Gmail configured, but registration and the
dashboard need Supabase, and sending real emails needs the Gmail credentials.

---

## Environment variables

Copy `.env.example` → `.env.local` and fill in:

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | yes | Your site URL. Local: `http://localhost:3000`. Prod: your domain. |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → Settings → API → **Project URL** (a URL, not a key). |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase → Settings → API → **secret** key (`sb_secret_…`) / legacy `service_role`. **Server-only, never commit.** |
| `GMAIL_USER` | for emails | The association's Gmail address (emails are sent from it). |
| `GMAIL_APP_PASSWORD` | for emails | A Google **App Password** (16 chars) — see [Emails setup](#emails-gmail-setup). |
| `EMAIL_FROM` | optional | Override the sender display name/address. Defaults to `GMAIL_USER`. |
| `ADMIN_EMAIL` | for admin | The admin login email. |
| `ADMIN_PASSWORD_HASH` | for admin | Generate with `npm run hash-password -- "your-password"`. |
| `AUTH_SECRET` | for admin | Long random string: `openssl rand -base64 32`. |
| `PAYPAL_LINK` | yes | Your `https://paypal.me/…` link (also editable in `src/config/config.ts`). |

> **Security:** `.env.local` is git-ignored. Never put the service-role/secret
> key in `.env.example` or any committed file. If it ever leaks, rotate it in
> Supabase.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
   This creates the `registrations` and `check_ins` tables, enums, the
   `REG-YYYY-NNNNNN` code generator, and locks everything with Row Level
   Security (only the server's secret key can read/write).
3. Copy **Project URL** and the **secret** API key into `.env.local`.

That's it — the app talks to Supabase exclusively through server-side API
routes; the browser never touches the database.

---

## Emails (Gmail) setup

Emails are sent straight from the association's Gmail via SMTP:

1. On the Gmail account, enable **2-step verification**
   ([myaccount.google.com/security](https://myaccount.google.com/security)).
2. Create an **App Password**:
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   → you get a 16-character code.
3. In `.env.local`:
   ```
   GMAIL_USER=info.vas.worms@gmail.com
   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
   ```

Emails are sent *from* that address; replies land in the same inbox.

**Limits:** free Gmail caps at ~500 emails/day and can throttle large bursts —
fine for a single event, but avoid mass-sending everything at once. For higher
volume/deliverability, swap `src/lib/mailer.ts` for a dedicated provider.

If the Gmail credentials are unset, email sending is skipped gracefully
(registrations and admin actions still work).

---

## Admin account

```bash
npm run hash-password -- "choose-a-strong-password"
```

Put the printed value in `ADMIN_PASSWORD_HASH`, set `ADMIN_EMAIL` and a random
`AUTH_SECRET`, then log in at `/admin/login`.

---

## Commands

```bash
npm run dev             # start the dev server
npm run build           # production build
npm run start           # run the production build
npm run lint            # ESLint
npm run typecheck       # TypeScript, no emit
npm run format          # Prettier
npm run hash-password -- "pw"   # generate ADMIN_PASSWORD_HASH
```

---

## Deploying to Vercel

1. Push the repo to GitHub/GitLab.
2. Import it in [Vercel](https://vercel.com) (framework auto-detected as Next.js).
3. Add **all** the environment variables from the table above in
   **Project → Settings → Environment Variables** (set `NEXT_PUBLIC_APP_URL` to
   your production URL).
4. Deploy. Run the Supabase migration once (see above) if you haven't.

No other host-specific configuration is required.

---

## How the workflows work

All entry tiers get an **immediate confirmation email**. What happens next:

| Tier | On registration | Admin step | Ticket |
|---|---|---|---|
| **Student / Non-student** | `PENDING` — if "pay now", email includes PayPal link | *Payment received* | Ticket generated + emailed on payment |
| **VAS member** | `MEMBER_PENDING` — membership verification email | *Approve* (→ payment link if "pay now") then *Payment received* | Ticket on payment |
| **Engaged member** | `CONTRIBUTOR_PENDING` — approval-pending email | *Approve* | Free ticket generated + emailed immediately |

- **Payment** is manual: the email shows the PayPal link, the exact amount, and
  the payer's name as the reference (Verwendungszweck). The system never checks
  payments — an admin clicks *Payment received*.
- **Rejecting a member** converts them to Student/Non-student and emails the new
  entry price.
- **At the door:** scan the QR → *check in*. A second scan shows "already used".

---

## Project structure

```
src/
├── app/
│   ├── (site)/            # public pages (Header/Footer): landing, /register
│   ├── admin/             # dashboard, registrations, scanner, settings, login
│   ├── api/               # register, ticket QR, admin (login/logout/actions/scan)
│   ├── ticket/[token]/    # public web ticket
│   ├── manifest.ts · robots.ts · sitemap.ts · opengraph-image.tsx · icon.jpeg
│   └── layout.tsx         # root: fonts, i18n provider, animated background
├── components/            # ui/ · motion/ · background/ · layout/
├── sections/              # landing sections (Hero, Event, WhyJoin, Prices, …)
├── features/
│   ├── registration/      # RegistrationForm, SuccessCheck
│   └── admin/             # AdminShell, RegistrationsView, RegistrationDrawer, ScannerView, …
├── services/              # registration · admin · email  (business logic)
├── emails/                # React Email templates + i18n (FR/EN/DE)
├── lib/                   # supabase · mailer · auth · password · qrcode · ticket · rate-limit
├── schemas/               # Zod validation
├── config/                # config.ts (single source of truth for the event)
├── i18n/ · messages/      # next-intl config + fr/en/de translations
├── types/ · hooks/ · styles/
└── middleware.ts          # protects /admin and /api/admin

supabase/migrations/       # SQL schema
```

Everything about the event (name, date, venue, prices, links, contacts) lives in
**`src/config/config.ts`** and can be changed in one place.

---

Built for the **Verein Afrikanischer Studierende**, Worms.
