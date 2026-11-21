import { Language, LocalizedText, UnitCode, formatUnit, formatUnitParts } from '../i18n/translations';

export type UnitPairMode = 'cm-dm' | 'dm-m' | 'cm-m' | 'multi' | 'all';

export type ComplexityMode = 'simple' | 'compound' | 'mixed';

export type GameModeFilter = 'mix' | 'input' | 'choice' | 'compare';

export type TaskFormat = 'input' | 'choice' | 'compare';

export type CompareSign = '<' | '=' | '>';

export type StoryIconKey = 'rocket' | 'cat' | 'footprints' | 'castle' | 'bike' | 'sparkles';

export interface GeneratorConfig {
  pairMode: UnitPairMode;
  complexity: ComplexityMode;
  count: number;
  gameMode?: GameModeFilter;
}

export interface PromptPart {
  value: number;
  unit: UnitCode;
}

export interface AnswerSlot {
  unit: UnitCode;
  expected: number;
}

export interface ChoiceOption {
  id: string;
  parts: AnswerSlot[]; // reuse value/unit structure with expected as numeric value
}

export interface Problem {
  id: string;
  format: TaskFormat;
  pair: Exclude<UnitPairMode, 'all'>;
  kind: 'simple' | 'compound';
  story: LocalizedText;
  storyIcon: StoryIconKey;
  promptParts: PromptPart[];
  slots: AnswerSlot[];
  choices?: ChoiceOption[];
  compareRightParts?: PromptPart[];
  expectedSign?: CompareSign;
  hint: LocalizedText;
  explanation: LocalizedText;
  ruleBadge: LocalizedText;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const STORIES: { icon: StoryIconKey; ru: string; de: string }[] = [
  {
    icon: 'footprints',
    ru: 'Кенгуру сделал большой прыжок. Помоги измерить его длину!',
    de: 'Das Känguru hat einen riesigen Sprung gemacht. Hilf beim Umrechnen!',
  },
  {
    icon: 'rocket',
    ru: 'Бумажный самолётик пролетел прямо через всю комнату!',
    de: 'Der Papierflieger ist quer durch das ganze Zimmer geflogen!',
  },
  {
    icon: 'cat',
    ru: 'Кот Барсик прошёл по забору и оставил следы на линейке.',
    de: 'Kater Felix ist über den Zaun balanciert. Wie weit ist er gekommen?',
  },
  {
    icon: 'castle',
    ru: 'Робот построил высокую башню из конструктора!',
    de: 'Der Roboter hat einen richtig hohen Turm aus Bausteinen gebaut!',
  },
  {
    icon: 'bike',
    ru: 'Юный гонщик проехал по трассе для скейта. Переведи результат!',
    de: 'Ein Skateboard-Profi ist über die Rampe gesaust. Rechne die Strecke um!',
  },
];

const COMPARE_STORIES: { icon: StoryIconKey; ru: string; de: string }[] = [
  {
    icon: 'footprints',
    ru: 'Кто прыгнул дальше — лягушка или кузнечик? Сравни две длины!',
    de: 'Wer ist weiter gesprungen — Frosch oder Grashüpfer? Vergleiche!',
  },
  {
    icon: 'rocket',
    ru: 'Две ракеты запустили в небо. Чей полёт длиннее?',
    de: 'Zwei Spielzeugraketen sind gestartet. Welche flog weiter?',
  },
  {
    icon: 'castle',
    ru: 'Два строителя спорят, чья башня выше. Помоги им разобраться!',
    de: 'Zwei Baumeister streiten, wessen Turm höher ist. Hilf ihnen!',
  },
];

type BaseDraft = Omit<Problem, 'id' | 'format' | 'story' | 'storyIcon'>;

function createCmDmProblem(kind: 'simple' | 'compound'): BaseDraft {
  if (kind === 'simple') {
    const forward = Math.random() < 0.5;
    const dm = randomInt(1, 15);
    if (forward) {
      const ans = dm * 10;
      return {
        pair: 'cm-dm',
        kind: 'simple',
        promptParts: [{ value: dm, unit: 'dm' }],
        slots: [{ unit: 'cm', expected: ans }],
        ruleBadge: { ru: '1 дм = 10 см', de: '1 dm = 10 cm' },
        hint: {
          ru: `В 1 дм ровно 10 см. Чтобы перевести в мелкие сантиметры, допиши один ноль к числу ${dm} (умножь на 10).`,
          de: `1 dm sind genau 10 cm. Für Zentimeter hänge einfach eine Null an ${dm} an (mal 10).`,
        },
        explanation: {
          ru: `${dm} дм = ${dm} × 10 см = ${ans} см.`,
          de: `${dm} dm = ${dm} × 10 cm = ${ans} cm.`,
        },
      };
    } else {
      const cm = dm * 10;
      return {
        pair: 'cm-dm',
        kind: 'simple',
        promptParts: [{ value: cm, unit: 'cm' }],
        slots: [{ unit: 'dm', expected: dm }],
        ruleBadge: { ru: '10 см = 1 дм', de: '10 cm = 1 dm' },
        hint: {
          ru: `Дециметры крупнее сантиметров в 10 раз. Убери один ноль у числа ${cm} (раздели на 10).`,
          de: `Dezimeter sind 10-mal größer als Zentimeter. Streiche eine Null bei ${cm} (geteilt durch 10).`,
        },
        explanation: {
          ru: `${cm} см = ${cm} : 10 = ${dm} дм.`,
          de: `${cm} cm = ${cm} : 10 = ${dm} dm.`,
        },
      };
    }
  }

  const toSingleUnit = Math.random() < 0.5;
  const dm = randomInt(1, 9);
  const remCm = randomInt(1, 9);
  const totalCm = dm * 10 + remCm;

  if (toSingleUnit) {
    return {
      pair: 'cm-dm',
      kind: 'compound',
      promptParts: [
        { value: dm, unit: 'dm' },
        { value: remCm, unit: 'cm' },
      ],
      slots: [{ unit: 'cm', expected: totalCm }],
      ruleBadge: { ru: '1 дм = 10 см', de: '1 dm = 10 cm' },
      hint: {
        ru: `Сначала переведи ${dm} дм в сантиметры (допиши ноль), а потом прибавь ${remCm} см.`,
        de: `Rechne zuerst ${dm} dm in Zentimeter um (eine Null anhängen) und zähle dann ${remCm} cm dazu.`,
      },
      explanation: {
        ru: `${dm} дм ${remCm} см = ${dm * 10} см + ${remCm} см = ${totalCm} см.`,
        de: `${dm} dm ${remCm} cm = ${dm * 10} cm + ${remCm} cm = ${totalCm} cm.`,
      },
    };
  }

  return {
    pair: 'cm-dm',
    kind: 'compound',
    promptParts: [{ value: totalCm, unit: 'cm' }],
    slots: [
      { unit: 'dm', expected: dm },
      { unit: 'cm', expected: remCm },
    ],
    ruleBadge: { ru: '10 см = 1 дм', de: '10 cm = 1 dm' },
    hint: {
      ru: `Раздели число ${totalCm} на десятки и единицы: сколько полных десятков — столько дм, а остаток — это см.`,
      de: `Teile ${totalCm} in Zehner und Einer auf: Die Zehner sind die Dezimeter, der Rest bleibt in Zentimetern.`,
    },
    explanation: {
      ru: `${totalCm} см = ${dm * 10} см + ${remCm} см = ${dm} дм ${remCm} см.`,
      de: `${totalCm} cm = ${dm * 10} cm + ${remCm} cm = ${dm} dm ${remCm} cm.`,
    },
  };
}

function createDmMProblem(kind: 'simple' | 'compound'): BaseDraft {
  if (kind === 'simple') {
    const forward = Math.random() < 0.5;
    const m = randomInt(1, 12);
    if (forward) {
      const ans = m * 10;
      return {
        pair: 'dm-m',
        kind: 'simple',
        promptParts: [{ value: m, unit: 'm' }],
        slots: [{ unit: 'dm', expected: ans }],
        ruleBadge: { ru: '1 м = 10 дм', de: '1 m = 10 dm' },
        hint: {
          ru: `В 1 м ровно 10 дм. Допиши один ноль к числу ${m} (умножь на 10).`,
          de: `In 1 m stecken 10 dm. Hänge einfach eine Null an ${m} an (mal 10).`,
        },
        explanation: {
          ru: `${m} м = ${m} × 10 дм = ${ans} дм.`,
          de: `${m} m = ${m} × 10 dm = ${ans} dm.`,
        },
      };
    } else {
      const dm = m * 10;
      return {
        pair: 'dm-m',
        kind: 'simple',
        promptParts: [{ value: dm, unit: 'dm' }],
        slots: [{ unit: 'm', expected: m }],
        ruleBadge: { ru: '10 дм = 1 м', de: '10 dm = 1 m' },
        hint: {
          ru: `Метры в 10 раз крупнее дециметров. Убери один ноль у числа ${dm} (раздели на 10).`,
          de: `Meter sind 10-mal größer als Dezimeter. Streiche eine Null bei ${dm} (geteilt durch 10).`,
        },
        explanation: {
          ru: `${dm} дм = ${dm} : 10 = ${m} м.`,
          de: `${dm} dm = ${dm} : 10 = ${m} m.`,
        },
      };
    }
  }

  const toSingleUnit = Math.random() < 0.5;
  const m = randomInt(1, 9);
  const remDm = randomInt(1, 9);
  const totalDm = m * 10 + remDm;

  if (toSingleUnit) {
    return {
      pair: 'dm-m',
      kind: 'compound',
      promptParts: [
        { value: m, unit: 'm' },
        { value: remDm, unit: 'dm' },
      ],
      slots: [{ unit: 'dm', expected: totalDm }],
      ruleBadge: { ru: '1 м = 10 дм', de: '1 m = 10 dm' },
      hint: {
        ru: `Сначала переведи ${m} м в дециметры (допиши ноль), а потом прибавь ${remDm} дм.`,
        de: `Rechne zuerst ${m} m in Dezimeter um (eine Null anhängen) und zähle ${remDm} dm dazu.`,
      },
      explanation: {
        ru: `${m} м ${remDm} дм = ${m * 10} дм + ${remDm} дм = ${totalDm} дм.`,
        de: `${m} m ${remDm} dm = ${m * 10} dm + ${remDm} dm = ${totalDm} dm.`,
      },
    };
  }

  return {
    pair: 'dm-m',
    kind: 'compound',
    promptParts: [{ value: totalDm, unit: 'dm' }],
    slots: [
      { unit: 'm', expected: m },
      { unit: 'dm', expected: remDm },
    ],
    ruleBadge: { ru: '10 дм = 1 м', de: '10 dm = 1 m' },
    hint: {
      ru: `Каждые 10 дм складываются в 1 м. Десятки числа ${totalDm} — это метры, единицы — оставшиеся дм.`,
      de: `Je 10 dm ergeben 1 m. Die Zehner in ${totalDm} sind die Meter, die Einer bleiben Dezimeter.`,
    },
    explanation: {
      ru: `${totalDm} дм = ${m * 10} дм + ${remDm} дм = ${m} м ${remDm} дм.`,
      de: `${totalDm} dm = ${m * 10} dm + ${remDm} dm = ${m} m ${remDm} dm.`,
    },
  };
}

function createCmMProblem(kind: 'simple' | 'compound'): BaseDraft {
  if (kind === 'simple') {
    const forward = Math.random() < 0.5;
    const m = randomInt(1, 9);
    if (forward) {
      const ans = m * 100;
      return {
        pair: 'cm-m',
        kind: 'simple',
        promptParts: [{ value: m, unit: 'm' }],
        slots: [{ unit: 'cm', expected: ans }],
        ruleBadge: { ru: '1 м = 100 см', de: '1 m = 100 cm' },
        hint: {
          ru: `В 1 м ровно 100 см! Допиши два нуля к числу ${m} (умножь на 100).`,
          de: `In 1 m stecken 100 cm! Hänge zwei Nullen an ${m} an (mal 100).`,
        },
        explanation: {
          ru: `${m} м = ${m} × 100 см = ${ans} см.`,
          de: `${m} m = ${m} × 100 cm = ${ans} cm.`,
        },
      };
    } else {
      const cm = m * 100;
      return {
        pair: 'cm-m',
        kind: 'simple',
        promptParts: [{ value: cm, unit: 'cm' }],
        slots: [{ unit: 'm', expected: m }],
        ruleBadge: { ru: '100 см = 1 м', de: '100 cm = 1 m' },
        hint: {
          ru: `Метры в 100 раз крупнее сантиметров. Убери два нуля у числа ${cm} (раздели на 100).`,
          de: `Meter sind 100-mal größer als Zentimeter. Streiche zwei Nullen bei ${cm} (geteilt durch 100).`,
        },
        explanation: {
          ru: `${cm} см = ${cm} : 100 = ${m} м.`,
          de: `${cm} cm = ${cm} : 100 = ${m} m.`,
        },
      };
    }
  }

  const toSingleUnit = Math.random() < 0.5;
  const m = randomInt(1, 7);
  const remCm = Math.random() < 0.35 ? randomInt(1, 9) : randomInt(10, 95);
  const totalCm = m * 100 + remCm;

  if (toSingleUnit) {
    return {
      pair: 'cm-m',
      kind: 'compound',
      promptParts: [
        { value: m, unit: 'm' },
        { value: remCm, unit: 'cm' },
      ],
      slots: [{ unit: 'cm', expected: totalCm }],
      ruleBadge: { ru: '1 м = 100 см', de: '1 m = 100 cm' },
      hint: {
        ru: `В ${m} м будет ${m * 100} см (допиши два нуля), потом прибавь ${remCm} см. Осторожно с нулём в середине, если см меньше 10!`,
        de: `${m} m sind ${m * 100} cm (zwei Nullen anhängen), dann ${remCm} cm addieren. Achte auf die Null in der Mitte, falls cm kleiner als 10 ist!`,
      },
      explanation: {
        ru: `${m} м ${remCm} см = ${m * 100} см + ${remCm} см = ${totalCm} см.`,
        de: `${m} m ${remCm} cm = ${m * 100} cm + ${remCm} cm = ${totalCm} cm.`,
      },
    };
  }

  return {
    pair: 'cm-m',
    kind: 'compound',
    promptParts: [{ value: totalCm, unit: 'cm' }],
    slots: [
      { unit: 'm', expected: m },
      { unit: 'cm', expected: remCm },
    ],
    ruleBadge: { ru: '100 см = 1 м', de: '100 cm = 1 m' },
    hint: {
      ru: `Каждые 100 см дают 1 метр. Посмотри на сотни в числе ${totalCm} — это метры, а остаток — сантиметры.`,
      de: `Je 100 cm ergeben 1 Meter. Die Hunderter in ${totalCm} sind die Meter, der Rest sind Zentimeter.`,
    },
    explanation: {
      ru: `${totalCm} см = ${m * 100} см + ${remCm} см = ${m} м ${remCm} см.`,
      de: `${totalCm} cm = ${m * 100} cm + ${remCm} cm = ${m} m ${remCm} cm.`,
    },
  };
}

function createMultiUnitProblem(kind: 'simple' | 'compound'): BaseDraft {
  const target = pickRandom<UnitCode>(['cm', 'dm', 'm']);

  if (target === 'cm') {
    if (kind === 'simple') {
      const m = randomInt(1, 6);
      const dm = randomInt(1, 9);
      const totalCm = m * 100 + dm * 10;
      return {
        pair: 'multi',
        kind: 'simple',
        promptParts: [
          { value: m, unit: 'm' },
          { value: dm, unit: 'dm' },
        ],
        slots: [{ unit: 'cm', expected: totalCm }],
        ruleBadge: {
          ru: '1 м = 100 см · 1 дм = 10 см',
          de: '1 m = 100 cm · 1 dm = 10 cm',
        },
        hint: {
          ru: `Переведи каждую часть в сантиметры: ${m} м = ${m * 100} см (два нуля) и ${dm} дм = ${dm * 10} см (один ноль), а потом сложи.`,
          de: `Rechne jeden Teil zuerst in Zentimeter um: ${m} m = ${m * 100} cm (zwei Nullen) und ${dm} dm = ${dm * 10} cm (eine Null), dann zusammenzählen.`,
        },
        explanation: {
          ru: `${m} м ${dm} дм = ${m * 100} см + ${dm * 10} см = ${totalCm} см.`,
          de: `${m} m ${dm} dm = ${m * 100} cm + ${dm * 10} cm = ${totalCm} cm.`,
        },
      };
    }

    const m = randomInt(1, 5);
    const dm = randomInt(1, 9);
    const cm = randomInt(1, 9);
    const totalCm = m * 100 + dm * 10 + cm;
    return {
      pair: 'multi',
      kind: 'compound',
      promptParts: [
        { value: m, unit: 'm' },
        { value: dm, unit: 'dm' },
        { value: cm, unit: 'cm' },
      ],
      slots: [{ unit: 'cm', expected: totalCm }],
      ruleBadge: {
        ru: '1 м = 100 см · 1 дм = 10 см',
        de: '1 m = 100 cm · 1 dm = 10 cm',
      },
      hint: {
        ru: `Переведи все части в сантиметры: метры в сотни (${m} × 100), дециметры в десятки (${dm} × 10), прибавь ${cm} см и сложи.`,
        de: `Wandle zuerst alles in Zentimeter um: Meter in Hunderter (${m} × 100), Dezimeter in Zehner (${dm} × 10), plus ${cm} cm.`,
      },
      explanation: {
        ru: `${m} м ${dm} дм ${cm} см = ${m * 100} см + ${dm * 10} см + ${cm} см = ${totalCm} см.`,
        de: `${m} m ${dm} dm ${cm} cm = ${m * 100} cm + ${dm * 10} cm + ${cm} cm = ${totalCm} cm.`,
      },
    };
  }

  if (target === 'dm') {
    if (kind === 'simple') {
      const useMetersAndCm = Math.random() < 0.6;
      if (useMetersAndCm) {
        const m = randomInt(1, 6);
        const cmTens = randomInt(1, 9);
        const cm = cmTens * 10;
        const totalDm = m * 10 + cmTens;
        return {
          pair: 'multi',
          kind: 'simple',
          promptParts: [
            { value: m, unit: 'm' },
            { value: cm, unit: 'cm' },
          ],
          slots: [{ unit: 'dm', expected: totalDm }],
          ruleBadge: {
            ru: '1 м = 10 дм · 10 см = 1 дм',
            de: '1 m = 10 dm · 10 cm = 1 dm',
          },
          hint: {
            ru: `Ты можешь сначала всё перевести в сантиметры (${m * 100} + ${cm}), сложить, а потом перевести в ожидаемые дециметры (убрать один ноль).`,
            de: `Du kannst zuerst alles in Zentimeter umrechnen (${m * 100} + ${cm}), zusammenzählen und danach eine Null streichen, um Dezimeter zu bekommen.`,
          },
          explanation: {
            ru: `${m} м ${cm} см = ${m * 10} дм + ${cmTens} дм = ${totalDm} дм.`,
            de: `${m} m ${cm} cm = ${m * 10} dm + ${cmTens} dm = ${totalDm} dm.`,
          },
        };
      }

      const dm = randomInt(1, 9);
      const cmTens = randomInt(1, 9);
      const cm = cmTens * 10;
      const totalDm = dm + cmTens;
      return {
        pair: 'multi',
        kind: 'simple',
        promptParts: [
          { value: dm, unit: 'dm' },
          { value: cm, unit: 'cm' },
        ],
        slots: [{ unit: 'dm', expected: totalDm }],
        ruleBadge: { ru: '10 см = 1 дм', de: '10 cm = 1 dm' },
        hint: {
          ru: `Переведи ${cm} см в дециметры (убери один ноль) и прибавь к ${dm} дм — или сначала сложи всё в см, а потом убери ноль.`,
          de: `Wandle ${cm} cm in Dezimeter um (eine Null streichen) und zähle ${dm} dm dazu — oder rechne erst alles in cm und streiche dann eine Null.`,
        },
        explanation: {
          ru: `${dm} дм ${cm} см = ${dm} дм + ${cmTens} дм = ${totalDm} дм.`,
          de: `${dm} dm ${cm} cm = ${dm} dm + ${cmTens} dm = ${totalDm} dm.`,
        },
      };
    }

    const m = randomInt(1, 4);
    const dm = randomInt(1, 8);
    const cmTens = randomInt(1, 9);
    const cm = cmTens * 10;
    const totalDm = m * 10 + dm + cmTens;
    return {
      pair: 'multi',
      kind: 'compound',
      promptParts: [
        { value: m, unit: 'm' },
        { value: dm, unit: 'dm' },
        { value: cm, unit: 'cm' },
      ],
      slots: [{ unit: 'dm', expected: totalDm }],
      ruleBadge: {
        ru: '1 м = 10 дм · 10 см = 1 дм',
        de: '1 m = 10 dm · 10 cm = 1 dm',
      },
      hint: {
        ru: `Ты можешь сначала всё перевести в сантиметры (${m * 100} + ${dm * 10} + ${cm}), посчитать, а потом перевести в ожидаемые дециметры (убрать один ноль).`,
        de: `Du kannst zuerst alles in Zentimeter umrechnen (${m * 100} + ${dm * 10} + ${cm}), zusammenzählen und danach eine Null streichen, um Dezimeter zu erhalten.`,
      },
      explanation: {
        ru: `${m} м ${dm} дм ${cm} см = ${m * 10} дм + ${dm} дм + ${cmTens} дм = ${totalDm} дм.`,
        de: `${m} m ${dm} dm ${cm} cm = ${m * 10} dm + ${dm} dm + ${cmTens} dm = ${totalDm} dm.`,
      },
    };
  }

  // target === 'm'
  if (kind === 'simple') {
    const variant = randomInt(1, 3);
    if (variant === 1) {
      const dmTens = randomInt(1, 6);
      const cmHundreds = randomInt(1, 5);
      const dm = dmTens * 10;
      const cm = cmHundreds * 100;
      const totalM = dmTens + cmHundreds;
      return {
        pair: 'multi',
        kind: 'simple',
        promptParts: [
          { value: dm, unit: 'dm' },
          { value: cm, unit: 'cm' },
        ],
        slots: [{ unit: 'm', expected: totalM }],
        ruleBadge: {
          ru: '10 дм = 1 м · 100 см = 1 м',
          de: '10 dm = 1 m · 100 cm = 1 m',
        },
        hint: {
          ru: `Ты можешь сначала перевести всё в сантиметры (${dm * 10} + ${cm}), сложить, а потом убрать два нуля, чтобы получить метры.`,
          de: `Du kannst zuerst alles in Zentimeter umrechnen (${dm * 10} + ${cm}), addieren und danach zwei Nullen streichen, um Meter zu erhalten.`,
        },
        explanation: {
          ru: `${dm} дм ${cm} см = ${dmTens} м + ${cmHundreds} м = ${totalM} м.`,
          de: `${dm} dm ${cm} cm = ${dmTens} m + ${cmHundreds} m = ${totalM} m.`,
        },
      };
    }

    if (variant === 2) {
      const m = randomInt(1, 5);
      const dmTens = randomInt(1, 5);
      const dm = dmTens * 10;
      const totalM = m + dmTens;
      return {
        pair: 'multi',
        kind: 'simple',
        promptParts: [
          { value: m, unit: 'm' },
          { value: dm, unit: 'dm' },
        ],
        slots: [{ unit: 'm', expected: totalM }],
        ruleBadge: { ru: '10 дм = 1 м', de: '10 dm = 1 m' },
        hint: {
          ru: `Переведи ${dm} дм в метры (убери один ноль) и сложи с ${m} м — или переведи всё в см и убери два нуля.`,
          de: `Rechne ${dm} dm in Meter um (eine Null streichen) und zähle ${m} m dazu — oder rechne erst alles in cm und streiche zwei Nullen.`,
        },
        explanation: {
          ru: `${m} м ${dm} дм = ${m} м + ${dmTens} м = ${totalM} м.`,
          de: `${m} m ${dm} dm = ${m} m + ${dmTens} m = ${totalM} m.`,
        },
      };
    }

    const m = randomInt(1, 5);
    const cmHundreds = randomInt(1, 5);
    const cm = cmHundreds * 100;
    const totalM = m + cmHundreds;
    return {
      pair: 'multi',
      kind: 'simple',
      promptParts: [
        { value: m, unit: 'm' },
        { value: cm, unit: 'cm' },
      ],
      slots: [{ unit: 'm', expected: totalM }],
      ruleBadge: { ru: '100 см = 1 м', de: '100 cm = 1 m' },
      hint: {
        ru: `Переведи ${cm} см в метры (убери два нуля) и прибавь к ${m} м.`,
        de: `Rechne ${cm} cm in Meter um (zwei Nullen streichen) und zähle ${m} m dazu.`,
      },
      explanation: {
        ru: `${m} м ${cm} см = ${m} м + ${cmHundreds} м = ${totalM} м.`,
        de: `${m} m ${cm} cm = ${m} m + ${cmHundreds} m = ${totalM} m.`,
      },
    };
  }

  const m = randomInt(1, 4);
  const dmTens = randomInt(1, 5);
  const cmHundreds = randomInt(1, 4);
  const dm = dmTens * 10;
  const cm = cmHundreds * 100;
  const totalM = m + dmTens + cmHundreds;
  return {
    pair: 'multi',
    kind: 'compound',
    promptParts: [
      { value: m, unit: 'm' },
      { value: dm, unit: 'dm' },
      { value: cm, unit: 'cm' },
    ],
    slots: [{ unit: 'm', expected: totalM }],
    ruleBadge: {
      ru: '10 дм = 1 м · 100 см = 1 м',
      de: '10 dm = 1 m · 100 cm = 1 m',
    },
    hint: {
      ru: `Ты можешь сначала всё перевести в сантиметры (${m * 100} + ${dm * 10} + ${cm}), сложить, а потом перевести в метры (убрать два нуля).`,
      de: `Du kannst zuerst alles in Zentimeter umrechnen (${m * 100} + ${dm * 10} + ${cm}), zusammenzählen und danach zwei Nullen streichen, um Meter zu erhalten.`,
    },
    explanation: {
      ru: `${m} м ${dm} дм ${cm} см = ${m} м + ${dmTens} м + ${cmHundreds} м = ${totalM} м.`,
      de: `${m} m ${dm} dm ${cm} cm = ${m} m + ${dmTens} m + ${cmHundreds} m = ${totalM} m.`,
    },
  };
}

function buildChoiceOptions(slots: AnswerSlot[]): ChoiceOption[] {
  const serialize = (parts: AnswerSlot[]) =>
    parts.map((p) => `${p.expected}${p.unit}`).join('|');

  const correctKey = serialize(slots);
  const candidates: AnswerSlot[][] = [];

  if (slots.length === 1) {
    const { expected, unit } = slots[0];
    const proposals = [
      expected * 10,
      expected >= 10 && expected % 10 === 0 ? expected / 10 : expected + 10,
      expected > 10 ? expected - 10 : expected + 2,
      expected + 100,
      expected > 100 ? expected - 90 : expected + 5,
      Math.max(1, expected + (expected % 2 === 0 ? 1 : -1)),
    ];
    for (const val of proposals) {
      if (val > 0 && val !== expected) {
        candidates.push([{ unit, expected: val }]);
      }
    }
  } else {
    const [first, second] = slots;
    const proposals: AnswerSlot[][] = [
      [
        { unit: first.unit, expected: second.expected },
        { unit: second.unit, expected: first.expected },
      ],
      [
        { unit: first.unit, expected: first.expected + 1 },
        { unit: second.unit, expected: second.expected },
      ],
      [
        { unit: first.unit, expected: first.expected },
        { unit: second.unit, expected: second.expected + 10 },
      ],
      [
        { unit: first.unit, expected: Math.max(1, first.expected - 1) },
        { unit: second.unit, expected: second.expected },
      ],
      [
        { unit: first.unit, expected: first.expected * 10 },
        { unit: second.unit, expected: second.expected },
      ],
    ];
    for (const p of proposals) {
      if (p[0].expected !== p[1].expected || p[0].expected !== first.expected) {
        candidates.push(p);
      }
    }
  }

  const picked: ChoiceOption[] = [{ id: 'opt-correct', parts: slots }];
  const seen = new Set<string>([correctKey]);

  for (const cand of candidates) {
    const key = serialize(cand);
    if (!seen.has(key)) {
      seen.add(key);
      picked.push({ id: `opt-${picked.length}`, parts: cand });
      if (picked.length === 4) break;
    }
  }

  // Fallback if fewer than 4
  let offset = 2;
  while (picked.length < 4) {
    const fallback = slots.map((s, i) =>
      i === 0 ? { ...s, expected: s.expected + offset } : s
    );
    const key = serialize(fallback);
    if (!seen.has(key)) {
      seen.add(key);
      picked.push({ id: `opt-${picked.length}`, parts: fallback });
    }
    offset++;
  }

  return shuffle(picked);
}

function partsToCm(parts: PromptPart[]): number {
  return parts.reduce((sum, p) => {
    if (p.unit === 'm') return sum + p.value * 100;
    if (p.unit === 'dm') return sum + p.value * 10;
    return sum + p.value;
  }, 0);
}

function createCompareProblem(
  pair: Exclude<UnitPairMode, 'all'>,
  kind: 'simple' | 'compound'
): Problem {
  let leftParts: PromptPart[];
  let rightParts: PromptPart[];
  let ruleBadge: LocalizedText;

  const isEqual = Math.random() < 0.34;

  if (pair === 'cm-dm') {
    const dm = randomInt(2, 9);
    const extraCm = kind === 'compound' ? randomInt(1, 9) : 0;
    leftParts = extraCm > 0 ? [{ value: dm, unit: 'dm' }, { value: extraCm, unit: 'cm' }] : [{ value: dm, unit: 'dm' }];
    if (isEqual) {
      rightParts = [{ value: dm * 10 + extraCm, unit: 'cm' }];
    } else {
      const delta = pickRandom([-10, 10, -5, 5, 20]);
      rightParts = [{ value: Math.max(10, dm * 10 + extraCm + delta), unit: 'cm' }];
    }
    ruleBadge = { ru: '1 дм = 10 см', de: '1 dm = 10 cm' };
  } else if (pair === 'dm-m') {
    const m = randomInt(1, 7);
    const extraDm = kind === 'compound' ? randomInt(1, 9) : 0;
    leftParts = extraDm > 0 ? [{ value: m, unit: 'm' }, { value: extraDm, unit: 'dm' }] : [{ value: m, unit: 'm' }];
    if (isEqual) {
      rightParts = [{ value: m * 10 + extraDm, unit: 'dm' }];
    } else {
      const delta = pickRandom([-10, 10, -5, 5]);
      rightParts = [{ value: Math.max(5, m * 10 + extraDm + delta), unit: 'dm' }];
    }
    ruleBadge = { ru: '1 м = 10 дм', de: '1 m = 10 dm' };
  } else if (pair === 'cm-m') {
    const m = randomInt(1, 6);
    const extraCm = kind === 'compound' ? randomInt(1, 9) : 0; // great zero trap!
    leftParts = extraCm > 0 ? [{ value: m, unit: 'm' }, { value: extraCm, unit: 'cm' }] : [{ value: m, unit: 'm' }];
    if (isEqual) {
      rightParts = [{ value: m * 100 + extraCm, unit: 'cm' }];
    } else {
      // e.g., 2 m 5 cm vs 250 cm or 25 dm
      const altCm = m * 100 + (extraCm > 0 ? extraCm * 10 : pickRandom([-50, 50, 100]));
      rightParts = [{ value: Math.max(50, altCm), unit: 'cm' }];
    }
    ruleBadge = { ru: '1 м = 100 см', de: '1 m = 100 cm' };
  } else {
    // multi: compare mixed units across cm, dm, m
    const m = randomInt(1, 4);
    const dm = randomInt(1, 8);
    const cm = kind === 'compound' ? randomInt(1, 9) : 0;
    leftParts =
      cm > 0
        ? [
            { value: m, unit: 'm' },
            { value: dm, unit: 'dm' },
            { value: cm, unit: 'cm' },
          ]
        : [
            { value: m, unit: 'm' },
            { value: dm, unit: 'dm' },
          ];
    const leftCm = partsToCm(leftParts);
    if (isEqual) {
      rightParts =
        cm === 0
          ? [{ value: m * 10 + dm, unit: 'dm' }]
          : [{ value: leftCm, unit: 'cm' }];
    } else {
      const deltaDm = pickRandom([-3, -1, 1, 3, 5]);
      rightParts = [{ value: Math.max(5, m * 10 + dm + deltaDm), unit: 'dm' }];
    }
    ruleBadge = { ru: '1 м = 100 см · 1 дм = 10 см', de: '1 m = 100 cm · 1 dm = 10 cm' };
  }

  const leftCm = partsToCm(leftParts);
  const rightCm = partsToCm(rightParts);
  const expectedSign: CompareSign = leftCm < rightCm ? '<' : leftCm > rightCm ? '>' : '=';
  const story = pickRandom(COMPARE_STORIES);

  const leftRu = formatUnitParts(leftParts, 'ru');
  const rightRu = formatUnitParts(rightParts, 'ru');
  const leftDe = formatUnitParts(leftParts, 'de');
  const rightDe = formatUnitParts(rightParts, 'de');

  return {
    id: '',
    format: 'compare',
    pair,
    kind,
    story: { ru: story.ru, de: story.de },
    storyIcon: story.icon,
    promptParts: leftParts,
    compareRightParts: rightParts,
    expectedSign,
    slots: [],
    ruleBadge,
    hint: {
      ru: `Сначала переведи обе стороны в сантиметры, чтобы честно сравнить числа!`,
      de: `Rechne zuerst beide Seiten in Zentimeter um, damit du die Zahlen fair vergleichen kannst!`,
    },
    explanation: {
      ru: `${leftRu} = ${leftCm} см, а ${rightRu} = ${rightCm} см. Поэтому ${leftRu} ${expectedSign} ${rightRu}.`,
      de: `${leftDe} = ${leftCm} cm und ${rightDe} = ${rightCm} cm. Darum gilt: ${leftDe} ${expectedSign} ${rightDe}.`,
    },
  };
}

export function generateProblems(config: GeneratorConfig): Problem[] {
  const results: Problem[] = [];
  const seenPrompts = new Set<string>();
  const pairs: Exclude<UnitPairMode, 'all'>[] =
    config.pairMode === 'all' ? ['cm-dm', 'dm-m', 'cm-m', 'multi'] : [config.pairMode];
  const gameMode: GameModeFilter = config.gameMode ?? 'mix';

  let guard = 0;
  while (results.length < config.count && guard < config.count * 14) {
    guard++;
    const pair = pickRandom(pairs);
    const kind: 'simple' | 'compound' =
      config.complexity === 'mixed'
        ? Math.random() < 0.45
          ? 'simple'
          : 'compound'
        : config.complexity;

    const format: TaskFormat =
      gameMode === 'mix'
        ? pickRandom<TaskFormat>(['input', 'choice', 'compare'])
        : gameMode;

    let problem: Problem;
    if (format === 'compare') {
      problem = createCompareProblem(pair, kind);
    } else {
      let draft: BaseDraft;
      if (pair === 'cm-dm') {
        draft = createCmDmProblem(kind);
      } else if (pair === 'dm-m') {
        draft = createDmMProblem(kind);
      } else if (pair === 'cm-m') {
        draft = createCmMProblem(kind);
      } else {
        draft = createMultiUnitProblem(kind);
      }

      const story = pickRandom(STORIES);
      problem = {
        ...draft,
        id: '',
        format,
        story: { ru: story.ru, de: story.de },
        storyIcon: story.icon,
        choices: format === 'choice' ? buildChoiceOptions(draft.slots) : undefined,
      };
    }

    const signature =
      problem.format === 'compare'
        ? `cmp:${problem.promptParts.map((p) => `${p.value}${p.unit}`).join(' ')}vs${problem.compareRightParts?.map((p) => `${p.value}${p.unit}`).join(' ')}`
        : `${problem.format}:${problem.promptParts.map((p) => `${p.value}${p.unit}`).join(' ')}->${problem.slots.map((s) => s.unit).join(',')}`;

    if (seenPrompts.has(signature) && guard < config.count * 9) {
      continue;
    }
    seenPrompts.add(signature);

    results.push({
      ...problem,
      id: `p-${Date.now()}-${results.length}-${Math.random().toString(36).slice(2, 6)}`,
    });
  }

  return results;
}

export function formatPrompt(problem: Problem, lang: Language): string {
  return formatUnitParts(problem.promptParts, lang);
}

export function formatCompareRight(problem: Problem, lang: Language): string {
  if (!problem.compareRightParts) return '';
  return formatUnitParts(problem.compareRightParts, lang);
}

export function formatSlots(slots: AnswerSlot[], lang: Language): string {
  return slots.map((slot) => `${slot.expected} ${formatUnit(slot.unit, lang)}`).join(' ');
}

export function formatExpectedAnswer(problem: Problem, lang: Language): string {
  if (problem.format === 'compare' && problem.expectedSign) {
    return `${formatPrompt(problem, lang)} ${problem.expectedSign} ${formatCompareRight(problem, lang)}`;
  }
  return formatSlots(problem.slots, lang);
}
