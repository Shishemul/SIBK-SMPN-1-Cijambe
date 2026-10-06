import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Award,
  HeartHandshake,
  Menu,
  UserCheck,
  Bell,
  Sparkles,
} from 'lucide-react';
import { UserAccount } from '../../types';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserAccount;
  onOpenMobileMenu: () => void;
  unreadNotifCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenMobileMenu,
  unreadNotifCount = 0,
}) => {
  const isStudentOrGuardian = currentUser.role === 'siswa' || currentUser.role === 'wali_murid';

  const navItems = isStudentOrGuardian
    ? [
        {
          id: 'student_portal',
          label: 'Buku Saku',
          icon: UserCheck,
        },
        {
          id: 'violations',
          label: 'Pelanggaran',
          icon: AlertTriangle,
        },
        {
          id: 'achievements',
          label: 'Prestasi',
          icon: Award,
        },
        {
          id: 'counseling',
          label: 'Konseling',
          icon: HeartHandshake,
        },
      ]
    : [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'violations',
          label: 'Pelanggaran',
          icon: AlertTriangle,
        },
        {
          id: 'achievements',
          label: 'Prestasi',
          icon: Award,
        },
        {
          id: 'counseling',
          label: 'Konseling',
          icon: HeartHandshake,
        },
      ];

  return (
    <nav
      aria-label="Navigasi Bawah Seluler"
      className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-lg px-2 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-15">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-all duration-200 cursor-pointer ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Menu Lengkap (Opens Sidebar Drawer) */}
        <button
          onClick={onOpenMobileMenu}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          {unreadNotifCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            Menu Lain
          </span>
        </button>
      </div>
    </nav>
  );
};
