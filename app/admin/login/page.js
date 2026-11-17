"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const inputCls = "w-full rounded-lg border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-ink focus:ring-2 focus:ring-ink/20";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace("/admin"); });
  }, [router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Email atau kata sandi salah."); setLoading(false); return; }
    router.replace("/admin");
  };

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-white p-7">
        <Image src="/logo.png" alt="Logo PKBM Rumah Hijau" width={611} height={438} priority className="h-14 w-auto" />
        <h1 className="mt-4 font-display text-2xl font-bold">Masuk admin</h1>
        <p className="mt-1 text-sm text-slate-600">Dashboard Tracer Study PKBM Rumah Hijau</p>
        <label className="mt-6 block text-sm font-medium">Email
          <input type="email" required autoComplete="email" className={`${inputCls} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="mt-4 block text-sm font-medium">Kata sandi
          <input type="password" required autoComplete="current-password" className={`${inputCls} mt-1`} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3 font-semibold text-white hover:bg-ink/90 disabled:opacity-60">
          {loading && <Loader2 size={18} className="animate-spin" />} Masuk
        </button>
      </form>
    </main>
  );
}
