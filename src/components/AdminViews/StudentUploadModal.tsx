import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Student, Gender } from '../../types';
import {
  Upload,
  FileSpreadsheet,
  Download,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  FileUp,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';

interface StudentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedStudentRow {
  index: number;
  nis: string;
  nisn: string;
  name: string;
  gender: Gender;
  classNameRaw: string;
  classId: string;
  parentName: string;
  phone: string;
  status: 'Aktif' | 'Nonaktif';
  isValid: boolean;
  validationMessages: string[];
  isExisting: boolean;
}

export const StudentUploadModal: React.FC<StudentUploadModalProps> = ({ isOpen, onClose }) => {
  const { classes, students, batchAddStudents, gasConfig, syncToGasNow } = useApp();

  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [defaultClassId, setDefaultClassId] = useState<string>(classes[0]?.id || 'c-7a');
  const [pastedText, setPastedText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [filterPreview, setFilterPreview] = useState<'all' | 'valid' | 'invalid'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; updated: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Helper to map raw class string to known classId
  const resolveClassId = (rawName: string, fallbackId: string): string => {
    if (!rawName || !rawName.trim()) return fallbackId;
    const clean = rawName.toUpperCase().replace(/\s+/g, '').replace(/[-_]/g, '');

    for (const c of classes) {
      const cClean = c.name.toUpperCase().replace(/\s+/g, '').replace(/[-_]/g, '');
      const idClean = c.id.toUpperCase().replace(/[-_]/g, '');
      if (clean === cClean || clean === idClean || clean.includes(cClean)) {
        return c.id;
      }
    }

    // Try fuzzy match for VII-A / 7A
    if (clean.includes('7A') || clean.includes('VIIA')) return 'c-7a';
    if (clean.includes('7B') || clean.includes('VIIB')) return 'c-7b';
    if (clean.includes('8A') || clean.includes('VIIIA') || clean.includes('8')) return 'c-8a';
    if (clean.includes('9A') || clean.includes('IXA') || clean.includes('9')) return 'c-9a';

    return fallbackId;
  };

  // Helper to parse gender
  const resolveGender = (rawGender: string): Gender => {
    if (!rawGender) return 'L';
    const g = rawGender.trim().toUpperCase();
    if (g === 'P' || g.startsWith('PEREMPUAN') || g.startsWith('WANITA') || g === 'F') {
      return 'P';
    }
    return 'L';
  };

  // Normalize raw object to parsed student row
  const normalizeRow = (raw: Record<string, unknown>, idx: number): ParsedStudentRow => {
    const keys = Object.keys(raw);
    const getVal = (...matchKeys: string[]): string => {
      for (const m of matchKeys) {
        for (const k of keys) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanM = m.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanK === cleanM || cleanK.includes(cleanM)) {
            const val = raw[k];
            return val !== undefined && val !== null ? String(val).trim() : '';
          }
        }
      }
      return '';
    };

    const nis = getVal('nis', 'noinduk', 'nomorinduk', 'induk');
    const nisn = getVal('nisn', 'nomorinduksiswa', 'siswa');
    const name = getVal('nama', 'namalengkap', 'namasiswa', 'name', 'student');
    const genderRaw = getVal('jeniskelamin', 'kelamin', 'jk', 'lp', 'gender');
    const classRaw = getVal('kelas', 'rombel', 'rombonganbelajar', 'class');
    const parentName = getVal('orangtua', 'namaorangtua', 'wali', 'namawali', 'parent');
    const phone = getVal('telepon', 'notelepon', 'notelp', 'nohp', 'hp', 'phone', 'whatsapp');
    const statusRaw = getVal('status', 'keaktifan');

    const gender = resolveGender(genderRaw);
    const classId = resolveClassId(classRaw, defaultClassId);
    const status = statusRaw.toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif';

    const validationMessages: string[] = [];
    if (!name) validationMessages.push('Nama siswa tidak boleh kosong');
    if (!nis) validationMessages.push('NIS tidak boleh kosong');

    const isExisting = students.some((s) => s.nis.trim() === nis.trim() && nis.trim() !== '');
    if (isExisting && importMode === 'append') {
      validationMessages.push('NIS sudah terdaftar (akan diperbarui)');
    }

    return {
      index: idx + 1,
      nis,
      nisn: nisn || (nis ? `0098${nis.padEnd(6, '0')}` : ''),
      name,
      gender,
      classNameRaw: classRaw || (classes.find((c) => c.id === classId)?.name || 'Kelas VII-A'),
      classId,
      parentName: parentName || 'Orang Tua / Wali',
      phone: phone || '',
      status,
      isValid: Boolean(name && nis),
      validationMessages,
      isExisting,
    };
  };

  // Handle Excel / CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (!json || json.length === 0) {
          alert('Berkas Excel/CSV kosong atau format tidak terdeteksi.');
          return;
        }

        const rows = json.map((r, idx) => normalizeRow(r, idx));
        setParsedRows(rows);
      } catch (err) {
        console.error('Failed to parse spreadsheet', err);
        alert('Gagal membaca berkas. Pastikan berkas berformat .xlsx, .xls, atau .csv yang valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle Pasted Text Parsing
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      alert('Silakan tempel teks tabel dari spreadsheet terlebih dahulu.');
      return;
    }

    setImportResult(null);
    const lines = pastedText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      alert('Data tempelan harus memiliki minimal baris judul (header) dan satu baris data siswa.');
      return;
    }

    // Determine delimiter (tab or comma or semicolon)
    const firstLine = lines[0];
    let delimiter = '\t';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';')) delimiter = ';';
    else if (firstLine.includes(',')) delimiter = ',';

    const headers = firstLine.split(delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim());

    const rows: ParsedStudentRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.replace(/^["']|["']$/g, '').trim());
      const rawObj: Record<string, unknown> = {};
      headers.forEach((h, idx) => {
        rawObj[h] = values[idx] || '';
      });

      rows.push(normalizeRow(rawObj, rows.length));
    }

    setParsedRows(rows);
    setSelectedFileName('Data Tempel Excel/Spreadsheet');
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const headers = ['NIS', 'NISN', 'Nama Lengkap', 'Jenis Kelamin (L/P)', 'Kelas', 'Nama Orang Tua', 'No Telepon', 'Status'];
    const sampleRows = [
      ['2411', '0098123461', 'Muhammad Ilham Ramadhan', 'L', 'VII-A', 'Fauzan Ramadhan', '081234567811', 'Aktif'],
      ['2412', '0098123462', 'Nurul Annisa Fitri', 'P', 'VII-A', 'H. Syaiful Anwar', '081234567812', 'Aktif'],
      ['2413', '0098123463', 'Zahra Aulia Rahma', 'P', 'VII-B', 'Bambang Rahmadi', '081234567813', 'Aktif'],
      ['2414', '0098123464', 'Fikri Maulana', 'L', 'VIII-A', 'Imam Supriyadi', '081234567814', 'Aktif'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...sampleRows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', 'Template_Data_Siswa_SiNilai_UTS.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Execute Import
  const handleCommitImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada data siswa yang valid untuk diimpor. Pastikan kolom NIS dan Nama terisi.');
      return;
    }

    if (
      importMode === 'replace' &&
      !confirm(`PERINGATAN: Mode "Ganti Seluruh Data Siswa" akan menghapus ${students.length} data siswa lama dan menggantinya dengan ${validRows.length} data siswa baru. Lanjutkan?`)
    ) {
      return;
    }

    setIsProcessing(true);

    try {
      const studentPayload: Omit<Student, 'id'>[] = validRows.map((r) => ({
        nis: r.nis,
        nisn: r.nisn,
        name: r.name,
        gender: r.gender,
        classId: r.classId,
        parentName: r.parentName,
        phone: r.phone,
        status: r.status,
      }));

      const res = batchAddStudents(studentPayload, importMode);
      setImportResult({ added: res.addedCount, updated: res.updatedCount });

      if (gasConfig.isAutoSync && gasConfig.webAppUrl) {
        syncToGasNow();
      }

      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Terjadi kesalahan saat memproses data siswa.');
    }
  };

  const filteredPreviewRows = parsedRows.filter((r) => {
    if (filterPreview === 'valid') return r.isValid;
    if (filterPreview === 'invalid') return !r.isValid;
    return true;
  });

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;
  const duplicateCount = parsedRows.filter((r) => r.isExisting).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full my-6 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Upload &amp; Impor Data Peserta Didik
              </h2>
              <p className="text-xs text-slate-500">
                Impor massal dari berkas Microsoft Excel (.xlsx/.xls), CSV, atau tempel tabel spreadsheet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Unduh format template CSV/Excel yang sudah disesuaikan"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh Template CSV</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Notification on Success */}
          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-emerald-900">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Proses Impor Siswa Berhasil!</h4>
                  <p className="text-xs text-emerald-700">
                    {importResult.added > 0 && `+ ${importResult.added} siswa baru ditambahkan. `}
                    {importResult.updated > 0 && `${importResult.updated} data siswa diperbarui. `}
                    Data tersimpan ke sistem dan siap digunakan pada input nilai UTS.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold text-xs hover:bg-emerald-800 transition-colors"
              >
                Tutup &amp; Lihat Siswa
              </button>
            </div>
          )}

          {/* Configuration Strips: Mode & Default Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            {/* Mode Import */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[10px]">
                Metode Impor Data
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('append')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    importMode === 'append'
                      ? 'border-emerald-600 bg-white ring-1 ring-emerald-500 shadow-2xs'
                      : 'border-slate-200 bg-slate-100/70 text-slate-600 hover:bg-white'
                  }`}
                >
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    Gabung &amp; Perbarui
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Pertahankan data lama. NIS yang sama akan diperbarui, NIS baru ditambahkan.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    importMode === 'replace'
                      ? 'border-rose-600 bg-white ring-1 ring-rose-500 shadow-2xs'
                      : 'border-slate-200 bg-slate-100/70 text-slate-600 hover:bg-white'
                  }`}
                >
                  <p className="font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                    Timpa Seluruh Data
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Hapus seluruh data siswa lama dan gantikan dengan daftar siswa dari berkas ini.
                  </p>
                </button>
              </div>
            </div>

            {/* Default Class Selection */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[10px]">
                Kelas Default (Jika kolom kelas di berkas kosong/tidak cocok)
              </label>
              <select
                value={defaultClassId}
                onChange={(e) => setDefaultClassId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 text-xs"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Tingkat {c.level})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Sistem mengenali penulisan kelas otomatis seperti &quot;VII-A&quot;, &quot;7A&quot;, &quot;Kelas 7A&quot;, dll.
              </p>
            </div>
          </div>

          {/* Tab Selector: Upload File vs Paste Text */}
          <div className="flex border-b border-slate-200 gap-4">
            <button
              onClick={() => setActiveTab('file')}
              className={`pb-2.5 font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'file'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>1. Upload File Excel / CSV</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2.5 font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'paste'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>2. Tempel Tabel (Copy-Paste dari Excel / EMIS / Dapodik)</span>
            </button>
          </div>

          {/* Tab Content: File Upload */}
          {activeTab === 'file' && (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, .tsv, .txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <FileUp className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  Klik untuk Memilih Berkas atau Seret (Drag &amp; Drop) ke Sini
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-2">
                  Mendukung format Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) dan Comma-Separated Values (<strong>.csv</strong>)
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-slate-600">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-medium">Kolom: NIS</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-medium">NISN</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-medium">Nama Lengkap</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-medium">L/P</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-medium">Kelas</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-medium">Orang Tua</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-medium">No HP</span>
                </div>
              </div>

              {selectedFileName && (
                <div className="mt-3 p-3 bg-slate-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-slate-800">{selectedFileName}</span>
                    <span className="text-slate-500">({parsedRows.length} baris terdeteksi)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFileName('');
                      setParsedRows([]);
                    }}
                    className="text-slate-400 hover:text-rose-600 text-xs font-semibold"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Paste Text */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 text-[10px]">
                  Tempel Baris Data dari Excel / Google Sheets
                </label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Contoh baris yang dapat disalin langsung dari Excel:\nNIS\tNISN\tNama Lengkap\tL/P\tKelas\tOrang Tua\tNo Telepon\n2415\t0098123465\tRian Pratama Putra\tL\tVII-A\tAgus Pratama\t081234567815\n2416\t0098123466\tDewi Sekar Wangi\tP\tVII-A\tSlamet Riyadi\t081234567816`}
                  className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500">
                  Salin tabel dari Excel/Google Sheets (termasuk baris judul) lalu tempel di atas.
                </p>
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Proses &amp; Pratinjau Teks
                </button>
              </div>
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 border-t border-slate-200 pt-5">
              {/* Summary Bar & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Hasil Pembacaan: {parsedRows.length} Siswa
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {validCount} Siap Impor
                  </span>
                  {duplicateCount > 0 && importMode === 'append' && (
                    <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {duplicateCount} Duplikat NIS (Akan Diperbarui)
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {invalidCount} Data Tidak Lengkap
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-slate-500 mr-1">Tampilkan:</span>
                  <button
                    type="button"
                    onClick={() => setFilterPreview('all')}
                    className={`px-2.5 py-1 rounded font-medium ${
                      filterPreview === 'all'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Semua ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterPreview('valid')}
                    className={`px-2.5 py-1 rounded font-medium ${
                      filterPreview === 'valid'
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'bg-white text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    Valid ({validCount})
                  </button>
                  {invalidCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterPreview('invalid')}
                      className={`px-2.5 py-1 rounded font-medium ${
                        filterPreview === 'invalid'
                          ? 'bg-rose-700 text-white font-bold'
                          : 'bg-white text-rose-800 border border-rose-200'
                      }`}
                    >
                      Bermasalah ({invalidCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">No</th>
                      <th className="py-2 px-3 w-20">NIS</th>
                      <th className="py-2 px-3 w-24">NISN</th>
                      <th className="py-2 px-3 min-w-[180px]">Nama Siswa</th>
                      <th className="py-2 px-2 w-12 text-center">L/P</th>
                      <th className="py-2 px-3 w-28">Kelas</th>
                      <th className="py-2 px-3">Orang Tua / Wali</th>
                      <th className="py-2 px-3">No. Telepon</th>
                      <th className="py-2 px-3 w-36 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredPreviewRows.map((r) => {
                      const resolvedClass = classes.find((c) => c.id === r.classId);
                      return (
                        <tr
                          key={r.index}
                          className={`hover:bg-slate-50/80 ${
                            !r.isValid ? 'bg-rose-50/30' : r.isExisting ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {r.index}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            {r.nis || <span className="text-rose-500 font-normal italic">Kosong</span>}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                            {r.nisn || '-'}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {r.name || <span className="text-rose-500 italic">Nama tidak terbaca</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                r.gender === 'L'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {r.gender}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold border border-slate-200">
                              {resolvedClass?.name || r.classId}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {r.parentName || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {r.phone || '-'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {r.isValid ? (
                              r.isExisting ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  Perbarui NIS
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <Check className="w-3 h-3" />
                                  Siswa Baru
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <XCircle className="w-3 h-3" />
                                Tidak Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2.5">
            {parsedRows.length > 0 && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                {validCount} dari {parsedRows.length} siswa siap diimpor
              </span>
            )}
            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleCommitImport}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                validCount === 0 || isProcessing
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Data...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Simpan &amp; Impor {validCount > 0 ? `${validCount} Siswa` : ''}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
