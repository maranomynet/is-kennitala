declare const _KennitalaPerson__Brand: unique symbol;
/**
 * A valid 10-digit Kennitala string for a person.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#branded-kennitala-types
 */
export type KennitalaPerson = string & { [_KennitalaPerson__Brand]: true };

declare const _KennitalaCompany__Brand: unique symbol;
/**
 * A valid 10-digit Kennitala string for a person.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#branded-kennitala-types
 */
export type KennitalaCompany = string & { [_KennitalaCompany__Brand]: true };

/**
 * A valid 10-digit Kennitala string.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#branded-kennitala-types
 */
export type Kennitala = KennitalaPerson | KennitalaCompany;

declare const _KennitalaTemporary__Brand: unique symbol;
/**
 * A valid 10-digit Kennitala string for a person with a temporary "Kerfiskennitala".
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#branded-kennitala-types
 */
export type KennitalaTemporary = KennitalaPerson & { [_KennitalaTemporary__Brand]: true };

// ---------------------------------------------------------------------------

/**
 * The two types of kennitalas: "person" and "company".
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#type-kennitalatype
 */
export type KennitalaType = 'person' | 'company';

// ---------------------------------------------------------------------------

/**
 * Trims the string and then only removes spaces and/or a dash (or en-dash)
 * before the last four of the ten digits.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#cleankennitalacareful
 */
export const cleanKennitalaCareful = (value: string): string =>
  value.trim().replace(/^(\d{6})\s?[-–]?\s?(\d{4})$/, '$1$2');

// ---------------------------------------------------------------------------

/**
 * Aggressively strips away ALL spaces and dashes (or en-dashes) from the
 * string, as well as any trailing and leading non-digit gunk.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#cleankennitalaaggressive
 */
export const cleanKennitalaAggressive = (value: string): string =>
  value
    .replace(/^\D+/, '')
    .replace(/\D+$/, '')
    .replace(/[\s-–]/g, '');

// ---------------------------------------------------------------------------

const cleanIfKtShaped = (value: string): string | undefined => {
  const cleaned = cleanKennitalaCareful(value);
  return cleaned.length === 10 && !/\D/.test(cleaned) ? cleaned : undefined;
};

const format = (ktShaped: string, separator = '-') =>
  ktShaped.slice(0, 6) + separator + ktShaped.slice(6);

/**
 * Runs minimal cleanup on the input string and if it looks like a kennitala
 * then then inserts a nice separator (`'-'` by default) before the last four
 * digits.
 *
 * Falls back to returning the input untouched, if it isn't roughly "kennitala-shaped".
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#formatkennitala
 */
export const formatKennitala = (value: string, separator = '-') => {
  const cleaned = cleanIfKtShaped(value);
  if (!cleaned) {
    return value;
  }
  return format(cleaned, separator);
};

// ---------------------------------------------------------------------------

/**
 * Returns the (UTC) birth-date (or founding-date) of a roughly
 * "kennitala-shaped" string — **without** checking if it is a valid
 * `Kennitala`.
 *
 * It returns `undefined` for malformed (non-kennitala shaped) strings,
 * temporary "kerfiskennitalas" and kennitalas with nonsensical dates,
 * even if they're otherwise numerically valid.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#getkennitalabirthdate
 */
export const getKennitalaBirthDate = (value: string): Date | undefined => {
  const cleaned = cleanIfKtShaped(value);
  if (!cleaned || /^[89]/.test(cleaned)) {
    return;
  }
  const DD = String(parseInt(cleaned.slice(0, 2)) % 40).padStart(2, '0');
  const MM = cleaned.slice(2, 4);
  const CC = ((parseInt(cleaned.slice(9, 10)) + 2) % 10) + 18;
  const YY = cleaned.slice(4, 6);
  const ISODate = `${CC + YY}-${MM}-${DD}`;
  const birthDate = new Date(ISODate);
  if (isNaN(birthDate.getTime()) || !birthDate.toISOString().startsWith(ISODate)) {
    return;
  }
  return birthDate;
};

// ---------------------------------------------------------------------------

type KennitalaParsingOptions<
  KtType extends KennitalaType | undefined = KennitalaType,
  PossiblyRobot extends boolean = boolean
> = {
  /**
   * Limits the valdation to only the kennitalas of either
   * private "person", or a legal entity ("company").
   *
   * Default: `undefined` (allows both)
   */
  type?: KtType;
  /**
   * Set this flag to `true` if the parser should accept known
   * "Gervimaður" kennitalas (commonly used for mocking or systems-testing).
   *
   * Defaults to `false`.
   */
  robot?: PossiblyRobot;
  /**
   * Set this flag to `true` to reject short-term temporary kennitalas
   * ("kerfiskennitala") given to short-stay (or no-stay) individuals/workers.
   *
   * Defaults to `false`
   *
   * BTW, Rationale for this "on by default" behavior:
   * - "Kerfiskennitalas" are, by definition, **valid** kennitalas.
   * - These are kennitalas of actual people, not some fake "Gervimaður".
   * - This is a low-stakes library, with the simple purpose of catching
   *   obvious mistakes and show error messages fast.
   * - Any real-stakes filtering (including for age, etc.) should/must occur
   *   in the next step anyway.
   */
  rejectTemporary?: boolean;
  /**
   * Controls how much to clean up the input string before parsing it.
   *
   * - `"aggressive"` mode strips away ALL spaces and dashes, and throws away any
   * leading/trailing gunk.
   *
   * - Default is `"careful"` mode, which performs only minimal cleaning on the
   * incoming string ...trimming it and then removing a space and/or dash
   * right before the last four of the ten digits.
   * - `false`/`"none"` instructs the parser to perform no cleanup whatsoever,
   * not even trimming.
   */
  clean?: 'aggressive' | 'careful' | 'none' | false;
  /**
   * Set this flag to `true` to opt into a slower, but more perfect
   * check for valid dates in permanent (non-"Kerfiskennitala") kennitalas.
   *
   * Defaults to `false` — which may result in the occational false-positive
   * on values starting with something subtly impossible like "3102…"
   * (Feb. 31st).
   */
  strictDate?: boolean;
};

/**
 * The data object returned by `parseKennitala()` if the input was a person
 * (non-company) kennitala.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#type-kennitaladata
 */
export type KennitalaDataPerson<PossiblyRobot extends boolean = false> = {
  /** The plain, cleaned-up 10 digit kennitala string */
  value: KennitalaPerson;
  /** The type of kennitala  */
  type: 'person';
  /** Indicates if the kennitala is a "Gervimaður" — i.e. a fake/testing kennitala */
  robot: PossiblyRobot extends false ? false : boolean;
  /** Indicates if the kennitala is a temporary "Kerfiskennitala" */
  temporary?: true;
  /** Pretty-formatted version of the kennitala with a dash before the last four digits */
  formatted: string;
  toString(): string;
};

/**
 * The data object returned by `parseKennitala()` if the input was a company
 * kennitala.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#type-kennitaladata
 */
export type KennitalaDataCompany = {
  /** The plain, cleaned-up 10 digit kennitala string */
  value: KennitalaCompany;
  /** The type of kennitala  */
  type: 'company';
  /** Indicates if the kennitala is a "Gervimaður" — i.e. a fake/testing kennitala */
  robot: false;
  /** Indicates if the kennitala is a temporary "Kerfiskennitala" */
  temporary?: never;
  /** Pretty-formatted version of the kennitala with a dash before the last four digits */
  formatted: string;
  toString(): string;
};

/**
 * This is type of the data object returned by `parseKennitala()`.
 *
 * It contains the cleaned-up (and branded) kennitala value, as well as
 * information about it's type and other properties.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#type-kennitaladata
 */
export type KennitalaData<
  KtType extends KennitalaType = KennitalaType,
  PossiblyRobot extends boolean = boolean
> = (KennitalaDataPerson<PossiblyRobot> | KennitalaDataCompany) & { type: KtType };

const magic = [3, 2, 7, 6, 5, 4, 3, 2, 1];
const robotKtNums = [
  212, 220, 239, 247, 255, 263, 271, 298, 301, 336, 433, 492, 506, 778,
];
let _robotKtRe: RegExp | undefined;
const isRobotKt = (value: string) => {
  if (!_robotKtRe) {
    _robotKtRe = new RegExp(`010130(${robotKtNums.join('|')})9`);
  }
  return _robotKtRe.test(value);
};

const validTypes: Record<KennitalaType, 1> = { person: 1, company: 1 };

function toString(this: { value: string }) {
  return this.value;
}

const converters = (value: string) => ({
  toString,
  get formatted() {
    return format(value);
  },
});

/**
 * Parses a string value to see if may be a technically valid kennitala,
 * and if so, it returns a data object with the cleaned up value
 * along with some meta-data and pretty-formatted version.
 *
 * If the parsing/validation fails, it simply returns `undefined`.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#parsekennitala
 */
export function parseKennitala(
  // This is here just to trick TS into providing full IntelliSense
  // auto-complete for `KennitalaOptions.type` values. Ack!
  value: '',
  opt?: KennitalaParsingOptions
): undefined;
export function parseKennitala(
  kt: KennitalaCompany,
  opt?: KennitalaParsingOptions<'company'>
): KennitalaDataCompany;
export function parseKennitala<PossiblyRobot extends boolean = false>(
  kt: KennitalaPerson,
  opt?: KennitalaParsingOptions<'person', PossiblyRobot>
): PossiblyRobot extends false
  ? undefined | KennitalaDataPerson
  : KennitalaDataPerson<boolean>;
export function parseKennitala<
  KtType extends KennitalaType,
  PossiblyRobot extends boolean = false
>(
  value: string,
  opts?: KennitalaParsingOptions<KtType, PossiblyRobot>
): KennitalaData<KtType, PossiblyRobot> | undefined;

// eslint-disable-next-line complexity
export function parseKennitala<
  KtType extends KennitalaType,
  PossiblyRobot extends boolean = true
>(
  value: string,
  opts?: KennitalaParsingOptions<KtType, PossiblyRobot>
): KennitalaData<KtType, PossiblyRobot> | undefined {
  opts = opts || {};
  if (!value) {
    return;
  }
  value =
    opts.clean === 'none' || opts.clean === false
      ? value
      : opts.clean === 'aggressive'
      ? cleanKennitalaAggressive(value)
      : cleanKennitalaCareful(value);

  if (value.length !== 10 || /\D/.test(value)) {
    return;
  }
  if (/^[89]/.test(value) && !opts.rejectTemporary && opts.type !== 'company') {
    /*
      Skráning í kerfiskennitöluskrá er eingöngu fyrir einstaklinga sem
      dvelja skemur en 3-6 mánuði á Íslandi eða munu ekki dvelja hér á landi.
      [Þær] samanstanda af tíu tölustöfum og byrja ávallt á 8 eða 9
      og hinar tölurnar verða tilviljanakenndar.
      https://www.skra.is/folk/eg-i-thjodskra/um-kennitolur/um-kerfiskennitolur/
    */
    return {
      value,
      type: 'person',
      robot: false,
      temporary: true,
      ...converters(value),
    } as KennitalaData<KtType, PossiblyRobot>;
  }

  // Quickly weed out obviously non-date kennitalas
  // (Example of one such checkSum-valid but nonsensical kennitala: "3368492689")
  // Here we trade a few false positives for speed:
  // A value starting with "310290..." (Feb. 31st) might pass
  if (!/^(?:[012456]\d|[37][01])(?:0\d|1[012]).+[890]$/.test(value)) {
    return;
  }
  // optionally perform slower, more rigorous date parsing
  if (opts.strictDate && !getKennitalaBirthDate(value)) {
    return;
  }

  const robot = isRobotKt(value);
  if (robot && !opts.robot) {
    return;
  }
  let checkSum = 0;
  for (let i = 0, len = magic.length; i < len; i++) {
    checkSum += magic[i]! * parseInt(value[i]!);
  }
  if (checkSum % 11) {
    return;
  }
  const type: KennitalaType = value[0]! > '3' ? 'company' : 'person';
  const optType = opts.type;
  if (optType && optType in validTypes && optType !== type) {
    return;
  }

  return {
    value,
    type,
    robot,
    ...converters(value),
  } as KennitalaData<KtType, PossiblyRobot>;
}

// ---------------------------------------------------------------------------

/**
 * Runs the input through `parseKennitala` and returns `true` if the parsing
 * was successful.
 *
 * Options are the same as for `parseKennitala`, except that `clean` option
 * defaults to `"none"`.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#isvalidkennitala
 */
export function isValidKennitala(
  // This is here just to trick TS into providing full IntelliSense
  // auto-complete for `KennitalaOptions` values. Ack!
  value: '',
  opts: KennitalaParsingOptions
): false;
export function isValidKennitala(
  value: string,
  opts: KennitalaParsingOptions & { type: 'person'; clean?: 'none' | false }
): value is KennitalaPerson;
export function isValidKennitala(
  value: string,
  opts: KennitalaParsingOptions & { type: 'company'; clean?: 'none' | false }
): value is KennitalaCompany;
export function isValidKennitala<O extends { clean?: 'none' | false }>(
  value: string,
  opts?: KennitalaParsingOptions & { clean?: 'none' | false }
): value is Kennitala;
export function isValidKennitala(value: string, opts?: KennitalaParsingOptions): boolean;

export function isValidKennitala(value: string, opts?: KennitalaParsingOptions): boolean {
  return !!parseKennitala(value, {
    ...opts,
    // make "clean: false" the default when validating
    clean: opts?.clean || false,
  });
}

// ---------------------------------------------------------------------------

/**
 * Quickly detects if an already parsed input `Kennitala` is `KennitalaPerson`.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#kennitala-discriminators
 */
export const isPersonKennitala = (kennitala: Kennitala): kennitala is KennitalaPerson =>
  // Temporary "kerfiskenntalas" for people start with 8 or 9
  /^[012389]/.test(kennitala);

/**
 * Quickly detects if an already parsed input `Kennitala` is `KennitalaCompany`.
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#kennitala-discriminators
 */
export const isCompanyKennitala = (kennitala: Kennitala): kennitala is KennitalaCompany =>
  /^[4567]/.test(kennitala);

/**
 * Quickly detects if an already parsed input `Kennitala` is a (temporary)
 * "kerfiskennitala" (a subset of valid `KennitalaPerson`s).
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#kennitala-discriminators
 */
export const isTempKennitala = (kennitala: Kennitala): kennitala is KennitalaTemporary =>
  /^[89]/.test(kennitala);

// ---------------------------------------------------------------------------

type GenerateOptions = {
  type?: KennitalaType;
  birthDate?: Date;
  robot?: boolean;
  temporary?: boolean;
};

/**
 * Generates a technically valid `Kennitala`. (Possibly a real one!)
 *
 * @see https://github.com/maranomynet/is-kennitala/tree/v1#generatekennitala
 */
export function generateKennitala(
  opts: GenerateOptions & { type: 'company' }
): KennitalaCompany;
export function generateKennitala(
  opts: GenerateOptions & { temporary: true }
): KennitalaTemporary;
export function generateKennitala(
  opts?: GenerateOptions & { type?: 'person' }
): KennitalaPerson;
export function generateKennitala(opts?: GenerateOptions): Kennitala;

// eslint-disable-next-line complexity
export function generateKennitala(opts: GenerateOptions = {}): Kennitala {
  const { random, floor } = Math;
  const isCompany = opts.type === 'company';
  if (!isCompany) {
    if (opts.temporary) {
      const Head = String(8 + (random() > 0.5 ? 1 : 0));
      const Tail = String(floor(random() * 1000000000)).padStart(9, '0');
      return (Head + Tail) as KennitalaTemporary;
    }
    if (opts.robot) {
      const RRR = robotKtNums[floor(random() * robotKtNums.length)];
      return `010130${RRR}9` as KennitalaPerson;
    }
  }

  let bDay = opts.birthDate;
  if (
    !bDay ||
    isNaN(bDay.getTime()) ||
    // Treat dates outside of the 1800-2099 range as invalid.
    // Real company kennitalas happen to have a lower year-boundry of 1969.
    bDay < new Date(isCompany ? '1969-01-01' : '1800-01-01') ||
    bDay >= new Date('2100-01-01')
  ) {
    const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const maxAge = (isCompany ? 50 : 100) * YEAR_MS;
    bDay = new Date(Date.now() - floor(random() * maxAge));
  }

  const dateModifier = isCompany ? 40 : 0;
  // Build the predictable segments of the kennitala
  const DDMMYY =
    String(bDay.getUTCDate() + dateModifier).padStart(2, '0') +
    String(bDay.getUTCMonth() + 1).padStart(2, '0') +
    String(bDay.getUTCFullYear() % 100).padStart(2, '0');
  const C = String(bDay.getUTCFullYear())[1];

  let kt = '';

  // Brute-force search for a checksum digit that passes validation.
  // NOTE: This is slow, but `generateKennitala` is generally not used
  // in performance-critical code-paths.
  // Open a GitHub issue if you need a faster implementation.
  while (true as boolean) {
    let x = 0; // Checksum digit
    const RR = isCompany
      ? String(floor(100 * random()))
      : String(floor(20 + 80 * random()));
    while (x < 10) {
      kt = DDMMYY + RR + x + C;
      if (isValidKennitala(kt, { type: opts.type })) {
        return kt;
      }
      x++;
    }
  }
  return kt as Kennitala;
}
