import React, { useState } from 'react';
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
} from 'lucide-react';
import { Student, ClassItem, UserAccount } from '../../types';
import {
  exportStudentsToExcel,
  generateStudentTemplateExcel,
  parseExcelStudentFile,
} from '../../utils/excelExport';

interface ClassAdminViewProps {
  currentUser: UserAccount;
  students: Student[];
  classes: ClassItem[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onBulkAddStudents: (students: Omit<Student, 'id'>[]) => void;
  onUpdateStudentClass: (studentIds: string[], targetClass: string) => void;
  onPromoteClassBulk: (sourceClass: string, targetClass: string) => void;
  onDeleteStudent: (id: string) => void;
  onSelectStudentProfile: (student: Student) => void;
}

export const ClassAdminView: React.FC<ClassAdminViewProps> = ({
  currentUser,
  students,
  classes,
  onAddStudent,
  onBulkAddStudents,
  onUpdateStudentClass,
  onPromoteClassBulk,
  onDeleteStudent,
  onSelectStudentProfile,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClassTransferModalOpen, setIsClassTransferModalOpen] = useState(false);
  const [isMassPromotionModalOpen, setIsMassPromotionModalOpen] = useState(false);

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
    });

    setIsAddModalOpen(false);
    setNewNisn('');
    setNewNis('');
    setNewName('');
    setNewParentName('');
    setNewParentPhone('');
    setNewAddress('');
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

  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClass === 'all' || s.className === selectedClass;
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      s.name.toLowerCase().includes(term) ||
      s.nisn.includes(term) ||
      s.nis.includes(term) ||
      s.parentName.toLowerCase().includes(term) ||
      s.parentPhone.includes(term) ||
      s.address.toLowerCase().includes(term);
    return matchClass && matchSearch;
  });

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
        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span>{selectedStudentIds.length} Siswa Terpilih</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsClassTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Pindah / Naikkan Rombel Terpilih
            </button>
            <button
              onClick={() => setSelectedStudentIds([])}
              className="px-2.5 py-1.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg"
            >
              Batal Pilih
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex flex-1 max-w-md items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN, NIS, nama orang tua, no WA, atau alamat..."
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
        <div className="text-xs text-slate-500">
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
    </div>
  );
};
