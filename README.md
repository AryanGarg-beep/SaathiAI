# Saathi AI (साथी AI)

A gentle web companion for Hindi-speaking dementia patients. Built with Next.js, Supabase auth, and Gemini.

## Features

- Bilingual: Hindi (default) and English, with a one-tap toggle
- Dementia-friendly UI: large text, high contrast, warm calm palette, big tap targets
- Email/password auth with email verification (Supabase)
- Therapy chatbot powered by Gemini with a patient, empathetic system prompt
- Clean file structure, centralized styles via CSS variables

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Fill in `.env.local`** with your keys:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings → API
   - `GEMINI_API_KEY` — from https://aistudio.google.com/app/apikey
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for dev

3. **Configure Supabase**
   - Dashboard → Authentication → Providers → Email → enable "Confirm email"
   - Dashboard → Authentication → URL Configuration → add redirect URL: `http://localhost:3000/auth/callback`
   - When you deploy, also add your production callback URL

4. **Run**
   ```bash
   npm run dev
   ```

## Structure

```
src/
├── app/
│   ├── layout.tsx            Root layout (wraps LanguageProvider)
│   ├── page.tsx              Landing page
│   ├── login/                Login
│   ├── signup/               Signup (triggers email verification)
│   ├── verify-email/         "Check your inbox" notice
│   ├── auth/callback/        Handles email verification link
│   ├── chat/                 Main chat UI (auth-required)
│   └── api/chat/             Gemini API route (auth-required)
├── components/
│   ├── Header.tsx            Shared header with logout + lang toggle
│   └── LanguageToggle.tsx
├── context/
│   └── LanguageContext.tsx   EN/HI state + localStorage persistence
├── lib/
│   ├── translations.ts       All UI strings
│   ├── gemini.ts             Gemini client + bilingual therapy prompt
│   └── supabase/
│       ├── client.ts         Browser client
│       └── server.ts         Server client
└── styles/
    └── globals.css           All styling (CSS variables, no inline)
```

## Adding new strings

Add the key to both `en` and `hi` blocks in `src/lib/translations.ts`, then use `t('yourKey')` in any client component via `useLanguage()`.

## Changing the theme

All colors, fonts, and spacing live as CSS variables at the top of `src/styles/globals.css`.
