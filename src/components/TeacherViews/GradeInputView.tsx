import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Download,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Info,
} from 'lucide-react';

export const GradeInputView: React.FC = () => {
  const {
    subjects,
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedSubjectId,
    setSelectedSubjectId,
    updateGrade,
    getSubjectGrades,
    settings,
    activeTeacher,
    syncToGasNow,
    gasConfig,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'remedial' | 'empty'>('all');
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const studentGrades = useMemo(() => {
    return getSubjectGrades(currentSubject?.id || '', currentClass?.id || '');
  }, [getSubjectGrades, currentSubject?.id, currentClass?.id]);

  const filteredData = useMemo(() => {
    return studentGrades.filter(({ student, grade }) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nis.includes(searchQuery);

      if (!matchSearch) return false;

      if (statusFilter === 'passed') return grade.isPassed && grade.finalScore > 0;
      if (statusFilter === 'remedial') return !grade.isPassed && grade.finalScore > 0;
      if (statusFilter === 'empty') return grade.finalScore === 0;

      return true;
    });
  }, [studentGrades, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const scored = studentGrades.filter((g) => g.grade.finalScore > 0);
    const passed = studentGrades.filter((g) => g.grade.isPassed && g.grade.finalScore > 0);
    const remedial = scored.length - passed.length;
    const avg =
      scored.length > 0
        ? Math.round((scored.reduce((acc, curr) => acc + curr.grade.finalScore, 0) / scored.length) * 10) / 10
        : 0;
    const highest = scored.length > 0 ? Math.max(...scored.map((g) => g.grade.finalScore)) : 0;
    const lowest = scored.length > 0 ? Math.min(...scored.map((g) => g.grade.finalScore)) : 0;

    return { total: studentGrades.length, scored: scored.length, passed: passed.length, remedial, avg, highest, lowest };
  }, [studentGrades]);

  const handleInputChange = (
    studentId: string,
    field: 'assignment1' | 'assignment2' | 'utsScore',
    valueStr: string
  ) => {
    const val = valueStr === '' ? 0 : Math.min(100, Math.max(0, Number(valueStr) || 0));
    updateGrade(studentId, currentSubject.id, { [field]: val });
    showSavedNotice();

    // Trigger auto-sync if configured
    if (gasConfig.isAutoSync && gasConfig.webAppUrl) {
      syncToGasNow();
    }
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    updateGrade(studentId, currentSubject.id, { notes });
    showSavedNotice();
  };

  const showSavedNotice = () => {
    setSaveIndicator('Tersimpan');
    setTimeout(() => setSaveIndicator(null), 1500);
  };

  const exportCsv = () => {
    const headers = ['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P', 'Tugas 1', 'Tugas 2', 'Nilai UTS', 'Nilai Akhir', 'Predikat', 'Status'];
    const rows = studentGrades.map(({ student, grade }, idx) => [
      idx + 1,
      student.nis,
      student.nisn,
      `"${student.name}"`,
      student.gender,
      grade.assignment1,
      grade.assignment2,
      grade.utsScore,
      grade.finalScore,
      grade.predicate,
      grade.isPassed ? 'TUNTAS' : 'REMIDIAL',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nilai_UTS_${currentSubject.code}_${currentClass.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Format Penilaian UTS / STS
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">Bobot: Tugas {settings.weightAssignment}% + UTS {settings.weightUTS}%</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Input Nilai Ujian Tengah Semester (UTS)
            </h1>
            <p className="text-xs text-slate-500">
              Guru Pengampu: <strong className="text-slate-700">{currentSubject?.teacherName || activeTeacher?.name}</strong> · KKM Mapel: <strong className="text-slate-800 font-mono">{currentSubject?.kkm}</strong>
            </p>
          </div>

          {/* Subject & Class Switchers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Mata Pelajaran
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    [{sub.code}] {sub.name} (KKM {sub.kkm})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Rombongan Belajar / Kelas
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} (Wali: {cls.homeroomTeacherName})
                  </option>
                ))}
              </select>
            </div>

            <div className="self-end">
              <button
                onClick={exportCsv}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                Ekspor CSV
              </button>
            </div>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500">Total Siswa</span>
            <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500">Telah Dinilai</span>
            <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              {stats.scored} <span className="text-xs font-normal text-slate-500">/ {stats.total}</span>
            </p>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-100">
            <span className="text-[11px] text-emerald-700">Tuntas (≥ KKM)</span>
            <p className="text-lg font-bold text-emerald-800 font-mono mt-0.5">{stats.passed}</p>
          </div>
          <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-100">
            <span className="text-[11px] text-rose-700">Perlu Remidial</span>
            <p className="text-lg font-bold text-rose-800 font-mono mt-0.5">{stats.remedial}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500">Rata-rata Kelas</span>
            <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">{stats.avg}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500">Rentang Nilai</span>
            <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              {stats.lowest} - {stats.highest}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau NIS siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Filter:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('passed')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'passed'
                  ? 'bg-emerald-700 text-white font-medium'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Tuntas ({stats.passed})
            </button>
            <button
              onClick={() => setStatusFilter('remedial')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'remedial'
                  ? 'bg-rose-700 text-white font-medium'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              Remidial ({stats.remedial})
            </button>

            {saveIndicator && (
              <span className="ml-auto text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5" />
                {saveIndicator}
              </span>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 w-20">NIS</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Siswa</th>
                <th className="py-3 px-2 w-10 text-center">L/P</th>
                <th className="py-3 px-3 w-24 text-center bg-slate-200/50">Tugas 1</th>
                <th className="py-3 px-3 w-24 text-center bg-slate-200/50">Tugas 2</th>
                <th className="py-3 px-3 w-28 text-center bg-emerald-100/40 text-emerald-900 font-bold">
                  Nilai UTS (60%)
                </th>
                <th className="py-3 px-3 w-24 text-center bg-slate-200/60 font-bold">Nilai Akhir</th>
                <th className="py-3 px-2 w-14 text-center">Predikat</th>
                <th className="py-3 px-3 w-24 text-center">Status</th>
                <th className="py-3 px-4 min-w-[200px]">Capaian / Catatan Guru Mapel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    Tidak ada siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredData.map(({ student, grade }, index) => {
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !grade.isPassed && grade.finalScore > 0 ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{student.nis}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {student.name}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{student.gender}</td>

                      {/* Tugas 1 Input */}
                      <td className="py-1.5 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={grade.assignment1 || ''}
                          onChange={(e) => handleInputChange(student.id, 'assignment1', e.target.value)}
                          placeholder="0"
                          aria-label={`Nilai Tugas 1 ${student.name}`}
                          className="w-16 px-2 py-1 text-center font-mono text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white bg-slate-50"
                        />
                      </td>

                      {/* Tugas 2 Input */}
                      <td className="py-1.5 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={grade.assignment2 || ''}
                          onChange={(e) => handleInputChange(student.id, 'assignment2', e.target.value)}
                          placeholder="0"
                          aria-label={`Nilai Tugas 2 ${student.name}`}
                          className="w-16 px-2 py-1 text-center font-mono text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white bg-slate-50"
                        />
                      </td>

                      {/* Nilai UTS Input */}
                      <td className="py-1.5 px-2 text-center bg-emerald-50/20">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={grade.utsScore || ''}
                          onChange={(e) => handleInputChange(student.id, 'utsScore', e.target.value)}
                          placeholder="0"
                          aria-label={`Nilai UTS ${student.name}`}
                          className="w-20 px-2 py-1 text-center font-mono text-xs font-bold text-emerald-950 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white bg-emerald-50/50"
                        />
                      </td>

                      {/* Nilai Akhir */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-sm bg-slate-50">
                        <span
                          className={
                            grade.finalScore >= currentSubject.kkm ? 'text-slate-900' : 'text-rose-600'
                          }
                        >
                          {grade.finalScore}
                        </span>
                      </td>

                      {/* Predikat */}
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`inline-block w-6 h-6 rounded text-xs font-bold leading-6 ${
                            grade.predicate === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : grade.predicate === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : grade.predicate === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {grade.predicate}
                        </span>
                      </td>

                      {/* Status Ketercapaian */}
                      <td className="py-2.5 px-3 text-center">
                        {grade.finalScore === 0 ? (
                          <span className="text-[11px] text-slate-400">Belum Ada</span>
                        ) : grade.isPassed ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Tuntas
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Remidial
                          </span>
                        )}
                      </td>

                      {/* Catatan / Keterangan Capaian */}
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={grade.notes || ''}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          placeholder="Catatan kompetensi..."
                          aria-label={`Catatan kompetensi ${student.name}`}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-transparent"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Keterangan Predikat: A (90-100), B (80-89), C (KKM-79), D (&lt; KKM).</span>
          </div>
          <div>
            Data otomatis disimpan secara real-time ke penyimpanan lokal &amp; Spreadsheet.
          </div>
        </div>
      </div>
    </div>
  );
};
