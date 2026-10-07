import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  ExternalLink,
  Award,
  AlertTriangle,
  User,
  HeartHandshake,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Student, AppIdentity } from '../../types';
import { storageService } from '../../services/storageService';

interface StudentQRCodeModalProps {
  student: Student;
  appIdentity?: AppIdentity;
  violationsCount?: number;
  achievementsCount?: number;
  onClose: () => void;
  onOpenFullRecord?: (student: Student) => void;
}

export const StudentQRCodeModal: React.FC<StudentQRCodeModalProps> = ({
  student,
  appIdentity,
  violationsCount = 0,
  achievementsCount = 0,
  onClose,
  onOpenFullRecord,
}) => {
  const identity = appIdentity || storageService.getAppIdentity();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [cardLayout, setCardLayout] = useState<'id_card' | 'sheet'>('id_card');

  // Generate URL that will open the student record directly in the app
  const deepLinkUrl = React.useMemo(() => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?studentId=${encodeURIComponent(student.id)}&nisn=${encodeURIComponent(student.nisn)}`;
  }, [student]);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(deepLinkUrl, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [deepLinkUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
      const input = document.createElement('input');
      input.value = deepLinkUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQrImage = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_Siswa_${student.nisn}_${student.name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Toolbar (hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-400/30 text-blue-300 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm truncate text-white">
                Cetak Kartu & QR Code Profil Siswa
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {student.name} · Kelas {student.className} · NISN: {student.nisn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Layout switch */}
            <div className="hidden md:flex items-center bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setCardLayout('id_card')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  cardLayout === 'id_card' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Kartu ID Saku
              </button>
              <button
                type="button"
                onClick={() => setCardLayout('sheet')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  cardLayout === 'sheet' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lembar Profil Resmi
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Info Bar (Quick Actions, hidden during print) */}
        <div className="no-print bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-medium text-slate-800">Scan QR Code ini</span>
            <span className="text-slate-400">menggunakan kamera ponsel untuk membuka rekam jejak siswa secara instan.</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadQrImage}
              disabled={!qrDataUrl}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Unduh QR (.png)
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Tautan Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Salin Link URL</span>
                </>
              )}
            </button>
            {onOpenFullRecord && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullRecord(student);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka Rekam Jejak
              </button>
            )}
          </div>
        </div>

        {/* Printable Area - Formatted specifically for Clean Card or Sheet Print */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto bg-slate-100/60 flex-1 flex justify-center items-center">
          <div
            id="print-area"
            className="w-full max-w-2xl bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden p-6 sm:p-8 font-sans text-slate-900"
          >
            {/* OFFICIAL SCHOOL HEADER */}
            <div className="flex items-center gap-4 pb-4 border-b-2 border-slate-900 mb-5">
              <img
                src={identity.logoUrl || '/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg'}
                alt={identity.schoolName}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
              />
              <div className="flex-1 text-center">
                <p className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-slate-600">
                  PEMERINTAH DAERAH KABUPATEN SUBANG · DINAS PENDIDIKAN
                </p>
                <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-950 font-serif mt-0.5">
                  {identity.schoolName || 'SMP NEGERI 1 CIJAMBE'}
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-600 font-sans mt-0.5">
                  {identity.address || 'Jl. Raya Cijambe, Desa Cijambe, Kec. Cijambe, Kab. Subang - Jawa Barat 41286'}
                </p>
                <div className="inline-block mt-1.5 px-3 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold tracking-wider uppercase">
                  KARTU IDENTITAS KEDISIPLINAN & QR CODE PROFIL DIGITAL
                </div>
              </div>
              <div className="w-16 sm:w-20 hidden sm:flex flex-col items-center justify-center text-center shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1">SI-BK VALID</span>
              </div>
            </div>

            {/* MAIN CARD BODY: Student Info + High-Resolution QR Code */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left / Info Section (7 cols) */}
              <div className="sm:col-span-7 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0 border border-slate-700">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-950 leading-tight">
                      {student.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-medium">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-bold">
                        Kelas {student.className}
                      </span>
                      <span>·</span>
                      <span>T.A {student.academicYear}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Table Grid */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-medium">Nomor Induk Siswa Nasional (NISN):</span>
                    <span className="font-mono font-bold text-slate-900">{student.nisn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-medium">Nomor Induk Sekolah (NIS):</span>
                    <span className="font-mono font-semibold text-slate-900">{student.nis}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-medium">Orang Tua / Wali Murid:</span>
                    <span className="font-semibold text-slate-900">{student.parentName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-medium">No. Telepon / WhatsApp:</span>
                    <span className="font-mono text-slate-900">{student.parentPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Guru BK / Konselor:</span>
                    <span className="font-semibold text-purple-900">
                      {student.counselorName || 'Siti Rahmawati, S.Pd., Kons.'}
                    </span>
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-rose-700">Akumulasi Pelanggaran</div>
                      <div className="text-lg font-black font-mono text-rose-700">
                        {student.totalViolationPoints} <span className="text-[10px] font-normal text-rose-500">Poin</span>
                      </div>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-rose-500 opacity-80" />
                  </div>

                  <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-700">Poin Prestasi</div>
                      <div className="text-lg font-black font-mono text-amber-700">
                        +{student.totalAchievementPoints} <span className="text-[10px] font-normal text-amber-500">Poin</span>
                      </div>
                    </div>
                    <Award className="w-5 h-5 text-amber-500 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Right / QR Code Display Section (5 cols) */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="relative p-2 bg-white rounded-xl shadow-xs border-2 border-slate-900">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code Profil ${student.name}`}
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center text-slate-400">
                      Membuat QR Code...
                    </div>
                  )}
                  {/* Subtle Badge */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white">
                    SI-BK SMART ACCESS
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
                    Pindai untuk Akses Rekam Jejak
                  </p>
                  <p className="text-[10px] text-slate-500 leading-snug max-w-[210px]">
                    Kamera staf/guru langsung membuka profil lengkap, mutasi, poin pelanggaran & konseling.
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200 w-full flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span>ID: {student.id}</span>
                  <span>·</span>
                  <span>NISN: {student.nisn}</span>
                </div>
              </div>
            </div>

            {/* CARD FOOTER & VALIDATION STAMP */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-[10px] text-slate-500 space-y-0.5 text-center sm:text-left">
                <p>
                  Dokumen identitas digital ini resmi diterbitkan oleh Sistem Informasi BP/BK {identity.schoolName}.
                </p>
                <p>
                  Dicetak pada: <strong>{currentDateFormatted}</strong> · Verifikasi: <strong>AKTIF & SAH</strong>
                </p>
              </div>

              <div className="flex items-center gap-8 text-center">
                <div className="text-[10px] space-y-8">
                  <p className="font-semibold text-slate-700">Wali Kelas / Konselor BK,</p>
                  <p className="font-bold underline text-slate-900">
                    {student.counselorName || 'Siti Rahmawati, S.Pd., Kons.'}
                  </p>
                </div>
                <div className="text-[10px] space-y-8">
                  <p className="font-semibold text-slate-700">Kepala Sekolah,</p>
                  <p className="font-bold underline text-slate-900">
                    {identity.headmasterName || 'Dr. H. Maman Sury, M.Pd.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
