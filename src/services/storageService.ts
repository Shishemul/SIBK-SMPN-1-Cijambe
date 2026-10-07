import {
  Student,
  ClassItem,
  ViolationMaster,
  AchievementMaster,
  ViolationRecord,
  AchievementRecord,
  CounselingRecord,
  NotificationItem,
  UserAccount,
  AppIdentity,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_VIOLATION_MASTERS,
  INITIAL_ACHIEVEMENT_MASTERS,
  INITIAL_STUDENTS,
  INITIAL_VIOLATIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_COUNSELING_RECORDS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

export const DEFAULT_APP_IDENTITY: AppIdentity = {
  appName: 'SI-BK SMPN 1 Cijambe',
  appSubtitle: 'Sistem Informasi Bimbingan Konseling, Pelanggaran & Prestasi Siswa',
  schoolName: 'SMP Negeri 1 Cijambe',
  schoolNpsn: '20233456',
  districtDepartment: 'PEMERINTAH KABUPATEN SUBANG • DINAS PENDIDIKAN',
  academicYear: '2026/2027',
  semester: 'Ganjil',
  address: 'Jl. Raya Cijambe No. 1, Kecamatan Cijambe',
  city: 'Kabupaten Subang',
  postalCode: '41286',
  province: 'Jawa Barat',
  phone: '(0260) 412345',
  email: 'smpn1cijambe@subang.sch.id',
  website: 'https://smpn1cijambe.sch.id',
  headmasterName: 'Drs. H. Maman Suryaman, M.Pd.',
  headmasterNip: '19680512 199403 1 004',
  headmasterTitle: 'Kepala SMP Negeri 1 Cijambe',
  counselorName: 'Siti Rahmawati, S.Pd., Kons.',
  counselorNip: '19820719 200801 2 007',
  counselorTitle: 'Koordinator Bimbingan & Konseling',
  logoUrl: '/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg',
  letterheadNumberFormat: '421.3/BK-SMPN1CJB/{YEAR}',
};

const STORAGE_KEYS = {
  USERS: 'sibk_cijambe_users',
  CURRENT_USER: 'sibk_cijambe_current_user',
  STUDENTS: 'sibk_cijambe_students',
  CLASSES: 'sibk_cijambe_classes',
  VIOLATION_MASTERS: 'sibk_cijambe_violation_masters',
  ACHIEVEMENT_MASTERS: 'sibk_cijambe_achievement_masters',
  VIOLATIONS: 'sibk_cijambe_violations',
  ACHIEVEMENTS: 'sibk_cijambe_achievements',
  COUNSELING: 'sibk_cijambe_counseling',
  NOTIFICATIONS: 'sibk_cijambe_notifications',
  SUPABASE_CONFIG: 'sibk_cijambe_supabase_config',
  APP_IDENTITY: 'sibk_cijambe_app_identity',
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
  schema?: string;
  autoSync?: boolean;
  connected: boolean;
  lastSynced?: string;
}

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Failed to parse storage item ${key}`, e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save storage item ${key}`, e);
  }
}

export const storageService = {
  // Current logged in user (authentication)
  getCurrentUser(): UserAccount | null {
    return getItem<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user: UserAccount | null): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
  },
  getUsers(): UserAccount[] {
    return getItem<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  saveUsers(users: UserAccount[]): void {
    setItem(STORAGE_KEYS.USERS, users);
  },

  // Students
  getStudents(): Student[] {
    return getItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },
  saveStudents(students: Student[]): void {
    setItem(STORAGE_KEYS.STUDENTS, students);
  },

  // Hubungkan Siswa dengan Guru/Konselor (1 Siswa -> 1 Konselor, 1 Guru -> Banyak Siswa)
  assignCounselorToStudent(
    studentId: string,
    counselor: { id: string; name: string; nip?: string; phone?: string } | null
  ): Student[] {
    const students = this.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        if (!counselor) {
          return {
            ...s,
            counselorId: undefined,
            counselorName: undefined,
            counselorNip: undefined,
            counselorPhone: undefined,
            assignedAt: undefined,
          };
        }
        return {
          ...s,
          counselorId: counselor.id,
          counselorName: counselor.name,
          counselorNip: counselor.nip,
          counselorPhone: counselor.phone,
          assignedAt: new Date().toISOString().substring(0, 10),
        };
      }
      return s;
    });
    this.saveStudents(updated);
    return updated;
  },

  bulkAssignCounselor(
    studentIds: string[],
    counselor: { id: string; name: string; nip?: string; phone?: string } | null
  ): Student[] {
    const students = this.getStudents();
    const updated = students.map((s) => {
      if (studentIds.includes(s.id)) {
        if (!counselor) {
          return {
            ...s,
            counselorId: undefined,
            counselorName: undefined,
            counselorNip: undefined,
            counselorPhone: undefined,
            assignedAt: undefined,
          };
        }
        return {
          ...s,
          counselorId: counselor.id,
          counselorName: counselor.name,
          counselorNip: counselor.nip,
          counselorPhone: counselor.phone,
          assignedAt: new Date().toISOString().substring(0, 10),
        };
      }
      return s;
    });
    this.saveStudents(updated);
    return updated;
  },

  bulkAssignClassToCounselor(
    className: string,
    counselor: { id: string; name: string; nip?: string; phone?: string } | null
  ): Student[] {
    const students = this.getStudents();
    const updated = students.map((s) => {
      if (s.className === className) {
        if (!counselor) {
          return {
            ...s,
            counselorId: undefined,
            counselorName: undefined,
            counselorNip: undefined,
            counselorPhone: undefined,
            assignedAt: undefined,
          };
        }
        return {
          ...s,
          counselorId: counselor.id,
          counselorName: counselor.name,
          counselorNip: counselor.nip,
          counselorPhone: counselor.phone,
          assignedAt: new Date().toISOString().substring(0, 10),
        };
      }
      return s;
    });
    this.saveStudents(updated);
    return updated;
  },

  // Classes
  getClasses(): ClassItem[] {
    return getItem<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  },
  saveClasses(classes: ClassItem[]): void {
    setItem(STORAGE_KEYS.CLASSES, classes);
  },

  // Violation Masters
  getViolationMasters(): ViolationMaster[] {
    return getItem<ViolationMaster[]>(STORAGE_KEYS.VIOLATION_MASTERS, INITIAL_VIOLATION_MASTERS);
  },
  saveViolationMasters(masters: ViolationMaster[]): void {
    setItem(STORAGE_KEYS.VIOLATION_MASTERS, masters);
  },

  // Achievement Masters
  getAchievementMasters(): AchievementMaster[] {
    return getItem<AchievementMaster[]>(STORAGE_KEYS.ACHIEVEMENT_MASTERS, INITIAL_ACHIEVEMENT_MASTERS);
  },
  saveAchievementMasters(masters: AchievementMaster[]): void {
    setItem(STORAGE_KEYS.ACHIEVEMENT_MASTERS, masters);
  },

  // Violation Records
  getViolations(): ViolationRecord[] {
    return getItem<ViolationRecord[]>(STORAGE_KEYS.VIOLATIONS, INITIAL_VIOLATIONS);
  },
  saveViolations(violations: ViolationRecord[]): void {
    setItem(STORAGE_KEYS.VIOLATIONS, violations);
  },

  // Achievement Records
  getAchievements(): AchievementRecord[] {
    return getItem<AchievementRecord[]>(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
  },
  saveAchievements(achievements: AchievementRecord[]): void {
    setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  },

  // Counseling Records
  getCounselingRecords(): CounselingRecord[] {
    return getItem<CounselingRecord[]>(STORAGE_KEYS.COUNSELING, INITIAL_COUNSELING_RECORDS);
  },
  saveCounselingRecords(records: CounselingRecord[]): void {
    setItem(STORAGE_KEYS.COUNSELING, records);
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  saveNotifications(notifs: NotificationItem[]): void {
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },
  addNotification(notif: Omit<NotificationItem, 'id' | 'read' | 'date'> & { date?: string }): void {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: notif.date || new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
      ...notif,
    };
    this.saveNotifications([newNotif, ...list]);
  },

  // Supabase Integration configuration
  getSupabaseConfig(): SupabaseConfig {
    return getItem<SupabaseConfig>(STORAGE_KEYS.SUPABASE_CONFIG, {
      url: '',
      anonKey: '',
      connected: false,
    });
  },
  saveSupabaseConfig(config: SupabaseConfig): void {
    setItem(STORAGE_KEYS.SUPABASE_CONFIG, config);
  },

  // Re-calculate Student Points & Risk Status
  recalculateStudentStatus(studentId: string): void {
    const students = this.getStudents();
    const violations = this.getViolations().filter((v) => v.studentId === studentId);
    const achievements = this.getAchievements().filter((a) => a.studentId === studentId);

    const totalV = violations.reduce((acc, curr) => acc + (curr.points || 0), 0);
    const totalA = achievements.reduce((acc, curr) => acc + (curr.points || 0), 0);

    let status: Student['counselingStatus'] = 'aman';
    if (totalV >= 75) status = 'kritis';
    else if (totalV >= 50) status = 'peringatan_2';
    else if (totalV >= 25) status = 'peringatan_1';
    else if (totalV >= 10) status = 'pantau';
    else status = 'aman';

    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          totalViolationPoints: totalV,
          totalAchievementPoints: totalA,
          counselingStatus: status,
        };
      }
      return s;
    });

    this.saveStudents(updated);
  },

  // Backup & Restore
  exportAllDataAsJSON(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      school: 'SMP Negeri 1 Cijambe',
      version: '1.0',
      data: {
        users: this.getUsers(),
        students: this.getStudents(),
        classes: this.getClasses(),
        violationMasters: this.getViolationMasters(),
        achievementMasters: this.getAchievementMasters(),
        violations: this.getViolations(),
        achievements: this.getAchievements(),
        counseling: this.getCounselingRecords(),
        notifications: this.getNotifications(),
        appIdentity: this.getAppIdentity(),
      },
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllDataFromJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data) return false;
      const d = parsed.data;
      if (d.students) this.saveStudents(d.students);
      if (d.classes) this.saveClasses(d.classes);
      if (d.violationMasters) this.saveViolationMasters(d.violationMasters);
      if (d.achievementMasters) this.saveAchievementMasters(d.achievementMasters);
      if (d.violations) this.saveViolations(d.violations);
      if (d.achievements) this.saveAchievements(d.achievements);
      if (d.counseling) this.saveCounselingRecords(d.counseling);
      if (d.notifications) this.saveNotifications(d.notifications);
      if (d.users) this.saveUsers(d.users);
      if (d.appIdentity) this.saveAppIdentity(d.appIdentity);
      return true;
    } catch (e) {
      console.error('Failed to import backup data:', e);
      return false;
    }
  },

  // App & School Identity Settings
  getAppIdentity(): AppIdentity {
    return getItem<AppIdentity>(STORAGE_KEYS.APP_IDENTITY, DEFAULT_APP_IDENTITY);
  },

  saveAppIdentity(identity: AppIdentity): void {
    setItem(STORAGE_KEYS.APP_IDENTITY, identity);
  },

  resetAppIdentity(): AppIdentity {
    this.saveAppIdentity(DEFAULT_APP_IDENTITY);
    return DEFAULT_APP_IDENTITY;
  },

  resetToInitialData(): void {
    this.saveUsers(INITIAL_USERS);
    this.saveStudents(INITIAL_STUDENTS);
    this.saveClasses(INITIAL_CLASSES);
    this.saveViolationMasters(INITIAL_VIOLATION_MASTERS);
    this.saveAchievementMasters(INITIAL_ACHIEVEMENT_MASTERS);
    this.saveViolations(INITIAL_VIOLATIONS);
    this.saveAchievements(INITIAL_ACHIEVEMENTS);
    this.saveCounselingRecords(INITIAL_COUNSELING_RECORDS);
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    this.saveAppIdentity(DEFAULT_APP_IDENTITY);
  },
};
