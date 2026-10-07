import React, { useState } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  FileText,
  User,
  GraduationCap,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Sparkles,
  Printer,
  Eye,
  Info,
  AlertCircle,
  X,
  BookmarkCheck,
} from 'lucide-react';
import { AppIdentity, UserAccount } from '../../types';

interface AppIdentitySettingsViewProps {
  currentUser: UserAccount;
  identity: AppIdentity;
  onUpdateIdentity: (updated: AppIdentity) => void;
  onResetIdentity: () => void;
}

const PRESET_TEMPLATES = [
  {
    name: 'SMP Negeri 1 Cijambe',
    tag: 'Standar SMP',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    data: {
      appName: 'SI-BK SMPN 1 Cijambe',
      appSubtitle: 'Sistem Informasi Bimbingan Konseling, Pelanggaran & Prestasi Siswa',
      schoolName: 'SMP Negeri 1 Cijambe',
      schoolNpsn: '20233456',
      districtDepartment: 'PEMERINTAH KABUPATEN SUBANG • DINAS PENDIDIKAN',
      academicYear: '2026/2027',
      semester: 'Ganjil' as const,
      address: 'Jl. Raya Cijambe No. 1, Kecamatan Cijambe',
      city: 'Kabupaten Subang',
      postalCode: '41286',
      province: 'Jawa Barat',
      phone: '(0260) 412345',
      email: 'smpn1cijambe@subang.sch.id',
      website: 'https://smpn1cijambe.sch.id',
      headmasterName: 'Drs. H. Maman Suryaman, M.Pd.',
      headmasterNip: '19680512 199403 1 004',
      headmasterTitle: 'Kepala SMP Negeri 1 Cijambe',
      counselorName: 'Siti Rahmawati, S.Pd., Kons.',
      counselorNip: '19820719 200801 2 007',
      counselorTitle: 'Koordinator Bimbingan & Konseling',
      logoUrl: '/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg',
      letterheadNumberFormat: '421.3/BK-SMPN1CJB/{YEAR}',
    },
  },
  {
    name: 'SMA Negeri 1 Subang',
    tag: 'Tingkat SMA',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    data: {
      appName: 'SI-BK SMAN 1 Subang',
      appSubtitle: 'Sistem BK, Disiplin Karakter & Prestasi Unggul SMA',
      schoolName: 'SMA Negeri 1 Subang',
      schoolNpsn: '20215589',
      districtDepartment: 'PEMERINTAH DAERAH PROVINSI JAWA BARAT • DINAS PENDIDIKAN',
      academicYear: '2026/2027',
      semester: 'Ganjil' as const,
      address: 'Jl. Ki Hajar Dewantara No. 14, Karanganyar',
      city: 'Kabupaten Subang',
      postalCode: '41211',
      province: 'Jawa Barat',
      phone: '(0260) 411400',
      email: 'info@sman1subang.sch.id',
      website: 'https://sman1subang.sch.id',
      headmasterName: 'Dra. Hj. Nunung Suryani, M.M.Pd.',
      headmasterNip: '19670211 199303 2 003',
      headmasterTitle: 'Kepala SMA Negeri 1 Subang',
      counselorName: 'Ahmad Fauzi, S.Pd., M.Pd.Kons.',
      counselorNip: '19800415 200604 1 012',
      counselorTitle: 'Koordinator Guru BK / Konselor',
      logoUrl: '/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg',
      letterheadNumberFormat: '421.2/BK-SMAN1SBG/{YEAR}',
    },
  },
  {
    name: 'SMK Negeri 1 Subang',
    tag: 'Tingkat SMK',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
    data: {
      appName: 'SI-BK SMKN 1 Subang',
      appSubtitle: 'Sistem Kedisiplinan Kerja, Karir Industri & Konseling Siswa',
      schoolName: 'SMK Negeri 1 Subang',
      schoolNpsn: '20215590',
      districtDepartment: 'PEMERINTAH DAERAH PROVINSI JAWA BARAT • CABANG DINAS WILAYAH IV',
      academicYear: '2026/2027',
      semester: 'Ganjil' as const,
      address: 'Jl. Arief Rahman Hakim No. 35, Cigadung',
      city: 'Kabupaten Subang',
      postalCode: '41213',
      province: 'Jawa Barat',
      phone: '(0260) 412850',
      email: 'humas@smkn1subang.sch.id',
      website: 'https://smkn1subang.sch.id',
      headmasterName: 'Deden Suryana, M.Pd.',
      headmasterNip: '19710325 199702 1 002',
      headmasterTitle: 'Kepala SMK Negeri 1 Subang',
      counselorName: 'Dewi Lestari, S.Pd., Kons.',
      counselorNip: '19830814 200902 2 005',
      counselorTitle: 'Koordinator BK & Bimbingan Karir',
      logoUrl: '/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg',
      letterheadNumberFormat: '421.5/BKK-SMKN1SBG/{YEAR}',
    },
  },
];

export const AppIdentitySettingsView: React.FC<AppIdentitySettingsViewProps> = ({
  currentUser,
  identity,
  onUpdateIdentity,
  onResetIdentity,
}) => {
  const [formData, setFormData] = useState<AppIdentity>({ ...identity });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'school' | 'officials' | 'letterhead'>('general');

  // Handle Field Change
  const handleChange = (field: keyof AppIdentity, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply Preset Template
  const handleApplyPreset = (presetData: typeof PRESET_TEMPLATES[0]['data']) => {
    setFormData({ ...presetData });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Handle Image Upload for Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Mohon pilih file gambar (PNG, JPG, JPEG, SVG).');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Ukuran file gambar maksimal 2 MB.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleChange('logoUrl', result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateIdentity(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Reset Handler
  const handleConfirmReset = () => {
    onResetIdentity();
    setFormData({ ...identity });
    setShowResetModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (currentUser.role !== 'superadmin') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Akses Terbatas (Khusus Superadmin)</h3>
        <p className="text-xs text-slate-500 mt-1">
          Pengaturan Identitas Aplikasi & Sekolah hanya dapat diakses dan diubah oleh akun dengan hak akses Superadmin (Kepala Sekolah / Administrator).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
              <Building2 className="w-5 h-5 text-blue-400" />
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Profil Lembaga & Sistem
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Pengaturan Identitas Aplikasi & Sekolah
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Sesuaikan nama sekolah, kepala sekolah, koordinator BK, alamat, dan logo resmi. Seluruh perubahan akan otomatis tertera pada kop surat, slip panggilan orang tua, piagam penghargaan, dan laporan PDF.
          </p>
        </div>

        {/* Action Controls in Header */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-rose-900 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-100 rounded text-rose-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save Success Alert Banner */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="font-bold text-sm block">Perubahan Berhasil Disimpan!</strong>
            Identitas aplikasi, nama sekolah, kepala sekolah, dan kop surat telah diperbarui ke seluruh sistem.
          </div>
        </div>
      )}

      {/* Quick Preset Template Card Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900">
              Template Cepat Profil Satuan Pendidikan (Pilih untuk Otomatis Mengisi Formulir)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Klik template untuk memuat contoh data lengkap
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESET_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleApplyPreset(tmpl.data)}
              className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tmpl.badgeClass}`}>
                    {tmpl.tag}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-medium">Terapkan &rarr;</span>
                </div>
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                  {tmpl.data.schoolName}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  Kepsek: {tmpl.data.headmasterName}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <button
            type="button"
            onClick={() => setActiveSection('general')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'general'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Aplikasi & Akademik</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('school')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'school'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Profil & Kontak Sekolah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('officials')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'officials'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>3. Kepala Sekolah & Guru BK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('letterhead')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'letterhead'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>4. Pratinjau Kop Surat Resmi</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: IDENTITAS APLIKASI & TAHUN AJARAN */}
        {activeSection === 'general' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Identitas Aplikasi & Kalender Akademik
              </h3>
              <p className="text-xs text-slate-500">
                Informasi judul aplikasi pada sidebar dan tahun ajaran aktif yang sedang berjalan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Aplikasi (Sidebar & Judul Web)
                </label>
                <input
                  type="text"
                  value={formData.appName}
                  onChange={(e) => handleChange('appName', e.target.value)}
                  placeholder="SI-BK SMPN 1 Cijambe"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Tampil pada bilah atas dan logo sidebar aplikasi.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subjudul / Slogan Sistem
                </label>
                <input
                  type="text"
                  value={formData.appSubtitle}
                  onChange={(e) => handleChange('appSubtitle', e.target.value)}
                  placeholder="Bimbingan & Kedisiplinan"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tahun Ajaran Aktif
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => handleChange('academicYear', e.target.value)}
                  placeholder="2026/2027"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Semester Berjalan
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => handleChange('semester', e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Format Penomoran Surat Resmi BK
                </label>
                <input
                  type="text"
                  value={formData.letterheadNumberFormat}
                  onChange={(e) => handleChange('letterheadNumberFormat', e.target.value)}
                  placeholder="421.3/BK-SMPN1CJB/{YEAR}"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Gunakan <code className="bg-slate-100 px-1 rounded">{'{YEAR}'}</code> untuk memasukkan tahun saat ini secara dinamis pada Surat Panggilan Orang Tua.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: PROFIL & KONTAK RESMI SEKOLAH */}
        {activeSection === 'school' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Profil Lembaga Sekolah & Kontak Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Informasi ini digunakan pada baris kop surat, kartu profil siswa, dan undangan resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Instansi Atasan / Dinas Pendidikan (Kop Surat Baris 1)
                </label>
                <input
                  type="text"
                  value={formData.districtDepartment}
                  onChange={(e) => handleChange('districtDepartment', e.target.value)}
                  placeholder="PEMERINTAH KABUPATEN SUBANG • DINAS PENDIDIKAN"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Resmi Sekolah (Kop Surat Baris 2)
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  placeholder="SMP Negeri 1 Cijambe"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NPSN (Nomor Pokok Sekolah Nasional)
                </label>
                <input
                  type="text"
                  value={formData.schoolNpsn}
                  onChange={(e) => handleChange('schoolNpsn', e.target.value)}
                  placeholder="20233456"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah (Jalan, RT/RW, Dusun, Desa/Kecamatan)
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Jl. Raya Cijambe No. 1, Kecamatan Cijambe"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Kabupaten Subang"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                  placeholder="Jawa Barat"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="41286"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp Sekolah
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(0260) 412345 / 08123456789"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Resmi Sekolah
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="smpn1cijambe@subang.sch.id"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Situs Web Resmi
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://smpn1cijambe.sch.id"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>

              {/* Logo Upload Box */}
              <div className="md:col-span-2 pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Logo Resmi Sekolah (Tampil di Kop Surat & Sidebar)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih File Logo Baru</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            'logoUrl',
                            '/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg'
                          )
                        }
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Gunakan Logo Default
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Format PNG / JPG transparan beresolusi tinggi disarankan (maks. 2 MB).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: KEPALA SEKOLAH & GURU BK */}
        {activeSection === 'officials' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Pejabat Penandatangan Dokumen Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Nama dan NIP pejabat yang dicantumkan pada bagian tanda tangan surat panggilan, surat perjanjian kedisiplinan, piagam prestasi, dan laporan evaluasi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Kolom Kepala Sekolah */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Identitas Kepala Sekolah
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap & Gelar Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterName}
                    onChange={(e) => handleChange('headmasterName', e.target.value)}
                    placeholder="Drs. H. Maman Suryaman, M.Pd."
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIP / NUPTK Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterNip}
                    onChange={(e) => handleChange('headmasterNip', e.target.value)}
                    placeholder="19680512 199403 1 004"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan Resmi
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterTitle}
                    onChange={(e) => handleChange('headmasterTitle', e.target.value)}
                    placeholder="Kepala SMP Negeri 1 Cijambe"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Kolom Koordinator Guru BK */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Identitas Koordinator Bimbingan Konseling (BK)
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap & Gelar Guru BK / Konselor
                  </label>
                  <input
                    type="text"
                    value={formData.counselorName}
                    onChange={(e) => handleChange('counselorName', e.target.value)}
                    placeholder="Siti Rahmawati, S.Pd., Kons."
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIP / NUPTK Guru BK
                  </label>
                  <input
                    type="text"
                    value={formData.counselorNip}
                    onChange={(e) => handleChange('counselorNip', e.target.value)}
                    placeholder="19820719 200801 2 007"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan / Peran
                  </label>
                  <input
                    type="text"
                    value={formData.counselorTitle}
                    onChange={(e) => handleChange('counselorTitle', e.target.value)}
                    placeholder="Koordinator Bimbingan & Konseling"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: PRATINJAU KOP SURAT RESMI */}
        {activeSection === 'letterhead' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-blue-600" />
                  Pratinjau Kop Surat & Format Tanda Tangan Resmi
                </h3>
                <p className="text-xs text-slate-500">
                  Berikut tampilan kop surat dan tanda tangan yang akan tercetak otomatis pada berkas PDF resmi:
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Uji Cetak</span>
              </button>
            </div>

            {/* Paper Preview Container (Formatted with official Indonesian school letterhead) */}
            <div className="p-6 sm:p-8 bg-white border-2 border-slate-300 rounded-xl shadow-inner max-w-3xl mx-auto space-y-6 font-sans">
              {/* Kop Surat Resmi */}
              <div className="flex items-center gap-4 pb-3 border-b-4 border-double border-slate-900 text-center">
                {formData.logoUrl && (
                  <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                    <img
                      src={formData.logoUrl}
                      alt="Logo Sekolah"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                    {formData.districtDepartment}
                  </h4>
                  <h2 className="text-base sm:text-xl font-black uppercase text-slate-950 tracking-tight">
                    {formData.schoolName}
                  </h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {formData.address}, {formData.city}, {formData.province} {formData.postalCode}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Telp: {formData.phone} • Email: {formData.email} • Web: {formData.website}
                  </p>
                </div>
              </div>

              {/* Sample Content Body */}
              <div className="space-y-3 text-xs text-slate-800 leading-relaxed pt-2">
                <div className="text-center font-bold text-sm underline uppercase tracking-wide">
                  SURAT PEMBERITAHUAN KEDISIPLINAN SISWA
                </div>
                <div className="text-center font-mono text-[11px] text-slate-500">
                  Nomor: {formData.letterheadNumberFormat.replace('{YEAR}', new Date().getFullYear().toString())}
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] space-y-1">
                  <div><strong>Tahun Ajaran:</strong> {formData.academicYear} ({formData.semester})</div>
                  <div><strong>Perihal:</strong> Pembinaan Kedisiplinan & Bimbingan Konseling Siswa</div>
                </div>

                <p className="text-[11px] text-slate-600 italic text-center py-2">
                  (Isi naskah dokumen resmi bimbingan konseling dan rincian catatan siswa dicetak pada area ini)
                </p>
              </div>

              {/* Signatures Area */}
              <div className="grid grid-cols-2 pt-6 text-center text-xs text-slate-900">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">{formData.headmasterTitle}</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-950">{formData.headmasterName}</p>
                  <p className="text-[11px] text-slate-600 font-mono">NIP. {formData.headmasterNip}</p>
                </div>
                <div>
                  <p>
                    {formData.city.replace('Kabupaten ', '').replace('Kota ', '')},{' '}
                    {new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="font-semibold">{formData.counselorTitle}</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-950">{formData.counselorName}</p>
                  <p className="text-[11px] text-slate-600 font-mono">NIP. {formData.counselorNip}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Button Bar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Perubahan tersimpan secara lokal dan otomatis tercermin pada seluruh dokumen cetak.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Reset Standar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal for Resetting to Default Identity */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Konfirmasi Reset Identitas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <p>
                Apakah Anda yakin ingin mengembalikan seluruh identitas aplikasi, nama sekolah, kepala sekolah, koordinator BK, dan format kop surat ke pengaturan awal standar (<strong>SMP Negeri 1 Cijambe</strong>)?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                Tindakan ini akan menimpa perubahan kustomisasi yang sedang aktif saat ini.
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                Ya, Reset ke Standar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
