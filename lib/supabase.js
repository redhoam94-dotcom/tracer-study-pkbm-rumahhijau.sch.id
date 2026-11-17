import { createClient } from "@supabase/supabase-js";

// Placeholder agar build tidak gagal bila .env.local belum diisi.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "anon-key-belum-diisi"
);
