import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  Printer,
  MessageCircle,
  Trash2,
  Calendar,
  Medal,
  Trophy,
} from 'lucide-react';
import {
  AchievementRecord,
  AchievementMaster,
  Student,
  AchievementLevel,
  UserAccount,
} from '../../types';
import { generateAchievementWhatsAppUrl } from '../../utils/whatsapp';
import { StudentSearchSelect } from '../common/StudentSearchSelect';

interface AchievementsViewProps {
  currentUser: UserAccount;
  achievements: AchievementRecord[];
  students: Student[];
  achievementMasters: AchievementMaster[];
  onAddAchievement: (achievement: Omit<AchievementRecord, 'id'>) => void;
  onDeleteAchievement: (id: string) => void;
  onOpenPrintSlip: (type: 'achievement_certificate', achievement: AchievementRecord, student: Student) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  currentUser,
  achievements,
  students,
  achievementMasters,
  onAddAchievement,
  onDeleteAchievement,
  onOpenPrintSlip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | AchievementLevel>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Achievement Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [achievementDate, setAchievementDate] = useState(new Date().toISOString().substring(0, 10));
  const [organizer, setOrganizer] = useState('');
  const [rankAward, setRankAward] = useState('Juara 1');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [recordedBy, setRecordedBy] = useState(currentUser.name);

  const availableClasses = Array.from(new Set(students.map((s) => s.className))).sort();

  const handleCreateAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    const master = achievementMasters.find((m) => m.id === selectedMasterId);

    if (!student || !master) {
      alert('Pilih siswa dan jenis prestasi terlebih dahulu.');
      return;
    }

    onAddAchievement({
      studentId: student.id,
      studentName: student.name,
      nisn: student.nisn,
      className: student.className,
      achievementMasterId: master.id,
      achievementName: master.name,
      category: master.category,
      level: master.level,
      points: master.points,
      date: achievementDate,
      organizer: organizer || 'Dinas Pendidikan & Sekolah',
      rankAward: rankAward || 'Juara 1',
      recordedBy,
      certificateNumber: certificateNumber || `SMPN1-CJB/ACH/${Date.now().toString().slice(-4)}`,
    });

    setIsAddModalOpen(false);
    setSelectedStudentId('');
    setSelectedMasterId('');
    setOrganizer('');
    setRankAward('Juara 1');
    setCertificateNumber('');
  };

  const filteredList = achievements.filter((a) => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      a.studentName.toLowerCase().includes(term) ||
      a.nisn.includes(term) ||
      a.className.toLowerCase().includes(term) ||
      a.achievementName.toLowerCase().includes(term) ||
      a.rankAward.toLowerCase().includes(term) ||
      a.organizer.toLowerCase().includes(term);
    const matchLevel = levelFilter === 'all' || a.level === levelFilter;
    const matchClass = classFilter === 'all' || a.className === classFilter;
    return matchSearch && matchLevel && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Pencatatan Prestasi & Apresiasi Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi kejuaraan akademik, bakat non-akademik, keagamaan, dan kepemimpinan SMP Negeri 1 Cijambe
          </p>
        </div>
        {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            + Catat Prestasi Siswa
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 min-w-[260px] items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN, nama prestasi atau piagam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-hidden text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              levelFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({achievements.length})
          </button>
          <button
            onClick={() => setLevelFilter('sekolah')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              levelFilter === 'sekolah' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sekolah
          </button>
          <button
            onClick={() => setLevelFilter('kecamatan')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              levelFilter === 'kecamatan' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kecamatan
          </button>
          <button
            onClick={() => setLevelFilter('kabupaten')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              levelFilter === 'kabupaten' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kabupaten
          </button>
          <button
            onClick={() => setLevelFilter('provinsi')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              levelFilter === 'provinsi' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Provinsi
          </button>
          <button
            onClick={() => setLevelFilter('nasional')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              levelFilter === 'nasional' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nasional
          </button>
        </div>

        {/* Class Filter */}
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="text-xs p-2 border border-slate-200 rounded-lg bg-white text-slate-700 cursor-pointer"
        >
          <option value="all">Semua Kelas</option>
          {availableClasses.map((cls) => (
            <option key={cls} value={cls}>Kelas {cls}</option>
          ))}
        </select>
      </div>

      {/* Achievements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Catatan Prestasi</p>
            <p className="text-xs text-slate-400 mt-1">Belum ada data prestasi dengan kriteria pencarian ini.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Tanggal</th>
                    <th className="py-3 px-4 font-semibold">Nama Siswa / NISN</th>
                    <th className="py-3 px-3 font-semibold">Kelas</th>
                    <th className="py-3 px-4 font-semibold">Prestasi / Kejuaraan</th>
                    <th className="py-3 px-3 font-semibold">Tingkat</th>
                    <th className="py-3 px-3 font-semibold text-center">Poin Apresiasi</th>
                    <th className="py-3 px-4 font-semibold">Penyelenggara</th>
                    <th className="py-3 px-4 font-semibold text-right">Aksi & Sertifikat</th>
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
                      totalViolationPoints: 0,
                      totalAchievementPoints: item.points,
                      gender: 'P' as const,
                    };

                    const waUrl = generateAchievementWhatsAppUrl(student, item, currentUser.name);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800">{item.date}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{item.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">NISN: {item.nisn}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{item.className}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-amber-900">{item.rankAward}</div>
                          <div className="text-slate-800">{item.achievementName}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                            {item.level}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-amber-600 font-mono text-sm">+{item.points}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-700">{item.organizer}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.certificateNumber || 'Tersertifikasi'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol Kirim WhatsApp */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-medium transition-colors cursor-pointer"
                              title="Kirim Ucapan Selamat ke Orang Tua via WA"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Kirim WA
                            </a>

                            {/* Tombol Cetak PDF Piagam */}
                            <button
                              onClick={() => onOpenPrintSlip('achievement_certificate', item, student)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md font-medium transition-colors cursor-pointer"
                              title="Cetak Piagam / Bukti Prestasi"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Cetak Piagam
                            </button>

                            {/* Hapus Manual (Superadmin / Guru) */}
                            {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus catatan prestasi untuk ${item.studentName}?`)) {
                                    onDeleteAchievement(item.id);
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
                  totalViolationPoints: 0,
                  totalAchievementPoints: item.points,
                  gender: 'P' as const,
                };

                const waUrl = generateAchievementWhatsAppUrl(student, item, currentUser.name);

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{item.studentName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                            Kelas {item.className}
                          </span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold font-mono bg-amber-100 text-amber-800">
                          +{item.points} Poin
                        </span>
                        <div className="mt-1">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-amber-600 text-white">
                            {item.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-950">{item.rankAward} - {item.achievementName}</div>
                      <div className="text-[11px] text-slate-600">Penyelenggara: {item.organizer}</div>
                      {item.certificateNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">No. Piagam: {item.certificateNumber}</div>
                      )}
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
                          onClick={() => onOpenPrintSlip('achievement_certificate', item, student)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-semibold cursor-pointer border border-amber-200"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Piagam PDF</span>
                        </button>
                      </div>

                      {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus catatan prestasi untuk ${item.studentName}?`)) {
                              onDeleteAchievement(item.id);
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

      {/* Modal Tambah Prestasi */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto my-auto">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Catat Prestasi Baru Siswa
            </h3>

            <form onSubmit={handleCreateAchievement} className="space-y-4">
              <StudentSearchSelect
                students={students}
                selectedStudentId={selectedStudentId}
                onSelectStudent={(s) => setSelectedStudentId(s ? s.id : '')}
                mode="achievement"
                label="Pilih Siswa Berprestasi"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Jenis Prestasi Standar
                </label>
                <select
                  value={selectedMasterId}
                  onChange={(e) => setSelectedMasterId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  required
                >
                  <option value="">-- Pilih Jenis Prestasi --</option>
                  {achievementMasters.map((am) => (
                    <option key={am.id} value={am.id}>
                      [{am.level.toUpperCase()}] {am.name} (+{am.points} Poin)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peringkat / Penghargaan Diraih
                  </label>
                  <input
                    type="text"
                    value={rankAward}
                    onChange={(e) => setRankAward(e.target.value)}
                    placeholder="Contoh: Juara 1, Medali Perak, Harapan 2..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Kejuaraan
                  </label>
                  <input
                    type="date"
                    value={achievementDate}
                    onChange={(e) => setAchievementDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penyelenggara Kegiatan
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="Contoh: Disdikbud Subang, Kemenag, MGMP..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Piagam / Sertifikat (Opsional)
                  </label>
                  <input
                    type="text"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    placeholder="Contoh: 421.3/872-Disdik/2026"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Simpan Catatan Prestasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
