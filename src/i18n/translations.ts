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

export function getLevelTitle(level: number, lang: Language): string {
  const titles =
    lang === 'de'
      ? ['Entdecker', 'Spürhund', 'Lineal-Profi', 'Zahlen-Ass', 'Längen-Meister', 'Champion']
      : ['Следопыт', 'Исследователь', 'Мастер линейки', 'Знаток величин', 'Суперматематик', 'Чемпион'];
  const idx = Math.min(Math.max(0, level - 1), titles.length - 1);
  return titles[idx];
}

export const TRANSLATIONS = {
  ru: {
    pageTitle: 'Линейка — игра-тренажёр: см, дм, м',
    brand: 'Линейка',
    nav: {
      practice: 'Задания',
      sheet: 'Карточка для печати',
      mobilePractice: 'Задания',
      mobileSheet: 'Карточка',
      newExample: 'Новая серия',
      switchLanguageLabel: 'Сменить язык на немецкий',
    },
    trainer: {
      level: 'Уровень',
      points: 'Баллы:',
      levelOpened: (lvl: number) => `10 из 10 · Уровень ${lvl} открыт!`,
      untilLevel: (lvl: number) => `До уровня ${lvl}:`,
      of10Correct: (filled: number) => `${filled} из 10`,
      correctSuffix: 'верных',
      progressAria: 'Прогресс до нового уровня',
      modeLabel: 'Режим:',
      unitsLabel: 'Единицы:',
      typeLabel: 'Тип:',
      countLabel: 'Заданий:',
      countShort: (c: number) => `${c} шт.`,
      configure: 'Настроить',
      hide: 'Скрыть',
      regenerate: 'Новые задания',
      modeLabels: {
        mix: 'Микс-игра',
        input: 'Впиши ответ',
        choice: 'Выбери ответ',
        compare: 'Сравни < = >',
      },
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
      exampleOf: (cur: number, total: number) => `Задание ${cur} из ${total}`,
      correctCountLabel: (c: number) => `Верно: ${c}`,
      streakLabel: (s: number) => `Комбо: ${s} в ряд`,
      digitsBtn: 'Цифры',
      answerAria: (unit: string) => `Ответ в ${unit}`,
      clearBtn: 'Очистить',
      deleteDigitAria: 'Удалить цифру',
      hintTitle: (rule: string) => `Подсказка · ${rule}`,
      correctFeedback: 'Верно! Так держать.',
      comboBonus: (bonus: number) => `Бонус за серию: +${bonus}`,
      wrongFeedback: 'Правильный ответ:',
      pointsEarned: (pts: number) => `+${pts} баллов`,
      levelUpText: (lvl: number) =>
        `Новый уровень! 10 правильных ответов — теперь ты Уровень ${lvl}!`,
      checkBtn: 'Проверить ответ',
      nextBtn: 'Следующее задание',
      resultsBtn: 'Посмотреть результат',
      summaryTitle: 'Миссия выполнена!',
      summaryMeta: (c: number, total: number, lvl: number, pts: number) =>
        `Решено верно: ${c} из ${total} · Уровень ${lvl} · Всего баллов: ${pts}`,
      retryMistakes: 'Решить ошибки заново',
      newSeries: 'Новая серия заданий',
      correctWord: 'Верно',
      yourAnswer: 'Твой ответ:',
      compareQuestion: 'Какой знак подойдёт?',
    },
    sheet: {
      countLabel: 'Количество:',
      showAnswers: 'Показать ответы',
      hideAnswers: 'Скрыть ответы',
      newProblems: 'Новые задания',
      print: 'Распечатать',
      title: 'Карточка с заданиями: перевод единиц длины',
      rulesLine: '1 дм = 10 см · 1 м = 10 дм · 1 м = 100 см',
      nameLine: (total: number) => `Имя: __________________ · Верно: ___ / ${total}`,
    },
    qr: {
      buttonAria: 'Открыть QR-код для телефона или планшета',
      title: 'Открыть на любом устройстве',
      subtitle: 'Наведи камеру телефона или планшета на QR-код, чтобы открыть игру.',
      cardTitle: 'Играй с любого телефона или планшета',
      cardHint: 'Отсканируй QR-код камерой, чтобы быстро открыть задания на другом устройстве.',
      enlarge: 'Увеличить QR-код',
      copyLink: 'Копировать ссылку',
      copied: 'Ссылка скопирована',
      close: 'Закрыть',
    },
  },
  de: {
    pageTitle: 'Lineal — Lernspiel: cm, dm, m',
    brand: 'Lineal',
    nav: {
      practice: 'Aufgaben',
      sheet: 'Arbeitsblatt',
      mobilePractice: 'Aufgaben',
      mobileSheet: 'Blatt',
      newExample: 'Neue Runde',
      switchLanguageLabel: 'Sprache auf Russisch wechseln',
    },
    trainer: {
      level: 'Level',
      points: 'Punkte:',
      levelOpened: (lvl: number) => `10 von 10 · Level ${lvl} erreicht!`,
      untilLevel: (lvl: number) => `Bis Level ${lvl}:`,
      of10Correct: (filled: number) => `${filled} von 10`,
      correctSuffix: 'richtig',
      progressAria: 'Fortschritt bis zum nächsten Level',
      modeLabel: 'Spielart:',
      unitsLabel: 'Einheiten:',
      typeLabel: 'Art:',
      countLabel: 'Aufgaben:',
      countShort: (c: number) => `${c} Stk.`,
      configure: 'Einstellungen',
      hide: 'Ausblenden',
      regenerate: 'Neu mischen',
      modeLabels: {
        mix: 'Mix-Spiel',
        input: 'Zahl eintippen',
        choice: 'Auswählen',
        compare: 'Vergleichen < = >',
      },
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
      streakLabel: (s: number) => `Kombo: ${s} in Folge`,
      digitsBtn: 'Ziffern',
      answerAria: (unit: string) => `Antwort in ${unit}`,
      clearBtn: 'Löschen',
      deleteDigitAria: 'Ziffer löschen',
      hintTitle: (rule: string) => `Tipp · ${rule}`,
      correctFeedback: 'Richtig! Super gemacht.',
      comboBonus: (bonus: number) => `Serien-Bonus: +${bonus}`,
      wrongFeedback: 'Richtige Antwort:',
      pointsEarned: (pts: number) => `+${pts} Punkte`,
      levelUpText: (lvl: number) =>
        `Neues Level! 10 richtige Antworten — du hast jetzt Level ${lvl}!`,
      checkBtn: 'Antwort prüfen',
      nextBtn: 'Nächste Aufgabe',
      resultsBtn: 'Ergebnis ansehen',
      summaryTitle: 'Runde geschafft!',
      summaryMeta: (c: number, total: number, lvl: number, pts: number) =>
        `Richtig gelöst: ${c} von ${total} · Level ${lvl} · Gesamtpunkte: ${pts}`,
      retryMistakes: 'Fehler wiederholen',
      newSeries: 'Neue Aufgabenrunde',
      correctWord: 'Richtig',
      yourAnswer: 'Deine Antwort:',
      compareQuestion: 'Welches Zeichen passt?',
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
    qr: {
      buttonAria: 'QR-Code für Handy oder Tablet öffnen',
      title: 'Auf jedem Gerät öffnen',
      subtitle: 'Scanne den QR-Code mit der Kamera deines Handys oder Tablets, um das Spiel zu öffnen.',
      cardTitle: 'Auf Handy oder Tablet weiterspielen',
      cardHint: 'Scanne den QR-Code mit der Kamera auf einem beliebigen Gerät.',
      enlarge: 'QR-Code vergrößern',
      copyLink: 'Link kopieren',
      copied: 'Link kopiert',
      close: 'Schließen',
    },
  },
} as const;
