import { Student, Subject, SchoolClass, Teacher, GradeRecord, HomeroomRecord, SchoolSettings, GasConfig } from '../types';
import { PRESET_LOGOS } from './defaultLogos';

export const INITIAL_SETTINGS: SchoolSettings = {
  institutionName: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
  subInstitutionName: 'KANTOR KEMENTERIAN AGAMA KABUPATEN SLEMAN',
  foundationName: 'YAYASAN PENDIDIKAN ISLAM DIPONEGORO',
  schoolName: 'MTs S Diponegoro',
  npsn: '20400192',
  nsm: '121234040015',
  akreditasi: 'A (Unggul)',
  schoolAddress: 'Jl. Diponegoro No. 45, Sleman, D.I. Yogyakarta 55281',
  contactInfo: 'Telepon: (0274) 868123 · Email: mtssdiponegoro@gmail.com · Website: www.mts-diponegoro.sch.id',
  headmasterName: 'Drs. H. Miftahudin, M.Pd.I',
  headmasterNip: '197405122002121004',
  academicYear: '2024/2025',
  semester: 'Ganjil',
  reportPlace: 'Sleman',
  reportDate: '2024-10-18',
  weightAssignment: 40,
  weightUTS: 60,
  logoInstansiUrl: PRESET_LOGOS.KEMENAG,
  logoLembagaUrl: PRESET_LOGOS.DIPONEGORO,
  showLogoInstansi: true,
  showLogoLembaga: true,
  logoInstansiSize: 68,
  logoLembagaSize: 68,
  headerLineStyle: 'double',
  paperSize: 'A4',
};

export const INITIAL_CLASSES: SchoolClass[] = [
  {
    id: 'c-7a',
    name: 'Kelas VII-A',
    level: 'VII',
    academicYear: '2024/2025',
    homeroomTeacherId: 't-1',
    homeroomTeacherName: 'Ahmad Dahlan, S.Pd.I',
  },
  {
    id: 'c-7b',
    name: 'Kelas VII-B',
    level: 'VII',
    academicYear: '2024/2025',
    homeroomTeacherId: 't-2',
    homeroomTeacherName: 'Siti Nurjanah, M.Pd',
  },
  {
    id: 'c-8a',
    name: 'Kelas VIII-A',
    level: 'VIII',
    academicYear: '2024/2025',
    homeroomTeacherId: 't-3',
    homeroomTeacherName: 'Bambang Trianto, S.Pd',
  },
  {
    id: 'c-9a',
    name: 'Kelas IX-A',
    level: 'IX',
    academicYear: '2024/2025',
    homeroomTeacherId: 't-4',
    homeroomTeacherName: 'Hj. Fatimah Zahra, S.Si',
  },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    nip: '198203152009011012',
    name: 'Ahmad Dahlan, S.Pd.I',
    email: 'ahmad.dahlan@sekolah.sch.id',
    role: 'guru',
    isHomeroom: true,
    homeroomClassId: 'c-7a',
    taughtSubjectIds: ['sub-pai', 'sub-arb'],
    password: 'guru123',
  },
  {
    id: 't-2',
    nip: '198807202015032008',
    name: 'Siti Nurjanah, M.Pd',
    email: 'siti.nurjanah@sekolah.sch.id',
    role: 'guru',
    isHomeroom: true,
    homeroomClassId: 'c-7b',
    taughtSubjectIds: ['sub-ind'],
    password: 'guru123',
  },
  {
    id: 't-3',
    nip: '198005112006041019',
    name: 'Bambang Trianto, S.Pd',
    email: 'bambang.trianto@sekolah.sch.id',
    role: 'guru',
    isHomeroom: true,
    homeroomClassId: 'c-8a',
    taughtSubjectIds: ['sub-mat'],
    password: 'guru123',
  },
  {
    id: 't-4',
    nip: '198509042010012015',
    name: 'Hj. Fatimah Zahra, S.Si',
    email: 'fatimah.zahra@sekolah.sch.id',
    role: 'guru',
    isHomeroom: true,
    homeroomClassId: 'c-9a',
    taughtSubjectIds: ['sub-ipa'],
    password: 'guru123',
  },
  {
    id: 't-admin',
    nip: '197801022005011003',
    name: 'Administrator Kurikulum',
    email: 'admin.kurikulum@sekolah.sch.id',
    role: 'admin',
    isHomeroom: false,
    taughtSubjectIds: [],
    password: 'admin123',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-pai',
    code: 'PAI',
    name: 'Pendidikan Agama Islam',
    kkm: 75,
    category: 'Agama',
    teacherId: 't-1',
    teacherName: 'Ahmad Dahlan, S.Pd.I',
  },
  {
    id: 'sub-arb',
    code: 'ARB',
    name: 'Bahasa Arab',
    kkm: 75,
    category: 'Agama',
    teacherId: 't-1',
    teacherName: 'Ahmad Dahlan, S.Pd.I',
  },
  {
    id: 'sub-ind',
    code: 'BIND',
    name: 'Bahasa Indonesia',
    kkm: 75,
    category: 'Umum',
    teacherId: 't-2',
    teacherName: 'Siti Nurjanah, M.Pd',
  },
  {
    id: 'sub-mat',
    code: 'MTK',
    name: 'Matematika',
    kkm: 70,
    category: 'Umum',
    teacherId: 't-3',
    teacherName: 'Bambang Trianto, S.Pd',
  },
  {
    id: 'sub-ipa',
    code: 'IPA',
    name: 'Ilmu Pengetahuan Alam',
    kkm: 72,
    category: 'Umum',
    teacherId: 't-4',
    teacherName: 'Hj. Fatimah Zahra, S.Si',
  },
  {
    id: 'sub-ips',
    code: 'IPS',
    name: 'Ilmu Pengetahuan Sosial',
    kkm: 75,
    category: 'Umum',
    teacherId: 't-2',
    teacherName: 'Siti Nurjanah, M.Pd',
  },
  {
    id: 'sub-ing',
    code: 'BING',
    name: 'Bahasa Inggris',
    kkm: 72,
    category: 'Umum',
    teacherId: 't-3',
    teacherName: 'Bambang Trianto, S.Pd',
  },
  {
    id: 'sub-inf',
    code: 'INF',
    name: 'Informatika',
    kkm: 75,
    category: 'Umum',
    teacherId: 't-4',
    teacherName: 'Hj. Fatimah Zahra, S.Si',
  },
  {
    id: 'sub-pkn',
    code: 'PKN',
    name: 'Pendidikan Pancasila',
    kkm: 75,
    category: 'Umum',
    teacherId: 't-1',
    teacherName: 'Ahmad Dahlan, S.Pd.I',
  },
  {
    id: 'sub-pjok',
    code: 'PJOK',
    name: 'Pendidikan Jasmani & OR',
    kkm: 75,
    category: 'Umum',
    teacherId: 't-3',
    teacherName: 'Bambang Trianto, S.Pd',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's-101',
    nis: '2401',
    nisn: '0098123451',
    name: 'Aditya Pratama Putra',
    gender: 'L',
    classId: 'c-7a',
    parentName: 'Hendra Pratama',
    phone: '081234567801',
    status: 'Aktif',
  },
  {
    id: 's-102',
    nis: '2402',
    nisn: '0098123452',
    name: 'Aisyah Nur Aini',
    gender: 'P',
    classId: 'c-7a',
    parentName: 'Rahmat Hidayat',
    phone: '081234567802',
    status: 'Aktif',
  },
  {
    id: 's-103',
    nis: '2403',
    nisn: '0098123453',
    name: 'Bagas Wahyu Ramadhan',
    gender: 'L',
    classId: 'c-7a',
    parentName: 'Wahyu Nugroho',
    phone: '081234567803',
    status: 'Aktif',
  },
  {
    id: 's-104',
    nis: '2404',
    nisn: '0098123454',
    name: 'Bilqis Khairunnisa',
    gender: 'P',
    classId: 'c-7a',
    parentName: 'Farhan Maulana',
    phone: '081234567804',
    status: 'Aktif',
  },
  {
    id: 's-105',
    nis: '2405',
    nisn: '0098123455',
    name: 'Daffa Rizky Al-Ghifari',
    gender: 'L',
    classId: 'c-7a',
    parentName: 'Agus Susanto',
    phone: '081234567805',
    status: 'Aktif',
  },
  {
    id: 's-106',
    nis: '2406',
    nisn: '0098123456',
    name: 'Fathiya Zahra Maulida',
    gender: 'P',
    classId: 'c-7a',
    parentName: 'Dedi Kurniawan',
    phone: '081234567806',
    status: 'Aktif',
  },
  {
    id: 's-107',
    nis: '2407',
    nisn: '0098123457',
    name: 'Hafiz Maulana Malik',
    gender: 'L',
    classId: 'c-7a',
    parentName: 'Malik Fajar',
    phone: '081234567807',
    status: 'Aktif',
  },
  {
    id: 's-108',
    nis: '2408',
    nisn: '0098123458',
    name: 'Kayla Safira Azzahra',
    gender: 'P',
    classId: 'c-7a',
    parentName: 'Yusuf Mansur',
    phone: '081234567808',
    status: 'Aktif',
  },
  {
    id: 's-109',
    nis: '2409',
    nisn: '0098123459',
    name: 'Muhammad Faris Al-Fatih',
    gender: 'L',
    classId: 'c-7a',
    parentName: 'Suryo Wibowo',
    phone: '081234567809',
    status: 'Aktif',
  },
  {
    id: 's-110',
    nis: '2410',
    nisn: '0098123460',
    name: 'Nabila Syakira Putri',
    gender: 'P',
    classId: 'c-7a',
    parentName: 'Budi Santoso',
    phone: '081234567810',
    status: 'Aktif',
  },
  {
    id: 's-111',
    nis: '2411',
    nisn: '0098123461',
    name: 'Raditya Arya Kusuma',
    gender: 'L',
    classId: 'c-7a',
    parentName: 'Kusuma Wardhana',
    phone: '081234567811',
    status: 'Aktif',
  },
  {
    id: 's-112',
    nis: '2412',
    nisn: '0098123462',
    name: 'Zahra Amelia Sholihat',
    gender: 'P',
    classId: 'c-7a',
    parentName: 'Imam Syafi\'i',
    phone: '081234567812',
    status: 'Aktif',
  },
  // Some students in 7B
  {
    id: 's-201',
    nis: '2413',
    nisn: '0098123463',
    name: 'Alif Kurnia Rahman',
    gender: 'L',
    classId: 'c-7b',
    parentName: 'Kurnia Sandy',
    phone: '081234567813',
    status: 'Aktif',
  },
  {
    id: 's-202',
    nis: '2414',
    nisn: '0098123464',
    name: 'Dinda Ayu Lestari',
    gender: 'P',
    classId: 'c-7b',
    parentName: 'Slamet Riyadi',
    phone: '081234567814',
    status: 'Aktif',
  },
];

// Helper to calculate predicate and passed status
export function calculateGrade(
  assignment1: number,
  assignment2: number,
  utsScore: number,
  kkm: number = 75,
  wAssignment: number = 40,
  wUTS: number = 60
): { finalScore: number; predicate: 'A' | 'B' | 'C' | 'D'; isPassed: boolean } {
  const avgAssignment = (assignment1 + assignment2) / 2;
  const finalScore = Math.round((avgAssignment * (wAssignment / 100)) + (utsScore * (wUTS / 100)));
  
  let predicate: 'A' | 'B' | 'C' | 'D' = 'D';
  if (finalScore >= 90) predicate = 'A';
  else if (finalScore >= 80) predicate = 'B';
  else if (finalScore >= kkm) predicate = 'C';
  else predicate = 'D';

  const isPassed = finalScore >= kkm;
  return { finalScore, predicate, isPassed };
}

// Generate realistic initial grade records
export function generateInitialGrades(): GradeRecord[] {
  const grades: GradeRecord[] = [];
  const class7aStudents = INITIAL_STUDENTS.filter((s) => s.classId === 'c-7a');

  // Baseline performance template per student
  const performanceProfiles: { [studentId: string]: { base: number; note: string } } = {
    's-101': { base: 84, note: 'Pemahaman konsep sangat baik' },
    's-102': { base: 92, note: 'Sangat tekun dan cermat' },
    's-103': { base: 73, note: 'Perlu bimbingan pada soal cerita' },
    's-104': { base: 88, note: 'Aktif berdiskusi di kelas' },
    's-105': { base: 68, note: 'Perlu remediasi konsep dasar' },
    's-106': { base: 95, note: 'Prestasi istimewa, sangat konsisten' },
    's-107': { base: 76, note: 'Cukup baik, tingkatkan ketelitian' },
    's-108': { base: 82, note: 'Keterampilan tugas sangat rapi' },
    's-109': { base: 87, note: 'Kemampuan analisis sangat tajam' },
    's-110': { base: 79, note: 'Baik, terus pertahankan motivasi' },
    's-111': { base: 69, note: 'Tingkatkan fokus saat penilaian' },
    's-112': { base: 90, note: 'Pemahaman materi mendalam' },
  };

  class7aStudents.forEach((student) => {
    const profile = performanceProfiles[student.id] || { base: 78, note: 'Baik' };
    
    INITIAL_SUBJECTS.forEach((subject) => {
      // slight variation per subject
      const seedVariance = ((subject.id.charCodeAt(subIdVariance(subject.id)) % 7) - 3);
      const asg1 = Math.min(100, Math.max(50, profile.base + seedVariance + 2));
      const asg2 = Math.min(100, Math.max(50, profile.base + seedVariance - 1));
      const uts = Math.min(100, Math.max(45, profile.base + (seedVariance * 2)));

      const { finalScore, predicate, isPassed } = calculateGrade(
        asg1,
        asg2,
        uts,
        subject.kkm,
        INITIAL_SETTINGS.weightAssignment,
        INITIAL_SETTINGS.weightUTS
      );

      grades.push({
        id: `g-${student.id}-${subject.id}`,
        studentId: student.id,
        subjectId: subject.id,
        classId: 'c-7a',
        assignment1: asg1,
        assignment2: asg2,
        utsScore: uts,
        finalScore,
        predicate,
        isPassed,
        notes: isPassed ? 'Telah mencapai kriteria ketercapaian tujuan' : 'Perlu program pendampingan & remedial',
        updatedAt: '2024-10-14T08:30:00Z',
      });
    });
  });

  return grades;
}

function subIdVariance(subId: string): number {
  return subId.length > 4 ? 4 : 0;
}

export const INITIAL_HOMEROOM_RECORDS: HomeroomRecord[] = [
  {
    id: 'hr-101',
    studentId: 's-101',
    classId: 'c-7a',
    sick: 1,
    permitted: 0,
    absent: 0,
    homeroomNote: 'Ananda memiliki kedisiplinan belajar yang tinggi. Pertahankan semangat dan kepemimpinan di kelas.',
    extracurricular: 'Pramuka (Sangat Baik), Hadroh (Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-102',
    studentId: 's-102',
    classId: 'c-7a',
    sick: 0,
    permitted: 0,
    absent: 0,
    homeroomNote: 'Prestasi sangat membanggakan di seluruh mata pelajaran. Terus rendah hati dan gemar membantu teman.',
    extracurricular: 'Tahfidz (Sangat Baik), KIR / Robotik (Sangat Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-103',
    studentId: 's-103',
    classId: 'c-7a',
    sick: 2,
    permitted: 1,
    absent: 0,
    homeroomNote: 'Cukup aktif dalam kegiatan kelas. Perlu pendampingan khusus pada mata pelajaran hitungan agar nilai meningkat.',
    extracurricular: 'Futsal (Sangat Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-104',
    studentId: 's-104',
    classId: 'c-7a',
    sick: 0,
    permitted: 1,
    absent: 0,
    homeroomNote: 'Siswa aktif, santun, dan memiliki daya tangkap cepat. Pertahankan konsistensi belajar di rumah.',
    extracurricular: 'PMR (Sangat Baik), English Club (Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-105',
    studentId: 's-105',
    classId: 'c-7a',
    sick: 2,
    permitted: 2,
    absent: 1,
    homeroomNote: 'Perlu meningkatkan kehadiran dan konsentrasi belajar. Jadwal belajar di rumah mohon lebih diperhatikan bersama orang tua.',
    extracurricular: 'Pramuka (Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-106',
    studentId: 's-106',
    classId: 'c-7a',
    sick: 0,
    permitted: 0,
    absent: 0,
    homeroomNote: 'Luar biasa! Selalu menunjukkan dedikasi, ketelitian, dan akhlak mulia dalam setiap kegiatan akademik.',
    extracurricular: 'Tahfidz (Sangat Baik), Olimpiade Sains (Sangat Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-107',
    studentId: 's-107',
    classId: 'c-7a',
    sick: 1,
    permitted: 0,
    absent: 0,
    homeroomNote: 'Sikap dan perilaku sangat baik. Perlu latihan soal lebih intensif agar capaian nilai UTS semakin optimal.',
    extracurricular: 'Hadroh (Sangat Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-108',
    studentId: 's-108',
    classId: 'c-7a',
    sick: 0,
    permitted: 0,
    absent: 0,
    homeroomNote: 'Rajin mengumpulkan tugas tepat waktu dan memiliki catatan yang rapi. Pertahankan pencapaian ini.',
    extracurricular: 'Kaligrafi (Sangat Baik), Pramuka (Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-109',
    studentId: 's-109',
    classId: 'c-7a',
    sick: 0,
    permitted: 0,
    absent: 0,
    homeroomNote: 'Kemampuan berpikir analitis sangat menonjol. Sangat kritis dan berani mengemukakan pendapat positif.',
    extracurricular: 'Debat Bahasa (Sangat Baik), Basket (Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-110',
    studentId: 's-110',
    classId: 'c-7a',
    sick: 1,
    permitted: 0,
    absent: 0,
    homeroomNote: 'Menunjukkan perkembangan yang positif. Tetap jaga semangat belajar dan tingkatkan rasa percaya diri.',
    extracurricular: 'PMR (Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-111',
    studentId: 's-111',
    classId: 'c-7a',
    sick: 1,
    permitted: 1,
    absent: 1,
    homeroomNote: 'Perlu lebih fokus saat pembelajaran dan mengikuti program bimbingan remedial pada mata pelajaran matematika/IPA.',
    extracurricular: 'Futsal (Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'hr-112',
    studentId: 's-112',
    classId: 'c-7a',
    sick: 0,
    permitted: 0,
    absent: 0,
    homeroomNote: 'Sangat tekun dan disiplin. Menjadi teladan yang baik bagi teman-teman di kelas.',
    extracurricular: 'Tahfidz (Sangat Baik), Pramuka (Sangat Baik)',
    updatedAt: '2024-10-15T09:00:00Z',
  },
];

export const INITIAL_GAS_CONFIG: GasConfig = {
  webAppUrl: '',
  isAutoSync: false,
  lastSyncTimestamp: null,
  syncStatus: 'idle',
  syncMessage: 'Belum terhubung ke Google Apps Script Web App',
};
