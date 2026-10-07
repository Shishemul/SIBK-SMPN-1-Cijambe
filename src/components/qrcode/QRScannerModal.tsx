import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Search,
  Scan,
  CheckCircle2,
  AlertCircle,
  QrCode,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { Student } from '../../types';

interface QRScannerModalProps {
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  students,
  isOpen,
  onClose,
  onSelectStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedStudent, setDetectedStudent] = useState<Student | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera when camera tab is active
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCamera();
      return;
    }

    let isCancelled = false;
    const startCamera = async () => {
      try {
        setCameraError(null);
        setIsScanning(true);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Kamera tidak didukung pada browser ini.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Camera access issue:', err);
          setCameraError(
            err.name === 'NotAllowedError'
              ? 'Izin kamera ditolak. Silakan gunakan pencarian NISN / Nama di bawah.'
              : 'Tidak dapat mengakses kamera pada lingkungan ini. Gunakan pencarian manual.'
          );
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualLookup = (term: string) => {
    const cleaned = term.trim().toLowerCase();
    if (!cleaned) return;

    // Check if query is a URL with studentId or nisn
    let targetId = '';
    let targetNisn = '';
    if (cleaned.includes('studentid=') || cleaned.includes('nisn=')) {
      try {
        const url = new URL(term.trim().startsWith('http') ? term.trim() : `http://dummy.com/${term.trim()}`);
        targetId = url.searchParams.get('studentId') || '';
        targetNisn = url.searchParams.get('nisn') || '';
      } catch {
        // ignore
      }
    }

    const found = students.find((s) => {
      if (targetId && s.id === targetId) return true;
      if (targetNisn && s.nisn === targetNisn) return true;
      return (
        s.nisn.toLowerCase() === cleaned ||
        s.nis.toLowerCase() === cleaned ||
        s.id.toLowerCase() === cleaned ||
        s.name.toLowerCase().includes(cleaned)
      );
    });

    if (found) {
      setDetectedStudent(found);
    }
  };

  const handleConfirmSelect = (s: Student) => {
    stopCamera();
    onClose();
    onSelectStudent(s);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 border border-blue-400/30 text-blue-300 rounded-lg">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Pindai / Scan QR Code Siswa</h3>
              <p className="text-[11px] text-slate-400">
                Akses cepat rekam jejak kedisiplinan & bimbingan siswa
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'camera'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            Pemindai Kamera
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            Cari NISN / Nama Siswa
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-4/3 w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-800">
                {cameraError ? (
                  <div className="p-6 text-center text-slate-400 max-w-xs space-y-2">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-200">{cameraError}</p>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-block cursor-pointer"
                    >
                      Beralih ke Input Manual &rarr;
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Viewfinder Overlay with Animated Scanning Line */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-dashed border-blue-400 rounded-xl relative shadow-2xl">
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl opacity-40"></div>
                        <div className="w-full h-0.5 bg-blue-400 absolute top-1/2 left-0 animate-pulse shadow-[0_0_8px_#38bdf8]"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 inset-x-0 text-center">
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-3 py-1 rounded-full font-medium border border-slate-700">
                        Arahkan kamera ke QR Code di Kartu Siswa
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Quick test selector for instant camera simulation */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Simulasi Pindai Cepat Siswa:
                  </span>
                  <span className="text-[10px] text-slate-400">Klik untuk uji hasil scan</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {students.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleConfirmSelect(s)}
                      className="text-left p-2 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-1">
                        <div className="font-bold text-slate-900 truncate text-[11px] group-hover:text-blue-700">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {s.className} · {s.nisn}
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MANUAL LOOKUP TAB */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Masukkan NISN, NIS, Nama Siswa, atau Tautan QR:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleManualLookup(e.target.value);
                    }}
                    placeholder="Contoh: 0098765432 atau Rizky..."
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Suggestions / List of matching students */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {students
                  .filter((s) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      s.name.toLowerCase().includes(q) ||
                      s.nisn.toLowerCase().includes(q) ||
                      s.nis.toLowerCase().includes(q) ||
                      s.className.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 6)
                  .map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleConfirmSelect(s)}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{s.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Kelas {s.className} · NISN: {s.nisn} · Wali: {s.parentName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                          Buka Rekam
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Detected student confirmation banner if any */}
          {detectedStudent && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950">QR Dikenali: {detectedStudent.name}</p>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    Kelas {detectedStudent.className} · NISN {detectedStudent.nisn}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleConfirmSelect(detectedStudent)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg cursor-pointer"
              >
                Buka Profil &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
