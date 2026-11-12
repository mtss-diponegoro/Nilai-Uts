import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Teacher, UserRole, Gender } from '../../types';
import {
  UserCheck,
  Shield,
  BookOpen,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Search,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const TeacherManagementView: React.FC = () => {
  const {
    teachers,
    classes,
    subjects,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    setActiveTeacherId,
    setCurrentRole,
    setActiveView,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'guru' | 'wali' | 'admin'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    email: '',
    phone: '',
    gender: 'L' as Gender,
    role: 'guru' as UserRole,
    isHomeroom: false,
    homeroomClassId: classes[0]?.id || '',
    taughtSubjectIds: [] as string[],
    password: 'guru123',
  });

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nip.includes(searchQuery) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (roleFilter === 'admin') return t.role === 'admin';
      if (roleFilter === 'guru') return t.role === 'guru';
      if (roleFilter === 'wali') return t.isHomeroom;

      return true;
    });
  }, [teachers, searchQuery, roleFilter]);

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      nip: `1985${String(Date.now()).slice(-8)}`,
      name: '',
      email: '',
      phone: '',
      gender: 'L',
      role: 'guru',
      isHomeroom: false,
      homeroomClassId: classes[0]?.id || '',
      taughtSubjectIds: subjects.slice(0, 1).map((s) => s.id),
      password: 'guru123',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nip: teacher.nip,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      gender: teacher.gender || 'L',
      role: teacher.role,
      isHomeroom: teacher.isHomeroom,
      homeroomClassId: teacher.homeroomClassId || classes[0]?.id || '',
      taughtSubjectIds: teacher.taughtSubjectIds || [],
      password: teacher.password || (teacher.role === 'admin' ? 'admin123' : 'guru123'),
    });
    setIsModalOpen(true);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData((prev) => {
      const exists = prev.taughtSubjectIds.includes(subjectId);
      return {
        ...prev,
        taughtSubjectIds: exists
          ? prev.taughtSubjectIds.filter((id) => id !== subjectId)
          : [...prev.taughtSubjectIds, subjectId],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nip.trim() || !formData.email.trim()) {
      alert('Nama, NIP, dan Email wajib diisi.');
      return;
    }

    const payload = {
      ...formData,
      homeroomClassId: formData.isHomeroom ? formData.homeroomClassId : undefined,
    };

    if (editingTeacher) {
      updateTeacher({
        ...editingTeacher,
        ...payload,
      });
    } else {
      addTeacher(payload);
    }

    setIsModalOpen(false);
  };

  const handleImpersonateTeacher = (teacherId: string) => {
    setActiveTeacherId(teacherId);
    setCurrentRole('guru');
    setActiveView('walikelas_ledger');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Pengelolaan Data Guru &amp; Wali Kelas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah guru baru, perbarui identitas pengajar, atur penugasan mata pelajaran, dan wali kelas
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tambah Guru Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau email guru..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Filter:</span>
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              roleFilter === 'all'
                ? 'bg-slate-800 text-white font-medium'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua ({teachers.length})
          </button>
          <button
            onClick={() => setRoleFilter('guru')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              roleFilter === 'guru'
                ? 'bg-emerald-700 text-white font-medium'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Guru Pengampu
          </button>
          <button
            onClick={() => setRoleFilter('wali')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              roleFilter === 'wali'
                ? 'bg-emerald-700 text-white font-medium'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Wali Kelas
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              roleFilter === 'admin'
                ? 'bg-indigo-700 text-white font-medium'
                : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Teachers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => {
          const homeroomClass = classes.find((c) => c.id === teacher.homeroomClassId);
          const taughtSubs = subjects.filter((s) => teacher.taughtSubjectIds?.includes(s.id));

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-2xs ${
                        teacher.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{teacher.name}</h3>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">NIP. {teacher.nip}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Identitas & Penugasan Guru"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {teacher.id !== 't-admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus guru ${teacher.name}?`)) {
                            deleteTeacher(teacher.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Guru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      teacher.role === 'admin'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {teacher.role === 'admin' ? 'Administrator' : 'Guru Pengampu'}
                  </span>

                  {teacher.isHomeroom && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      Wali {homeroomClass?.name || 'Kelas'}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-800 truncate">{teacher.email}</span>
                  </div>

                  {teacher.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-800">{teacher.phone}</span>
                    </div>
                  )}

                  {taughtSubs.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Mapel yang Diampu:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {taughtSubs.map((s) => (
                          <span
                            key={s.id}
                            className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium border border-slate-200"
                          >
                            {s.code} - {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => openEditModal(teacher)}
                  className="flex-1 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3 h-3 text-slate-500" />
                  Edit Identitas
                </button>

                {teacher.role === 'guru' && (
                  <button
                    onClick={() => handleImpersonateTeacher(teacher.id)}
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    Masuk Akun &rarr;
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                {editingTeacher ? 'Edit Identitas & Penugasan Guru' : 'Tambah Tenaga Pendidik / Guru Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    NIP / NUPTK <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="198203152009011012"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="L">Laki-laki (Bapak Guru)</option>
                    <option value="P">Perempuan (Ibu Guru)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap beserta Gelar Akademik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Ahmad Dahlan, S.Pd.I"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Alamat Email (Username Login) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama.guru@sekolah.sch.id"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Peran Hak Akses (Role)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="guru">Guru Pengampu</option>
                    <option value="admin">Administrator Kurikulum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Kata Sandi Akun (Password)
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="guru123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Homeroom Assignment */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.isHomeroom}
                      onChange={(e) => setFormData({ ...formData, isHomeroom: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Menjabat sebagai Wali Kelas</span>
                  </label>
                  {formData.isHomeroom && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Aktif Wali Kelas
                    </span>
                  )}
                </div>

                {formData.isHomeroom && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Pilih Kelas Binaan:
                    </label>
                    <select
                      value={formData.homeroomClassId}
                      onChange={(e) => setFormData({ ...formData, homeroomClassId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.academicYear})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Taught Subjects Selection */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Pilih Mata Pelajaran yang Diampu Guru Ini:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                  {subjects.map((sub) => {
                    const isChecked = formData.taughtSubjectIds.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs ${
                          isChecked ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSubjectToggle(sub.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="truncate">
                          [{sub.code}] {sub.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                >
                  {editingTeacher ? 'Simpan Perubahan Identitas' : 'Simpan Guru Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
