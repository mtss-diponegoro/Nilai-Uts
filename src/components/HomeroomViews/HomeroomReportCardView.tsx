import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, GradeRecord, HomeroomRecord } from '../../types';
import { OfficialKopSurat } from '../Common/OfficialKopSurat';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  Sliders,
  FileSpreadsheet,
  Award,
  FileText,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

type PrintDocType = 'rapor' | 'leger' | 'presensi' | 'piagam';

export const HomeroomReportCardView: React.FC = () => {
  const {
    classes,
    subjects,
    selectedClassId,
    setSelectedClassId,
    getClassStudents,
    getClassRanking,
    grades,
    homeroomRecords,
    settings,
    setActiveView,
  } = useApp();

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = useMemo(() => {
    return getClassStudents(currentClass.id);
  }, [getClassStudents, currentClass.id]);

  const classRankings = useMemo(() => {
    return getClassRanking(currentClass.id);
  }, [getClassRanking, currentClass.id]);

  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [isPrintAllMode, setIsPrintAllMode] = useState(false);
  const [printDocType, setPrintDocType] = useState<PrintDocType>('rapor');

  // Safeguard index
  const safeIndex = Math.min(Math.max(0, currentStudentIndex), Math.max(0, classStudents.length - 1));
  const activeStudent = classStudents[safeIndex];

  const handlePrint = () => {
    window.print();
  };

  const getStudentGrades = (studentId: string) => {
    return subjects.map((sub) => {
      const g = grades.find((item) => item.studentId === studentId && item.subjectId === sub.id);
      return {
        subject: sub,
        grade: g || {
          finalScore: 0,
          predicate: 'D',
          isPassed: false,
          notes: 'Belum dinilai',
        },
      };
    });
  };

  const getStudentHomeroomRecord = (studentId: string): HomeroomRecord => {
    const hr = homeroomRecords.find((r) => r.studentId === studentId);
    return (
      hr || {
        id: `hr-${studentId}`,
        studentId,
        classId: currentClass.id,
        sick: 0,
        permitted: 0,
        absent: 0,
        homeroomNote: 'Tingkatkan terus ketekunan belajar.',
        extracurricular: 'Pramuka (Baik)',
        updatedAt: '',
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Non-Print Toolbar */}
      <div className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Menu Wali Kelas
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">Pusat Cetak Dokumen Rapor &amp; Leger</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-600" />
              Menu Cetak Dokumen Penilaian Tengah Semester
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cetak lembar Rapor UTS resmi, Leger Nilai Kelas, Rekap Presensi, atau Piagam Juara Kelas lengkap dengan Kop Resmi &amp; 2 Logo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Link to Kop & Logo Settings */}
            <button
              onClick={() => setActiveView('walikelas_kop')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-300"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-700" />
              Atur Kop &amp; Logo Cetak
            </button>

            {/* Class Selector */}
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setCurrentStudentIndex(0);
              }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Wali: {c.homeroomTeacherName})
                </option>
              ))}
            </select>

            {/* Primary Print Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen Sekarang
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Document Type Selector */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setPrintDocType('rapor')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                printDocType === 'rapor'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              1. Rapor UTS Siswa
            </button>
            <button
              onClick={() => setPrintDocType('leger')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                printDocType === 'leger'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              2. Leger Nilai Kelas
            </button>
            <button
              onClick={() => setPrintDocType('presensi')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                printDocType === 'presensi'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              3. Rekap Presensi &amp; Catatan
            </button>
            <button
              onClick={() => setPrintDocType('piagam')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                printDocType === 'piagam'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              4. Piagam Juara Peringkat
            </button>
          </div>

          {/* Student Selector (When in Rapor or Piagam mode) */}
          {(printDocType === 'rapor' || printDocType === 'piagam') && classStudents.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setIsPrintAllMode(!isPrintAllMode)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  isPrintAllMode
                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isPrintAllMode ? 'Mode: Cetak Seluruh Siswa' : 'Cetak 1 Siswa Saja'}
              </button>

              {!isPrintAllMode && (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                  <button
                    onClick={() => setCurrentStudentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={safeIndex === 0}
                    className="p-1 hover:bg-white rounded disabled:opacity-30"
                    title="Siswa Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <select
                    value={safeIndex}
                    onChange={(e) => setCurrentStudentIndex(Number(e.target.value))}
                    className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none px-1"
                  >
                    {classStudents.map((s, idx) => (
                      <option key={s.id} value={idx}>
                        {idx + 1}. {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      setCurrentStudentIndex((prev) => Math.min(classStudents.length - 1, prev + 1))
                    }
                    disabled={safeIndex === classStudents.length - 1}
                    className="p-1 hover:bg-white rounded disabled:opacity-30"
                    title="Siswa Berikutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render Selected Printable Document */}
      {classStudents.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-xl border border-slate-200">
          Belum ada data siswa di kelas ini.
        </div>
      ) : printDocType === 'rapor' ? (
        isPrintAllMode ? (
          <div className="space-y-8">
            {classStudents.map((student, idx) => (
              <div key={student.id} className={idx < classStudents.length - 1 ? 'page-break' : ''}>
                <ReportCardSingle
                  student={student}
                  currentClass={currentClass}
                  subjectsData={getStudentGrades(student.id)}
                  homeroomRecord={getStudentHomeroomRecord(student.id)}
                  settings={settings}
                />
              </div>
            ))}
          </div>
        ) : (
          activeStudent && (
            <ReportCardSingle
              student={activeStudent}
              currentClass={currentClass}
              subjectsData={getStudentGrades(activeStudent.id)}
              homeroomRecord={getStudentHomeroomRecord(activeStudent.id)}
              settings={settings}
            />
          )
        )
      ) : printDocType === 'leger' ? (
        <PrintableLegerSheet
          currentClass={currentClass}
          rankings={classRankings}
          subjects={subjects}
          settings={settings}
        />
      ) : printDocType === 'presensi' ? (
        <PrintableAttendanceSheet
          currentClass={currentClass}
          students={classStudents}
          homeroomRecords={homeroomRecords}
          settings={settings}
        />
      ) : (
        /* Piagam Peringkat Juara 1, 2, 3 */
        <PrintableCertificates
          rankings={classRankings.slice(0, 3)}
          currentClass={currentClass}
          settings={settings}
          activeStudent={isPrintAllMode ? null : activeStudent}
        />
      )}
    </div>
  );
};

/* =========================================================================
   1. LEMBAR RAPOR UTS SISWA (DENGAN KOP DUA LOGO & RESMI)
   ========================================================================= */
interface ReportCardSingleProps {
  student: Student;
  currentClass: any;
  subjectsData: { subject: any; grade: any }[];
  homeroomRecord: HomeroomRecord;
  settings: any;
}

const ReportCardSingle: React.FC<ReportCardSingleProps> = ({
  student,
  currentClass,
  subjectsData,
  homeroomRecord,
  settings,
}) => {
  const totalScore = subjectsData.reduce((acc, curr) => acc + (curr.grade.finalScore || 0), 0);
  const averageScore =
    subjectsData.length > 0 ? Math.round((totalScore / subjectsData.length) * 10) / 10 : 0;

  return (
    <div className="rapor-sheet max-w-4xl mx-auto bg-white p-8 md:p-12 border border-slate-200 shadow-xs rounded-xl text-slate-900 text-sm leading-normal">
      {/* Official Kop Surat with 2 Logos */}
      <OfficialKopSurat settings={settings} className="mb-4" />

      {/* Report Title */}
      <div className="text-center my-3">
        <h3 className="text-sm font-black tracking-widest uppercase border-b border-slate-900 inline-block pb-0.5">
          LAPORAN HASIL PENILAIAN TENGAH SEMESTER (PTS / UTS)
        </h3>
        <p className="text-xs font-semibold text-slate-700 mt-1 uppercase">
          TAHUN PELAJARAN {settings.academicYear} · SEMESTER {settings.semester?.toUpperCase()}
        </p>
      </div>

      {/* Student Identity Information */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-4 border border-slate-300 p-2.5 bg-slate-50/40 rounded">
        <div className="flex">
          <span className="w-32 font-medium text-slate-600">Nama Peserta Didik</span>
          <span className="w-3">:</span>
          <span className="font-bold text-slate-900 uppercase">{student.name}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-medium text-slate-600">Kelas / Rombel</span>
          <span className="w-3">:</span>
          <span className="font-bold text-slate-900">{currentClass.name}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-medium text-slate-600">Nomor Induk Siswa (NIS)</span>
          <span className="w-3">:</span>
          <span className="font-mono text-slate-900">{student.nis}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-medium text-slate-600">Semester</span>
          <span className="w-3">:</span>
          <span className="text-slate-900">{settings.semester} (Satu)</span>
        </div>
        <div className="flex">
          <span className="w-32 font-medium text-slate-600">NISN</span>
          <span className="w-3">:</span>
          <span className="font-mono text-slate-900">{student.nisn}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-medium text-slate-600">Wali Kelas</span>
          <span className="w-3">:</span>
          <span className="text-slate-900 font-semibold">{currentClass.homeroomTeacherName}</span>
        </div>
      </div>

      {/* Subject Grades Table */}
      <div className="mb-4">
        <table className="w-full text-left text-xs border border-slate-900 border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900 text-center">
              <th className="py-2 px-2 w-8 border-r border-slate-900">No</th>
              <th className="py-2 px-3 text-left border-r border-slate-900">Mata Pelajaran</th>
              <th className="py-2 px-2 w-14 border-r border-slate-900">KKM</th>
              <th className="py-2 px-2 w-16 border-r border-slate-900">Nilai Akhir</th>
              <th className="py-2 px-2 w-16 border-r border-slate-900">Predikat</th>
              <th className="py-2 px-3 text-left">Capaian Kompetensi / Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {subjectsData.map(({ subject, grade }, idx) => (
              <tr key={subject.id} className="border-b border-slate-200">
                <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900">
                  {idx + 1}
                </td>
                <td className="py-1.5 px-3 font-medium text-slate-900 border-r border-slate-900">
                  {subject.name}
                </td>
                <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900">
                  {subject.kkm}
                </td>
                <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-900">
                  {grade.finalScore > 0 ? grade.finalScore : '-'}
                </td>
                <td className="py-1.5 px-2 text-center font-bold border-r border-slate-900">
                  {grade.predicate}
                </td>
                <td className="py-1.5 px-3 text-[11px] text-slate-700">
                  {grade.notes || (grade.isPassed ? 'Tercapai dengan sangat baik' : 'Perlu pendampingan remedial')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
              <td colSpan={3} className="py-2 px-3 text-right uppercase text-[11px] border-r border-slate-900">
                Jumlah Nilai / Rata-rata
              </td>
              <td className="py-2 px-2 text-center font-mono border-r border-slate-900">
                {totalScore}
              </td>
              <td className="py-2 px-2 text-center font-mono border-r border-slate-900">
                {averageScore}
              </td>
              <td className="py-2 px-3 text-[11px] text-slate-600">
                Kriteria Ketercapaian: {averageScore >= 75 ? 'TUNTAS' : 'PERLU PERBAIKAN'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Attendance & Extracurricular & Notes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5">
        {/* Attendance (Ketidakhadiran) */}
        <div className="border border-slate-900 rounded p-3">
          <h4 className="font-bold uppercase text-[11px] border-b border-slate-300 pb-1 mb-2 text-slate-900">
            A. Ketidakhadiran (Presensi UTS)
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between py-0.5 border-b border-dotted border-slate-200">
              <span>1. Sakit (S)</span>
              <span className="font-mono font-bold">{homeroomRecord.sick} hari</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-dotted border-slate-200">
              <span>2. Izin (I)</span>
              <span className="font-mono font-bold">{homeroomRecord.permitted} hari</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-dotted border-slate-200">
              <span>3. Tanpa Keterangan (A)</span>
              <span className="font-mono font-bold">{homeroomRecord.absent} hari</span>
            </div>
          </div>

          <h4 className="font-bold uppercase text-[11px] border-b border-slate-300 pb-1 mt-3 mb-1.5 text-slate-900">
            B. Kegiatan Ekstrakurikuler
          </h4>
          <p className="text-[11px] text-slate-800 italic">
            {homeroomRecord.extracurricular || 'Pramuka (Baik)'}
          </p>
        </div>

        {/* Homeroom Advice Notes */}
        <div className="border border-slate-900 rounded p-3 flex flex-col justify-between">
          <div>
            <h4 className="font-bold uppercase text-[11px] border-b border-slate-300 pb-1 mb-2 text-slate-900">
              C. Catatan Perkembangan Wali Kelas
            </h4>
            <p className="text-[11px] text-slate-800 leading-relaxed italic bg-slate-50 p-2 rounded border border-slate-200 min-h-[75px]">
              "{homeroomRecord.homeroomNote || 'Pertahankan semangat belajar dan selalu tingkatkan kedisiplinan serta akhlak terpuji di sekolah dan rumah.'}"
            </p>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            * Kriteria Predikat: A = 90 - 100, B = 80 - 89, C = KKM - 79, D = Di Bawah KKM
          </div>
        </div>
      </div>

      {/* Official Signatures Block */}
      <div className="pt-2 text-xs">
        <div className="text-right mb-3">
          <p className="text-slate-800 font-medium">
            {settings.reportPlace}, {new Date(settings.reportDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-600 mb-14">Mengetahui,<br />Orang Tua / Wali Siswa</p>
            <p className="font-bold border-b border-slate-400 inline-block px-8 pb-0.5 uppercase">
              {student.parentName || '...........................................'}
            </p>
          </div>

          <div>
            <p className="text-slate-600 mb-14">Wali Kelas {currentClass.name},</p>
            <p className="font-bold border-b border-slate-400 inline-block px-4 pb-0.5">
              {currentClass.homeroomTeacherName}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
              NIP. 198203152009011012
            </p>
          </div>

          <div>
            <p className="text-slate-600 mb-14">Kepala Madrasah,</p>
            <p className="font-bold border-b border-slate-400 inline-block px-4 pb-0.5">
              {settings.headmasterName}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
              NIP. {settings.headmasterNip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. CETAK LEGER NILAI KELAS (FORMAT LANSKAP RESMI)
   ========================================================================= */
const PrintableLegerSheet: React.FC<{ currentClass: any; rankings: any[]; subjects: any[]; settings: any }> = ({
  currentClass,
  rankings,
  subjects,
  settings,
}) => {
  return (
    <div className="rapor-sheet max-w-5xl mx-auto bg-white p-8 border border-slate-200 shadow-xs rounded-xl text-slate-900 text-xs">
      <OfficialKopSurat settings={settings} className="mb-3" />

      <div className="text-center my-3">
        <h2 className="text-sm font-black uppercase tracking-wider">
          LEGER HASIL PENILAIAN TENGAH SEMESTER (PTS / UTS)
        </h2>
        <p className="text-xs font-semibold text-slate-700">
          KELAS: {currentClass.name} · SEMESTER {settings.semester?.toUpperCase()} · TAHUN AJARAN {settings.academicYear}
        </p>
      </div>

      <div className="overflow-x-auto my-3">
        <table className="w-full text-left text-[11px] border border-slate-900 border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900 text-center">
              <th className="py-2 px-1.5 w-8 border-r border-slate-900">Rank</th>
              <th className="py-2 px-2 w-14 border-r border-slate-900">NIS</th>
              <th className="py-2 px-3 text-left border-r border-slate-900 min-w-[160px]">Nama Siswa</th>
              <th className="py-2 px-1 w-8 border-r border-slate-900">L/P</th>
              {subjects.map((sub) => (
                <th key={sub.id} className="py-2 px-1 w-12 border-r border-slate-900 font-mono">
                  {sub.code}
                </th>
              ))}
              <th className="py-2 px-2 w-14 border-r border-slate-900 bg-slate-200/50">Total</th>
              <th className="py-2 px-2 w-14 border-r border-slate-900 bg-slate-200/50">Rata2</th>
              <th className="py-2 px-1 w-8 border-r border-slate-900">S</th>
              <th className="py-2 px-1 w-8 border-r border-slate-900">I</th>
              <th className="py-2 px-1 w-8">A</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {rankings.map((r) => (
              <tr key={r.student.id} className="border-b border-slate-200">
                <td className="py-1 px-1.5 text-center font-bold font-mono border-r border-slate-900">
                  {r.rank}
                </td>
                <td className="py-1 px-2 font-mono border-r border-slate-900">{r.student.nis}</td>
                <td className="py-1 px-3 font-semibold border-r border-slate-900 whitespace-nowrap">
                  {r.student.name}
                </td>
                <td className="py-1 px-1 text-center font-mono border-r border-slate-900">
                  {r.student.gender}
                </td>
                {subjects.map((sub) => (
                  <td key={sub.id} className="py-1 px-1 text-center font-mono border-r border-slate-900">
                    {r.grades[sub.id]?.finalScore || '-'}
                  </td>
                ))}
                <td className="py-1 px-2 text-center font-mono font-bold border-r border-slate-900">
                  {r.totalScore}
                </td>
                <td className="py-1 px-2 text-center font-mono font-bold border-r border-slate-900">
                  {r.averageScore}
                </td>
                <td className="py-1 px-1 text-center font-mono border-r border-slate-900">
                  {r.attendance.sick}
                </td>
                <td className="py-1 px-1 text-center font-mono border-r border-slate-900">
                  {r.attendance.permitted}
                </td>
                <td className="py-1 px-1 text-center font-mono">
                  {r.attendance.absent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 text-center text-xs">
        <div>
          <p className="text-slate-600 mb-14">Mengetahui,<br />Kepala Madrasah</p>
          <p className="font-bold border-b border-slate-400 inline-block px-4 pb-0.5">
            {settings.headmasterName}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIP. {settings.headmasterNip}</p>
        </div>
        <div>
          <p className="text-slate-600 mb-14">
            {settings.reportPlace}, {new Date(settings.reportDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
            Wali Kelas {currentClass.name}
          </p>
          <p className="font-bold border-b border-slate-400 inline-block px-4 pb-0.5">
            {currentClass.homeroomTeacherName}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIP. 198203152009011012</p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. CETAK REKAP PRESENSI & CATATAN WALI KELAS
   ========================================================================= */
const PrintableAttendanceSheet: React.FC<{ currentClass: any; students: Student[]; homeroomRecords: HomeroomRecord[]; settings: any }> = ({
  currentClass,
  students,
  homeroomRecords,
  settings,
}) => {
  return (
    <div className="rapor-sheet max-w-4xl mx-auto bg-white p-8 md:p-12 border border-slate-200 shadow-xs rounded-xl text-slate-900 text-xs">
      <OfficialKopSurat settings={settings} className="mb-4" />

      <div className="text-center my-3">
        <h2 className="text-sm font-black uppercase tracking-wider">
          REKAPITULASI PRESENSI &amp; CATATAN PERKEMBANGAN BELAJAR
        </h2>
        <p className="text-xs font-semibold text-slate-700">
          KELAS: {currentClass.name} · WALI KELAS: {currentClass.homeroomTeacherName}
        </p>
      </div>

      <div className="my-4">
        <table className="w-full text-left text-[11px] border border-slate-900 border-collapse">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-slate-900 text-center">
              <th className="py-2 px-2 w-8 border-r border-slate-900">No</th>
              <th className="py-2 px-2 w-16 border-r border-slate-900">NIS</th>
              <th className="py-2 px-3 text-left border-r border-slate-900 min-w-[160px]">Nama Siswa</th>
              <th className="py-2 px-1 w-10 border-r border-slate-900">Sakit</th>
              <th className="py-2 px-1 w-10 border-r border-slate-900">Izin</th>
              <th className="py-2 px-1 w-10 border-r border-slate-900">Alpa</th>
              <th className="py-2 px-3 text-left border-r border-slate-900">Ekstrakurikuler</th>
              <th className="py-2 px-4 text-left">Catatan Wali Kelas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {students.map((s, idx) => {
              const hr = homeroomRecords.find((r) => r.studentId === s.id);
              return (
                <tr key={s.id} className="border-b border-slate-200">
                  <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900">{idx + 1}</td>
                  <td className="py-1.5 px-2 font-mono border-r border-slate-900">{s.nis}</td>
                  <td className="py-1.5 px-3 font-semibold border-r border-slate-900">{s.name}</td>
                  <td className="py-1.5 px-1 text-center font-mono border-r border-slate-900">{hr?.sick || 0}</td>
                  <td className="py-1.5 px-1 text-center font-mono border-r border-slate-900">{hr?.permitted || 0}</td>
                  <td className="py-1.5 px-1 text-center font-mono border-r border-slate-900">{hr?.absent || 0}</td>
                  <td className="py-1.5 px-3 border-r border-slate-900 italic text-slate-700">{hr?.extracurricular || '-'}</td>
                  <td className="py-1.5 px-4 text-slate-800 leading-snug">{hr?.homeroomNote || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-right mt-6 text-xs">
        <p className="text-slate-800 font-medium">
          {settings.reportPlace}, {new Date(settings.reportDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="text-slate-600 mb-14 mt-1">Wali Kelas {currentClass.name},</p>
        <p className="font-bold border-b border-slate-400 inline-block px-4 pb-0.5">
          {currentClass.homeroomTeacherName}
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIP. 198203152009011012</p>
      </div>
    </div>
  );
};

/* =========================================================================
   4. PIAGAM PENGHARGAAN JUARA PERINGKAT KELAS
   ========================================================================= */
const PrintableCertificates: React.FC<{ rankings: any[]; currentClass: any; settings: any; activeStudent?: any }> = ({
  rankings,
  currentClass,
  settings,
  activeStudent,
}) => {
  const displayList = activeStudent
    ? rankings.filter((r) => r.student.id === activeStudent.id)
    : rankings;

  if (displayList.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
        Siswa yang dipilih bukan penerima peringkat 1, 2, atau 3. Pilih mode "Cetak Seluruh Siswa" untuk melihat piagam 3 besar kelas.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {displayList.map((item, idx) => (
        <div
          key={item.student.id}
          className={`rapor-sheet max-w-4xl mx-auto bg-white p-10 border-8 border-double border-amber-600/80 shadow-md rounded-2xl text-slate-900 relative ${
            idx < displayList.length - 1 ? 'page-break' : ''
          }`}
        >
          {/* Inner Golden Hairline Border */}
          <div className="border border-amber-500/50 p-6 md:p-8 rounded-xl text-center">
            {/* Header with 2 Logos */}
            <OfficialKopSurat settings={settings} className="mb-4" />

            <div className="my-6">
              <h2 className="text-2xl font-serif font-black tracking-widest uppercase text-amber-900">
                PIAGAM PENGHARGAAN
              </h2>
              <p className="text-xs font-bold tracking-widest text-slate-600 uppercase mt-1">
                NOMOR: {item.rank}/PP/PTS/{currentClass.name.replace(/\s+/g, '')}/{settings.academicYear?.replace('/', '-')}
              </p>
            </div>

            <p className="text-xs text-slate-700 italic mb-3">
              Diberikan sebagai bentuk apresiasi prestasi belajar membanggakan kepada:
            </p>

            <h1 className="text-2xl md:text-3xl font-extrabold uppercase text-slate-950 font-serif border-b-2 border-slate-900 inline-block px-8 pb-1 my-2">
              {item.student.name}
            </h1>

            <p className="text-xs font-mono text-slate-600 mt-2">
              NIS: {item.student.nis} · NISN: {item.student.nisn}
            </p>

            <div className="my-6 max-w-lg mx-auto bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
              <p className="text-xs font-medium text-slate-800">
                Atas capaian prestasi istimewa sebagai:
              </p>
              <h3 className="text-xl font-black text-amber-900 font-serif my-1">
                PERINGKAT KE - {item.rank} (JUARA {item.rank})
              </h3>
              <p className="text-xs text-slate-600 font-mono">
                Kelas {currentClass.name} · Rata-rata Nilai UTS: <strong>{item.averageScore}</strong> · Total Nilai: <strong>{item.totalScore}</strong>
              </p>
            </div>

            <p className="text-xs text-slate-600 italic max-w-md mx-auto mb-8">
              "Semoga prestasi ini menjadi motivasi untuk senantiasa rendah hati, berakhlak mulia, dan terus meraih kesuksesan di masa mendatang."
            </p>

            <div className="grid grid-cols-2 gap-8 text-center text-xs mt-8 pt-4 border-t border-slate-200">
              <div>
                <p className="text-slate-600 mb-14">Mengetahui,<br />Kepala Madrasah</p>
                <p className="font-bold border-b border-slate-400 inline-block px-4 pb-0.5">
                  {settings.headmasterName}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIP. {settings.headmasterNip}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-14">
                  {settings.reportPlace}, {new Date(settings.reportDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                  Wali Kelas {currentClass.name}
                </p>
                <p className="font-bold border-b border-slate-400 inline-block px-4 pb-0.5">
                  {currentClass.homeroomTeacherName}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIP. 198203152009011012</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
