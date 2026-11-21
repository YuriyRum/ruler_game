import React from 'react';
import { Check, Copy, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Language, TRANSLATIONS } from '../i18n/translations';

export const APP_PUBLIC_URL = 'https://rulergame.netlify.app/';

interface QrShareModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
}

export const QrShareModal: React.FC<QrShareModalProps> = ({ isOpen, lang, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const t = TRANSLATIONS[lang].qr;

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(APP_PUBLIC_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 id="qr-modal-title" className="text-lg font-bold text-slate-900">
              {t.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-4 px-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <QRCodeSVG
              value={APP_PUBLIC_URL}
              size={200}
              bgColor="#FFFFFF"
              fgColor="#0F172A"
              level="M"
              includeMargin={false}
            />
          </div>
          <a
            href={APP_PUBLIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 font-mono text-xs sm:text-sm font-semibold text-sky-700 hover:underline break-all text-center"
          >
            {APP_PUBLIC_URL}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.copied : t.copyLink}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
