# Change Log for `is-kennitala`

## Upcoming...

- ... <!-- Add new lines here. -->
- fix: Also handle companies "founded" on February 31st 1969

## 1.0.6

_2024-12-06_

- fix: Correctly handle companies "founded" on February 29th and 30th of 1969

## 1.0.5

_2024-11-14_

- perf: Speed up parsing of "Kerfiskenntala"s
- docs: Improve docs, fix typos, add `valibot` schema example

## 1.0.4

_2024-03-19_

- docs: Fix (and improve) README

## 1.0.3

_2024-01-01_

- perf: Make `parseKennitala` slightly faster and greatly reduce impact of the
  `.strictDate` parsing option
- perf: Make `getKennitalaBirthDate` faster

## 1.0.2

_2023-12-30_

- docs: Minor fixes/improvements to README and JSDoc comments

## 1.0.0 – 1.0.1

_2023-12-29_

- Initial release of
  [`@hugsmidjan/qj/kennitala`](https://github.com/hugsmidjan/qj/blob/ff4ed876/src/utils/kennitala.ts)
  as a standalone micro library, with the following changes/additions:
  - tests: Convert tests to use `bun:test`
  - docs: Add proper README, and trim JSDoc comments and link to README for
    details
  - feat: Simplify signature of `generateKennitala`
  - feat: Set 1969 as the lowest founding year for generated company
    kennitalas.
  - perf: Speed up the `KennitalaData.format` method
