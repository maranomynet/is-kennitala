# `is-kennitala`

Small, robust and type-safe Icelandic kennitala parsing/handling library.

(BTW: "Kennitalas" are the Icelandic national identification numbers assigned
to both private individuals and legal entities).

```
npm install is-kennitala
```

<!-- prettier-ignore-start -->

- [Features](#features)
- [API/Methods](#apimethods)
  - [`parseKennitala`](#parsekennitala)
    - [`KennitalaParsingOptions`](#kennitalaparsingoptions)
  - [`isValidKennitala`](#isvalidkennitala)
  - [Kennitala discriminators](#kennitala-discriminators)
  - [`getKennitalaBirthDate`](#getkennitalabirthdate)
  - [`formatKennitala`](#formatkennitala)
  - [`cleanKennitalaCareful`](#cleankennitalacareful)
  - [`cleanKennitalaAggressive`](#cleankennitalaaggressive)
  - [`generateKennitala`](#generatekennitala)
- [Exported Types](#exported-types)
  - [Branded `Kennitala` Types](#branded-kennitala-types)
    - [Zod validation example](#zod-validation-example)
  - [type `KennitalaType`](#type-kennitalatype)
  - [type `KennitalaData`](#type-kennitaladata)
- [Contributing](#contributing)
- [Change Log](#change-log)

<!-- prettier-ignore-end -->

---

## Features

This library aims to be a best-of-breed JavaScript/TypeScript library for
parsing and handling Icelandic kennitalas.

It was written after careful review of the existing npm packages.

It's philosophy and main features are:

- Be tiny and fast/efficient and tree-shake incredibly well.
- Make a clear distinction between "validating" and "parsing". The parser
  returns a helpful data object with a cleaned kennitala "value".
- Make the "input-cleanup"/"gunk-acceptance" levels sensibly _careful_ by
  default, with optional aggressiveness.
- Provide good developer ergonomics, while promoting good validation
  practices.
- Provide has first-class TypeScript signatures (including "branded types",
  which happen to play very nicely with `zod`, etc.)
- Provide good JSDoc comments for inline IDE help, with `@see` links to this
  readme
- Build on a suite of extensive unit tests.
- Strike a sensible balance between speed and correctness, but provide ways to
  tilt towards more correctness.

---

## API/Methods

---

### `parseKennitala`

**Syntax:**
`parseKennitala(value: string, opts?: KennitalaParsingOptions): KennitalaData | undefined`

Parses a string value to see if may be a technically valid kennitala, and if
so, it returns a [`KennitalaData`](#type-kennitaladata) object with the
cleaned up (and [branded](#branded-kennitala-types)) kennitala value along
with some basic meta-data and a pretty-formatted version.

If the parsing/validation fails, it simply returns `undefined`.

```ts
import { parseKennitala } from 'is-kennitala';

const personKtInput = ' 081153-6049';
const companyKtInput = '530269 – 7609 ';
const robotKtInput = ' 010130-2989';

// Does some minor trimming/cleaning:
const ktData = parseKennitala(personKtInput);
console.log(ktData.value); // '0101302989'
console.log(ktData.type); // 'person'
console.log(ktData.robot); // true
console.log(ktData.temporary); // false
console.log(ktData.formatted); // '010130-2989'

const ktData1 = parseKennitala(companyKtInput);
console.log(ktData1.value); // '5302697609'
console.log(ktData1.type); // 'company'
// etc...

// This input is too dirty:
const ktData2 = parseKennitala('kt.' + personKtInput);
// Returns: undefined

// Opt-in to a lot more aggressive cleaning:
const ktData3 = parseKennitala('kt. 08 11 53 - 6049 yo!', {
  clean: 'aggressive',
});
// Returns: `KennitalaData` (same as `ktData` above)

// Reject company kennitalas:
const ktData4 = parseKennitala(companyKtInput, { type: 'person' });
// Returns: undefined

// Reject personal kennitalas:
const ktData4 = parseKennitala(personKtInput, { type: 'company' });
// Returns: undefined

// Reject robot ("Gervimaður") kennitalas by default:
const ktData5 = parseKennitala('010130-2989');
// Returns: undefined

// Opt-in to accepting robot kennitalas:
const ktData6 = parseKennitala('010130-2989', { robot: true });
// Returns: `KennitalaData`

// Opt-out of accepting temporary "Kerfiskennitala":
const ktData7 = parseKennitala('8123456793', { rejectTemporary: true });
// Returns: undefined
```

#### `KennitalaParsingOptions`

**`type?: KennitalaType`**

Set this to `"person"` or `"company"` to limit the check to only either
private persons or legal entities.

Default: `undefined` (accepts both)

**`robot?: boolean`**

Set this to `true` if the parser should accept known "Gervimaður" kennitalas
(only used for mocking or systems-testing).

Default: `false`

**`rejectTemporary?: boolean`**

Set this to `true` to reject short-term temporary kennitalas
("kerfiskennitala") given to short-stay (or no-stay) individuals/workers.

Default: `false`

Why are temporary kennitalas accepted by default?

- "Kerfiskennitalas" are, by definition, **valid** kennitalas.
- These are kennitalas of actual people, not some fake "Gervimaður".
- This is a low-stakes library, with the simple purpose of catching obvious
  mistakes and show error messages fast.
- Any real-stakes filtering (including for age, etc.) should/must occur in the
  next step anyway.

**`clean?: 'aggressive' | 'careful' | 'none' | false;`**

Controls how much to clean up the input string before parsing it.

- [`"aggressive"`](#cleankennitalaaggressive) mode strips away ALL spaces and
  dashes, and throws away any leading/trailing gunk.
- `false`/`"none"` instructs the parser to perform no cleanup whatsoever, not
  even trimming.
- Default is [`"careful"`](#cleankennitalacareful) mode, which performs only
  minimal cleaning on the incoming string ...trimming it and then removing a
  space and/or dash right before the last four of the ten digits.

**`strictDate?: boolean`**

Set this flag to `true` to opt into a slower, but more perfect check for valid
dates in permanent (non-"Kerfiskennitala") kennitalas.

Defaults to `false` — which may result in the occational false-positive on
values starting with something impossible like "3102…" (Feb. 31st)

---

### `isValidKennitala`

**Syntax:**
`isValidKennitala(value: string, opts?: KennitalaParsingOptions): boolean`

This shorthand function runs the input through
[`parseKennitala`](#parsekennitala) and returns `true` if the parsing was
successful.

Options are the same as for `parseKennitala`, except that `clean` option
defaults to `"none"`. This allows using the `isValidKennitala` method as a
type-guard and reduces the risk of accidental false-positives and
over-confidence in the string input.

```ts
import { isValidKennitala } from 'is-kennitala';

const personKtInput: string = '0811536049';
const companyKtInput: string = '5302697609';
const robotKtInput: string = '0101302989';

if (isValidKennitala(personKtInput)) {
  // personKtInput is now typed as `Kennitala`
  const kennitala: Kennitala = personKtInput;
}

isValidKennitala(companyKtInput); // true
isValidKennitala(companyKtInput, { type: 'person' }); // false

isValidKennitala(robotKtInput); // false
isValidKennitala(robotKtInput, { robot: true }); // true
// etc...
```

**NOTE** that more often than not, you'll want to use `parseKennitala`
instead, to get the cleaned-up, branded value and other meta-data goodies.

---

### Kennitala discriminators

The library also exports a set of fast type-guarding functions for valid
kennitalas: `isPersonKennitala`, `isCompanyKennitala`, `isTempKennitala`

All of these functions assume that their input is already validated as
`Kennitala` They perform no internal validation and are therefore insanely
fast — but unreliable if coerced to process random strings.

```ts
import {
  isPersonKennitala,
  isCompanyKennitala,
  isTempKennitala,
} from 'is-kennitala';

declare const allKennitalas: Array<Kennitala>;

const personKennitalas: Array<KennitalaPerson> =
  allKennitalas.filter(isPersonKennitala);
const companyKennitalas: Array<KennitalaCompany> =
  allKennitalas.filter(isCompanyKennitala);
const temporaryKennitalas: Array<KennitalaTemporary> =
  personKennitalas.filter(isTempKennitala);
```

To safely check if a plain, non-validated `string` input is a certain type of
kennitala, use `parseKennitala` and check the `.type` of the retured data
object.

**Example:** Instead of `isPersonKennitala(someString)` do:

```ts
cons res = parseKennitala(someString);
const isPerson = !!res && res.type === 'person';
```

...or...

```ts
const res = parseKennitala(someString, { type: 'person' });
const isPerson = !!res;
```

That way you also get a cleaned-up version of the kennitala, and other
goodies.

---

### `getKennitalaBirthDate`

**Syntax:** `getKennitalaBirthDate(value: string): Date | undefined`

Returns the (UTC) birth-date (or founding-date) of a roughly
"kennitala-shaped" string — **without** checking if it is a valid `Kennitala`.

It returns `undefined` for malformed (non-kennitala shaped) strings, temporary
"kerfiskennitalas" and kennitalas with nonsensical dates, even if they're
otherwise numerically valid.

```ts
import { getKennitalaBirthDate } from 'is-kennitala';

// Kennitala of a person
const birthDate = getKennitalaBirthDate('0101302989');
// Returns: new Date(1930-01-01)

// The company kennitala of Reykjavík City
const birthDate = getKennitalaBirthDate(' 530269–7609 ');
// Returns: new Date(1969-02-13)
// Note how company kennitalas are unreliable for Very Old™ legal entities.

// Temporary "kerfiskennitala"
getKennitalaBirthDate('8123456793');
// Returns: undefined

// Nonsense inputs return undefined
getKennitalaBirthDate('Not a kennitala!'); // undefined
getKennitalaBirthDate('123456-7890'); // undefined
getKennitalaBirthDate(''); // undefined
```

---

### `formatKennitala`

**Syntax:** `formatKennitala(value: string, separator?: string): string`

Runs [minimal cleanup](#cleankennitalacareful) on the input string and if it
looks rougly like a kennitala then then inserts a nice separator (`'-'` by
default) before the last four digits.

It falls back to returning the input untouched.

```ts
import { formatKennitala } from 'is-kennitala';

formatKennitala('1234567890'); // '123456-7890'
formatKennitala(' 123456-7890\n'); // '123456-7890'
formatKennitala('123456 - 7890'); // '123456-7890'

// not kennitala-shaped, returned unchanged:
formatKennitala('1234 567890'); // '1234 567890'
formatKennitala('12345 and 67890  '); // '12345 and 67890  '
formatKennitala('123456789012345'); // '123456789012345'
```

---

### `cleanKennitalaCareful`

**Syntax:** `cleanKennitalaCareful(value: string): string`

Trims the string and then only removes spaces and/or a dash (or en-dash)
before the last four of the ten digits.

This lowers the chance of false-positives, when the result is
parsed/validated, but still allows for some flexibility in the input.

Defaults to returning the (trimmed) original string, if the pattern doesn't
match.

```ts
import { cleanKennitalaCareful } from 'is-kennitala';

// Cleaned:
cleanKennitalaCareful(' 123456-7890'); // Returns: '1234567890'
cleanKennitalaCareful('123456 7890 '); // Returns: '1234567890'
cleanKennitalaCareful(' 123456 - 7890'); // Returns: '1234567890'
cleanKennitalaCareful('123456 -7890'); // Returns: '1234567890'

// Only trimmed as the input is not "kennitala-shaped" enough:
cleanKennitalaCareful(' abc '); // Returns: 'abc'
cleanKennitalaCareful(' 123456 - 7890'); // Returns: '123456 - 7890'
cleanKennitalaCareful('kt. 123456-7890'); // Returns: 'kt. 123456-7890'
cleanKennitalaCareful(' 1234-567890'); // Returns: '1234-567890'
cleanKennitalaCareful('123 456-7890'); // Returns: '123 456-7890'
```

---

### `cleanKennitalaAggressive`

**Syntax:** `cleanKennitalaAggressive(value: string): string`

Aggressively strips away ALL spaces and dashes (or en-dashes) from the string,
as well as any trailing and leading non-digit gunk.

Returns whatever is left.

Use with caution, as this level of aggression increases the chances of
false-positives during parsing.

```ts
import { cleanKennitalaAggressive } from 'is-kennitala';

// Aggressive cleaning is aggressive:
cleanKennitalaAggressive('  12 34 56 - 78 90'); // Returns: '1234567890'
cleanKennitalaAggressive('1-2-3 4-5 6-7-8 9-0'); // Returns: '1234567890'

// Trailing/leading non-digit content is removed:
cleanKennitalaAggressive(' abc '); // Returns: ''
cleanKennitalaAggressive('(kt. 123456-7890)'); // Returns: '1234567890'
cleanKennitalaAggressive('(s. 765 4321) '); // Returns: '7654321'

// Non-digit/-space/-dash content in the middle is left in:
cleanKennitalaAggressive('(kt. 123456-7890, tel. 765 4321) ');
// Returns: '1234567890,tel.7654321'
cleanKennitalaAggressive('(tel. 123-4567, 765-4321)');
// Returns: '1234567,7654321'
```

---

### `generateKennitala`

**Syntax:**
`generateKennitala(opts?: { type?: KennitalaType; birthDate?: Date; robot?: boolean; temporary?: boolean;}): Kennitala`

Generates a technically valid `Kennitala`. (Possibly a real one!)

Defaults to making a `KennitalaPerson`, unless `opts.type` is set to
`"company"`.

Picks a birth/founding date at random, unless a valid `opts.birthDate` is
provided.

However, `opts.birthDate` is ignored when generating `robot` and `temporary`
kennitalas.

```ts
import { generateKennitala } from 'is-kennitala';

const kt1: KennitalaPerson = generateKennitala();
const kt2: KennitalaPerson = generateKennitala({
  birthDate: new Date('1980-01-01'), // specific birth date
});
const kt5: KennitalaPerson = generateKennitala({ robot: true });

const kt3: KennitalaCompany = generateKennitala({ type: 'company' });
const kt4: KennitalaCompany = generateKennitala({
  type: 'company',
  birthDate: new Date('2005-06-17'), // specific founding date
});

const kt6: KennitalaTemporary = generateKennitala({ temporary: true });
```

---

## Exported Types

---

### Branded `Kennitala` Types

This library exports a set of branded types for parsed/validated kennitala
string values.

These are useful to ensure that a given string value has been parsed by this
library.

```ts
import type {
  Kennitala, // Any valid kennitala
  KennitalaCompany,
  KennitalaPerson, // includes KennitalaTemporary
  KennitalaTemporary, // Temporary kennitala (for short-term workers)
} from 'is-kennitala';

interface Customer {
  kennitala: Kennitala;
  name: string;
  email: string;
  // ...other props
}

interface Inidivdual extends Customer {
  kennitala: KennitalaPerson;
}
interface Business extends Customer {
  kennitala: KennitalaCompany;
}

const getIndividual = (kt: KennitalaPerson): Promise<Inidivdual> => {
  // ...
};
const getBusiness = (kt: KennitalaCompany): Promise<Business> => {
  // ...
};
```

If you have APIs that you trust to return validated kennitala fields, you can
cast them to the branded types, before passing them around your application.
Example:

```ts
import type { KennitalaPerson } from 'is-kennitala';

const mapAPIIndividual = (apiResult: APIIndividual): Individual => {
  const { kt, fullName, emailAddress /* other props */ } = apiResult;
  return {
    kennitala: kt as KennitalaPerson,
    name: fullName,
    email: emailAddress,
    // ...map other props
  };
};
```

#### Zod validation example

Here's an example of how `parseKennitala` can be used in a `zod` transform to
return the branded types above.

```ts
import { z } from 'zod';
import { parseKennitala } from 'is-kennitala';

const kennitalaSchema = z
  .string()
  .transform((value: string, ctx: z.RefinementCtx) => {
    const kennitala = parseKennitala(value /*, options */);
    if (!kennitala) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Not a valid kennitala',
      });
      return z.NEVER;
    }
    return kennitala.value; // branded string value
  });
```

---

### type `KennitalaType`

Union of the two main types of kennitalas: `"person"` for private persons, and
`"company"` for legal entities.

Used in `type` options of `parseKennitala()` and `isValidKennitala()`.

```ts
import type { KennitalaType } from 'is-kennitala';

const ktType: KennitalaType = 'person';
```

---

### type `KennitalaData`

This is type of the data object returned by the
[`parseKennitala()`](#parsekennitala) method.

It contains the cleaned-up (and branded) kennitala value, as well as
information about it's type and other properties.

```ts
import type { KennitalaData } from 'is-kennitala';

const logKennitalaProps = (data: KennitalaData) => {
  console.log(data.value); // Branded string type
  console.log(data.formatted); // pretty-printed version of the kennitala
  console.log(data.type); // "person" or "company"
  console.log(data.robot); // boolean
  console.log(data.temporary); // boolean (if type is "person")
};
```

The library also exports more narrow types `KennitalaDataPerson` and
`KennitalaDataCompany`, with discriminated values for the `type`, `robot` and
`temporary` properties.

```ts
import type { KennitalaDataPerson, KennitalaDataCompany } from 'is-kennitala';
```

The union of these two types forms the broader `KennitalaData` type.

---

## Contributing

This project uses the [Bun runtime](https://bun.sh) for development (tests,
build, etc.)

PRs are welcoms!

---

## Change Log

See [CHANGELOG.md](./CHANGELOG.md)
