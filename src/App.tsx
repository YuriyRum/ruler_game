import React from 'react';
import { FileText, Globe, GraduationCap, QrCode } from 'lucide-react';
import { ConfettiBurst } from './components/ConfettiBurst';
import { PrintableSheet } from './components/PrintableSheet';
import { ProblemTrainer } from './components/ProblemTrainer';
import { QrShareModal } from './components/QrShareModal';
import { Language, TRANSLATIONS } from './i18n/translations';

type TabKey = 'practice' | 'sheet';

const STORAGE_KEY = 'lineika_progress_v1';
const LANG_STORAGE_KEY = 'lineika_lang_v1';
const POINTS_PER_CORRECT = 10;

interface SavedProgress {
  points: number;
  totalCorrect: number;
}

function loadProgress(): SavedProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { points: 0, totalCorrect: 0 };
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    return {
      points: typeof parsed.points === 'number' && parsed.points >= 0 ? parsed.points : 0,
      totalCorrect:
        typeof parsed.totalCorrect === 'number' && parsed.totalCorrect >= 0
          ? parsed.totalCorrect
          : 0,
    };
  } catch {
    return { points: 0, totalCorrect: 0 };
  }
}

function loadLanguage(): Language {
  try {
    const raw = window.localStorage.getItem(LANG_STORAGE_KEY);
    return raw === 'de' ? 'de' : 'ru';
  } catch {
    return 'ru';
  }
}

export default function App() {
  const [lang, setLang] = React.useState<Language>(() => loadLanguage());
  const [activeTab, setActiveTab] = React.useState<TabKey>('practice');
  const [trainerTrigger, setTrainerTrigger] = React.useState(0);
  const [progress, setProgress] = React.useState<SavedProgress>(() => loadProgress());
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);
  const [showQrModal, setShowQrModal] = React.useState(false);

  const t = TRANSLATIONS[lang];

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage errors in private browsing
    }
  }, [progress]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
    document.documentElement.lang = lang;
    document.title = TRANSLATIONS[lang].pageTitle;
  }, [lang]);

  const level = Math.floor(progress.totalCorrect / 10) + 1;

  const handleCorrectAnswer = React.useCallback(
    (bonusPoints: number = 0): boolean => {
      const nextCorrect = progress.totalCorrect + 1;
      const leveledUp = nextCorrect % 10 === 0;
      setProgress({
        points: progress.points + POINTS_PER_CORRECT + bonusPoints,
        totalCorrect: nextCorrect,
      });
      if (leveledUp) {
        setConfettiTrigger((prev) => prev + 1);
      }
      return leveledUp;
    },
    [progress]
  );

  const handleStartNewExample = () => {
    setActiveTab('practice');
    setTrainerTrigger((prev) => prev + 1);
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ru' ? 'de' : 'ru'));
  };

  const navItems: {
    key: TabKey;
    label: string;
    mobileLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      key: 'practice',
      label: t.nav.practice,
      mobileLabel: t.nav.mobilePractice,
      icon: GraduationCap,
    },
    { key: 'sheet', label: t.nav.sheet, mobileLabel: t.nav.mobileSheet, icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <ConfettiBurst triggerKey={confettiTrigger} />
      <QrShareModal isOpen={showQrModal} lang={lang} onClose={() => setShowQrModal(false)} />

      {/* Three-Zone Top Navigation Bar */}
      <header className="no-print bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className="min-h-[44px] flex items-center text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.brand}
          </button>

          {/* Zone 2: Clean Single-Line Text Links (Tablet & Desktop) */}
          <nav aria-label="Navigation" className="hidden md:flex items-center gap-7">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-sky-700 border-sky-600'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: QR + Language Switcher + Primary Action */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              aria-label={t.qr.buttonAria}
              title={t.qr.title}
              className="min-h-[40px] min-w-[40px] md:min-h-[42px] md:min-w-[42px] flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t.nav.switchLanguageLabel}
              className="min-h-[40px] md:min-h-[42px] inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
              <span className={lang === 'ru' ? 'text-slate-900' : 'text-slate-400'}>RU</span>
              <span className="text-slate-300">/</span>
              <span className={lang === 'de' ? 'text-slate-900' : 'text-slate-400'}>DE</span>
            </button>

            <button
              type="button"
              onClick={handleStartNewExample}
              className="min-h-[40px] md:min-h-[42px] px-3 sm:px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.newExample}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 pt-5 sm:pt-8 md:pt-10 pb-24 md:pb-10">
        {activeTab === 'practice' && (
          <ProblemTrainer
            lang={lang}
            externalTrigger={trainerTrigger}
            points={progress.points}
            totalCorrect={progress.totalCorrect}
            level={level}
            pointsPerCorrect={POINTS_PER_CORRECT}
            onCorrectAnswer={handleCorrectAnswer}
            onEnlargeQr={() => setShowQrModal(true)}
          />
        )}
        {activeTab === 'sheet' && <PrintableSheet lang={lang} />}
      </main>

      {/* Mobile Bottom Thumb-Zone Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-2 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors cursor-pointer ${
                  isActive ? 'text-sky-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                <span
                  className={`text-[11px] leading-none whitespace-nowrap ${
                    isActive ? 'font-bold' : 'font-medium'
                  }`}
                >
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
