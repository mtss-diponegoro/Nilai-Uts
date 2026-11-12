import React from 'react';
import { SchoolSettings } from '../../types';

interface OfficialKopSuratProps {
  settings: SchoolSettings;
  className?: string;
}

export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({ settings, className = '' }) => {
  const {
    institutionName,
    subInstitutionName,
    foundationName,
    schoolName,
    npsn,
    nsm,
    akreditasi,
    schoolAddress,
    contactInfo,
    logoInstansiUrl,
    logoLembagaUrl,
    showLogoInstansi,
    showLogoLembaga,
    logoInstansiSize = 68,
    logoLembagaSize = 68,
    headerLineStyle = 'double',
  } = settings;

  return (
    <div className={`w-full text-slate-900 select-none ${className}`}>
      <div className="flex items-center justify-between gap-3 text-center pb-2">
        {/* Logo Instansi (Left - e.g. Kementerian Agama / Kemendikbud) */}
        {showLogoInstansi ? (
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: `${logoInstansiSize}px`, height: `${logoInstansiSize}px` }}
          >
            {logoInstansiUrl ? (
              <img
                src={logoInstansiUrl}
                alt="Logo Instansi"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
                Logo Instansi
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: `${logoInstansiSize}px` }} className="shrink-0" />
        )}

        {/* Center Typography (Kop Text) */}
        <div className="flex-1 px-2">
          {institutionName && (
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800 leading-tight">
              {institutionName}
            </h3>
          )}

          {subInstitutionName && (
            <h4 className="text-[11px] font-semibold tracking-wide uppercase text-slate-700 leading-tight">
              {subInstitutionName}
            </h4>
          )}

          {foundationName && (
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-900 leading-tight mt-0.5">
              {foundationName}
            </h4>
          )}

          <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-950 font-serif leading-snug my-0.5">
            {schoolName}
          </h1>

          <p className="text-[11px] text-slate-600 leading-tight font-medium">
            {schoolAddress}
          </p>

          <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
            {nsm && (
              <span className="font-semibold text-slate-800">
                NSM: <span className="font-mono font-bold tracking-wider">{nsm}</span>
              </span>
            )}
            {nsm && npsn && <span className="mx-1 text-slate-400">·</span>}
            {npsn && (
              <span>
                NPSN: <span className="font-mono">{npsn}</span>
              </span>
            )}
            {akreditasi && (
              <>
                <span className="mx-1 text-slate-400">·</span>
                <span>Akreditasi: {akreditasi}</span>
              </>
            )}
            {contactInfo && (
              <>
                <span className="mx-1 text-slate-400">·</span>
                <span>{contactInfo}</span>
              </>
            )}
          </p>
        </div>

        {/* Logo Lembaga (Right - e.g. Madrasah / Yayasan Diponegoro) */}
        {showLogoLembaga ? (
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: `${logoLembagaSize}px`, height: `${logoLembagaSize}px` }}
          >
            {logoLembagaUrl ? (
              <img
                src={logoLembagaUrl}
                alt="Logo Lembaga"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
                Logo Lembaga
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: `${logoLembagaSize}px` }} className="shrink-0" />
        )}
      </div>

      {/* Official Letterhead Line (Garis Kop Surat) */}
      {headerLineStyle === 'double' && (
        <div className="w-full">
          <div className="border-b-[3px] border-black w-full" />
          <div className="border-b-[1px] border-black w-full mt-[1.5px]" />
        </div>
      )}
      {headerLineStyle === 'single' && (
        <div className="border-b-2 border-black w-full" />
      )}
    </div>
  );
};
