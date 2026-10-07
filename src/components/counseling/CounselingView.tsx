import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { CounselingRecord, Student, UserAccount } from '../../types';
import { generateSummonsWhatsAppUrl } from '../../utils/whatsapp';
import { StudentSearchSelect } from '../common/StudentSearchSelect';

interface CounselingViewProps {
  currentUser: UserAccount;
  counselingRecords: CounselingRecord[];
  students: Student[];
  onAddCounseling: (record: Omit<CounselingRecord, 'id'>) => void;
  onUpdateStatus: (id: string, newStatus: CounselingRecord['status']) => void;
  onSelectStudentProfile: (student: Student) => void;
}

export const CounselingView: React.FC<CounselingViewProps> = ({
  currentUser,
  counselingRecords,
  students,
  onAddCounseling,
  onUpdateStatus,
  onSelectStudentProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CounselingRecord['status']>('all');
  const [onlyMyAssigned, setOnlyMyAssigned] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Counseling Form
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [counselorName, setCounselorName] = useState(currentUser.name);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [type, setType] = useState<CounselingRecord['type']>('individu');
  const [issueDescription, setIssueDescription] = useState('');
  const [approachMethod, setApproachMethod] = useState('');
  const [resultFollowUp, setResultFollowUp] = useState('');
  const [status, setStatus] = useState<CounselingRecord['status']>('dalam_pemantauan');
  const [nextAppointmentDate, setNextAppointmentDate] = useState('');

  const handleCreateCounseling = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) {
      alert('Pilih siswa terlebih dahulu.');
      return;
    }

    onAddCounseling({
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      counselorName,
      date,
      type,
      issueDescription,
      approachMethod: approachMethod || 'Konseling Individual & Kontrak Komitmen',
      resultFollowUp,
      status,
      nextAppointmentDate: nextAppointmentDate || undefined,
    });

    setIsAddModalOpen(false);
    setSelectedStudentId('');
    setIssueDescription('');
    setApproachMethod('');
    setResultFollowUp('');
  };

  const filteredList = counselingRecords.filter((item) => {
    const matchSearch =
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.counselorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;

    let matchAssigned = true;
    if (onlyMyAssigned && currentUser?.role === 'guru') {
      const student = students.find((s) => s.id === item.studentId);
      matchAssigned =
        item.counselorName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        student?.counselorId === currentUser.id;
    }

    return matchSearch && matchStatus && matchAssigned;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Layanan Bimbingan & Konseling (BP/BK)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendampingan psikologis, akademik, dan perilaku siswa SMP Negeri 1 Cijambe secara berkesinambungan
          </p>
        </div>
        {(currentUser.role === 'superadmin' || currentUser.role === 'guru') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            + Buat Sesi Bimbingan
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 min-w-[260px] items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari siswa, topik masalah, atau nama guru konselor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-hidden text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({counselingRecords.length})
          </button>
          <button
            onClick={() => setStatusFilter('dalam_pemantauan')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              statusFilter === 'dalam_pemantauan' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dalam Pemantauan
          </button>
          <button
            onClick={() => setStatusFilter('selesai')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              statusFilter === 'selesai' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai
          </button>
          {currentUser.role === 'guru' && (
            <button
              onClick={() => setOnlyMyAssigned(!onlyMyAssigned)}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                onlyMyAssigned
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-purple-700 hover:text-purple-900 bg-purple-50'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Siswa Binaan Saya
            </button>
          )}
        </div>
      </div>

      {/* Counseling Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-xl border border-slate-200">
            <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Catatan Bimbingan</p>
            <p className="text-xs text-slate-400 mt-1">Belum ada sesi bimbingan yang sesuai filter.</p>
          </div>
        ) : (
          filteredList.map((item) => {
            const student = students.find((s) => s.id === item.studentId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                          {item.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">{item.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        {item.studentName} ({item.className})
                      </h4>
                    </div>

                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                      className="text-[11px] font-medium p-1 rounded border border-slate-200 bg-slate-50 text-slate-700"
                    >
                      <option value="dalam_pemantauan">Dalam Pemantauan</option>
                      <option value="selesai">Selesai (Tuntas)</option>
                      <option value="terjadwal">Terjadwal</option>
                      <option value="rujukan">Alih Tangan Kasus</option>
                    </select>
                  </div>

                  <div className="space-y-2 my-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700">Pokok Masalah:</span>
                      <p className="text-slate-600 mt-0.5 bg-slate-50 p-2 rounded border border-slate-100">
                        {item.issueDescription}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Hasil & Tindak Lanjut:</span>
                      <p className="text-slate-800 mt-0.5">{item.resultFollowUp}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Konselor: <strong>{item.counselorName}</strong></span>
                  {student && (
                    <button
                      onClick={() => onSelectStudentProfile(student)}
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      Buka Profil Lengkap &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Counseling */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 overflow-hidden">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-blue-600" />
              Buat Sesi Bimbingan & Konseling
            </h3>

            <form onSubmit={handleCreateCounseling} className="space-y-4">
              <StudentSearchSelect
                students={students}
                selectedStudentId={selectedStudentId}
                onSelectStudent={(s) => {
                  if (s) {
                    setSelectedStudentId(s.id);
                    if (s.counselorName) {
                      setCounselorName(s.counselorName);
                    }
                  } else {
                    setSelectedStudentId('');
                  }
                }}
                mode="counseling"
                label="Pilih Siswa Konseli"
                required
              />

              {selectedStudentId && (() => {
                const s = students.find((std) => std.id === selectedStudentId);
                return s?.counselorName ? (
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>
                      Konselor Pendamping Terdaftar: <strong>{s.counselorName}</strong>
                    </span>
                  </div>
                ) : null;
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Layanan Bimbingan
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="individu">Konseling Individu</option>
                    <option value="kelompok">Bimbingan Kelompok</option>
                    <option value="panggilan_wali">Panggilan Orang Tua / Wali</option>
                    <option value="konferensi_kasus">Konferensi Kasus (Case Conference)</option>
                    <option value="bimbingan_karir">Bimbingan Minat & Karir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Sesi
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
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
                  placeholder="Jelaskan dinamika masalah, faktor pemicu..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pendekatan / Terapi Konseling
                </label>
                <input
                  type="text"
                  value={approachMethod}
                  onChange={(e) => setApproachMethod(e.target.value)}
                  placeholder="Contoh: Realitas, Solution-Focused Brief Therapy (SFBT), Behavior Contract"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hasil Konseling & Tindak Lanjut Nyata
                </label>
                <textarea
                  rows={2}
                  value={resultFollowUp}
                  onChange={(e) => setResultFollowUp(e.target.value)}
                  placeholder="Komitmen perubahan siswa, tugas rumah, koordinasi orang tua..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
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
                  Simpan Sesi Konseling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
