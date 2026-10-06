import React, { useState } from 'react';
import {
  Lock,
  User,
  Shield,
  KeyRound,
  GraduationCap,
  Users,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { INITIAL_USERS } from '../../data/initialData';

interface LoginModalProps {
  onLogin: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setErrorMsg('Masukkan username atau NISN Anda.');
      return;
    }

    const found = INITIAL_USERS.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        (u.nipOrNisn && u.nipOrNisn.includes(username))
    );

    if (found) {
      onLogin(found);
    } else {
      // Default to Guru BK demo account if not found
      setErrorMsg('Username atau kata sandi tidak ditemukan. Gunakan tombol demo akses di bawah.');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const demoUser = INITIAL_USERS.find((u) => u.role === role);
    if (demoUser) {
      onLogin(demoUser);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-auto">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-8 text-center relative">
          <div className="w-14 h-14 sm:w-18 sm:h-18 mx-auto mb-2.5 sm:mb-3 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center">
            <img
              src="/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg"
              alt="Logo SMPN 1 Cijambe"
              className="w-11 h-11 sm:w-14 sm:h-14 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
            SI-BK SMP Negeri 1 Cijambe
          </h2>
          <p className="text-[11px] sm:text-xs text-blue-200 mt-1 max-w-sm mx-auto leading-relaxed">
            Sistem Informasi Bimbingan & Konseling, Pencatatan Pelanggaran & Prestasi Siswa Terintegrasi
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] sm:text-[11px] text-blue-200 font-medium">
            <span>Dinas Pendidikan Kab. Subang</span>
            <span>·</span>
            <span>T.A 2026/2027</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-8 space-y-5">
          <div className="text-center">
            <h3 className="text-sm font-bold text-slate-900">Masuk ke Portal Sekolah</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan login sesuai akun terdaftar untuk mengakses hak akses Anda.
            </p>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username / NIP / NISN
              </label>
              <div className="flex items-center gap-2 p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs focus-within:border-blue-500 focus-within:bg-white">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Masukkan username atau NIP/NISN"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-hidden text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="flex items-center gap-2 p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs focus-within:border-blue-500 focus-within:bg-white">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-hidden text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Masuk ke Aplikasi
            </button>
          </form>

          {/* Quick Demo Role Selector (Essential for instant testing of all 4 roles) */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              Atau Pilih Akses Cepat Simulasi Role:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('superadmin')}
                className="p-3 border border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-blue-600">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Superadmin</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  Kepala Sekolah / Koordinator BK
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('guru')}
                className="p-3 border border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-blue-600">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <span>Guru BP/BK</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  Siti Rahmawati, S.Pd., Kons.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('siswa')}
                className="p-3 border border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-blue-600">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Siswa</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  M. Rizky Pratama (Kelas 8B)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('wali_murid')}
                className="p-3 border border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-blue-600">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Wali Murid</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  Orang Tua M. Rizky Pratama
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
