import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Delete,
  HelpCircle,
  Keyboard,
  RefreshCw,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import { Language, TRANSLATIONS, formatUnit } from '../i18n/translations';
import {
  ComplexityMode,
  GeneratorConfig,
  Problem,
  UnitPairMode,
  formatExpectedAnswer,
  formatPrompt,
  generateProblems,
} from '../types/units';

interface AttemptRecord {
  problem: Problem;
  userValues: string[];
  isCorrect: boolean;
}

interface ProblemTrainerProps {
  lang: Language;
  externalTrigger?: number;
  points: number;
  totalCorrect: number;
  level: number;
  pointsPerCorrect: number;
  onCorrectAnswer: () => boolean;
}

const PAIR_KEYS: UnitPairMode[] = ['cm-dm', 'dm-m', 'cm-m', 'multi', 'all'];
const COMPLEXITY_KEYS: ComplexityMode[] = ['simple', 'compound', 'mixed'];
const COUNT_OPTIONS = [5, 10, 15];

export const ProblemTrainer: React.FC<ProblemTrainerProps> = ({
  lang,
  externalTrigger,
  points,
  totalCorrect,
  level,
  pointsPerCorrect,
  onCorrectAnswer,
}) => {
  const [config, setConfig] = React.useState<GeneratorConfig>({
    pairMode: 'all',
    complexity: 'mixed',
    count: 10,
  });

  const [problems, setProblems] = React.useState<Problem[]>(() =>
    generateProblems({ pairMode: 'all', complexity: 'mixed', count: 10 })
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [inputs, setInputs] = React.useState<string[]>(['', '']);
  const [activeSlot, setActiveSlot] = React.useState(0);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [showKeypad, setShowKeypad] = React.useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(pointer: coarse)').matches;
    }
    return false;
  });
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  const [checkedStatus, setCheckedStatus] = React.useState<'idle' | 'correct' | 'wrong'>('idle');
  const [justLeveledUp, setJustLeveledUp] = React.useState(false);
  const [history, setHistory] = React.useState<AttemptRecord[]>([]);
  const [streak, setStreak] = React.useState(0);

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const t = TRANSLATIONS[lang].trainer;

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(coarse);
    }
  }, []);

  const startNewSet = React.useCallback((nextConfig: GeneratorConfig, customList?: Problem[]) => {
    const list = customList ?? generateProblems(nextConfig);
    setProblems(list);
    setCurrentIndex(0);
    setInputs(list[0]?.slots.map(() => '') ?? ['']);
    setActiveSlot(0);
    setShowHint(false);
    setCheckedStatus('idle');
    setJustLeveledUp(false);
    setHistory([]);
    setStreak(0);
  }, []);

  const prevTrigger = React.useRef(externalTrigger);
  React.useEffect(() => {
    if (externalTrigger !== undefined && externalTrigger !== prevTrigger.current) {
      prevTrigger.current = externalTrigger;
      startNewSet(config);
    }
  }, [externalTrigger, config, startNewSet]);

  const isFinished = currentIndex >= problems.length;
  const currentProblem = problems[currentIndex];

  React.useEffect(() => {
    if (!isFinished && checkedStatus === 'idle' && !isTouchDevice) {
      const timer = window.setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [currentIndex, isFinished, checkedStatus, problems, isTouchDevice]);

  const updateConfig = (patch: Partial<GeneratorConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    startNewSet(next);
  };

  const handleInputChange = (slotIdx: number, raw: string) => {
    if (checkedStatus !== 'idle') return;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 5);
    setInputs((prev) => {
      const copy = [...prev];
      copy[slotIdx] = digitsOnly;
      return copy;
    });
  };

  const handleKeypadDigit = (digit: string) => {
    if (checkedStatus !== 'idle' || !currentProblem) return;
    setInputs((prev) => {
      const copy = [...prev];
      const current = copy[activeSlot] ?? '';
      if (current.length < 5) {
        copy[activeSlot] = current + digit;
      }
      return copy;
    });
  };

  const handleKeypadBackspace = () => {
    if (checkedStatus !== 'idle') return;
    setInputs((prev) => {
      const copy = [...prev];
      const current = copy[activeSlot] ?? '';
      copy[activeSlot] = current.slice(0, -1);
      return copy;
    });
  };

  const canSubmit =
    currentProblem !== undefined &&
    currentProblem.slots.every((_, idx) => (inputs[idx] ?? '').trim().length > 0);

  const handleCheck = () => {
    if (!currentProblem || checkedStatus !== 'idle' || !canSubmit) return;

    const isCorrect = currentProblem.slots.every((slot, idx) => {
      const parsed = Number(inputs[idx]);
      return Number.isFinite(parsed) && parsed === slot.expected;
    });

    setCheckedStatus(isCorrect ? 'correct' : 'wrong');
    setStreak((prev) => (isCorrect ? prev + 1 : 0));
    if (isCorrect) {
      const leveledUp = onCorrectAnswer();
      setJustLeveledUp(leveledUp);
    } else {
      setJustLeveledUp(false);
    }
    setHistory((prev) => [
      ...prev,
      {
        problem: currentProblem,
        userValues: currentProblem.slots.map((_, i) => inputs[i] ?? ''),
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    const nextProb = problems[nextIndex];
    setInputs(nextProb ? nextProb.slots.map(() => '') : ['']);
    setActiveSlot(0);
    setShowHint(false);
    setCheckedStatus('idle');
    setJustLeveledUp(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, slotIdx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (checkedStatus === 'idle') {
        if (currentProblem && slotIdx < currentProblem.slots.length - 1 && !inputs[slotIdx + 1]) {
          setActiveSlot(slotIdx + 1);
          inputRefs.current[slotIdx + 1]?.focus();
        } else {
          handleCheck();
        }
      } else {
        handleNext();
      }
    }
  };

  const handleRetryMistakes = () => {
    const mistakes = history.filter((item) => !item.isCorrect).map((item) => item.problem);
    if (mistakes.length === 0) return;
    startNewSet(config, mistakes);
  };

  const correctCount = history.filter((item) => item.isCorrect).length;
  const filledSteps = justLeveledUp ? 10 : totalCorrect % 10;
  const displayLevel = justLeveledUp ? level - 1 : level;

  return (
    <div className="space-y-6">
      {/* Player Level & Points Strip */}
      <section className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl px-5 py-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm tabular-nums">
          <div className="flex items-center gap-2.5 text-slate-700">
            <span className="font-bold text-slate-900">
              {t.level} {level}
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>
              {t.points} <strong className="font-mono text-sky-700">{points}</strong>
            </span>
          </div>
          <div className="text-xs font-medium text-slate-500">
            {justLeveledUp ? (
              <span className="text-emerald-700 font-semibold">{t.levelOpened(level)}</span>
            ) : (
              <span>
                {t.untilLevel(displayLevel + 1)}{' '}
                <strong className="font-mono text-slate-800">{t.of10Correct(filledSteps)}</strong>{' '}
                {t.correctSuffix}
              </span>
            )}
          </div>
        </div>

        <div
          className="grid grid-cols-10 gap-1.5"
          role="progressbar"
          aria-valuenow={filledSteps}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-label={t.progressAria}
        >
          {Array.from({ length: 10 }, (_, idx) => {
            const active = idx < filledSteps;
            return (
              <div
                key={idx}
                className={`h-2 rounded-sm transition-colors duration-200 ${
                  active ? 'bg-emerald-500' : 'bg-slate-100'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* Generator Controls Bar */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex md:hidden items-center justify-between gap-3">
          <div className="text-xs text-slate-600 truncate">
            <span className="font-semibold text-slate-900">{t.pairLabels[config.pairMode]}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span>{t.complexityLabels[config.complexity]}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-mono tabular-nums">{t.countShort(config.count)}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileFilters((v) => !v)}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showMobileFilters ? t.hide : t.configure}</span>
          </button>
        </div>

        <div
          className={`${
            showMobileFilters ? 'flex' : 'hidden'
          } md:flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
        >
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-6 gap-y-3">
            {/* Unit pair selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {t.unitsLabel}
              </span>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
                {PAIR_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateConfig({ pairMode: key })}
                    className={`min-h-[38px] md:min-h-[32px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      config.pairMode === key
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.pairLabels[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {t.typeLabel}
              </span>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
                {COMPLEXITY_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateConfig({ complexity: key })}
                    className={`min-h-[38px] md:min-h-[32px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      config.complexity === key
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.complexityLabels[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Count selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {t.countLabel}
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
                {COUNT_OPTIONS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => updateConfig({ count: cnt })}
                    className={`min-h-[38px] md:min-h-[32px] px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      config.count === cnt
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => startNewSet(config)}
            className="min-h-[44px] md:min-h-[38px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.regenerate}</span>
          </button>
        </div>
      </section>

      {/* Main Solving Stage or Summary */}
      {!isFinished && currentProblem ? (
        <section className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-2 font-medium tabular-nums">
              <span className="text-slate-900 font-semibold">
                {t.exampleOf(currentIndex + 1, problems.length)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{t.correctCountLabel(correctCount)}</span>
              {streak >= 2 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">{t.streakLabel(streak)}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKeypad((v) => !v)}
                className={`min-h-[38px] inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  showKeypad
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>{t.digitsBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className={`min-h-[38px] inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  showHint
                    ? 'bg-amber-100 text-amber-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t.hintBtn}</span>
              </button>
            </div>
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 transition-all duration-200"
              style={{
                width: `${((currentIndex + (checkedStatus !== 'idle' ? 1 : 0)) / problems.length) * 100}%`,
              }}
            />
          </div>

          {/* Equation Area */}
          <div className="py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-slate-900 tracking-tight text-center">
              {formatPrompt(currentProblem, lang)}
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-slate-400" aria-hidden="true">
              =
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {currentProblem.slots.map((slot, idx) => {
                const unitLabel = formatUnit(slot.unit, lang);
                const isActive = activeSlot === idx && checkedStatus === 'idle';
                const borderStyle =
                  checkedStatus === 'correct'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : checkedStatus === 'wrong'
                      ? 'border-rose-400 bg-rose-50 text-rose-900'
                      : isActive
                        ? 'border-sky-600 bg-white ring-3 ring-sky-100'
                        : 'border-slate-300 bg-slate-50 focus:bg-white';

                return (
                  <div
                    key={`${currentProblem.id}-${slot.unit}`}
                    className="flex items-center gap-1.5 sm:gap-2"
                  >
                    <input
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode={isTouchDevice && showKeypad ? 'none' : 'numeric'}
                      pattern="[0-9]*"
                      aria-label={t.answerAria(unitLabel)}
                      value={inputs[idx] ?? ''}
                      readOnly={checkedStatus !== 'idle'}
                      onFocus={() => setActiveSlot(idx)}
                      onClick={() => setActiveSlot(idx)}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      placeholder="?"
                      className={`w-20 sm:w-28 h-14 text-center text-2xl sm:text-3xl font-bold font-mono tabular-nums rounded-xl border-2 outline-none transition-all ${borderStyle}`}
                    />
                    <span className="text-lg sm:text-2xl font-bold font-mono text-slate-700">
                      {unitLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {showHint && (
            <div className="rounded-xl bg-amber-50/80 border border-amber-200 px-4 py-3.5 text-sm text-slate-800 space-y-1">
              <div className="font-semibold text-amber-900">
                {t.hintTitle(currentProblem.ruleBadge[lang])}
              </div>
              <p className="text-slate-700 leading-relaxed">{currentProblem.hint[lang]}</p>
            </div>
          )}

          {showKeypad && checkedStatus === 'idle' && (
            <div className="max-w-xs mx-auto pt-1">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadDigit(digit)}
                    className="h-13 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 active:scale-[0.97] text-xl font-mono font-bold text-slate-900 transition-all cursor-pointer select-none"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setInputs((prev) => {
                      const copy = [...prev];
                      copy[activeSlot] = '';
                      return copy;
                    })
                  }
                  className="h-13 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.97] text-xs font-semibold text-slate-600 cursor-pointer select-none"
                >
                  {t.clearBtn}
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadDigit('0')}
                  className="h-13 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 active:scale-[0.97] text-xl font-mono font-bold text-slate-900 transition-all cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  aria-label={t.deleteDigitAria}
                  className="h-13 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.97] flex items-center justify-center text-slate-700 cursor-pointer select-none"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {checkedStatus !== 'idle' && (
            <div
              className={`rounded-xl border px-4 py-4 space-y-2 ${
                checkedStatus === 'correct'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-base">
                <div className="flex items-center gap-2">
                  {checkedStatus === 'correct' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{t.correctFeedback}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>
                        {t.wrongFeedback}{' '}
                        <span className="font-mono tabular-nums underline decoration-rose-300 underline-offset-4">
                          {formatExpectedAnswer(currentProblem, lang)}
                        </span>
                      </span>
                    </>
                  )}
                </div>

                {checkedStatus === 'correct' && (
                  <span className="font-mono tabular-nums text-sm font-bold text-emerald-700">
                    {t.pointsEarned(pointsPerCorrect)}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700 font-mono pl-7">
                {currentProblem.explanation[lang]}
              </p>

              {checkedStatus === 'correct' && justLeveledUp && (
                <div className="mt-2 pt-2.5 border-t border-emerald-200 flex items-center gap-2.5 text-sm font-bold text-amber-900 pl-7">
                  <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>{t.levelUpText(level)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            {checkedStatus === 'idle' ? (
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleCheck}
                className="min-h-[48px] w-full sm:w-auto px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {t.checkBtn}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>{currentIndex + 1 < problems.length ? t.nextBtn : t.resultsBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">{t.summaryTitle}</h2>
              <p className="text-sm text-slate-600 tabular-nums">
                {t.summaryMeta(correctCount, problems.length, level, points)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {history.some((item) => !item.isCorrect) && (
                <button
                  type="button"
                  onClick={handleRetryMistakes}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t.retryMistakes}
                </button>
              )}
              <button
                type="button"
                onClick={() => startNewSet(config)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {t.newSeries}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {history.map((item, idx) => {
              const userStr = item.problem.slots
                .map((slot, sIdx) => `${item.userValues[sIdx] || '—'} ${formatUnit(slot.unit, lang)}`)
                .join(' ');

              return (
                <div
                  key={item.problem.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono tabular-nums text-slate-400 w-5">
                      {idx + 1}.
                    </span>
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-mono tabular-nums text-sm sm:text-base font-semibold text-slate-900">
                      {formatPrompt(item.problem, lang)} = {formatExpectedAnswer(item.problem, lang)}
                    </span>
                  </div>

                  <div className="pl-8 sm:pl-0 text-xs sm:text-sm">
                    {item.isCorrect ? (
                      <span className="text-emerald-700 font-medium">{t.correctWord}</span>
                    ) : (
                      <span className="text-rose-700">
                        {t.yourAnswer} <span className="font-mono line-through">{userStr}</span> ·{' '}
                        <span className="text-slate-600 font-mono">
                          {item.problem.explanation[lang]}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
