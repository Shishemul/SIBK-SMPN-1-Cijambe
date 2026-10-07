import React, { useState, useMemo, useEffect } from 'react';
import { Search, User, Filter, Check, RotateCcw, AlertTriangle, Award, GraduationCap, X } from 'lucide-react';
import { Student } from '../../types';

interface StudentSearchSelectProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (student: Student | null) => void;
  mode?: 'violation' | 'achievement' | 'counseling';
  label?: string;
  required?: boolean;
}

export const StudentSearchSelect: React.FC<StudentSearchSelectProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  mode = 'violation',
  label = 'Pilih Siswa',
  required = true,
}) => {
  const [searchName, setSearchName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(!selectedStudentId);

  // Get currently selected student
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Keep view in sync if selectedStudentId changes externally
  useEffect(() => {
    if (selectedStudentId) {
      setIsSearching(false);
    }
  }, [selectedStudentId]);

  // Extract distinct class list
  const availableClasses = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.className))).filter(Boolean);
    return list.sort();
  }, [students]);

  // Filter students based on name and class
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === 'all' || s.className === selectedClass;
      const term = searchName.toLowerCase().trim();
      const matchName =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.nisn.includes(term) ||
        (s.nis && s.nis.includes(term));
      return matchClass && matchName;
    });
  }, [students, selectedClass, searchName]);

  const handleSelect = (student: Student) => {
    onSelectStudent(student);
    setIsSearching(false);
  };

  const handleClearSelection = () => {
    onSelectStudent(null);
    setIsSearching(true);
  };

  const themeColors = {
    violation: {
      border: 'border-rose-200 focus-within:border-rose-400',
      activeRing: 'focus:ring-rose-500',
      selectedBg: 'bg-rose-50/70 border-rose-200',
      badge: 'bg-rose-100 text-rose-800',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    achievement: {
      border: 'border-amber-200 focus-within:border-amber-400',
      activeRing: 'focus:ring-amber-500',
      selectedBg: 'bg-amber-50/70 border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    counseling: {
      border: 'border-blue-200 focus-within:border-blue-400',
      activeRing: 'focus:ring-blue-500',
      selectedBg: 'bg-blue-50/70 border-blue-200',
      badge: 'bg-blue-100 text-blue-800',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  }[mode];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {selectedStudent && !isSearching && (
          <button
            type="button"
            onClick={() => setIsSearching(true)}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Cari / Ganti Siswa
          </button>
        )}
      </div>

      {/* Selected Student Card */}
      {selectedStudent && !isSearching ? (
        <div className={`p-3 rounded-lg border ${themeColors.selectedBg} flex items-center justify-between gap-3 shadow-2xs`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-200 shrink-0">
              {selectedStudent.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                  {selectedStudent.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                  Kelas {selectedStudent.className}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  NISN: {selectedStudent.nisn}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1 flex-wrap">
                <span>Wali: {selectedStudent.parentName} ({selectedStudent.parentPhone})</span>
                {mode === 'violation' && (
                  <span className="font-medium text-rose-600">
                    Poin Pelanggaran: {selectedStudent.totalViolationPoints}
                  </span>
                )}
                {mode === 'achievement' && (
                  <span className="font-medium text-amber-600">
                    Poin Prestasi: {selectedStudent.totalAchievementPoints}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-md transition-colors cursor-pointer shrink-0"
            title="Hapus pilihan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Student Search & Class Filter UI */
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            {/* Filter Kelas */}
            <div className="sm:col-span-4">
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full text-xs pl-8 pr-2 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Semua Kelas ({students.length})</option>
                  {availableClasses.map((cls) => {
                    const count = students.filter((s) => s.className === cls).length;
                    return (
                      <option key={cls} value={cls}>
                        Kelas {cls} ({count} siswa)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Pencarian Nama Siswa / NISN */}
            <div className="sm:col-span-8">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Cari nama siswa atau NISN..."
                  className="w-full text-xs pl-8 pr-7 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                  autoFocus
                />
                {searchName && (
                  <button
                    type="button"
                    onClick={() => setSearchName('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick info of matches */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
            <span>
              Menampilkan <span className="font-semibold text-slate-700">{filteredStudents.length}</span> dari {students.length} siswa
              {selectedClass !== 'all' && ` di Kelas ${selectedClass}`}
              {searchName && ` cocok "${searchName}"`}
            </span>
            {selectedStudent && (
              <button
                type="button"
                onClick={() => setIsSearching(false)}
                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Batal cari
              </button>
            )}
          </div>

          {/* List of Matched Students */}
          <div className="max-h-48 overflow-y-auto border border-slate-200 bg-white rounded-lg divide-y divide-slate-100 shadow-2xs">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                <User className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                Tidak ditemukan siswa dengan nama & kelas tersebut.
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchName('');
                      setSelectedClass('all');
                    }}
                    className="text-blue-600 hover:underline font-medium text-[11px]"
                  >
                    Reset Filter Pencarian
                  </button>
                </div>
              </div>
            ) : (
              filteredStudents.map((s) => {
                const isCurrent = s.id === selectedStudentId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                      isCurrent ? 'bg-blue-50/70 text-blue-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 text-xs truncate">
                            {s.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {s.className}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          NISN: {s.nisn} | Wali: {s.parentName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {mode === 'violation' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          s.totalViolationPoints >= 50
                            ? 'bg-rose-100 text-rose-700'
                            : s.totalViolationPoints >= 25
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.totalViolationPoints} Poin
                        </span>
                      )}
                      {mode === 'achievement' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-700">
                          +{s.totalAchievementPoints} Poin
                        </span>
                      )}
                      {mode === 'counseling' && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            s.counselorName
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {s.counselorName ? `Konselor: ${s.counselorName.split(',')[0]}` : 'Tanpa Konselor'}
                        </span>
                      )}
                      <span className="text-xs text-blue-600 font-semibold px-2 py-1 rounded bg-blue-50 hover:bg-blue-100">
                        Pilih
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
