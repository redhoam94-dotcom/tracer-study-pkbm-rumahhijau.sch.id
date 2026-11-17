import { createClient } from "@supabase/supabase-js";

// Placeholder agar build tidak gagal bila .env.local belum diisi.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wryhxompuoknvtuozsof.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyeWh4b21wdW9rbnZ0dW96c29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NzUyMDYsImV4cCI6MjExMDQ1MTIwNn0.gf3Ha_HhYGhhgJ71TB9q5UsKmsGL2IOP3gDIXeoldvM"
);
