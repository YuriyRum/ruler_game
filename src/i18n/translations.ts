export type Language = 'ru' | 'de';

export type UnitCode = 'cm' | 'dm' | 'm';

export interface LocalizedText {
  ru: string;
  de: string;
}

export function formatUnit(unit: UnitCode, lang: Language): string {
  if (lang === 'de') return unit;
  switch (unit) {
    case 'cm':
      return 'см';
    case 'dm':
      return 'дм';
    case 'm':
      return 'м';
  }
}

export function formatUnitParts(
  parts: { value: number; unit: UnitCode }[],
  lang: Language
): string {
  return parts.map((p) => `${p.value} ${formatUnit(p.unit, lang)}`).join(' ');
}

export const TRANSLATIONS = {
  ru: {
    pageTitle: 'Линейка — сантиметры, дециметры и метры',
    brand: 'Линейка',
    nav: {
      learn: 'Понять наглядно',
      practice: 'Тренажёр примеров',
      sheet: 'Карточка для печати',
      mobileLearn: 'Линейка',
      mobilePractice: 'Тренажёр',
      mobileSheet: 'Карточка',
      newExample: 'Новый пример',
      switchLanguageLabel: 'Сменить язык на немецкий',
    },
    sandbox: {
      title: 'Как устроены сантиметры, дециметры и метры',
      subtitle:
        'Двигай ползунок или нажимай кнопки. Смотри, как 10 сантиметров складываются в 1 дециметр, а 10 дециметров — в 1 целый метр.',
      practiceCta: 'Потренироваться на примерах',
      rulerTitle: 'Большая линейка',
      rulerHint: 'Каждая клетка — это 1 дециметр (10 см). Нажми на любую клетку!',
      firstMeter: 'Первый метр (0 — 100 см)',
      secondMeter: 'Второй метр (100 — 200 см)',
      fullMeterText: '1 полный метр = 10 дм = 100 см',
      filledOf100: (cm: number) => `заполнено ${cm} см из 100 см`,
      cellTooltip: (cm: number, dm: number) => `Установить ${cm} см (${dm} дм)`,
      zoomTitle: 'Крупный план: сантиметры внутри текущего дециметра',
      readoutTitle: 'Эта же длина в разных единицах',
      reset: 'Сброс',
      onlyCm: 'Только в сантиметрах',
      dmAndCm: 'В дециметрах и сантиметрах',
      mAndCm: 'В метрах и сантиметрах',
      mDmCm: 'В м, дм и см',
      emptyBreakdown:
        'Выбери длину на линейке или нажми на любую кнопку ниже, чтобы увидеть перевод.',
      numberIs: 'Число',
      isEqualTo: '— это',
      andMore: 'и ещё',
      exactNoRem: 'ровно без остатка.',
      sliderLabel: 'Ползунок длины',
      sliderMarks: ['0 см', '50 см (5 дм)', '100 см (1 м)', '150 см', '200 см (2 м)'],
      stepPrompt: 'Прибавить или убавить шаг:',
      presetsPrompt: 'Примеры из жизни:',
      presets: [
        { label: 'Ластик', cm: 4 },
        { label: 'Тетрадь', cm: 20 },
        { label: 'Линейка', cm: 30 },
        { label: 'Парта', cm: 120 },
        { label: 'Рост', cm: 145 },
      ],
      rulesTitle: 'Три главных правила перевода',
      rulesSubtitle:
        'Единица меньше → число больше (умножаем) · Единица крупнее → число меньше (делим)',
      rules: [
        {
          formula: '1 дм = 10 см',
          descLead: 'Из дм в см — допиши один ноль (умножь на 10). Из см в дм — убери один ноль (или отдели десятки).',
          example: '4 дм = 40 см · 52 см = 5 дм 2 см',
          colorClass: 'text-amber-700',
        },
        {
          formula: '1 м = 10 дм',
          descLead: 'Из м в дм — допиши один ноль (умножь на 10). Из дм в м — убери один ноль (или отдели десятки).',
          example: '3 м = 30 дм · 27 дм = 2 м 7 дм',
          colorClass: 'text-sky-700',
        },
        {
          formula: '1 м = 100 см',
          descLead: 'Из м в см — допиши два нуля (умножь на 100). Из см в м — убери два нуля (или отдели сотни).',
          example: '2 м = 200 см · 305 см = 3 м 5 см',
          colorClass: 'text-emerald-700',
        },
      ],
    },
    trainer: {
      level: 'Уровень',
      points: 'Баллы:',
      levelOpened: (lvl: number) => `10 из 10 · Уровень ${lvl} открыт!`,
      untilLevel: (lvl: number) => `До уровня ${lvl}:`,
      of10Correct: (filled: number) => `${filled} из 10`,
      correctSuffix: 'верных',
      progressAria: 'Прогресс до нового уровня',
      unitsLabel: 'Единицы:',
      typeLabel: 'Тип:',
      countLabel: 'Примеров:',
      countShort: (c: number) => `${c} шт.`,
      configure: 'Настроить',
      hide: 'Скрыть',
      regenerate: 'Сгенерировать заново',
      pairLabels: {
        'cm-dm': 'см ↔ дм',
        'dm-m': 'дм ↔ м',
        'cm-m': 'см ↔ м',
        multi: 'Разные единицы',
        all: 'Всё вместе',
      },
      complexityLabels: {
        simple: 'Простые',
        compound: 'Составные',
        mixed: 'Смешанные',
      },
      exampleOf: (cur: number, total: number) => `Пример ${cur} из ${total}`,
      correctCountLabel: (c: number) => `Верно: ${c}`,
      streakLabel: (s: number) => `Подряд: ${s}`,
      digitsBtn: 'Цифры',
      hintBtn: 'Подсказка',
      answerAria: (unit: string) => `Ответ в ${unit}`,
      clearBtn: 'Очистить',
      deleteDigitAria: 'Удалить цифру',
      hintTitle: (rule: string) => `Подсказка · ${rule}`,
      correctFeedback: 'Верно! Отличная работа.',
      wrongFeedback: 'Правильный ответ:',
      pointsEarned: (pts: number) => `+${pts} баллов`,
      levelUpText: (lvl: number) =>
        `Новый уровень! 10 правильных ответов — теперь у тебя Уровень ${lvl}!`,
      checkBtn: 'Проверить ответ',
      nextBtn: 'Следующий пример',
      resultsBtn: 'Посмотреть результат',
      summaryTitle: 'Серия завершена',
      summaryMeta: (c: number, total: number, lvl: number, pts: number) =>
        `Решено верно: ${c} из ${total} · Уровень ${lvl} · Всего баллов: ${pts}`,
      retryMistakes: 'Решить ошибки заново',
      newSeries: 'Новая серия примеров',
      correctWord: 'Верно',
      yourAnswer: 'Твой ответ:',
    },
    sheet: {
      countLabel: 'Количество:',
      showAnswers: 'Показать ответы',
      hideAnswers: 'Скрыть ответы',
      newProblems: 'Новые примеры',
      print: 'Распечатать',
      title: 'Карточка с примерами: перевод единиц длины',
      rulesLine: '1 дм = 10 см · 1 м = 10 дм · 1 м = 100 см',
      nameLine: (total: number) => `Имя: __________________ · Верно: ___ / ${total}`,
    },
  },
  de: {
    pageTitle: 'Lineal — Zentimeter, Dezimeter und Meter',
    brand: 'Lineal',
    nav: {
      learn: 'Anschaulich lernen',
      practice: 'Aufgaben-Trainer',
      sheet: 'Arbeitsblatt',
      mobileLearn: 'Lineal',
      mobilePractice: 'Trainer',
      mobileSheet: 'Blatt',
      newExample: 'Neue Aufgabe',
      switchLanguageLabel: 'Sprache auf Russisch wechseln',
    },
    sandbox: {
      title: 'Wie Zentimeter, Dezimeter und Meter zusammenhängen',
      subtitle:
        'Bewege den Regler oder tippe auf die Tasten. Sieh zu, wie 10 Zentimeter 1 Dezimeter ergeben und 10 Dezimeter 1 ganzen Meter.',
      practiceCta: 'Aufgaben üben',
      rulerTitle: 'Großes Lineal',
      rulerHint: 'Jedes Feld ist 1 Dezimeter (10 cm). Tippe auf ein beliebiges Feld!',
      firstMeter: 'Erster Meter (0 — 100 cm)',
      secondMeter: 'Zweiter Meter (100 — 200 cm)',
      fullMeterText: '1 ganzer Meter = 10 dm = 100 cm',
      filledOf100: (cm: number) => `${cm} cm von 100 cm ausgefüllt`,
      cellTooltip: (cm: number, dm: number) => `${cm} cm einstellen (${dm} dm)`,
      zoomTitle: 'Nahansicht: Zentimeter im aktuellen Dezimeter',
      readoutTitle: 'Dieselbe Länge in verschiedenen Einheiten',
      reset: 'Zurücksetzen',
      onlyCm: 'Nur in Zentimetern',
      dmAndCm: 'In Dezimetern und Zentimetern',
      mAndCm: 'In Metern und Zentimetern',
      mDmCm: 'In m, dm und cm',
      emptyBreakdown:
        'Wähle eine Länge auf dem Lineal oder tippe auf einen Knopf unten.',
      numberIs: 'Die Länge',
      isEqualTo: 'entspricht',
      andMore: 'und noch',
      exactNoRem: 'genau ohne Rest.',
      sliderLabel: 'Längen-Regler',
      sliderMarks: ['0 cm', '50 cm (5 dm)', '100 cm (1 m)', '150 cm', '200 cm (2 m)'],
      stepPrompt: 'Schritt hinzufügen oder abziehen:',
      presetsPrompt: 'Beispiele aus dem Alltag:',
      presets: [
        { label: 'Radiergummi', cm: 4 },
        { label: 'Heft', cm: 20 },
        { label: 'Lineal', cm: 30 },
        { label: 'Schultisch', cm: 120 },
        { label: 'Körpergröße', cm: 145 },
      ],
      rulesTitle: 'Drei wichtige Umrechnungsregeln',
      rulesSubtitle:
        'Kleinere Einheit → größere Zahl (malnehmen) · Größere Einheit → kleinere Zahl (teilen)',
      rules: [
        {
          formula: '1 dm = 10 cm',
          descLead: 'Von dm in cm: eine Null anhängen (× 10). Von cm in dm: eine Null streichen (oder Zehner abtrennen).',
          example: '4 dm = 40 cm · 52 cm = 5 dm 2 cm',
          colorClass: 'text-amber-700',
        },
        {
          formula: '1 m = 10 dm',
          descLead: 'Von m in dm: eine Null anhängen (× 10). Von dm in m: eine Null streichen (oder Zehner abtrennen).',
          example: '3 m = 30 dm · 27 dm = 2 m 7 dm',
          colorClass: 'text-sky-700',
        },
        {
          formula: '1 m = 100 cm',
          descLead: 'Von m in cm: zwei Nullen anhängen (× 100). Von cm in m: zwei Nullen streichen (oder Hunderter abtrennen).',
          example: '2 m = 200 cm · 305 cm = 3 m 5 cm',
          colorClass: 'text-emerald-700',
        },
      ],
    },
    trainer: {
      level: 'Level',
      points: 'Punkte:',
      levelOpened: (lvl: number) => `10 von 10 · Level ${lvl} erreicht!`,
      untilLevel: (lvl: number) => `Bis Level ${lvl}:`,
      of10Correct: (filled: number) => `${filled} von 10`,
      correctSuffix: 'richtig',
      progressAria: 'Fortschritt bis zum nächsten Level',
      unitsLabel: 'Einheiten:',
      typeLabel: 'Art:',
      countLabel: 'Aufgaben:',
      countShort: (c: number) => `${c} Stk.`,
      configure: 'Einstellungen',
      hide: 'Ausblenden',
      regenerate: 'Neu mischen',
      pairLabels: {
        'cm-dm': 'cm ↔ dm',
        'dm-m': 'dm ↔ m',
        'cm-m': 'cm ↔ m',
        multi: 'Gemischte Einheiten',
        all: 'Alle zusammen',
      },
      complexityLabels: {
        simple: 'Einfach',
        compound: 'Zusammengesetzt',
        mixed: 'Gemischt',
      },
      exampleOf: (cur: number, total: number) => `Aufgabe ${cur} von ${total}`,
      correctCountLabel: (c: number) => `Richtig: ${c}`,
      streakLabel: (s: number) => `Serie: ${s}`,
      digitsBtn: 'Ziffern',
      hintBtn: 'Tipp',
      answerAria: (unit: string) => `Antwort in ${unit}`,
      clearBtn: 'Löschen',
      deleteDigitAria: 'Ziffer löschen',
      hintTitle: (rule: string) => `Tipp · ${rule}`,
      correctFeedback: 'Richtig! Super gemacht.',
      wrongFeedback: 'Richtige Antwort:',
      pointsEarned: (pts: number) => `+${pts} Punkte`,
      levelUpText: (lvl: number) =>
        `Neues Level! 10 richtige Antworten — du hast jetzt Level ${lvl}!`,
      checkBtn: 'Antwort prüfen',
      nextBtn: 'Nächste Aufgabe',
      resultsBtn: 'Ergebnis ansehen',
      summaryTitle: 'Runde beendet',
      summaryMeta: (c: number, total: number, lvl: number, pts: number) =>
        `Richtig gelöst: ${c} von ${total} · Level ${lvl} · Gesamtpunkte: ${pts}`,
      retryMistakes: 'Fehler wiederholen',
      newSeries: 'Neue Aufgabenrunde',
      correctWord: 'Richtig',
      yourAnswer: 'Deine Antwort:',
    },
    sheet: {
      countLabel: 'Anzahl:',
      showAnswers: 'Antworten zeigen',
      hideAnswers: 'Antworten verbergen',
      newProblems: 'Neue Aufgaben',
      print: 'Drucken',
      title: 'Arbeitsblatt: Längeneinheiten umrechnen',
      rulesLine: '1 dm = 10 cm · 1 m = 10 dm · 1 m = 100 cm',
      nameLine: (total: number) => `Name: __________________ · Richtig: ___ / ${total}`,
    },
  },
} as const;
