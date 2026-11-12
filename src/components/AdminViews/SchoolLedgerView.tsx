import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FileSpreadsheet, Download, Search, Filter, Trophy, BarChart2 } from 'lucide-react';

export const SchoolLedgerView: React.FC = () => {
  const { classes, subjects, students, grades, settings, getClassRanking } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect rankings for all classes
  const allRankings = useMemo(() => {
    let list: any[] = [];
    classes.forEach((cls) => {
      const clsRank = getClassRanking(cls.id).map((r) => ({
        ...r,
        className: cls.name,
        classLevel: cls.level,
      }));
      list = [...list, ...clsRank];
    });

    // Global sorting by average score descending
    list.sort((a, b) => b.averageScore - a.averageScore || b.totalScore - a.totalScore);

    // Assign school-wide rank
    list.forEach((item, index) => {
      item.schoolRank = index + 1;
    });

    return list;
  }, [classes, getClassRanking]);

  const filteredData = useMemo(() => {
    return allRankings.filter((r) => {
      const matchSearch =
        r.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.student.nis.includes(searchQuery);
      const matchClass = selectedClassId === 'all' || r.student.classId === selectedClassId;
      return matchSearch && matchClass;
    });
  }, [allRankings, searchQuery, selectedClassId]);

  const exportSchoolCsv = () => {
    const headers = [
      'Peringkat Sekolah',
      'Peringkat Kelas',
      'Kelas',
      'NIS',
      'NISN',
      'Nama Siswa',
      'L/P',
      ...subjects.map((s) => s.code),
      'Total Nilai',
      'Rata-rata',
    ];

    const rows = filteredData.map((r) => [
      r.schoolRank,
      r.rank,
      r.className,
      r.student.nis,
      r.student.nisn,
      `"${r.student.name}"`,
      r.student.gender,
      ...subjects.map((s) => r.grades[s.id]?.finalScore || 0),
      r.totalScore,
      r.averageScore,
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', 'Leger_Nilai_UTS_Sekolah.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Leger Nilai Ujian Tengah Semester Seluruh Sekolah
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi nilai dan pemeringkatan paralel seluruh rombel {settings.schoolName}
          </p>
        </div>

        <button
          onClick={exportSchoolCsv}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          Ekspor Leger Sekolah (CSV)
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Rombel:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="all">Seluruh Rombel ({classes.length} Kelas)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-2 w-12 text-center">Peringkat Paralel</th>
                <th className="py-3 px-2 w-20">Kelas</th>
                <th className="py-3 px-2 w-16">NIS</th>
                <th className="py-3 px-3 min-w-[180px]">Nama Siswa</th>
                <th className="py-3 px-1 w-8 text-center">L/P</th>
                {subjects.map((sub) => (
                  <th key={sub.id} className="py-3 px-1.5 w-14 text-center border-l border-slate-200">
                    {sub.code}
                  </th>
                ))}
                <th className="py-3 px-2 w-16 text-center bg-slate-200/70 border-l border-slate-300">
                  Total
                </th>
                <th className="py-3 px-2 w-16 text-center bg-emerald-100/50 text-emerald-900 border-l border-emerald-200 font-bold">
                  Rata-rata
                </th>
                <th className="py-3 px-2 w-16 text-center border-l border-slate-200">Rank Rombel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900">
                    #{item.schoolRank}
                  </td>
                  <td className="py-2.5 px-2 font-medium text-emerald-800">{item.className}</td>
                  <td className="py-2.5 px-2 font-mono text-slate-600">{item.student.nis}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.student.name}</td>
                  <td className="py-2.5 px-1 text-center font-mono text-slate-500">{item.student.gender}</td>
                  {subjects.map((sub) => {
                    const grade = item.grades[sub.id];
                    const score = grade?.finalScore || 0;
                    return (
                      <td
                        key={sub.id}
                        className={`py-2.5 px-1.5 text-center font-mono border-l border-slate-100 ${
                          score < sub.kkm && score > 0 ? 'text-rose-600 bg-rose-50/40 font-bold' : ''
                        }`}
                      >
                        {score > 0 ? score : '-'}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 bg-slate-50 border-l border-slate-200">
                    {item.totalScore}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-900 bg-emerald-50/30 border-l border-emerald-100">
                    {item.averageScore}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-600 border-l border-slate-200">
                    #{item.rank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
