import React, { useState, useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  Award,
  HeartHandshake,
  TrendingDown,
  TrendingUp,
  Calendar,
  Filter,
  Eye,
  MessageCircle,
  FileText,
  Clock,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Search,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  Student,
  ViolationRecord,
  AchievementRecord,
  CounselingRecord,
  RiskLevel,
  UserAccount,
  AppIdentity,
} from '../../types';
import { storageService } from '../../services/storageService';
import { generateSummonsWhatsAppUrl } from '../../utils/whatsapp';
import { StudentRiskAnalysisSection } from './StudentRiskAnalysisSection';

interface DashboardViewProps {
  currentUser: UserAccount;
  students: Student[];
  violations: ViolationRecord[];
  achievements: AchievementRecord[];
  counselingRecords: CounselingRecord[];
  onSelectStudentProfile: (student: Student) => void;
  onOpenPrintSlip: (type: 'parent_summons' | 'violation_statement', violation?: ViolationRecord, student?: Student) => void;
  onNavigateTab: (tab: string) => void;
  appIdentity?: AppIdentity;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
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
  // Date range filter state
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'week' | 'month' | 'semester1' | 'semester2' | 'custom'>('semester1');
  const [customStartDate, setCustomStartDate] = useState('2026-07-01');
  const [customEndDate, setCustomEndDate] = useState('2026-12-31');

  // Filtered violations & achievements by selected date range
  const { filteredViolations, filteredAchievements } = useMemo(() => {
    let start = '2026-01-01';
    let end = '2026-12-31';

    if (dateRangeFilter === 'week') {
      start = '2026-09-25';
      end = '2026-10-05';
    } else if (dateRangeFilter === 'month') {
      start = '2026-09-01';
      end = '2026-09-30';
    } else if (dateRangeFilter === 'semester1') {
      start = '2026-07-01';
      end = '2026-12-31';
    } else if (dateRangeFilter === 'semester2') {
      start = '2027-01-01';
      end = '2027-06-30';
    } else if (dateRangeFilter === 'custom') {
      start = customStartDate || '2026-01-01';
      end = customEndDate || '2026-12-31';
    }

    const vList = violations.filter((v) => v.date >= start && v.date <= end);
    const aList = achievements.filter((a) => a.date >= start && a.date <= end);

    return { filteredViolations: vList, filteredAchievements: aList };
  }, [violations, achievements, dateRangeFilter, customStartDate, customEndDate]);

  // Monthly Comparison Chart Data: Pelanggaran vs Prestasi
  const monthlyComparisonData = useMemo(() => {
    const months = [
      { key: '07', label: 'Juli' },
      { key: '08', label: 'Agustus' },
      { key: '09', label: 'September' },
      { key: '10', label: 'Oktober' },
      { key: '11', label: 'November' },
      { key: '12', label: 'Desember' },
    ];

    return months.map((m) => {
      const vCount = violations.filter((v) => v.date.startsWith(`2026-${m.key}`)).length;
      const vPoints = violations
        .filter((v) => v.date.startsWith(`2026-${m.key}`))
        .reduce((sum, item) => sum + (item.points || 0), 0);

      const aCount = achievements.filter((a) => a.date.startsWith(`2026-${m.key}`)).length;
      const aPoints = achievements
        .filter((a) => a.date.startsWith(`2026-${m.key}`))
        .reduce((sum, item) => sum + (item.points || 0), 0);

      return {
        month: m.label,
        pelanggaran: vCount,
        poinPelanggaran: vPoints,
        prestasi: aCount,
        poinPrestasi: aPoints,
      };
    });
  }, [violations, achievements]);

  return (
    <div className="space-y-6">
      {/* Welcome Counselor Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/bg_konseling_school_1791227259888.jpg"
            alt="Konseling"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-medium mb-1">
            <span>{identity.schoolName}, {identity.city}</span>
            <span>·</span>
            <span>Tahun Ajaran {identity.academicYear} ({identity.semester})</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Selamat Datang, {currentUser.name}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
            Portal Bimbingan Konseling (BP/BK) terintegrasi untuk pendampingan karakter siswa, penanganan pelanggaran secara solutif, apresiasi prestasi, dan koordinasi cepat dengan wali murid.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('violations')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            + Catat Pelanggaran
          </button>
          <button
            onClick={() => onNavigateTab('achievements')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            + Catat Prestasi
          </button>
          <button
            onClick={() => onNavigateTab('counseling')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            + Sesi Konseling
          </button>
        </div>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Siswa Terdata</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{students.length}</span>
            <span className="text-xs text-slate-500">6 Rombel Aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pelanggaran Periode Ini</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono tabular-nums">{filteredViolations.length}</span>
            <span className="text-xs text-slate-500">kasus tercatat</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Prestasi Siswa</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 font-mono tabular-nums">{filteredAchievements.length}</span>
            <span className="text-xs text-slate-500">kejuaraan/apresiasi</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Sesi Konseling Aktif</span>
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">{counselingRecords.length}</span>
            <span className="text-xs text-slate-500">pendampingan</span>
          </div>
        </div>
      </div>

      {/* Visualisasi Tren Perbandingan Pelanggaran vs Prestasi */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Perbandingan Tren Perilaku Siswa (Pelanggaran vs Prestasi)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik garis bulanan memantau dinamika kedisiplinan dan capaian positif sepanjang semester
            </p>
          </div>

          {/* Filter Rentang Tanggal */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto max-w-full">
              <button
                onClick={() => setDateRangeFilter('week')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRangeFilter === 'week' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setDateRangeFilter('month')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRangeFilter === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini
              </button>
              <button
                onClick={() => setDateRangeFilter('semester1')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRangeFilter === 'semester1' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semester Ganjil
              </button>
              <button
                onClick={() => setDateRangeFilter('semester2')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRangeFilter === 'semester2' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semester Genap
              </button>
              <button
                onClick={() => setDateRangeFilter('custom')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRangeFilter === 'custom' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rentang Kustom
              </button>
            </div>

            {dateRangeFilter === 'custom' && (
              <div className="flex items-center gap-1 text-xs">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="p-1 border border-slate-300 rounded text-xs"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="p-1 border border-slate-300 rounded text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Recharts Comparison Line Graph */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyComparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="pelanggaran"
                name="Kasus Pelanggaran"
                stroke="#e11d48"
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="prestasi"
                name="Catatan Prestasi"
                stroke="#d97706"
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fitur Utama: Analisis Profil Risiko Siswa & Pemetaan Intervensi BK */}
      <StudentRiskAnalysisSection
        students={students}
        violations={violations}
        achievements={achievements}
        counselingRecords={counselingRecords}
        onSelectStudentProfile={onSelectStudentProfile}
        onOpenPrintSlip={onOpenPrintSlip}
        onNavigateTab={onNavigateTab}
        appIdentity={identity}
      />

      {/* Sesi Konseling & Tindak Lanjut Terbaru */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Agenda & Riwayat Konseling Terkini</h3>
              <p className="text-xs text-slate-500">Tindak lanjut bimbingan siswa yang sedang berjalan</p>
            </div>
            <button
              onClick={() => onNavigateTab('counseling')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {counselingRecords.slice(0, 3).map((cr) => (
              <div key={cr.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">{cr.studentName} ({cr.className})</span>
                  <span className="text-[11px] font-mono text-slate-500">{cr.date}</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 line-clamp-1">{cr.issueDescription}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-200">
                  <span>Konselor: {cr.counselorName}</span>
                  <span className="text-blue-600 font-medium capitalize">{cr.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pelanggaran Terakhir Tercatat</h3>
              <p className="text-xs text-slate-500">Kasus kedisiplinan yang baru dimasukkan guru piket/BK</p>
            </div>
            <button
              onClick={() => onNavigateTab('violations')}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {violations.slice(0, 3).map((vl) => (
              <div key={vl.id} className="p-3 bg-rose-50/40 rounded-lg border border-rose-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{vl.studentName} ({vl.className})</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 uppercase">
                      {vl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">{vl.violationName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 font-mono">+{vl.points} Poin</span>
                  <div className="text-[10px] text-slate-400 mt-1">{vl.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
