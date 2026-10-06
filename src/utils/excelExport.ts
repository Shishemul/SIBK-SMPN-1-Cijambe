import * as XLSX from 'xlsx';
import { Student, ViolationRecord, AchievementRecord } from '../types';

export function exportStudentsToExcel(students: Student[], filename = 'Data_Siswa_SMPN1_Cijambe.xlsx') {
  const data = students.map((s, index) => ({
    No: index + 1,
    NISN: s.nisn,
    NIS: s.nis,
    'Nama Lengkap': s.name,
    'L/P': s.gender,
    Kelas: s.className,
    'Tahun Ajaran': s.academicYear,
    'Nama Orang Tua / Wali': s.parentName,
    'No. WhatsApp Wali': s.parentPhone,
    Alamat: s.address,
    'Poin Pelanggaran': s.totalViolationPoints,
    'Poin Prestasi': s.totalAchievementPoints,
    'Status Disiplin': s.counselingStatus ? s.counselingStatus.toUpperCase() : 'AMAN',
    Catatan: s.notes || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
  XLSX.writeFile(workbook, filename);
}

export function exportViolationsToExcel(violations: ViolationRecord[], filename = 'Rekap_Pelanggaran_SMPN1_Cijambe.xlsx') {
  const data = violations.map((v, index) => ({
    No: index + 1,
    Tanggal: v.date,
    Waktu: v.time,
    'Nama Siswa': v.studentName,
    NISN: v.nisn,
    Kelas: v.className,
    'Jenis Pelanggaran': v.violationName,
    Kategori: v.category.toUpperCase(),
    'Bobot Poin': v.points,
    Lokasi: v.location,
    'Guru Pelapor': v.reporterName,
    'Tindak Lanjut': v.followUpAction,
    Status: v.status.toUpperCase(),
    'Ortu Diberitahu': v.parentNotified ? 'YA' : 'TIDAK',
    Catatan: v.notes || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Pelanggaran');
  XLSX.writeFile(workbook, filename);
}

export function exportAchievementsToExcel(achievements: AchievementRecord[], filename = 'Rekap_Prestasi_SMPN1_Cijambe.xlsx') {
  const data = achievements.map((a, index) => ({
    No: index + 1,
    Tanggal: a.date,
    'Nama Siswa': a.studentName,
    NISN: a.nisn,
    Kelas: a.className,
    'Nama Prestasi': a.achievementName,
    Kategori: a.category.toUpperCase(),
    Tingkat: a.level.toUpperCase(),
    Peringkat: a.rankAward,
    'Poin Apresiasi': a.points,
    Penyelenggara: a.organizer,
    'No. Piagam / Sertifikat': a.certificateNumber || '-',
    'Dicatat Oleh': a.recordedBy,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Prestasi');
  XLSX.writeFile(workbook, filename);
}

export function generateStudentTemplateExcel() {
  const sample = [
    {
      NISN: '0098765440',
      NIS: '23240710',
      'Nama Lengkap': 'Ahmad Fauzan',
      'L/P': 'L',
      Kelas: '7A',
      'Nama Orang Tua': 'H. Rudianto',
      'No WhatsApp Wali': '081234567890',
      Alamat: 'Kp. Cijambe Lebak RT 02/01',
    },
    {
      NISN: '0098765441',
      NIS: '23240711',
      'Nama Lengkap': 'Siti Nurhaliza',
      'L/P': 'P',
      Kelas: '7A',
      'Nama Orang Tua': 'Ibu Nurhayati',
      'No WhatsApp Wali': '085712345678',
      Alamat: 'Desa Tanjungwangi RT 01/02',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sample);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
  XLSX.writeFile(workbook, 'Template_Import_Siswa_SMPN1Cijambe.xlsx');
}

export async function parseExcelStudentFile(file: File): Promise<Partial<Student>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet);

        const parsedStudents: Partial<Student>[] = rawJson.map((row) => ({
          nisn: String(row['NISN'] || row['nisn'] || '').trim(),
          nis: String(row['NIS'] || row['nis'] || '').trim(),
          name: String(row['Nama Lengkap'] || row['Nama'] || row['name'] || '').trim(),
          gender: (String(row['L/P'] || row['Gender'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L') as 'L' | 'P',
          className: String(row['Kelas'] || row['class'] || '7A').trim().toUpperCase(),
          academicYear: '2026/2027',
          parentName: String(row['Nama Orang Tua'] || row['Nama Wali'] || 'Wali Murid').trim(),
          parentPhone: String(row['No WhatsApp Wali'] || row['No WA'] || row['Telepon'] || '').trim(),
          address: String(row['Alamat'] || 'Cijambe, Subang').trim(),
          totalViolationPoints: 0,
          totalAchievementPoints: 0,
          counselingStatus: 'aman',
        }));

        resolve(parsedStudents.filter((s) => s.name && s.nisn));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
