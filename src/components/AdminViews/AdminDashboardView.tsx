import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Database,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    students,
    subjects,
    classes,
    teachers,
    grades,
    settings,
    gasConfig,
    setActiveView,
    setIsGasModalOpen,
  } = useApp();

  const analytics = useMemo(() => {
    const totalStudents = students.length;
    const totalSubjects = subjects.length;
    const totalTeachers = teachers.length;
    const totalClasses = classes.length;

    const scoredGrades = grades.filter((g) => g.finalScore > 0);
    const passedGrades = scoredGrades.filter((g) => g.isPassed);

    const overallPassRate =
      scoredGrades.length > 0 ? Math.round((passedGrades.length / scoredGrades.length) * 100) : 0;

    const schoolAvg =
      scoredGrades.length > 0
        ? Math.round((scoredGrades.reduce((a, b) => a + b.finalScore, 0) / scoredGrades.length) * 10) / 10
        : 0;

    // Per-class stats
    const classStats = classes.map((cls) => {
      const clsStudents = students.filter((s) => s.classId === cls.id);
      const studentIds = clsStudents.map((s) => s.id);
      const clsGrades = grades.filter((g) => studentIds.includes(g.studentId) && g.finalScore > 0);
      const clsPassed = clsGrades.filter((g) => g.isPassed);

      const avg =
        clsGrades.length > 0
          ? Math.round((clsGrades.reduce((a, b) => a + b.finalScore, 0) / clsGrades.length) * 10) / 10
          : 0;

      const rate = clsGrades.length > 0 ? Math.round((clsPassed.length / clsGrades.length) * 100) : 0;

      return {
        cls,
        studentCount: clsStudents.length,
        avg,
        passRate: rate,
      };
    });

    return {
      totalStudents,
      totalSubjects,
      totalTeachers,
      totalClasses,
      overallPassRate,
      schoolAvg,
      classStats,
    };
  }, [students, subjects, teachers, classes, grades]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
              Panel Administrator & Kurikulum
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">{settings.schoolName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Dashboard Penilaian Tengah Semester (UTS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tahun Pelajaran {settings.academicYear} · Semester {settings.semester} · Kepala Madrasah:{' '}
            <strong className="text-slate-700">{settings.headmasterName}</strong>
          </p>
        </div>

        {/* Google Apps Script Integration Banner */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGasModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-xs"
          >
            <Database className="w-4 h-4" />
            Integrasi Google Apps Script
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveView('students')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
          title="Klik untuk membuka Pengelolaan & Upload Data Siswa"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Peserta Didik</span>
            <Users className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2">
            {analytics.totalStudents} <span className="text-xs font-normal text-slate-500">Siswa</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center justify-between">
            <span>Tersebar di {analytics.totalClasses} Rombel</span>
            <span className="underline group-hover:text-emerald-800">Kelola &amp; Upload &rarr;</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Rata-rata Nilai UTS Sekolah</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2 font-mono">
            {analytics.schoolAvg}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Skala 0 - 100 dari seluruh mata pelajaran
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tingkat Ketuntasan UTS</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2 font-mono">
            {analytics.overallPassRate}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Capaian nilai di atas KKM/KKTP</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Mata Pelajaran & Guru</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2">
            {analytics.totalSubjects}{' '}
            <span className="text-xs font-normal text-slate-500">Mapel / {analytics.totalTeachers} Guru</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Agama, Umum & Muatan Lokal</p>
        </div>
      </div>

      {/* Class Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rekapitulasi Capaian Nilai UTS per Rombongan Belajar
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Monitoring rata-rata nilai dan persentase ketuntasan tiap kelas
            </p>
          </div>
          <button
            onClick={() => setActiveView('school_ledger')}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Buka Leger Lengkap <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Kelas</th>
                <th className="py-3 px-4">Tingkat</th>
                <th className="py-3 px-4">Wali Kelas</th>
                <th className="py-3 px-4 text-center">Jumlah Siswa</th>
                <th className="py-3 px-4 text-center">Rata-rata UTS</th>
                <th className="py-3 px-4 text-center">Persentase Ketuntasan</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.classStats.map(({ cls, studentCount, avg, passRate }) => (
                <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{cls.name}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{cls.level}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{cls.homeroomTeacherName}</td>
                  <td className="py-3 px-4 text-center font-mono font-medium">{studentCount}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{avg}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{passRate}%</span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden hidden sm:block">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${passRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {passRate >= 75 ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        Baik
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                        Pendampingan
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GAS Sync Quick Status Strip */}
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">
              Integrasi Cloud Database Google Apps Script
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {gasConfig.webAppUrl ? (
                <>
                  Terhubung ke: <span className="font-mono text-emerald-400 truncate inline-block max-w-[200px] align-bottom">{gasConfig.webAppUrl}</span>
                </>
              ) : (
                'Spreadsheet belum terhubung. Seluruh data aktif di memori browser lokal.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsGasModalOpen(true)}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Konfigurasi Spreadsheet GAS
        </button>
      </div>
    </div>
  );
};
