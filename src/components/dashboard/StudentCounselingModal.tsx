import React, { useState, useMemo } from 'react';
import {
  X,
  User,
  AlertTriangle,
  Award,
  Calendar,
  MessageCircle,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  Phone,
  Home,
  ShieldAlert,
  Search,
  HeartHandshake,
  QrCode,
} from 'lucide-react';
import { Student, CounselingRecord, ViolationRecord, AchievementRecord, UserAccount } from '../../types';
import { storageService } from '../../services/storageService';
import { generateSummonsWhatsAppUrl, formatWhatsAppNumber } from '../../utils/whatsapp';
import { StudentQRCodeModal } from '../qrcode/StudentQRCodeModal';

interface StudentCounselingModalProps {
  student: Student;
  counselingHistory: CounselingRecord[];
  violations: ViolationRecord[];
  achievements: AchievementRecord[];
  counselors?: UserAccount[];
  onClose: () => void;
  onAddCounseling: (newRecord: Omit<CounselingRecord, 'id'>) => void;
  onOpenPrintSlip: (type: 'parent_summons' | 'violation_statement', violation?: ViolationRecord) => void;
  onAssignCounselor?: (
    studentId: string,
    counselor: { id: string; name: string; nip?: string; phone?: string } | null
  ) => void;
}

export const StudentCounselingModal: React.FC<StudentCounselingModalProps> = ({
  student,
  counselingHistory,
  violations,
  achievements,
  counselors,
  onClose,
  onAddCounseling,
  onOpenPrintSlip,
  onAssignCounselor,
}) => {
  const [activeTab, setActiveTab] = useState<'counseling' | 'violations' | 'achievements' | 'new_counseling'>('counseling');
  const [violationSearch, setViolationSearch] = useState('');
  const [achievementSearch, setAchievementSearch] = useState('');
  const [isChangeCounselorOpen, setIsChangeCounselorOpen] = useState(false);
  const [targetCounselorId, setTargetCounselorId] = useState(student.counselorId || '');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Available counselors
  const availableCounselors = useMemo(() => {
    if (counselors && counselors.length > 0) {
      return counselors.filter((u) => u.role === 'guru' || u.role === 'superadmin');
    }
    return storageService.getUsers().filter((u) => u.role === 'guru' || u.role === 'superadmin');
  }, [counselors]);

  // New Counseling Form state
  const [counselorName, setCounselorName] = useState(
    student.counselorName || 'Siti Rahmawati, S.Pd., Kons.'
  );
  const [counselingDate, setCounselingDate] = useState(new Date().toISOString().substring(0, 10));
  const [counselingType, setCounselingType] = useState<CounselingRecord['type']>('individu');
  const [issueDescription, setIssueDescription] = useState('');
  const [approachMethod, setApproachMethod] = useState('');
  const [resultFollowUp, setResultFollowUp] = useState('');
  const [counselingStatus, setCounselingStatus] = useState<CounselingRecord['status']>('dalam_pemantauan');
  const [nextAppointment, setNextAppointment] = useState('');

  const handleSaveCounseling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription || !resultFollowUp) {
      alert('Mohon isi deskripsi masalah dan hasil tindak lanjut konseling.');
      return;
    }
    onAddCounseling({
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      counselorName,
      date: counselingDate,
      type: counselingType,
      issueDescription,
      approachMethod: approachMethod || 'Konseling Individual & Kontrak Perilaku',
      resultFollowUp,
      status: counselingStatus,
      nextAppointmentDate: nextAppointment || undefined,
    });
    setActiveTab('counseling');
  };

  const getRiskBadge = (points: number) => {
    if (points >= 75) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
          Status Kritis ({points} Poin)
        </span>
      );
    }
    if (points >= 50) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
          Peringatan II ({points} Poin)
        </span>
      );
    }
    if (points >= 25) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold text-amber-600 bg-amber-50/70 border border-amber-100 rounded-md">
          Peringatan I ({points} Poin)
        </span>
      );
    }
    if (points >= 10) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
          Perlu Pemantauan ({points} Poin)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
        Aman / Disiplin ({points} Poin)
      </span>
    );
  };

  const handleWhatsAppOrtu = () => {
    const url = generateSummonsWhatsAppUrl(student, 'Segera / Jadwal Terbuka', '09.00', 'Siti Rahmawati, S.Pd., Kons.');
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-start justify-between border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-base sm:text-xl shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h3 className="text-base sm:text-xl font-bold tracking-tight text-white truncate">{student.name}</h3>
                {getRiskBadge(student.totalViolationPoints)}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 mt-1 flex-wrap">
                <span>Kelas {student.className}</span>
                <span>·</span>
                <span>NISN: {student.nisn}</span>
                <span>·</span>
                <span>NIS: {student.nis}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Contact & Action Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Wali: <strong>{student.parentName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>WA: <strong className="font-mono">{student.parentPhone}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer text-xs"
              title="Cetak Kartu & QR Code Siswa"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-200" />
              Cetak QR
            </button>
            <button
              onClick={handleWhatsAppOrtu}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors cursor-pointer text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Kirim WA Wali
            </button>
            <button
              onClick={() => onOpenPrintSlip('parent_summons', violations[0])}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors cursor-pointer text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              Surat Panggilan
            </button>
          </div>
        </div>

        {/* Guru BK / Konselor Pendamping Banner */}
        <div className="bg-purple-50/70 border-b border-purple-100 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-purple-950">
            <HeartHandshake className="w-4 h-4 text-purple-600 shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-600 font-medium">Guru BK / Konselor Pendamping:</span>
              {student.counselorName ? (
                <span className="font-bold text-purple-900 bg-white border border-purple-200 px-2 py-0.5 rounded-md">
                  {student.counselorName} {student.counselorNip ? `(NIP: ${student.counselorNip})` : ''}
                </span>
              ) : (
                <span className="font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                  Belum Ditugaskan
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {student.counselorPhone && (
              <a
                href={`https://wa.me/${student.counselorPhone.replace(/^0/, '62').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-200 px-2.5 py-1 rounded-md font-medium"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                WA Konselor
              </a>
            )}
            {onAssignCounselor && (
              <button
                type="button"
                onClick={() => {
                  setTargetCounselorId(student.counselorId || '');
                  setIsChangeCounselorOpen(true);
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-white hover:bg-purple-100 border border-purple-200 rounded-md transition-colors cursor-pointer"
              >
                {student.counselorName ? 'Ubah Konselor' : '+ Hubungkan Konselor'}
              </button>
            )}
          </div>
        </div>

        {/* Modal Popover Ganti Konselor Langsung di Profil */}
        {isChangeCounselorOpen && (
          <div className="p-3.5 bg-white border-b border-purple-200 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex-1">
              <label className="block text-slate-700 font-semibold mb-1">
                Pilih Guru BK / Konselor Pendamping:
              </label>
              <select
                value={targetCounselorId}
                onChange={(e) => setTargetCounselorId(e.target.value)}
                className="w-full sm:max-w-md text-xs p-2 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option value="">-- Belum Ditugaskan / Hapus Penugasan --</option>
                {availableCounselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.nipOrNisn ? `(NIP: ${c.nipOrNisn})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsChangeCounselorOpen(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!targetCounselorId) {
                    if (onAssignCounselor) onAssignCounselor(student.id, null);
                  } else {
                    const c = availableCounselors.find((item) => item.id === targetCounselorId);
                    if (c && onAssignCounselor) {
                      onAssignCounselor(student.id, {
                        id: c.id,
                        name: c.name,
                        nip: c.nipOrNisn,
                        phone: c.phone,
                      });
                    }
                  }
                  setIsChangeCounselorOpen(false);
                }}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Simpan Konselor
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-3 sm:px-6 bg-white gap-2 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('counseling')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'counseling'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Riwayat Konseling ({counselingHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'violations'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Pelanggaran ({violations.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'achievements'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            Prestasi ({achievements.length})
          </button>
          <button
            onClick={() => setActiveTab('new_counseling')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'new_counseling'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            Catat Konseling Baru
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {activeTab === 'counseling' && (
            <div className="space-y-4">
              {counselingHistory.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada riwayat konseling</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Siswa ini belum pernah menjalani sesi bimbingan formal. Anda dapat menambahkan catatan konseling pertama sekarang.
                  </p>
                  <button
                    onClick={() => setActiveTab('new_counseling')}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    + Buat Sesi Bimbingan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {counselingHistory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              Konseling {item.type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-500">
                              {item.date}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                            {item.issueDescription}
                          </h4>
                        </div>
                        <div>
                          <span
                            className={`text-xs px-2.5 py-1 rounded font-medium ${
                              item.status === 'selesai'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.status === 'selesai' ? 'Selesai' : 'Dalam Pemantauan'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-slate-500 font-medium">Pendekatan / Metode:</span>
                          <p className="text-slate-800 mt-0.5">{item.approachMethod}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Hasil & Tindak Lanjut:</span>
                          <p className="text-slate-800 mt-0.5">{item.resultFollowUp}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 mt-3 border-t border-slate-100">
                        <span>Konselor: <strong>{item.counselorName}</strong></span>
                        {item.nextAppointmentDate && (
                          <span className="text-blue-700 font-medium">
                            Jadwal Tindak Lanjut: {item.nextAppointmentDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'violations' && (
            <div className="space-y-3">
              {violations.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari riwayat pelanggaran berdasarkan jenis, kategori, atau tanggal..."
                    value={violationSearch}
                    onChange={(e) => setViolationSearch(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-hidden text-slate-800"
                  />
                  {violationSearch && (
                    <button
                      onClick={() => setViolationSearch('')}
                      className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              )}

              {violations.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Catatan Pelanggaran Bersih</p>
                  <p className="text-xs text-slate-400 mt-1">Siswa ini tidak memiliki riwayat pelanggaran tata tertib.</p>
                </div>
              ) : (
                violations
                  .filter((v) => {
                    if (!violationSearch.trim()) return true;
                    const term = violationSearch.toLowerCase();
                    return (
                      v.violationName.toLowerCase().includes(term) ||
                      v.category.toLowerCase().includes(term) ||
                      v.date.includes(term) ||
                      v.followUpAction.toLowerCase().includes(term)
                    );
                  })
                  .map((v) => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                            v.category === 'berat' ? 'bg-rose-100 text-rose-800' : v.category === 'sedang' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {v.category}
                          </span>
                          <span className="text-xs text-slate-500">{v.date} · {v.time} WIB</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{v.violationName}</p>
                        <p className="text-xs text-slate-600 mt-0.5">Tindak lanjut: {v.followUpAction}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-rose-600 font-mono">+{v.points} Poin</span>
                        <div className="mt-2 flex items-center gap-1 justify-end">
                          <button
                            onClick={() => onOpenPrintSlip('violation_statement', v)}
                            className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium cursor-pointer"
                          >
                            Cetak Slip
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-3">
              {achievements.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari riwayat prestasi berdasarkan nama kejuaraan, tingkat, atau penyelenggara..."
                    value={achievementSearch}
                    onChange={(e) => setAchievementSearch(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-hidden text-slate-800"
                  />
                  {achievementSearch && (
                    <button
                      onClick={() => setAchievementSearch('')}
                      className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              )}

              {achievements.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada catatan prestasi</p>
                  <p className="text-xs text-slate-400 mt-1">Dukung siswa untuk aktif dalam bidang akademik dan bakat minat.</p>
                </div>
              ) : (
                achievements
                  .filter((a) => {
                    if (!achievementSearch.trim()) return true;
                    const term = achievementSearch.toLowerCase();
                    return (
                      a.achievementName.toLowerCase().includes(term) ||
                      a.rankAward.toLowerCase().includes(term) ||
                      a.level.toLowerCase().includes(term) ||
                      a.organizer.toLowerCase().includes(term) ||
                      a.date.includes(term)
                    );
                  })
                  .map((a) => (
                    <div key={a.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-800">
                            {a.level}
                          </span>
                          <span className="text-xs text-slate-500">{a.date}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{a.achievementName}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{a.rankAward} · {a.organizer}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-amber-600 font-mono">+{a.points} Poin</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'new_counseling' && (
            <form onSubmit={handleSaveCounseling} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Formulir Catatan Bimbingan & Konseling
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Guru Konselor / BP-BK
                  </label>
                  <input
                    type="text"
                    value={counselorName}
                    onChange={(e) => setCounselorName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    value={counselingDate}
                    onChange={(e) => setCounselingDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Layanan Bimbingan
                  </label>
                  <select
                    value={counselingType}
                    onChange={(e) => setCounselingType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="individu">Konseling Individu</option>
                    <option value="kelompok">Bimbingan Kelompok</option>
                    <option value="panggilan_wali">Panggilan Orang Tua / Wali</option>
                    <option value="konferensi_kasus">Konferensi Kasus (Case Conference)</option>
                    <option value="bimbingan_karir">Bimbingan Studi Lanjut / Karir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Kasus
                  </label>
                  <select
                    value={counselingStatus}
                    onChange={(e) => setCounselingStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="dalam_pemantauan">Dalam Pemantauan</option>
                    <option value="selesai">Kasus Selesai (Tuntas)</option>
                    <option value="terjadwal">Terjadwal Tindak Lanjut</option>
                    <option value="rujukan">Alih Tangan Kasus / Rujukan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Pokok Masalah / Keluhan
                </label>
                <textarea
                  rows={2}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Contoh: Sering terlambat dan tidak fokus di kelas, terindikasi pengaruh rokok/vape..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pendekatan / Teknik Konseling yang Diterapkan
                </label>
                <input
                  type="text"
                  value={approachMethod}
                  onChange={(e) => setApproachMethod(e.target.value)}
                  placeholder="Contoh: Reality Therapy, Behavior Contract, Self-Management..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hasil Konseling & Rencana Tindak Lanjut
                </label>
                <textarea
                  rows={2}
                  value={resultFollowUp}
                  onChange={(e) => setResultFollowUp(e.target.value)}
                  placeholder="Kesepakatan siswa, komitmen tertulis, pemantauan berkala..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jadwal Pertemuan Lanjutan (Opsional)
                </label>
                <input
                  type="date"
                  value={nextAppointment}
                  onChange={(e) => setNextAppointment(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('counseling')}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Simpan Catatan Konseling
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {isQrModalOpen && (
        <StudentQRCodeModal
          student={student}
          violationsCount={violations.length}
          achievementsCount={achievements.length}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
    </div>
  );
};
