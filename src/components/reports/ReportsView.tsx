import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Filter,
  BarChart3,
  TrendingDown,
  PieChart as PieIcon,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Student,
  ViolationRecord,
  AchievementRecord,
  CounselingRecord,
  UserAccount,
  ClassItem,
  AppIdentity,
} from '../../types';
import { exportViolationsToExcel, exportAchievementsToExcel } from '../../utils/excelExport';
import { ReportPrintPreviewModal } from '../print/ReportPrintPreviewModal';

interface ReportsViewProps {
  currentUser: UserAccount;
  students: Student[];
  violations: ViolationRecord[];
  achievements: AchievementRecord[];
  counselingRecords: CounselingRecord[];
  classes: ClassItem[];
  onOpenPrintSlip?: (type: 'monthly_report') => void;
  appIdentity?: AppIdentity;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser,
  students,
  violations,
  achievements,
  counselingRecords,
  classes,
  onOpenPrintSlip,
  appIdentity,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<'ganjil' | 'genap'>('ganjil');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isPrintPreviewModalOpen, setIsPrintPreviewModalOpen] = useState(false);

  // Monthly Violations Trend for Recharts (specifically requested by user)
  const monthlyViolationsTrend = useMemo(() => {
    const months = [
      { key: '07', label: 'Juli' },
      { key: '08', label: 'Agustus' },
      { key: '09', label: 'September' },
      { key: '10', label: 'Oktober' },
      { key: '11', label: 'November' },
      { key: '12', label: 'Desember' },
    ];

    return months.map((m) => {
      const vMonth = violations.filter((v) => v.date.startsWith(`2026-${m.key}`));
      const ringan = vMonth.filter((v) => v.category === 'ringan').length;
      const sedang = vMonth.filter((v) => v.category === 'sedang').length;
      const berat = vMonth.filter((v) => v.category === 'berat').length;
      const totalPoints = vMonth.reduce((acc, curr) => acc + (curr.points || 0), 0);

      return {
        month: m.label,
        ringan,
        sedang,
        berat,
        totalKasus: vMonth.length,
        totalPoin: totalPoints,
      };
    });
  }, [violations]);

  // Violations by Category breakdown (for Pie Chart)
  const categoryBreakdown = useMemo(() => {
    const ringan = violations.filter((v) => v.category === 'ringan').length;
    const sedang = violations.filter((v) => v.category === 'sedang').length;
    const berat = violations.filter((v) => v.category === 'berat').length;

    return [
      { name: 'Ringan', value: ringan, color: '#64748b' },
      { name: 'Sedang', value: sedang, color: '#d97706' },
      { name: 'Berat', value: berat, color: '#e11d48' },
    ];
  }, [violations]);

  // Violations by Class breakdown
  const classBreakdown = useMemo(() => {
    const classMap: { [key: string]: number } = {};
    violations.forEach((v) => {
      classMap[v.className] = (classMap[v.className] || 0) + 1;
    });

    return Object.keys(classMap).map((cls) => ({
      className: `Kelas ${cls}`,
      kasus: classMap[cls],
    }));
  }, [violations]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Laporan & Visualisasi Pola Perilaku Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis data tren kedisiplinan siswa per bulan, rekapitulasi semester, cetak dokumen PDF resmi, dan ekspor Excel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportViolationsToExcel(violations)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Ekspor Excel (.xlsx)
          </button>
          <button
            onClick={() => setIsPrintPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Rekapitulasi PDF
          </button>
        </div>
      </div>

      {/* RECHARTS: Tren Pelanggaran Siswa per Bulan (Sepanjang Semester) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Grafik Tren Pelanggaran Siswa per Bulan (Semester Ganjil 2026/2027)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Membantu Guru BK melihat pola dinamika perilaku siswa, efektivitas intervensi konseling, dan penurunan kasus pelanggaran
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Tahun Ajaran:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">2026/2027</span>
          </div>
        </div>

        {/* Stacked / Grouped Bar Chart of Violations by Category per Month */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyViolationsTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              <Bar dataKey="ringan" name="Pelanggaran Ringan" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sedang" name="Pelanggaran Sedang" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="berat" name="Pelanggaran Berat" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Kategori Breakdown & Sebaran per Rombel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart Proporsi Pelanggaran */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Proporsi Kategori Pelanggaran (Ringan, Sedang, Berat)
            </h3>
            <p className="text-xs text-slate-500">Distribusi tingkat keparahan kasus</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-xs">
            <div>
              <span className="text-slate-500">Ringan</span>
              <p className="font-bold text-slate-700 font-mono text-sm">{categoryBreakdown[0].value} Kasus</p>
            </div>
            <div>
              <span className="text-amber-600">Sedang</span>
              <p className="font-bold text-amber-700 font-mono text-sm">{categoryBreakdown[1].value} Kasus</p>
            </div>
            <div>
              <span className="text-rose-600">Berat</span>
              <p className="font-bold text-rose-700 font-mono text-sm">{categoryBreakdown[2].value} Kasus</p>
            </div>
          </div>
        </div>

        {/* Bar Chart Sebaran Kasus per Rombel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Sebaran Kasus per Rombongan Belajar (Kelas)
            </h3>
            <p className="text-xs text-slate-500">Pemetaan konsentrasi pembinaan wali kelas</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="className" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="kasus" name="Jumlah Kasus" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Rekomendasi: Pembinaan intensif wali kelas pada rombel dengan frekuensi tertinggi.</span>
          </div>
        </div>
      </div>

      {/* Tabel Ringkasan Evaluasi Bulanan */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          Matriks Rekapitulasi Evaluasi Kedisiplinan & Konseling
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tabel data terperinci siap cetak untuk lampiran Rapat Evaluasi Bulanan bersama Kepala Sekolah & Dewan Guru
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Bulan</th>
                <th className="py-2.5 px-3 font-semibold text-center">Kasus Ringan</th>
                <th className="py-2.5 px-3 font-semibold text-center">Kasus Sedang</th>
                <th className="py-2.5 px-3 font-semibold text-center">Kasus Berat</th>
                <th className="py-2.5 px-3 font-semibold text-center">Total Poin Akumulasi</th>
                <th className="py-2.5 px-4 font-semibold">Status Penanganan Konseling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyViolationsTrend.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{row.month} 2026</td>
                  <td className="py-2.5 px-3 text-center font-mono">{row.ringan}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-amber-600 font-semibold">{row.sedang}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-rose-600 font-bold">{row.berat}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">{row.totalPoin} Poin</td>
                  <td className="py-2.5 px-4">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Semua ditindaklanjuti Guru BP/BK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Print Preview Modal with Section Toggles & Date Filter */}
      {isPrintPreviewModalOpen && (
        <ReportPrintPreviewModal
          students={students}
          violations={violations}
          achievements={achievements}
          counselingRecords={counselingRecords}
          classes={classes}
          appIdentity={appIdentity}
          onClose={() => setIsPrintPreviewModalOpen(false)}
        />
      )}
    </div>
  );
};
