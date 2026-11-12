import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Search,
  Trophy,
  Award,
  Users,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const HomeroomLedgerView: React.FC = () => {
  const {
    classes,
    subjects,
    selectedClassId,
    setSelectedClassId,
    getClassRanking,
    activeTeacher,
    settings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'total'>('rank');

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const rankings = useMemo(() => {
    return getClassRanking(currentClass.id);
  }, [getClassRanking, currentClass.id]);

  // Compute subject averages across the class
  const subjectAverages = useMemo(() => {
    const result: { [subId: string]: { avg: number; highest: number; lowest: number } } = {};

    subjects.forEach((sub) => {
      let sum = 0;
      let count = 0;
      let high = 0;
      let low = 100;

      rankings.forEach((r) => {
        const grade = r.grades[sub.id];
        if (grade && grade.finalScore > 0) {
          sum += grade.finalScore;
          count++;
          if (grade.finalScore > high) high = grade.finalScore;
          if (grade.finalScore < low) low = grade.finalScore;
        }
      });

      result[sub.id] = {
        avg: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
        highest: count > 0 ? high : 0,
        lowest: count > 0 ? low : 0,
      };
    });

    return result;
  }, [subjects, rankings]);

  const sortedAndFiltered = useMemo(() => {
    let list = rankings.filter((r) => {
      return (
        r.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.student.nis.includes(searchQuery)
      );
    });

    if (sortBy === 'name') {
      list.sort((a, b) => a.student.name.localeCompare(b.student.name));
    } else if (sortBy === 'total') {
      list.sort((a, b) => b.totalScore - a.totalScore);
    } else {
      list.sort((a, b) => a.rank - b.rank);
    }

    return list;
  }, [rankings, searchQuery, sortBy]);

  const exportLedgerCsv = () => {
    const headers = [
      'Peringkat',
      'NIS',
      'NISN',
      'Nama Siswa',
      'L/P',
      ...subjects.map((s) => s.code),
      'Total Nilai',
      'Rata-rata',
      'Sakit',
      'Izin',
      'Alpa',
    ];

    const rows = rankings.map((r) => [
      r.rank,
      r.student.nis,
      r.student.nisn,
      `"${r.student.name}"`,
      r.student.gender,
      ...subjects.map((s) => r.grades[s.id]?.finalScore || 0),
      r.totalScore,
      r.averageScore,
      r.attendance.sick,
      r.attendance.permitted,
      r.attendance.absent,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leger_Nilai_UTS_${currentClass.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Menu Wali Kelas
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">{settings.schoolName}</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">Tahun Ajaran {settings.academicYear}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Leger Nilai Ujian Tengah Semester (Rekap Seluruh Mapel)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Wali Kelas: <strong className="text-slate-700">{currentClass.homeroomTeacherName}</strong> · Kelas: <strong className="text-emerald-700">{currentClass.name}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Pilih Kelas Binaan
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="self-end">
              <button
                onClick={exportLedgerCsv}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Leger (CSV)
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 High Achievers Spotlight */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            3 Peringkat Tertinggi Hasil UTS Kelas {currentClass.name}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {rankings.slice(0, 3).map((r, i) => (
              <div
                key={r.student.id}
                className={`p-3 rounded-lg border flex items-center gap-3 ${
                  i === 0
                    ? 'bg-amber-50/60 border-amber-200'
                    : i === 1
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-orange-50/50 border-orange-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    i === 0
                      ? 'bg-amber-500 text-white shadow-xs'
                      : i === 1
                      ? 'bg-slate-400 text-white'
                      : 'bg-orange-400 text-white'
                  }`}
                >
                  #{r.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{r.student.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Rata-rata: <strong className="text-slate-800">{r.averageScore}</strong> · Total: {r.totalScore}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Ledger Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Controls */}
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

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px] font-medium">Urutkan:</span>
            <button
              onClick={() => setSortBy('rank')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'rank'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Peringkat Kelas
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'name'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Nama Siswa (A-Z)
            </button>
            <button
              onClick={() => setSortBy('total')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'total'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Total Nilai
            </button>
          </div>
        </div>

        {/* Dense Responsive Ledger Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-2 w-12 text-center sticky left-0 bg-slate-100 z-10">Peringkat</th>
                <th className="py-3 px-2 w-16">NIS</th>
                <th className="py-3 px-3 min-w-[180px] sticky left-12 bg-slate-100 z-10">Nama Siswa</th>
                <th className="py-3 px-1 w-8 text-center">L/P</th>
                
                {/* Dynamically render subject column headers */}
                {subjects.map((sub) => (
                  <th
                    key={sub.id}
                    className="py-3 px-2 w-16 text-center border-l border-slate-200"
                    title={`${sub.name} (KKM: ${sub.kkm})`}
                  >
                    <div className="truncate font-mono">{sub.code}</div>
                    <div className="text-[9px] font-normal text-slate-500">KKM {sub.kkm}</div>
                  </th>
                ))}

                <th className="py-3 px-2 w-20 text-center bg-slate-200/70 border-l border-slate-300 font-bold">
                  Total
                </th>
                <th className="py-3 px-2 w-20 text-center bg-emerald-100/50 text-emerald-900 border-l border-emerald-200 font-bold">
                  Rata-rata
                </th>
                <th className="py-3 px-1.5 w-10 text-center border-l border-slate-200 text-slate-600" title="Sakit">S</th>
                <th className="py-3 px-1.5 w-10 text-center text-slate-600" title="Izin">I</th>
                <th className="py-3 px-1.5 w-10 text-center text-slate-600" title="Alpa">A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFiltered.map((item) => {
                return (
                  <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Rank Badge */}
                    <td className="py-2 px-2 text-center sticky left-0 bg-white z-10">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-mono font-bold ${
                          item.rank === 1
                            ? 'bg-amber-100 text-amber-800'
                            : item.rank === 2
                            ? 'bg-slate-200 text-slate-800'
                            : item.rank === 3
                            ? 'bg-orange-100 text-orange-800'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>

                    <td className="py-2 px-2 font-mono text-slate-600">{item.student.nis}</td>
                    
                    <td className="py-2 px-3 font-semibold text-slate-900 sticky left-12 bg-white z-10 whitespace-nowrap">
                      {item.student.name}
                    </td>

                    <td className="py-2 px-1 text-center font-mono text-slate-500">{item.student.gender}</td>

                    {/* Subject scores */}
                    {subjects.map((sub) => {
                      const grade = item.grades[sub.id];
                      const score = grade?.finalScore || 0;
                      const isBelowKkm = score > 0 && score < sub.kkm;

                      return (
                        <td
                          key={sub.id}
                          className={`py-2 px-2 text-center font-mono border-l border-slate-100 ${
                            isBelowKkm ? 'bg-rose-50 text-rose-700 font-semibold' : 'text-slate-800'
                          }`}
                        >
                          {score > 0 ? score : '-'}
                        </td>
                      );
                    })}

                    {/* Total & Average */}
                    <td className="py-2 px-2 text-center font-mono font-bold text-slate-900 bg-slate-50 border-l border-slate-200">
                      {item.totalScore}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-emerald-900 bg-emerald-50/30 border-l border-emerald-100">
                      {item.averageScore}
                    </td>

                    {/* Attendance */}
                    <td className="py-2 px-1.5 text-center font-mono text-slate-600 border-l border-slate-200">
                      {item.attendance.sick}
                    </td>
                    <td className="py-2 px-1.5 text-center font-mono text-slate-600">
                      {item.attendance.permitted}
                    </td>
                    <td className="py-2 px-1.5 text-center font-mono text-slate-600">
                      {item.attendance.absent}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Class Subject Averages */}
            <tfoot className="bg-slate-100 text-slate-800 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={4} className="py-3 px-3 text-right uppercase text-[10px] tracking-wider text-slate-600">
                  Rata-rata Kelas per Mapel:
                </td>
                {subjects.map((sub) => (
                  <td key={sub.id} className="py-3 px-2 text-center font-mono border-l border-slate-200 text-emerald-950">
                    {subjectAverages[sub.id]?.avg || 0}
                  </td>
                ))}
                <td colSpan={5} className="py-3 px-3 text-center text-slate-500 font-normal text-[11px]">
                  Leger Resmi UTS
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
