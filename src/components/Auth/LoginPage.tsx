import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  GraduationCap,
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Building,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs, teachers, settings } = useApp();

  const [roleTab, setRoleTab] = useState<UserRole>('guru');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill hint helper when switching tabs
  const handleTabChange = (role: UserRole) => {
    setRoleTab(role);
    setErrorMessage(null);
    if (role === 'admin') {
      setIdentifier('admin.kurikulum@sekolah.sch.id');
      setPassword('admin123');
    } else {
      setIdentifier('ahmad.dahlan@sekolah.sch.id');
      setPassword('guru123');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan NIP atau Email Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(identifier, password, roleTab);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.message);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/40 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Brand & Logos Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4">
            {/* Logo Instansi */}
            {settings.showLogoInstansi && settings.logoInstansiUrl && (
              <div className="w-14 h-14 bg-white p-1 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                <img
                  src={settings.logoInstansiUrl}
                  alt="Logo Instansi"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            {/* Logo Lembaga */}
            {settings.showLogoLembaga && settings.logoLembagaUrl && (
              <div className="w-14 h-14 bg-white p-1 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                <img
                  src={settings.logoLembagaUrl}
                  alt="Logo Lembaga"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800 mb-1 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Portal Penilaian Tengah Semester (UTS / PTS)
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif">
              {settings.schoolName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tahun Ajaran {settings.academicYear} · Semester {settings.semester}
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
          
          {/* Role Segmented Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabChange('guru')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                roleTab === 'guru'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Login Guru &amp; Wali</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                roleTab === 'admin'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Login Administrator</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {roleTab === 'guru' ? 'Masuk Portal Guru & Wali Kelas' : 'Masuk Portal Administrator'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {roleTab === 'guru'
                  ? 'Kelola nilai mata pelajaran, leger nilai kelas binaan, dan cetak rapor UTS'
                  : 'Kelola data master siswa, mata pelajaran, KKM, dan sinkronisasi Spreadsheet'}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  {roleTab === 'guru' ? 'NIP atau Alamat Email Guru' : 'Email Administrator'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {roleTab === 'guru' ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      roleTab === 'guru'
                        ? 'Contoh: ahmad.dahlan@sekolah.sch.id / NIP'
                        : 'Contoh: admin.kurikulum@sekolah.sch.id'
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Kata Sandi (Password)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Bawaan: {roleTab === 'admin' ? 'admin123' : 'guru123'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 text-xs">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Ingat sesi masuk di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ${
                  roleTab === 'admin'
                    ? 'bg-indigo-700 hover:bg-indigo-800'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {isLoading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Aplikasi</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick 1-Click Login Shortcuts Card */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-700 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Masuk Cepat untuk Uji Coba (1-Klik):
              </span>
            </div>

            <div className="space-y-1.5">
              {roleTab === 'guru' ? (
                <>
                  <button
                    type="button"
                    onClick={() => quickLoginAs('t-1')}
                    className="w-full p-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">Ahmad Dahlan, S.Pd.I</p>
                      <p className="text-[10px] text-slate-500">
                        Wali Kelas VII-A · Pengampu PAI &amp; Bahasa Arab
                      </p>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      Pilih <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickLoginAs('t-2')}
                    className="w-full p-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">Siti Nurjanah, M.Pd</p>
                      <p className="text-[10px] text-slate-500">
                        Wali Kelas VII-B · Pengampu Bahasa Indonesia &amp; IPS
                      </p>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      Pilih <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => quickLoginAs('t-admin')}
                  className="w-full p-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-left transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">Administrator Kurikulum</p>
                    <p className="text-[10px] text-slate-500">
                      Hak Akses Penuh Data Siswa, Mapel, Guru &amp; GAS
                    </p>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
                    Pilih <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* System Info Footnote */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>
            Terintegrasi dengan Google Spreadsheet melalui Google Apps Script (Web App REST API)
          </p>
          <p className="text-slate-400">
            MTs S Diponegoro · Sistem Penilaian Ujian Tengah Semester &amp; Leger Terpadu
          </p>
        </div>

      </div>
    </div>
  );
};
