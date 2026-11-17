"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, Loader2, LogOut, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { EXPORT_COLUMNS, optionsOf } from "@/lib/survey";

const PAGE_SIZE = 10;

const cell = (v) => (v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v));
const fmtDate = (s) => new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

function BarList({ title, items, total }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((i) => (
          <li key={i.label}>
            <div className="flex justify-between gap-3 text-sm">
              <span>{i.label}</span>
              <span className="font-semibold tabular-nums">
                {i.value}{total ? <span className="ml-1 font-normal text-slate-500">({Math.round((i.value / total) * 100)}%)</span> : null}
              </span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-ink" style={{ width: `${(i.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.replace("/admin/login"); return; }
      // Ambil semua baris (Supabase membatasi 1000 baris per permintaan)
      let all = [], from = 0;
      while (true) {
        const { data: chunk, error } = await supabase.from("tracer_responses").select("*").order("created_at", { ascending: false }).range(from, from + 999);
        if (error) { if (active) setError("Data tidak bisa dimuat. Pastikan Anda login dan SQL RLS sudah dijalankan."); return; }
        all = all.concat(chunk);
        if (chunk.length < 1000) break;
        from += 1000;
      }
      if (active) setRows(all);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (!s) router.replace("/admin/login"); });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [router]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const by = (key, opts) => opts.map((label) => ({ label, value: rows.filter((r) => r[key] === label).length }));
    const act = optionsOf("aktivitas_setelah_lulus");
    return {
      jurusan: by("bidang_keahlian", optionsOf("bidang_keahlian")),
      status: act.map((label) => ({ label, value: rows.filter((r) => (r.aktivitas_setelah_lulus || []).includes(label)).length })),
      tunggu: by("waktu_tunggu", optionsOf("waktu_tunggu")),
      gaji: by("rentang_gaji", optionsOf("rentang_gaji")),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    return s ? rows.filter((r) => `${r.nama} ${r.bidang_keahlian} ${r.tahun_lulus}`.toLowerCase().includes(s)) : rows;
  }, [rows, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const view = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const exportData = () => rows.map((r) => Object.fromEntries(EXPORT_COLUMNS.map((c) => [c.label, c.key === "created_at" ? new Date(r.created_at).toLocaleString("id-ID") : cell(r[c.key])])));

  const download = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const head = EXPORT_COLUMNS.map((c) => esc(c.label)).join(",");
    const body = exportData().map((r) => Object.values(r).map(esc).join(",")).join("\r\n");
    download(new Blob(["\uFEFF" + head + "\r\n" + body], { type: "text/csv;charset=utf-8" }), "tracer-study-rumah-hijau.csv");
  };

  const exportXlsx = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(exportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responden");
    XLSX.writeFile(wb, "tracer-study-rumah-hijau.xlsx");
  };

  const signOut = async () => { await supabase.auth.signOut(); router.replace("/admin/login"); };

  if (error) return <main className="grid min-h-screen place-items-center px-5"><p role="alert" className="max-w-md text-center text-red-700">{error}</p></main>;
  if (!rows) return <main className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-ink" /></main>;

  const total = rows.length;
  const count = (label) => stats.status.find((s) => s.label === label)?.value || 0;

  return (
    <main className="min-h-screen">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid shrink-0 place-items-center rounded-xl bg-white px-2 py-1">
              <Image src="/logo.png" alt="Logo PKBM Rumah Hijau" width={611} height={438} className="h-10 w-auto" />
            </span>
            <h1 className="font-display text-xl font-bold">Dashboard Tracer Study</h1>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm hover:bg-white/10"><LogOut size={16} /> Keluar</button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[["Total responden", total], ["Bekerja", count("Bekerja")], ["Studi lanjut", count("Studi Lanjut")], ["Berwirausaha", count("Berwirausaha")]].map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-line bg-white p-4">
              <p className="text-sm text-slate-600">{l}</p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums">{v}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarList title="Responden per jurusan" items={stats.jurusan} total={total} />
          <BarList title="Status setelah lulus" items={stats.status} total={total} />
          <BarList title="Waktu tunggu kerja" items={stats.tunggu} />
          <BarList title="Rentang gaji" items={stats.gaji} />
        </div>
        <p className="text-sm text-slate-500">Status setelah lulus boleh dipilih lebih dari satu, jadi totalnya bisa melebihi jumlah responden.</p>

        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">Data responden</h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Cari nama, jurusan, tahun" aria-label="Cari responden"
                  className="rounded-lg border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/20" />
              </div>
              <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-ink px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5"><Download size={16} /> CSV</button>
              <button onClick={exportXlsx} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-ink/90"><FileSpreadsheet size={16} /> Excel</button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-slate-600">
                  {["Tanggal", "Nama", "Jurusan", "Lulus", "Setelah lulus", "Waktu tunggu", "Gaji", "Sertifikat"].map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {view.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 align-top">
                    <td className="py-2.5 pr-4 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                    <td className="py-2.5 pr-4 font-medium">{r.nama}</td>
                    <td className="py-2.5 pr-4">{r.bidang_keahlian}</td>
                    <td className="py-2.5 pr-4">{r.tahun_lulus}</td>
                    <td className="py-2.5 pr-4">{cell(r.aktivitas_setelah_lulus)}</td>
                    <td className="py-2.5 pr-4">{cell(r.waktu_tunggu) || "-"}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{cell(r.rentang_gaji) || "-"}</td>
                    <td className="py-2.5 pr-4">{cell(r.punya_sertifikat) || "-"}</td>
                  </tr>
                ))}
                {view.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-slate-500">Belum ada data yang cocok.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-600">{filtered.length} responden</span>
            <div className="flex items-center gap-2">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40">Sebelumnya</button>
              <span className="tabular-nums">{page + 1} / {pages}</span>
              <button disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
