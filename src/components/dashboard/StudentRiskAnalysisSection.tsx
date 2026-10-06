import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Eye,
  MessageCircle,
  FileText,
  Search,
  Filter,
  UserCheck,
  Printer,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Sparkles,
  Phone,
  User,
  X,
  ExternalLink,
  Award,
  HelpCircle,
  SlidersHorizontal,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import {
  Student,
  ViolationRecord,
  AchievementRecord,
  CounselingRecord,
  RiskLevel,
  AppIdentity,
} from '../../types';
import { storageService } from '../../services/storageService';
import { generateSummonsWhatsAppUrl, formatWhatsAppNumber } from '../../utils/whatsapp';

interface StudentRiskAnalysisSectionProps {
  students: Student[];
  violations: ViolationRecord[];
  achievements: AchievementRecord[];
  counselingRecords: CounselingRecord[];
  onSelectStudentProfile: (student: Student) => void;
  onOpenPrintSlip: (
    type: 'parent_summons' | 'violation_statement',
    violation?: ViolationRecord,
    student?: Student
  ) => void;
  onNavigateTab: (tab: string) => void;
  appIdentity?: AppIdentity;
}

export const StudentRiskAnalysisSection: React.FC<StudentRiskAnalysisSectionProps> = ({
  students,
  violations,
  achievements,
  counselingRecords,
  onSelectStudentProfile,
  onOpenPrintSlip,
  onNavigateTab,
  appIdentity,
}) => {
  const identity = appIdentity || storageService.getAppIdentity();
  const cityShort = (identity.city || 'Subang').replace('Kabupaten ', '').replace('Kota ', '');
  // Tab Filter
  const [selectedTier, setSelectedTier] = useState<
    'all_urgent' | 'kritis' | 'peringatan_2' | 'peringatan_1' | 'pantau' | 'all_students'
  >('all_urgent');

  // Filter & Search
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'points_desc' | 'points_asc' | 'net_points' | 'name_asc' | 'violations_count'>('points_desc');

  // View Mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Toggle SOP BK guide banner
  const [showSopGuide, setShowSopGuide] = useState(false);

  // Modal inspection of single student details
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);

  // Modal print risk mapping report
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Classify students into risk tiers based on discipline points
  const categorizedStudents = useMemo(() => {
    const kritis: Student[] = [];
    const peringatan2: Student[] = [];
    const peringatan1: Student[] = [];
    const pantau: Student[] = [];
    const aman: Student[] = [];

    students.forEach((s) => {
      const pts = s.totalViolationPoints || 0;
      if (pts >= 75) {
        kritis.push(s);
      } else if (pts >= 50) {
        peringatan2.push(s);
      } else if (pts >= 25) {
        peringatan1.push(s);
      } else if (pts >= 10) {
        pantau.push(s);
      } else {
        aman.push(s);
      }
    });

    return {
      kritis,
      peringatan2,
      peringatan1,
      pantau,
      aman,
      allUrgent: [...kritis, ...peringatan2, ...peringatan1, ...pantau],
    };
  }, [students]);

  // Available classes list
  const availableClasses = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.className))).sort();
  }, [students]);

  // Per-class risk breakdown summary
  const classBreakdown = useMemo(() => {
    return availableClasses.map((cls) => {
      const clsStudents = students.filter((s) => s.className === cls);
      const kCount = clsStudents.filter((s) => s.totalViolationPoints >= 75).length;
      const p2Count = clsStudents.filter((s) => s.totalViolationPoints >= 50 && s.totalViolationPoints < 75).length;
      const p1Count = clsStudents.filter((s) => s.totalViolationPoints >= 25 && s.totalViolationPoints < 50).length;
      const pantauCount = clsStudents.filter((s) => s.totalViolationPoints >= 10 && s.totalViolationPoints < 25).length;
      const totalUrgent = kCount + p2Count + p1Count + pantauCount;

      return {
        className: cls,
        totalStudents: clsStudents.length,
        kritis: kCount,
        peringatan2: p2Count,
        peringatan1: p1Count,
        pantau: pantauCount,
        totalUrgent,
      };
    });
  }, [students, availableClasses]);

  // Filtered and sorted students list
  const filteredStudents = useMemo(() => {
    let baseList: Student[] = [];

    switch (selectedTier) {
      case 'kritis':
        baseList = categorizedStudents.kritis;
        break;
      case 'peringatan_2':
        baseList = categorizedStudents.peringatan2;
        break;
      case 'peringatan_1':
        baseList = categorizedStudents.peringatan1;
        break;
      case 'pantau':
        baseList = categorizedStudents.pantau;
        break;
      case 'all_urgent':
        baseList = categorizedStudents.allUrgent;
        break;
      case 'all_students':
      default:
        baseList = students;
        break;
    }

    // Apply class filter
    if (selectedClass !== 'all') {
      baseList = baseList.filter((s) => s.className === selectedClass);
    }

    // Apply search filter
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      baseList = baseList.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.nisn.toLowerCase().includes(term) ||
          (s.nis && s.nis.toLowerCase().includes(term)) ||
          s.className.toLowerCase().includes(term) ||
          (s.parentName && s.parentName.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    const sorted = [...baseList].sort((a, b) => {
      if (sortBy === 'points_desc') {
        return (b.totalViolationPoints || 0) - (a.totalViolationPoints || 0);
      }
      if (sortBy === 'points_asc') {
        return (a.totalViolationPoints || 0) - (b.totalViolationPoints || 0);
      }
      if (sortBy === 'net_points') {
        const netA = (a.totalViolationPoints || 0) - (a.totalAchievementPoints || 0);
        const netB = (b.totalViolationPoints || 0) - (b.totalAchievementPoints || 0);
        return netB - netA;
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'violations_count') {
        const countA = violations.filter((v) => v.studentId === a.id).length;
        const countB = violations.filter((v) => v.studentId === b.id).length;
        return countB - countA;
      }
      return 0;
    });

    return sorted;
  }, [categorizedStudents, students, selectedTier, selectedClass, searchTerm, sortBy, violations]);

  // Helper function to get tier info
  const getTierMeta = (pts: number) => {
    if (pts >= 75) {
      return {
        label: 'KRITIS',
        color: 'rose',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
        ringColor: 'ring-rose-500',
        pillBg: 'bg-rose-600 text-white',
        description: 'Intervensi Mendesak Tahap III',
        sop: 'Panggilan Ortu III, Konferensi Kasus BK, Evaluasi Status & Peringatan Terakhir',
        urgencyRank: 1,
      };
    }
    if (pts >= 50) {
      return {
        label: 'PERINGATAN II',
        color: 'amber',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        ringColor: 'ring-amber-500',
        pillBg: 'bg-amber-600 text-white',
        description: 'Panggilan Orang Tua II',
        sop: 'Panggilan Ortu II, Kontrak Perilaku Tertulis, Bimbingan Individual Mingguan',
        urgencyRank: 2,
      };
    }
    if (pts >= 25) {
      return {
        label: 'PERINGATAN I',
        color: 'amber',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        ringColor: 'ring-amber-400',
        pillBg: 'bg-amber-500 text-white',
        description: 'Peringatan Tertulis I',
        sop: 'Surat Peringatan I, Konseling Individual BK, Koordinasi Wali Kelas',
        urgencyRank: 3,
      };
    }
    if (pts >= 10) {
      return {
        label: 'PEMANTAUAN',
        color: 'blue',
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
        ringColor: 'ring-blue-400',
        pillBg: 'bg-blue-600 text-white',
        description: 'Perlu Pemantauan Preventif',
        sop: 'Pendampingan Wali Kelas, Konseling Preventif agar poin tidak meningkat',
        urgencyRank: 4,
      };
    }
    return {
      label: 'DISIPLIN BAIK',
      color: 'emerald',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      ringColor: 'ring-emerald-400',
      pillBg: 'bg-emerald-600 text-white',
      description: 'Aman / Terkendali',
      sop: 'Pertahankan kedisiplinan dan dorong pencapaian prestasi',
      urgencyRank: 5,
    };
  };

  // Percentages for the health distribution bar
  const totalCount = students.length || 1;
  const pctKritis = Math.round((categorizedStudents.kritis.length / totalCount) * 100);
  const pctP2 = Math.round((categorizedStudents.peringatan2.length / totalCount) * 100);
  const pctP1 = Math.round((categorizedStudents.peringatan1.length / totalCount) * 100);
  const pctPantau = Math.round((categorizedStudents.pantau.length / totalCount) * 100);
  const pctAman = 100 - (pctKritis + pctP2 + pctP1 + pctPantau);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/30 text-rose-200 border border-rose-500/40">
                Sistem Peringatan Dini BP/BK
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                SMP Negeri 1 Cijambe
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Analisis Profil Risiko Siswa & Pemetaan Intervensi
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Pengelompokan status kedisiplinan berdasarkan akumulasi poin pelanggaran untuk membantu guru BK melakukan pemetaan siswa yang memerlukan intervensi mendesak, konferensi kasus, atau panggilan orang tua.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSopGuide(!showSopGuide)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{showSopGuide ? 'Tutup SOP BK' : 'Lihat SOP Intervensi'}</span>
              {showSopGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar Pemetaan BK</span>
            </button>
          </div>
        </div>

        {/* Visual Multi-Colored Discipline Distribution Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Proporsi Kesehatan Kedisiplinan Siswa Sekolah ({students.length} Siswa Terdaftar)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Total Butuh Intervensi: <strong className="text-rose-400">{categorizedStudents.allUrgent.length} siswa</strong>
            </span>
          </div>

          <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            {categorizedStudents.kritis.length > 0 && (
              <div
                style={{ width: `${(categorizedStudents.kritis.length / totalCount) * 100}%` }}
                className="bg-rose-600 h-full transition-all duration-300 relative group"
                title={`Kritis: ${categorizedStudents.kritis.length} siswa`}
              />
            )}
            {categorizedStudents.peringatan2.length > 0 && (
              <div
                style={{ width: `${(categorizedStudents.peringatan2.length / totalCount) * 100}%` }}
                className="bg-amber-600 h-full transition-all duration-300 relative group"
                title={`Peringatan II: ${categorizedStudents.peringatan2.length} siswa`}
              />
            )}
            {categorizedStudents.peringatan1.length > 0 && (
              <div
                style={{ width: `${(categorizedStudents.peringatan1.length / totalCount) * 100}%` }}
                className="bg-amber-400 h-full transition-all duration-300 relative group"
                title={`Peringatan I: ${categorizedStudents.peringatan1.length} siswa`}
              />
            )}
            {categorizedStudents.pantau.length > 0 && (
              <div
                style={{ width: `${(categorizedStudents.pantau.length / totalCount) * 100}%` }}
                className="bg-blue-500 h-full transition-all duration-300 relative group"
                title={`Pemantauan: ${categorizedStudents.pantau.length} siswa`}
              />
            )}
            <div
              style={{ width: `${(categorizedStudents.aman.length / totalCount) * 100}%` }}
              className="bg-emerald-500 h-full transition-all duration-300 relative group"
              title={`Disiplin Terjaga: ${categorizedStudents.aman.length} siswa`}
            />
          </div>

          {/* Progress Bar Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-400/40 shrink-0" />
              <span>Kritis: <strong>{categorizedStudents.kritis.length}</strong> ({pctKritis}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
              <span>Peringatan II: <strong>{categorizedStudents.peringatan2.length}</strong> ({pctP2}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span>Peringatan I: <strong>{categorizedStudents.peringatan1.length}</strong> ({pctP1}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>Perlu Pantau: <strong>{categorizedStudents.pantau.length}</strong> ({pctPantau}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Disiplin Baik: <strong>{categorizedStudents.aman.length}</strong> ({pctAman}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable SOP Intervensi BK Accordion */}
      {showSopGuide && (
        <div className="p-4 sm:p-5 bg-amber-50/70 border-b border-amber-200 text-slate-800 transition-all">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                Standar Operasional Prosedur (SOP) Intervensi Bimbingan Konseling SMP Negeri 1 Cijambe
              </h4>
            </div>
            <button
              onClick={() => setShowSopGuide(false)}
              className="text-amber-800 hover:text-amber-950 text-xs font-semibold cursor-pointer"
            >
              ✕ Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-rose-300 shadow-2xs">
              <div className="font-bold text-rose-700 mb-1 flex items-center justify-between">
                <span>🔴 Kritis (≥ 75 Poin)</span>
                <span className="text-[10px] bg-rose-100 px-1.5 py-0.5 rounded font-mono">Tahap III</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>Aksi Wajib:</strong> Konferensi Kasus Terpadu (Kepala Sekolah, Wakasek, Guru BK, Wali Kelas). Pemanggilan orang tua ke-3, penandatanganan surat pernyataan terakhir bermaterai, dan evaluasi sanksi skorsing/alih tangan kasus jika diperlukan.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-amber-300 shadow-2xs">
              <div className="font-bold text-amber-700 mb-1 flex items-center justify-between">
                <span>🟠 Peringatan II (50–74 Poin)</span>
                <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded font-mono">Tahap II</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>Aksi Wajib:</strong> Surat Pemanggilan Orang Tua ke-2 ke sekolah. Pembuatan kontrak perilaku tertulis bersama wali murid & siswa, serta sesi bimbingan individual terjadwal setiap minggu bersama guru konselor.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-amber-200 shadow-2xs">
              <div className="font-bold text-amber-600 mb-1 flex items-center justify-between">
                <span>🟡 Peringatan I (25–49 Poin)</span>
                <span className="text-[10px] bg-amber-50 px-1.5 py-0.5 rounded font-mono">Tahap I</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>Aksi Wajib:</strong> Penerbitan Surat Peringatan I resmi dari BP/BK. Pemanggilan orang tua ke-1 via WhatsApp/surat fisik, konseling individual untuk mengidentifikasi motif pelanggaran, dan bimbingan kepribadian.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs">
              <div className="font-bold text-blue-700 mb-1 flex items-center justify-between">
                <span>🔵 Pemantauan (10–24 Poin)</span>
                <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded font-mono">Preventif</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>Aksi Wajib:</strong> Pendampingan preventif oleh Wali Kelas dan guru piket. Teguran lisan persuasif, monitoring buku catatan kedisiplinan harian, dan pembinaan agar poin tidak terus bertambah ke tahap peringatan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* 4 Interactive Risk Level Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card Kritis */}
          <button
            type="button"
            onClick={() => setSelectedTier('kritis')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              selectedTier === 'kritis'
                ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-500 shadow-sm'
                : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                KRITIS (≥ 75 Poin)
              </span>
              <span className="text-2xl font-black font-mono text-rose-700 tabular-nums">
                {categorizedStudents.kritis.length}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-rose-900">
              Intervensi Sangat Mendesak
            </div>
            <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Konferensi kasus BK, panggilan ortu tahap III, rapat penentuan status siswa.
            </div>
            <div className="mt-3 pt-2 border-t border-rose-100 flex items-center justify-between text-[11px]">
              <span className="text-rose-700 font-semibold">Tindakan: Segera</span>
              <span className="text-slate-400 font-mono">{pctKritis}% dari siswa</span>
            </div>
          </button>

          {/* Card Peringatan II */}
          <button
            type="button"
            onClick={() => setSelectedTier('peringatan_2')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              selectedTier === 'peringatan_2'
                ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-500 shadow-sm'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white uppercase tracking-wider">
                Peringatan II (50–74)
              </span>
              <span className="text-2xl font-black font-mono text-amber-700 tabular-nums">
                {categorizedStudents.peringatan2.length}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
              Panggilan Orang Tua II
            </div>
            <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Kontrak perilaku tertulis, komitmen orang tua & jadwal bimbingan konseling mingguan.
            </div>
            <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
              <span className="text-amber-700 font-semibold">Tindakan: Terjadwal</span>
              <span className="text-slate-400 font-mono">{pctP2}% dari siswa</span>
            </div>
          </button>

          {/* Card Peringatan I */}
          <button
            type="button"
            onClick={() => setSelectedTier('peringatan_1')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              selectedTier === 'peringatan_1'
                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400 shadow-sm'
                : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                Peringatan I (25–49)
              </span>
              <span className="text-2xl font-black font-mono text-amber-600 tabular-nums">
                {categorizedStudents.peringatan1.length}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
              Peringatan Tertulis
            </div>
            <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Pemberitahuan resmi ke wali murid & sesi konseling individual pemulihan sikap.
            </div>
            <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
              <span className="text-amber-600 font-semibold">Tindakan: Bimbingan BK</span>
              <span className="text-slate-400 font-mono">{pctP1}% dari siswa</span>
            </div>
          </button>

          {/* Card Pemantauan */}
          <button
            type="button"
            onClick={() => setSelectedTier('pantau')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              selectedTier === 'pantau'
                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500 shadow-sm'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                Pemantauan (10–24)
              </span>
              <span className="text-2xl font-black font-mono text-blue-700 tabular-nums">
                {categorizedStudents.pantau.length}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
              Pembinaan Preventif
            </div>
            <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Monitoring wali kelas, motivasi belajar & penguatan disiplin sebelum naik tingkatan.
            </div>
            <div className="mt-3 pt-2 border-t border-blue-100 flex items-center justify-between text-[11px]">
              <span className="text-blue-700 font-semibold">Tindakan: Preventif</span>
              <span className="text-slate-400 font-mono">{pctPantau}% dari siswa</span>
            </div>
          </button>
        </div>

        {/* Pemetaan Cepat per Rombongan Belajar (Rombel / Kelas) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Pemetaan Kasus per Rombel (Klik kelas untuk memfilter):
            </span>
            <div className="flex items-center gap-2">
              {selectedClass !== 'all' && (
                <button
                  onClick={() => setSelectedClass('all')}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Reset Filter Kelas ({selectedClass})
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedClass === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Kelas ({students.length})
            </button>
            {classBreakdown.map((cb) => (
              <button
                key={cb.className}
                onClick={() => setSelectedClass(cb.className)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedClass === cb.className
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50/50'
                }`}
              >
                <span>Kelas {cb.className}</span>
                {cb.totalUrgent > 0 ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      selectedClass === cb.className
                        ? 'bg-white text-blue-700'
                        : cb.kritis > 0
                        ? 'bg-rose-100 text-rose-700'
                        : cb.peringatan2 > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {cb.totalUrgent} risiko
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">0 risiko</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter, Search, Sort & View Mode Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
          {/* Segmented Risk Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setSelectedTier('all_urgent')}
              className={`px-3 py-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedTier === 'all_urgent'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Intervensi ({categorizedStudents.allUrgent.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('kritis')}
              className={`px-3 py-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedTier === 'kritis'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Kritis ({categorizedStudents.kritis.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('peringatan_2')}
              className={`px-3 py-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedTier === 'peringatan_2'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Peringatan II ({categorizedStudents.peringatan2.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('peringatan_1')}
              className={`px-3 py-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedTier === 'peringatan_1'
                  ? 'bg-amber-500 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Peringatan I ({categorizedStudents.peringatan1.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('pantau')}
              className={`px-3 py-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedTier === 'pantau'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Pemantauan ({categorizedStudents.pantau.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('all_students')}
              className={`px-3 py-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedTier === 'all_students'
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seluruh Siswa ({students.length})
            </button>
          </div>

          {/* Right Controls: Search, Sort, View Mode */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari nama, NISN, wali..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-hidden text-slate-800 placeholder-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-slate-400 hover:text-slate-600 text-[11px]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Urutkan data siswa"
                className="text-xs p-2 border border-slate-200 rounded-lg bg-white text-slate-700 cursor-pointer"
              >
                <option value="points_desc">Poin Tertinggi ↓</option>
                <option value="points_asc">Poin Terendah ↑</option>
                <option value="net_points">Selisih Poin (Net) ↓</option>
                <option value="name_asc">Nama Siswa (A-Z)</option>
                <option value="violations_count">Jumlah Kasus Terbanyak</option>
              </select>
            </div>

            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Kartu Siswa"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Tabel Rinci"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
          <div>
            Menampilkan <strong className="text-slate-900">{filteredStudents.length}</strong> siswa
            {selectedClass !== 'all' && ` di Kelas ${selectedClass}`}
            {searchTerm && ` cocok dengan "${searchTerm}"`}
          </div>
          {filteredStudents.length > 0 && (
            <div className="text-[11px] text-slate-400">
              Prioritas penanganan: Kritis → Peringatan II → Peringatan I → Pemantauan
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <UserCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2.5" />
            <h4 className="text-sm font-bold text-slate-800">
              Tidak Ada Siswa Ditemukan
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {selectedTier === 'kritis'
                ? 'Kabar baik! Saat ini tidak ada siswa yang berada dalam ambang batas Kritis (≥ 75 Poin).'
                : selectedTier === 'all_urgent'
                ? 'Seluruh siswa berada dalam status disiplin yang aman tanpa akumulasi pelanggaran berat.'
                : 'Tidak ada data siswa yang cocok dengan kriteria filter atau pencarian Anda.'}
            </p>
            {(selectedTier !== 'all_urgent' || selectedClass !== 'all' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('all_urgent');
                  setSelectedClass('all');
                  setSearchTerm('');
                }}
                className="mt-3 px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* =========================================================================
             MODE A: GRID KARTU SISWA (CARDS VIEW) - Rich, Mobile-Friendly, High-Scan
             ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const meta = getTierMeta(student.totalViolationPoints);
              const studentViolations = violations.filter((v) => v.studentId === student.id);
              const studentAchievements = achievements.filter((a) => a.studentId === student.id);
              const latestViolation = studentViolations[0];
              const netPoints = (student.totalViolationPoints || 0) - (student.totalAchievementPoints || 0);

              return (
                <div
                  key={student.id}
                  className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden relative ${
                    student.totalViolationPoints >= 75
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : student.totalViolationPoints >= 50
                      ? 'border-amber-300'
                      : student.totalViolationPoints >= 25
                      ? 'border-amber-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Header with Status Badge */}
                  <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                          onClick={() => onSelectStudentProfile(student)}
                        >
                          {student.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">Kelas {student.className}</span>
                          <span>•</span>
                          <span className="font-mono">NISN: {student.nisn}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase shrink-0 flex items-center gap-1 ${meta.badgeBg}`}
                    >
                      {student.totalViolationPoints >= 75 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                      )}
                      {meta.label}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 text-xs">
                    {/* Points Comparison Box */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Pelanggaran</div>
                        <div className="text-base font-black text-rose-600 font-mono mt-0.5">
                          {student.totalViolationPoints}
                        </div>
                        <div className="text-[9px] text-slate-400">{studentViolations.length} kasus</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Prestasi</div>
                        <div className="text-base font-black text-amber-600 font-mono mt-0.5">
                          {student.totalAchievementPoints}
                        </div>
                        <div className="text-[9px] text-slate-400">{studentAchievements.length} capaian</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Selisih Net</div>
                        <div
                          className={`text-base font-black font-mono mt-0.5 ${
                            netPoints > 0 ? 'text-rose-700' : 'text-emerald-600'
                          }`}
                        >
                          {netPoints > 0 ? `+${netPoints}` : netPoints}
                        </div>
                        <div className="text-[9px] text-slate-400">beban poin</div>
                      </div>
                    </div>

                    {/* SOP Rekomendasi Intervensi BK */}
                    <div className="p-2.5 rounded-lg bg-slate-100/70 border border-slate-200">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                        Rekomendasi Intervensi BK:
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {meta.sop}
                      </p>
                    </div>

                    {/* Wali Murid Info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                      <div>
                        <span className="text-slate-400">Wali:</span>{' '}
                        <strong className="text-slate-800">{student.parentName || '-'}</strong>
                      </div>
                      <div className="font-mono text-slate-500">
                        {student.parentPhone || '-'}
                      </div>
                    </div>

                    {/* Last Recorded Incident */}
                    {latestViolation ? (
                      <div className="text-[11px] bg-rose-50/50 p-2 rounded border border-rose-100">
                        <span className="text-slate-500">Kasus Terakhir ({latestViolation.date}):</span>
                        <div className="font-semibold text-rose-900 truncate">
                          {latestViolation.violationName} (+{latestViolation.points} poin)
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Belum ada riwayat pelanggaran tercatat.
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                    {/* Inspect details button */}
                    <button
                      type="button"
                      onClick={() => setInspectedStudent(student)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Lihat Rincian Seluruh Kasus"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Rincian</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Histori Konseling */}
                      <button
                        type="button"
                        onClick={() => onSelectStudentProfile(student)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Histori Konseling Lengkap"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Konseling</span>
                      </button>

                      {/* WhatsApp Summon Parent */}
                      <a
                        href={generateSummonsWhatsAppUrl(
                          student,
                          'Segera / Jadwal Terbuka',
                          '08.30 WIB',
                          'Tim BP/BK SMP Negeri 1 Cijambe'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                        title="Kirim Undangan Panggilan Ortu via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {/* Print Summons Document */}
                      <button
                        type="button"
                        onClick={() => onOpenPrintSlip('parent_summons', latestViolation, student)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                        title="Cetak Surat Panggilan Orang Tua Resmi"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
             MODE B: TABEL LENGKAP (TABLE VIEW) - Comprehensive Matrix
             ========================================================================= */
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Nama Siswa & NISN</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Wali Murid</th>
                  <th className="py-3 px-3 text-center">Poin Pelanggaran</th>
                  <th className="py-3 px-3 text-center">Poin Prestasi</th>
                  <th className="py-3 px-3">Status Risiko</th>
                  <th className="py-3 px-4">Rekomendasi Intervensi BK</th>
                  <th className="py-3 px-4 text-right">Aksi Intervensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((student) => {
                  const meta = getTierMeta(student.totalViolationPoints);
                  const studentViolations = violations.filter((v) => v.studentId === student.id);
                  const latestViolation = studentViolations[0];

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        student.totalViolationPoints >= 75 ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
                          onClick={() => onSelectStudentProfile(student)}
                        >
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NISN: {student.nisn}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {student.className}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{student.parentName || '-'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student.parentPhone || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-black font-mono text-sm ${
                            student.totalViolationPoints >= 75
                              ? 'text-rose-600'
                              : student.totalViolationPoints >= 50
                              ? 'text-amber-700'
                              : student.totalViolationPoints >= 25
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {student.totalViolationPoints}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {studentViolations.length} kasus
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-amber-600 font-mono text-sm">
                          {student.totalAchievementPoints}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 border ${meta.badgeBg}`}
                        >
                          {student.totalViolationPoints >= 75 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          )}
                          {meta.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                          {meta.sop}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Rincian Kasus Button */}
                          <button
                            type="button"
                            onClick={() => setInspectedStudent(student)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                            title="Lihat Rincian Kasus"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Profil / Konseling */}
                          <button
                            type="button"
                            onClick={() => onSelectStudentProfile(student)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-semibold transition-colors cursor-pointer text-xs"
                            title="Histori Konseling"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Konseling</span>
                          </button>

                          {/* WhatsApp Ortu */}
                          <a
                            href={generateSummonsWhatsAppUrl(
                              student,
                              'Segera / Jadwal Terbuka',
                              '08.30 WIB',
                              'Tim BP/BK SMP Negeri 1 Cijambe'
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                            title="WhatsApp Orang Tua"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Cetak Surat Panggilan */}
                          <button
                            type="button"
                            onClick={() => onOpenPrintSlip('parent_summons', latestViolation, student)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                            title="Cetak Surat Panggilan"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
         MODAL 1: RINCIAN KASUS SISWA (QUICK INSPECTOR)
         ========================================================================= */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-base">
                  {inspectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{inspectedStudent.name}</h3>
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <span>Kelas {inspectedStudent.className}</span>
                    <span>•</span>
                    <span>NISN: {inspectedStudent.nisn}</span>
                    <span>•</span>
                    <span className="font-semibold text-rose-400">
                      {inspectedStudent.totalViolationPoints} Poin Pelanggaran
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Wali & Kontak */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Orang Tua / Wali:</span>
                  <div className="font-bold text-slate-800 text-sm">{inspectedStudent.parentName || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400">No. WhatsApp / Telepon:</span>
                  <div className="font-mono text-slate-800 text-sm">{inspectedStudent.parentPhone || '-'}</div>
                </div>
              </div>

              {/* Status & Rekomendasi */}
              {(() => {
                const meta = getTierMeta(inspectedStudent.totalViolationPoints);
                return (
                  <div className="p-3.5 rounded-xl border bg-amber-50/70 border-amber-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-950 text-xs">Status Penanganan Siswa:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${meta.badgeBg}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{meta.sop}</p>
                  </div>
                );
              })()}

              {/* Daftar Riwayat Pelanggaran */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Riwayat Pelanggaran Tercatat (
                  {violations.filter((v) => v.studentId === inspectedStudent.id).length})
                </h4>

                {violations.filter((v) => v.studentId === inspectedStudent.id).length === 0 ? (
                  <p className="text-slate-400 italic py-2">Belum ada pelanggaran tercatat.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {violations
                      .filter((v) => v.studentId === inspectedStudent.id)
                      .map((viol) => (
                        <div
                          key={viol.id}
                          className="p-3 bg-rose-50/40 rounded-lg border border-rose-100 flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">{viol.violationName}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {viol.date} • {viol.time || '-'} WIB • Lokasi: {viol.location || '-'}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1">
                              <strong>Tindak lanjut:</strong> {viol.followUpAction}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Pelapor: {viol.reporterName}
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded bg-rose-600 text-white font-mono font-bold text-xs shrink-0">
                            +{viol.points} Poin
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Daftar Prestasi */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Riwayat Prestasi (
                  {achievements.filter((a) => a.studentId === inspectedStudent.id).length})
                </h4>

                {achievements.filter((a) => a.studentId === inspectedStudent.id).length === 0 ? (
                  <p className="text-slate-400 italic py-1">Belum ada prestasi tercatat.</p>
                ) : (
                  <div className="space-y-1.5">
                    {achievements
                      .filter((a) => a.studentId === inspectedStudent.id)
                      .map((ach) => (
                        <div
                          key={ach.id}
                          className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">{ach.achievementName}</div>
                            <div className="text-[11px] text-slate-500">
                              {ach.rankAward} • {ach.level.toUpperCase()} • {ach.date}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-mono font-bold text-xs">
                            +{ach.points} Poin
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const std = inspectedStudent;
                    setInspectedStudent(null);
                    onSelectStudentProfile(std);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Buka Rekam Konseling
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         MODAL 2: CETAK LEMBAR MATRIKS PEMETAAN RISIKO SISWA (OFFICIAL REPORT)
         ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Dialog */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">
                  Cetak Lembar Matriks Pemetaan Risiko Siswa BK
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Preview Container */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans bg-white print:p-0">
              {/* Official School Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900">
                <h3 className="text-sm font-bold tracking-wider uppercase text-slate-800">
                  {identity.districtDepartment}
                </h3>
                <h2 className="text-base font-extrabold uppercase text-slate-900">
                  {identity.schoolName}
                </h2>
                <p className="text-[11px] text-slate-600">
                  {identity.address}, {identity.city}, {identity.province} {identity.postalCode}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-400 inline-block font-bold text-xs uppercase tracking-wide">
                  LEMBAR MATRIKS PEMETAAN PROFIL RISIKO KEDISIPLINAN & REKOMENDASI INTERVENSI BK
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Tahun Ajaran {identity.academicYear} ({identity.semester}) • Dokumen Kerja Bimbingan dan Konseling
                </div>
              </div>

              {/* Summary Stats Table */}
              <div className="grid grid-cols-4 gap-2 text-center my-3">
                <div className="p-2 border border-rose-300 rounded bg-rose-50">
                  <div className="text-[10px] text-rose-800 font-bold uppercase">Kritis (≥ 75 Poin)</div>
                  <div className="text-lg font-bold text-rose-700">{categorizedStudents.kritis.length} Siswa</div>
                </div>
                <div className="p-2 border border-amber-300 rounded bg-amber-50">
                  <div className="text-[10px] text-amber-800 font-bold uppercase">Peringatan II (50-74)</div>
                  <div className="text-lg font-bold text-amber-700">{categorizedStudents.peringatan2.length} Siswa</div>
                </div>
                <div className="p-2 border border-amber-200 rounded bg-amber-50/50">
                  <div className="text-[10px] text-amber-700 font-bold uppercase">Peringatan I (25-49)</div>
                  <div className="text-lg font-bold text-amber-600">{categorizedStudents.peringatan1.length} Siswa</div>
                </div>
                <div className="p-2 border border-blue-200 rounded bg-blue-50">
                  <div className="text-[10px] text-blue-800 font-bold uppercase">Pemantauan (10-24)</div>
                  <div className="text-lg font-bold text-blue-700">{categorizedStudents.pantau.length} Siswa</div>
                </div>
              </div>

              {/* Table of Flagged Students */}
              <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                    <th className="p-2 border border-slate-300 text-center w-8">No</th>
                    <th className="p-2 border border-slate-300">Nama Siswa</th>
                    <th className="p-2 border border-slate-300 text-center">Kelas</th>
                    <th className="p-2 border border-slate-300 text-center">NISN</th>
                    <th className="p-2 border border-slate-300 text-center">Poin Melanggar</th>
                    <th className="p-2 border border-slate-300 text-center">Kategori Status</th>
                    <th className="p-2 border border-slate-300">Rekomendasi Intervensi BK</th>
                    <th className="p-2 border border-slate-300">Wali Murid & No. Kontak</th>
                  </tr>
                </thead>
                <tbody>
                  {categorizedStudents.allUrgent.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-500 italic">
                        Tidak ada siswa yang berada dalam kategori intervensi (semua poin di bawah 10).
                      </td>
                    </tr>
                  ) : (
                    categorizedStudents.allUrgent
                      .sort((a, b) => (b.totalViolationPoints || 0) - (a.totalViolationPoints || 0))
                      .map((std, idx) => {
                        const meta = getTierMeta(std.totalViolationPoints);
                        return (
                          <tr key={std.id} className="border-b border-slate-200">
                            <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                            <td className="p-2 border border-slate-300 font-bold text-slate-900">{std.name}</td>
                            <td className="p-2 border border-slate-300 text-center font-semibold">{std.className}</td>
                            <td className="p-2 border border-slate-300 text-center font-mono">{std.nisn}</td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-rose-700 font-mono">
                              {std.totalViolationPoints}
                            </td>
                            <td className="p-2 border border-slate-300 text-center">
                              <span className="font-bold text-[10px] uppercase">{meta.label}</span>
                            </td>
                            <td className="p-2 border border-slate-300">{meta.sop}</td>
                            <td className="p-2 border border-slate-300">
                              <div>{std.parentName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{std.parentPhone}</div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">{identity.headmasterTitle}</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{identity.headmasterName}</p>
                  <p className="text-[11px] text-slate-600">NIP. {identity.headmasterNip}</p>
                </div>
                <div>
                  <p>{cityShort}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold">{identity.counselorTitle}</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{identity.counselorName}</p>
                  <p className="text-[11px] text-slate-600">NIP. {identity.counselorNip}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Gunakan dialog cetak browser untuk mencetak langsung atau menyimpan sebagai PDF.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
