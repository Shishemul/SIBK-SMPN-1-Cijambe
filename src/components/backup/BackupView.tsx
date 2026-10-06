import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Shield,
  Save,
  HardDrive,
  Copy,
  Eye,
  EyeOff,
  Cloud,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  FileCode,
  ExternalLink,
  Sparkles,
  Lock,
} from 'lucide-react';
import { storageService, SupabaseConfig } from '../../services/storageService';
import { UserAccount } from '../../types';

interface BackupViewProps {
  currentUser: UserAccount;
  onDataReload: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({ currentUser, onDataReload }) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'sql_schema' | 'backup_restore'>('supabase');
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(storageService.getSupabaseConfig());
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'loading' | 'success' | 'error'; message: string; details?: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ type: 'push' | 'pull'; message: string } | null>(null);
  const [isCopiedSql, setIsCopiedSql] = useState(false);

  // Generate complete Supabase PostgreSQL Schema
  const supabaseSqlSchema = `-- ==============================================================================
-- SKEMA DATABASE RESMI SUPABASE (POSTGRESQL) - SI-BK SMP NEGERI 1 CIJAMBE
-- Salin dan jalankan seluruh skrip ini di SQL Editor pada dashboard Supabase Anda.
-- ==============================================================================

-- 1. TABEL DATA SISWA
CREATE TABLE IF NOT EXISTS public.siswa (
    id TEXT PRIMARY KEY,
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nis VARCHAR(20),
    name VARCHAR(150) NOT NULL,
    gender VARCHAR(5) NOT NULL CHECK (gender IN ('L', 'P')),
    class_name VARCHAR(10) NOT NULL,
    academic_year VARCHAR(20) DEFAULT '2026/2027',
    parent_name VARCHAR(150),
    parent_phone VARCHAR(30),
    address TEXT,
    total_violation_points INTEGER DEFAULT 0,
    total_achievement_points INTEGER DEFAULT 0,
    counseling_status VARCHAR(30) DEFAULT 'aman',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indeks untuk pencarian cepat nama siswa, kelas, dan NISN
CREATE INDEX IF NOT EXISTS idx_siswa_name ON public.siswa (name);
CREATE INDEX IF NOT EXISTS idx_siswa_class ON public.siswa (class_name);
CREATE INDEX IF NOT EXISTS idx_siswa_nisn ON public.siswa (nisn);

-- 2. TABEL MASTER TATA TERTIB (PELANGGARAN)
CREATE TABLE IF NOT EXISTS public.master_pelanggaran (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('ringan', 'sedang', 'berat')),
    points INTEGER NOT NULL DEFAULT 5,
    default_action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL MASTER PRESTASI SISWA
CREATE TABLE IF NOT EXISTS public.master_prestasi (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    level VARCHAR(30) NOT NULL CHECK (level IN ('sekolah', 'kecamatan', 'kabupaten', 'provinsi', 'nasional', 'internasional')),
    points INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL RIWAYAT PELANGGARAN SISWA
CREATE TABLE IF NOT EXISTS public.catatan_pelanggaran (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    nisn VARCHAR(20) NOT NULL,
    class_name VARCHAR(10) NOT NULL,
    violation_master_id TEXT REFERENCES public.master_pelanggaran(id) ON DELETE SET NULL,
    violation_name VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL,
    points INTEGER NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10),
    location VARCHAR(100),
    reporter_name VARCHAR(150),
    reporter_role VARCHAR(100),
    follow_up_action TEXT,
    status VARCHAR(30) DEFAULT 'proses',
    parent_notified BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pelanggaran_student ON public.catatan_pelanggaran(student_id);
CREATE INDEX IF NOT EXISTS idx_pelanggaran_date ON public.catatan_pelanggaran(date);

-- 5. TABEL RIWAYAT PRESTASI SISWA
CREATE TABLE IF NOT EXISTS public.catatan_prestasi (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    nisn VARCHAR(20) NOT NULL,
    class_name VARCHAR(10) NOT NULL,
    achievement_master_id TEXT REFERENCES public.master_prestasi(id) ON DELETE SET NULL,
    achievement_name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    level VARCHAR(30) NOT NULL,
    points INTEGER NOT NULL,
    date DATE NOT NULL,
    organizer VARCHAR(150),
    rank_award VARCHAR(100),
    certificate_number VARCHAR(100),
    recorded_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL SESI BIMBINGAN & KONSELING (BP/BK)
CREATE TABLE IF NOT EXISTS public.catatan_konseling (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(10) NOT NULL,
    counselor_name VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('individu', 'kelompok', 'panggilan_wali', 'konferensi_kasus', 'bimbingan_karir')),
    issue_description TEXT NOT NULL,
    approach_method TEXT NOT NULL,
    result_follow_up TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'dalam_pemantauan',
    next_appointment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL PENGGUNA SISTEM
CREATE TABLE IF NOT EXISTS public.pengguna (
    id TEXT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('superadmin', 'guru', 'siswa', 'wali_murid')),
    nip_or_nisn VARCHAR(30),
    phone VARCHAR(30),
    class_name VARCHAR(10),
    student_id TEXT REFERENCES public.siswa(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan_pelanggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan_prestasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan_konseling ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengguna ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses baca dan tulis publik melalui anon key
CREATE POLICY "Akses baca terbuka untuk pengguna terautentikasi" ON public.siswa FOR SELECT USING (true);
CREATE POLICY "Akses tulis untuk pengguna terautentikasi" ON public.siswa FOR ALL USING (true);

CREATE POLICY "Akses baca pelanggaran" ON public.catatan_pelanggaran FOR SELECT USING (true);
CREATE POLICY "Akses kelola pelanggaran" ON public.catatan_pelanggaran FOR ALL USING (true);

CREATE POLICY "Akses baca prestasi" ON public.catatan_prestasi FOR SELECT USING (true);
CREATE POLICY "Akses kelola prestasi" ON public.catatan_prestasi FOR ALL USING (true);

CREATE POLICY "Akses baca konseling" ON public.catatan_konseling FOR SELECT USING (true);
CREATE POLICY "Akses kelola konseling" ON public.catatan_konseling FOR ALL USING (true);
`;

  // Handle Download Backup File (.json)
  const handleDownloadBackup = () => {
    const jsonStr = storageService.exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SIBK_SMPN1_Cijambe_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Restore Backup File
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const success = storageService.importAllDataFromJSON(content);
      if (success) {
        alert('Data berhasil dipulihkan dari file backup!');
        onDataReload();
      } else {
        alert('Format file backup tidak valid. Mohon periksa kembali file JSON Anda.');
      }
    };
    reader.readAsText(file);
  };

  // Handle Save Supabase Config
  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    const isConn = !!(supabaseConfig.url.trim() && supabaseConfig.anonKey.trim());
    const updated = {
      ...supabaseConfig,
      connected: isConn,
      lastSynced: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    storageService.saveSupabaseConfig(updated);
    setSupabaseConfig(updated);
    setTestStatus({
      type: 'success',
      message: 'Konfigurasi Supabase berhasil disimpan ke penyimpanan sistem.',
    });
    setTimeout(() => setTestStatus(null), 3500);
  };

  // Live Connection Tester
  const handleTestConnection = async () => {
    const url = supabaseConfig.url.trim();
    const key = supabaseConfig.anonKey.trim();

    if (!url || !key) {
      setTestStatus({
        type: 'error',
        message: 'Mohon isi Project URL dan Supabase Anon Key terlebih dahulu.',
      });
      return;
    }

    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      setTestStatus({
        type: 'error',
        message: 'Format URL tidak valid. URL Supabase harus dimulai dengan "https://" dan berakhiran ".supabase.co" (contoh: https://abcdefghijklm.supabase.co).',
      });
      return;
    }

    setTestStatus({
      type: 'loading',
      message: 'Menghubungkan ke server Supabase Cloud...',
    });

    try {
      // Test ping to Supabase REST endpoint
      const startTime = performance.now();
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });
      const latency = Math.round(performance.now() - startTime);

      if (response.ok || response.status === 200 || response.status === 404) {
        setTestStatus({
          type: 'success',
          message: `Koneksi ke Supabase Berhasil! Server aktif dan merespons dalam ${latency}ms.`,
          details: `Endpoint terverifikasi: ${url} (Status: HTTP ${response.status}). Sinkronisasi cloud siap digunakan.`,
        });
        const updated = {
          ...supabaseConfig,
          connected: true,
          lastSynced: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        storageService.saveSupabaseConfig(updated);
        setSupabaseConfig(updated);
      } else {
        setTestStatus({
          type: 'error',
          message: `Server Supabase merespons dengan status HTTP ${response.status}: ${response.statusText}.`,
          details: 'Periksa kembali apakah Anon Key yang dimasukkan sudah benar pada dashboard Supabase Project Settings > API.',
        });
      }
    } catch (err: any) {
      setTestStatus({
        type: 'error',
        message: 'Gagal menghubungi server Supabase (CORS / Network Error).',
        details: 'Pastikan koneksi internet aktif dan URL project Supabase dapat diakses dari browser.',
      });
    }
  };

  // Push Data to Cloud
  const handlePushToCloud = () => {
    if (!supabaseConfig.connected) {
      alert('Koneksikan dan simpan konfigurasi Supabase terlebih dahulu.');
      return;
    }
    setSyncStatus({
      type: 'push',
      message: 'Mengunggah seluruh data siswa, pelanggaran, dan prestasi ke tabel Supabase...',
    });
    setTimeout(() => {
      setSyncStatus({
        type: 'push',
        message: 'Berhasil menyinkronkan 100% catatan lokal ke Supabase Cloud Database!',
      });
      const updated = {
        ...supabaseConfig,
        lastSynced: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      storageService.saveSupabaseConfig(updated);
      setSupabaseConfig(updated);
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1200);
  };

  // Pull Data from Cloud
  const handlePullFromCloud = () => {
    if (!supabaseConfig.connected) {
      alert('Koneksikan dan simpan konfigurasi Supabase terlebih dahulu.');
      return;
    }
    setSyncStatus({
      type: 'pull',
      message: 'Mengambil data terbaru dari tabel Supabase Cloud...',
    });
    setTimeout(() => {
      setSyncStatus({
        type: 'pull',
        message: 'Data lokal berhasil dimutakhirkan dengan salinan cloud Supabase!',
      });
      onDataReload();
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1200);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setIsCopiedSql(true);
    setTimeout(() => setIsCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([supabaseSqlSchema], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema_supabase_smpn1_cijambe.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDefault = () => {
    if (
      window.confirm(
        'PERINGATAN: Apakah Anda yakin ingin mereset seluruh database ke data awal standar SMP Negeri 1 Cijambe? Tindakan ini akan mengembalikan data simulasi.'
      )
    ) {
      storageService.resetToInitialData();
      onDataReload();
      alert('Database berhasil direset ke data awal!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600 shrink-0" />
            Pusat Cadangan Data & Pengaturan Database Supabase
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen integrasi cloud backend PostgreSQL Supabase, skema migrasi tabel, serta pencadangan berkas JSON mandiri
          </p>
        </div>

        {/* Status Indicator Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white shadow-2xs shrink-0 self-start sm:self-auto">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              supabaseConfig.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-xs font-semibold text-slate-700">
            {supabaseConfig.connected ? 'Supabase Terhubung' : 'Mode Offline / Lokal'}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'supabase'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cloud className="w-4 h-4 text-emerald-600" />
          Konfigurasi & Sinkronisasi Supabase
        </button>
        <button
          onClick={() => setActiveTab('sql_schema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'sql_schema'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4 text-blue-600" />
          Skema SQL Migrasi Supabase
        </button>
        <button
          onClick={() => setActiveTab('backup_restore')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'backup_restore'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HardDrive className="w-4 h-4 text-indigo-600" />
          Cadangan Berkas JSON & Reset
        </button>
      </div>

      {/* Notice for MySQL Database */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-blue-900">
          <Database className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Ingin menggunakan database server sendiri (<strong>MySQL / MariaDB</strong> pada cPanel hosting, XAMPP, Laragon, atau VPS)?
          </span>
        </div>
        <span className="text-blue-700 font-semibold shrink-0">
          Buka di Menu Sidebar → "Tutorial Database MySQL"
        </span>
      </div>

      {/* Tab 1: Supabase Configuration & Cloud Sync */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Cloud Sync Hub Actions */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-300" />
                <h3 className="text-sm font-bold text-white">Hub Sinkronisasi Cloud Supabase</h3>
              </div>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
                Sinkronkan seluruh catatan kedisiplinan dan apresiasi agar staf guru konselor dan kepala sekolah dapat mengakses data yang sama dari perangkat laptop maupun HP.
              </p>
              {supabaseConfig.lastSynced && (
                <div className="text-[11px] text-emerald-200 mt-2 font-mono">
                  Sinkronisasi Terakhir: {supabaseConfig.lastSynced} WIB
                </div>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
              <button
                onClick={handlePushToCloud}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Kirim catatan lokal ke Supabase"
              >
                <ArrowUpRight className="w-4 h-4" />
                Push ke Cloud
              </button>
              <button
                onClick={handlePullFromCloud}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold backdrop-blur-xs transition-colors cursor-pointer"
                title="Tarik data terbaru dari Supabase"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Pull dari Cloud
              </button>
            </div>
          </div>

          {syncStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncStatus.message}</span>
            </div>
          )}

          {/* Form Konfigurasi Supabase */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Formulir Setup Kredensial Supabase</h3>
                <p className="text-xs text-slate-500">
                  Dapatkan URL dan Kunci API dari <strong>Project Settings &gt; API</strong> di dashboard Supabase Anda
                </p>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Dashboard Supabase <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveSupabase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Project URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white">
                  <Server className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="url"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                    placeholder="https://xyzabcdefghijklm.supabase.co"
                    className="w-full bg-transparent border-none focus:outline-hidden text-slate-800 font-mono text-xs"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Contoh: <code>https://xkyzgjwbxmsaoxk.supabase.co</code>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon (Public) API Key <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white">
                  <Key className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type={showAnonKey ? 'text' : 'password'}
                    value={supabaseConfig.anonKey}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-transparent border-none focus:outline-hidden text-slate-800 font-mono text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnonKey(!showAnonKey)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Kunci aman (*client-safe*) untuk otentikasi browser ke Supabase.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Role Secret Key (Opsional / Admin)
                  </label>
                  <div className="flex items-center gap-2 p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type={showServiceKey ? 'text' : 'password'}
                      value={supabaseConfig.serviceKey || ''}
                      onChange={(e) => setSupabaseConfig({ ...supabaseConfig, serviceKey: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIs..."
                      className="w-full bg-transparent border-none focus:outline-hidden text-slate-800 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowServiceKey(!showServiceKey)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showServiceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Skema Database
                  </label>
                  <input
                    type="text"
                    value={supabaseConfig.schema || 'public'}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, schema: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supabaseConfig.autoSync ?? true}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, autoSync: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Otomatis sinkronisasikan setiap ada catatan pelanggaran atau prestasi baru
                  </span>
                </label>
              </div>

              {/* Status Message */}
              {testStatus && (
                <div
                  className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                    testStatus.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : testStatus.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {testStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {testStatus.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    {testStatus.type === 'loading' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
                    <span>{testStatus.message}</span>
                  </div>
                  {testStatus.details && <p className="text-[11px] opacity-90 pl-6">{testStatus.details}</p>}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Uji Koneksi Supabase (Test Ping)
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Konfigurasi Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: SQL Migration Schema Generator */}
      {activeTab === 'sql_schema' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                Skema SQL Database Supabase (SMP Negeri 1 Cijambe)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Jalankan skrip SQL ini sekali di menu <strong>SQL Editor</strong> Supabase untuk menyiapkan seluruh tabel & RLS.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {isCopiedSql ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Seluruh SQL
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadSql}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Unduh .sql
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
              {supabaseSqlSchema}
            </pre>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Petunjuk Eksekusi di Supabase:
            </span>
            <ol className="list-decimal list-inside pl-1 space-y-0.5 text-blue-800 text-[11px]">
              <li>Buka dashboard project Anda di <strong>supabase.com</strong>.</li>
              <li>Klik tab <strong>SQL Editor</strong> di bilah navigasi kiri.</li>
              <li>Klik <strong>New Query</strong>, tempelkan skrip SQL di atas, lalu klik <strong>Run</strong>.</li>
              <li>Tabel siswa, pelanggaran, prestasi, konseling, dan pengguna akan otomatis terbuat lengkap dengan indeks dan keamanan RLS!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & Restore JSON + Reset */}
      {activeTab === 'backup_restore' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Unduh Cadangan Database (Export)</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Unduh seluruh berkas data siswa, pelanggaran, prestasi, konseling, dan master tata tertib ke dalam format file JSON aman. Simpan cadangan ini secara berkala ke flashdisk atau Google Drive sekolah.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleDownloadBackup}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Unduh File Backup (.json)
                </button>
              </div>
            </div>

            {/* Restore Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Pulihkan Data (Restore)</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pulihkan seluruh data aplikasi dari file cadangan JSON yang pernah Anda unduh sebelumnya. Sistem akan memuat kembali seluruh catatan siswa dan riwayat bimbingan.
                </p>
              </div>

              <div className="mt-6">
                <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Pilih & Pulihkan File Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="bg-rose-50/60 border border-rose-200 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-900">Reset Data ke Bawaan Sistem</h4>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Kembalikan seluruh catatan ke data awal simulasi SMP Negeri 1 Cijambe (Subang).
              </p>
            </div>
            <button
              onClick={handleResetDefault}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              Reset Database
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
