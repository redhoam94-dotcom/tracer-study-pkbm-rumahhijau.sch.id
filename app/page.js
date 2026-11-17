"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Send, Loader2, AlertCircle, Leaf } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SECTIONS, QUESTIONS, isVisible, validate, buildPayload } from "@/lib/survey";

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3.5 py-3 text-[15px] outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/20";

function Choice({ type, checked, onChange, label }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 text-[15px] leading-snug transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink/40 ${
        checked ? "border-ink bg-ink/5" : "border-line bg-white hover:border-ink/40"
      }`}
    >
      <input type={type} checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-2 ${type === "radio" ? "rounded-full" : "rounded"} ${
          checked ? "border-ink bg-ink text-white" : "border-slate-300"
        }`}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </label>
  );
}

function Question({ q, a, set, error }) {
  const v = a[q.key];
  const toggle = (opt) => {
    const cur = v || [];
    let next;
    if (cur.includes(opt)) next = cur.filter((x) => x !== opt);
    else if (q.exclusive === opt) next = [opt];
    else next = [...cur.filter((x) => x !== q.exclusive), opt];
    set(q.key, next);
  };

  return (
    <fieldset id={`q-${q.key}`} className="scroll-mt-24">
      <legend className="mb-1 text-[15px] font-semibold leading-snug">
        {q.n}. {q.label}
        {q.required && <span className="ml-1 text-red-700" aria-label="wajib diisi">*</span>}
      </legend>
      {q.hint && <p className="mb-2 text-sm text-slate-500">{q.hint}</p>}
      <div className="mt-2 space-y-2">
        {q.type === "text" && <input className={inputCls} value={v || ""} onChange={(e) => set(q.key, e.target.value)} autoComplete="name" />}
        {q.type === "textarea" && <textarea rows={3} className={inputCls} value={v || ""} onChange={(e) => set(q.key, e.target.value)} />}
        {q.type === "date" && <input type="date" className={inputCls} value={v || ""} onChange={(e) => set(q.key, e.target.value)} />}
        {q.type === "select" && (
          <select className={inputCls} value={v || ""} onChange={(e) => set(q.key, e.target.value)}>
            <option value="">{q.placeholder || "Pilih"}</option>
            {q.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        )}
        {q.type === "radio" && q.options.map((o) => <Choice key={o} type="radio" label={o} checked={v === o} onChange={() => set(q.key, o)} />)}
        {q.type === "checkbox" && q.options.map((o) => <Choice key={o} type="checkbox" label={o} checked={(v || []).includes(o)} onChange={() => toggle(o)} />)}
        {q.type === "daterange" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-600">Mulai bekerja
              <input type="date" className={`${inputCls} mt-1`} value={a[q.key] || ""} onChange={(e) => set(q.key, e.target.value)} />
            </label>
            <label className="text-sm text-slate-600">Sampai dengan
              <input type="date" className={`${inputCls} mt-1`} value={a[q.key2] || ""} onChange={(e) => set(q.key2, e.target.value)} />
            </label>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-red-700">
          <AlertCircle size={15} /> {error}
        </p>
      )}
    </fieldset>
  );
}

export default function SurveyPage() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [serverError, setServerError] = useState("");

  const sec = SECTIONS[step];
  const last = step === SECTIONS.length - 1;
  const visible = QUESTIONS.filter((q) => q.section === sec.id && isVisible(q, a));

  const set = (k, val) => {
    setA((p) => ({ ...p, [k]: val }));
    setErrors((p) => { if (!p[k]) return p; const n = { ...p }; delete n[k]; return n; });
  };

  const check = () => {
    const e = validate(visible, a);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) document.getElementById(`q-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return !first;
  };

  const go = (d) => { setStep((s) => s + d); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = async () => {
    if (!check()) return;
    setStatus("sending"); setServerError("");
    const { error } = await supabase.from("tracer_responses").insert(buildPayload(a));
    if (error) { setStatus("idle"); setServerError("Jawaban belum terkirim. Periksa koneksi internet Anda lalu coba lagi."); return; }
    setStatus("done");
    window.scrollTo({ top: 0 });
  };

  return (
    <main className="min-h-screen">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-5">
          <Leaf size={26} className="text-leaf" aria-hidden />
          <div>
            <h1 className="font-display text-xl font-bold leading-tight sm:text-2xl">Tracer Study PKBM Rumah Hijau</h1>
            <p className="text-sm text-white/70">Survei alumni</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 pb-16 pt-6">
        {status === "done" ? (
          <section className="mt-10 rounded-2xl border border-line bg-white p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-white"><Check size={28} /></div>
            <h2 className="mt-5 font-display text-2xl font-bold">Terima kasih, jawaban Anda sudah terkirim</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">Masukan Anda membantu PKBM Rumah Hijau menyelaraskan pendidikan dengan kebutuhan dunia kerja.</p>
          </section>
        ) : (
          <>
            {step === 0 && (
              <p className="mb-6 text-[15px] leading-relaxed text-slate-600">
                Survei ini mengevaluasi keselarasan antara pendidikan dan dunia kerja, sebagai acuan peningkatan di tahun-tahun mendatang.
                Pertanyaan bertanda <span className="text-red-700">*</span> wajib dijawab. Waktu pengisian sekitar 5 menit.
              </p>
            )}

            <nav aria-label="Langkah survei" className="mb-6">
              <ol className="flex gap-1.5">
                {SECTIONS.map((s, i) => (
                  <li key={s.id} className="flex-1" aria-current={i === step ? "step" : undefined}>
                    <div className={`h-2 rounded-full ${i < step ? "bg-ink" : i === step ? "bg-leaf" : "bg-line"}`} />
                    <p className={`mt-1.5 hidden text-xs sm:block ${i === step ? "font-semibold text-body" : "text-slate-500"}`}>{s.title}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-sm text-slate-500 sm:hidden">Langkah {step + 1} dari {SECTIONS.length}: {sec.title}</p>
            </nav>

            <section className="rounded-2xl border border-line bg-white p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">{sec.title}</h2>
              <p className="mt-1 text-slate-600">{sec.desc}</p>

              <div className="mt-6 space-y-7">
                {visible.map((q) => <Question key={q.key} q={q} a={a} set={set} error={errors[q.key]} />)}
              </div>

              {sec.id === "C" && (a.aktivitas_setelah_lulus || []).includes("Tidak ketiga-tiganya") && (
                <p className="mt-6 rounded-lg bg-paper px-4 py-3 text-sm text-slate-600">
                  Pertanyaan tentang pekerjaan dan studi lanjut kami lewati. Lanjut ke pertanyaan sertifikat.
                </p>
              )}
              {serverError && <p role="alert" className="mt-6 flex items-center gap-1.5 text-sm text-red-700"><AlertCircle size={15} /> {serverError}</p>}
            </section>

            <div className="mt-5 flex items-center justify-between">
              <button type="button" onClick={() => go(-1)} disabled={step === 0}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-3 font-medium text-ink transition hover:bg-ink/5 disabled:invisible">
                <ChevronLeft size={18} /> Kembali
              </button>
              {last ? (
                <button type="button" onClick={submit} disabled={status === "sending"}
                  className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60">
                  {status === "sending" ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Kirim jawaban
                </button>
              ) : (
                <button type="button" onClick={() => check() && go(1)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-6 py-3 font-semibold text-white transition hover:bg-ink/90">
                  Lanjut <ChevronRight size={18} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
