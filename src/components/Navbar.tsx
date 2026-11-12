import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Database,
  UserCheck,
  Shield,
  Layers,
  BookOpen,
  FileSpreadsheet,
  Users,
  Settings,
  Printer,
  Sliders,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  User,
  Edit3,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeTeacherId,
    setActiveTeacherId,
    activeTeacher,
    teachers,
    activeView,
    setActiveView,
    gasConfig,
    setIsGasModalOpen,
    syncToGasNow,
    currentUser,
    logout,
    setIsProfileModalOpen,
  } = useApp();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isHomeroomTeacher = activeTeacher?.isHomeroom;

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Primary Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                SiNilai UTS
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                GAS Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              MTs S Diponegoro · Semester Ganjil 2024/2025
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single-line, concise) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto text-sm font-medium text-slate-600">
          {currentRole === 'guru' ? (
            <>
              <button
                onClick={() => setActiveView('teacher_grades')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'teacher_grades'
                    ? 'bg-slate-100 text-emerald-800 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Input Nilai Mapel
              </button>

              <button
                onClick={() => setActiveView('teacher_analytics')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'teacher_analytics'
                    ? 'bg-slate-100 text-emerald-800 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 text-slate-500" />
                Statistik Nilai
              </button>

              {/* Walikelas Menu Group */}
              <div className="h-5 w-px bg-slate-200 mx-1" />

              <button
                onClick={() => setActiveView('walikelas_ledger')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView.startsWith('walikelas_') && activeView === 'walikelas_ledger'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-emerald-700 hover:bg-emerald-50 font-medium'
                }`}
                title="Leger Nilai Seluruh Mapel Kelas Binaan"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Leger Kelas (Wali)
              </button>

              <button
                onClick={() => setActiveView('walikelas_attendance')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'walikelas_attendance'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-emerald-700 hover:bg-emerald-50 font-medium'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Presensi & Catatan
              </button>

              <button
                onClick={() => setActiveView('walikelas_rapor')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'walikelas_rapor'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50 font-medium'
                }`}
              >
                <Printer className="w-4 h-4" />
                Menu Cetak
              </button>

              <button
                onClick={() => setActiveView('walikelas_kop')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'walikelas_kop'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50 font-medium'
                }`}
                title="Pengaturan Kop Cetak & Logo Instansi/Lembaga"
              >
                <Sliders className="w-4 h-4" />
                Kop &amp; Logo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeView === 'dashboard' ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Ringkasan Admin
              </button>
              <button
                onClick={() => setActiveView('students')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'students' ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Data Siswa
              </button>
              <button
                onClick={() => setActiveView('subjects')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'subjects' ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Mata Pelajaran
              </button>
              <button
                onClick={() => setActiveView('teachers')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'teachers' ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Guru & Wali Kelas
              </button>
              <button
                onClick={() => setActiveView('school_ledger')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'school_ledger' ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Leger Sekolah
              </button>
              <button
                onClick={() => setActiveView('settings')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'settings' ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                Pengaturan
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action & Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Google Apps Script Sync Quick Button */}
          <button
            onClick={() => setIsGasModalOpen(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-2 whitespace-nowrap ${
              gasConfig.webAppUrl
                ? gasConfig.syncStatus === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : gasConfig.syncStatus === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
            title="Konfigurasi Integrasi Google Apps Script (Spreadsheet)"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">
              {gasConfig.webAppUrl ? (
                gasConfig.syncStatus === 'syncing' ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Sinkron...
                  </span>
                ) : gasConfig.lastSyncTimestamp ? (
                  `GAS: Sync ${gasConfig.lastSyncTimestamp}`
                ) : (
                  'GAS Terhubung'
                )
              ) : (
                'Hubungkan GAS'
              )}
            </span>
            <span className="sm:hidden">GAS</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setCurrentRole('admin')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                currentRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              Admin
            </button>
            <button
              onClick={() => setCurrentRole('guru')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                currentRole === 'guru'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Guru / Wali
            </button>
          </div>

          {/* Active Teacher Selector (when in Guru role) */}
          {currentRole === 'guru' && (
            <div className="hidden lg:flex items-center text-xs">
              <select
                value={activeTeacherId}
                onChange={(e) => setActiveTeacherId(e.target.value)}
                aria-label="Pilih Guru Aktif"
                className="bg-white border border-slate-200 text-slate-700 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {teachers
                  .filter((t) => t.role === 'guru')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.isHomeroom ? `(Wali ${t.homeroomClassId?.replace('c-', '').toUpperCase()})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* User Profile Button (Edit Identitas) */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors text-left"
            title="Klik untuk Edit Identitas Saya"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                {currentUser?.name || 'Profil Pengguna'}
              </p>
              <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                <Edit3 className="w-2.5 h-2.5" />
                Edit Identitas
              </p>
            </div>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1.5 text-xs cursor-pointer active:scale-95 shadow-2xs"
            title="Keluar dari Akun (Logout)"
            aria-label="Keluar dari Akun"
          >
            <LogOut className="w-3.5 h-3.5 transition-colors" />
            <span className="hidden xl:inline font-medium">Keluar</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs bg-slate-50">
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="px-2 py-1 rounded whitespace-nowrap bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1 shrink-0"
          title="Edit Identitas Profil Saya"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit Profil</span>
        </button>

        {currentRole === 'guru' ? (
          <>
            <button
              onClick={() => setActiveView('teacher_grades')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'teacher_grades' ? 'bg-emerald-600 text-white font-medium' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Input Nilai
            </button>
            <button
              onClick={() => setActiveView('walikelas_ledger')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'walikelas_ledger' ? 'bg-emerald-600 text-white font-medium' : 'bg-white text-emerald-700 border border-emerald-200'
              }`}
            >
              Leger Wali
            </button>
            <button
              onClick={() => setActiveView('walikelas_attendance')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'walikelas_attendance' ? 'bg-emerald-600 text-white font-medium' : 'bg-white text-emerald-700 border border-emerald-200'
              }`}
            >
              Presensi/Catatan
            </button>
            <button
              onClick={() => setActiveView('walikelas_rapor')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'walikelas_rapor' ? 'bg-emerald-600 text-white font-medium' : 'bg-white text-emerald-700 border border-emerald-200'
              }`}
            >
              Menu Cetak
            </button>
            <button
              onClick={() => setActiveView('walikelas_kop')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'walikelas_kop' ? 'bg-emerald-600 text-white font-medium' : 'bg-white text-emerald-700 border border-emerald-200'
              }`}
            >
              Kop &amp; Logo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'dashboard' ? 'bg-slate-800 text-white font-medium' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => setActiveView('students')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'students' ? 'bg-slate-800 text-white font-medium' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Siswa
            </button>
            <button
              onClick={() => setActiveView('subjects')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'subjects' ? 'bg-slate-800 text-white font-medium' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Mapel
            </button>
            <button
              onClick={() => setActiveView('teachers')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'teachers' ? 'bg-slate-800 text-white font-medium' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Guru &amp; Wali
            </button>
            <button
              onClick={() => setActiveView('school_ledger')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeView === 'school_ledger' ? 'bg-slate-800 text-white font-medium' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Leger Sekolah
            </button>
          </>
        )}

        {/* Mobile Logout Quick Button */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="px-2 py-1 rounded whitespace-nowrap bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1 shrink-0 ml-auto cursor-pointer"
          title="Keluar dari Akun"
        >
          <LogOut className="w-3 h-3" />
          <span>Keluar</span>
        </button>
      </div>

      {/* Custom In-App Logout Confirmation Modal (Prevents iframe window.confirm blocking) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 text-base mb-1">
              Keluar dari Portal?
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Anda akan keluar dari sesi akun{' '}
              <strong className="text-slate-800 font-semibold">
                {currentUser?.name || 'Pengguna'}
              </strong>
              . Seluruh perubahan nilai dan data telah tersimpan. Anda dapat masuk kembali kapan saja melalui halaman login.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2 px-4 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                }}
                className="flex-1 py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
