import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Sparkles,
  Save,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Award,
  Search,
} from 'lucide-react';

const QUICK_TEMPLATES = [
  'Pertahankan prestasi membanggakan ini, teruslah rendah hati dan menjadi teladan bagi teman.',
  'Ananda memiliki potensi besar. Tingkatkan ketelitian dan keaktifan saat pembelajaran berlangsung.',
  'Kedisiplinan belajar sangat baik. Pertahankan motivasi dan perbanyak membaca referensi tambahan.',
  'Perlu bimbingan dan waktu belajar lebih banyak di rumah, terutama pada mata pelajaran eksak.',
  'Sikap dan akhlak mulia selalu ditunjukkan di kelas. Terus istiqomah dalam ibadah dan belajar.',
];

export const HomeroomAttendanceNotesView: React.FC = () => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    getClassStudents,
    homeroomRecords,
    updateHomeroomRecord,
    syncToGasNow,
    gasConfig,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [savedStudentId, setSavedStudentId] = useState<string | null>(null);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = getClassStudents(currentClass.id);

  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery)
  );

  const handleAttendanceChange = (
    studentId: string,
    field: 'sick' | 'permitted' | 'absent',
    valStr: string
  ) => {
    const val = Math.max(0, parseInt(valStr, 10) || 0);
    updateHomeroomRecord(studentId, { [field]: val });
    showNotification(studentId);

    if (gasConfig.isAutoSync && gasConfig.webAppUrl) {
      syncToGasNow();
    }
  };

  const handleNoteChange = (studentId: string, homeroomNote: string) => {
    updateHomeroomRecord(studentId, { homeroomNote });
    showNotification(studentId);
  };

  const handleExtraChange = (studentId: string, extracurricular: string) => {
    updateHomeroomRecord(studentId, { extracurricular });
    showNotification(studentId);
  };

  const applyTemplate = (studentId: string, templateText: string) => {
    updateHomeroomRecord(studentId, { homeroomNote: templateText });
    showNotification(studentId);
  };

  const showNotification = (id: string) => {
    setSavedStudentId(id);
    setTimeout(() => setSavedStudentId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Menu Wali Kelas
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">Kelengkapan Rapor UTS</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Presensi Kehadiran & Catatan Perkembangan Siswa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Input data ketidakhadiran (S/I/A), ekstrakurikuler, dan catatan wali kelas untuk dicetak pada lembar Rapor UTS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Kelas Binaan:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Template Hints Box */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Template Cepat Catatan Wali Kelas (Klik untuk menerapkan ke siswa):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TEMPLATES.map((tmpl, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-white border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md shadow-2xs"
            >
              "{tmpl.slice(0, 50)}..."
            </span>
          ))}
        </div>
      </div>

      {/* Student List & Attendance/Notes Input Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
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
          <span className="text-xs text-slate-500 font-mono">
            Total {filteredStudents.length} Siswa di {currentClass.name}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredStudents.map((student, idx) => {
            const hrRecord = homeroomRecords.find((r) => r.studentId === student.id) || {
              id: `hr-${student.id}`,
              studentId: student.id,
              classId: currentClass.id,
              sick: 0,
              permitted: 0,
              absent: 0,
              homeroomNote: '',
              extracurricular: '',
              updatedAt: '',
            };

            const isSaved = savedStudentId === student.id;

            return (
              <div key={student.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Student Identity */}
                  <div className="min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5">
                        {idx + 1}.
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-mono pl-7 mt-0.5">
                      NIS: {student.nis} · NISN: {student.nisn} · ({student.gender === 'L' ? 'Laki-laki' : 'Perempuan'})
                    </p>
                    {isSaved && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-2 ml-7 font-medium animate-pulse">
                        <CheckCircle2 className="w-3 h-3" /> Tersimpan
                      </span>
                    )}
                  </div>

                  {/* Attendance Inputs: Sakit, Izin, Alpa */}
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-center">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Sakit (S)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={hrRecord.sick}
                        onChange={(e) => handleAttendanceChange(student.id, 'sick', e.target.value)}
                        className="w-12 px-1 py-1 text-center font-mono text-xs border border-slate-300 rounded bg-white font-bold"
                      />
                    </div>
                    <div className="text-center">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Izin (I)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={hrRecord.permitted}
                        onChange={(e) => handleAttendanceChange(student.id, 'permitted', e.target.value)}
                        className="w-12 px-1 py-1 text-center font-mono text-xs border border-slate-300 rounded bg-white font-bold"
                      />
                    </div>
                    <div className="text-center">
                      <label className="block text-[10px] font-bold text-rose-700 uppercase">
                        Alpa (A)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={hrRecord.absent}
                        onChange={(e) => handleAttendanceChange(student.id, 'absent', e.target.value)}
                        className="w-12 px-1 py-1 text-center font-mono text-xs border border-rose-300 rounded bg-rose-50/50 font-bold text-rose-800"
                      />
                    </div>
                  </div>

                  {/* Notes & Extracurricular Input */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Catatan Perkembangan Wali Kelas:
                        </label>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <span>Template:</span>
                          <button
                            type="button"
                            onClick={() => applyTemplate(student.id, QUICK_TEMPLATES[0])}
                            className="text-emerald-700 hover:underline"
                          >
                            Prestasi
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={() => applyTemplate(student.id, QUICK_TEMPLATES[1])}
                            className="text-emerald-700 hover:underline"
                          >
                            Potensi
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={() => applyTemplate(student.id, QUICK_TEMPLATES[3])}
                            className="text-emerald-700 hover:underline"
                          >
                            Remedial
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={hrRecord.homeroomNote}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        placeholder="Tuliskan catatan motivasi dan perkembangan belajar..."
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                        Kegiatan Ekstrakurikuler:
                      </label>
                      <input
                        type="text"
                        value={hrRecord.extracurricular || ''}
                        onChange={(e) => handleExtraChange(student.id, e.target.value)}
                        placeholder="Misal: Pramuka (Sangat Baik), Tahfidz (Baik)..."
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
