// Definisi pertanyaan, logika lompatan, validasi, dan pembentuk payload.
export const NONE = "Tidak ketiga-tiganya";
const thisYear = new Date().getFullYear();
// Tahun lulus: 2020 sampai tahun berjalan (otomatis bertambah tiap tahun), terbaru di atas
const YEARS = Array.from({ length: thisYear - 2020 + 1 }, (_, i) => String(thisYear - i));

const GAJI = [
  "< Rp 500.000",
  "Rp 500.000 - < Rp 1.000.000",
  "Rp 1.000.000 - < Rp 1.500.000",
  "Rp 1.500.000 - < Rp 2.000.000",
  "Rp 2.000.000 - < Rp 3.000.000",
  "> Rp 3.000.000",
];
const PERAN = ["Berperan sangat besar", "Berperan tapi minimal", "Sama sekali tidak membantu"];
const YT = ["Ya", "Tidak"];

// Logika 1: sembunyikan pertanyaan pekerjaan/studi bila memilih "Tidak ketiga-tiganya"
const hasActivity = (a) => !(a.aktivitas_setelah_lulus || []).includes(NONE);

export const SECTIONS = [
  { id: "A", title: "Data diri", desc: "Informasi dasar tentang Anda sebagai alumni." },
  { id: "B", title: "Motivasi", desc: "Alasan Anda dulu memilih belajar di PKBM Rumah Hijau." },
  { id: "C", title: "Setelah lulus", desc: "Kegiatan Anda sesudah lulus dari PKBM." },
  { id: "D", title: "Sertifikasi", desc: "Sertifikat dan manfaat keterampilan dari PKBM." },
  { id: "E", title: "Keluarga", desc: "Latar belakang pendidikan dan penghasilan orang tua." },
];

export const QUESTIONS = [
  { n: 1, key: "nama", section: "A", label: "Nama lulusan", type: "text", required: true },
  { n: 2, key: "alamat", section: "A", label: "Alamat asal", type: "textarea", required: true },
  { n: 3, key: "tanggal_lahir", section: "A", label: "Tanggal lahir", type: "date", required: true },
  { n: 4, key: "jenis_kelamin", section: "A", label: "Jenis kelamin", type: "radio", required: true, options: ["Laki-laki", "Perempuan"] },
  { n: 5, key: "bidang_keahlian", section: "A", label: "Jurusan", type: "select", placeholder: "Pilih jurusan", required: true, options: ["Informatika", "Kecantikan", "Tata Busana"] },
  { n: 6, key: "tahun_lulus", section: "A", label: "Tahun lulus", type: "select", placeholder: "Pilih tahun lulus", required: true, options: YEARS },
  { n: 7, key: "pendidikan_sebelum_smk", section: "A", label: "Pendidikan terakhir sebelum masuk PKBM", type: "radio", required: true, options: ["SMP", "MTs"] },

  { n: 8, key: "inisiatif_masuk", section: "B", label: "Siapa yang memiliki inisiatif Anda masuk PKBM?", type: "radio", required: true, options: ["Murni keinginan sendiri", "Orang tua", "Rekan kerja/atasan", "Lain-lain"] },
  { n: 9, key: "motivasi_masuk", section: "B", label: "Apa motivasi Anda masuk PKBM?", type: "radio", required: true, options: ["Memiliki keterampilan kerja setelah lulus", "Adanya kebutuhan dari job order", "Ingin cepat kerja", "Lain-lain"] },
  { n: 10, key: "kondisi_terpenuhi", section: "B", label: "Apakah kondisi yang Anda inginkan terpenuhi setelah selesai pendidikan di PKBM?", type: "radio", required: true, options: YT },

  { n: 11, key: "aktivitas_setelah_lulus", section: "C", label: "Apa yang Anda lakukan setelah lulus dari PKBM?", hint: "Boleh memilih lebih dari satu.", type: "checkbox", required: true, exclusive: NONE, options: ["Bekerja", "Studi Lanjut", "Berwirausaha", NONE] },
  { n: 12, key: "kesesuaian_bidang", section: "C", label: "Apakah pekerjaan/pendidikan lanjut Anda sesuai dengan jurusan Anda di PKBM?", type: "radio", showIf: hasActivity, options: ["Sangat sesuai", "Tidak sepenuhnya sesuai", "Tidak sesuai"] },
  { n: 13, key: "lokasi_kerja", section: "C", label: "Di mana Anda bekerja/studi lanjut saat ini?", type: "radio", showIf: hasActivity, options: ["Di Sumatera Utara", "Di Luar Sumatera Utara", "Di Luar Negeri"] },
  { n: 14, key: "waktu_tunggu", section: "C", label: "Berapa waktu tunggu Anda sejak lulus hingga memperoleh pekerjaan?", type: "radio", showIf: hasActivity, options: ["Langsung bekerja setelah lulus", "Kurang dari 3 bulan", "3 - 6 bulan", "Lebih dari 6 bulan"] },
  { n: 15, key: "durasi_mulai", key2: "durasi_sampai", section: "C", label: "Berapa lama Anda bekerja?", hint: "Opsional. Tanggal akhir boleh dikosongkan bila masih bekerja.", type: "daterange", showIf: hasActivity },
  { n: 16, key: "rentang_gaji", section: "C", label: "Berapa gaji yang Anda terima?", type: "radio", showIf: hasActivity, options: GAJI },

  // Logika 2: sembunyikan jenis sertifikat bila "Tidak"
  { n: 17, key: "punya_sertifikat", section: "D", label: "Apakah Anda memiliki sertifikat lain selain ijazah?", type: "radio", options: YT },
  { n: 18, key: "jenis_sertifikat", section: "D", label: "Jenis sertifikat yang Anda terima", hint: "Boleh memilih lebih dari satu.", type: "checkbox", showIf: (a) => a.punya_sertifikat !== "Tidak", options: ["Sertifikat kecakapan dari PKBM", "Sertifikat dari lembaga pemerintahan (Dinas P&K, Kemendiknas, dll.)", "Sertifikat dari lembaga kursus non-akreditasi/swasta"] },
  { n: 19, key: "tahu_sertifikasi_profesi", section: "D", label: "Apakah Anda mengetahui tentang sertifikasi profesi?", type: "radio", options: YT },
  { n: 20, key: "pernah_sertifikasi_profesi", section: "D", label: "Apakah Anda pernah melakukan sertifikasi profesi?", type: "radio", showIf: (a) => a.tahu_sertifikasi_profesi !== "Tidak", options: YT },
  { n: 21, key: "alasan_tidak_sertifikasi", section: "D", label: "Mengapa Anda tidak melakukan sertifikasi profesi?", type: "radio", showIf: (a) => a.pernah_sertifikasi_profesi === "Tidak", options: ["Biaya mahal", "Pekerjaan tidak terlalu membutuhkan", "Lain-lain"] },
  { n: 22, key: "peran_memperoleh_kerja", section: "D", label: "Seberapa besar peran keterampilan dan sertifikat PKBM untuk memperoleh pekerjaan?", type: "radio", options: PERAN },
  { n: 23, key: "manfaat_keterampilan", section: "D", label: "Seberapa bermanfaat keterampilan dari PKBM untuk melaksanakan pekerjaan/pendidikan Anda saat ini?", type: "radio", options: PERAN },
  { n: 24, key: "pentingnya_sertifikat_kursus", section: "D", label: "Seberapa penting sertifikat lembaga kursus sebagai syarat administrasi kerja?", hint: "Khusus yang bekerja pada orang lain, bukan berwirausaha.", type: "radio", options: ["Faktor utama", "Faktor tambahan", "Tidak berpengaruh sama sekali"] },

  { n: 25, key: "pendidikan_ortu", section: "E", label: "Pendidikan formal kepala keluarga (Bapak/Ibu)", type: "radio", options: ["SD/SMP", "SMA/SMK", "D1/D2/D3", "S1/S2/S3"] },
  { n: 26, key: "penghasilan_ortu", section: "E", label: "Rentang penghasilan orang tua", type: "radio", options: GAJI },
];

export const optionsOf = (key) => QUESTIONS.find((q) => q.key === key)?.options || [];
export const isVisible = (q, a) => (q.showIf ? q.showIf(a) : true);

export function validate(qs, a) {
  const e = {};
  for (const q of qs) {
    const v = a[q.key];
    const empty = Array.isArray(v) ? v.length === 0 : v == null || String(v).trim() === "";
    if (q.required && empty) { e[q.key] = "Pertanyaan ini wajib diisi."; continue; }
    if (q.type === "date" && v && new Date(v) > new Date()) e[q.key] = "Tanggal tidak boleh di masa depan.";
    if (q.type === "daterange" && a.durasi_mulai && a.durasi_sampai && a.durasi_sampai < a.durasi_mulai)
      e[q.key] = "Tanggal akhir harus sama dengan atau setelah tanggal mulai.";
  }
  return e;
}

// Jawaban pada pertanyaan yang disembunyikan dikirim sebagai NULL.
export function buildPayload(a) {
  const p = {};
  for (const q of QUESTIONS) {
    const show = isVisible(q, a);
    for (const k of q.type === "daterange" ? [q.key, q.key2] : [q.key]) {
      let v = show ? a[k] : null;
      if (Array.isArray(v) && v.length === 0) v = null;
      if (typeof v === "string") v = v.trim() || null;
      p[k] = v ?? null;
    }
  }
  return p;
}

export const EXPORT_COLUMNS = [
  { key: "created_at", label: "Waktu isi" },
  ...QUESTIONS.flatMap((q) =>
    q.type === "daterange"
      ? [{ key: q.key, label: "15. Mulai bekerja" }, { key: q.key2, label: "15. Sampai dengan" }]
      : [{ key: q.key, label: `${q.n}. ${q.label}` }]
  ),
];
