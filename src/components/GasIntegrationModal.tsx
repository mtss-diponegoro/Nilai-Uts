import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GAS_SCRIPT_TEMPLATE,
  testGasConnection,
} from '../services/gasService';
import {
  X,
  Database,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCode,
  Zap,
} from 'lucide-react';

export const GasIntegrationModal: React.FC = () => {
  const {
    gasConfig,
    updateGasConfig,
    isGasModalOpen,
    setIsGasModalOpen,
    syncToGasNow,
    fetchFromGasNow,
  } = useApp();

  const [urlInput, setUrlInput] = useState(gasConfig.webAppUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'tutorial'>('config');

  if (!isGasModalOpen) return null;

  const handleSaveAndTest = async () => {
    updateGasConfig({ webAppUrl: urlInput });
    setTesting(true);
    setTestResult(null);

    const res = await testGasConnection(urlInput);
    setTesting(false);
    setTestResult({
      success: res.success,
      message: res.message,
      latency: res.latencyMs,
    });

    if (res.success) {
      updateGasConfig({
        syncStatus: 'success',
        syncMessage: 'Koneksi ke Google Apps Script Berhasil',
        webAppUrl: urlInput,
      });
    } else {
      updateGasConfig({
        syncStatus: 'error',
        syncMessage: res.message,
        webAppUrl: urlInput,
      });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await syncToGasNow();
    setIsSyncing(false);
  };

  const handleFetchNow = async () => {
    setIsFetching(true);
    await fetchFromGasNow();
    setIsFetching(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Integrasi Google Apps Script & Google Spreadsheet
              </h2>
              <p className="text-xs text-slate-500">
                Sinkronisasi data siswa, nilai UTS, dan catatan wali kelas secara real-time
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGasModalOpen(false)}
            aria-label="Tutup Modal"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Koneksi & Sinkronisasi
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Salin Kode Apps Script (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'tutorial'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Panduan Pemasangan (4 Langkah)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* URL Input Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  URL Web App Google Apps Script
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    onClick={handleSaveAndTest}
                    disabled={testing}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Menguji...
                      </>
                    ) : (
                      'Simpan & Uji'
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  URL didapat setelah menerapkan (deploy) Apps Script sebagai Web App dengan hak akses "Anyone" (Siapa saja).
                </p>
              </div>

              {/* Status & Latency Box */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.latency !== undefined && (
                      <p className="text-[11px] opacity-80 mt-0.5 font-mono">
                        Waktu respon: {testResult.latency} ms
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Real-time Auto-Sync Settings */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Sinkronisasi Otomatis Real-Time (Auto-Sync)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Data nilai siswa dan catatan wali kelas tersimpan otomatis di perangkat dan dapat langsung dikirim ke Spreadsheet.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gasConfig.isAutoSync}
                    onChange={(e) => updateGasConfig({ isAutoSync: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Manual Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing || !urlInput}
                  className="px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  {isSyncing ? 'Mengirim Data...' : 'Kirim Seluruh Data ke Spreadsheet'}
                </button>
                <button
                  onClick={handleFetchNow}
                  disabled={isFetching || !urlInput}
                  className="px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <DownloadCloud className="w-4 h-4 text-blue-600" />
                  {isFetching ? 'Menarik Data...' : 'Tarik Data dari Spreadsheet'}
                </button>
              </div>

              {/* Local Storage Indicator note */}
              <div className="text-[11px] text-slate-500 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
                <span className="font-bold text-amber-700">Catatan:</span>
                <span>
                  Aplikasi ini memiliki sistem penyimpanan internal (LocalStorage). Semua nilai yang diinput guru tetap aman dan tersimpan di browser Anda meskipun koneksi internet terputus atau sebelum Spreadsheet Google Apps Script dipasang.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Skrip Google Apps Script Siap Pakai (Code.gs)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Termasuk fungsi setup tabel otomatis, REST doGet & doPost, format warna header, dan proteksi CORS.
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin Seluruh Kode
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
                  {GAS_SCRIPT_TEMPLATE}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tutorial' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  <h4 className="font-bold text-slate-900">Buat Google Spreadsheet Baru</h4>
                </div>
                <p className="text-slate-600 pl-7">
                  Buka Google Drive Anda, buat Spreadsheet kosong baru dan beri nama, misalnya{' '}
                  <strong className="text-slate-800">"Database Nilai UTS 2024-2025"</strong>.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                    2
                  </span>
                  <h4 className="font-bold text-slate-900">Buka Menu Ekstensi &gt; Apps Script</h4>
                </div>
                <p className="text-slate-600 pl-7">
                  Pada Google Spreadsheet, klik menu <strong>Ekstensi</strong> di bilah atas, lalu pilih{' '}
                  <strong>Apps Script</strong>. Jendela editor kode Apps Script akan terbuka di tab baru.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                    3
                  </span>
                  <h4 className="font-bold text-slate-900">Tempel Kode & Jalankan setupDatabase</h4>
                </div>
                <p className="text-slate-600 pl-7">
                  Hapus isi file <code>Code.gs</code> bawaan, tempelkan skrip dari tab <strong>"Salin Kode"</strong> di atas. Klik ikon <strong>Simpan (Ctrl+S)</strong>. Pilih fungsi <code>setupDatabase</code> di dropdown lalu klik <strong>Jalankan (Run)</strong> untuk membuat lembar otomatis.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                    4
                  </span>
                  <h4 className="font-bold text-slate-900">Terapkan sebagai Web App (Akses: Anyone)</h4>
                </div>
                <p className="text-slate-600 pl-7">
                  Klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan Baru</strong>. Pilih jenis <strong>Aplikasi Web</strong>. Setel <em>Jalankan sebagai: Saya</em> dan <em>Yang memiliki akses: <strong>Siapa saja (Anyone)</strong></em>. Klik Terapkan, lalu salin URL Web App dan tempelkan pada tab Koneksi di aplikasi ini!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Terakhir Sinkron:{' '}
            <span className="font-mono font-medium text-slate-700">
              {gasConfig.lastSyncTimestamp || 'Belum pernah'}
            </span>
          </div>
          <button
            onClick={() => setIsGasModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
