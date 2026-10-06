import React, { useState } from 'react';
import {
  User,
  ShieldAlert,
  Award,
  HeartHandshake,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Search,
} from 'lucide-react';
import {
  Student,
  ViolationRecord,
  AchievementRecord,
  CounselingRecord,
  UserAccount,
} from '../../types';
import { formatWhatsAppNumber } from '../../utils/whatsapp';

interface StudentPortalViewProps {
  currentUser: UserAccount;
  student: Student;
  violations: ViolationRecord[];
  achievements: AchievementRecord[];
  counselingRecords: CounselingRecord[];
  onOpenPrintSlip: (type: 'violation_statement' | 'achievement_certificate', violation?: ViolationRecord, achievement?: AchievementRecord) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentUser,
  student,
  violations,
  achievements,
  counselingRecords,
  onOpenPrintSlip,
}) => {
  const isGuardian = currentUser.role === 'wali_murid';
  const [violationSearch, setViolationSearch] = useState('');

  // Counselor phone for consultation
  const counselorPhone = '6285798765432';
  const counselorChatUrl = `https://wa.me/${counselorPhone}?text=${encodeURIComponent(
    `Halo Ibu Siti Rahmawati, S.Pd., Kons. (Guru BP/BK SMPN 1 Cijambe), saya ${currentUser.name} (${
      isGuardian ? 'Orang Tua / Wali dari ' + student.name : 'Siswa kelas ' + student.className
    }) ingin berkonsultasi mengenai bimbingan konseling dan perkembangan di sekolah.`
  )}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Student Profile Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-2xl">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
                {isGuardian ? 'Portal Wali Murid' : 'Buku Catatan Siswa'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Kelas {student.className}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">{student.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
              <span>NISN: {student.nisn}</span>
              <span>·</span>
              <span>Wali: {student.parentName}</span>
              <span>·</span>
              <span>T.A {student.academicYear}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={counselorChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi Guru BP/BK via WhatsApp
          </a>
        </div>
      </div>

      {/* Points & Character Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Violation Points */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Akumulasi Poin Pelanggaran</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 font-mono tabular-nums">
              {student.totalViolationPoints}
            </span>
            <span className="text-xs text-slate-400">/ 100 Poin Maksimal</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {student.totalViolationPoints === 0
              ? 'Luar biasa! Rekam kedisiplinan sangat baik tanpa pelanggaran.'
              : student.totalViolationPoints < 25
              ? 'Tercatat pelanggaran ringan. Pertahankan kepatuhan tata tertib.'
              : student.totalViolationPoints < 50
              ? 'Perlu pemantauan bersama orang tua agar poin tidak bertambah.'
              : 'Status Peringatan. Perlu bimbingan intensif Guru BK dan Wali Kelas.'}
          </p>
        </div>

        {/* Achievement Points */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Poin Apresiasi Prestasi</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 font-mono tabular-nums">
              +{student.totalAchievementPoints}
            </span>
            <span className="text-xs text-slate-400">Poin Karakter Positif</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {achievements.length} penghargaan & kejuaraan berhasil diraih di SMP Negeri 1 Cijambe.
          </p>
        </div>

        {/* Counseling & Guidance Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Status Pembinaan BK</span>
            <HeartHandshake className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-sm font-bold px-2.5 py-1 rounded-md ${
                student.totalViolationPoints >= 75
                  ? 'bg-rose-100 text-rose-800'
                  : student.totalViolationPoints >= 50
                  ? 'bg-amber-100 text-amber-800'
                  : student.totalViolationPoints >= 25
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {student.totalViolationPoints >= 75
                ? 'Intervensi Kasus Khusus'
                : student.totalViolationPoints >= 50
                ? 'Peringatan Tahap II'
                : student.totalViolationPoints >= 25
                ? 'Bimbingan Peringatan I'
                : 'Berkelakuan Baik & Terbina'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Guru BK: Siti Rahmawati, S.Pd., Kons.
          </p>
        </div>
      </div>

      {/* Riwayat Pelanggaran & Prestasi Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Catatan Pelanggaran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catatan Pelanggaran Tata Tertib</h3>
              <p className="text-xs text-slate-500">Transparansi kedisiplinan siswa di sekolah</p>
            </div>
            <span className="text-xs font-mono font-semibold text-rose-600">
              {violations.length} Catatan
            </span>
          </div>

          <div className="space-y-3">
            {violations.length > 0 && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari riwayat pelanggaran..."
                  value={violationSearch}
                  onChange={(e) => setViolationSearch(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-hidden text-slate-800 text-xs"
                />
                {violationSearch && (
                  <button
                    onClick={() => setViolationSearch('')}
                    className="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </div>
            )}

            {violations.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Tidak Ada Pelanggaran</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Siswa tertib mematuhi tata tertib sekolah.</p>
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
                <div key={v.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{v.violationName}</span>
                    <span className="font-bold text-rose-600 font-mono">+{v.points} Poin</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>{v.date} ({v.time} WIB)</span>
                    <span>·</span>
                    <span className="capitalize font-semibold text-slate-700">Kategori {v.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 bg-white p-1.5 rounded border border-slate-100">
                    Tindak Lanjut: {v.followUpAction}
                  </p>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => onOpenPrintSlip('violation_statement', v)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      Lihat Surat Pernyataan &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Catatan Prestasi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catatan Prestasi & Apresiasi</h3>
              <p className="text-xs text-slate-500">Capaian membanggakan ananda</p>
            </div>
            <span className="text-xs font-mono font-semibold text-amber-600">
              {achievements.length} Prestasi
            </span>
          </div>

          <div className="space-y-3">
            {achievements.length === 0 ? (
              <div className="text-center py-10">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Belum Ada Catatan Prestasi</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Dukung ananda untuk aktif berkompetisi dan berprestasi.</p>
              </div>
            ) : (
              achievements.map((a) => (
                <div key={a.id} className="p-3 bg-amber-50/40 rounded-lg border border-amber-200/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">{a.rankAward}</span>
                    <span className="font-bold text-amber-600 font-mono">+{a.points} Poin</span>
                  </div>
                  <p className="font-medium text-slate-800 mt-0.5">{a.achievementName}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>{a.date}</span>
                    <span>·</span>
                    <span>Tingkat {a.level.toUpperCase()}</span>
                    <span>·</span>
                    <span>{a.organizer}</span>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => onOpenPrintSlip('achievement_certificate', undefined, a)}
                      className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold cursor-pointer"
                    >
                      Lihat Piagam Apresiasi &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Riwayat Sesi Konseling & Pembimbingan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Histori Sesi Bimbingan & Konseling Bersama Guru BP/BK
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Catatan perkembangan kepribadian, pembentukan karakter, dan konsultasi di sekolah
        </p>

        <div className="space-y-3">
          {counselingRecords.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Belum ada catatan konseling formal khusus. Hubungi Guru BP/BK jika memerlukan konsultasi.
            </div>
          ) : (
            counselingRecords.map((cr) => (
              <div key={cr.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    Sesi Bimbingan ({cr.type.replace('_', ' ').toUpperCase()})
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{cr.date}</span>
                </div>
                <p className="text-slate-700 mt-1"><strong>Masalah/Topik:</strong> {cr.issueDescription}</p>
                <p className="text-slate-700 mt-1"><strong>Hasil & Komitmen:</strong> {cr.resultFollowUp}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                  <span>Konselor: {cr.counselorName}</span>
                  <span className="text-emerald-700 font-medium">Status: {cr.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
