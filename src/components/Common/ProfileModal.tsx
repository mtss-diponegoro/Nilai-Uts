import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  X,
  Save,
  CheckCircle2,
  GraduationCap,
  Shield,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    updateTeacher,
    isProfileModalOpen,
    setIsProfileModalOpen,
    classes,
    subjects,
  } = useApp();

  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setNip(currentUser.nip || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setGender(currentUser.gender || 'L');
      setPassword(currentUser.password || '');
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  const homeroomClass = classes.find((c) => c.id === currentUser.homeroomClassId);
  const taughtSubjects = subjects.filter((s) => currentUser.taughtSubjectIds?.includes(s.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nip.trim() || !email.trim()) {
      alert('Nama, NIP, dan Email tidak boleh kosong.');
      return;
    }

    updateTeacher({
      ...currentUser,
      name,
      nip,
      email,
      phone,
      gender,
      password: password || currentUser.password || 'guru123',
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              {name ? name.charAt(0) : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Edit Identitas Profil Saya
              </h3>
              <p className="text-xs text-slate-500">
                Perbarui data profil pengajar, kontak, dan kata sandi akun Anda
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Identitas berhasil diperbarui!</span>
            </div>
          )}

          {/* Current Role & Assignment Info Strip */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Hak Akses Sistem:</span>
              <span className="font-bold text-slate-800 uppercase text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                {currentUser.role === 'admin' ? 'Administrator' : 'Tenaga Pendidik / Guru'}
              </span>
            </div>

            {currentUser.isHomeroom && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Wali Kelas:
                </span>
                <span className="font-bold text-emerald-800">
                  {homeroomClass?.name || 'Kelas Binaan'}
                </span>
              </div>
            )}

            {taughtSubjects.length > 0 && (
              <div className="pt-1 border-t border-slate-200/60">
                <span className="text-[11px] text-slate-500 block mb-1">Mata Pelajaran:</span>
                <div className="flex flex-wrap gap-1">
                  {taughtSubjects.map((s) => (
                    <span
                      key={s.id}
                      className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium"
                    >
                      {s.code} - {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inputs */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
              Nama Lengkap beserta Gelar Akademik <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmad Dahlan, S.Pd.I"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                NIP / NUPTK <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="198203152009011012"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama.guru@sekolah.sch.id"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Nomor WhatsApp / Telepon
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
              Kata Sandi Akun (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru..."
                className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Kata sandi ini digunakan untuk masuk ke halaman portal penilaian.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan Identitas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
