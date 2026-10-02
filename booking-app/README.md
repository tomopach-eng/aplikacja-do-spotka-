# Booking App — Apka do spotkań

Zautomatyzuj umawianie spotkań na wzór Calendly'ego. Klienci rezerwują terminy w Twoim kalendarzu poprzez publiczny link.

## Funkcjonalności

- ✅ Elastyczne terminy (konkretne daty + cykliczne okna)
- ✅ Automatyczne blokowanie rezerwacji w Google Calendar/Apple
- ✅ Bufory między spotkaniami (15 min)
- ✅ Maksymalna liczba rezerwacji dziennie
- ✅ Pytania zależne od typu spotkania
- ✅ Email notyfikacje (rezerwacja, podsumowanie dzienne)
- ✅ Admin panel do zarządzania
- ✅ Serverless deployment (Vercel + Supabase)

## Tech Stack

- **Frontend:** Next.js 14 + React + TypeScript
- **Backend:** Next.js API Routes + Supabase
- **Database:** PostgreSQL (Supabase)
- **Email:** Resend
- **Hosting:** Vercel + Supabase

## Setup

### 1. Przygotowanie środowiska

```bash
# Zainstaluj zależności
npm install

# Skopiuj env variables
cp .env.example .env.local
```

### 2. Setup Supabase

1. Wejdź na [supabase.com](https://supabase.com) i stwórz projekt
2. Skopiuj `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY` do `.env.local`
3. Pobierz `SUPABASE_SERVICE_ROLE_KEY` ze Settings → API

**Uruchom migracje:**
```bash
# Wejdź do SQL Editor w Supabase i wykonaj zawartość z supabase/migrations/001_init.sql
```

### 3. Google Calendar API

1. Wejdź na [Google Cloud Console](https://console.cloud.google.com/)
2. Stwórz projekt
3. Włącz Google Calendar API
4. Stwórz OAuth 2.0 credentials (Desktop app)
5. Skopiuj Client ID i Secret do `.env.local`

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALENDAR_ID=your-email@gmail.com
```

### 4. Resend Email

1. Wejdź na [resend.com](https://resend.com) i załóż konto
2. Skopiuj API key do `.env.local`

```env
RESEND_API_KEY=re_...
```

### 5. Lokalny dev server

```bash
npm run dev
```

Aplikacja będzie dostępna pod `http://localhost:3000`

- **Admin Panel:** `http://localhost:3000/admin`
- **Booking Page:** `http://localhost:3000/book`

## Deployment

### Vercel

```bash
# Zaloguj się do Vercel
vercel login

# Deploy
vercel deploy
```

Dodaj env variables w Vercel Project Settings.

### GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/booking-app.git
git push -u origin main
```

Vercel automatycznie deployuje z GitHub.

## Fazy implementacji

- [x] **Faza 1:** Setup & Baza danych
- [ ] **Faza 2:** Admin Panel (typy, dostępności, pytania)
- [ ] **Faza 3:** Booking Page & Google Calendar
- [ ] **Faza 4:** Email notyfikacje
- [ ] **Faza 5:** Refinements

## Struktura katalogów

```
booking-app/
├── app/
│   ├── admin/           # Admin panel
│   ├── book/            # Booking page
│   ├── layout.tsx
│   ├── page.tsx         # Home
│   └── globals.css
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── types.ts         # TypeScript types
├── supabase/
│   └── migrations/      # SQL migrations
├── public/
├── .env.example
├── package.json
└── tsconfig.json
```

## API Routes (do implementacji)

- `POST /api/bookings` — Nowa rezerwacja
- `GET /api/meetings/:id/availability` — Dostępne terminy
- `GET /api/meetings` — Lista typów spotkań
- `POST /api/admin/meetings` — Stwórz typ spotkania

## Następne kroki

1. Implementować Fazę 2 — Admin panel
2. Integracja Google Calendar API
3. Email notyfikacje
4. Testy i refinement UI

## Pomoc

Pytania? Kontakt: tomopach@gmail.com

---

**Ostatnia aktualizacja:** Faza 1 (Setup & DB)
