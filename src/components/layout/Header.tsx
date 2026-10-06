import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Award,
  HeartHandshake,
  ShieldAlert,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ExternalLink,
  Rocket,
} from 'lucide-react';
import { NotificationItem, UserAccount, AppIdentity } from '../../types';

interface HeaderProps {
  currentUser: UserAccount;
  notifications: NotificationItem[];
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleMobileMenu?: () => void;
  appIdentity?: AppIdentity;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  notifications,
  currentTab,
  onNavigateTab,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  onToggleMobileMenu,
  appIdentity,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard / Ringkasan Evaluasi & Analisis Risiko';
      case 'violations':
        return 'Disiplin / Pencatatan Pelanggaran Siswa';
      case 'achievements':
        return 'Apresiasi / Pencatatan Prestasi & Piagam';
      case 'counseling':
        return 'Layanan / Bimbingan & Konseling (BP/BK)';
      case 'classes':
        return 'Rombel / Administrasi Siswa & Mutasi';
      case 'master_rules':
        return 'Tata Tertib / Katalog Bobot Poin Pelanggaran';
      case 'reports':
        return 'Statistik / Tren Perilaku & Laporan Rekapitulasi';
      case 'backup':
        return 'Sistem / Cadangan Data & Database Supabase';
      case 'users':
        return 'Pengguna / Manajemen Akun & Hak Akses';
      case 'settings_identity':
        return 'Pengaturan / Identitas Aplikasi & Sekolah';
      case 'mysql_tutorial':
        return 'Database / Tutorial Konfigurasi MySQL';
      case 'deploy_tutorial':
        return 'Panduan / Tutorial Deploy ke Hosting';
      case 'student_portal':
        return 'Buku Saku / Perkembangan Karakter Siswa';
      default:
        return appIdentity?.appName || 'SI-BK SMP Negeri 1 Cijambe';
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'violation':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case 'achievement':
        return <Award className="w-3.5 h-3.5 text-amber-600" />;
      case 'counseling':
        return <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />;
      case 'alert':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />;
      default:
        return <CheckCircle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Sidebar Toggles & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          title="Buka Menu Navigasi"
          className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer md:hidden shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Bentangkan Sidebar' : 'Ciutkan Sidebar'}
          className="hidden md:flex p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-slate-700" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-700" />
          )}
        </button>

        <div className="overflow-hidden min-w-0">
          <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block">
            {getBreadcrumbTitle(currentTab)}
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:block">
            {appIdentity?.schoolName || 'SMP Negeri 1 Cijambe'} · {appIdentity?.city || 'Subang'}
          </span>
        </div>
      </div>

      {/* Zone 2: Top Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Real-time Notification Bell Drawer Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
            title="Notifikasi & Pembaruan Sistem"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel (Responsive) */}
          {isNotifOpen && (
            <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden max-h-[85vh] flex flex-col animate-fade-in">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs">Pemberitahuan Sistem ({notifications.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsAsRead}
                      className="text-[11px] text-blue-300 hover:text-white underline cursor-pointer"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Belum ada pemberitahuan baru
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onMarkNotificationAsRead(item.id);
                        if (item.linkTab) onNavigateTab(item.linkTab);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !item.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-white shadow-2xs border border-slate-100 shrink-0 self-start">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-slate-900 truncate text-xs">{item.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{item.date.split(' ')[1] || item.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={onLogout}
            title="Keluar / Ganti Akun"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
