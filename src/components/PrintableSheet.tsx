import React from 'react';
import { Eye, EyeOff, Printer, RefreshCw } from 'lucide-react';
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

interface PrintableSheetProps {
  lang: Language;
}

const PAIR_KEYS: UnitPairMode[] = ['cm-dm', 'dm-m', 'cm-m', 'multi', 'all'];
const COMPLEXITY_KEYS: ComplexityMode[] = ['simple', 'compound', 'mixed'];
const SHEET_COUNTS = [10, 16, 20];

export const PrintableSheet: React.FC<PrintableSheetProps> = ({ lang }) => {
  const [config, setConfig] = React.useState<GeneratorConfig>({
    pairMode: 'all',
    complexity: 'mixed',
    count: 16,
  });

  const [problems, setProblems] = React.useState<Problem[]>(() =>
    generateProblems({ pairMode: 'all', complexity: 'mixed', count: 16 })
  );
  const [showAnswers, setShowAnswers] = React.useState(false);

  const tTrainer = TRANSLATIONS[lang].trainer;
  const tSheet = TRANSLATIONS[lang].sheet;

  const regenerate = (next: GeneratorConfig) => {
    setConfig(next);
    setProblems(generateProblems(next));
  };

  return (
    <div className="space-y-6">
      {/* Controls (hidden when printing) */}
      <section className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-6 gap-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {tTrainer.unitsLabel}
              </span>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
                {PAIR_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => regenerate({ ...config, pairMode: key })}
                    className={`min-h-[38px] md:min-h-[32px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      config.pairMode === key
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tTrainer.pairLabels[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {tTrainer.typeLabel}
              </span>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
                {COMPLEXITY_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => regenerate({ ...config, complexity: key })}
                    className={`min-h-[38px] md:min-h-[32px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      config.complexity === key
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tTrainer.complexityLabels[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {tSheet.countLabel}
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
                {SHEET_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => regenerate({ ...config, count: cnt })}
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

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAnswers((prev) => !prev)}
              className="min-h-[44px] md:min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              {showAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showAnswers ? tSheet.hideAnswers : tSheet.showAnswers}</span>
            </button>

            <button
              type="button"
              onClick={() => regenerate(config)}
              className="min-h-[44px] md:min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{tSheet.newProblems}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[44px] md:min-h-[38px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{tSheet.print}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Worksheet Page */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 print:border-none print:p-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{tSheet.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{tSheet.rulesLine}</p>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            {tSheet.nameLine(problems.length)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          {problems.map((problem, index) => (
            <div
              key={problem.id}
              className="flex items-baseline justify-between gap-3 py-2 border-b border-slate-100 font-mono tabular-nums text-base sm:text-lg"
            >
              <div className="flex items-baseline gap-2.5 text-slate-900">
                <span className="text-xs text-slate-400 w-6 text-right shrink-0">
                  {index + 1}.
                </span>
                <span className="font-semibold">{formatPrompt(problem, lang)} =</span>
              </div>

              <div className="flex items-baseline gap-2 shrink-0">
                {showAnswers ? (
                  <span className="font-bold text-sky-700">
                    {formatExpectedAnswer(problem, lang)}
                  </span>
                ) : (
                  problem.slots.map((slot) => (
                    <span
                      key={slot.unit}
                      className="inline-flex items-baseline gap-1 text-slate-700"
                    >
                      <span className="inline-block w-14 border-b-2 border-slate-300 text-center text-transparent select-none">
                        000
                      </span>
                      <span className="font-semibold">{formatUnit(slot.unit, lang)}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
