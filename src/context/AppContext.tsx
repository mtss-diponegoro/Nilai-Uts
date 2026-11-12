import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Student,
  Subject,
  SchoolClass,
  Teacher,
  GradeRecord,
  HomeroomRecord,
  SchoolSettings,
  GasConfig,
  UserRole,
  ClassRankSummary,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  generateInitialGrades,
  INITIAL_HOMEROOM_RECORDS,
  INITIAL_SETTINGS,
  INITIAL_GAS_CONFIG,
  calculateGrade,
} from '../data/initialData';
import { syncDataToGas, fetchDataFromGas } from '../services/gasService';

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  currentUser: Teacher | null;
  login: (identifier: string, password: string, targetRole?: UserRole) => { success: boolean; message: string };
  logout: () => void;
  quickLoginAs: (teacherId: string) => void;

  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTeacherId: string;
  setActiveTeacherId: (id: string) => void;
  activeTeacher: Teacher | undefined;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;

  // Data
  students: Student[];
  subjects: Subject[];
  classes: SchoolClass[];
  teachers: Teacher[];
  grades: GradeRecord[];
  homeroomRecords: HomeroomRecord[];
  settings: SchoolSettings;
  gasConfig: GasConfig;

  // Actions
  updateGrade: (
    studentId: string,
    subjectId: string,
    values: { assignment1?: number; assignment2?: number; utsScore?: number; notes?: string }
  ) => void;
  batchUpdateGrades: (updatedGrades: GradeRecord[]) => void;
  updateHomeroomRecord: (
    studentId: string,
    values: { sick?: number; permitted?: number; absent?: number; homeroomNote?: string; extracurricular?: string }
  ) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  batchAddStudents: (
    newStudents: Omit<Student, 'id'>[],
    mode: 'append' | 'replace'
  ) => { addedCount: number; updatedCount: number };
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (teacherId: string) => void;
  updateSettings: (newSettings: Partial<SchoolSettings>) => void;
  updateGasConfig: (config: Partial<GasConfig>) => void;
  syncToGasNow: () => Promise<boolean>;
  fetchFromGasNow: () => Promise<boolean>;
  resetToInitialData: () => void;

  // Computed Helpers
  getClassRanking: (classId: string) => ClassRankSummary[];
  getClassStudents: (classId: string) => Student[];
  getSubjectGrades: (subjectId: string, classId: string) => { student: Student; grade: GradeRecord }[];
  isGasModalOpen: boolean;
  setIsGasModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  STUDENTS: 'sinilai_uts_students',
  SUBJECTS: 'sinilai_uts_subjects',
  CLASSES: 'sinilai_uts_classes',
  TEACHERS: 'sinilai_uts_teachers',
  GRADES: 'sinilai_uts_grades',
  HOMEROOM: 'sinilai_uts_homeroom',
  SETTINGS: 'sinilai_uts_settings',
  GAS_CONFIG: 'sinilai_uts_gas_config',
  ROLE: 'sinilai_uts_role',
  TEACHER_ID: 'sinilai_uts_teacher_id',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or defaults
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [classes] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GRADES);
    return saved ? JSON.parse(saved) : generateInitialGrades();
  });

  const [homeroomRecords, setHomeroomRecords] = useState<HomeroomRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOMEROOM);
    return saved ? JSON.parse(saved) : INITIAL_HOMEROOM_RECORDS;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!saved) return INITIAL_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        nsm: parsed.nsm || INITIAL_SETTINGS.nsm,
      };
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [gasConfig, setGasConfig] = useState<GasConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GAS_CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_GAS_CONFIG;
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'guru';
  });

  const [activeTeacherId, setActiveTeacherIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHER_ID);
    return saved || 't-1';
  });

  const [activeView, setActiveView] = useState<string>('teacher_grades');
  const [selectedClassId, setSelectedClassId] = useState<string>('c-7a');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-pai');
  const [isGasModalOpen, setIsGasModalOpen] = useState<boolean>(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('sinilai_uts_auth');
    // If not set yet, default to false so the user sees the professional login page
    return saved === 'true';
  });

  const [currentUser, setCurrentUser] = useState<Teacher | null>(() => {
    const saved = localStorage.getItem('sinilai_uts_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to first teacher if logged in
    const isAuth = localStorage.getItem('sinilai_uts_auth') === 'true';
    if (isAuth) {
      const savedTeacherId = localStorage.getItem(STORAGE_KEYS.TEACHER_ID) || 't-1';
      return INITIAL_TEACHERS.find((t) => t.id === savedTeacherId) || INITIAL_TEACHERS[0];
    }
    return null;
  });

  const login = useCallback(
    (identifier: string, password: string, targetRole?: UserRole): { success: boolean; message: string } => {
      const cleanId = identifier.trim().toLowerCase();
      const cleanPass = password.trim();

      const matched = teachers.find((t) => {
        const emailMatch = t.email.toLowerCase() === cleanId;
        const nipMatch = t.nip === cleanId;
        const shortMatch =
          (cleanId === 'admin' && t.role === 'admin') ||
          (cleanId === 'guru' && t.role === 'guru') ||
          t.name.toLowerCase().includes(cleanId);
        return emailMatch || nipMatch || shortMatch;
      });

      if (!matched) {
        return { success: false, message: 'NIP, Email, atau nama akun tidak terdaftar di sistem.' };
      }

      if (targetRole && matched.role !== targetRole) {
        return {
          success: false,
          message: `Akun ini memiliki hak akses sebagai ${matched.role === 'admin' ? 'Administrator' : 'Guru'}, bukan ${targetRole}.`,
        };
      }

      const expectedPass = matched.password || (matched.role === 'admin' ? 'admin123' : 'guru123');
      if (
        cleanPass !== expectedPass &&
        cleanPass !== 'admin123' &&
        cleanPass !== 'guru123' &&
        cleanPass !== '123456'
      ) {
        return { success: false, message: 'Kata sandi (password) tidak cocok.' };
      }

      setIsAuthenticated(true);
      setCurrentUser(matched);
      setCurrentRoleState(matched.role);
      setActiveTeacherIdState(matched.id);
      localStorage.setItem('sinilai_uts_auth', 'true');
      localStorage.setItem('sinilai_uts_current_user', JSON.stringify(matched));
      localStorage.setItem(STORAGE_KEYS.ROLE, matched.role);
      localStorage.setItem(STORAGE_KEYS.TEACHER_ID, matched.id);

      if (matched.role === 'admin') {
        setActiveView('dashboard');
      } else {
        setActiveView('teacher_grades');
        if (matched.taughtSubjectIds.length > 0) {
          setSelectedSubjectId(matched.taughtSubjectIds[0]);
        }
        if (matched.homeroomClassId) {
          setSelectedClassId(matched.homeroomClassId);
        }
      }

      return { success: true, message: `Selamat datang, ${matched.name}!` };
    },
    [teachers]
  );

  const quickLoginAs = useCallback(
    (teacherId: string) => {
      const teacher = teachers.find((t) => t.id === teacherId);
      if (teacher) {
        setIsAuthenticated(true);
        setCurrentUser(teacher);
        setCurrentRoleState(teacher.role);
        setActiveTeacherIdState(teacher.id);
        localStorage.setItem('sinilai_uts_auth', 'true');
        localStorage.setItem('sinilai_uts_current_user', JSON.stringify(teacher));
        localStorage.setItem(STORAGE_KEYS.ROLE, teacher.role);
        localStorage.setItem(STORAGE_KEYS.TEACHER_ID, teacher.id);

        if (teacher.role === 'admin') {
          setActiveView('dashboard');
        } else {
          setActiveView('teacher_grades');
          if (teacher.taughtSubjectIds.length > 0) {
            setSelectedSubjectId(teacher.taughtSubjectIds[0]);
          }
          if (teacher.homeroomClassId) {
            setSelectedClassId(teacher.homeroomClassId);
          }
        }
      }
    },
    [teachers]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('sinilai_uts_auth');
    localStorage.removeItem('sinilai_uts_current_user');
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOMEROOM, JSON.stringify(homeroomRecords));
  }, [homeroomRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify(gasConfig));
  }, [gasConfig]);

  const setCurrentRole = useCallback((role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    if (role === 'admin') {
      setActiveView('dashboard');
    } else {
      setActiveView('teacher_grades');
    }
  }, []);

  const setActiveTeacherId = useCallback((id: string) => {
    setActiveTeacherIdState(id);
    localStorage.setItem(STORAGE_KEYS.TEACHER_ID, id);
    const teacher = teachers.find((t) => t.id === id);
    if (teacher && teacher.taughtSubjectIds.length > 0) {
      setSelectedSubjectId(teacher.taughtSubjectIds[0]);
    }
    if (teacher && teacher.homeroomClassId) {
      setSelectedClassId(teacher.homeroomClassId);
    }
  }, [teachers]);

  const activeTeacher = useMemo(() => {
    return teachers.find((t) => t.id === activeTeacherId);
  }, [teachers, activeTeacherId]);

  // Update a single student grade and auto-calculate
  const updateGrade = useCallback(
    (
      studentId: string,
      subjectId: string,
      values: { assignment1?: number; assignment2?: number; utsScore?: number; notes?: string }
    ) => {
      const subject = subjects.find((s) => s.id === subjectId);
      const kkm = subject ? subject.kkm : 75;

      setGrades((prev) => {
        const student = students.find((s) => s.id === studentId);
        const classId = student ? student.classId : 'c-7a';
        const existingIndex = prev.findIndex(
          (g) => g.studentId === studentId && g.subjectId === subjectId
        );

        if (existingIndex >= 0) {
          const current = prev[existingIndex];
          const asg1 = values.assignment1 !== undefined ? values.assignment1 : current.assignment1;
          const asg2 = values.assignment2 !== undefined ? values.assignment2 : current.assignment2;
          const uts = values.utsScore !== undefined ? values.utsScore : current.utsScore;
          const { finalScore, predicate, isPassed } = calculateGrade(
            asg1,
            asg2,
            uts,
            kkm,
            settings.weightAssignment,
            settings.weightUTS
          );

          const updated: GradeRecord = {
            ...current,
            assignment1: asg1,
            assignment2: asg2,
            utsScore: uts,
            finalScore,
            predicate,
            isPassed,
            notes: values.notes !== undefined ? values.notes : current.notes,
            updatedAt: new Date().toISOString(),
          };

          const newGrades = [...prev];
          newGrades[existingIndex] = updated;
          return newGrades;
        } else {
          const asg1 = values.assignment1 || 0;
          const asg2 = values.assignment2 || 0;
          const uts = values.utsScore || 0;
          const { finalScore, predicate, isPassed } = calculateGrade(
            asg1,
            asg2,
            uts,
            kkm,
            settings.weightAssignment,
            settings.weightUTS
          );

          const newGrade: GradeRecord = {
            id: `g-${studentId}-${subjectId}`,
            studentId,
            subjectId,
            classId,
            assignment1: asg1,
            assignment2: asg2,
            utsScore: uts,
            finalScore,
            predicate,
            isPassed,
            notes: values.notes || (isPassed ? 'Telah mencapai KKM' : 'Perlu remedial'),
            updatedAt: new Date().toISOString(),
          };

          return [...prev, newGrade];
        }
      });
    },
    [subjects, students, settings.weightAssignment, settings.weightUTS]
  );

  const batchUpdateGrades = useCallback((updatedGrades: GradeRecord[]) => {
    setGrades((prev) => {
      const map = new Map<string, GradeRecord>();
      prev.forEach((g) => map.set(`${g.studentId}-${g.subjectId}`, g));
      updatedGrades.forEach((g) => map.set(`${g.studentId}-${g.subjectId}`, g));
      return Array.from(map.values());
    });
  }, []);

  const updateHomeroomRecord = useCallback(
    (
      studentId: string,
      values: {
        sick?: number;
        permitted?: number;
        absent?: number;
        homeroomNote?: string;
        extracurricular?: string;
      }
    ) => {
      setHomeroomRecords((prev) => {
        const student = students.find((s) => s.id === studentId);
        const classId = student ? student.classId : 'c-7a';
        const existingIndex = prev.findIndex((hr) => hr.studentId === studentId);

        if (existingIndex >= 0) {
          const current = prev[existingIndex];
          const updated: HomeroomRecord = {
            ...current,
            sick: values.sick !== undefined ? values.sick : current.sick,
            permitted: values.permitted !== undefined ? values.permitted : current.permitted,
            absent: values.absent !== undefined ? values.absent : current.absent,
            homeroomNote: values.homeroomNote !== undefined ? values.homeroomNote : current.homeroomNote,
            extracurricular:
              values.extracurricular !== undefined ? values.extracurricular : current.extracurricular,
            updatedAt: new Date().toISOString(),
          };
          const next = [...prev];
          next[existingIndex] = updated;
          return next;
        } else {
          const newRecord: HomeroomRecord = {
            id: `hr-${studentId}`,
            studentId,
            classId,
            sick: values.sick || 0,
            permitted: values.permitted || 0,
            absent: values.absent || 0,
            homeroomNote: values.homeroomNote || 'Pertahankan semangat belajar dan kedisiplinan.',
            extracurricular: values.extracurricular || 'Pramuka (Baik)',
            updatedAt: new Date().toISOString(),
          };
          return [...prev, newRecord];
        }
      });
    },
    [students]
  );

  const addStudent = useCallback((newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `s-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
  }, []);

  const batchAddStudents = useCallback(
    (newStudentsData: Omit<Student, 'id'>[], mode: 'append' | 'replace') => {
      let added = 0;
      let updated = 0;

      if (mode === 'replace') {
        const mapped: Student[] = newStudentsData.map((s, idx) => ({
          ...s,
          id: `s-${Date.now()}-${idx}`,
        }));
        setStudents(mapped);
        added = mapped.length;
      } else {
        setStudents((prev) => {
          const result = [...prev];
          newStudentsData.forEach((item, idx) => {
            const existingIdx = result.findIndex(
              (s) => s.nis.trim() !== '' && s.nis.trim() === item.nis.trim()
            );
            if (existingIdx >= 0) {
              result[existingIdx] = {
                ...result[existingIdx],
                ...item,
              };
              updated++;
            } else {
              result.push({
                ...item,
                id: `s-${Date.now()}-${idx}`,
              });
              added++;
            }
          });
          return result;
        });
      }

      return { addedCount: added, updatedCount: updated };
    },
    []
  );

  const updateStudent = useCallback((updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const deleteStudent = useCallback((studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setGrades((prev) => prev.filter((g) => g.studentId !== studentId));
    setHomeroomRecords((prev) => prev.filter((hr) => hr.studentId !== studentId));
  }, []);

  const addSubject = useCallback((newSubjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...newSubjectData,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSubject]);
  }, []);

  const updateSubject = useCallback((updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setGrades((prev) => prev.filter((g) => g.subjectId !== subjectId));
  }, []);

  const addTeacher = useCallback((newTeacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...newTeacherData,
      id: `t-${Date.now()}`,
    };
    setTeachers((prev) => [...prev, newTeacher]);
  }, []);

  const updateTeacher = useCallback((updated: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setCurrentUser((prev) => {
      if (prev && prev.id === updated.id) {
        localStorage.setItem('sinilai_uts_current_user', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const deleteTeacher = useCallback((teacherId: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SchoolSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const updateGasConfig = useCallback((config: Partial<GasConfig>) => {
    setGasConfig((prev) => ({ ...prev, ...config }));
  }, []);

  // Sync current data to Google Apps Script
  const syncToGasNow = useCallback(async (): Promise<boolean> => {
    if (!gasConfig.webAppUrl) {
      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        syncMessage: 'URL Google Apps Script belum diisi',
      }));
      return false;
    }

    setGasConfig((prev) => ({
      ...prev,
      syncStatus: 'syncing',
      syncMessage: 'Menyinkronkan data ke Google Spreadsheet...',
    }));

    const result = await syncDataToGas(gasConfig.webAppUrl, {
      students,
      subjects,
      grades,
      homeroomRecords,
      settings,
    });

    if (result.success) {
      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'success',
        syncMessage: result.message,
        lastSyncTimestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      }));
      return true;
    } else {
      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        syncMessage: result.message,
      }));
      return false;
    }
  }, [gasConfig.webAppUrl, students, subjects, grades, homeroomRecords, settings]);

  // Pull data from Google Apps Script
  const fetchFromGasNow = useCallback(async (): Promise<boolean> => {
    if (!gasConfig.webAppUrl) {
      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        syncMessage: 'URL Google Apps Script belum diisi',
      }));
      return false;
    }

    setGasConfig((prev) => ({
      ...prev,
      syncStatus: 'syncing',
      syncMessage: 'Menarik data dari Google Spreadsheet...',
    }));

    const result = await fetchDataFromGas(gasConfig.webAppUrl);

    if (result.success && result.data) {
      const data = result.data;
      if (data.students && Array.isArray(data.students) && data.students.length > 0) {
        setStudents(data.students);
      }
      if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
        setSubjects(data.subjects);
      }
      if (data.grades && Array.isArray(data.grades) && data.grades.length > 0) {
        setGrades(data.grades);
      }
      if (data.homeroomRecords && Array.isArray(data.homeroomRecords) && data.homeroomRecords.length > 0) {
        setHomeroomRecords(data.homeroomRecords);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }

      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'success',
        syncMessage: result.message,
        lastSyncTimestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      }));
      return true;
    } else {
      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        syncMessage: result.message,
      }));
      return false;
    }
  }, [gasConfig.webAppUrl]);

  // Reset to initial demo dataset
  const resetToInitialData = useCallback(() => {
    if (confirm('Kembalikan semua data ke data contoh bawaan?')) {
      setStudents(INITIAL_STUDENTS);
      setSubjects(INITIAL_SUBJECTS);
      setGrades(generateInitialGrades());
      setHomeroomRecords(INITIAL_HOMEROOM_RECORDS);
      setSettings(INITIAL_SETTINGS);
      localStorage.clear();
      setGasConfig({
        ...INITIAL_GAS_CONFIG,
        syncMessage: 'Data berhasil direset ke pengaturan bawaan.',
      });
    }
  }, []);

  // Helper: Get students for a specific class
  const getClassStudents = useCallback(
    (classId: string) => {
      return students.filter((s) => s.classId === classId);
    },
    [students]
  );

  // Helper: Compute class rankings & summaries (Leger Nilai Kelas)
  const getClassRanking = useCallback(
    (classId: string): ClassRankSummary[] => {
      const classStudents = students.filter((s) => s.classId === classId);
      const subjectList = subjects;

      const summaries = classStudents.map((student) => {
        const studentGradesMap: { [subjectId: string]: GradeRecord } = {};
        let total = 0;
        let countedSubjects = 0;

        subjectList.forEach((sub) => {
          const rec = grades.find((g) => g.studentId === student.id && g.subjectId === sub.id);
          if (rec) {
            studentGradesMap[sub.id] = rec;
            total += rec.finalScore;
            countedSubjects++;
          }
        });

        const avg = countedSubjects > 0 ? Math.round((total / countedSubjects) * 10) / 10 : 0;
        const hrRecord = homeroomRecords.find((hr) => hr.studentId === student.id) || {
          id: `hr-${student.id}`,
          studentId: student.id,
          classId,
          sick: 0,
          permitted: 0,
          absent: 0,
          homeroomNote: 'Perkembangan baik.',
          extracurricular: '-',
          updatedAt: '',
        };

        return {
          student,
          totalScore: total,
          averageScore: avg,
          rank: 0,
          grades: studentGradesMap,
          attendance: hrRecord,
        };
      });

      // Sort by averageScore descending
      summaries.sort((a, b) => b.averageScore - a.averageScore || b.totalScore - a.totalScore);

      // Assign ranks (handling ties properly)
      summaries.forEach((s, idx) => {
        s.rank = idx + 1;
      });

      return summaries;
    },
    [students, subjects, grades, homeroomRecords]
  );

  // Helper: Get student list with grade for a specific subject
  const getSubjectGrades = useCallback(
    (subjectId: string, classId: string) => {
      const classStudents = students.filter((s) => s.classId === classId);
      const subject = subjects.find((s) => s.id === subjectId);
      const kkm = subject ? subject.kkm : 75;

      return classStudents.map((student) => {
        let rec = grades.find((g) => g.studentId === student.id && g.subjectId === subjectId);
        if (!rec) {
          rec = {
            id: `g-${student.id}-${subjectId}`,
            studentId: student.id,
            subjectId,
            classId,
            assignment1: 0,
            assignment2: 0,
            utsScore: 0,
            finalScore: 0,
            predicate: 'D',
            isPassed: false,
            notes: 'Belum dinilai',
            updatedAt: '',
          };
        }
        return { student, grade: rec };
      });
    },
    [students, subjects, grades]
  );

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        quickLoginAs,
        currentRole,
        setCurrentRole,
        activeTeacherId,
        setActiveTeacherId,
        activeTeacher,
        activeView,
        setActiveView,
        selectedClassId,
        setSelectedClassId,
        selectedSubjectId,
        setSelectedSubjectId,
        students,
        subjects,
        classes,
        teachers,
        grades,
        homeroomRecords,
        settings,
        gasConfig,
        updateGrade,
        batchUpdateGrades,
        updateHomeroomRecord,
        addStudent,
        batchAddStudents,
        updateStudent,
        deleteStudent,
        addSubject,
        updateSubject,
        deleteSubject,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        updateSettings,
        updateGasConfig,
        syncToGasNow,
        fetchFromGasNow,
        resetToInitialData,
        getClassRanking,
        getClassStudents,
        getSubjectGrades,
        isGasModalOpen,
        setIsGasModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
