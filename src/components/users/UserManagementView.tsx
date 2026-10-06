import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  HeartHandshake,
  GraduationCap,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Phone,
  KeyRound,
  Filter,
} from 'lucide-react';
import { UserAccount, UserRole, Student } from '../../types';
import { StudentSearchSelect } from '../common/StudentSearchSelect';

interface UserManagementViewProps {
  currentUser: UserAccount;
  users: UserAccount[];
  students: Student[];
  onAddUser: (user: Omit<UserAccount, 'id'>) => void;
  onUpdateUser: (id: string, updated: Partial<UserAccount>) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  users,
  students,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('guru');
  const [newNipOrNisn, setNewNipOrNisn] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUsername) {
      alert('Nama lengkap dan username wajib diisi.');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === newUsername.toLowerCase())) {
      alert('Username tersebut sudah digunakan oleh akun lain. Silakan pilih username lain.');
      return;
    }

    onAddUser({
      name: newName,
      username: newUsername.toLowerCase().trim(),
      role: newRole,
      nipOrNisn: newNipOrNisn || undefined,
      phone: newPhone || undefined,
      className: newClassName || undefined,
      studentId: selectedStudentId || undefined,
      status: 'aktif',
      createdAt: new Date().toISOString().substring(0, 10),
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser.id, {
      name: editingUser.name,
      nipOrNisn: editingUser.nipOrNisn,
      phone: editingUser.phone,
      className: editingUser.className,
      role: editingUser.role,
      status: editingUser.status,
    });

    setEditingUser(null);
  };

  const resetForm = () => {
    setNewName('');
    setNewUsername('');
    setNewRole('guru');
    setNewNipOrNisn('');
    setNewPhone('');
    setNewClassName('');
    setSelectedStudentId('');
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.nipOrNisn && u.nipOrNisn.includes(searchTerm)) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'superadmin':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Superadmin
          </span>
        );
      case 'guru':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <HeartHandshake className="w-3 h-3" />
            Guru BP/BK
          </span>
        );
      case 'siswa':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            Siswa
          </span>
        );
      case 'wali_murid':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Wali Murid
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Manajemen Pengguna (User Management)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan akun akses sistem SI-BK SMP Negeri 1 Cijambe untuk Guru BK, Staf Administrator, Siswa, dan Wali Murid
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          + Tambah Pengguna Baru
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Akun Terdaftar</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{users.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Guru & Staf BK</span>
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {users.filter((u) => u.role === 'guru' || u.role === 'superadmin').length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Siswa & Wali Murid</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            {users.filter((u) => u.role === 'siswa' || u.role === 'wali_murid').length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Status Akun Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {users.filter((u) => u.status !== 'nonaktif').length}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 min-w-[280px] items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama pengguna, username, NIP, atau no. telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-hidden text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              roleFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('superadmin')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              roleFilter === 'superadmin' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setRoleFilter('guru')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              roleFilter === 'guru' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guru BK
          </button>
          <button
            onClick={() => setRoleFilter('siswa')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              roleFilter === 'siswa' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Siswa
          </button>
          <button
            onClick={() => setRoleFilter('wali_murid')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              roleFilter === 'wali_murid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wali Murid
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Data Pengguna</p>
            <p className="text-xs text-slate-400 mt-1">Tidak ditemukan akun dengan kata kunci "{searchTerm}".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Lengkap & Identitas</th>
                  <th className="py-3 px-3 font-semibold">Username Login</th>
                  <th className="py-3 px-3 font-semibold">Hak Akses Role</th>
                  <th className="py-3 px-3 font-semibold">NIP / NISN</th>
                  <th className="py-3 px-3 font-semibold">No. Telepon / WA</th>
                  <th className="py-3 px-3 font-semibold">Status Akun</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          {user.className && (
                            <div className="text-[11px] text-slate-400">Kelas: {user.className}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-700">
                      @{user.username}
                    </td>
                    <td className="py-3 px-3">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {user.nipOrNisn || '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {user.phone || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          user.status === 'nonaktif'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {user.status === 'nonaktif' ? 'Nonaktif' : 'Aktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus akun pengguna @${user.username} (${user.name})?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Pengguna Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto my-auto">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Tambah Pengguna Baru SI-BK
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Pengguna
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Dra. Hj. Euis Komariah, M.Pd."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Login
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Contoh: euis_bk"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran / Hak Akses Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="guru">Guru BP / BK</option>
                    <option value="superadmin">Superadmin / Kepala Sekolah</option>
                    <option value="siswa">Peserta Didik (Siswa)</option>
                    <option value="wali_murid">Orang Tua / Wali Murid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NUPTK / NISN
                  </label>
                  <input
                    type="text"
                    value={newNipOrNisn}
                    onChange={(e) => setNewNipOrNisn(e.target.value)}
                    placeholder="Nomor identitas kedinasan/sekolah"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. WhatsApp Aktif
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {(newRole === 'siswa' || newRole === 'wali_murid') && (
                <StudentSearchSelect
                  students={students}
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={(std) => {
                    setSelectedStudentId(std ? std.id : '');
                    if (std) setNewClassName(std.className);
                  }}
                  mode="counseling"
                  label="Hubungkan dengan Siswa Terdaftar:"
                  required={newRole === 'siswa'}
                />
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Simpan Pengguna Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Pengguna */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto my-auto">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              Perbarui Data Pengguna: @{editingUser.username}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Akun
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="guru">Guru BP / BK</option>
                    <option value="superadmin">Superadmin / Kepala Sekolah</option>
                    <option value="siswa">Peserta Didik</option>
                    <option value="wali_murid">Orang Tua / Wali Murid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Akun
                  </label>
                  <select
                    value={editingUser.status || 'aktif'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'aktif' | 'nonaktif' })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NISN
                  </label>
                  <input
                    type="text"
                    value={editingUser.nipOrNisn || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, nipOrNisn: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
