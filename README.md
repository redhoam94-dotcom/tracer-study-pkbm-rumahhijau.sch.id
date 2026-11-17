# Tracer Study SMKN 9 Surabaya

Next.js 14 (App Router) + Tailwind CSS + Lucide + Supabase.

## 1. Siapkan Supabase
1. Buat proyek di https://supabase.com.
2. Buka **SQL Editor**, tempel isi `supabase/schema.sql`, lalu **Run**. Ini membuat tabel `tracer_responses` dan RLS (publik hanya boleh INSERT, hanya user login yang boleh SELECT).
3. **Authentication > Users > Add user**: buat akun admin (email + password).
4. **Authentication > Sign In / Providers**: matikan *Allow new users to sign up*. Kebijakan SELECT berlaku untuk semua user terautentikasi, jadi pendaftaran terbuka harus dimatikan.

## 2. Hubungkan `.env.local`
Salin `.env.local.example` menjadi `.env.local`, isi dari **Project Settings > API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

## 3. Jalankan
```
npm install
npm run dev
```
- Survei: http://localhost:3000
- Admin: http://localhost:3000/admin (login di `/admin/login`)

## Logika lompatan
Ada di `lib/survey.js` (properti `showIf`). Jawaban pada pertanyaan yang disembunyikan disimpan sebagai NULL.
