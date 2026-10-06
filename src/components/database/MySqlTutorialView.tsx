import React, { useState } from 'react';
import {
  Database,
  Server,
  Cloud,
  FileCode,
  Terminal,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  FolderArchive,
  Lock,
  Globe,
  Settings,
  HelpCircle,
  Play,
  Key,
} from 'lucide-react';

export const MySqlTutorialView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'cpanel' | 'localhost' | 'vps' | 'cloud' | 'schema' | 'connection' | 'test_tool' | 'troubleshoot'
  >('cpanel');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Connection Simulator form state
  const [simHost, setSimHost] = useState('localhost');
  const [simPort, setSimPort] = useState('3306');
  const [simDb, setSimDb] = useState('smpn1cijambe_sibk');
  const [simUser, setSimUser] = useState('u_sibk_admin');
  const [simPass, setSimPass] = useState('P@ssw0rdSubang2026!');
  const [simResult, setSimResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    connectionString?: string;
  }>({ status: 'idle', message: '' });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simHost || !simDb || !simUser) {
      setSimResult({
        status: 'error',
        message: 'Parameter host, nama database, dan username wajib diisi!',
      });
      return;
    }

    setSimResult({
      status: 'success',
      message: `Konfigurasi MySQL tervalidasi! Parameter koneksi ke '${simDb}' pada host '${simHost}:${simPort}' siap digunakan oleh backend.`,
      connectionString: `mysql://${simUser}:${simPass ? '••••••••' : ''}@${simHost}:${simPort}/${simDb}?charset=utf8mb4`,
    });
  };

  // Complete Official MySQL SQL DDL Schema for SI-BK SMPN 1 Cijambe
  const mysqlSchemaScript = `-- ==============================================================================
-- SKEMA RESMI DATABASE MYSQL / MARIADB - SI-BK SMP NEGERI 1 CIJAMBE
-- Sistem Informasi Bimbingan Konseling, Pelanggaran & Prestasi Siswa
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. PEMBUATAN DATABASE (Opsional jika sudah dibuat di cPanel)
-- CREATE DATABASE IF NOT EXISTS \`smpn1cijambe_sibk\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE \`smpn1cijambe_sibk\`;

-- 2. TABEL DATA ROMBONGAN BELAJAR (KELAS)
CREATE TABLE IF NOT EXISTS \`kelas\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(20) NOT NULL COMMENT 'Contoh: 7A, 8B, 9C',
  \`grade\` ENUM('7', '8', '9') NOT NULL,
  \`homeroom_teacher\` VARCHAR(150) NOT NULL COMMENT 'Nama Wali Kelas',
  \`total_students\` INT DEFAULT 0,
  \`academic_year\` VARCHAR(20) DEFAULT '2026/2027',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_kelas_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL DATA SISWA
CREATE TABLE IF NOT EXISTS \`siswa\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`nisn\` VARCHAR(20) NOT NULL,
  \`nis\` VARCHAR(20) DEFAULT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`gender\` ENUM('L', 'P') NOT NULL,
  \`class_name\` VARCHAR(20) NOT NULL,
  \`academic_year\` VARCHAR(20) DEFAULT '2026/2027',
  \`parent_name\` VARCHAR(150) DEFAULT NULL,
  \`parent_phone\` VARCHAR(30) DEFAULT NULL COMMENT 'Nomor WhatsApp Orang Tua',
  \`address\` TEXT DEFAULT NULL,
  \`total_violation_points\` INT DEFAULT 0,
  \`total_achievement_points\` INT DEFAULT 0,
  \`counseling_status\` ENUM('aman', 'pantau', 'peringatan_1', 'peringatan_2', 'kritis') DEFAULT 'aman',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_siswa_nisn\` (\`nisn\`),
  KEY \`idx_siswa_class\` (\`class_name\`),
  KEY \`idx_siswa_status\` (\`counseling_status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL MASTER TATA TERTIB & PELANGGARAN
CREATE TABLE IF NOT EXISTS \`master_pelanggaran\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`code\` VARCHAR(20) NOT NULL COMMENT 'Contoh: K-01, P-05',
  \`name\` VARCHAR(255) NOT NULL,
  \`category\` ENUM('ringan', 'sedang', 'berat') NOT NULL,
  \`points\` INT NOT NULL DEFAULT 5,
  \`description\` TEXT DEFAULT NULL,
  \`default_action\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_master_code\` (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL PENCATATAN PELANGGARAN SISWA
CREATE TABLE IF NOT EXISTS \`catatan_pelanggaran\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`student_name\` VARCHAR(150) NOT NULL,
  \`nisn\` VARCHAR(20) NOT NULL,
  \`class_name\` VARCHAR(20) NOT NULL,
  \`violation_master_id\` VARCHAR(50) DEFAULT NULL,
  \`violation_name\` VARCHAR(255) NOT NULL,
  \`category\` ENUM('ringan', 'sedang', 'berat') NOT NULL,
  \`points\` INT NOT NULL,
  \`date\` DATE NOT NULL,
  \`time\` VARCHAR(10) DEFAULT '08:00',
  \`location\` VARCHAR(150) DEFAULT 'Lingkungan Sekolah',
  \`reporter_name\` VARCHAR(150) NOT NULL COMMENT 'Guru Pelapor/Piket',
  \`reporter_role\` VARCHAR(50) DEFAULT 'Guru',
  \`follow_up_action\` TEXT NOT NULL,
  \`status\` ENUM('proses', 'selesai', 'panggilan_ortu', 'skorsing') DEFAULT 'proses',
  \`parent_notified\` TINYINT(1) DEFAULT 0,
  \`parent_notified_date\` DATE DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_pelanggaran_student\` (\`student_id\`),
  KEY \`idx_pelanggaran_date\` (\`date\`),
  CONSTRAINT \`fk_pelanggaran_siswa\` FOREIGN KEY (\`student_id\`) REFERENCES \`siswa\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABEL MASTER PRESTASI & PENGHARGAAN
CREATE TABLE IF NOT EXISTS \`master_prestasi\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`code\` VARCHAR(20) NOT NULL COMMENT 'Contoh: PRS-01',
  \`name\` VARCHAR(255) NOT NULL,
  \`category\` ENUM('akademik', 'non_akademik', 'keagamaan', 'kepemimpinan') NOT NULL,
  \`level\` ENUM('sekolah', 'kecamatan', 'kabupaten', 'provinsi', 'nasional') NOT NULL,
  \`points\` INT NOT NULL DEFAULT 10,
  \`description\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_master_prestasi_code\` (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABEL PENCATATAN PRESTASI SISWA
CREATE TABLE IF NOT EXISTS \`catatan_prestasi\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`student_name\` VARCHAR(150) NOT NULL,
  \`nisn\` VARCHAR(20) NOT NULL,
  \`class_name\` VARCHAR(20) NOT NULL,
  \`achievement_master_id\` VARCHAR(50) DEFAULT NULL,
  \`achievement_name\` VARCHAR(255) NOT NULL,
  \`category\` ENUM('akademik', 'non_akademik', 'keagamaan', 'kepemimpinan') NOT NULL,
  \`level\` ENUM('sekolah', 'kecamatan', 'kabupaten', 'provinsi', 'nasional') NOT NULL,
  \`points\` INT NOT NULL,
  \`date\` DATE NOT NULL,
  \`organizer\` VARCHAR(150) DEFAULT NULL,
  \`rank_award\` VARCHAR(100) NOT NULL COMMENT 'Juara 1, Medali Emas, dll',
  \`recorded_by\` VARCHAR(150) NOT NULL,
  \`certificate_number\` VARCHAR(100) DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_prestasi_student\` (\`student_id\`),
  CONSTRAINT \`fk_prestasi_siswa\` FOREIGN KEY (\`student_id\`) REFERENCES \`siswa\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABEL LAYANAN BIMBINGAN & KONSELING (BP/BK)
CREATE TABLE IF NOT EXISTS \`catatan_konseling\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`student_name\` VARCHAR(150) NOT NULL,
  \`class_name\` VARCHAR(20) NOT NULL,
  \`counselor_name\` VARCHAR(150) NOT NULL,
  \`date\` DATE NOT NULL,
  \`type\` ENUM('individu', 'kelompok', 'panggilan_wali', 'konferensi_kasus', 'bimbingan_karir') NOT NULL,
  \`issue_description\` TEXT NOT NULL,
  \`approach_method\` TEXT DEFAULT NULL,
  \`result_follow_up\` TEXT NOT NULL,
  \`status\` ENUM('terjadwal', 'berlangsung', 'selesai', 'dalam_pemantauan', 'rujukan') DEFAULT 'dalam_pemantauan',
  \`next_appointment_date\` DATE DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_konseling_student\` (\`student_id\`),
  KEY \`idx_konseling_date\` (\`date\`),
  CONSTRAINT \`fk_konseling_siswa\` FOREIGN KEY (\`student_id\`) REFERENCES \`siswa\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABEL MANAJEMEN AKUN PENGGUNA
CREATE TABLE IF NOT EXISTS \`pengguna\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`role\` ENUM('superadmin', 'guru', 'siswa', 'wali_murid') NOT NULL,
  \`nip_or_nisn\` VARCHAR(50) DEFAULT NULL,
  \`phone\` VARCHAR(30) DEFAULT NULL,
  \`student_id\` VARCHAR(50) DEFAULT NULL,
  \`class_name\` VARCHAR(20) DEFAULT NULL,
  \`status\` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_pengguna_username\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABEL NOTIFIKASI SISTEM
CREATE TABLE IF NOT EXISTS \`notifikasi\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(200) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`type\` ENUM('violation', 'achievement', 'counseling', 'alert', 'system') NOT NULL,
  \`date\` DATE NOT NULL,
  \`is_read\` TINYINT(1) DEFAULT 0,
  \`link_tab\` VARCHAR(50) DEFAULT NULL,
  \`student_id\` VARCHAR(50) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
-- SELESAI: Skema MySQL SI-BK SMPN 1 Cijambe berhasil disiapkan!`;

  // Download SQL File helper
  const handleDownloadSql = () => {
    const blob = new Blob([mysqlSchemaScript], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sibk_smpn1cijambe_mysql_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner Header */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-blue-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
              <Database className="w-5 h-5 text-blue-400" />
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              MySQL / MariaDB RDBMS
            </span>
            <span className="text-xs text-blue-200 hidden sm:inline">
              Panduan Praktis Server Sekolah
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Tutorial Lengkap Konfigurasi Database MySQL
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
            Panduan langkah demi langkah menyiapkan basis data MySQL/MariaDB untuk SI-BK SMP Negeri 1 Cijambe pada cPanel Hosting, Localhost (XAMPP/Laragon), VPS Linux, hingga Cloud Database, lengkap dengan skrip SQL siap impor dan simulator koneksi.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-blue-800/60 text-xs">
            <button
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Unduh File .SQL Lengkap</span>
            </button>
            <button
              onClick={() => copyToClipboard(mysqlSchemaScript, 'hero_sql')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800/80 hover:bg-blue-700 text-blue-100 border border-blue-700 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey === 'hero_sql' ? 'Tersalin!' : 'Salin Skrip Skema SQL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Horizontal Scrollable for Mobile) */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('cpanel')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cpanel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>1. cPanel & phpMyAdmin</span>
          </button>

          <button
            onClick={() => setActiveTab('localhost')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'localhost'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>2. Localhost (XAMPP / Laragon)</span>
          </button>

          <button
            onClick={() => setActiveTab('vps')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'vps'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. VPS Linux (Ubuntu)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>4. Skema SQL MySQL (.sql)</span>
          </button>

          <button
            onClick={() => setActiveTab('connection')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'connection'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>5. Konfigurasi .env & Koneksi</span>
          </button>

          <button
            onClick={() => setActiveTab('test_tool')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'test_tool'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>6. Simulator Uji Parameter</span>
          </button>

          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'troubleshoot'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>7. FAQ & Troubleshooting</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CPANEL & PHPMYADMIN */}
      {activeTab === 'cpanel' && (
        <div className="space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Server className="w-5 h-5 text-blue-600" />
              Langkah Konfigurasi MySQL pada cPanel Hosting Sekolah
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Metode standar untuk shared hosting atau server sekolah berbasis cPanel:
            </p>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1.5 flex-1 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Buat Database Baru via "MySQL Database Wizard"
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Masuk ke halaman utama cPanel sekolah, lalu cari menu <strong>Databases → MySQL® Database Wizard</strong>. Masukkan nama database baru, misalnya: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">smpn1cij_sibk</code>. Klik <em>Next Step</em>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1.5 flex-1 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Buat Pengguna Database (Database User) & Password Aman
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Tentukan username baru (misal: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">smpn1cij_bkuser</code>) dan gunakan fitur <strong>Password Generator</strong> cPanel untuk menghasilkan kata sandi yang kuat (minimal 16 karakter acak). Catat username dan password ini untuk file <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.env</code>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1.5 flex-1 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Berikan Hak Akses Penuh (ALL PRIVILEGES)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Pada langkah <em>Add User to the Database</em>, centang kotak <strong>ALL PRIVILEGES</strong> (mencakup SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP). Klik <em>Make Changes</em>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="space-y-1.5 flex-1 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Impor Skema SQL via phpMyAdmin
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Kembali ke cPanel, buka menu <strong>Databases → phpMyAdmin</strong>. Pilih database yang baru Anda buat pada panel sebelah kiri, klik tab <strong>Import</strong> di bagian atas, pilih file <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">sibk_smpn1cijambe_mysql_schema.sql</code> yang Anda unduh dari aplikasi ini, lalu klik tombol <strong>Go / Kirim</strong>. Seluruh 9 tabel akan otomatis terbuat!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCALHOST XAMPP / LARAGON */}
      {activeTab === 'localhost' && (
        <div className="space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <HardDrive className="w-5 h-5 text-emerald-600" />
              Panduan Menjalankan MySQL di Komputer Lokal (XAMPP / Laragon)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Sangat cocok untuk pengujian di komputer server lokal sekolah (Lab Komputer / Ruang BK):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Opsi XAMPP */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Menggunakan XAMPP
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
                  <li>Buka <strong>XAMPP Control Panel</strong> di Windows/Mac.</li>
                  <li>Klik <strong>Start</strong> pada modul <em>Apache</em> dan <em>MySQL</em> (pastikan statusnya menjadi hijau dengan Port 3306).</li>
                  <li>Buka browser dan akses alamat: <code className="bg-white px-1.5 py-0.5 rounded text-blue-600 font-mono">http://localhost/phpmyadmin</code></li>
                  <li>Klik tombol <strong>New</strong> di sidebar kiri, beri nama database: <code className="bg-white px-1.5 py-0.5 rounded font-mono">smpn1cijambe_sibk</code>, pilih Collation: <code className="bg-white px-1.5 py-0.5 rounded font-mono">utf8mb4_unicode_ci</code>, lalu klik <strong>Create</strong>.</li>
                  <li>Buka tab <strong>SQL</strong>, tempel skrip DDL MySQL dari aplikasi ini, lalu klik <strong>Go</strong>.</li>
                </ol>
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800">
                  Default XAMPP: Host = <code>localhost</code>, User = <code>root</code>, Password = <em>(kosong/empty)</em>, Port = <code>3306</code>.
                </div>
              </div>

              {/* Opsi Laragon */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Menggunakan Laragon
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
                  <li>Buka aplikasi <strong>Laragon</strong>.</li>
                  <li>Klik tombol <strong>Start All</strong>.</li>
                  <li>Klik tombol <strong>Database</strong> di Laragon (membuka antarmuka HeidiSQL secara otomatis).</li>
                  <li>Klik kanan pada koneksi sesi, pilih <strong>Create new → Database</strong>, beri nama <code className="bg-white px-1.5 py-0.5 rounded font-mono">smpn1cijambe_sibk</code>.</li>
                  <li>Buka tab <em>Query</em>, buka file <code className="bg-white px-1.5 py-0.5 rounded font-mono">.sql</code> yang diunduh, lalu tekan tombol <strong>F9</strong> untuk mengeksekusi skema.</li>
                </ol>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800">
                  Default Laragon: Host = <code>127.0.0.1</code>, User = <code>root</code>, Password = <em>(kosong/empty)</em>, Port = <code>3306</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VPS UBUNTU LINUX */}
      {activeTab === 'vps' && (
        <div className="space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              Instalasi & Pengaturan MySQL Server di VPS Linux Ubuntu / Debian
            </h3>
            <p className="text-xs text-slate-500">
              Jalankan perintah berikut di terminal SSH VPS Anda:
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-3 py-1.5 rounded-t-lg text-[11px]">
                  <span>1. Install MySQL Server & Pengamanan Awal</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'sudo apt update && sudo apt install -y mysql-server\nsudo mysql_secure_installation',
                        'vps_cmd1'
                      )
                    }
                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'vps_cmd1' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-emerald-400 font-mono rounded-b-lg overflow-x-auto">
{`sudo apt update && sudo apt install -y mysql-server
sudo mysql_secure_installation`}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-3 py-1.5 rounded-t-lg text-[11px]">
                  <span>2. Masuk ke MySQL Shell & Buat Database + Pengguna Terisolasi</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `sudo mysql -u root\nCREATE DATABASE smpn1cijambe_sibk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nCREATE USER 'sibk_admin'@'localhost' IDENTIFIED BY 'KataSandiKuat2026!';\nGRANT ALL PRIVILEGES ON smpn1cijambe_sibk.* TO 'sibk_admin'@'localhost';\nFLUSH PRIVILEGES;\nEXIT;`,
                        'vps_cmd2'
                      )
                    }
                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'vps_cmd2' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-emerald-400 font-mono rounded-b-lg overflow-x-auto">
{`sudo mysql -u root

-- Jalankan perintah SQL berikut:
CREATE DATABASE smpn1cijambe_sibk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sibk_admin'@'localhost' IDENTIFIED BY 'KataSandiKuat2026!';
GRANT ALL PRIVILEGES ON smpn1cijambe_sibk.* TO 'sibk_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;`}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-3 py-1.5 rounded-t-lg text-[11px]">
                  <span>3. Impor Skema Database via Terminal</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'mysql -u sibk_admin -p smpn1cijambe_sibk < sibk_smpn1cijambe_mysql_schema.sql',
                        'vps_cmd3'
                      )
                    }
                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'vps_cmd3' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-emerald-400 font-mono rounded-b-lg overflow-x-auto">
{`mysql -u sibk_admin -p smpn1cijambe_sibk < sibk_smpn1cijambe_mysql_schema.sql`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SKEMA SQL LENGKAP */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-600" />
                  Skrip Skema DDL MySQL (InnoDB & UTF8MB4)
                </h3>
                <p className="text-xs text-slate-500">
                  Skrip SQL murni berisi 9 tabel relasional untuk SMP Negeri 1 Cijambe
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSql}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh .SQL</span>
                </button>
                <button
                  onClick={() => copyToClipboard(mysqlSchemaScript, 'tab_schema')}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedKey === 'tab_schema' ? 'Tersalin!' : 'Salin Semua'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed border border-slate-800">
                {mysqlSchemaScript}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KONFIGURASI .ENV & KONEKSI */}
      {activeTab === 'connection' && (
        <div className="space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              Contoh Konfigurasi File Lingkungan (.env) & Driver Koneksi
            </h3>
            <p className="text-xs text-slate-500">
              Gunakan parameter berikut pada berkas konfigurasi backend aplikasi Anda:
            </p>

            {/* Template .env */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>1. Template Konfigurasi .env</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `# ================================================\n# KONFIGURASI KONEKSI DATABASE MYSQL - SI-BK\n# ================================================\nDB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_DATABASE=smpn1cijambe_sibk\nDB_USERNAME=sibk_admin\nDB_PASSWORD=KataSandiRahasia2026!\nDB_CHARSET=utf8mb4\nDB_COLLATION=utf8mb4_unicode_ci\nDB_TIMEZONE=+07:00`,
                      'dotenv_code'
                    )
                  }
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'dotenv_code' ? 'Tersalin' : 'Salin .env'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto">
{`# ================================================
# KONFIGURASI KONEKSI DATABASE MYSQL - SI-BK
# ================================================
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smpn1cijambe_sibk
DB_USERNAME=sibk_admin
DB_PASSWORD=KataSandiRahasia2026!
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
DB_TIMEZONE=+07:00`}
              </pre>
            </div>

            {/* Node.js / Express Driver */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>2. Kode Koneksi Node.js (mysql2/promise dengan Connection Pool)</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `import mysql from 'mysql2/promise';\n\nexport const dbPool = mysql.createPool({\n  host: process.env.DB_HOST || 'localhost',\n  port: Number(process.env.DB_PORT) || 3306,\n  user: process.env.DB_USERNAME || 'root',\n  password: process.env.DB_PASSWORD || '',\n  database: process.env.DB_DATABASE || 'smpn1cijambe_sibk',\n  waitForConnections: true,\n  connectionLimit: 10,\n  queueLimit: 0,\n  charset: 'utf8mb4_unicode_ci',\n  timezone: '+07:00',\n});`,
                      'nodejs_code'
                    )
                  }
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'nodejs_code' ? 'Tersalin' : 'Salin Kode Node.js'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-blue-300 font-mono text-xs rounded-lg overflow-x-auto">
{`import mysql from 'mysql2/promise';

export const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'smpn1cijambe_sibk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  timezone: '+07:00',
});`}
              </pre>
            </div>

            {/* PHP PDO Driver */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>3. Kode Koneksi PHP (PDO untuk Shared Hosting cPanel)</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `<?php\n$host = 'localhost';\n$db   = 'smpn1cijambe_sibk';\n$user = 'smpn1cij_bkuser';\n$pass = 'Rahasia2026!';\n$charset = 'utf8mb4';\n\n$dsn = "mysql:host=$host;dbname=$db;charset=$charset;port=3306";\n$options = [\n    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,\n    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n    PDO::ATTR_EMULATE_PREPARES   => false,\n];\ntry {\n     $pdo = new PDO($dsn, $user, $pass, $options);\n} catch (\\PDOException $e) {\n     throw new \\PDOException($e->getMessage(), (int)$e->getCode());\n}`,
                      'php_code'
                    )
                  }
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'php_code' ? 'Tersalin' : 'Salin Kode PHP'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-amber-300 font-mono text-xs rounded-lg overflow-x-auto">
{`<?php
$host = 'localhost';
$db   = 'smpn1cijambe_sibk';
$user = 'smpn1cij_bkuser';
$pass = 'Rahasia2026!';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset;port=3306";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\\PDOException $e) {
     throw new \\PDOException($e->getMessage(), (int)$e->getCode());
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SIMULATOR UJI PARAMETER */}
      {activeTab === 'test_tool' && (
        <div className="space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Play className="w-5 h-5 text-blue-600" />
              Simulator Uji Parameter & URI Koneksi MySQL
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Uji sintaks string koneksi MySQL dan validasi kelengkapan parameter server sebelum diimplementasikan pada konfigurasi produksi.
            </p>

            <form onSubmit={handleTestConnection} className="space-y-4 max-w-xl text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Database Host</label>
                  <input
                    type="text"
                    value={simHost}
                    onChange={(e) => setSimHost(e.target.value)}
                    placeholder="localhost atau 127.0.0.1"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Port</label>
                  <input
                    type="text"
                    value={simPort}
                    onChange={(e) => setSimPort(e.target.value)}
                    placeholder="3306"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Database</label>
                <input
                  type="text"
                  value={simDb}
                  onChange={(e) => setSimDb(e.target.value)}
                  placeholder="smpn1cijambe_sibk"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Database User</label>
                  <input
                    type="text"
                    value={simUser}
                    onChange={(e) => setSimUser(e.target.value)}
                    placeholder="u_sibk_admin"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={simPass}
                    onChange={(e) => setSimPass(e.target.value)}
                    placeholder="Kata sandi..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validasi Parameter Koneksi</span>
              </button>
            </form>

            {simResult.status !== 'idle' && (
              <div
                className={`mt-4 p-4 rounded-xl border text-xs ${
                  simResult.status === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {simResult.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{simResult.status === 'success' ? 'Validasi Berhasil' : 'Kesalahan Validasi'}</span>
                </div>
                <p className="leading-relaxed">{simResult.message}</p>
                {simResult.connectionString && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 font-mono text-[11px] break-all">
                    URI: {simResult.connectionString}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: TROUBLESHOOTING & FAQ */}
      {activeTab === 'troubleshoot' && (
        <div className="space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-rose-600" />
              Solusi Masalah Umum (Troubleshooting MySQL)
            </h3>

            <div className="space-y-3 text-xs">
              {/* Issue 1 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Error 1045: Access denied for user 'user'@'localhost'
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Penyebab:</strong> Password salah atau user belum diberi izin (privileges) pada database tersebut.<br />
                  <strong>Solusi:</strong> Di cPanel, buka kembali <em>MySQL Databases</em>, cari bagian <em>Add User To Database</em>, pilih user dan database Anda, centang <em>ALL PRIVILEGES</em>, lalu simpan.
                </p>
              </div>

              {/* Issue 2 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Error 2002: Can't connect to local MySQL server through socket
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Penyebab:</strong> Layanan MySQL daemon sedang mati / berhenti (stopped).<br />
                  <strong>Solusi:</strong> Pada XAMPP/Laragon, tekan tombol Start pada modul MySQL. Pada Linux VPS, jalankan: <code className="bg-white px-1 rounded font-mono">sudo systemctl start mysql</code>.
                </p>
              </div>

              {/* Issue 3 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Karakter Khusus / Tanda Petik / Emoji Rusak (?????)
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Penyebab:</strong> Charset database masih menggunakan latin1 atau utf8 lama (3 byte).<br />
                  <strong>Solusi:</strong> Skrip skema kami sudah menggunakan <code className="bg-white px-1 rounded font-mono">utf8mb4</code> dan collation <code className="bg-white px-1 rounded font-mono">utf8mb4_unicode_ci</code> sehingga mendukung penuh penulisan bahasa Indonesia dan karakter simbol.
                </p>
              </div>

              {/* Issue 4 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Selisih Waktu / Timezone Jam WIB Berbeda
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Solusi:</strong> Atur timezone pada sesi koneksi database dengan perintah SQL: <code className="bg-white px-1 rounded font-mono">SET time_zone = '+07:00';</code> atau cantumkan parameter <code className="bg-white px-1 rounded font-mono">timezone: '+07:00'</code> pada konfigurasi koneksi pool.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
