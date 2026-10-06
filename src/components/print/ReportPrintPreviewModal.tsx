import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  Calendar,
  CheckSquare,
  Square,
  FileText,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  HeartHandshake,
  ShieldAlert,
} from 'lucide-react';
import {
  Student,
  ViolationRecord,
  AchievementRecord,
  CounselingRecord,
  ClassItem,
  AppIdentity,
} from '../../types';
import { storageService } from '../../services/storageService';

interface ReportPrintPreviewModalProps {
  students: Student[];
  violations: ViolationRecord[];
  achievements: AchievementRecord[];
  counselingRecords: CounselingRecord[];
  classes: ClassItem[];
  appIdentity?: AppIdentity;
  onClose: () => void;
}

export const ReportPrintPreviewModal: React.FC<ReportPrintPreviewModalProps> = ({
  students,
  violations,
  achievements,
  counselingRecords,
  classes,
  appIdentity,
  onClose,
}) => {
  const identity = appIdentity || storageService.getAppIdentity();
  const cityShort = (identity.city || 'Subang').replace('Kabupaten ', '').replace('Kota ', '');
  // Period filter
  const [periodPreset, setPeriodPreset] = useState<'this_month' | 'last_month' | 'semester_1' | 'semester_2' | 'full_year' | 'custom'>('semester_1');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Document Sections to include
  const [sections, setSections] = useState({
    letterhead: true,
    summaryMatrix: true,
    violationsTable: true,
    achievementsTable: true,
    counselingTable: true,
    riskAnalysis: true,
    signatures: true,
  });

  // Display Settings
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Auto-set dates based on presets
  const handlePresetChange = (preset: typeof periodPreset) => {
    setPeriodPreset(preset);
    if (preset === 'this_month') {
      setStartDate('2026-10-01');
      setEndDate('2026-10-31');
    } else if (preset === 'last_month') {
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
    } else if (preset === 'semester_1') {
      setStartDate('2026-07-01');
      setEndDate('2026-12-31');
    } else if (preset === 'semester_2') {
      setStartDate('2027-01-01');
      setEndDate('2027-06-30');
    } else if (preset === 'full_year') {
      setStartDate('2026-07-01');
      setEndDate('2027-06-30');
    }
  };

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter records by date range and selected class
  const filteredData = useMemo(() => {
    const vList = violations.filter((v) => {
      const matchDate = v.date >= startDate && v.date <= endDate;
      const matchClass = selectedClass === 'all' || v.className === selectedClass;
      return matchDate && matchClass;
    });

    const aList = achievements.filter((a) => {
      const matchDate = a.date >= startDate && a.date <= endDate;
      const matchClass = selectedClass === 'all' || a.className === selectedClass;
      return matchDate && matchClass;
    });

    const cList = counselingRecords.filter((c) => {
      const matchDate = c.date >= startDate && c.date <= endDate;
      const matchClass = selectedClass === 'all' || c.className === selectedClass;
      return matchDate && matchClass;
    });

    const sList = students.filter((s) => {
      return selectedClass === 'all' || s.className === selectedClass;
    });

    const ringanCount = vList.filter((v) => v.category === 'ringan').length;
    const sedangCount = vList.filter((v) => v.category === 'sedang').length;
    const beratCount = vList.filter((v) => v.category === 'berat').length;
    const totalViolationPoints = vList.reduce((acc, curr) => acc + (curr.points || 0), 0);
    const totalAchievementPoints = aList.reduce((acc, curr) => acc + (curr.points || 0), 0);

    const criticalStudents = sList.filter((s) => s.totalViolationPoints >= 75);
    const warningStudents = sList.filter((s) => s.totalViolationPoints >= 25 && s.totalViolationPoints < 75);

    return {
      violations: vList,
      achievements: aList,
      counseling: cList,
      students: sList,
      ringanCount,
      sedangCount,
      beratCount,
      totalViolationPoints,
      totalAchievementPoints,
      criticalStudents,
      warningStudents,
    };
  }, [violations, achievements, counselingRecords, students, startDate, endDate, selectedClass]);

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getPeriodLabel = () => {
    if (periodPreset === 'this_month') return 'Bulan Oktober 2026';
    if (periodPreset === 'last_month') return 'Bulan September 2026';
    if (periodPreset === 'semester_1') return 'Semester Ganjil T.A 2026/2027';
    if (periodPreset === 'semester_2') return 'Semester Genap T.A 2026/2027';
    if (periodPreset === 'full_year') return 'Tahun Ajaran Penuh 2026/2027';
    return `Periode ${startDate} s/d ${endDate}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden border border-slate-700">
        {/* Top Modal Header */}
        <div className="no-print bg-slate-900 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm tracking-tight text-white flex items-center gap-2 truncate">
                Pratinjau Cetak & Kustomisasi Dokumen Laporan PDF
                <span className="hidden sm:inline-block text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono">
                  Live Preview
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Atur bagian dokumen & rentang tanggal sebelum mencetak
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs mr-1 sm:mr-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
                title="Perkecil Tampilan"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-300">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
                title="Perbesar Tampilan"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span> PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Work Area: Left Controls Sidebar + Right Live Preview Document */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* LEFT PANEL: Interactive Filters & Section Toggles (Hidden during print) */}
          <div className="no-print w-full md:w-80 lg:w-96 bg-slate-50 border-r border-slate-200 p-5 overflow-y-auto shrink-0 space-y-6">
            {/* Rentang Tanggal / Periode Dokumen */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>1. Rentang Periode Laporan</span>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handlePresetChange('this_month')}
                    className={`p-2 rounded-lg text-left font-medium border transition-colors ${
                      periodPreset === 'this_month'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Bulan Ini (Okt 2026)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('last_month')}
                    className={`p-2 rounded-lg text-left font-medium border transition-colors ${
                      periodPreset === 'last_month'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Bulan Lalu (Sep 2026)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('semester_1')}
                    className={`p-2 rounded-lg text-left font-medium border transition-colors ${
                      periodPreset === 'semester_1'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Semester Ganjil
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('semester_2')}
                    className={`p-2 rounded-lg text-left font-medium border transition-colors ${
                      periodPreset === 'semester_2'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Semester Genap
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePresetChange('custom')}
                  className={`w-full p-2 rounded-lg text-xs text-left font-medium border transition-colors ${
                    periodPreset === 'custom'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Rentang Tanggal Kustom...
                </button>

                {periodPreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Dari Tanggal</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sampai Tanggal</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Filter Kelas */}
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Filter Rombongan Belajar (Kelas)
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="all">Semua Rombel (Kelas 7, 8, 9)</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        Kelas {cls.name} (Wali: {cls.homeroomTeacher})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pilihan Bagian Dokumen (Section Toggles) */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>2. Bagian Dokumen yang Disertakan</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Centang bab dan tabel yang akan dimuat ke dalam lembar cetak PDF:
              </p>

              <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sections.letterhead}
                    onChange={() => toggleSection('letterhead')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Kop Surat Kedinasan SMPN 1 Cijambe</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sections.summaryMatrix}
                    onChange={() => toggleSection('summaryMatrix')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Matriks Ringkasan Statistik Kedisiplinan</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sections.violationsTable}
                    onChange={() => toggleSection('violationsTable')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Tabel Rincian Kasus Pelanggaran ({filteredData.violations.length})
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sections.achievementsTable}
                    onChange={() => toggleSection('achievementsTable')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Tabel Catatan Prestasi Siswa ({filteredData.achievements.length})
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sections.counselingTable}
                    onChange={() => toggleSection('counselingTable')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Tabel Bimbingan & Konseling BK ({filteredData.counseling.length})
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sections.riskAnalysis}
                    onChange={() => toggleSection('riskAnalysis')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Pemetaan Profil Risiko Siswa (Intervensi)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sections.signatures}
                    onChange={() => toggleSection('signatures')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Kolom Tanda Tangan & Pengesahan</span>
                </label>
              </div>
            </div>

            {/* Layout Options */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>3. Orientasi Kertas</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`p-2 rounded-lg border text-center font-medium transition-colors ${
                    orientation === 'portrait'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Potret (A4 Tegak)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`p-2 rounded-lg border text-center font-medium transition-colors ${
                    orientation === 'landscape'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Lanskap (A4 Mendatar)
                </button>
              </div>
            </div>

            {/* Print Tips Note */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-[11px] leading-relaxed">
              <strong>Tips Cetak PDF:</strong> Pada jendela cetak browser, pilih <em>"Save as PDF"</em> (Simpan sebagai PDF) sebagai tujuan printer, serta centang <em>"Background graphics"</em> (Grafik latar belakang) agar garis tabel dan kop surat tercetak jernih.
            </div>
          </div>

          {/* RIGHT PANEL: Live Interactive Document Sheet Preview */}
          <div className="flex-1 bg-slate-200/80 p-4 md:p-8 overflow-y-auto flex justify-center items-start">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
              }}
              className={`bg-white shadow-2xl rounded-sm border border-slate-300 text-slate-900 transition-all ${
                orientation === 'portrait' ? 'w-full max-w-[820px]' : 'w-full max-w-[1100px]'
              }`}
            >
              {/* PRINTABLE AREA */}
              <div id="print-area" className="p-8 md:p-12 text-xs leading-relaxed font-serif">
                {/* 1. KOP SURAT RESMI */}
                {sections.letterhead && (
                  <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-4 mb-6">
                    <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                      <img
                        src={identity.logoUrl || '/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg'}
                        alt={identity.schoolName}
                        className="w-18 h-18 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-center flex-1 px-4">
                      <h4 className="text-[11px] tracking-wider uppercase font-semibold text-slate-700 font-sans">
                        {identity.districtDepartment}
                      </h4>
                      <h2 className="text-lg md:text-xl font-black uppercase tracking-wide text-slate-950 font-sans">
                        {identity.schoolName}
                      </h2>
                      <p className="text-[11px] text-slate-600 font-sans leading-tight mt-0.5">
                        {identity.address}, {identity.city}, {identity.province} {identity.postalCode}
                      </p>
                      <p className="text-[10px] text-slate-500 font-sans leading-tight">
                        {identity.phone ? `Telp: ${identity.phone} | ` : ''}Pos-el: {identity.email} | Laman Resmi: {identity.website}
                      </p>
                    </div>
                    <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500 text-center p-1 font-sans uppercase">
                        {cityShort}
                      </div>
                    </div>
                  </div>
                )}

                {/* Judul Laporan */}
                <div className="text-center mb-6 font-sans">
                  <h3 className="text-base font-bold underline uppercase tracking-wide text-slate-950">
                    LAPORAN REKAPITULASI KEDISIPLINAN, PRESTASI & KONSELING SISWA
                  </h3>
                  <p className="text-xs text-slate-700 mt-1">
                    {getPeriodLabel()} · {selectedClass === 'all' ? 'Seluruh Rombel' : `Kelas ${selectedClass}`}
                  </p>
                </div>

                {/* 2. MATRIKS RINGKASAN STATISTIK */}
                {sections.summaryMatrix && (
                  <div className="mb-6 font-sans">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-l-3 border-blue-600 pl-2">
                      I. Ringkasan Indikator Perilaku & Kedisiplinan
                    </h4>
                    <table className="w-full text-left border border-slate-300 text-xs">
                      <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                        <tr>
                          <th className="py-2 px-3">Indikator Evaluasi</th>
                          <th className="py-2 px-3 text-center">Frekuensi Kasus</th>
                          <th className="py-2 px-3 text-center">Akumulasi Poin</th>
                          <th className="py-2 px-3">Status Penyelesaian Tindak Lanjut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2 px-3">Pelanggaran Kategori Ringan</td>
                          <td className="py-2 px-3 text-center font-mono">{filteredData.ringanCount} kasus</td>
                          <td className="py-2 px-3 text-center font-mono">
                            {filteredData.violations.filter((v) => v.category === 'ringan').reduce((a, b) => a + (b.points || 0), 0)} Poin
                          </td>
                          <td className="py-2 px-3 text-emerald-700 font-medium">100% Selesai Dibina Guru Piket/Wali Kelas</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">Pelanggaran Kategori Sedang</td>
                          <td className="py-2 px-3 text-center font-mono text-amber-700 font-bold">{filteredData.sedangCount} kasus</td>
                          <td className="py-2 px-3 text-center font-mono text-amber-700 font-bold">
                            {filteredData.violations.filter((v) => v.category === 'sedang').reduce((a, b) => a + (b.points || 0), 0)} Poin
                          </td>
                          <td className="py-2 px-3 text-amber-700 font-medium">Surat Perjanjian Siswa & Pemanggilan Ortu</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">Pelanggaran Kategori Berat</td>
                          <td className="py-2 px-3 text-center font-mono text-rose-700 font-bold">{filteredData.beratCount} kasus</td>
                          <td className="py-2 px-3 text-center font-mono text-rose-700 font-bold">
                            {filteredData.violations.filter((v) => v.category === 'berat').reduce((a, b) => a + (b.points || 0), 0)} Poin
                          </td>
                          <td className="py-2 px-3 text-rose-700 font-medium">Konferensi Kasus Khusus & Pemantauan Ketat</td>
                        </tr>
                        <tr className="bg-blue-50/50 font-semibold">
                          <td className="py-2 px-3">Prestasi & Apresiasi Karakter</td>
                          <td className="py-2 px-3 text-center font-mono text-blue-700">{filteredData.achievements.length} capaian</td>
                          <td className="py-2 px-3 text-center font-mono text-blue-700">+{filteredData.totalAchievementPoints} Poin</td>
                          <td className="py-2 px-3 text-blue-700">Piagam Penghargaan Resmi Diterbitkan</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. TABEL RINCIAN PELANGGARAN */}
                {sections.violationsTable && (
                  <div className="mb-6 font-sans">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-l-3 border-rose-600 pl-2">
                      II. Daftar Rincian Pelanggaran Kedisiplinan ({filteredData.violations.length} Catatan)
                    </h4>
                    {filteredData.violations.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 border border-dashed border-slate-300 rounded">
                        Nihil catatan pelanggaran pada rentang waktu dan kriteria ini.
                      </p>
                    ) : (
                      <table className="w-full text-left border border-slate-300 text-[11px]">
                        <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <tr>
                            <th className="py-1.5 px-2">No</th>
                            <th className="py-1.5 px-2">Tanggal</th>
                            <th className="py-1.5 px-2">Nama Siswa / NISN</th>
                            <th className="py-1.5 px-2">Kelas</th>
                            <th className="py-1.5 px-2">Jenis Pelanggaran</th>
                            <th className="py-1.5 px-2">Kategori</th>
                            <th className="py-1.5 px-2 text-center">Poin</th>
                            <th className="py-1.5 px-2">Tindakan / Sanksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredData.violations.map((v, i) => (
                            <tr key={v.id}>
                              <td className="py-1 px-2">{i + 1}</td>
                              <td className="py-1 px-2 font-mono whitespace-nowrap">{v.date}</td>
                              <td className="py-1 px-2 font-semibold">{v.studentName}</td>
                              <td className="py-1 px-2">{v.className}</td>
                              <td className="py-1 px-2">{v.violationName}</td>
                              <td className="py-1 px-2 uppercase font-medium">{v.category}</td>
                              <td className="py-1 px-2 text-center font-mono font-bold text-rose-700">+{v.points}</td>
                              <td className="py-1 px-2">{v.followUpAction}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 4. TABEL CATATAN PRESTASI */}
                {sections.achievementsTable && (
                  <div className="mb-6 font-sans">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-l-3 border-amber-600 pl-2">
                      III. Daftar Rincian Capaian Prestasi Siswa ({filteredData.achievements.length} Prestasi)
                    </h4>
                    {filteredData.achievements.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 border border-dashed border-slate-300 rounded">
                        Belum ada catatan prestasi pada periode ini.
                      </p>
                    ) : (
                      <table className="w-full text-left border border-slate-300 text-[11px]">
                        <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <tr>
                            <th className="py-1.5 px-2">No</th>
                            <th className="py-1.5 px-2">Tanggal</th>
                            <th className="py-1.5 px-2">Nama Siswa</th>
                            <th className="py-1.5 px-2">Kelas</th>
                            <th className="py-1.5 px-2">Kejuaraan / Apresiasi</th>
                            <th className="py-1.5 px-2">Tingkat</th>
                            <th className="py-1.5 px-2 text-center">Poin</th>
                            <th className="py-1.5 px-2">Penyelenggara</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredData.achievements.map((a, i) => (
                            <tr key={a.id}>
                              <td className="py-1 px-2">{i + 1}</td>
                              <td className="py-1 px-2 font-mono whitespace-nowrap">{a.date}</td>
                              <td className="py-1 px-2 font-semibold">{a.studentName}</td>
                              <td className="py-1 px-2">{a.className}</td>
                              <td className="py-1 px-2 font-medium">{a.rankAward} - {a.achievementName}</td>
                              <td className="py-1 px-2 uppercase">{a.level}</td>
                              <td className="py-1 px-2 text-center font-mono font-bold text-amber-700">+{a.points}</td>
                              <td className="py-1 px-2">{a.organizer}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 5. TABEL BIMBINGAN & KONSELING */}
                {sections.counselingTable && (
                  <div className="mb-6 font-sans">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-l-3 border-blue-600 pl-2">
                      IV. Layanan Bimbingan & Konseling BK ({filteredData.counseling.length} Sesi Terlaksana)
                    </h4>
                    {filteredData.counseling.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 border border-dashed border-slate-300 rounded">
                        Belum ada sesi konseling pada periode ini.
                      </p>
                    ) : (
                      <table className="w-full text-left border border-slate-300 text-[11px]">
                        <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <tr>
                            <th className="py-1.5 px-2">No</th>
                            <th className="py-1.5 px-2">Tanggal</th>
                            <th className="py-1.5 px-2">Nama Konseli</th>
                            <th className="py-1.5 px-2">Jenis Bimbingan</th>
                            <th className="py-1.5 px-2">Pokok Masalah</th>
                            <th className="py-1.5 px-2">Tindak Lanjut & Kesepakatan</th>
                            <th className="py-1.5 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredData.counseling.map((c, i) => (
                            <tr key={c.id}>
                              <td className="py-1 px-2">{i + 1}</td>
                              <td className="py-1 px-2 font-mono whitespace-nowrap">{c.date}</td>
                              <td className="py-1 px-2 font-semibold">{c.studentName} ({c.className})</td>
                              <td className="py-1 px-2 capitalize">{c.type.replace('_', ' ')}</td>
                              <td className="py-1 px-2">{c.issueDescription}</td>
                              <td className="py-1 px-2">{c.resultFollowUp}</td>
                              <td className="py-1 px-2 capitalize font-medium">{c.status.replace('_', ' ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 6. PEMETAAN PROFIL RISIKO SISWA */}
                {sections.riskAnalysis && (
                  <div className="mb-6 font-sans">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-l-3 border-rose-700 pl-2">
                      V. Pemetaan Profil Risiko Siswa & Rekomendasi Intervensi
                    </h4>
                    <div className="border border-slate-300 p-3 rounded text-xs space-y-2">
                      <p>
                        Berdasarkan batas ambang akumulasi poin kedisiplinan SMP Negeri 1 Cijambe, tercatat:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>
                          <strong>Siswa Status Kritis (&ge; 75 Poin):</strong> {filteredData.criticalStudents.length} siswa
                          {filteredData.criticalStudents.length > 0 && (
                            <span className="text-rose-700 ml-1">
                              ({filteredData.criticalStudents.map((s) => `${s.name} - ${s.className}`).join(', ')})
                            </span>
                          )}
                          — Rekomendasi: Konferensi Kasus Khusus & Surat Panggilan Orang Tua Tahap III.
                        </li>
                        <li>
                          <strong>Siswa Status Peringatan (25 - 74 Poin):</strong> {filteredData.warningStudents.length} siswa
                          {filteredData.warningStudents.length > 0 && (
                            <span className="text-amber-800 ml-1">
                              ({filteredData.warningStudents.map((s) => `${s.name} - ${s.className}`).join(', ')})
                            </span>
                          )}
                          — Rekomendasi: Bimbingan intensif berkala & kontrak perilaku siswa.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* 7. TANDA TANGAN & PENGESAHAN */}
                {sections.signatures && (
                  <div className="pt-6 font-sans text-xs">
                    <div className="text-right mb-4">
                      <p className="text-slate-600">{cityShort}, {currentDateFormatted}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 text-center">
                      <div>
                        <p className="text-slate-600">Mengetahui,</p>
                        <p className="font-semibold text-slate-900">{identity.headmasterTitle},</p>
                        <div className="h-20" />
                        <p className="font-bold underline text-slate-950">{identity.headmasterName}</p>
                        <p className="text-slate-600">NIP. {identity.headmasterNip}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Koordinator Bimbingan & Konseling,</p>
                        <p className="font-semibold text-slate-900">{identity.counselorTitle},</p>
                        <div className="h-20" />
                        <p className="font-bold underline text-slate-950">{identity.counselorName}</p>
                        <p className="text-slate-600">NIP. {identity.counselorNip}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
