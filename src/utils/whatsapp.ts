import { Student, ViolationRecord, AchievementRecord } from '../types';

/**
 * Normalizes Indonesian phone numbers:
 * 08123456789 -> 628123456789
 * +628123456789 -> 628123456789
 * 628123456789 -> 628123456789
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Generates official notification WhatsApp message for student violation
 */
export function generateViolationWhatsAppUrl(
  student: Student,
  violation: ViolationRecord,
  counselorName: string = 'Siti Rahmawati, S.Pd., Kons. (Guru BP/BK)'
): string {
  const phone = formatWhatsAppNumber(student.parentPhone);
  if (!phone) return '';

  const categoryLabel =
    violation.category === 'berat'
      ? 'BERAT'
      : violation.category === 'sedang'
      ? 'SEDANG'
      : 'RINGAN';

  const message = `*PEMBERITAHUAN KEDISIPLINAN SISWA*
*SMP NEGERI 1 CIJAMBE - KABUPATEN SUBANG*
----------------------------------------

Yth. Bapak/Ibu *${student.parentName}*,
Orang Tua / Wali dari:
• Nama Siswa : *${student.name}*
• Kelas      : ${student.className}
• NISN       : ${student.nisn}

Dengan hormat, kami dari Tim Bimbingan dan Konseling (BP/BK) SMP Negeri 1 Cijambe menyampaikan informasi catatan kedisiplinan putra/putri Bapak/Ibu:

• Jenis Pelanggaran : *${violation.violationName}*
• Kategori          : ${categoryLabel}
• Bobot Poin        : +${violation.points} Poin
• Tanggal / Waktu   : ${violation.date} pukul ${violation.time} WIB
• Lokasi Kejadian   : ${violation.location || 'Lingkungan Sekolah'}
• Tindak Lanjut     : ${violation.followUpAction}
• Akumulasi Poin    : *${student.totalViolationPoints} Poin*

${
  violation.category === 'berat' || student.totalViolationPoints >= 50
    ? `*PERHATIAN KHUSUS:*
Mengingat tingkat pelanggaran dan akumulasi poin telah mencapai ambang evaluasi, kami mengundang Bapak/Ibu untuk hadir ke Ruang BP/BK SMP Negeri 1 Cijambe guna koordinasi pembinaan.`
    : `Mohon dukungan dan bimbingan Bapak/Ibu di rumah agar ananda dapat terus memperbaiki diri dan berdisiplin.`
}

Terima kasih atas perhatian dan kerja sama yang baik demi masa depan ananda.

Hormat kami,
*Tim BP/BK SMP Negeri 1 Cijambe*
Konselor: ${counselorName}
Jl. Raya Cijambe No. 1, Kec. Cijambe, Subang`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates official congratulatory WhatsApp message for student achievement
 */
export function generateAchievementWhatsAppUrl(
  student: Student,
  achievement: AchievementRecord,
  counselorName: string = 'Tim Kesiswaan & BP/BK SMP Negeri 1 Cijambe'
): string {
  const phone = formatWhatsAppNumber(student.parentPhone);
  if (!phone) return '';

  const message = `*APRESIASI PRESTASI SISWA*
*SMP NEGERI 1 CIJAMBE - KABUPATEN SUBANG*
----------------------------------------

Yth. Bapak/Ibu *${student.parentName}*,
Orang Tua / Wali dari:
• Nama Siswa : *${student.name}*
• Kelas      : ${student.className}
• NISN       : ${student.nisn}

Alhamdulillah, keluarga besar SMP Negeri 1 Cijambe mengucapkan *SELAMAT DAN APRESIASI SETINGGI-TINGGINYA* atas pencapaian prestasi ananda:

• Prestasi  : *${achievement.achievementName}*
• Tingkat   : ${achievement.level.toUpperCase()}
• Peringkat : ${achievement.rankAward}
• Tanggal   : ${achievement.date}
• Poin Apresiasi : +${achievement.points} Poin Karakter

Semoga prestasi ini menjadi motivasi bagi ananda untuk terus berkembang, berakhlak mulia, dan menginspirasi teman-teman lainnya.

Terima kasih kepada Bapak/Ibu atas doa dan bimbingan istimewa yang diberikan di rumah.

Hormat kami,
*Keluarga Besar SMP Negeri 1 Cijambe*
${counselorName}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates official parent summons invitation letter via WhatsApp
 */
export function generateSummonsWhatsAppUrl(
  student: Student,
  summonsDate: string,
  summonsTime: string,
  counselorName: string = 'Siti Rahmawati, S.Pd., Kons.'
): string {
  const phone = formatWhatsAppNumber(student.parentPhone);
  if (!phone) return '';

  const message = `*UNDANGAN RESMI PANGGILAN ORANG TUA/WALI*
*SMP NEGERI 1 CIJAMBE*
Nomor: 421.3/BK-SMPN1CJB/${new Date().getFullYear()}
----------------------------------------

Yth. Bapak/Ibu *${student.parentName}*,
Orang Tua/Wali dari:
• Siswa : *${student.name}* (${student.className})
• NISN  : ${student.nisn}

Sehubungan dengan perkembangan pembinaan kedisiplinan dan karakter ananda di sekolah (Akumulasi Poin: *${student.totalViolationPoints} Poin*), dengan ini kami mengharap kehadiran Bapak/Ibu pada:

• Hari / Tanggal : *${summonsDate}*
• Waktu          : *${summonsTime} WIB*
• Tempat         : Ruang Bimbingan & Konseling (BP/BK) SMPN 1 Cijambe
• Agenda         : Konsultasi & Penanganan Kasus Siswa

Mengingat pentingnya koordinasi ini demi masa depan pendidikan ananda, kehadiran Bapak/Ibu sangat kami harapkan.

Demikian undangan ini kami sampaikan, terima kasih.

Guru BP/BK: ${counselorName}
Kepala Sekolah: Drs. H. Maman Suryaman, M.Pd.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
