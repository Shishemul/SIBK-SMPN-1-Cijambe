export type UserRole = 'superadmin' | 'guru' | 'siswa' | 'wali_murid';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  nipOrNisn?: string;
  phone?: string;
  avatar?: string;
  studentId?: string; // If role is siswa or wali_murid
  className?: string; // If applicable
  status?: 'aktif' | 'nonaktif';
  createdAt?: string;
}

export type ViolationCategory = 'ringan' | 'sedang' | 'berat';

export interface ViolationMaster {
  id: string;
  code: string;
  name: string;
  category: ViolationCategory;
  points: number;
  description: string;
  defaultAction: string;
}

export type AchievementCategory = 'akademik' | 'non_akademik' | 'keagamaan' | 'kepemimpinan';
export type AchievementLevel = 'sekolah' | 'kecamatan' | 'kabupaten' | 'provinsi' | 'nasional';

export interface AchievementMaster {
  id: string;
  code: string;
  name: string;
  category: AchievementCategory;
  level: AchievementLevel;
  points: number;
  description: string;
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  className: string;
  academicYear: string;
  parentName: string;
  parentPhone: string;
  address: string;
  totalViolationPoints: number;
  totalAchievementPoints: number;
  counselingStatus?: 'aman' | 'pantau' | 'peringatan_1' | 'peringatan_2' | 'kritis';
  notes?: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "7A", "8B", "9C"
  grade: '7' | '8' | '9';
  homeroomTeacher: string; // Wali Kelas
  totalStudents: number;
  academicYear: string;
}

export interface ViolationRecord {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  className: string;
  violationMasterId: string;
  violationName: string;
  category: ViolationCategory;
  points: number;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  reporterName: string; // Guru Pelapor
  reporterRole: string;
  followUpAction: string;
  status: 'proses' | 'selesai' | 'panggilan_ortu' | 'skorsing';
  parentNotified: boolean;
  parentNotifiedDate?: string;
  notes?: string;
}

export interface AchievementRecord {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  className: string;
  achievementMasterId: string;
  achievementName: string;
  category: AchievementCategory;
  level: AchievementLevel;
  points: number;
  date: string; // YYYY-MM-DD
  organizer: string;
  rankAward: string; // e.g. "Juara 1", "Medali Emas"
  recordedBy: string;
  certificateNumber?: string;
  notes?: string;
}

export type CounselingType = 'individu' | 'kelompok' | 'panggilan_wali' | 'konferensi_kasus' | 'bimbingan_karir';
export type CounselingStatus = 'terjadwal' | 'berlangsung' | 'selesai' | 'dalam_pemantauan' | 'rujukan';

export interface CounselingRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  counselorName: string;
  date: string;
  type: CounselingType;
  issueDescription: string;
  approachMethod: string;
  resultFollowUp: string;
  status: CounselingStatus;
  nextAppointmentDate?: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'violation' | 'achievement' | 'counseling' | 'alert' | 'system';
  date: string;
  read: boolean;
  linkTab?: string;
  studentId?: string;
}

export type RiskLevel = 'kritis' | 'peringatan_2' | 'peringatan_1' | 'pantau' | 'aman';

export interface AppIdentity {
  appName: string;
  appSubtitle: string;
  schoolName: string;
  schoolNpsn: string;
  districtDepartment: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  address: string;
  city: string;
  postalCode: string;
  province: string;
  phone: string;
  email: string;
  website: string;
  headmasterName: string;
  headmasterNip: string;
  headmasterTitle: string;
  counselorName: string;
  counselorNip: string;
  counselorTitle: string;
  logoUrl?: string;
  letterheadNumberFormat: string;
}
