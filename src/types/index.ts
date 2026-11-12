export type Gender = 'L' | 'P';

export type UserRole = 'admin' | 'guru';

export type GradePredicate = 'A' | 'B' | 'C' | 'D';

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: Gender;
  classId: string;
  parentName: string;
  phone: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  kkm: number;
  category: 'Umum' | 'Agama' | 'Muatan Lokal';
  teacherId: string;
  teacherName: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "VII-A", "VII-B", "VIII-A", "IX-A"
  level: 'VII' | 'VIII' | 'IX';
  academicYear: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  email: string;
  role: UserRole;
  isHomeroom: boolean;
  homeroomClassId?: string; // class they are homeroom advisor for
  taughtSubjectIds: string[]; // subject IDs they teach
  password?: string;
  phone?: string;
  gender?: Gender;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  assignment1: number;
  assignment2: number;
  utsScore: number;
  finalScore: number;
  predicate: GradePredicate;
  isPassed: boolean;
  notes?: string;
  updatedAt: string;
}

export interface HomeroomRecord {
  id: string;
  studentId: string;
  classId: string;
  sick: number; // Sakit
  permitted: number; // Izin
  absent: number; // Tanpa Keterangan / Alpa
  homeroomNote: string;
  extracurricular?: string;
  updatedAt: string;
}

export interface SchoolSettings {
  institutionName: string; // e.g. "KEMENTERIAN AGAMA REPUBLIK INDONESIA"
  subInstitutionName: string; // e.g. "KANTOR KEMENTERIAN AGAMA KABUPATEN SLEMAN"
  foundationName: string; // e.g. "YAYASAN PENDIDIKAN ISLAM DIPONEGORO"
  schoolName: string;
  npsn: string;
  nsm: string; // 12-digit Nomor Statistik Madrasah (Kemenag)
  akreditasi: string; // e.g. "A (Unggul)"
  schoolAddress: string;
  contactInfo: string;
  headmasterName: string;
  headmasterNip: string;
  academicYear: string; // e.g. "2024/2025"
  semester: 'Ganjil' | 'Genap';
  reportPlace: string; // e.g. "Sleman"
  reportDate: string; // e.g. "2024-10-18"
  weightAssignment: number; // e.g. 40 (%)
  weightUTS: number; // e.g. 60 (%)
  // Kop & Logo Settings
  logoInstansiUrl: string; // Left logo (Kemenag / Dinas)
  logoLembagaUrl: string; // Right logo (Madrasah / Yayasan)
  showLogoInstansi: boolean;
  showLogoLembaga: boolean;
  logoInstansiSize: number; // in pixels (e.g. 68)
  logoLembagaSize: number; // in pixels (e.g. 68)
  headerLineStyle: 'double' | 'single' | 'none';
  paperSize: 'A4' | 'F4';
}

export interface GasConfig {
  webAppUrl: string;
  isAutoSync: boolean;
  lastSyncTimestamp: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncMessage: string;
}

export interface ClassRankSummary {
  student: Student;
  totalScore: number;
  averageScore: number;
  rank: number;
  grades: { [subjectId: string]: GradeRecord };
  attendance: HomeroomRecord;
}
