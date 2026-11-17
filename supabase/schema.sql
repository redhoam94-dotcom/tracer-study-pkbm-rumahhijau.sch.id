-- Tracer Study PKBM Rumah Hijau: jalankan di Supabase > SQL Editor

create table if not exists public.tracer_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Bagian A
  nama text not null,
  alamat text not null,
  tanggal_lahir date not null,
  jenis_kelamin text not null check (jenis_kelamin in ('Laki-laki','Perempuan')),
  bidang_keahlian text not null check (bidang_keahlian in ('Informatika','Kecantikan','Tata Busana')),
  tahun_lulus text not null,
  pendidikan_sebelum_smk text not null check (pendidikan_sebelum_smk in ('SMP','MTs','Paket A (setara SD)','Paket B (setara SMP)')),

  -- Bagian B
  inisiatif_masuk text not null,
  motivasi_masuk text not null,
  kondisi_terpenuhi text not null check (kondisi_terpenuhi in ('Ya','Tidak')),

  -- Bagian C
  aktivitas_setelah_lulus text[] not null,
  kesesuaian_bidang text,
  lokasi_kerja text,
  waktu_tunggu text,
  durasi_mulai date,
  durasi_sampai date,
  rentang_gaji text,

  -- Bagian D
  punya_sertifikat text,
  jenis_sertifikat text[],
  tahu_sertifikasi_profesi text,
  pernah_sertifikasi_profesi text,
  alasan_tidak_sertifikasi text,
  peran_memperoleh_kerja text,
  manfaat_keterampilan text,
  pentingnya_sertifikat_kursus text,

  -- Bagian E
  pendidikan_ortu text,
  penghasilan_ortu text
);

create index if not exists tracer_responses_created_at_idx on public.tracer_responses (created_at desc);

-- Row Level Security
alter table public.tracer_responses enable row level security;

drop policy if exists "Publik boleh mengisi survei" on public.tracer_responses;
create policy "Publik boleh mengisi survei"
  on public.tracer_responses for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Hanya admin yang boleh membaca" on public.tracer_responses;
create policy "Hanya admin yang boleh membaca"
  on public.tracer_responses for select
  to authenticated
  using (true);

grant insert on public.tracer_responses to anon, authenticated;
grant select on public.tracer_responses to authenticated;
