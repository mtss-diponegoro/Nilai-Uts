import { Student, Subject, GradeRecord, HomeroomRecord, SchoolSettings, SchoolClass, Teacher } from '../types';

export interface GasPayload {
  action: 'getData' | 'syncAll' | 'ping';
  students?: Student[];
  subjects?: Subject[];
  grades?: GradeRecord[];
  homeroomRecords?: HomeroomRecord[];
  classes?: SchoolClass[];
  teachers?: Teacher[];
  settings?: SchoolSettings;
}

export const GAS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SiNilai UTS - Sistem Integrasi Nilai Tengah Semester
 * Sekolah / Madrasah: MTs S Diponegoro
 * =========================================================================
 * Petunjuk Instalasi:
 * 1. Buat Google Spreadsheet baru di Google Drive (misal: "Database Nilai UTS 2024-2025").
 * 2. Klik menu "Ekstensi" > "Apps Script".
 * 3. Hapus seluruh isi default pada Code.gs, lalu tempel (paste) kode ini.
 * 4. Klik ikon "Simpan" (Save).
 * 5. Jalankan fungsi "setupDatabase" sekali untuk membuat lembar/sheet otomatis.
 * 6. Klik tombol biru "Terapkan" (Deploy) > "Kelola Penerapan" atau "Penerapan Baru" (New Deployment).
 * 7. Pilih Jenis: "Aplikasi Web" (Web App).
 * 8. Konfigurasi:
 *    - Deskripsi: Web API Nilai UTS
 *    - Jalankan sebagai: "Saya" (Me)
 *    - Yang memiliki akses: "Siapa saja" (Anyone) -> PENTING agar web app dapat sinkronisasi!
 * 9. Klik "Terapkan" (Deploy) dan salin URL Aplikasi Web (akhiran /exec).
 * 10. Tempel URL tersebut di menu "Integrasi Google Apps Script" pada aplikasi web SiNilai UTS.
 * =========================================================================
 */

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Siswa
  let sheetSiswa = ss.getSheetByName('Siswa');
  if (!sheetSiswa) {
    sheetSiswa = ss.insertSheet('Siswa');
    sheetSiswa.appendRow(['ID', 'NIS', 'NISN', 'Nama Siswa', 'L/P', 'ID Kelas', 'Nama Orang Tua', 'No Telepon', 'Status']);
    formatHeader(sheetSiswa, '#10b981');
  }

  // 2. Sheet Mapel
  let sheetMapel = ss.getSheetByName('Mapel');
  if (!sheetMapel) {
    sheetMapel = ss.insertSheet('Mapel');
    sheetMapel.appendRow(['ID', 'Kode', 'Nama Mata Pelajaran', 'KKM', 'Kategori', 'ID Guru', 'Nama Guru']);
    formatHeader(sheetMapel, '#0ea5e9');
  }

  // 3. Sheet Nilai_UTS
  let sheetNilai = ss.getSheetByName('Nilai_UTS');
  if (!sheetNilai) {
    sheetNilai = ss.insertSheet('Nilai_UTS');
    sheetNilai.appendRow(['ID', 'ID Siswa', 'ID Mapel', 'ID Kelas', 'Tugas 1', 'Tugas 2', 'Nilai UTS', 'Nilai Akhir', 'Predikat', 'Status Tuntas', 'Catatan', 'Terakhir Update']);
    formatHeader(sheetNilai, '#6366f1');
  }

  // 4. Sheet WaliKelas
  let sheetWali = ss.getSheetByName('WaliKelas');
  if (!sheetWali) {
    sheetWali = ss.insertSheet('WaliKelas');
    sheetWali.appendRow(['ID', 'ID Siswa', 'ID Kelas', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Catatan Wali Kelas', 'Ekstrakurikuler', 'Terakhir Update']);
    formatHeader(sheetWali, '#f59e0b');
  }

  // 5. Sheet Pengaturan
  let sheetSetting = ss.getSheetByName('Pengaturan');
  if (!sheetSetting) {
    sheetSetting = ss.insertSheet('Pengaturan');
    sheetSetting.appendRow(['Parameter', 'Nilai']);
    formatHeader(sheetSetting, '#64748b');
    sheetSetting.appendRow(['institutionName', 'KEMENTERIAN AGAMA REPUBLIK INDONESIA']);
    sheetSetting.appendRow(['subInstitutionName', 'KANTOR KEMENTERIAN AGAMA KABUPATEN SLEMAN']);
    sheetSetting.appendRow(['foundationName', 'YAYASAN PENDIDIKAN ISLAM DIPONEGORO']);
    sheetSetting.appendRow(['schoolName', 'MTs S Diponegoro']);
    sheetSetting.appendRow(['npsn', '20400192']);
    sheetSetting.appendRow(['nsm', '121234040015']);
    sheetSetting.appendRow(['akreditasi', 'A (Unggul)']);
    sheetSetting.appendRow(['schoolAddress', 'Jl. Diponegoro No. 45, Sleman, D.I. Yogyakarta 55281']);
    sheetSetting.appendRow(['contactInfo', 'Telepon: (0274) 868123 · Email: mtssdiponegoro@gmail.com']);
    sheetSetting.appendRow(['headmasterName', 'Drs. H. Miftahudin, M.Pd.I']);
    sheetSetting.appendRow(['headmasterNip', '197405122002121004']);
    sheetSetting.appendRow(['academicYear', '2024/2025']);
    sheetSetting.appendRow(['semester', 'Ganjil']);
    sheetSetting.appendRow(['reportPlace', 'Sleman']);
    sheetSetting.appendRow(['reportDate', '2024-10-18']);
    sheetSetting.appendRow(['weightAssignment', 40]);
    sheetSetting.appendRow(['weightUTS', 60]);
    sheetSetting.appendRow(['headerLineStyle', 'double']);
    sheetSetting.appendRow(['paperSize', 'A4']);
  }
}

function formatHeader(sheet, colorHex) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground(colorHex);
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * Handle GET request (Fetch data from Google Sheets)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getData';
    
    if (action === 'ping') {
      return createJsonResponse({
        status: 'ok',
        message: 'Google Apps Script SiNilai UTS Berhasil Terhubung',
        timestamp: new Date().toISOString()
      });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupDatabase(); // Pastikan lembar lengkap

    // Baca data siswa
    const sheetSiswa = ss.getSheetByName('Siswa');
    const dataSiswa = readSheetObjects(sheetSiswa, ['id', 'nis', 'nisn', 'name', 'gender', 'classId', 'parentName', 'phone', 'status']);

    // Baca data mapel
    const sheetMapel = ss.getSheetByName('Mapel');
    const dataMapel = readSheetObjects(sheetMapel, ['id', 'code', 'name', 'kkm', 'category', 'teacherId', 'teacherName']);

    // Baca data nilai UTS
    const sheetNilai = ss.getSheetByName('Nilai_UTS');
    const dataNilai = readSheetObjects(sheetNilai, ['id', 'studentId', 'subjectId', 'classId', 'assignment1', 'assignment2', 'utsScore', 'finalScore', 'predicate', 'isPassed', 'notes', 'updatedAt']);

    // Baca data wali kelas (presensi & catatan)
    const sheetWali = ss.getSheetByName('WaliKelas');
    const dataWali = readSheetObjects(sheetWali, ['id', 'studentId', 'classId', 'sick', 'permitted', 'absent', 'homeroomNote', 'extracurricular', 'updatedAt']);

    // Baca pengaturan
    const sheetSetting = ss.getSheetByName('Pengaturan');
    const settings = readSettingsMap(sheetSetting);

    return createJsonResponse({
      status: 'ok',
      data: {
        students: dataSiswa,
        subjects: dataMapel,
        grades: dataNilai,
        homeroomRecords: dataWali,
        settings: settings
      },
      syncedAt: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

/**
 * Handle POST request (Sync/Save data to Google Sheets)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupDatabase();

    const data = postData.data || postData;

    // 1. Simpan Nilai UTS jika ada
    if (data.grades && Array.isArray(data.grades)) {
      const sheetNilai = ss.getSheetByName('Nilai_UTS');
      writeSheetObjects(sheetNilai, data.grades, [
        'id', 'studentId', 'subjectId', 'classId', 'assignment1', 'assignment2', 'utsScore', 'finalScore', 'predicate', 'isPassed', 'notes', 'updatedAt'
      ]);
    }

    // 2. Simpan Rekam Wali Kelas (Presensi & Catatan) jika ada
    if (data.homeroomRecords && Array.isArray(data.homeroomRecords)) {
      const sheetWali = ss.getSheetByName('WaliKelas');
      writeSheetObjects(sheetWali, data.homeroomRecords, [
        'id', 'studentId', 'classId', 'sick', 'permitted', 'absent', 'homeroomNote', 'extracurricular', 'updatedAt'
      ]);
    }

    // 3. Simpan Siswa jika diperbarui
    if (data.students && Array.isArray(data.students)) {
      const sheetSiswa = ss.getSheetByName('Siswa');
      writeSheetObjects(sheetSiswa, data.students, [
        'id', 'nis', 'nisn', 'name', 'gender', 'classId', 'parentName', 'phone', 'status'
      ]);
    }

    // 4. Simpan Mapel jika diperbarui
    if (data.subjects && Array.isArray(data.subjects)) {
      const sheetMapel = ss.getSheetByName('Mapel');
      writeSheetObjects(sheetMapel, data.subjects, [
        'id', 'code', 'name', 'kkm', 'category', 'teacherId', 'teacherName'
      ]);
    }

    // 5. Simpan Pengaturan
    if (data.settings) {
      const sheetSetting = ss.getSheetByName('Pengaturan');
      writeSettingsMap(sheetSetting, data.settings);
    }

    return createJsonResponse({
      status: 'ok',
      message: 'Sinkronisasi ke Google Spreadsheet Berhasil Secara Real-Time',
      syncedAt: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

function readSheetObjects(sheet, keys) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const rows = sheet.getRange(2, 1, lastRow - 1, keys.length).getValues();
  return rows.map(row => {
    const obj = {};
    keys.forEach((key, index) => {
      obj[key] = row[index];
    });
    return obj;
  });
}

function writeSheetObjects(sheet, list, keys) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, keys.length).clearContent();
  }
  if (list.length === 0) return;

  const rows = list.map(item => keys.map(k => item[k] !== undefined ? item[k] : ''));
  sheet.getRange(2, 1, rows.length, keys.length).setValues(rows);
}

function readSettingsMap(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return {};
  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const obj = {};
  values.forEach(row => {
    if (row[0]) obj[row[0]] = row[1];
  });
  return obj;
}

function writeSettingsMap(sheet, settings) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }
  const rows = Object.keys(settings).map(key => [key, settings[key]]);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export async function testGasConnection(webAppUrl: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      latencyMs: 0,
      message: 'Format URL tidak valid. Harus diawali dengan https://script.google.com/macros/s/.../exec',
    };
  }

  const startTime = Date.now();
  try {
    const testUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=ping`;
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        latencyMs,
        message: `Koneksi gagal (Status: ${response.status} ${response.statusText}). Pastikan hak akses Web App disetel ke "Anyone" (Siapa saja).`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      latencyMs,
      message: data.message || 'Koneksi ke Google Apps Script aktif dan normal!',
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      latencyMs,
      message: `Gagal menjangkau Web App: ${errorMsg}. Pastikan URL berakhiran /exec dan hak akses "Anyone".`,
    };
  }
}

export async function syncDataToGas(
  webAppUrl: string,
  payload: {
    students: Student[];
    subjects: Subject[];
    grades: GradeRecord[];
    homeroomRecords: HomeroomRecord[];
    settings: SchoolSettings;
  }
): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Prevents pre-flight CORS block on Google Apps Script
      },
      body: JSON.stringify({
        action: 'syncAll',
        data: payload,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP Error: ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();
    if (result.status === 'ok') {
      return { success: true, message: result.message || 'Berhasil disinkronkan ke Google Spreadsheet' };
    } else {
      return { success: false, message: result.message || 'Gagal menyimpan ke Google Spreadsheet' };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Sinkronisasi gagal: ${errorMsg}` };
  }
}

export async function fetchDataFromGas(
  webAppUrl: string
): Promise<{ success: boolean; data?: any; message: string }> {
  if (!webAppUrl) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }

  try {
    const fetchUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=getData`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Gagal mengambil data dari Google Apps Script (${response.status})`,
      };
    }

    const json = await response.json();
    if (json.status === 'ok' && json.data) {
      return {
        success: true,
        data: json.data,
        message: 'Data berhasil ditarik dari Google Spreadsheet!',
      };
    } else {
      return {
        success: false,
        message: json.message || 'Format data respon tidak sesuai',
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Gagal menarik data: ${errorMsg}` };
  }
}
