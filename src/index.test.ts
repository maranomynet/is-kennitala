import type { Equals, Expect, Extends, NotExtends } from '@reykjavik/hanna-utils';
import { describe, expect, test } from 'bun:test';

import type {
  Kennitala,
  KennitalaCompany,
  KennitalaDataCompany,
  KennitalaDataPerson,
  KennitalaPerson,
  KennitalaTemporary,
  KennitalaType,
} from './index.js';
import {
  cleanKennitalaAggressive,
  cleanKennitalaCareful,
  formatKennitala,
  generateKennitala,
  getKennitalaBirthDate,
  isCompanyKennitala,
  isPersonKennitala,
  isTempKennitala,
  isValidKennitala,
  parseKennitala,
} from './index.js';
import * as kennitalaModule from './index.js';

const ktPerson = '1012755239';
const ktCompany = '5001012880';
const ktGervi = '0101307789';
const ktKerfis = '8123456793';
const ktInvalid1 = '1212657890';
const ktInvalid2 = '10127552';

const ktPersonImpossible = '3368492689'; // technically valid, but impossible
const ktPersonImpossSneaky = '2902904499'; // technically valid, but impossible (1990 wasn't a leap year)
const ktCompanyImpossible = '7368492689'; // technically valid, but impossible
const ktCompanyImpossSneaky = '6902900499'; // technically valid, but impossible (1990 wasn't a leap year)

const kt_Person1 = '101275-5239';
const kt_Person1_EnDash = '101275– 5239';
const ktPersonAncient = '1012755238'; // ends with 8
const kt_Company = '500101 2880';
const kt_Company2 = '500101 - 2880';
const kt_Kerfis = '812345- 6793 ';

const kt_Malformed1 = ' 10-1275-52 39';
const kt_Malformed2 = ' 101275-52';
const kt_Malformed3 = '101275   - 5239';
const kt_Malformed2_EmDash = '101275—5239';

// ===========================================================================
// Test Type Signature and Exports

if (false as boolean) {
  /* eslint-disable @typescript-eslint/no-unused-vars */

  // Make sure the module exports are as advertised
  const expectedExports: Record<keyof typeof kennitalaModule, true> = {
    parseKennitala: true,
    isValidKennitala: true,

    isCompanyKennitala: true,
    isPersonKennitala: true,
    isTempKennitala: true,

    cleanKennitalaCareful: true,
    cleanKennitalaAggressive: true,

    formatKennitala: true,
    getKennitalaBirthDate: true,

    generateKennitala: true,
  };

  type Kennitala_is_exported = Kennitala;
  type KennitalaCompany_is_exported = KennitalaCompany;
  type KennitalaDataCompany_is_exported = KennitalaDataCompany;
  type KennitalaDataPerson_is_exported = KennitalaDataPerson;
  type KennitalaPerson_is_exported = KennitalaPerson;
  type KennitalaTemporary_is_exported = KennitalaTemporary;
  type KennitalaType_is_exported = KennitalaType;

  const either = parseKennitala(ktPerson);
  if (either) {
    type v = Expect<Equals<typeof either.value, Kennitala>>;
    type t = Expect<Equals<typeof either.type, KennitalaType>>;
    type r = Expect<Equals<typeof either.robot, false>>;
    if (either.type === 'person') {
      type v = Expect<Equals<typeof either.value, KennitalaPerson>>;
    }
    if (either.type === 'company') {
      type v = Expect<Equals<typeof either.value, KennitalaCompany>>;
    }
  }
  const eitherRobot = parseKennitala(ktPerson, { robot: true });
  if (eitherRobot) {
    type v = Expect<Equals<typeof eitherRobot.value, Kennitala>>;
    type t = Expect<Equals<typeof eitherRobot.type, KennitalaType>>;
    type r = Expect<Equals<typeof eitherRobot.robot, boolean>>;
    if (eitherRobot.type === 'company') {
      type v = Expect<Equals<typeof eitherRobot.robot, false>>;
    }
  }
  const person = parseKennitala(ktPerson, { type: 'person' });
  if (person) {
    type v = Expect<Equals<typeof person.value, KennitalaPerson>>;
    type t = Expect<Equals<typeof person.type, 'person'>>;
    type r = Expect<Equals<typeof person.robot, false>>;
  }
  const company = parseKennitala(ktPerson, { type: 'company', clean: 'careful' });
  if (company) {
    type v = Expect<Equals<typeof company.value, KennitalaCompany>>;
    type t = Expect<Equals<typeof company.type, 'company'>>;
    type r = Expect<Equals<typeof company.robot, false>>;
  }

  const str = '' as string;
  if (isValidKennitala(str)) {
    type k = Expect<Equals<typeof str, Kennitala>>;
  }
  if (isValidKennitala(str, { type: 'person' })) {
    type k = Expect<Equals<typeof str, KennitalaPerson>>;
  }
  if (isValidKennitala(str, { type: 'company' })) {
    type k = Expect<Equals<typeof str, KennitalaCompany>>;
  }
  if (isValidKennitala(str, { clean: 'none' })) {
    type k = Expect<Equals<typeof str, Kennitala>>;
  }
  if (isValidKennitala(str, { clean: 'careful' })) {
    type k = Expect<Equals<typeof str, string>>;
  }
  if (isValidKennitala(str, { clean: 'aggressive' })) {
    type k = Expect<Equals<typeof str, string>>;
  }

  const kts: Array<Kennitala> = [];
  const persons: Array<KennitalaPerson> = kts.filter(isPersonKennitala);
  const companies: Array<KennitalaCompany> = kts.filter(isCompanyKennitala);
  const kerfises: Array<KennitalaTemporary> = kts.filter(isTempKennitala);
  type tp = Expect<Extends<KennitalaTemporary, KennitalaPerson>>;
  type pt = Expect<NotExtends<KennitalaPerson, KennitalaTemporary>>;

  const alwaysPerson = parseKennitala(ktPerson as KennitalaPerson);
  type v = Expect<Equals<typeof alwaysPerson, KennitalaDataPerson | undefined>>;
  const alwaysPerson2 = parseKennitala(ktPerson as KennitalaPerson, { robot: true });
  type v2 = Expect<Equals<typeof alwaysPerson2, KennitalaDataPerson<boolean>>>;
  const alwaysCompany = parseKennitala(ktCompany as KennitalaCompany);
  type v3 = Expect<Equals<typeof alwaysCompany, KennitalaDataCompany>>;

  /* eslint-enable @typescript-eslint/no-unused-vars */
}

// ===========================================================================
// Test Individual Functions

// Set timezone to something ahead of UTC to make sure tests don't depend on local time
process.env.TZ = 'Asia/Yangon';
// process.env.TZ = 'UTC'; // `bun test` uses the UTC TZ by default

describe('parseKennitala', () => {
  const dataKerfis = {
    value: ktKerfis as KennitalaPerson,
    type: 'person',
    robot: false,
    temporary: true,
    formatted: '812345-6793',
  } as const;

  const dataPerson = {
    value: ktPerson as KennitalaPerson,
    type: 'person',
    robot: false,
    formatted: '101275-5239',
  } as const;

  const dataCompany = {
    value: ktCompany as KennitalaCompany,
    type: 'company',
    robot: false,
    formatted: '500101-2880',
  } as const;

  const dataGervi = {
    value: ktGervi as KennitalaPerson,
    type: 'person',
    robot: true,
    formatted: '010130-7789',
  } as const;

  test('parses simple kennitala', () => {
    expect(parseKennitala(ktPerson)).toMatchObject(dataPerson);
    expect(parseKennitala(ktKerfis)).toMatchObject(dataKerfis);
    expect(parseKennitala(ktCompany)).toMatchObject(dataCompany);
    expect(parseKennitala(ktGervi)).toBeUndefined();
    expect(parseKennitala(ktInvalid1)).toBeUndefined();
    expect(parseKennitala(ktInvalid2)).toBeUndefined();
  });

  test('Treats empty (and falsy) input as invalid', () => {
    expect(parseKennitala('')).toBeUndefined();
    // @ts-expect-error  (testing invalid input)
    const bogusInput1: string = undefined;
    expect(parseKennitala(bogusInput1)).toBeUndefined();
    // @ts-expect-error  (testing invalid input)
    const bogusInput2: string = false;
    expect(parseKennitala(bogusInput2)).toBeUndefined();
  });

  test('Accepts kennitalas with predictable spaces and dashes', () => {
    expect(parseKennitala(kt_Person1)).toMatchObject(dataPerson);
    expect(parseKennitala(kt_Person1, { clean: 'careful' })).toMatchObject(dataPerson);
    expect(parseKennitala(kt_Person1_EnDash)).toMatchObject(dataPerson);
    expect(parseKennitala(kt_Kerfis)).toMatchObject(dataKerfis);
    expect(parseKennitala(kt_Company)).toMatchObject(dataCompany);
    expect(parseKennitala(kt_Company2)).toMatchObject(dataCompany);
  });

  {
    const prefix = 'Rejects kennitalas w. bad dates →';

    test(`${prefix} impossible person`, () => {
      expect(parseKennitala(ktPersonImpossible)).toBeUndefined();
    });
    test(`${prefix} strictDate impossible person`, () => {
      expect(parseKennitala(ktPersonImpossible, { strictDate: true })).toBeUndefined();
    });
    test(`${prefix} false positive person`, () => {
      expect(parseKennitala(ktPersonImpossSneaky)).toBeDefined();
    });
    test(`${prefix} strictDate false positive person`, () => {
      expect(parseKennitala(ktPersonImpossSneaky, { strictDate: true })).toBeUndefined();
    });
    test(`${prefix} impossible company`, () => {
      expect(parseKennitala(ktCompanyImpossible)).toBeUndefined();
    });
    test(`${prefix} strictDate impossible company`, () => {
      expect(parseKennitala(ktCompanyImpossible, { strictDate: true })).toBeUndefined();
    });
    test(`${prefix} false positive company`, () => {
      expect(parseKennitala(ktCompanyImpossSneaky)).toBeDefined();
    });
    test(`${prefix} strictDate false positive company`, () => {
      expect(parseKennitala(ktCompanyImpossSneaky, { strictDate: true })).toBeUndefined();
    });
    test(`${prefix} strictDate person`, () => {
      expect(parseKennitala(ktPerson, { strictDate: true })).toBeDefined();
    });
    test(`${prefix} strictDate company`, () => {
      expect(parseKennitala(ktCompany, { strictDate: true })).toBeDefined();
    });
  }

  test('Optionally rejects Kerfiskennitalas', () => {
    expect(parseKennitala(ktKerfis, { rejectTemporary: true })).toBeUndefined();
  });

  test('Optionally distinguishes between persons and companies', () => {
    expect(parseKennitala(ktPerson, { type: 'person' })).toMatchObject(dataPerson);
    expect(parseKennitala(ktKerfis, { type: 'person' })).toMatchObject(dataKerfis);
    expect(parseKennitala(ktCompany, { type: 'person' })).toBeUndefined();
    expect(parseKennitala(ktPerson, { type: 'company' })).toBeUndefined();
    expect(parseKennitala(ktKerfis, { type: 'company' })).toBeUndefined();
    expect(parseKennitala(ktCompany, { type: 'company' })).toMatchObject(dataCompany);
  });

  test('Invalid `type` flags are ignored', () => {
    // @ts-expect-error  (testing invalid input)
    const bogusType: KennitalaType = 'foo';
    expect(parseKennitala(ktPerson, { type: bogusType })).toMatchObject(dataPerson);
    expect(parseKennitala(ktCompany, { type: bogusType })).toMatchObject(dataCompany);
  });

  test('Optionally allows Gervimaður', () => {
    expect(parseKennitala(ktGervi, { robot: true })).toMatchObject(dataGervi);
    expect(parseKennitala(ktGervi, { robot: false })).toBeUndefined();
    // robot flag has no effect on other functions
    expect(parseKennitala(ktPerson, { robot: true })).toMatchObject(dataPerson);
    expect(parseKennitala(ktPerson, { robot: true, type: 'person' })).toMatchObject(
      dataPerson
    );
    expect(parseKennitala(ktKerfis, { robot: true })).toMatchObject(dataKerfis);
    expect(parseKennitala(ktPerson, { robot: true, type: 'company' })).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------

describe('isValidKennitala', () => {
  test('Validates simple kennitalas', () => {
    expect(isValidKennitala(ktPerson)).toBe(true);
    expect(isValidKennitala(ktKerfis)).toBe(true);
    expect(isValidKennitala(ktPersonAncient)).toBe(true); // accepts 19th century kennitalas
    expect(isValidKennitala(ktCompany)).toBe(true);
    expect(isValidKennitala(ktGervi)).toBe(false);
    expect(isValidKennitala(ktInvalid1)).toBe(false);
    expect(isValidKennitala(ktInvalid2)).toBe(false);
  });

  test('Treats empty (and falsy) input as invalid', () => {
    expect(isValidKennitala('')).toBe(false);
    // @ts-expect-error  (testing invalid input)
    expect(isValidKennitala(undefined)).toBe(false);
    // @ts-expect-error  (testing invalid input)
    expect(isValidKennitala(false)).toBe(false);
  });

  test('Performs no cleanup by default', () => {
    expect(isValidKennitala(kt_Person1)).toBe(false);
    expect(isValidKennitala(kt_Person1_EnDash)).toBe(false);
    expect(isValidKennitala(kt_Company)).toBe(false);
    expect(isValidKennitala(kt_Company2)).toBe(false);
  });

  test('Opionally performs careful cleanup', () => {
    const careful = { clean: 'careful' } as const;
    expect(isValidKennitala(kt_Person1, careful)).toBe(true);
    expect(isValidKennitala(kt_Person1_EnDash, careful)).toBe(true);
    expect(isValidKennitala(kt_Company, careful)).toBe(true);
    expect(isValidKennitala(kt_Company2, careful)).toBe(true);
  });

  test('Accepts malformed kennitals with aggressive clean option', () => {
    expect(isValidKennitala(kt_Malformed1)).toBe(false);
    const aggressive = { clean: 'aggressive' } as const;
    expect(isValidKennitala(kt_Malformed1, aggressive)).toBe(true);
    expect(isValidKennitala(`(kt. ${kt_Person1})`, aggressive)).toBe(true);
    expect(isValidKennitala(`(kt. ${kt_Person1} blöö)`, aggressive)).toBe(true);
    expect(isValidKennitala(`(kt. ${kt_Person1}${kt_Person1})`, aggressive)).toBe(false);
    // doesn't clean non-space, non-dash middle content
    expect(isValidKennitala(`(kt. ${kt_Person1} - s. 765 4321)`, aggressive)).toBe(false);
    // em-dash is not accepted
    expect(isValidKennitala(kt_Malformed2_EmDash, aggressive)).toBe(false);
  });

  test('Optionally rejects Kerfiskennitalas', () => {
    expect(isValidKennitala(ktKerfis, { rejectTemporary: true })).toBe(false);
  });

  test('Optionally distinguishes between persons and companies', () => {
    expect(isValidKennitala(ktPerson, { type: 'person' })).toBe(true);
    expect(isValidKennitala(ktKerfis, { type: 'person' })).toBe(true);
    expect(isValidKennitala(ktCompany, { type: 'person' })).toBe(false);
    expect(isValidKennitala(ktPerson, { type: 'company' })).toBe(false);
    expect(isValidKennitala(ktKerfis, { type: 'company' })).toBe(false);
    expect(isValidKennitala(ktCompany, { type: 'company' })).toBe(true);
  });

  test('Invalid `type` flags are ignored', () => {
    // @ts-expect-error  (testing invalid input)
    const bogusType: KennitalaType = 'foo';
    expect(isValidKennitala(ktPerson, { type: bogusType })).toBe(true);
    expect(isValidKennitala(ktCompany, { type: bogusType })).toBe(true);
  });

  test('Optionally allows Gervimaður', () => {
    expect(isValidKennitala(ktGervi, { robot: true })).toBe(true);
    expect(isValidKennitala(ktGervi, { robot: false })).toBe(false);
    // robot flag has no effect on other functions
    expect(isValidKennitala(ktPerson, { robot: true })).toBe(true);
    expect(isValidKennitala(ktPerson, { robot: true, type: 'person' })).toBe(true);
    expect(isValidKennitala(ktPerson, { robot: true, type: 'company' })).toBe(false);
  });
});

// ---------------------------------------------------------------------------

describe('isPersonKennitala, isCompanyKennitala, isTemporaryKennitala', () => {
  {
    const prefix = 'Correctly detects type of valid Kennitalas →';
    test(`${prefix} person is person`, () => {
      expect(isPersonKennitala(ktPerson as Kennitala)).toBe(true);
    });
    test(`${prefix} company is not person`, () => {
      expect(isPersonKennitala(ktCompany as Kennitala)).toBe(false);
    });
    test(`${prefix} kerfis is person`, () => {
      expect(isPersonKennitala(ktKerfis as Kennitala)).toBe(true);
    });
    test(`${prefix} company is company`, () => {
      expect(isCompanyKennitala(ktCompany as Kennitala)).toBe(true);
    });
    test(`${prefix} person is not company`, () => {
      expect(isCompanyKennitala(ktPerson as Kennitala)).toBe(false);
    });
    test(`${prefix} kerfis is not company`, () => {
      expect(isCompanyKennitala(ktKerfis as Kennitala)).toBe(false);
    });
    test(`${prefix} company is not kerfis`, () => {
      expect(isTempKennitala(ktCompany as Kennitala)).toBe(false);
    });
    test(`${prefix} person is not kerfis`, () => {
      expect(isTempKennitala(ktPerson as Kennitala)).toBe(false);
    });
    test(`${prefix} kerfis is kerfis`, () => {
      expect(isTempKennitala(ktKerfis as Kennitala)).toBe(true);
    });
  }

  {
    // @ts-expect-error  (testing invalid input)
    const startsWith2: Kennitala = '2foobar';
    // @ts-expect-error  (testing invalid input)
    const startsWith5: Kennitala = '5foobar';
    // @ts-expect-error  (testing invalid input)
    const startsWith8: Kennitala = '8foobar';
    // @ts-expect-error  (testing invalid input)
    const someWord: Kennitala = 'foobar';
    // @ts-expect-error  (testing invalid input)
    const spacedKtPerson: Kennitala = ` ${ktPerson}`;
    // @ts-expect-error  (testing invalid input)
    const spacedKtCompany: Kennitala = ` ${ktCompany}`;
    // @ts-expect-error  (testing invalid input)
    const spacedKtKerfis: Kennitala = ` ${ktKerfis}`;

    const prefix = 'Performs no trimming/parsing/validation on invalid strings →';
    test(`${prefix} isPerson (startsWith2)`, () => {
      expect(isPersonKennitala(startsWith2)).toBe(true);
    });
    test(`${prefix} isPerson (startsWith5)`, () => {
      expect(isPersonKennitala(startsWith5)).toBe(false);
    });
    test(`${prefix} isPerson (someWord)`, () => {
      expect(isPersonKennitala(someWord)).toBe(false);
    });
    test(`${prefix} isPerson (spacedKtPerson)`, () => {
      expect(isPersonKennitala(spacedKtPerson)).toBe(false);
    });

    test(`${prefix} isCompany (startsWith5)`, () => {
      expect(isCompanyKennitala(startsWith5)).toBe(true);
    });
    test(`${prefix} isCompany (startsWith2)`, () => {
      expect(isCompanyKennitala(startsWith2)).toBe(false);
    });
    test(`${prefix} isCompany (someWord)`, () => {
      expect(isCompanyKennitala(someWord)).toBe(false);
    });
    test(`${prefix} isCompany (spacedKtPerson)`, () => {
      expect(isCompanyKennitala(spacedKtCompany)).toBe(false);
    });

    test(`${prefix} isTemp (startsWith8)`, () => {
      expect(isTempKennitala(startsWith8)).toBe(true);
    });
    test(`${prefix} isTemp (spacedKtKerfis)`, () => {
      expect(isTempKennitala(spacedKtKerfis)).toBe(false);
    });
  }

  // Quick type tests
  if (false as boolean) {
    const ktTest = '' as Kennitala;
    if (isPersonKennitala(ktTest)) {
      type v = Expect<Equals<typeof ktTest, KennitalaPerson>>;
    }
    if (isCompanyKennitala(ktTest)) {
      type v = Expect<Equals<typeof ktTest, KennitalaCompany>>;
    }
  }
});

// ---------------------------------------------------------------------------

describe('cleanKennitalaCareful', () => {
  test('carefully cleans input', () => {
    expect(cleanKennitalaCareful(' 123456-7890')).toBe('1234567890');
    expect(cleanKennitalaCareful('123456 7890 ')).toBe('1234567890');
    expect(cleanKennitalaCareful(' 123456 - 7890')).toBe('1234567890');
    expect(cleanKennitalaCareful('123456 -7890')).toBe('1234567890');
    // Too much internal spacing
    expect(cleanKennitalaCareful(kt_Malformed3)).toBe(kt_Malformed3);
    // trims only
    expect(cleanKennitalaCareful(' abc ')).toBe('abc');
    expect(cleanKennitalaCareful('kt. 123456-7890')).toBe('kt. 123456-7890');
    expect(cleanKennitalaCareful(' 1234-567890')).toBe('1234-567890');
    expect(cleanKennitalaCareful('123 456-7890')).toBe('123 456-7890');
    expect(cleanKennitalaCareful(kt_Malformed2_EmDash)).toBe(kt_Malformed2_EmDash);
  });
});

// ---------------------------------------------------------------------------

describe('cleanKennitalaAggressive', () => {
  test('aggressively cleans input', () => {
    expect(cleanKennitalaAggressive(' 123456-7890')).toBe('1234567890');
    expect(cleanKennitalaAggressive('123456 7890 ')).toBe('1234567890');
    expect(cleanKennitalaAggressive(' 123456 - 7890')).toBe('1234567890');
    expect(cleanKennitalaAggressive('123456 -7890')).toBe('1234567890');

    expect(cleanKennitalaAggressive(' 12 34 56 - 78 90')).toBe('1234567890');
    expect(cleanKennitalaAggressive('1-2-3 4-5 6-7-8 9-0')).toBe('1234567890');

    expect(cleanKennitalaAggressive('(kt. 123456-7890)')).toBe('1234567890');
    //does not check for length
    expect(cleanKennitalaAggressive('(s. 765 4321) ')).toBe('7654321');
    // does not clean non-digits in the middle of the string
    expect(cleanKennitalaAggressive('(kt. 123456-7890, s. 765 4321) ')).toBe(
      '1234567890,s.7654321'
    );
    // em-dashes are not accepted
    expect(cleanKennitalaAggressive(kt_Malformed2_EmDash)).toBe(kt_Malformed2_EmDash);
  });
});

// ---------------------------------------------------------------------------

describe('formatKennitala', () => {
  test('formats a kennitala', () => {
    expect(formatKennitala('101275-5239 ')).toBe('101275-5239');
    expect(formatKennitala('1012755239')).toBe('101275-5239');
    expect(formatKennitala(' 5001012880 ')).toBe('500101-2880');
    expect(formatKennitala('500101 - 2880')).toBe('500101-2880');
    expect(formatKennitala(' 010130 7789')).toBe('010130-7789');
    expect(formatKennitala(kt_Malformed1)).toBe(kt_Malformed1);
    expect(formatKennitala(kt_Malformed2)).toBe(kt_Malformed2);
    expect(formatKennitala(kt_Malformed2_EmDash)).toBe(kt_Malformed2_EmDash);
  });
  test('accepts a custom separator', () => {
    expect(formatKennitala('1012755239', '–')).toBe('101275–5239');
    expect(formatKennitala('1012755239', ' ')).toBe('101275 5239');
  });
});

// ---------------------------------------------------------------------------

describe('getKennitalaBirthDate', () => {
  test('Exposes a birthdate function', () => {
    const p1BDay = getKennitalaBirthDate(ktPerson);
    expect(p1BDay?.toISOString().substring(0, 10)).toBe('1975-12-10');
    const pABDay = getKennitalaBirthDate(ktPersonAncient);
    expect(pABDay?.toISOString().substring(0, 10)).toBe('1875-12-10');
    const pRBDay = getKennitalaBirthDate(ktGervi);
    expect(pRBDay?.toISOString().substring(0, 10)).toBe('1930-01-01');
    const p2BDay = getKennitalaBirthDate(kt_Person1);
    expect(p2BDay?.toISOString().substring(0, 10)).toBe('1975-12-10');
    const cBDay = getKennitalaBirthDate(kt_Company);
    expect(cBDay?.toISOString().substring(0, 10)).toBe('2001-01-10');
    const iBDay = getKennitalaBirthDate(ktInvalid1);
    expect(iBDay?.toISOString().substring(0, 10)).toBe('2065-12-12'); // Kennitalas are not validated
    const i2BDay = getKennitalaBirthDate(kt_Malformed1);
    expect(i2BDay).toBeUndefined(); // Malformed digit-strings return undefined
    const i3BDay = getKennitalaBirthDate('bogus');
    expect(i3BDay).toBeUndefined(); // Bogus strings return undefined
    const tBDay = getKennitalaBirthDate(ktKerfis);
    expect(tBDay).toBeUndefined(); // Kerfiskenntala has no birthdate
    const n1BDay = getKennitalaBirthDate(ktPersonImpossible);
    expect(n1BDay).toBeUndefined(); // Impossible dates are rejected
    const n2BDay = getKennitalaBirthDate(ktPersonImpossSneaky);
    expect(n2BDay).toBeUndefined(); // Subtly impossible dates are rejected
  });
});

// ---------------------------------------------------------------------------

// test generateKennitala
describe('generateKennitala', () => {
  {
    const ktPers: KennitalaPerson = generateKennitala();
    const ktComp: KennitalaCompany = generateKennitala({ type: 'company' });
    const ktRobot: KennitalaPerson = generateKennitala({ robot: true });
    const ktTemp: KennitalaTemporary = generateKennitala({ temporary: true });

    const prefix = 'generates a valid kennitala →';
    test(`${prefix} basic person`, () => {
      expect(isValidKennitala(ktPers, { type: 'person', rejectTemporary: true })).toBe(
        true
      );
    });
    test(`${prefix} generates a different kennitala each time`, () => {
      expect(ktPers !== generateKennitala()).toBe(true);
    });
    test(`${prefix} basic company`, () => {
      expect(isValidKennitala(ktComp, { type: 'company' })).toBe(true);
    });
    test(`${prefix} basic robot`, () => {
      expect(parseKennitala(ktRobot, { robot: true }).robot).toBe(true);
    });
    test(`${prefix} generates a different robot each time`, () => {
      expect(
        ktRobot !== generateKennitala({ robot: true }) ||
          ktRobot !== generateKennitala({ robot: true }) ||
          ktRobot !== generateKennitala({ robot: true })
      ).toBe(true);
    });
    test(`${prefix} temporary kt`, () => {
      expect(parseKennitala(ktTemp)?.temporary).toBe(true);
    });
  }

  test('opts.type overrides opts.robot', () => {
    const ktComp1: KennitalaCompany = generateKennitala({
      type: 'company',
      robot: true,
    });
    expect(isValidKennitala(ktComp1, { type: 'company' })).toBe(true);
  });
  test('opts.type overrides opts.temporary', () => {
    const ktComp2: KennitalaCompany = generateKennitala({
      type: 'company',
      temporary: true,
    });
    expect(isValidKennitala(ktComp2, { type: 'company' })).toBe(true);
  });

  test('accepts a custom birthdate', () => {
    const kt1: KennitalaPerson = generateKennitala({ birthDate: new Date('2001-07-10') });
    expect(`${kt1.slice(0, 6)}___${kt1.slice(-1)}`).toBe('100701___0');
    const kt2: KennitalaPerson = generateKennitala({ birthDate: new Date('1870-02-23') });
    expect(`${kt2.slice(0, 6)}___${kt2.slice(-1)}`).toBe('230270___8');
    const kt3: KennitalaCompany = generateKennitala({
      birthDate: new Date('1999-02-23'),
      type: 'company',
    });
    expect(`${kt3.slice(0, 6)}___${kt3.slice(-1)}`).toBe('630299___9');
  });

  test('ignores birthdates for robots and temps', () => {
    const kt1: KennitalaPerson = generateKennitala({
      birthDate: new Date('2001-07-10'),
      robot: true,
    });
    expect(`${kt1.slice(0, 6)}___${kt1.slice(-1)}`).toBe('010130___9');
    const kt2: KennitalaTemporary = generateKennitala({
      birthDate: new Date('2001-07-10'),
      temporary: true,
    });
    expect(/^[89]/.test(kt2)).toBe(true);
  });

  test('ignores invalid birthDates', () => {
    const birthDate = new Date('bogus');
    expect(isValidKennitala(generateKennitala({ birthDate }))).toBe(true);
  });

  test('ignores far-future and ancient-past birthDates as invalid', () => {
    /** Replaces a Kennitala's random/checksum part with unserscores. */
    const makeKtStable = (kt: Kennitala) => `${kt.slice(0, 6)}___${kt.slice(-1)}`;

    const ktFuture = generateKennitala({ birthDate: new Date('2100-01-01') });
    const ktAncient = generateKennitala({ birthDate: new Date('1799-12-31') });
    const ktAncientCompany = generateKennitala({
      type: 'company',
      birthDate: new Date('1950-06-17'),
    });

    expect(makeKtStable(ktFuture) === '010100___1').toBe(false);
    expect(makeKtStable(ktAncient) === '311299___8').toBe(false);
    expect(makeKtStable(ktAncientCompany) === '170650___9').toBe(false);
  });
});
