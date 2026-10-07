import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  ArrowRightLeft,
  CheckSquare,
  Square,
  Search,
  CheckCircle2,
  Trash2,
  UserCheck,
  HeartHandshake,
  Sparkles,
  Filter,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  QrCode,
  Scan,
} from 'lucide-react';
import { Student, ClassItem, UserAccount } from '../../types';
import { storageService } from '../../services/storageService';
import {
  exportStudentsToExcel,
  generateStudentTemplateExcel,
  parseExcelStudentFile,
} from '../../utils/excelExport';
import { StudentQRCodeModal } from '../qrcode/StudentQRCodeModal';
import { QRScannerModal } from '../qrcode/QRScannerModal';

interface ClassAdminViewProps {
  currentUser: UserAccount;
  students: Student[];
  classes: ClassItem[];
  users?: UserAccount[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onBulkAddStudents: (students: Omit<Student, 'id'>[]) => void;
  onUpdateStudentClass: (studentIds: string[], targetClass: string) => void;
  onPromoteClassBulk: (sourceClass: string, targetClass: string) => void;
  onDeleteStudent: (id: string) => void;
  onSelectStudentProfile: (student: Student) => void;
  onAssignCounselor?: (
    studentId: string,
    counselor: { id: string; name: string; nip?: string; phone?: string } | null
  ) => void;
  onBulkAssignCounselor?: (
    studentIds: string[],
    counselor: { id: string; name: string; nip?: string; phone?: string } | null
  ) => void;
  onAssignClassToCounselor?: (
    className: string,
    counselor: { id: string; name: string; nip?: string; phone?: string } | null
  ) => void;
}

export const ClassAdminView: React.FC<ClassAdminViewProps> = ({
  currentUser,
  students,
  classes,
  users,
  onAddStudent,
  onBulkAddStudents,
  onUpdateStudentClass,
  onPromoteClassBulk,
  onDeleteStudent,
  onSelectStudentProfile,
  onAssignCounselor,
  onBulkAssignCounselor,
  onAssignClassToCounselor,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClassTransferModalOpen, setIsClassTransferModalOpen] = useState(false);
  const [isMassPromotionModalOpen, setIsMassPromotionModalOpen] = useState(false);

  // Counselor Assignment States
  const [selectedCounselorFilter, setSelectedCounselorFilter] = useState<string>('all');
  const [isBulkAssignCounselorModalOpen, setIsBulkAssignCounselorModalOpen] = useState(false);
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [singleStudentToAssign, setSingleStudentToAssign] = useState<Student | null>(null);
  const [targetCounselorId, setTargetCounselorId] = useState<string>('');
  const [classToAssignCounselor, setClassToAssignCounselor] = useState<string>('7A');
  const [classTargetCounselorId, setClassTargetCounselorId] = useState<string>('');
  const [newCounselorId, setNewCounselorId] = useState<string>('');
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Available counselors list (role guru or superadmin)
  const availableCounselors = useMemo(() => {
    const list =
      users && users.length > 0
        ? users.filter((u) => u.role === 'guru' || u.role === 'superadmin')
        : storageService.getUsers().filter((u) => u.role === 'guru' || u.role === 'superadmin');
    return list;
  }, [users]);

  // Distribution stats
  const counselorStats = useMemo(() => {
    return availableCounselors.map((c) => {
      const assigned = students.filter((s) => s.counselorId === c.id);
      return {
        counselor: c,
        totalAssigned: assigned.length,
        classes: Array.from(new Set(assigned.map((s) => s.className))).sort(),
      };
    });
  }, [availableCounselors, students]);

  const unassignedCount = useMemo(() => {
    return students.filter((s) => !s.counselorId).length;
  }, [students]);

  // New Student Manual State
  const [newNisn, setNewNisn] = useState('');
  const [newNis, setNewNis] = useState('');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [newClass, setNewClass] = useState('7A');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Bulk Transfer State
  const [targetTransferClass, setTargetTransferClass] = useState('8A');

  // Mass Promotion State
  const [sourceMassClass, setSourceMassClass] = useState('7A');
  const [targetMassClass, setTargetMassClass] = useState('8A');

  // Excel Import Preview State
  const [importPreview, setImportPreview] = useState<Partial<Student>[]>([]);
  const [importFileName, setImportFileName] = useState('');

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newNisn) {
      alert('Nama dan NISN wajib diisi.');
      return;
    }

    const counselorObj = availableCounselors.find((c) => c.id === newCounselorId);

    onAddStudent({
      nisn: newNisn,
      nis: newNis || `2324${Math.floor(1000 + Math.random() * 9000)}`,
      name: newName,
      gender: newGender,
      className: newClass,
      academicYear: '2026/2027',
      parentName: newParentName || 'Wali Murid',
      parentPhone: newParentPhone || '081234567890',
      address: newAddress || 'Cijambe, Subang',
      totalViolationPoints: 0,
      totalAchievementPoints: 0,
      counselingStatus: 'aman',
      counselorId: counselorObj?.id,
      counselorName: counselorObj?.name,
      counselorNip: counselorObj?.nipOrNisn,
      counselorPhone: counselorObj?.phone,
      assignedAt: counselorObj ? new Date().toISOString().substring(0, 10) : undefined,
    });

    setIsAddModalOpen(false);
    setNewNisn('');
    setNewNis('');
    setNewName('');
    setNewParentName('');
    setNewParentPhone('');
    setNewAddress('');
    setNewCounselorId('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    try {
      const parsed = await parseExcelStudentFile(file);
      setImportPreview(parsed);
    } catch (err) {
      alert('Gagal membaca file Excel. Pastikan format tabel sesuai template.');
    }
  };

  const handleConfirmImport = () => {
    if (importPreview.length === 0) return;
    const readyStudents = importPreview.map((s) => ({
      nisn: s.nisn || `009${Date.now()}`,
      nis: s.nis || `2324${Math.floor(1000 + Math.random() * 9000)}`,
      name: s.name || 'Siswa',
      gender: s.gender || 'L',
      className: s.className || '7A',
      academicYear: '2026/2027',
      parentName: s.parentName || 'Orang Tua',
      parentPhone: s.parentPhone || '081234567890',
      address: s.address || 'Cijambe, Subang',
      totalViolationPoints: 0,
      totalAchievementPoints: 0,
      counselingStatus: 'aman' as const,
    }));

    onBulkAddStudents(readyStudents);
    setIsImportModalOpen(false);
    setImportPreview([]);
    setImportFileName('');
    alert(`Berhasil mengimpor ${readyStudents.length} data siswa dari Excel!`);
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExecuteTransfer = () => {
    if (selectedStudentIds.length === 0) {
      alert('Pilih siswa yang akan dipindahkan terlebih dahulu.');
      return;
    }
    onUpdateStudentClass(selectedStudentIds, targetTransferClass);
    setIsClassTransferModalOpen(false);
    setSelectedStudentIds([]);
    alert(`Berhasil memindahkan ${selectedStudentIds.length} siswa ke kelas ${targetTransferClass}!`);
  };

  const handleExecuteMassPromotion = () => {
    if (sourceMassClass === targetMassClass) {
      alert('Kelas asal dan kelas tujuan tidak boleh sama.');
      return;
    }
    onPromoteClassBulk(sourceMassClass, targetMassClass);
    setIsMassPromotionModalOpen(false);
    alert(`Proses kenaikan kelas dari ${sourceMassClass} ke ${targetMassClass} berhasil dilaksanakan!`);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === 'all' || s.className === selectedClass;

      // Filter by counselor
      let matchCounselor = true;
      if (selectedCounselorFilter === 'my_students') {
        matchCounselor = s.counselorId === currentUser.id;
      } else if (selectedCounselorFilter === 'unassigned') {
        matchCounselor = !s.counselorId;
      } else if (selectedCounselorFilter !== 'all') {
        matchCounselor = s.counselorId === selectedCounselorFilter;
      }

      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.nisn.includes(term) ||
        s.nis.includes(term) ||
        (s.counselorName && s.counselorName.toLowerCase().includes(term)) ||
        s.parentName.toLowerCase().includes(term) ||
        s.parentPhone.includes(term) ||
        s.address.toLowerCase().includes(term);

      return matchClass && matchCounselor && matchSearch;
    });
  }, [students, selectedClass, selectedCounselorFilter, searchTerm, currentUser.id]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Administrasi Kelas & Kenaikan / Pindah Rombel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan peserta didik SMP Negeri 1 Cijambe, kenaikan kelas masal, mutasi kelas satuan, dan import Excel
          </p>
        </div>

        {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsDistributionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              Distribusi Konselor
            </button>
            <button
              onClick={() => setIsMassPromotionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              Naik Kelas Masal
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
            <button
              onClick={() => exportStudentsToExcel(students)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Tambah Siswa Manual
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Pindai QR Code Siswa untuk membuka rekam jejak"
            >
              <Scan className="w-4 h-4 text-blue-400" />
              Scan QR Siswa
            </button>
          </div>
        )}
      </div>

      {/* Rombel Tabs & Class Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setSelectedClass('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
            selectedClass === 'all'
              ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Semua Rombel ({students.length} Siswa)
        </button>
        {classes.map((cls) => {
          const count = students.filter((s) => s.className === cls.name).length;
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.name)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                selectedClass === cls.name
                  ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Kelas {cls.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Batch Action Bar if students are selected */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
            <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{selectedStudentIds.length} Siswa Terpilih</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
              <button
                onClick={() => {
                  setTargetCounselorId('');
                  setIsBulkAssignCounselorModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Hubungkan ke Guru/Konselor
              </button>
            )}
            <button
              onClick={() => setIsClassTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Pindah / Naikkan Rombel
            </button>
            <button
              onClick={() => setSelectedStudentIds([])}
              className="px-2.5 py-1.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg cursor-pointer"
            >
              Batal Pilih
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN, NIS, konselor, nama orang tua, no WA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-hidden text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer shrink-0"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Filter Konselor Pendamping */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
            Konselor:
          </label>
          <select
            value={selectedCounselorFilter}
            onChange={(e) => setSelectedCounselorFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
          >
            <option value="all">Semua Konselor</option>
            {currentUser.role === 'guru' && (
              <option value="my_students">
                ★ Siswa Binaan Saya ({students.filter((s) => s.counselorId === currentUser.id).length})
              </option>
            )}
            <option value="unassigned">Belum Ada Konselor ({unassignedCount})</option>
            <optgroup label="Daftar Guru BK">
              {availableCounselors.map((c) => {
                const count = students.filter((s) => s.counselorId === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count} siswa)
                  </option>
                );
              })}
            </optgroup>
          </select>
        </div>

        <div className="text-xs text-slate-500 shrink-0">
          Menampilkan <strong>{filteredStudents.length}</strong> siswa
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <button onClick={handleToggleSelectAll} className="cursor-pointer">
                    {selectedStudentIds.length > 0 && selectedStudentIds.length === filteredStudents.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold">Nama Lengkap</th>
                <th className="py-3 px-3 font-semibold">NISN / NIS</th>
                <th className="py-3 px-3 font-semibold">Kelas</th>
                <th className="py-3 px-3 font-semibold">L/P</th>
                <th className="py-3 px-3 font-semibold">Guru BK / Konselor</th>
                <th className="py-3 px-4 font-semibold">Orang Tua / No. WA</th>
                <th className="py-3 px-3 font-semibold text-center">Poin Pelanggaran</th>
                <th className="py-3 px-3 font-semibold text-center">Poin Prestasi</th>
                <th className="py-3 px-3 font-semibold">Status Disiplin</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleToggleStudent(s.id)} className="cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectStudentProfile(s)}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left cursor-pointer"
                      >
                        {s.name}
                      </button>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{s.address}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      <div>{s.nisn}</div>
                      <div className="text-[11px] text-slate-400">{s.nis}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">{s.className}</td>
                    <td className="py-3 px-3 font-semibold text-slate-600">{s.gender}</td>
                    <td className="py-3 px-3">
                      {s.counselorName ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200 max-w-[140px]"
                            title={`Konselor: ${s.counselorName}${s.counselorNip ? ` (NIP: ${s.counselorNip})` : ''}`}
                          >
                            <HeartHandshake className="w-3 h-3 text-purple-600 shrink-0" />
                            <span className="truncate">{s.counselorName}</span>
                          </span>
                          {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
                            <button
                              type="button"
                              onClick={() => setSingleStudentToAssign(s)}
                              className="text-[10px] text-slate-400 hover:text-purple-700 underline cursor-pointer"
                              title="Ubah guru konselor"
                            >
                              Ubah
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Belum Ada
                          </span>
                          {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
                            <button
                              type="button"
                              onClick={() => setSingleStudentToAssign(s)}
                              className="text-[10px] text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
                            >
                              + Hubungkan
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{s.parentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.parentPhone}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono font-bold text-sm ${s.totalViolationPoints > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {s.totalViolationPoints}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono font-bold text-sm ${s.totalAchievementPoints > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {s.totalAchievementPoints}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          s.totalViolationPoints >= 75
                            ? 'bg-rose-100 text-rose-800'
                            : s.totalViolationPoints >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : s.totalViolationPoints >= 25
                            ? 'bg-amber-50 text-amber-700'
                            : s.totalViolationPoints >= 10
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {s.totalViolationPoints >= 75
                          ? 'KRITIS'
                          : s.totalViolationPoints >= 50
                          ? 'PERINGATAN II'
                          : s.totalViolationPoints >= 25
                          ? 'PERINGATAN I'
                          : s.totalViolationPoints >= 10
                          ? 'PEMANTAUAN'
                          : 'AMAN'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectStudentProfile(s)}
                          className="px-2.5 py-1 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-medium cursor-pointer"
                        >
                          Profil BK
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForQr(s)}
                          className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium cursor-pointer flex items-center gap-1"
                          title="Cetak Kartu & QR Code Siswa"
                        >
                          <QrCode className="w-3 h-3 text-blue-600" />
                          <span>QR</span>
                        </button>
                        {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus data siswa ${s.name}?`)) {
                                onDeleteStudent(s.id);
                              }
                            }}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Siswa Manual */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto my-auto">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Tambah Data Siswa Baru (Manual)
            </h3>

            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    value={newNisn}
                    onChange={(e) => setNewNisn(e.target.value)}
                    placeholder="Contoh: 0098765439"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIS Sekolah</label>
                  <input
                    type="text"
                    value={newNis}
                    onChange={(e) => setNewNis(e.target.value)}
                    placeholder="Contoh: 23240815"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama sesuai akta lahir / ijazah SD"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rombongan Belajar (Kelas)</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>Kelas {cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    placeholder="Nama ayah/ibu/wali"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp Aktif Wali</label>
                  <input
                    type="text"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Kp. / Desa / RT / RW Cijambe, Subang"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guru BK / Konselor Pendamping (Opsional)
                </label>
                <select
                  value={newCounselorId}
                  onChange={(e) => setNewCounselorId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                >
                  <option value="">Belum Ditugaskan (Pilih Nanti)</option>
                  {availableCounselors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.nipOrNisn ? `(NIP: ${c.nipOrNisn})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Setiap siswa hanya memiliki satu guru konselor, namun seorang guru konselor dapat membimbing banyak siswa.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Import Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto my-auto">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Import Data Siswa dari File Excel (.xlsx / .csv)
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Unduh Format Template Excel</p>
                  <p className="text-[11px] text-slate-500">
                    Gunakan format kolom standar: NISN, NIS, Nama Lengkap, L/P, Kelas, Nama Orang Tua, No WhatsApp, Alamat
                  </p>
                </div>
                <button
                  onClick={generateStudentTemplateExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Template
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Unggah File Excel Berisi Data Siswa
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
                />
              </div>

              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-700">
                      Pratinjau Data ({importPreview.length} Siswa Terdeteksi)
                    </span>
                    <span className="text-slate-400 font-mono">{importFileName}</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0">
                        <tr>
                          <th className="p-2">NISN</th>
                          <th className="p-2">Nama</th>
                          <th className="p-2">Kelas</th>
                          <th className="p-2">Wali</th>
                          <th className="p-2">WA Wali</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreview.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{item.nisn}</td>
                            <td className="p-2 font-semibold text-slate-900">{item.name}</td>
                            <td className="p-2">{item.className}</td>
                            <td className="p-2">{item.parentName}</td>
                            <td className="p-2 font-mono">{item.parentPhone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportPreview([]);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importPreview.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Impor {importPreview.length} Siswa ke Database
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pindah Kelas Satuan / Terpilih */}
      {isClassTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto my-auto">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
              Pindah / Naikkan Rombel Siswa Terpilih
            </h3>

            <p className="text-xs text-slate-600 mb-4">
              Anda akan memindahkan <strong>{selectedStudentIds.length} siswa</strong> terpilih ke rombel baru. Catatan poin kedisiplinan dan prestasi akan tetap melekat pada riwayat siswa.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Rombel / Kelas Tujuan:
              </label>
              <select
                value={targetTransferClass}
                onChange={(e) => setTargetTransferClass(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    Kelas {cls.name} (Wali: {cls.homeroomTeacher})
                  </option>
                ))}
                <option value="LULUS">Alumni / Lulus</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsClassTransferModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Konfirmasi Pemindahan Rombel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Naik Kelas Masal (Seluruh Rombel) */}
      {isMassPromotionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto my-auto">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Kenaikan Kelas Masal (Seluruh Anggota Rombel)
            </h3>

            <p className="text-xs text-slate-600 mb-4">
              Fitur ini memindahkan secara kolektif seluruh siswa dari satu rombel ke jenjang rombel berikutnya (misal: seluruh siswa 7A naik ke 8A, atau kelas 9 menjadi Lulus/Alumni).
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rombel Asal</label>
                <select
                  value={sourceMassClass}
                  onChange={(e) => setSourceMassClass(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>Kelas {cls.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Jumlah: {students.filter((s) => s.className === sourceMassClass).length} Siswa
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rombel Tujuan (Naik)</label>
                <select
                  value={targetMassClass}
                  onChange={(e) => setTargetMassClass(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>Kelas {cls.name}</option>
                  ))}
                  <option value="LULUS">Alumni / Lulus</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 mb-4">
              Pastikan nilai evaluasi semester telah tuntas sebelum mengeksekusi kenaikan kelas masal. Seluruh riwayat bimbingan konseling tetap tersimpan di arsip sekolah.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMassPromotionModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteMassPromotion}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Proses Kenaikan Kelas Masal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Hubungkan Siswa Terpilih ke Guru BK / Konselor (Bulk Assign) */}
      {isBulkAssignCounselorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
                <span>Hubungkan ke Guru BK / Konselor</span>
              </div>
              <button
                onClick={() => setIsBulkAssignCounselorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Pilih guru konselor yang akan mendampingi <strong>{selectedStudentIds.length}</strong> siswa yang dipilih:
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Guru BK / Konselor
              </label>
              <select
                value={targetCounselorId}
                onChange={(e) => setTargetCounselorId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">-- Pilih Guru BK --</option>
                {availableCounselors.map((c) => {
                  const count = students.filter((s) => s.counselorId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({count} siswa binaan)
                    </option>
                  );
                })}
                <option value="__UNASSIGN__">-- Lepaskan / Hapus Hubungan Konselor --</option>
              </select>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-[11px] text-purple-900 mb-4">
              <strong>Aturan Hubungan:</strong> Setiap siswa hanya akan memiliki 1 konselor pendamping. Bila siswa sebelumnya telah memiliki konselor, penugasan akan otomatis dialihkan ke konselor baru yang dipilih.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkAssignCounselorModalOpen(false)}
                className="px-3.5 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!targetCounselorId}
                onClick={() => {
                  if (targetCounselorId === '__UNASSIGN__') {
                    if (onBulkAssignCounselor) {
                      onBulkAssignCounselor(selectedStudentIds, null);
                    }
                  } else {
                    const c = availableCounselors.find((item) => item.id === targetCounselorId);
                    if (c && onBulkAssignCounselor) {
                      onBulkAssignCounselor(selectedStudentIds, {
                        id: c.id,
                        name: c.name,
                        nip: c.nipOrNisn,
                        phone: c.phone,
                      });
                    }
                  }
                  setIsBulkAssignCounselorModalOpen(false);
                  setSelectedStudentIds([]);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Terapkan Penugasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Hubungkan Siswa Individual (Single Assign) */}
      {singleStudentToAssign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
                <span>Konselor Pendamping Siswa</span>
              </div>
              <button
                onClick={() => setSingleStudentToAssign(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <div className="font-bold text-slate-900 text-xs">{singleStudentToAssign.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Kelas {singleStudentToAssign.className} · NISN: {singleStudentToAssign.nisn}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] flex items-center justify-between">
                <span className="text-slate-500">Konselor Saat Ini:</span>
                <span className="font-semibold text-purple-700">
                  {singleStudentToAssign.counselorName || 'Belum Ada'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tugaskan ke Guru BK / Konselor:
              </label>
              <select
                defaultValue={singleStudentToAssign.counselorId || ''}
                id="select-single-counselor"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">-- Belum Ditugaskan / Hapus Konselor --</option>
                {availableCounselors.map((c) => {
                  const count = students.filter((s) => s.counselorId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({count} siswa binaan)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSingleStudentToAssign(null)}
                className="px-3.5 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const selectEl = document.getElementById('select-single-counselor') as HTMLSelectElement;
                  const cId = selectEl ? selectEl.value : '';
                  if (!cId) {
                    if (onAssignCounselor) {
                      onAssignCounselor(singleStudentToAssign.id, null);
                    }
                  } else {
                    const c = availableCounselors.find((item) => item.id === cId);
                    if (c && onAssignCounselor) {
                      onAssignCounselor(singleStudentToAssign.id, {
                        id: c.id,
                        name: c.name,
                        nip: c.nipOrNisn,
                        phone: c.phone,
                      });
                    }
                  }
                  setSingleStudentToAssign(null);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Simpan Hubungan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Ringkasan Pemetaan & Distribusi Siswa ke Konselor */}
      {isDistributionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-5 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-base">
                <HeartHandshake className="w-6 h-6 text-purple-600" />
                <div>
                  <h3>Distribusi & Pemetaan Siswa ke Guru BK / Konselor</h3>
                  <p className="text-xs font-normal text-slate-500">
                    Setiap siswa memiliki tepat 1 konselor pendamping, dan guru konselor dapat membina banyak siswa.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDistributionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] text-slate-500">Total Peserta Didik</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{students.length}</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-[11px] text-emerald-700">Sudah Memiliki Konselor</div>
                <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">
                  {students.length - unassignedCount}
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-[11px] text-amber-700">Belum Memiliki Konselor</div>
                <div className="text-xl font-black text-amber-800 font-mono mt-0.5">{unassignedCount}</div>
              </div>
            </div>

            {/* Counselors Grid */}
            <h4 className="text-xs font-bold text-slate-900 mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              Beban Bimbingan per Guru BK / Konselor:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {counselorStats.map(({ counselor, totalAssigned, classes: assignedClasses }) => (
                <div
                  key={counselor.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {counselor.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{counselor.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {counselor.nipOrNisn ? `NIP ${counselor.nipOrNisn}` : 'Guru Konselor'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100">
                    <span className="text-slate-500">Siswa Binaan:</span>
                    <span className="font-bold font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      {totalAssigned} Siswa
                    </span>
                  </div>

                  {assignedClasses.length > 0 && (
                    <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-1 flex-wrap">
                      <span>Rombel:</span>
                      {assignedClasses.map((cls) => (
                        <span key={cls} className="px-1 py-0.2 bg-slate-100 rounded text-slate-700 font-semibold">
                          {cls}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCounselorFilter(counselor.id);
                      setIsDistributionModalOpen(false);
                    }}
                    className="w-full mt-2.5 py-1 text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Filter Siswa Binaan
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Bulk Action by Class */}
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl mb-4">
              <h5 className="text-xs font-bold text-purple-950 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Penugasan Cepat per Rombongan Belajar (Rombel)
              </h5>
              <p className="text-[11px] text-purple-800 mb-3">
                Hubungkan seluruh siswa dalam 1 kelas ke guru konselor tertentu dalam sekali klik:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 mb-1">Pilih Kelas</label>
                  <select
                    value={classToAssignCounselor}
                    onChange={(e) => setClassToAssignCounselor(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-purple-300 bg-white"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        Kelas {cls.name} ({students.filter((s) => s.className === cls.name).length} siswa)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 mb-1">Tugaskan ke Guru BK</label>
                  <select
                    value={classTargetCounselorId}
                    onChange={(e) => setClassTargetCounselorId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-purple-300 bg-white"
                  >
                    <option value="">-- Pilih Guru BK --</option>
                    {availableCounselors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={!classTargetCounselorId}
                    onClick={() => {
                      const c = availableCounselors.find((item) => item.id === classTargetCounselorId);
                      if (!c) return;
                      if (onAssignClassToCounselor) {
                        onAssignClassToCounselor(classToAssignCounselor, {
                          id: c.id,
                          name: c.name,
                          nip: c.nipOrNisn,
                          phone: c.phone,
                        });
                      } else if (onBulkAssignCounselor) {
                        const classStudentIds = students
                          .filter((s) => s.className === classToAssignCounselor)
                          .map((s) => s.id);
                        onBulkAssignCounselor(classStudentIds, {
                          id: c.id,
                          name: c.name,
                          nip: c.nipOrNisn,
                          phone: c.phone,
                        });
                      }
                      alert(
                        `Seluruh siswa Kelas ${classToAssignCounselor} berhasil dihubungkan ke konselor ${c.name}!`
                      );
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    Tugaskan Kelas Ini
                  </button>
                </div>
              </div>
            </div>

            {/* Auto Distribute Evenly Button */}
            {unassignedCount > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs mb-4">
                <div>
                  <div className="font-semibold text-slate-800">
                    Masih ada {unassignedCount} siswa belum memiliki konselor
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bagikan otomatis secara merata kepada seluruh guru BK yang tersedia.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (availableCounselors.length === 0) return;
                    const unassigned = students.filter((s) => !s.counselorId);
                    if (
                      !window.confirm(
                        `Bagi rata ${unassigned.length} siswa secara otomatis ke ${availableCounselors.length} guru BK?`
                      )
                    )
                      return;

                    unassigned.forEach((s, idx) => {
                      const c = availableCounselors[idx % availableCounselors.length];
                      if (onAssignCounselor) {
                        onAssignCounselor(s.id, {
                          id: c.id,
                          name: c.name,
                          nip: c.nipOrNisn,
                          phone: c.phone,
                        });
                      }
                    });
                    alert(`Berhasil mendistribusikan ${unassigned.length} siswa secara merata!`);
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                >
                  Bagi Rata Otomatis
                </button>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDistributionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Kartu & QR Code Siswa */}
      {selectedStudentForQr && (
        <StudentQRCodeModal
          student={selectedStudentForQr}
          violationsCount={selectedStudentForQr.totalViolationPoints}
          achievementsCount={selectedStudentForQr.totalAchievementPoints}
          onClose={() => setSelectedStudentForQr(null)}
          onOpenFullRecord={(s) => {
            setSelectedStudentForQr(null);
            onSelectStudentProfile(s);
          }}
        />
      )}

      {/* Modal Scanner QR Code Siswa */}
      {isScannerOpen && (
        <QRScannerModal
          students={students}
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onSelectStudent={(s) => {
            onSelectStudentProfile(s);
          }}
        />
      )}
    </div>
  );
};
