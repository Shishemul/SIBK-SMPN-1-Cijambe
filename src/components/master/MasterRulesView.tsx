import React, { useState } from 'react';
import {
  ShieldAlert,
  Award,
  Plus,
  Trash2,
  Edit2,
  Search,
  BookOpen,
} from 'lucide-react';
import {
  ViolationMaster,
  AchievementMaster,
  ViolationCategory,
  AchievementCategory,
  AchievementLevel,
  UserAccount,
} from '../../types';

interface MasterRulesViewProps {
  currentUser: UserAccount;
  violationMasters: ViolationMaster[];
  achievementMasters: AchievementMaster[];
  onAddViolationMaster: (item: Omit<ViolationMaster, 'id'>) => void;
  onDeleteViolationMaster: (id: string) => void;
  onAddAchievementMaster: (item: Omit<AchievementMaster, 'id'>) => void;
  onDeleteAchievementMaster: (id: string) => void;
}

export const MasterRulesView: React.FC<MasterRulesViewProps> = ({
  currentUser,
  violationMasters,
  achievementMasters,
  onAddViolationMaster,
  onDeleteViolationMaster,
  onAddAchievementMaster,
  onDeleteAchievementMaster,
}) => {
  const [activeTab, setActiveTab] = useState<'violations' | 'achievements'>('violations');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddViolationModalOpen, setIsAddViolationModalOpen] = useState(false);
  const [isAddAchievementModalOpen, setIsAddAchievementModalOpen] = useState(false);

  // New Violation Master State
  const [vCode, setVCode] = useState('');
  const [vName, setVName] = useState('');
  const [vCategory, setVCategory] = useState<ViolationCategory>('ringan');
  const [vPoints, setVPoints] = useState(10);
  const [vDescription, setVDescription] = useState('');
  const [vDefaultAction, setVDefaultAction] = useState('');

  // New Achievement Master State
  const [aCode, setACode] = useState('');
  const [aName, setAName] = useState('');
  const [aCategory, setACategory] = useState<AchievementCategory>('akademik');
  const [aLevel, setALevel] = useState<AchievementLevel>('kabupaten');
  const [aPoints, setAPoints] = useState(30);
  const [aDescription, setADescription] = useState('');

  const handleAddViolationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName) return;
    onAddViolationMaster({
      code: vCode || `PL-${vCategory.charAt(0).toUpperCase()}${Date.now().toString().slice(-2)}`,
      name: vName,
      category: vCategory,
      points: Number(vPoints),
      description: vDescription,
      defaultAction: vDefaultAction || 'Teguran lisan & pembinaan konseling',
    });
    setIsAddViolationModalOpen(false);
    setVCode('');
    setVName('');
    setVDescription('');
    setVDefaultAction('');
  };

  const handleAddAchievementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aName) return;
    onAddAchievementMaster({
      code: aCode || `PR-${Date.now().toString().slice(-2)}`,
      name: aName,
      category: aCategory,
      level: aLevel,
      points: Number(aPoints),
      description: aDescription,
    });
    setIsAddAchievementModalOpen(false);
    setACode('');
    setAName('');
    setADescription('');
  };

  const filteredViolations = violationMasters.filter(
    (vm) =>
      vm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vm.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAchievements = achievementMasters.filter(
    (am) =>
      am.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      am.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = currentUser.role === 'superadmin' || currentUser.role === 'guru';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Master Aturan & Bobot Poin Tata Tertib
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pedoman pembobotan poin kedisiplinan dan apresiasi prestasi siswa SMP Negeri 1 Cijambe
          </p>
        </div>

        {canEdit && (
          <div>
            {activeTab === 'violations' ? (
              <button
                onClick={() => setIsAddViolationModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + Tambah Jenis Pelanggaran
              </button>
            ) : (
              <button
                onClick={() => setIsAddAchievementModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + Tambah Jenis Prestasi
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('violations')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'violations'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Katalog Pelanggaran ({violationMasters.length})
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Katalog Prestasi ({achievementMasters.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari aturan, kode tata tertib, atau deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-hidden text-slate-800"
          />
        </div>
      </div>

      {/* Tab Violations Content */}
      {activeTab === 'violations' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Kode</th>
                <th className="py-3 px-4 font-semibold">Jenis Pelanggaran</th>
                <th className="py-3 px-3 font-semibold">Kategori</th>
                <th className="py-3 px-3 font-semibold text-center">Bobot Poin</th>
                <th className="py-3 px-4 font-semibold">Tindakan Sanksi Default</th>
                {canEdit && <th className="py-3 px-4 font-semibold text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredViolations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        item.category === 'berat'
                          ? 'bg-rose-100 text-rose-800'
                          : item.category === 'sedang'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold text-rose-600 text-sm">+{item.points}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{item.defaultAction}</td>
                  {canEdit && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus aturan ${item.name}?`)) {
                            onDeleteViolationMaster(item.id);
                          }
                        }}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer"
                        title="Hapus Aturan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Achievements Content */}
      {activeTab === 'achievements' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Kode</th>
                <th className="py-3 px-4 font-semibold">Nama Apresiasi / Kejuaraan</th>
                <th className="py-3 px-3 font-semibold">Kategori</th>
                <th className="py-3 px-3 font-semibold">Tingkat</th>
                <th className="py-3 px-3 font-semibold text-center">Poin Apresiasi</th>
                {canEdit && <th className="py-3 px-4 font-semibold text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAchievements.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                  </td>
                  <td className="py-3 px-3 capitalize text-slate-700">{item.category.replace('_', ' ')}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                      {item.level}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold text-amber-600 text-sm">+{item.points}</span>
                  </td>
                  {canEdit && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus master prestasi ${item.name}?`)) {
                            onDeleteAchievementMaster(item.id);
                          }
                        }}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer"
                        title="Hapus Master"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add Violation Master */}
      {isAddViolationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 overflow-hidden">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Tambah Master Aturan Pelanggaran
            </h3>

            <form onSubmit={handleAddViolationSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Aturan</label>
                  <input
                    type="text"
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value)}
                    placeholder="Contoh: PL-R05"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Pelanggaran</label>
                  <select
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value as ViolationCategory)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="ringan">Ringan (5 - 15 Poin)</option>
                    <option value="sedang">Sedang (20 - 45 Poin)</option>
                    <option value="berat">Berat (50 - 100 Poin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pelanggaran</label>
                <input
                  type="text"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="Contoh: Membawa senjata mainan berbahaya..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bobot Poin</label>
                  <input
                    type="number"
                    value={vPoints}
                    onChange={(e) => setVPoints(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tindakan / Sanksi Default</label>
                  <input
                    type="text"
                    value={vDefaultAction}
                    onChange={(e) => setVDefaultAction(e.target.value)}
                    placeholder="Panggilan ortu, teguran, skorsing..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi & Ruang Lingkup</label>
                <textarea
                  rows={2}
                  value={vDescription}
                  onChange={(e) => setVDescription(e.target.value)}
                  placeholder="Penjelasan detail pelanggaran sesuai buku saku tata tertib..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddViolationModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Achievement Master */}
      {isAddAchievementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 overflow-hidden">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Tambah Master Prestasi Siswa
            </h3>

            <form onSubmit={handleAddAchievementSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Prestasi</label>
                  <input
                    type="text"
                    value={aCode}
                    onChange={(e) => setACode(e.target.value)}
                    placeholder="Contoh: PR-A05"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={aCategory}
                    onChange={(e) => setACategory(e.target.value as AchievementCategory)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="akademik">Akademik</option>
                    <option value="non_akademik">Non-Akademik / Seni Olahraga</option>
                    <option value="keagamaan">Keagamaan / MTQ / Tahfidz</option>
                    <option value="kepemimpinan">Kepemimpinan / Organisasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Prestasi / Kegiatan</label>
                <input
                  type="text"
                  value={aName}
                  onChange={(e) => setAName(e.target.value)}
                  placeholder="Contoh: Juara Lomba Cerdas Cermat..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Penyelenggaraan</label>
                  <select
                    value={aLevel}
                    onChange={(e) => setALevel(e.target.value as AchievementLevel)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="sekolah">Tingkat Sekolah</option>
                    <option value="kecamatan">Tingkat Kecamatan</option>
                    <option value="kabupaten">Tingkat Kabupaten Subang</option>
                    <option value="provinsi">Tingkat Provinsi Jawa Barat</option>
                    <option value="nasional">Tingkat Nasional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Poin Apresiasi Karakter</label>
                  <input
                    type="number"
                    value={aPoints}
                    onChange={(e) => setAPoints(Number(e.target.value))}
                    min={5}
                    max={100}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Tambahan</label>
                <textarea
                  rows={2}
                  value={aDescription}
                  onChange={(e) => setADescription(e.target.value)}
                  placeholder="Keterangan jenis sertifikasi atau ketentuan piagam..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAchievementModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Simpan Master Prestasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
