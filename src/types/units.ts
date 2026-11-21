import { Language, LocalizedText, UnitCode, formatUnit, formatUnitParts } from '../i18n/translations';

export type UnitPairMode = 'cm-dm' | 'dm-m' | 'cm-m' | 'multi' | 'all';

export type ComplexityMode = 'simple' | 'compound' | 'mixed';

export interface GeneratorConfig {
  pairMode: UnitPairMode;
  complexity: ComplexityMode;
  count: number;
}

export interface PromptPart {
  value: number;
  unit: UnitCode;
}

export interface AnswerSlot {
  unit: UnitCode;
  expected: number;
}

export interface Problem {
  id: string;
  pair: Exclude<UnitPairMode, 'all'>;
  kind: 'simple' | 'compound';
  promptParts: PromptPart[];
  slots: AnswerSlot[];
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

function createCmDmProblem(kind: 'simple' | 'compound'): Omit<Problem, 'id'> {
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
          ru: `В каждом дециметре 10 сантиметров. Умножь ${dm} на 10 (допиши ноль справа).`,
          de: `In jedem Dezimeter stecken 10 Zentimeter. Rechne ${dm} × 10 (hänge rechts eine Null an).`,
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
          ru: `Дециметр в 10 раз крупнее сантиметра. Раздели ${cm} на 10 (убери один ноль).`,
          de: `Ein Dezimeter ist 10-mal größer als ein Zentimeter. Teile ${cm} durch 10 (streiche eine Null).`,
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
        ru: `Сначала переведи ${dm} дм в сантиметры (${dm} × 10), а затем прибавь ещё ${remCm} см.`,
        de: `Rechne zuerst ${dm} dm in Zentimeter um (${dm} × 10) und zähle dann ${remCm} cm dazu.`,
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
      ru: `Сколько полных десятков в числе ${totalCm}? Десятки станут дециметрами, а единицы останутся сантиметрами.`,
      de: `Wie viele volle Zehner stecken in ${totalCm}? Die Zehner werden zu Dezimetern, der Rest bleibt in Zentimetern.`,
    },
    explanation: {
      ru: `${totalCm} см = ${dm * 10} см + ${remCm} см = ${dm} дм ${remCm} см.`,
      de: `${totalCm} cm = ${dm * 10} cm + ${remCm} cm = ${dm} dm ${remCm} cm.`,
    },
  };
}

function createDmMProblem(kind: 'simple' | 'compound'): Omit<Problem, 'id'> {
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
          ru: `В 1 метре помещается 10 дециметров. Умножь ${m} на 10.`,
          de: `In 1 Meter passen 10 Dezimeter. Rechne ${m} × 10.`,
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
          ru: `Метр в 10 раз больше дециметра. Раздели ${dm} на 10.`,
          de: `Ein Meter ist 10-mal größer als ein Dezimeter. Teile ${dm} durch 10.`,
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
        ru: `Переведи ${m} м в дециметры (${m} × 10) и прибавь ${remDm} дм.`,
        de: `Rechne ${m} m in Dezimeter um (${m} × 10) und zähle ${remDm} dm dazu.`,
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
      ru: `Каждые 10 дм — это 1 метр. Раздели число ${totalDm} на десятки и единицы.`,
      de: `Jeweils 10 dm sind 1 Meter. Teile ${totalDm} in Zehner und Einer auf.`,
    },
    explanation: {
      ru: `${totalDm} дм = ${m * 10} дм + ${remDm} дм = ${m} м ${remDm} дм.`,
      de: `${totalDm} dm = ${m * 10} dm + ${remDm} dm = ${m} m ${remDm} dm.`,
    },
  };
}

function createCmMProblem(kind: 'simple' | 'compound'): Omit<Problem, 'id'> {
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
          ru: `В 1 метре 100 сантиметров! Умножь ${m} на 100 (допиши два нуля).`,
          de: `In 1 Meter sind 100 Zentimeter! Rechne ${m} × 100 (hänge zwei Nullen an).`,
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
          ru: `Метр в 100 раз крупнее сантиметра. Раздели ${cm} на 100 (убери два нуля).`,
          de: `Ein Meter ist 100-mal größer als ein Zentimeter. Teile ${cm} durch 100 (streiche zwei Nullen).`,
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
        ru: `В ${m} м будет ${m} сотен сантиметров (${m} × 100). Прибавь ещё ${remCm} см — не потеряй ноль, если сантиметров меньше 10!`,
        de: `${m} m sind ${m * 100} cm (${m} × 100). Zähle ${remCm} cm dazu — vergiss bei Zahlen unter 10 die Null in der Mitte nicht!`,
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
      ru: `Сотни в числе ${totalCm} — это метры, а десятки и единицы — оставшиеся сантиметры.`,
      de: `Die Hunderter in ${totalCm} sind die Meter, und die Zehner und Einer bleiben Zentimeter.`,
    },
    explanation: {
      ru: `${totalCm} см = ${m * 100} см + ${remCm} см = ${m} м ${remCm} см.`,
      de: `${totalCm} cm = ${m * 100} cm + ${remCm} cm = ${m} m ${remCm} cm.`,
    },
  };
}

function createMultiUnitProblem(kind: 'simple' | 'compound'): Omit<Problem, 'id'> {
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
          ru: `Переведи каждую часть в сантиметры: ${m} м — это ${m * 100} см, а ${dm} дм — это ${dm} × 10 см. Потом сложи.`,
          de: `Rechne jeden Teil in Zentimeter um: ${m} m sind ${m * 100} cm und ${dm} dm sind ${dm} × 10 cm. Dann zusammenzählen.`,
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
        ru: `Собери всё в сантиметрах: сотни — это метры (${m} × 100), десятки — дециметры (${dm} × 10), плюс ${cm} см.`,
        de: `Alles in Zentimeter umwandeln: Meter sind Hunderter (${m} × 100), Dezimeter sind Zehner (${dm} × 10), plus ${cm} cm.`,
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
            ru: `Переведи всё в дециметры: в ${m} м ровно ${m} × 10 дм, а ${cm} см раздели на 10.`,
            de: `Alles in Dezimeter umrechnen: ${m} m sind ${m} × 10 dm und ${cm} cm teilst du durch 10.`,
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
          ru: `Сантиметры ${cm} см переведи в дециметры (раздели на 10) и прибавь к ${dm} дм.`,
          de: `Rechne ${cm} cm in Dezimeter um (durch 10 teilen) und zähle sie zu ${dm} dm dazu.`,
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
        ru: `Каждую часть переведи в дециметры: ${m} м = ${m * 10} дм, ${dm} дм уже в дециметрах, а ${cm} см = ${cm} : 10 дм.`,
        de: `Wandle jeden Teil in Dezimeter um: ${m} m = ${m * 10} dm, ${dm} dm bleiben, und ${cm} cm = ${cm} : 10 dm.`,
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
          ru: `Переведи в метры обе части: ${dm} дм раздели на 10, а ${cm} см раздели на 100.`,
          de: `Rechne beide Teile in Meter um: ${dm} dm durch 10 teilen und ${cm} cm durch 100 teilen.`,
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
          ru: `Переведи ${dm} дм в метры (раздели на 10) и прибавь к ${m} м.`,
          de: `Rechne ${dm} dm in Meter um (durch 10 teilen) und zähle sie zu ${m} m dazu.`,
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
        ru: `Переведи ${cm} см в метры (раздели на 100) и прибавь к ${m} м.`,
        de: `Rechne ${cm} cm in Meter um (durch 100 teilen) und zähle sie zu ${m} m dazu.`,
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
      ru: `Переведи все части в метры: ${dm} дм раздели на 10, ${cm} см раздели на 100, и всё сложи с ${m} м.`,
      de: `Wandle alle Teile in Meter um: ${dm} dm durch 10 teilen, ${cm} cm durch 100 teilen und alles zu ${m} m addieren.`,
    },
    explanation: {
      ru: `${m} м ${dm} дм ${cm} см = ${m} м + ${dmTens} м + ${cmHundreds} м = ${totalM} м.`,
      de: `${m} m ${dm} dm ${cm} cm = ${m} m + ${dmTens} m + ${cmHundreds} m = ${totalM} m.`,
    },
  };
}

export function generateProblems(config: GeneratorConfig): Problem[] {
  const results: Problem[] = [];
  const seenPrompts = new Set<string>();
  const pairs: Exclude<UnitPairMode, 'all'>[] =
    config.pairMode === 'all' ? ['cm-dm', 'dm-m', 'cm-m', 'multi'] : [config.pairMode];

  let guard = 0;
  while (results.length < config.count && guard < config.count * 12) {
    guard++;
    const pair = pickRandom(pairs);
    const kind: 'simple' | 'compound' =
      config.complexity === 'mixed'
        ? Math.random() < 0.45
          ? 'simple'
          : 'compound'
        : config.complexity;

    let draft: Omit<Problem, 'id'>;
    if (pair === 'cm-dm') {
      draft = createCmDmProblem(kind);
    } else if (pair === 'dm-m') {
      draft = createDmMProblem(kind);
    } else if (pair === 'cm-m') {
      draft = createCmMProblem(kind);
    } else {
      draft = createMultiUnitProblem(kind);
    }

    const signature = `${draft.promptParts.map((p) => `${p.value}${p.unit}`).join(' ')}->${draft.slots.map((s) => s.unit).join(',')}`;
    if (seenPrompts.has(signature) && guard < config.count * 8) {
      continue;
    }
    seenPrompts.add(signature);

    results.push({
      ...draft,
      id: `p-${Date.now()}-${results.length}-${Math.random().toString(36).slice(2, 6)}`,
    });
  }

  return results;
}

export function formatPrompt(problem: Problem, lang: Language): string {
  return formatUnitParts(problem.promptParts, lang);
}

export function formatExpectedAnswer(problem: Problem, lang: Language): string {
  return problem.slots.map((slot) => `${slot.expected} ${formatUnit(slot.unit, lang)}`).join(' ');
}
