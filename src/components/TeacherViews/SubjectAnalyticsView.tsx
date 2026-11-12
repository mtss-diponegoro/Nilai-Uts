import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  Award,
  Users,
  Target,
  FileText,
} from 'lucide-react';

export const SubjectAnalyticsView: React.FC = () => {
  const {
    subjects,
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedSubjectId,
    setSelectedSubjectId,
    getSubjectGrades,
    activeTeacher,
  } = useApp();

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const studentGrades = useMemo(() => {
    return getSubjectGrades(currentSubject?.id || '', currentClass?.id || '');
  }, [getSubjectGrades, currentSubject?.id, currentClass?.id]);

  const stats = useMemo(() => {
    const scored = studentGrades.filter((g) => g.grade.finalScore > 0);
    const passed = studentGrades.filter((g) => g.grade.isPassed && g.grade.finalScore > 0);
    const remedial = studentGrades.filter((g) => !g.grade.isPassed && g.grade.finalScore > 0);
    const total = studentGrades.length;

    const scores = scored.map((g) => g.grade.finalScore);
    const avg = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const lowest = scores.length > 0 ? Math.min(...scores) : 0;

    // Predicates count
    const countA = scored.filter((g) => g.grade.predicate === 'A').length;
    const countB = scored.filter((g) => g.grade.predicate === 'B').length;
    const countC = scored.filter((g) => g.grade.predicate === 'C').length;
    const countD = scored.filter((g) => g.grade.predicate === 'D').length;

    const passRate = scored.length > 0 ? Math.round((passed.length / scored.length) * 100) : 0;

    return {
      total,
      scoredCount: scored.length,
      passedCount: passed.length,
      remedialCount: remedial.length,
      remedialList: remedial,
      avg,
      highest,
      lowest,
      countA,
      countB,
      countC,
      countD,
      passRate,
    };
  }, [studentGrades]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Statistik & Analisis Hasil UTS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluasi distribusi capaian kompetensi siswa untuk perencanaan tindak lanjut & remedial
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} (KKM {sub.kkm})
              </option>
            ))}
          </select>

          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Persentase Ketuntasan</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2">{stats.passRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.passedCount} dari {stats.scoredCount} siswa tuntas KKM ({currentSubject.kkm})
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Rata-rata Nilai UTS</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2">{stats.avg}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Rentang terendah {stats.lowest} hingga tertinggi {stats.highest}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Siswa Perlu Remidial</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600 font-mono mt-2">{stats.remedialCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Membutuhkan bimbingan perbaikan nilai
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Siswa Predikat A (Istimewa)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2">{stats.countA}</p>
          <p className="text-[11px] text-slate-500 mt-1">Nilai akhir mencapai 90 - 100</p>
        </div>
      </div>

      {/* Predicate Breakdown Visualizer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Distribusi Predikat Capaian Siswa</h3>
        <div className="space-y-3">
          {/* Predicate A */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800">Predikat A (Sangat Baik / 90 - 100)</span>
              <span className="font-mono font-medium text-slate-600">
                {stats.countA} siswa ({stats.scoredCount > 0 ? Math.round((stats.countA / stats.scoredCount) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${stats.scoredCount > 0 ? (stats.countA / stats.scoredCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Predicate B */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800">Predikat B (Baik / 80 - 89)</span>
              <span className="font-mono font-medium text-slate-600">
                {stats.countB} siswa ({stats.scoredCount > 0 ? Math.round((stats.countB / stats.scoredCount) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${stats.scoredCount > 0 ? (stats.countB / stats.scoredCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Predicate C */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800">Predikat C (Cukup / KKM - 79)</span>
              <span className="font-mono font-medium text-slate-600">
                {stats.countC} siswa ({stats.scoredCount > 0 ? Math.round((stats.countC / stats.scoredCount) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${stats.scoredCount > 0 ? (stats.countC / stats.scoredCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Predicate D */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800">Predikat D (Perlu Bimbingan / &lt; KKM)</span>
              <span className="font-mono font-medium text-rose-600">
                {stats.countD} siswa ({stats.scoredCount > 0 ? Math.round((stats.countD / stats.scoredCount) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-rose-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${stats.scoredCount > 0 ? (stats.countD / stats.scoredCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Remedial Target List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-rose-50/40 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              Daftar Siswa Sasaran Program Remedial
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Siswa dengan Nilai Akhir di bawah KKM ({currentSubject.kkm}) pada mata pelajaran {currentSubject.name}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-rose-100 text-rose-800">
            {stats.remedialList.length} Siswa
          </span>
        </div>

        {stats.remedialList.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Selamat! Seluruh siswa telah mencapai KKM pada mata pelajaran ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">NIS</th>
                  <th className="py-2.5 px-4">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center">Tugas 1</th>
                  <th className="py-2.5 px-3 text-center">Tugas 2</th>
                  <th className="py-2.5 px-3 text-center">UTS</th>
                  <th className="py-2.5 px-3 text-center font-bold">Nilai Akhir</th>
                  <th className="py-2.5 px-3 text-center">Selisih KKM</th>
                  <th className="py-2.5 px-4">Rekomendasi Bimbingan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.remedialList.map(({ student, grade }, idx) => {
                  const gap = currentSubject.kkm - grade.finalScore;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{student.nis}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{student.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{grade.assignment1}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{grade.assignment2}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600">
                        {grade.utsScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700 bg-rose-50/50">
                        {grade.finalScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-rose-600">
                        -{gap} poin
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                        Tugas remedial modul latihan soal dan tes ulang materi UTS
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
