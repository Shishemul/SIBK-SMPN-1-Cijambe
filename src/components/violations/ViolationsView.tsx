import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Printer,
  MessageCircle,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  Shield,
  FileCheck,
} from 'lucide-react';
import {
  ViolationRecord,
  ViolationMaster,
  Student,
  ViolationCategory,
  UserAccount,
} from '../../types';
import { generateViolationWhatsAppUrl } from '../../utils/whatsapp';
import { StudentSearchSelect } from '../common/StudentSearchSelect';

interface ViolationsViewProps {
  currentUser: UserAccount;
  violations: ViolationRecord[];
  students: Student[];
  violationMasters: ViolationMaster[];
  onAddViolation: (violation: Omit<ViolationRecord, 'id'>) => void;
  onDeleteViolation: (id: string) => void;
  onOpenPrintSlip: (type: 'violation_statement' | 'parent_summons' | 'violation_slip', violation: ViolationRecord, student: Student) => void;
}

export const ViolationsView: React.FC<ViolationsViewProps> = ({
  currentUser,
  violations,
  students,
  violationMasters,
  onAddViolation,
  onDeleteViolation,
  onOpenPrintSlip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ViolationCategory>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Violation Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [violationDate, setViolationDate] = useState(new Date().toISOString().substring(0, 10));
  const [violationTime, setViolationTime] = useState('08:30');
  const [violationLocation, setViolationLocation] = useState('Lingkungan Sekolah');
  const [reporterName, setReporterName] = useState(currentUser.name);
  const [reporterRole, setReporterRole] = useState(currentUser.role === 'superadmin' ? 'Kepala Sekolah' : 'Guru BP/BK');
  const [customAction, setCustomAction] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // When master is selected, default action updates
  const handleMasterChange = (masterId: string) => {
    setSelectedMasterId(masterId);
    const found = violationMasters.find((m) => m.id === masterId);
    if (found) {
      setCustomAction(found.defaultAction);
    }
  };

  const handleCreateViolation = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    const master = violationMasters.find((m) => m.id === selectedMasterId);

    if (!student || !master) {
      alert('Pilih siswa dan jenis pelanggaran terlebih dahulu.');
      return;
    }

    onAddViolation({
      studentId: student.id,
      studentName: student.name,
      nisn: student.nisn,
      className: student.className,
      violationMasterId: master.id,
      violationName: master.name,
      category: master.category,
      points: master.points,
      date: violationDate,
      time: violationTime,
      location: violationLocation,
      reporterName,
      reporterRole,
      followUpAction: customAction || master.defaultAction,
      status: master.category === 'berat' ? 'panggilan_ortu' : 'proses',
      parentNotified: false,
      notes: customNotes,
    });

    setIsAddModalOpen(false);
    setSelectedStudentId('');
    setSelectedMasterId('');
    setCustomAction('');
    setCustomNotes('');
  };

  const filteredList = violations.filter((v) => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      v.studentName.toLowerCase().includes(term) ||
      v.nisn.includes(term) ||
      v.className.toLowerCase().includes(term) ||
      v.violationName.toLowerCase().includes(term) ||
      v.category.toLowerCase().includes(term) ||
      v.reporterName.toLowerCase().includes(term) ||
      v.location.toLowerCase().includes(term) ||
      v.followUpAction.toLowerCase().includes(term);
    const matchCat = categoryFilter === 'all' || v.category === categoryFilter;
    const matchClass = classFilter === 'all' || v.className === classFilter;
    return matchSearch && matchCat && matchClass;
  });

  const availableClasses = Array.from(new Set(students.map((s) => s.className))).sort();

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Pencatatan Pelanggaran Kedisiplinan Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan pelanggaran berdasarkan bobot tata tertib resmi SMP Negeri 1 Cijambe, tindak lanjut dan pemberitahuan wali murid
          </p>
        </div>
        {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            + Catat Pelanggaran Siswa
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 min-w-[260px] items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN, kelas, jenis pelanggaran, atau lokasi..."
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

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({violations.length})
            </button>
            <button
              onClick={() => setCategoryFilter('ringan')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                categoryFilter === 'ringan' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ringan
            </button>
            <button
              onClick={() => setCategoryFilter('sedang')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                categoryFilter === 'sedang' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sedang
            </button>
            <button
              onClick={() => setCategoryFilter('berat')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                categoryFilter === 'berat' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Berat
            </button>
          </div>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs p-2 border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="all">Semua Kelas</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>Kelas {cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Violations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Catatan Pelanggaran</p>
            <p className="text-xs text-slate-400 mt-1">Tidak ditemukan data pelanggaran dengan kriteria pencarian saat ini.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Tanggal & Waktu</th>
                    <th className="py-3 px-4 font-semibold">Nama Siswa / NISN</th>
                    <th className="py-3 px-3 font-semibold">Kelas</th>
                    <th className="py-3 px-4 font-semibold">Jenis Pelanggaran</th>
                    <th className="py-3 px-3 font-semibold">Kategori</th>
                    <th className="py-3 px-3 font-semibold text-center">Poin</th>
                    <th className="py-3 px-4 font-semibold">Tindak Lanjut</th>
                    <th className="py-3 px-4 font-semibold text-right">Aksi & Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((item) => {
                    const student = students.find((s) => s.id === item.studentId) || {
                      id: item.studentId,
                      name: item.studentName,
                      nisn: item.nisn,
                      nis: '232400',
                      className: item.className,
                      academicYear: '2026/2027',
                      parentName: 'Wali Murid',
                      parentPhone: '081234567890',
                      address: 'Cijambe, Subang',
                      totalViolationPoints: item.points,
                      totalAchievementPoints: 0,
                      gender: 'L' as const,
                    };

                    const waUrl = generateViolationWhatsAppUrl(student, item, currentUser.name);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{item.date}</div>
                          <div className="text-[11px] text-slate-400">{item.time} WIB</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{item.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">NISN: {item.nisn}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{item.className}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{item.violationName}</div>
                          <div className="text-[11px] text-slate-400">Lokasi: {item.location}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                              item.category === 'berat'
                                ? 'bg-rose-100 text-rose-800'
                                : item.category === 'sedang'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-rose-600 font-mono text-sm">+{item.points}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 line-clamp-1">{item.followUpAction}</div>
                          <div className="text-[11px] text-slate-400">Pelapor: {item.reporterName}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol Kirim WhatsApp */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-medium transition-colors cursor-pointer"
                              title="Kirim WhatsApp ke Orang Tua"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Kirim WA
                            </a>

                            {/* Tombol Cetak PDF */}
                            <button
                              onClick={() => onOpenPrintSlip('violation_statement', item, student)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-medium transition-colors cursor-pointer"
                              title="Cetak Surat Pernyataan / Slip Bukti"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Cetak PDF
                            </button>

                            {/* Hapus Manual (Superadmin / Guru) */}
                            {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus catatan pelanggaran untuk ${item.studentName}?`)) {
                                    onDeleteViolation(item.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Hapus Catatan"
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

            {/* Mobile Card View (Phone-Friendly) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredList.map((item) => {
                const student = students.find((s) => s.id === item.studentId) || {
                  id: item.studentId,
                  name: item.studentName,
                  nisn: item.nisn,
                  nis: '232400',
                  className: item.className,
                  academicYear: '2026/2027',
                  parentName: 'Wali Murid',
                  parentPhone: '081234567890',
                  address: 'Cijambe, Subang',
                  totalViolationPoints: item.points,
                  totalAchievementPoints: 0,
                  gender: 'L' as const,
                };

                const waUrl = generateViolationWhatsAppUrl(student, item, currentUser.name);

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{item.studentName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                            Kelas {item.className}
                          </span>
                          <span>•</span>
                          <span>{item.date} ({item.time})</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold font-mono bg-rose-100 text-rose-700">
                          +{item.points} Poin
                        </span>
                        <div className="mt-1">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                              item.category === 'berat'
                                ? 'bg-rose-600 text-white'
                                : item.category === 'sedang'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="font-semibold text-slate-800">{item.violationName}</div>
                      {item.location && (
                        <div className="text-[11px] text-slate-500">Lokasi: {item.location}</div>
                      )}
                      <div className="text-[11px] text-slate-600 pt-0.5">
                        <strong className="text-slate-700">Tindak Lanjut:</strong> {item.followUpAction}
                      </div>
                      <div className="text-[10px] text-slate-400">Guru Pelapor: {item.reporterName}</div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5 flex-1">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold cursor-pointer border border-emerald-200"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Kirim WA</span>
                        </a>

                        <button
                          onClick={() => onOpenPrintSlip('violation_statement', item, student)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer border border-blue-200"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak PDF</span>
                        </button>
                      </div>

                      {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus catatan pelanggaran untuk ${item.studentName}?`)) {
                              onDeleteViolation(item.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Pelanggaran Manual */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto my-auto">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Catat Pelanggaran Kedisiplinan Baru
            </h3>

            <form onSubmit={handleCreateViolation} className="space-y-4">
              <StudentSearchSelect
                students={students}
                selectedStudentId={selectedStudentId}
                onSelectStudent={(s) => setSelectedStudentId(s ? s.id : '')}
                mode="violation"
                label="Pilih Siswa yang Melanggar"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Pelanggaran Tata Tertib
                </label>
                <select
                  value={selectedMasterId}
                  onChange={(e) => handleMasterChange(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                >
                  <option value="">-- Pilih Jenis Pelanggaran --</option>
                  {violationMasters.map((vm) => (
                    <option key={vm.id} value={vm.id}>
                      [{vm.category.toUpperCase()}] {vm.name} (+{vm.points} Poin)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Kejadian
                  </label>
                  <input
                    type="date"
                    value={violationDate}
                    onChange={(e) => setViolationDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu (WIB)
                  </label>
                  <input
                    type="time"
                    value={violationTime}
                    onChange={(e) => setViolationTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Kejadian
                  </label>
                  <input
                    type="text"
                    value={violationLocation}
                    onChange={(e) => setViolationLocation(e.target.value)}
                    placeholder="Contoh: Toilet Barat, Kantin, Gerbang..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guru Pelapor
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tindakan / Sanksi Kedisiplinan
                </label>
                <input
                  type="text"
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="Sanksi pembinaan atau panggilan orang tua..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Kronologi Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Keterangan singkat saksi atau barang bukti yang diamankan..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Simpan Catatan Pelanggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
