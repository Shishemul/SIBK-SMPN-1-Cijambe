import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import {
  UserAccount,
  Student,
  ClassItem,
  ViolationMaster,
  AchievementMaster,
  ViolationRecord,
  AchievementRecord,
  CounselingRecord,
  NotificationItem,
  AppIdentity,
} from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginModal } from './components/auth/LoginModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { ViolationsView } from './components/violations/ViolationsView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { CounselingView } from './components/counseling/CounselingView';
import { ClassAdminView } from './components/classes/ClassAdminView';
import { MasterRulesView } from './components/master/MasterRulesView';
import { ReportsView } from './components/reports/ReportsView';
import { BackupView } from './components/backup/BackupView';
import { StudentPortalView } from './components/student-portal/StudentPortalView';
import { UserManagementView } from './components/users/UserManagementView';
import { DeployTutorialView } from './components/deploy/DeployTutorialView';
import { OfficialPrintSlip } from './components/print/OfficialPrintSlip';
import { StudentCounselingModal } from './components/dashboard/StudentCounselingModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MySqlTutorialView } from './components/database/MySqlTutorialView';
import { AppIdentitySettingsView } from './components/settings/AppIdentitySettingsView';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => storageService.getCurrentUser());

  // Application Data States
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [classes, setClasses] = useState<ClassItem[]>(() => storageService.getClasses());
  const [violationMasters, setViolationMasters] = useState<ViolationMaster[]>(() => storageService.getViolationMasters());
  const [achievementMasters, setAchievementMasters] = useState<AchievementMaster[]>(() => storageService.getAchievementMasters());
  const [violations, setViolations] = useState<ViolationRecord[]>(() => storageService.getViolations());
  const [achievements, setAchievements] = useState<AchievementRecord[]>(() => storageService.getAchievements());
  const [counselingRecords, setCounselingRecords] = useState<CounselingRecord[]>(() => storageService.getCounselingRecords());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storageService.getNotifications());
  const [users, setUsers] = useState<UserAccount[]>(() => storageService.getUsers());
  const [appIdentity, setAppIdentity] = useState<AppIdentity>(() => storageService.getAppIdentity());

  // Active Tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Sidebar Collapsed State (persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sibk_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile Navigation Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sibk_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Modals / Overlays
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [printSlipState, setPrintSlipState] = useState<{
    isOpen: boolean;
    type: 'violation_statement' | 'parent_summons' | 'violation_slip' | 'achievement_certificate' | 'monthly_report';
    student?: Student;
    violation?: ViolationRecord;
    achievement?: AchievementRecord;
  }>({
    isOpen: false,
    type: 'violation_statement',
  });

  // Synchronize initial tab based on role when logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'siswa' || currentUser.role === 'wali_murid') {
        setCurrentTab('student_portal');
      } else {
        setCurrentTab('dashboard');
      }
    }
  }, [currentUser]);

  // Synchronize document title with configured App Identity
  useEffect(() => {
    if (appIdentity?.appName) {
      document.title = `${appIdentity.appName} - Sistem Pencatatan Pelanggaran & Prestasi`;
    }
  }, [appIdentity]);

  // Reload data from storage helper
  const reloadData = () => {
    setStudents(storageService.getStudents());
    setClasses(storageService.getClasses());
    setViolationMasters(storageService.getViolationMasters());
    setAchievementMasters(storageService.getAchievementMasters());
    setViolations(storageService.getViolations());
    setAchievements(storageService.getAchievements());
    setCounselingRecords(storageService.getCounselingRecords());
    setNotifications(storageService.getNotifications());
    setUsers(storageService.getUsers());
    setAppIdentity(storageService.getAppIdentity());
  };

  // App Identity Handlers
  const handleUpdateAppIdentity = (updated: AppIdentity) => {
    storageService.saveAppIdentity(updated);
    setAppIdentity(updated);
    storageService.addNotification({
      title: 'Identitas Sekolah & Aplikasi Diperbarui',
      message: `Profil "${updated.schoolName}" berhasil disimpan dan diterapkan pada kop surat, slip resmi, serta seluruh sistem.`,
      type: 'system',
      linkTab: 'settings_identity',
    });
    setNotifications(storageService.getNotifications());
  };

  const handleResetAppIdentity = () => {
    const def = storageService.resetAppIdentity();
    setAppIdentity(def);
    storageService.addNotification({
      title: 'Identitas Sekolah Direset ke Standar',
      message: `Profil sekolah telah dikembalikan ke format standar awal ${def.schoolName}.`,
      type: 'system',
      linkTab: 'settings_identity',
    });
    setNotifications(storageService.getNotifications());
  };

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  // Notification Handlers
  const handleMarkNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    storageService.saveNotifications(updated);
    setNotifications(updated);
  };

  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    storageService.saveNotifications(updated);
    setNotifications(updated);
  };

  // Violation Handlers
  const handleAddViolation = (record: Omit<ViolationRecord, 'id'>) => {
    const newViolation: ViolationRecord = {
      ...record,
      id: `viol-${Date.now().toString().slice(-4)}`,
    };
    const updatedViolations = [newViolation, ...violations];
    storageService.saveViolations(updatedViolations);
    setViolations(updatedViolations);

    // Recalculate student status
    storageService.recalculateStudentStatus(record.studentId);
    setStudents(storageService.getStudents());

    // Add Real-time Notification
    storageService.addNotification({
      title: 'Pelanggaran Baru Tercatat',
      message: `${record.studentName} (${record.className}) - ${record.violationName} (+${record.points} Poin).`,
      type: 'violation',
      linkTab: 'violations',
      studentId: record.studentId,
    });
    setNotifications(storageService.getNotifications());
  };

  const handleDeleteViolation = (id: string) => {
    const item = violations.find((v) => v.id === id);
    const updated = violations.filter((v) => v.id !== id);
    storageService.saveViolations(updated);
    setViolations(updated);

    if (item) {
      storageService.recalculateStudentStatus(item.studentId);
      setStudents(storageService.getStudents());
    }
  };

  // Achievement Handlers
  const handleAddAchievement = (record: Omit<AchievementRecord, 'id'>) => {
    const newAchievement: AchievementRecord = {
      ...record,
      id: `ach-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newAchievement, ...achievements];
    storageService.saveAchievements(updated);
    setAchievements(updated);

    // Recalculate student points
    storageService.recalculateStudentStatus(record.studentId);
    setStudents(storageService.getStudents());

    // Add Notification
    storageService.addNotification({
      title: 'Prestasi Baru Terukir',
      message: `${record.studentName} (${record.className}) meraih ${record.rankAward} - ${record.achievementName}!`,
      type: 'achievement',
      linkTab: 'achievements',
      studentId: record.studentId,
    });
    setNotifications(storageService.getNotifications());
  };

  const handleDeleteAchievement = (id: string) => {
    const item = achievements.find((a) => a.id === id);
    const updated = achievements.filter((a) => a.id !== id);
    storageService.saveAchievements(updated);
    setAchievements(updated);

    if (item) {
      storageService.recalculateStudentStatus(item.studentId);
      setStudents(storageService.getStudents());
    }
  };

  // Counseling Handlers
  const handleAddCounseling = (record: Omit<CounselingRecord, 'id'>) => {
    const newCounseling: CounselingRecord = {
      ...record,
      id: `couns-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newCounseling, ...counselingRecords];
    storageService.saveCounselingRecords(updated);
    setCounselingRecords(updated);

    // Add Notification
    storageService.addNotification({
      title: 'Catatan Konseling Disimpan',
      message: `Sesi ${record.type.replace('_', ' ')} untuk ${record.studentName} berhasil dicatat oleh ${record.counselorName}.`,
      type: 'counseling',
      linkTab: 'counseling',
      studentId: record.studentId,
    });
    setNotifications(storageService.getNotifications());
  };

  const handleUpdateCounselingStatus = (id: string, newStatus: CounselingRecord['status']) => {
    const updated = counselingRecords.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
    storageService.saveCounselingRecords(updated);
    setCounselingRecords(updated);
  };

  // Class & Student Handlers
  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now().toString().slice(-4)}`,
    };
    const updated = [...students, newStudent];
    storageService.saveStudents(updated);
    setStudents(updated);
  };

  const handleBulkAddStudents = (newStudentsList: Omit<Student, 'id'>[]) => {
    const ready = newStudentsList.map((s, idx) => ({
      ...s,
      id: `std-${Date.now()}-${idx}`,
    }));
    const updated = [...students, ...ready];
    storageService.saveStudents(updated);
    setStudents(updated);
  };

  const handleUpdateStudentClass = (studentIds: string[], targetClass: string) => {
    const updated = students.map((s) => {
      if (studentIds.includes(s.id)) {
        return { ...s, className: targetClass };
      }
      return s;
    });
    storageService.saveStudents(updated);
    setStudents(updated);
  };

  const handlePromoteClassBulk = (sourceClass: string, targetClass: string) => {
    const updated = students.map((s) => {
      if (s.className === sourceClass) {
        return { ...s, className: targetClass };
      }
      return s;
    });
    storageService.saveStudents(updated);
    setStudents(updated);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    storageService.saveStudents(updated);
    setStudents(updated);
  };

  // Master Rules Handlers
  const handleAddViolationMaster = (item: Omit<ViolationMaster, 'id'>) => {
    const newItem: ViolationMaster = { ...item, id: `vm-${Date.now().toString().slice(-4)}` };
    const updated = [...violationMasters, newItem];
    storageService.saveViolationMasters(updated);
    setViolationMasters(updated);
  };

  const handleDeleteViolationMaster = (id: string) => {
    const updated = violationMasters.filter((v) => v.id !== id);
    storageService.saveViolationMasters(updated);
    setViolationMasters(updated);
  };

  const handleAddAchievementMaster = (item: Omit<AchievementMaster, 'id'>) => {
    const newItem: AchievementMaster = { ...item, id: `am-${Date.now().toString().slice(-4)}` };
    const updated = [...achievementMasters, newItem];
    storageService.saveAchievementMasters(updated);
    setAchievementMasters(updated);
  };

  const handleDeleteAchievementMaster = (id: string) => {
    const updated = achievementMasters.filter((a) => a.id !== id);
    storageService.saveAchievementMasters(updated);
    setAchievementMasters(updated);
  };

  // User Management Handlers
  const handleAddUser = (user: Omit<UserAccount, 'id'>) => {
    const newUser: UserAccount = {
      ...user,
      id: `user-${Date.now().toString().slice(-4)}`,
    };
    const updated = [...users, newUser];
    storageService.saveUsers(updated);
    setUsers(updated);
  };

  const handleUpdateUser = (id: string, updatedFields: Partial<UserAccount>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...updatedFields } : u));
    storageService.saveUsers(updated);
    setUsers(updated);
  };

  const handleDeleteUser = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    storageService.saveUsers(updated);
    setUsers(updated);
  };

  // Helper for Student / Guardian view student resolution
  const targetPortalStudent = students.find(
    (s) => s.id === currentUser?.studentId || s.name === currentUser?.name
  ) || students[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Login Gate: If no user, show login modal exclusively */}
      {!currentUser && <LoginModal onLogin={handleLogin} />}

      {/* Main Authenticated Layout */}
      {currentUser && (
        <div className="flex flex-1 min-h-screen">
          {/* Dynamic Sidebar based on Authenticated Role with Collapsible state & Mobile Drawer */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            currentUser={currentUser}
            onLogout={handleLogout}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebarCollapse}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            appIdentity={appIdentity}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header
              currentUser={currentUser}
              notifications={notifications}
              currentTab={currentTab}
              onNavigateTab={setCurrentTab}
              onMarkNotificationAsRead={handleMarkNotificationAsRead}
              onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
              onLogout={handleLogout}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={handleToggleSidebarCollapse}
              onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
              appIdentity={appIdentity}
            />

            <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto pb-24 md:pb-6">
              {/* Tab 1: Dashboard Utama (Superadmin / Guru) */}
              {currentTab === 'dashboard' && (
                <DashboardView
                  currentUser={currentUser}
                  students={students}
                  violations={violations}
                  achievements={achievements}
                  counselingRecords={counselingRecords}
                  onSelectStudentProfile={(std) => setSelectedStudentForProfile(std)}
                  onOpenPrintSlip={(type, viol, std) => {
                    const activeStd = std || students.find((s) => s.id === viol?.studentId) || students[0];
                    setPrintSlipState({
                      isOpen: true,
                      type,
                      student: activeStd,
                      violation: viol,
                    });
                  }}
                  onNavigateTab={setCurrentTab}
                  appIdentity={appIdentity}
                />
              )}

              {/* Tab 2: Pelanggaran Siswa */}
              {currentTab === 'violations' && (
                <ViolationsView
                  currentUser={currentUser}
                  violations={violations}
                  students={students}
                  violationMasters={violationMasters}
                  onAddViolation={handleAddViolation}
                  onDeleteViolation={handleDeleteViolation}
                  onOpenPrintSlip={(type, viol, std) => {
                    setPrintSlipState({
                      isOpen: true,
                      type,
                      student: std,
                      violation: viol,
                    });
                  }}
                />
              )}

              {/* Tab 3: Prestasi Siswa */}
              {currentTab === 'achievements' && (
                <AchievementsView
                  currentUser={currentUser}
                  achievements={achievements}
                  students={students}
                  achievementMasters={achievementMasters}
                  onAddAchievement={handleAddAchievement}
                  onDeleteAchievement={handleDeleteAchievement}
                  onOpenPrintSlip={(type, ach, std) => {
                    setPrintSlipState({
                      isOpen: true,
                      type,
                      student: std,
                      achievement: ach,
                    });
                  }}
                />
              )}

              {/* Tab 4: Layanan Konseling */}
              {currentTab === 'counseling' && (
                <CounselingView
                  currentUser={currentUser}
                  counselingRecords={counselingRecords}
                  students={students}
                  onAddCounseling={handleAddCounseling}
                  onUpdateStatus={handleUpdateCounselingStatus}
                  onSelectStudentProfile={(std) => setSelectedStudentForProfile(std)}
                />
              )}

              {/* Tab 5: Administrasi Kelas & Kenaikan Rombel */}
              {currentTab === 'classes' && (
                <ClassAdminView
                  currentUser={currentUser}
                  students={students}
                  classes={classes}
                  onAddStudent={handleAddStudent}
                  onBulkAddStudents={handleBulkAddStudents}
                  onUpdateStudentClass={handleUpdateStudentClass}
                  onPromoteClassBulk={handlePromoteClassBulk}
                  onDeleteStudent={handleDeleteStudent}
                  onSelectStudentProfile={(std) => setSelectedStudentForProfile(std)}
                />
              )}

              {/* Tab 6: Master Tata Tertib & Bobot Poin */}
              {currentTab === 'master_rules' && (
                <MasterRulesView
                  currentUser={currentUser}
                  violationMasters={violationMasters}
                  achievementMasters={achievementMasters}
                  onAddViolationMaster={handleAddViolationMaster}
                  onDeleteViolationMaster={handleDeleteViolationMaster}
                  onAddAchievementMaster={handleAddAchievementMaster}
                  onDeleteAchievementMaster={handleDeleteAchievementMaster}
                />
              )}

              {/* Tab 7: Laporan & Statistik */}
              {currentTab === 'reports' && (
                <ReportsView
                  currentUser={currentUser}
                  students={students}
                  violations={violations}
                  achievements={achievements}
                  counselingRecords={counselingRecords}
                  classes={classes}
                  appIdentity={appIdentity}
                  onOpenPrintSlip={(type) => {
                    setPrintSlipState({
                      isOpen: true,
                      type,
                    });
                  }}
                />
              )}

              {/* Tab 8: Backup & Supabase Settings (Superadmin) */}
              {currentTab === 'backup' && (
                <BackupView
                  currentUser={currentUser}
                  onDataReload={reloadData}
                />
              )}

              {/* Tab: Manajemen Pengguna (Superadmin) */}
              {currentTab === 'users' && (
                <UserManagementView
                  currentUser={currentUser}
                  users={users}
                  students={students}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {/* Tab: Pengaturan Identitas Sekolah & Aplikasi (Superadmin / Guru) */}
              {currentTab === 'settings_identity' && (
                <AppIdentitySettingsView
                  currentUser={currentUser}
                  identity={appIdentity}
                  onUpdateIdentity={handleUpdateAppIdentity}
                  onResetIdentity={handleResetAppIdentity}
                />
              )}

              {/* Tab: Tutorial Konfigurasi Database MySQL */}
              {currentTab === 'mysql_tutorial' && (
                <MySqlTutorialView />
              )}

              {/* Tab: Tutorial Deploy ke Hosting */}
              {currentTab === 'deploy_tutorial' && (
                <DeployTutorialView />
              )}

              {/* Tab 9: Portal Siswa & Wali Murid */}
              {currentTab === 'student_portal' && targetPortalStudent && (
                <StudentPortalView
                  currentUser={currentUser}
                  student={targetPortalStudent}
                  violations={violations.filter((v) => v.studentId === targetPortalStudent.id)}
                  achievements={achievements.filter((a) => a.studentId === targetPortalStudent.id)}
                  counselingRecords={counselingRecords.filter((c) => c.studentId === targetPortalStudent.id)}
                  onOpenPrintSlip={(type, viol, ach) => {
                    setPrintSlipState({
                      isOpen: true,
                      type,
                      student: targetPortalStudent,
                      violation: viol,
                      achievement: ach,
                    });
                  }}
                />
              )}
            </main>

            {/* Mobile Bottom Navigation Bar (Phone-Friendly Native Navigation) */}
            <MobileBottomNav
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              currentUser={currentUser}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              unreadNotifCount={notifications.filter((n) => !n.read).length}
            />
          </div>
        </div>
      )}

      {/* Modal Profile Siswa & Histori Riwayat Konseling (Requested for DashboardView & ClassAdmin) */}
      {selectedStudentForProfile && (
        <StudentCounselingModal
          student={selectedStudentForProfile}
          counselingHistory={counselingRecords.filter((c) => c.studentId === selectedStudentForProfile.id)}
          violations={violations.filter((v) => v.studentId === selectedStudentForProfile.id)}
          achievements={achievements.filter((a) => a.studentId === selectedStudentForProfile.id)}
          onClose={() => setSelectedStudentForProfile(null)}
          onAddCounseling={handleAddCounseling}
          onOpenPrintSlip={(type, viol) => {
            setPrintSlipState({
              isOpen: true,
              type,
              student: selectedStudentForProfile,
              violation: viol,
            });
          }}
        />
      )}

      {/* Official Print Slip Modal (Surat Panggilan, Surat Pernyataan Siswa, Piagam, Laporan Bulanan) */}
      {printSlipState.isOpen && (
        <OfficialPrintSlip
          type={printSlipState.type}
          student={printSlipState.student}
          violation={printSlipState.violation}
          achievement={printSlipState.achievement}
          appIdentity={appIdentity}
          onClose={() => setPrintSlipState({ ...printSlipState, isOpen: false })}
        />
      )}
    </div>
  );
}
