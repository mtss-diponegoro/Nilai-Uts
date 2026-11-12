import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialKopSurat } from '../Common/OfficialKopSurat';
import { PRESET_LOGOS } from '../../data/defaultLogos';
import {
  Image,
  Upload,
  Save,
  CheckCircle2,
  Sliders,
  Printer,
  RotateCcw,
  Building2,
  FileCheck,
  Eye,
} from 'lucide-react';

export const KopSettingsView: React.FC = () => {
  const { settings, updateSettings, setActiveView } = useApp();

  const [form, setForm] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'instansi' | 'lembaga') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (target === 'instansi') {
            setForm((prev) => ({ ...prev, logoInstansiUrl: reader.result as string, showLogoInstansi: true }));
          } else {
            setForm((prev) => ({ ...prev, logoLembagaUrl: reader.result as string, showLogoLembaga: true }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestPrint = () => {
    updateSettings(form);
    setActiveView('walikelas_rapor');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Menu Wali Kelas
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">Pengaturan Kop Surat & Dokumen</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            Pengaturan Kop Cetak, Logo Instansi & Logo Lembaga
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur logo kementerian/instansi (kiri), logo madrasah/lembaga (kanan), teks kop resmi, dan garis pemisah cetak
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Tersimpan!
            </span>
          )}
          <button
            type="button"
            onClick={handleTestPrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Lihat di Rapor Cetak
          </button>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-600" />
            Pratinjau Langsung Kop Cetak (Live Preview)
          </span>
          <span className="text-[11px] text-slate-500">
            Tampilan ini akan dicetak di bagian atas lembar Rapor UTS, Leger, dan Dokumen Resmi.
          </span>
        </div>

        {/* Render Official Kop */}
        <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 shadow-2xs">
          <OfficialKopSurat settings={form} />
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Two Logos Customization Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Instansi (Left) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase">
                    Logo Instansi (Kiri Kop)
                  </h3>
                  <p className="text-[11px] text-slate-500">Kementerian Agama / Dinas Pendidikan</p>
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showLogoInstansi}
                  onChange={(e) => setForm({ ...form, showLogoInstansi: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Tampilkan
              </label>
            </div>

            {/* Current Preview & Size */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div
                className="bg-white p-1 rounded border border-slate-200 flex items-center justify-center shrink-0"
                style={{ width: `${form.logoInstansiSize}px`, height: `${form.logoInstansiSize}px` }}
              >
                {form.logoInstansiUrl ? (
                  <img
                    src={form.logoInstansiUrl}
                    alt="Logo Instansi Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[9px] text-slate-400">Kosong</span>
                )}
              </div>
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Ukuran Logo:</span>
                  <span className="font-mono font-bold text-slate-800">{form.logoInstansiSize} px</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={form.logoInstansiSize}
                  onChange={(e) => setForm({ ...form, logoInstansiSize: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Preset Options */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
                Pilih Preset Bawaan:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoInstansiUrl: PRESET_LOGOS.KEMENAG, showLogoInstansi: true })}
                  className="p-2 border border-slate-200 hover:border-emerald-500 rounded-lg text-left bg-white hover:bg-emerald-50/50 transition-colors"
                >
                  <p className="font-bold text-slate-800">Kementerian Agama</p>
                  <p className="text-[10px] text-slate-500">Ikhlas Beramal</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoInstansiUrl: PRESET_LOGOS.KEMENDIKBUD, showLogoInstansi: true })}
                  className="p-2 border border-slate-200 hover:border-emerald-500 rounded-lg text-left bg-white hover:bg-emerald-50/50 transition-colors"
                >
                  <p className="font-bold text-slate-800">Kemendikbud</p>
                  <p className="text-[10px] text-slate-500">Tut Wuri Handayani</p>
                </button>
              </div>
            </div>

            {/* Upload or Custom URL */}
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">
                Atau Unggah Logo Sendiri (PNG/JPG):
              </label>
              <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-colors text-xs text-slate-700 font-medium">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Pilih Berkas Logo dari Komputer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'instansi')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Logo Lembaga / Madrasah (Right) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase">
                    Logo Lembaga / Sekolah (Kanan Kop)
                  </h3>
                  <p className="text-[11px] text-slate-500">Logo Madrasah / Yayasan Diponegoro</p>
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showLogoLembaga}
                  onChange={(e) => setForm({ ...form, showLogoLembaga: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Tampilkan
              </label>
            </div>

            {/* Current Preview & Size */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div
                className="bg-white p-1 rounded border border-slate-200 flex items-center justify-center shrink-0"
                style={{ width: `${form.logoLembagaSize}px`, height: `${form.logoLembagaSize}px` }}
              >
                {form.logoLembagaUrl ? (
                  <img
                    src={form.logoLembagaUrl}
                    alt="Logo Lembaga Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[9px] text-slate-400">Kosong</span>
                )}
              </div>
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Ukuran Logo:</span>
                  <span className="font-mono font-bold text-slate-800">{form.logoLembagaSize} px</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={form.logoLembagaSize}
                  onChange={(e) => setForm({ ...form, logoLembagaSize: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Preset Options */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
                Pilih Preset Bawaan:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoLembagaUrl: PRESET_LOGOS.DIPONEGORO, showLogoLembaga: true })}
                  className="p-2 border border-slate-200 hover:border-emerald-500 rounded-lg text-left bg-white hover:bg-emerald-50/50 transition-colors"
                >
                  <p className="font-bold text-slate-800">MTs Diponegoro</p>
                  <p className="text-[10px] text-slate-500">Hijau & Emas Khas</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoLembagaUrl: PRESET_LOGOS.KEMENAG, showLogoLembaga: true })}
                  className="p-2 border border-slate-200 hover:border-emerald-500 rounded-lg text-left bg-white hover:bg-emerald-50/50 transition-colors"
                >
                  <p className="font-bold text-slate-800">Emblem Kemenag</p>
                  <p className="text-[10px] text-slate-500">Kementerian Agama</p>
                </button>
              </div>
            </div>

            {/* Upload */}
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">
                Atau Unggah Logo Madrasah/Sekolah (PNG/JPG):
              </label>
              <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-colors text-xs text-slate-700 font-medium">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Pilih Berkas Logo dari Komputer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'lembaga')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Kop Typography Content Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Teks Identitas Kop Surat Resmi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Baris 1: Nama Instansi Induk
              </label>
              <input
                type="text"
                value={form.institutionName}
                onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                placeholder="KEMENTERIAN AGAMA REPUBLIK INDONESIA"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Baris 2: Instansi Kantor Daerah / Wilayah
              </label>
              <input
                type="text"
                value={form.subInstitutionName}
                onChange={(e) => setForm({ ...form, subInstitutionName: e.target.value })}
                placeholder="KANTOR KEMENTERIAN AGAMA KABUPATEN SLEMAN"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Baris 3: Yayasan / Badan Penyelenggara
              </label>
              <input
                type="text"
                value={form.foundationName}
                onChange={(e) => setForm({ ...form, foundationName: e.target.value })}
                placeholder="YAYASAN PENDIDIKAN ISLAM DIPONEGORO"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Baris 4: Nama Madrasah / Satuan Pendidikan (Huruf Besar)
              </label>
              <input
                type="text"
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                placeholder="MTs S Diponegoro"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-bold text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Baris 5: Alamat Lengkap & Kode Pos
              </label>
              <input
                type="text"
                value={form.schoolAddress}
                onChange={(e) => setForm({ ...form, schoolAddress: e.target.value })}
                placeholder="Jl. Diponegoro No. 45, Sleman, D.I. Yogyakarta 55281"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase">
                  Nomor Statistik Madrasah (NSM) - 12 Digit
                </label>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    (form.nsm?.length || 0) === 12
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {(form.nsm?.length || 0) === 12 ? '✓ 12 Digit Valid' : `${form.nsm?.length || 0}/12 Digit`}
                </span>
              </div>
              <input
                type="text"
                maxLength={12}
                value={form.nsm || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setForm({ ...form, nsm: val });
                }}
                placeholder="121234040015"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold tracking-widest text-slate-900 focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Nomor identitas resmi madrasah dari Kemenag untuk dicantumkan di Kop Surat.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                NPSN &amp; Akreditasi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    maxLength={8}
                    value={form.npsn}
                    onChange={(e) => setForm({ ...form, npsn: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                    placeholder="NPSN: 20400192"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">NPSN (8 digit)</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={form.akreditasi}
                    onChange={(e) => setForm({ ...form, akreditasi: e.target.value })}
                    placeholder="A (Unggul)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Status Akreditasi</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Baris 6: Kontak (Telepon, Email, Website)
              </label>
              <input
                type="text"
                value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                placeholder="Telepon: (0274) 868123 · Email: mtssdiponegoro@gmail.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Print Layout & Line Format */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Format Garis Kop & Ukuran Kertas Cetak
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Model Garis Pemisah Kop:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="headerLineStyle"
                    value="double"
                    checked={form.headerLineStyle === 'double'}
                    onChange={() => setForm({ ...form, headerLineStyle: 'double' })}
                    className="text-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Garis Ganda Resmi (Standar Dinas)</span>
                    <p className="text-[10px] text-slate-500">Garis tebal atas 3px dan garis tipis bawah 1px</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="headerLineStyle"
                    value="single"
                    checked={form.headerLineStyle === 'single'}
                    onChange={() => setForm({ ...form, headerLineStyle: 'single' })}
                    className="text-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Garis Tunggal (Single Line 2px)</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="headerLineStyle"
                    value="none"
                    checked={form.headerLineStyle === 'none'}
                    onChange={() => setForm({ ...form, headerLineStyle: 'none' })}
                    className="text-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Tanpa Garis</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Target Ukuran Kertas:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paperSize"
                    value="A4"
                    checked={form.paperSize === 'A4'}
                    onChange={() => setForm({ ...form, paperSize: 'A4' })}
                    className="text-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">A4 (210 × 297 mm)</span>
                    <p className="text-[10px] text-slate-500">Standar kertas dokumen internasional</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paperSize"
                    value="F4"
                    checked={form.paperSize === 'F4'}
                    onChange={() => setForm({ ...form, paperSize: 'F4' })}
                    className="text-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">F4 / Folio (215 × 330 mm)</span>
                    <p className="text-[10px] text-slate-500">Standar kertas map rapor madrasah & dinas Indonesia</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            Simpan Seluruh Pengaturan Kop Cetak
          </button>
        </div>
      </form>
    </div>
  );
};
