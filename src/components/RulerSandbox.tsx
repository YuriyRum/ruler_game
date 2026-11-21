import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Language, TRANSLATIONS, formatUnit } from '../i18n/translations';

interface RulerSandboxProps {
  lang: Language;
  onPracticeClick: () => void;
}

export const RulerSandbox: React.FC<RulerSandboxProps> = ({ lang, onPracticeClick }) => {
  const [totalCm, setTotalCm] = React.useState<number>(125);

  const t = TRANSLATIONS[lang].sandbox;
  const uCm = formatUnit('cm', lang);
  const uDm = formatUnit('dm', lang);
  const uM = formatUnit('m', lang);

  const meters = Math.floor(totalCm / 100);
  const remainingCmAfterMeters = totalCm % 100;
  const totalDecimeters = Math.floor(totalCm / 10);
  const remainingCmAfterDecimeters = totalCm % 10;
  const decimetersInsideMeter = Math.floor(remainingCmAfterMeters / 10);

  const adjustCm = (delta: number) => {
    setTotalCm((prev) => Math.max(0, Math.min(200, prev + delta)));
  };

  const setRemainderCm = (rem: number) => {
    const baseDm = Math.floor(totalCm / 10) * 10;
    const next = Math.min(200, baseDm + rem);
    setTotalCm(next);
  };

  const renderMeterRow = (meterIndex: number) => {
    const rowStartCm = meterIndex * 100;
    const rowEndCm = rowStartCm + 100;
    const isFullMeter = totalCm >= rowEndCm;
    const rowFilledCm = Math.max(0, Math.min(100, totalCm - rowStartCm));

    return (
      <div key={meterIndex} className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            {meterIndex === 0 ? t.firstMeter : t.secondMeter}
          </span>
          <span className="font-mono tabular-nums">
            {isFullMeter ? (
              <span className="font-semibold text-sky-700">{t.fullMeterText}</span>
            ) : (
              <span>{t.filledOf100(rowFilledCm)}</span>
            )}
          </span>
        </div>

        <div
          className={`grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-1 p-1.5 rounded-xl border transition-colors ${
            isFullMeter
              ? 'border-sky-400 bg-sky-50/70'
              : 'border-slate-200 bg-slate-100/80'
          }`}
        >
          {Array.from({ length: 10 }, (_, dmIdx) => {
            const cellStart = rowStartCm + dmIdx * 10;
            const cellEnd = cellStart + 10;
            const filledInCell = Math.max(0, Math.min(10, totalCm - cellStart));
            const isFullDm = filledInCell === 10;
            const isPartialDm = filledInCell > 0 && filledInCell < 10;

            return (
              <button
                key={dmIdx}
                type="button"
                onClick={() => setTotalCm(cellEnd)}
                title={t.cellTooltip(cellEnd, meterIndex * 10 + dmIdx + 1)}
                className="group relative h-12 rounded-lg bg-white border border-slate-200 overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-sky-600 transition-transform active:scale-[0.98]"
              >
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-150 ${
                    isFullMeter
                      ? 'bg-sky-500'
                      : isFullDm
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${filledInCell * 10}%` }}
                />

                <div className="relative z-10 h-full flex flex-col justify-between p-1">
                  <div className="flex justify-between w-full opacity-40">
                    {Array.from({ length: 5 }, (_, tick) => (
                      <span key={tick} className="w-px h-1.5 bg-slate-800" />
                    ))}
                  </div>
                  <span
                    className={`text-[11px] font-mono tabular-nums font-semibold leading-none ${
                      isFullMeter
                        ? 'text-white'
                        : isFullDm
                          ? 'text-slate-900'
                          : isPartialDm
                            ? 'text-slate-800'
                            : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  >
                    {meterIndex * 10 + dmIdx + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Intro Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onPracticeClick}
          className="min-h-[44px] self-start md:self-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {t.practiceCta}
        </button>
      </div>

      {/* Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Interactive Visual Stage (7 cols) */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.rulerTitle}</h2>
              <p className="text-xs text-slate-500">{t.rulerHint}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
                <span>1 {uM}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                <span>1 {uDm}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                <span>{uCm}</span>
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {renderMeterRow(0)}
            {renderMeterRow(1)}
          </div>

          {/* Zoomed 1-decimeter (10 cm) interactive ruler */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">{t.zoomTitle}</span>
              <span className="font-mono tabular-nums text-emerald-700 font-semibold whitespace-nowrap">
                + {remainingCmAfterDecimeters} {uCm}
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-1">
              {Array.from({ length: 10 }, (_, idx) => {
                const cmNum = idx + 1;
                const active = cmNum <= remainingCmAfterDecimeters;
                const disabled = Math.floor(totalCm / 10) * 10 + cmNum > 200;

                return (
                  <button
                    key={cmNum}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setRemainderCm(cmNum === remainingCmAfterDecimeters ? cmNum - 1 : cmNum)
                    }
                    className={`min-h-[44px] rounded-lg border text-sm sm:text-xs font-mono tabular-nums font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] ${
                      active
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cmNum}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Zone: Control & Readout Deck (5 cols) */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">{t.readoutTitle}</h2>
              <button
                type="button"
                onClick={() => setTotalCm(0)}
                className="min-h-[36px] inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.reset}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/70">
              <div className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="text-xs sm:text-sm text-slate-600">{t.onlyCm}</span>
                <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-700 whitespace-nowrap shrink-0">
                  {totalCm} {uCm}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="text-xs sm:text-sm text-slate-600">{t.dmAndCm}</span>
                <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-700 whitespace-nowrap shrink-0">
                  {totalDecimeters} {uDm}{' '}
                  {remainingCmAfterDecimeters > 0 ? `${remainingCmAfterDecimeters} ${uCm}` : ''}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="text-xs sm:text-sm text-slate-600">{t.mAndCm}</span>
                <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-sky-700 whitespace-nowrap shrink-0">
                  {meters} {uM}{' '}
                  {remainingCmAfterMeters > 0 || meters === 0
                    ? `${remainingCmAfterMeters} ${uCm}`
                    : ''}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="text-xs sm:text-sm text-slate-600">{t.mDmCm}</span>
                <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-800 whitespace-nowrap shrink-0">
                  {meters} {uM} {decimetersInsideMeter} {uDm} {remainingCmAfterDecimeters} {uCm}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-sky-50/80 border border-sky-200 px-4 py-3 text-sm text-slate-700 leading-relaxed">
              {totalCm === 0 ? (
                <span>{t.emptyBreakdown}</span>
              ) : (
                <span>
                  {t.numberIs}{' '}
                  <strong className="font-mono tabular-nums">
                    {totalCm} {uCm}
                  </strong>{' '}
                  {t.isEqualTo}{' '}
                  {meters > 0 && (
                    <>
                      <strong className="text-sky-700">
                        {meters} {uM}
                      </strong>{' '}
                      ({meters * 100} {uCm}),{' '}
                    </>
                  )}
                  {decimetersInsideMeter > 0 && (
                    <>
                      <strong className="text-amber-700">
                        {decimetersInsideMeter} {uDm}
                      </strong>{' '}
                      ({decimetersInsideMeter * 10} {uCm})
                      {remainingCmAfterDecimeters > 0 ? ` ${t.andMore} ` : '.'}
                    </>
                  )}
                  {remainingCmAfterDecimeters > 0 && (
                    <>
                      <strong className="text-emerald-700">
                        {remainingCmAfterDecimeters} {uCm}
                      </strong>
                      .
                    </>
                  )}
                  {decimetersInsideMeter === 0 && remainingCmAfterDecimeters === 0 && meters > 0 && (
                    <>{t.exactNoRem}</>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="ruler-slider" className="font-semibold text-slate-800">
                {t.sliderLabel}
              </label>
              <span className="font-mono tabular-nums font-semibold text-slate-700">
                {totalCm} {uCm}
              </span>
            </div>
            <input
              id="ruler-slider"
              type="range"
              min={0}
              max={200}
              step={1}
              value={totalCm}
              onChange={(e) => setTotalCm(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400">
              {t.sliderMarks.map((mark) => (
                <span key={mark}>{mark}</span>
              ))}
            </div>
          </div>

          {/* Tactile +/- Buttons */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600">{t.stepPrompt}</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => adjustCm(1)}
                disabled={totalCm >= 200}
                className="min-h-[48px] px-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 active:scale-[0.98] text-emerald-800 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                +1 {uCm}
              </button>
              <button
                type="button"
                onClick={() => adjustCm(10)}
                disabled={totalCm >= 200}
                className="min-h-[48px] px-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 active:scale-[0.98] text-amber-800 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                +1 {uDm}{' '}
                <span className="hidden sm:inline">
                  (10 {uCm})
                </span>
              </button>
              <button
                type="button"
                onClick={() => adjustCm(100)}
                disabled={totalCm >= 200}
                className="min-h-[48px] px-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 active:scale-[0.98] text-sky-800 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                +1 {uM}{' '}
                <span className="hidden sm:inline">
                  (100 {uCm})
                </span>
              </button>

              <button
                type="button"
                onClick={() => adjustCm(-1)}
                disabled={totalCm <= 0}
                className="min-h-[48px] px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                −1 {uCm}
              </button>
              <button
                type="button"
                onClick={() => adjustCm(-10)}
                disabled={totalCm <= 0}
                className="min-h-[48px] px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                −1 {uDm}
              </button>
              <button
                type="button"
                onClick={() => adjustCm(-100)}
                disabled={totalCm <= 0}
                className="min-h-[48px] px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                −1 {uM}
              </button>
            </div>
          </div>

          {/* Real-World Object Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-600">{t.presetsPrompt}</div>
            <div className="flex flex-wrap gap-2">
              {t.presets.map((preset) => {
                const isActive = totalCm === preset.cm;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setTotalCm(preset.cm)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label} · {preset.cm} {uCm}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Three Simple Rules Strip */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{t.rulesTitle}</h2>
          <p className="text-xs text-slate-500">{t.rulesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 pt-5 gap-6 md:gap-0">
          {t.rules.map((rule, idx) => (
            <div
              key={rule.formula}
              className={`space-y-2 ${
                idx === 0 ? 'md:pr-6' : idx === 1 ? 'pt-5 md:pt-0 md:px-6' : 'pt-5 md:pt-0 md:pl-6'
              }`}
            >
              <div className={`font-mono tabular-nums text-xl font-bold ${rule.colorClass}`}>
                {rule.formula}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{rule.descLead}</p>
              <div className="text-xs font-mono text-slate-500 pt-1">{rule.example}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
