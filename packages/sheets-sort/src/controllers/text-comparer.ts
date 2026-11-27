/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LOCALE_META, LocaleType } from '@univerjs/core';

export type TextComparer = (a: string, b: string) => number;
export type TextColumnComparer = (aPosition: number, bPosition: number) => number;

export interface IRegionTextComparer {
    compare: TextComparer;
    // The returned comparer is called only for rows that have a text value in this column.
    prepareColumn(textByRow: ReadonlyArray<string | undefined>): TextColumnComparer;
}

// Excel desktop places these symbols before digits, then letters. Word punctuation breaks ties.
const SYMBOL_ORDER = ' !"#$%&()*,./:;?@[\\]^_`{|}~+<=>';
const WORD_PUNCTUATION = /['-]/g;
const TEXT_UNITS = /[\p{L}\p{M}]+|[^\p{L}\p{M}]/gu;
const DIGIT = /^\p{Nd}/u;
const LETTER = /^[\p{L}\p{M}]/u;
const LETTER_RUN = /^[\p{L}\p{M}]+$/u;
const SIMPLE_ENGLISH_TEXT = /^[A-Za-z ]+$/;
const LATIN_WORDS = /(?:\p{Script=Latin}\p{M}*)+/gu;
const DEFAULT_LOCALE = LOCALE_META[LocaleType.EN_US].tag;
const collateLatinAccent = new Intl.Collator(DEFAULT_LOCALE, { sensitivity: 'accent' }).compare;

enum UnitKind {
    SYMBOL,
    DIGIT,
    LETTER,
}

interface ITextUnit {
    value: string;
    kind: UnitKind;
    primary: number;
    accent: number;
}

interface IWordPunctuation {
    offset: number;
    code: number;
}

interface IPreparedText {
    units: ITextUnit[];
    punctuation: readonly IWordPunctuation[];
}

type UnitComparer = (a: ITextUnit, b: ITextUnit) => number;
const EMPTY_PUNCTUATION: readonly IWordPunctuation[] = [];

function createUnit(value: string): ITextUnit {
    let kind = UnitKind.SYMBOL;
    if (DIGIT.test(value)) {
        kind = UnitKind.DIGIT;
    } else if (LETTER.test(value)) {
        kind = UnitKind.LETTER;
    }
    return { value, kind, primary: 0, accent: 0 };
}

function prepareText(value: string, getUnit: (unit: string) => ITextUnit): IPreparedText {
    let punctuation: IWordPunctuation[] | undefined;
    // Count punctuation positions consistently for canonically equivalent spellings.
    const stripped = value.normalize().replace(WORD_PUNCTUATION, (mark: string, offset: number) => {
        (punctuation ??= []).push({ offset, code: mark.charCodeAt(0) });
        return '';
    });
    return { units: (stripped.match(TEXT_UNITS) ?? []).map(getUnit), punctuation: punctuation ?? EMPTY_PUNCTUATION };
}

function compareUnits(a: ITextUnit, b: ITextUnit, collate: TextComparer): number {
    if (a.value === b.value) {
        return 0;
    }
    if (a.kind !== b.kind) {
        return a.kind - b.kind;
    }
    if (a.kind === UnitKind.SYMBOL) {
        const left = SYMBOL_ORDER.indexOf(a.value);
        const right = SYMBOL_ORDER.indexOf(b.value);
        const leftRank = left === -1 ? SYMBOL_ORDER.length : left;
        const rightRank = right === -1 ? SYMBOL_ORDER.length : right;
        return leftRank - rightRank || (a.value < b.value ? -1 : 1);
    }
    return collate(a.value, b.value);
}

function compareSequence(a: ITextUnit[], b: ITextUnit[], compare: UnitComparer): number {
    const length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
        const result = compare(a[i], b[i]);
        if (result !== 0) {
            return result;
        }
    }
    return a.length - b.length;
}

function comparePunctuation(a: readonly IWordPunctuation[], b: readonly IWordPunctuation[]): number {
    const length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
        // A mark later in an otherwise equal word sorts before a mark earlier in the word.
        const result = b[i].offset - a[i].offset || a[i].code - b[i].code;
        if (result !== 0) {
            return result;
        }
    }
    return a.length - b.length;
}

function compareText(a: IPreparedText, b: IPreparedText, primary: UnitComparer, accent: UnitComparer): number {
    return compareSequence(a.units, b.units, primary)
        || compareSequence(a.units, b.units, accent)
        || comparePunctuation(a.punctuation, b.punctuation);
}

function rankUnits(units: Iterable<ITextUnit>, primary: UnitComparer, accent: UnitComparer): void {
    const ordered = Array.from(units).sort((a, b) => primary(a, b) || accent(a, b));
    for (let i = 1; i < ordered.length; i++) {
        const previous = ordered[i - 1];
        const current = ordered[i];
        const differentBase = primary(previous, current) !== 0;
        current.primary = previous.primary + Number(differentBase);
        current.accent = previous.accent + Number(differentBase || accent(previous, current) !== 0);
    }
}

const comparePrimaryRank: UnitComparer = (a, b) => a.primary - b.primary;
const compareAccentRank: UnitComparer = (a, b) => a.accent - b.accent;

function compareRankedText(a: IPreparedText, b: IPreparedText): number {
    return a === b ? 0 : compareText(a, b, comparePrimaryRank, compareAccentRank);
}

function prepareUnitColumn(
    textByRow: ReadonlyArray<string | undefined>,
    values: ReadonlySet<string>,
    primary: UnitComparer,
    accent: UnitComparer
): TextColumnComparer {
    const units = new Map<string, ITextUnit>();
    const texts = new Map<string, IPreparedText>();
    const getUnit = (value: string) => {
        let unit = units.get(value);
        if (!unit) {
            unit = createUnit(value);
            units.set(value, unit);
        }
        return unit;
    };
    for (const value of values) {
        texts.set(value, prepareText(value, getUnit));
    }
    const keys = textByRow.map((text) => text === undefined ? undefined : texts.get(text));

    // Ranking pays off when many text values share the same units.
    if (units.size < values.size) {
        rankUnits(units.values(), primary, accent);
        return (a, b) => compareRankedText(keys[a]!, keys[b]!);
    }

    return (a, b) => {
        const left = keys[a]!;
        const right = keys[b]!;
        return left === right ? 0 : compareText(left, right, primary, accent);
    };
}

export function createRegionTextComparer(region: string): IRegionTextComparer {
    const locale = LOCALE_META[region as LocaleType]?.tag ?? region.replace(/^([a-z]{2,3})([A-Z]{2})$/, '$1-$2');
    let locales = [DEFAULT_LOCALE];
    try {
        // Include the default explicitly so an unsupported region cannot fall back to the host.
        locales = Intl.getCanonicalLocales([locale, DEFAULT_LOCALE]);
    } catch (error) {
        if (!(error instanceof RangeError)) {
            throw error;
        }
    }

    const primaryCollator = new Intl.Collator(locales, { sensitivity: 'base', numeric: false });
    const resolved = primaryCollator.resolvedOptions();
    const isDefaultEnglish = resolved.locale === DEFAULT_LOCALE && resolved.collation === 'default';
    const collatePrimary = primaryCollator.compare;
    const collateAccent = new Intl.Collator(locales, { sensitivity: 'accent', numeric: false }).compare;
    const primary: UnitComparer = (a, b) => compareUnits(a, b, collatePrimary);
    // ICU's Chinese collation orders pinyin tone marks before the plain Latin vowel.
    // Excel desktop sorts plain Latin spellings first while keeping the Han collation.
    const compareAccents: TextComparer = /^zh(?:-|$)/.test(resolved.locale)
        ? (a, b) => {
            const left = a.match(LATIN_WORDS)?.join(' ') ?? '';
            const right = b.match(LATIN_WORDS)?.join(' ') ?? '';
            return collateLatinAccent(left, right) || collateAccent(a, b);
        }
        : collateAccent;
    const accent: UnitComparer = (a, b) => compareUnits(a, b, compareAccents);
    const compare: TextComparer = (a, b) => a === b
        ? 0
        : compareText(prepareText(a, createUnit), prepareText(b, createUnit), primary, accent);

    return {
        compare,
        prepareColumn(textByRow) {
            const values = new Set<string>();
            let textCount = 0;
            let simpleEnglish = isDefaultEnglish;
            let singleLetterRun = true;
            for (const text of textByRow) {
                if (text === undefined) {
                    continue;
                }
                textCount++;
                if ((simpleEnglish || singleLetterRun) && !values.has(text)) {
                    simpleEnglish = simpleEnglish && SIMPLE_ENGLISH_TEXT.test(text);
                    singleLetterRun = singleLetterRun && LETTER_RUN.test(text);
                }
                values.add(text);
            }

            if (simpleEnglish) {
                // For ASCII English letters and spaces, folded UTF-16 order matches the text rules above.
                const keys = textByRow.map((text) => text?.toLowerCase());
                return (a, b) => {
                    const left = keys[a]!;
                    const right = keys[b]!;
                    if (left === right) {
                        return 0;
                    }
                    return left < right ? -1 : 1;
                };
            }

            if (singleLetterRun && values.size * 2 >= textCount) {
                // A single run can be compared directly when most spellings are distinct.
                const keys = textByRow.map((text) => text?.normalize());
                return (a, b) => {
                    const left = keys[a]!;
                    const right = keys[b]!;
                    return left === right ? 0 : collatePrimary(left, right) || compareAccents(left, right);
                };
            }

            return prepareUnitColumn(textByRow, values, primary, accent);
        },
    };
}
