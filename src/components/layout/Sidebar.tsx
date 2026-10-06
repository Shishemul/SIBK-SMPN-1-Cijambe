import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Award,
  HeartHandshake,
  Users,
  BookOpen,
  BarChart3,
  Database,
  UserCheck,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Rocket,
  X,
  Building2,
} from 'lucide-react';
import { UserRole, UserAccount, AppIdentity } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserAccount;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  appIdentity?: AppIdentity;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  appIdentity,
}) => {
  const role = currentUser.role;

  // Build menu items dynamically based on authenticated role
  const getMenuItems = () => {
    if (role === 'siswa' || role === 'wali_murid') {
      return [
        {
          id: 'student_portal',
          label: role === 'siswa' ? 'Buku Saku Siswa' : 'Perkembangan Anak',
          icon: UserCheck,
          badge: null,
        },
        {
          id: 'violations',
          label: 'Catatan Pelanggaran',
          icon: AlertTriangle,
          badge: null,
        },
        {
          id: 'achievements',
          label: 'Catatan Prestasi',
          icon: Award,
          badge: null,
        },
        {
          id: 'counseling',
          label: 'Konsultasi BK',
          icon: HeartHandshake,
          badge: null,
        },
      ];
    }

    // Role is superadmin or guru
    const items = [
      {
        id: 'dashboard',
        label: 'Dashboard Utama',
        icon: LayoutDashboard,
        badge: null,
      },
      {
        id: 'violations',
        label: 'Pelanggaran Siswa',
        icon: AlertTriangle,
        badge: 'R,S,B',
      },
      {
        id: 'achievements',
        label: 'Prestasi Siswa',
        icon: Award,
        badge: null,
      },
      {
        id: 'counseling',
        label: 'Layanan Konseling',
        icon: HeartHandshake,
        badge: null,
      },
      {
        id: 'classes',
        label: 'Administrasi Kelas',
        icon: Users,
        badge: null,
      },
      {
        id: 'master_rules',
        label: 'Master Tata Tertib',
        icon: BookOpen,
        badge: null,
      },
      {
        id: 'reports',
        label: 'Laporan & Statistik',
        icon: BarChart3,
        badge: 'PDF',
      },
    ];

    if (role === 'superadmin') {
      items.push({
        id: 'users',
        label: 'Manajemen Pengguna',
        icon: UserCog,
        badge: null,
      });
      items.push({
        id: 'backup',
        label: 'Cadangan & Supabase',
        icon: Database,
        badge: null,
      });
    }

    if (role === 'superadmin' || role === 'guru') {
      items.push({
        id: 'settings_identity',
        label: 'Identitas Sekolah & Aplikasi',
        icon: Building2,
        badge: 'Profil',
      });
    }

    // Add MySQL Database Configuration Tutorial
    items.push({
      id: 'mysql_tutorial',
      label: 'Tutorial Database MySQL',
      icon: Database,
      badge: 'SQL',
    });

    // Add Deployment Tutorial Guide
    items.push({
      id: 'deploy_tutorial',
      label: 'Tutorial Deploy Hosting',
      icon: Rocket,
      badge: 'Guide',
    });

    return items;
  };

  const menuItems = getMenuItems();

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'superadmin':
        return 'Kepala Sekolah / Admin';
      case 'guru':
        return 'Guru BP / Konselor';
      case 'siswa':
        return 'Peserta Didik';
      case 'wali_murid':
        return 'Orang Tua / Wali';
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar (Desktop Static / Mobile Off-canvas Drawer) */}
      <aside
        className={`bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 md:static md:z-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } w-72 max-w-[85vw] shadow-2xl md:shadow-none`}
      >
        {/* Brand & Logo Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 h-16 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'md:justify-center md:w-full' : ''}`}>
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
              <img
                src={appIdentity?.logoUrl || '/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg'}
                alt={appIdentity?.schoolName || 'Logo Sekolah'}
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-sm tracking-tight text-white truncate">
                  {appIdentity?.appName || 'SI-BK SMPN 1 Cijambe'}
                </h1>
                <p className="text-[11px] text-slate-400 truncate">
                  {appIdentity?.appSubtitle || 'Bimbingan & Kedisiplinan'}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapsible Toggle Button */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              title="Ciutkan Sidebar"
              className="hidden md:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            title="Tutup Menu"
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* When collapsed on desktop, provide a prominent toggle button at top */}
        {isCollapsed && (
          <div className="hidden md:flex py-2 px-3 justify-center border-b border-slate-800/60 shrink-0">
            <button
              onClick={onToggleCollapse}
              title="Bentangkan Sidebar"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer w-full flex justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Navigasi
            </div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer group relative ${
                  isCollapsed
                    ? 'md:justify-center md:py-3 md:px-2 px-3 py-2.5 justify-between'
                    : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center' : ''}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                </div>

                {(!isCollapsed || isMobileOpen) && item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Floating Tooltip when Collapsed on Desktop */}
                {isCollapsed && (
                  <div className="hidden md:block absolute left-full ml-2 px-2.5 py-1 bg-slate-950 text-white text-[11px] font-semibold rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                    {item.label}
                    {item.badge && <span className="ml-1.5 text-blue-400">({item.badge})</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <div className={`flex items-center gap-2.5 ${isCollapsed ? 'md:flex-col md:justify-center px-2 py-1' : 'px-2 py-1'}`}>
            <div
              className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0"
              title={currentUser.name}
            >
              {currentUser.name.charAt(0)}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-blue-400 font-medium truncate">
                  {getRoleLabel(currentUser.role)}
                </p>
              </div>
            )}

            <button
              onClick={onLogout}
              title="Keluar / Ganti Akun"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
