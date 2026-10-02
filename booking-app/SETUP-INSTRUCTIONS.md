# Instrukcje szczegółowe setupu

## 1. Supabase Setup

### Stworzenie projektu

1. Wejdź na [supabase.com](https://supabase.com)
2. Kliknij "New Project"
3. Wypełnij dane:
   - **Project name:** `booking-app`
   - **Database password:** Ustaw silne hasło
   - **Region:** Closest to your location (np. `eu-west-1` dla Europy)
4. Czekaj na inicjalizację (2-3 min)

### Pobranie credentials

1. Wejdź do Settings → API
2. Skopiuj pod `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5...
   ```

### Migracje bazy danych

1. W Supabase → SQL Editor
2. Kliknij "New query"
3. Skopiuj zawartość z `supabase/migrations/001_init.sql`
4. Kliknij "Run"
5. ✅ Tabele gotowe!

## 2. Google Calendar API

### Stworzenie OAuth 2.0 credentials

1. Wejdź na [Google Cloud Console](https://console.cloud.google.com/)
2. Stwórz nowy projekt:
   - **Project name:** `booking-app`
   - Kliknij Create
3. Poczekaj na inicjalizację

### Włączenie Google Calendar API

1. Wejdź do "APIs & Services" → "Enabled APIs & services"
2. Kliknij "Enable APIs and services"
3. Szukaj "Google Calendar API"
4. Kliknij na nią → "Enable"

### Stworzenie OAuth credentials

1. Wejdź do "APIs & Services" → "Credentials"
2. Kliknij "Create Credentials" → "OAuth client ID"
3. Będzie pytanie o Consent Screen:
   - Kliknij "Configure Consent Screen"
   - **User Type:** External
   - Kliknij "Create"
4. Wypełnij informacje:
   - **App name:** Booking App
   - **User support email:** tomopach@gmail.com
   - **Developer contact:** tomopach@gmail.com
5. Kliknij "Save and Continue"
6. W "Scopes" dodaj:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.readonly`
7. Kliknij "Save and Continue"
8. Dodaj test user (Twój email)
9. Kliknij "Save and Continue"

### Pobierz Client ID i Secret

1. Wróć do "Credentials"
2. Kliknij "Create Credentials" → "OAuth client ID"
3. **Application type:** Desktop application
4. **Name:** Booking App Desktop
5. Kliknij "Create"
6. Pojawi się okno z **Client ID** i **Client Secret**
7. Skopiuj do `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=123456789-abc...
   GOOGLE_CLIENT_SECRET=GOCSPX-...
   GOOGLE_CALENDAR_ID=your-email@gmail.com
   ```

## 3. Resend Email Setup

### Załóż konto na Resend

1. Wejdź na [resend.com](https://resend.com)
2. Kliknij "Sign up"
3. Użyj Google lub email
4. Weryfikuj email

### Pobierz API key

1. Wejdź do "API Keys"
2. Kliknij "Create API Key"
3. **Name:** `booking-app`
4. Skopiuj key do `.env.local`:
   ```env
   RESEND_API_KEY=re_123456789...
   ```

## 4. Lokalna instalacja

```bash
# Zainstaluj Node.js (v18+) jeśli nie masz
# Sprawdź: node --version

# Przejdź do folderu
cd /Users/tomopach/Claude/Aplikacja\ do\ spotkań

# Zainstaluj zależności
npm install

# Uruchom dev server
npm run dev
```

Aplikacja dostępna pod `http://localhost:3000`

## 5. GitHub Setup (opcjonalnie, ale polecane)

```bash
# Przejdź do folderu
cd /Users/tomopach/Claude/Aplikacja\ do\ spotkań

# Inicjalizuj repo
git init
git add .
git commit -m "Initial commit - Faza 1: Setup & Database"

# Stwórz repo na github.com/new
# Skopiuj URL (https://github.com/username/booking-app.git)

# Dodaj remote
git remote add origin https://github.com/your-username/booking-app.git
git branch -M main
git push -u origin main
```

## 6. Vercel Deployment

### Przygotowanie

1. Zaloguj się na [vercel.com](https://vercel.com)
2. Kliknij "Import Project"
3. Podaj URL Twojego GitHub repo
4. Kliknij "Import"

### Env variables w Vercel

1. Project Settings → Environment Variables
2. Dodaj wszystkie z `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALENDAR_ID`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app`
   - `ADMIN_EMAIL=tomopach@gmail.com`

3. Kliknij "Deploy"

## Troubleshooting

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Supabase connection error"
- Sprawdź czy `.env.local` ma prawidłowe URLs
- Sprawdź czy migracje zostały wykonane

### "Google Calendar API error"
- Sprawdź czy API jest włączony w Google Cloud Console
- Sprawdź czy Client ID i Secret są prawidłowe
- Czasem trzeba czekać kilka minut po włączeniu API

### "Port 3000 already in use"
```bash
# Zmień port
npm run dev -- -p 3001
```

## Checklistа — co się powinno pokazać

- [x] Strona główna dostępna `http://localhost:3000`
- [x] Admin panel dostępny `http://localhost:3000/admin`
- [x] Booking page dostępna `http://localhost:3000/book`
- [ ] (Faza 2) Możliwość stworzenia typu spotkania
- [ ] (Faza 3) Integracja z Google Calendar
- [ ] (Faza 4) Email notyfikacje

---

**Pytania?** Napisz do tomopach@gmail.com
