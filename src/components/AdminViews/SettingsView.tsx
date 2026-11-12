import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialKopSurat } from '../Common/OfficialKopSurat';
import {
  Settings,
  Save,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Building,
  Scale,
  FileText,
  Eye,
  Sliders,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToInitialData, syncToGasNow, gasConfig, setActiveView } = useApp();

  const [form, setForm] = useState({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nsm && form.nsm.length !== 12) {
      if (!confirm(`Peringatan: NSM saat ini berjumlah ${form.nsm.length} digit (standar Kemenag adalah 12 digit). Tetap simpan?`)) {
        return;
      }
    }

    updateSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);

    if (gasConfig.isAutoSync && gasConfig.webAppUrl) {
      syncToGasNow();
    }
  };

  const isNsmValid = (form.nsm?.length || 0) === 12;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            Pengaturan Sekolah &amp; Pembobotan Rapor UTS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi identitas madrasah (NSM 12 digit, NPSN), kop surat, titimangsa tanda tangan rapor, dan formula bobot penilaian
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {savedNotice && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Pengaturan Disimpan!
            </span>
          )}
          <button
            type="button"
            onClick={() => setActiveView('walikelas_kop')}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            Atur Logo &amp; Kop Lengkap &rarr;
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Live Kop Surat Preview Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              Pratinjau Langsung Kop Surat Rapor (Live Preview)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              NSM 12 Digit &amp; NPSN tercantum otomatis pada kop surat resmi
            </span>
          </div>

          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg">
            <OfficialKopSurat settings={form} />
          </div>
        </div>

        {/* Identitas Sekolah Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            Identitas Utama Madrasah &amp; Nomor Statistik (NSM &amp; NPSN)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nama Madrasah / Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                placeholder="MTs S Diponegoro"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-900"
              />
            </div>

            {/* NSM (Nomor Statistik Madrasah) - 12 DIGIT */}
            <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-200/80">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-emerald-950 uppercase text-[11px]">
                  Nomor Statistik Madrasah (NSM) <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    isNsmValid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isNsmValid ? '✓ 12 Digit Sesuai Standar Kemenag' : `${form.nsm?.length || 0}/12 Digit`}
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={12}
                value={form.nsm || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setForm({ ...form, nsm: val });
                }}
                placeholder="Contoh: 121234040015"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono font-bold text-sm tracking-widest text-slate-900 bg-white"
              />
              <p className="text-[10px] text-slate-600 mt-1">
                Wajib 12 digit angka resmi dari Kementerian Agama RI untuk dicantumkan pada kop surat rapor dan piagam.
              </p>
            </div>

            {/* NPSN & Akreditasi */}
            <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                    NPSN (8 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={form.npsn}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setForm({ ...form, npsn: val });
                    }}
                    placeholder="20400192"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono font-semibold text-xs bg-white"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                    {form.npsn?.length || 0}/8 Digit
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                    Akreditasi
                  </label>
                  <input
                    type="text"
                    value={form.akreditasi}
                    onChange={(e) => setForm({ ...form, akreditasi: e.target.value })}
                    placeholder="A (Unggul)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 text-xs bg-white"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Peringkat Akreditasi BAN-SM
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Alamat Lengkap Madrasah (Baris Kop Surat) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.schoolAddress}
                onChange={(e) => setForm({ ...form, schoolAddress: e.target.value })}
                placeholder="Jl. Diponegoro No. 45, Sleman, D.I. Yogyakarta 55281"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Kontak Madrasah (Telepon, Email, Website)
              </label>
              <input
                type="text"
                value={form.contactInfo || ''}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                placeholder="Telepon: (0274) 868123 · Email: mtssdiponegoro@gmail.com · Website: www.mts-diponegoro.sch.id"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nama Kepala Madrasah / Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.headmasterName}
                onChange={(e) => setForm({ ...form, headmasterName: e.target.value })}
                placeholder="Drs. H. Miftahudin, M.Pd.I"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                NIP Kepala Madrasah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.headmasterNip}
                onChange={(e) => setForm({ ...form, headmasterNip: e.target.value })}
                placeholder="197405122002121004"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Instansi Kemenag & Yayasan (Kop Atas) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Teks Lembaga Atasan &amp; Yayasan (Header Kop Surat)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Baris 1: Kementerian / Instansi Pusat
              </label>
              <input
                type="text"
                value={form.institutionName}
                onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                placeholder="KEMENTERIAN AGAMA REPUBLIK INDONESIA"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Baris 2: Kantor Wilayah / Daerah
              </label>
              <input
                type="text"
                value={form.subInstitutionName}
                onChange={(e) => setForm({ ...form, subInstitutionName: e.target.value })}
                placeholder="KANTOR KEMENTERIAN AGAMA KABUPATEN SLEMAN"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Baris 3: Yayasan / Penyelenggara Pendidikan (Opsional)
              </label>
              <input
                type="text"
                value={form.foundationName}
                onChange={(e) => setForm({ ...form, foundationName: e.target.value })}
                placeholder="YAYASAN PENDIDIKAN ISLAM DIPONEGORO"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Akademik & Titimangsa Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tahun Ajaran & Titimangsa Pembagian Rapor
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                required
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                placeholder="2024/2025"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Semester
              </label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value as 'Ganjil' | 'Genap' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Kota Titimangsa
              </label>
              <input
                type="text"
                required
                value={form.reportPlace}
                onChange={(e) => setForm({ ...form, reportPlace: e.target.value })}
                placeholder="Sleman"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Tanggal Pembagian Rapor
              </label>
              <input
                type="date"
                required
                value={form.reportDate}
                onChange={(e) => setForm({ ...form, reportDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Pembobotan Penilaian UTS Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              Formula Bobot Penilaian Ujian Tengah Semester
            </h3>
            <span className="text-xs font-mono font-bold text-slate-600">
              Total: {Number(form.weightAssignment) + Number(form.weightUTS)}%
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Formula Nilai Akhir UTS = (Rata-rata Tugas × Bobot Tugas) + (Nilai Ujian UTS × Bobot UTS)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Bobot Nilai Tugas / Formatif (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.weightAssignment}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    setForm({ ...form, weightAssignment: w, weightUTS: 100 - w });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
                <span className="text-sm font-bold text-slate-600">%</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Bobot Nilai Ujian UTS / STS (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.weightUTS}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    setForm({ ...form, weightUTS: w, weightAssignment: 100 - w });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
                <span className="text-sm font-bold text-slate-600">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={resetToInitialData}
            className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data ke Contoh Awal
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
};
