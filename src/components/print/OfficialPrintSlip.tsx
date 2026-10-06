import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { Student, ViolationRecord, AchievementRecord, AppIdentity } from '../../types';
import { storageService } from '../../services/storageService';

interface OfficialPrintSlipProps {
  type: 'violation_statement' | 'parent_summons' | 'violation_slip' | 'achievement_certificate' | 'monthly_report';
  student?: Student;
  violation?: ViolationRecord;
  achievement?: AchievementRecord;
  reportData?: any;
  appIdentity?: AppIdentity;
  onClose: () => void;
}

export const OfficialPrintSlip: React.FC<OfficialPrintSlipProps> = ({
  type,
  student,
  violation,
  achievement,
  reportData,
  appIdentity,
  onClose,
}) => {
  const identity = appIdentity || storageService.getAppIdentity();
  const cityShort = (identity.city || 'Subang').replace('Kabupaten ', '').replace('Kota ', '');

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Printer className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm truncate">
                Pratinjau Dokumen Resmi & Cetak PDF
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Format standar kedinasan {identity.schoolName}, {cityShort}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak / Simpan</span> PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable Area) */}
        <div id="print-area" className="p-4 sm:p-8 md:p-12 overflow-y-auto bg-white text-slate-900 text-xs sm:text-sm leading-relaxed font-serif">
          {/* KOP SURAT RESMI */}
          <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-4 mb-6">
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              <img
                src={identity.logoUrl || '/src/assets/images/logo_smpn1_cijambe_1791227246557.jpg'}
                alt={identity.schoolName}
                className="w-18 h-18 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center flex-1 px-4">
              <h4 className="text-xs tracking-wider uppercase font-semibold text-slate-700">
                {identity.districtDepartment}
              </h4>
              <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-slate-950 font-sans">
                {identity.schoolName}
              </h2>
              <p className="text-[11px] text-slate-600 font-sans leading-tight mt-0.5">
                {identity.address}, {identity.city}, {identity.province} {identity.postalCode}
              </p>
              <p className="text-[11px] text-slate-600 font-sans leading-tight">
                {identity.phone ? `Telp/WA: ${identity.phone} | ` : ''}Pos-el: {identity.email} | Laman: {identity.website}
              </p>
            </div>
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              {/* Tut Wuri Handayani / School crest emblem container */}
              <div className="w-16 h-16 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500 text-center p-1 uppercase">
                {cityShort}
              </div>
            </div>
          </div>

          {/* DOCUMENT CONTENT BASED ON TYPE */}
          {type === 'parent_summons' && student && violation && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-base font-bold underline uppercase tracking-wide">
                  SURAT PANGGILAN ORANG TUA / WALI SISWA
                </h3>
                <p className="text-xs text-slate-700 font-sans mt-1">
                  Nomor: {identity.letterheadNumberFormat
                    .replace('{YEAR}', new Date().getFullYear().toString())
                    .replace('{NUMBER}', violation.id.toUpperCase())}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <p>
                  Kepada Yth.
                  <br />
                  Bapak / Ibu Orang Tua / Wali dari:{' '}
                  <strong>{student.name}</strong>
                  <br />
                  Di Tempat
                </p>
                <p className="indent-8 text-justify">
                  Dengan hormat, sehubungan dengan adanya perkembangan perilaku kedisiplinan putra/putri Bapak/Ibu di {identity.schoolName} yang memerlukan koordinasi dan penanganan bersama antara pihak sekolah dan orang tua/wali murid, maka dengan ini kami mengundang Bapak/Ibu untuk hadir pada:
                </p>

                <div className="pl-8 space-y-1.5 font-sans text-xs">
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">Hari / Tanggal</span>
                    <span className="col-span-3 font-semibold text-slate-900">: Menyesuaikan Jadwal Pemanggilan BK</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">Waktu</span>
                    <span className="col-span-3 font-semibold text-slate-900">: 09.00 WIB s/d Selesai</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">Tempat</span>
                    <span className="col-span-3 font-semibold text-slate-900">: Ruang Layanan BP/BK {identity.schoolName}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">Bertemu Dengan</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {identity.counselorName} ({identity.counselorTitle}) & Wali Kelas</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">Perihal</span>
                    <span className="col-span-3 font-semibold text-red-700">
                      : Tindak Lanjut Pelanggaran Kedisiplinan ({violation.violationName}) - Total Akumulasi Poin: {student.totalViolationPoints}
                    </span>
                  </div>
                </div>

                <p className="indent-8 text-justify">
                  Mengingat pentingnya pertemuan ini demi kelancaran proses pendidikan dan pembentukan karakter ananda, kehadiran Bapak/Ibu sangat kami harapkan tepat pada waktunya dan tidak dapat diwakilkan.
                </p>
                <p className="indent-8">
                  Demikian surat undangan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.
                </p>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 gap-8 pt-8 font-sans text-xs">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-semibold text-slate-900">{identity.headmasterTitle},</p>
                  <div className="h-20" />
                  <p className="font-bold underline text-slate-950">{identity.headmasterName}</p>
                  <p className="text-slate-600">NIP. {identity.headmasterNip}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">{cityShort}, {currentDate}</p>
                  <p className="font-semibold text-slate-900">{identity.counselorTitle},</p>
                  <div className="h-20" />
                  <p className="font-bold underline text-slate-950">{identity.counselorName}</p>
                  <p className="text-slate-600">NIP. {identity.counselorNip}</p>
                </div>
              </div>
            </div>
          )}

          {type === 'violation_statement' && student && violation && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-base font-bold underline uppercase tracking-wide">
                  SURAT PERNYATAAN DAN PERJANJIAN SISWA
                </h3>
                <p className="text-xs text-slate-700 font-sans mt-1">
                  Nomor: 421.3 / SP-{violation.id.substring(0, 8)} / BK / {new Date().getFullYear()}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <p>Yang bertanda tangan di bawah ini:</p>
                <div className="pl-6 space-y-1.5 font-sans text-xs">
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">Nama Siswa</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {student.name}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">NIS / NISN</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {student.nis} / {student.nisn}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">Kelas</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {student.className}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">Nama Orang Tua / Wali</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {student.parentName}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-slate-600">Alamat Tempat Tinggal</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {student.address}</span>
                  </div>
                </div>

                <p className="indent-8 text-justify mt-4">
                  Dengan ini menyatakan dengan penuh kesadaran dan tanpa paksaan dari pihak manapun bahwa pada tanggal <strong>{violation.date}</strong> telah melakukan pelanggaran tata tertib sekolah berupa:
                </p>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded font-sans text-xs">
                  <p className="font-semibold text-slate-900">"{violation.violationName}" (Kategori: {violation.category.toUpperCase()} - Bobot: {violation.points} Poin)</p>
                  <p className="text-slate-600 text-[11px] mt-1">Tindakan/Sanksi: {violation.followUpAction}</p>
                </div>

                <p className="indent-8 text-justify">
                  Atas tindakan tersebut, saya bersungguh-sungguh berjanji:
                </p>
                <ol className="list-decimal pl-12 space-y-1 text-xs">
                  <li>Mengakui kesalahan dan memohon maaf kepada pihak sekolah serta orang tua.</li>
                  <li>Tidak akan mengulangi perbuatan melanggar tata tertib tersebut maupun pelanggaran tata tertib lainnya di lingkungan {identity.schoolName}.</li>
                  <li>Bersedia menerima sanksi yang lebih berat sesuai aturan sekolah apabila di kemudian hari saya mengulangi pelanggaran serupa.</li>
                </ol>

                <p className="indent-8 text-justify">
                  Demikian surat pernyataan dan perjanjian ini saya buat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
                </p>
              </div>

              {/* Tanda Tangan Multi-pihak */}
              <div className="pt-8 font-sans text-xs">
                <div className="text-right mb-4">
                  <p className="text-slate-600">{cityShort}, {currentDate}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-slate-600">Orang Tua / Wali Siswa,</p>
                    <div className="h-18" />
                    <p className="font-bold underline text-slate-950">( {student.parentName} )</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Yang Membuat Pernyataan,</p>
                    <div className="h-6 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 border border-dashed border-slate-300 px-2 py-0.5">Materai Rp10.000</span>
                    </div>
                    <div className="h-8" />
                    <p className="font-bold underline text-slate-950">( {student.name} )</p>
                  </div>
                  <div>
                    <p className="text-slate-600">{identity.counselorTitle},</p>
                    <div className="h-18" />
                    <p className="font-bold underline text-slate-950">{identity.counselorName}</p>
                    <p className="text-[10px] text-slate-600">NIP. {identity.counselorNip}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'violation_slip' && student && violation && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-base font-bold underline uppercase tracking-wide">
                  SLIP BUKTI TINDAKAN KEDISIPLINAN SISWA
                </h3>
                <p className="text-xs text-slate-700 font-sans mt-1">
                  Arsip Bimbingan & Konseling (BP/BK) {identity.schoolName}
                </p>
              </div>

              <div className="border border-slate-300 rounded p-4 font-sans text-xs space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500">Nama Siswa:</span>
                    <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">NISN / Kelas:</span>
                    <p className="font-bold text-slate-900 text-sm">{student.nisn} / {student.className}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500">Tanggal & Waktu Kejadian:</span>
                    <p className="font-semibold text-slate-800">{violation.date} ({violation.time} WIB)</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Lokasi Kejadian:</span>
                    <p className="font-semibold text-slate-800">{violation.location || 'Area Sekolah'}</p>
                  </div>
                </div>
                <hr className="border-slate-200" />
                <div>
                  <span className="text-slate-500">Jenis Pelanggaran:</span>
                  <p className="font-bold text-slate-950 text-sm">{violation.violationName}</p>
                  <p className="text-slate-600 mt-0.5">Kategori: <strong>{violation.category.toUpperCase()}</strong> | Bobot: <strong>+{violation.points} Poin</strong></p>
                </div>
                <div>
                  <span className="text-slate-500">Tindakan Disiplin / Rekomendasi Konseling:</span>
                  <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded mt-1 border border-slate-200">
                    {violation.followUpAction}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500">Guru Pelapor:</span>
                    <p className="font-semibold text-slate-800">{violation.reporterName} ({violation.reporterRole})</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Poin Siswa Saat Ini:</span>
                    <p className="font-bold text-red-600 text-sm">{student.totalViolationPoints} Poin</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4 font-sans text-xs">
                <div>
                  <p className="text-slate-600">Siswa Bersangkutan,</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-950">{student.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">{cityShort}, {currentDate}</p>
                  <p className="font-semibold text-slate-900">{identity.counselorTitle},</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-950">{identity.counselorName}</p>
                </div>
              </div>
            </div>
          )}

          {type === 'achievement_certificate' && student && achievement && (
            <div className="border-4 border-double border-amber-600/40 p-8 rounded-lg bg-amber-50/20">
              <div className="text-center mb-6">
                <span className="text-xs uppercase font-sans tracking-widest text-amber-800 font-bold">
                  Piagam Catatan Apresiasi Karakter & Prestasi
                </span>
                <h3 className="text-xl font-bold uppercase tracking-wider text-slate-950 mt-1">
                  SERTIFIKAT PRESTASI SISWA
                </h3>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  Nomor: {achievement.certificateNumber || `${identity.schoolNpsn || 'PRESTASI'}/${achievement.id.toUpperCase()}/${new Date().getFullYear()}`}
                </p>
              </div>

              <div className="text-center space-y-4 my-8 font-sans">
                <p className="text-slate-600 text-sm italic">Diberikan apresiasi dan penghargaan setinggi-tingginya kepada:</p>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 underline tracking-wide">
                    {student.name}
                  </h2>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    Kelas {student.className} - NISN: {student.nisn}
                  </p>
                </div>

                <div className="max-w-xl mx-auto py-4 bg-white/80 border border-amber-200 rounded-lg shadow-2xs px-6">
                  <p className="text-xs text-slate-500 uppercase">Atas Keberhasilan Meraih:</p>
                  <p className="text-lg font-bold text-amber-900 mt-1">
                    {achievement.rankAward}
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">
                    {achievement.achievementName}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-600 mt-2 pt-2 border-t border-amber-100">
                    <span>Tingkat: <strong>{achievement.level.toUpperCase()}</strong></span>
                    <span>·</span>
                    <span>Penyelenggara: <strong>{achievement.organizer}</strong></span>
                    <span>·</span>
                    <span>Poin Apresiasi: <strong>+{achievement.points} Poin</strong></span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 font-sans text-xs">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-semibold text-slate-900">{identity.headmasterTitle},</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-950">{identity.headmasterName}</p>
                  <p className="text-slate-600">NIP. {identity.headmasterNip}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">{cityShort}, {currentDate}</p>
                  <p className="font-semibold text-slate-900">{identity.counselorTitle},</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-950">{identity.counselorName}</p>
                  <p className="text-slate-600">NIP. {identity.counselorNip}</p>
                </div>
              </div>
            </div>
          )}

          {type === 'monthly_report' && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-base font-bold underline uppercase tracking-wide">
                  LAPORAN REKAPITULASI PELANGGARAN & PRESTASI SISWA
                </h3>
                <p className="text-xs text-slate-700 font-sans mt-1">
                  Periode: Semester {identity.semester} T.A {identity.academicYear}
                </p>
              </div>
              <p className="text-xs text-slate-600 mb-4 font-sans">
                Ringkasan komprehensif perilaku peserta didik dan tindak lanjut bimbingan konseling di {identity.schoolName}:
              </p>
              <div className="border border-slate-300 rounded font-sans text-xs overflow-hidden mb-6">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Indikator Kedisiplinan</th>
                      <th className="py-2 px-3 text-right">Jumlah Kasus</th>
                      <th className="py-2 px-3">Status Penyelesaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3">1</td>
                      <td className="py-2 px-3">Pelanggaran Kategori Ringan</td>
                      <td className="py-2 px-3 text-right font-mono">14 Kasus</td>
                      <td className="py-2 px-3 text-emerald-700 font-medium">100% Selesai Dibina</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">2</td>
                      <td className="py-2 px-3">Pelanggaran Kategori Sedang</td>
                      <td className="py-2 px-3 text-right font-mono">6 Kasus</td>
                      <td className="py-2 px-3 text-amber-700 font-medium">Surat Perjanjian & Panggilan Ortu I</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">3</td>
                      <td className="py-2 px-3">Pelanggaran Kategori Berat</td>
                      <td className="py-2 px-3 text-right font-mono">2 Kasus</td>
                      <td className="py-2 px-3 text-red-700 font-medium">Konferensi Kasus & Pemantauan Khusus</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">4</td>
                      <td className="py-2 px-3">Prestasi & Apresiasi Karakter</td>
                      <td className="py-2 px-3 text-right font-mono">8 Penghargaan</td>
                      <td className="py-2 px-3 text-blue-700 font-medium">Piagam Diterbitkan</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 font-sans text-xs">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-semibold text-slate-900">{identity.headmasterTitle},</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-950">{identity.headmasterName}</p>
                  <p className="text-slate-600">NIP. {identity.headmasterNip}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">{cityShort}, {currentDate}</p>
                  <p className="font-semibold text-slate-900">{identity.counselorTitle},</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-950">{identity.counselorName}</p>
                  <p className="text-slate-600">NIP. {identity.counselorNip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
