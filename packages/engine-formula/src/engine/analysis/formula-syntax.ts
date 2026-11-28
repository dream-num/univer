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

import type { LocaleService, RegionService } from '@univerjs/core';
import { columnLabelToNumber, LocaleType, MAX_COLUMN_COUNT, MAX_ROW_COUNT, normalizeNativeDigits } from '@univerjs/core';
import { parseArrayConstant } from '../../basics/array-constant';
import { ERROR_LITERALS } from '../../basics/error-type';
import { getErrorAliases, getFunctionAliases } from '../../services/formula/utils';
import { normalizeLambdaVariable } from '../utils/function-definition';

/** The input language and region of a single formula edit. */
export interface IFormulaSyntax {
    readonly argumentSeparator: string;
    toStandard(text: string): string | null;
    toLocal(text: string): string;
    /** Normalize punctuation only, so editor token ranges still index the original draft. */
    toEditorTokens(text: string): string;
}

interface ISeparators {
    decimal: string;
    argument: string;
    column: string;
    row: string;
    number: RegExp;
    fullWidthDigits?: boolean;
}

function numberPattern(decimal: string): RegExp {
    return new RegExp(`(?:\\d+(?:[${decimal}]\\d*)?|[${decimal}]\\d+)(?:[Ee][+-]?\\d+)?`, 'y');
}

const standard: ISeparators = { decimal: '.', argument: ',', column: ',', row: ';', number: numberPattern('.') };
const separator = /^[.,;\\٫؛،]$/;

/** Return the exclusive end of a quoted literal, sheet name or bracketed reference, or start for other tokens. */
export function getFormulaProtectedTokenEnd(text: string, start: number): number {
    const quote = text[start];
    if (quote !== '"' && quote !== "'" && quote !== '[') return start;
    let depth = 1;
    for (let i = start + 1; i < text.length; i++) {
        const char = text[i];
        if (quote === '[') {
            if (char === "'" && /[[\]'@#]/.test(text[i + 1])) i++;
            else if (char === '[') depth++;
            else if (char === ']' && --depth === 0) return i + 1;
        } else if (char === quote) {
            if (text[i + 1] !== quote) return i + 1;
            i++;
        }
    }
    return text.length;
}

interface IBindingScope {
    name: string;
    start: number;
    pending?: string;
    bindings: Set<string>;
}

function endBindingArgument(scope: IBindingScope, text: string, index: number) {
    if (scope.name === 'LAMBDA') {
        scope.bindings.add(normalizeLambdaVariable(text.slice(scope.start, index)).toUpperCase());
    } else if (scope.pending === undefined) {
        scope.pending = normalizeLambdaVariable(text.slice(scope.start, index)).toUpperCase();
    } else {
        // A LET initializer can still call a function shadowed by the name being declared.
        scope.bindings.add(scope.pending);
        scope.pending = undefined;
    }
    scope.start = index + 1;
}

interface IAliases {
    errors: readonly [string, string][];
    local: Map<string, string>;
    standard: Map<string, string>;
}

function translateCall(name: string, aliases: IAliases, scopes: (IBindingScope | null)[], input: boolean) {
    if (!input && /^_xludf\./i.test(name)) return name.slice(7);
    const key = input ? name.toUpperCase() : name.toUpperCase().replace(/^_XLFN\.(?:_XLWS\.)?/, '');
    const alias = (input ? aliases.standard : aliases.local).get(key);
    if (alias) return alias;
    const unqualified = input ? key : key.replace(/^_XLPM\./, '');
    if (aliases.local.has(unqualified) && scopes.some((scope) => scope?.bindings.has(unqualified))) {
        // SUM can be a local lambda name in Spanish. Mark its invocation to distinguish it from canonical SUM.
        if (input) return `_xlpm.${name}`;
        if (key !== unqualified) return name.slice(6);
    }
    // Excel stores an untranslated function typed under its foreign name as an unresolved UDF.
    return input && aliases.local.has(key) ? `_xludf.${name}` : name;
}

function followsValue(text: string, index: number): boolean {
    let previous = index - 1;
    while (previous >= 0 && /\s/.test(text[previous])) previous--;
    return previous >= 0 && /[\p{L}\p{N}_$)\]}"%]/u.test(text[previous]);
}

function referenceWithAsciiRow(name: string, normalized: string): string {
    const ref = /^(\$?)([a-z]{1,3})(\$?)(\d+)$/i.exec(normalized);
    if (!ref) return name;
    const column = ref[2].toUpperCase();
    const row = Number(ref[4]);
    return columnLabelToNumber(column) <= MAX_COLUMN_COUNT && row > 0 && row <= MAX_ROW_COUNT
        ? ref[1] + column + ref[3] + row
        : name;
}

// eslint-disable-next-line complexity, max-lines-per-function -- One scanner preserves token boundaries and offsets across locale conversions.
function translate(text: string, from: ISeparators, to: ISeparators, aliases: IAliases | undefined, strict: boolean): string | null {
    const scopes: (IBindingScope | null)[] = [];
    // The shadow text has identical UTF-16 offsets. Only numeric tokens and valid reference rows are rewritten.
    const digits = from === standard ? text : normalizeNativeDigits(text).value;
    const scan = from.fullWidthDigits ? digits.replace(/[０-９]/g, (digit) => String(digit.charCodeAt(0) - 0xFF10)) : digits;
    const trackBindings = /(?:LET|LAMBDA)\(/i.test(text);
    let argumentUsed: string | undefined;
    let nextCall = '';
    let result = '';
    let arrayStart = -1;
    let i = 0;
    // A digit can begin an unquoted sheet name. Consume its period as part of the name.
    const identifier = /[\p{L}\p{N}_$][\p{L}\p{M}\p{N}.$_]*!|[\p{L}_$０-９\u{10000}-\u{10FFFF}][\p{L}\p{M}\p{N}.$_\u{10000}-\u{10FFFF}]*/uy;
    const arrayName = /[\p{L}_][\p{L}\p{M}\p{N}_]*/uy;
    const dotSeparatesArray = from.column === '.' || from.row === '.';
    const number = from.number;
    while (i < text.length) {
        const inArray = arrayStart >= 0;
        const char = scan[i];
        const protectedEnd = getFormulaProtectedTokenEnd(text, i);
        if (protectedEnd !== i) {
            const token = text.slice(i, protectedEnd);
            if (char === "'" && text[protectedEnd] !== '!') {
                if (strict) return null;
                const literal = token.slice(1, -1).toUpperCase();
                result += aliases?.local.has(literal) && /^(?:TRUE|FALSE)$/.test(literal) ? token.slice(1, -1) : token;
            } else {
                result += token;
            }
            i = protectedEnd;
            continue;
        }

        if (char === '#' && aliases) {
            const rest = text.slice(i).toUpperCase();
            const match = aliases.errors.find(([canonical, label]) => rest.startsWith(strict ? label : canonical));
            if (match) {
                result += strict ? match[0] : match[1];
                i += (strict ? match[1] : match[0]).length;
                continue;
            }
            // A value can end with the spill operator. A leading hash must introduce a local error token.
            if (strict && !followsValue(text, i)) return null;
        }

        const namePattern = inArray && dotSeparatesArray ? arrayName : identifier;
        namePattern.lastIndex = i;
        const match = namePattern.exec(scan);
        if (match) {
            const end = namePattern.lastIndex;
            const name = text.slice(i, end);
            const isCall = text[end] === '(' && text[i - 1] !== '!' && text[i - 1] !== '\\';
            if (isCall) nextCall = name.toUpperCase().replace(/^_XLFN\./, '');
            const key = name.toUpperCase();
            const scope = scopes[scopes.length - 1];
            const declaration = scope && (scope.name === 'LAMBDA' || scope.pending === undefined) &&
                !text.slice(scope.start, i).trim() && text.slice(end).trimStart().startsWith(from.argument);
            const bound = declaration || scopes.some((s) => s?.bindings.has(key));
            if (aliases && isCall) {
                result += translateCall(name, aliases, scopes, strict);
            } else {
                const builtin = strict ? aliases?.standard.get(key) ?? key : key;
                if (aliases && (builtin === 'TRUE' || builtin === 'FALSE') && text[i - 1] !== '!' && text[end] !== '[') {
                    const local = aliases.local.get(builtin) ?? builtin;
                    if (strict && declaration && key === local.toUpperCase()) return null;
                    if (bound && !inArray) result += name;
                    else if (!strict) result += local;
                    else if (key === local.toUpperCase()) result += builtin;
                    else if (inArray) return null;
                    else result += `'${name}'`;
                } else {
                    result += strict && !bound && name !== match[0] ? referenceWithAsciiRow(name, match[0]) : name;
                }
            }
            i = end;
            continue;
        }

        number.lastIndex = i;
        const numeric = number.exec(scan);
        if (numeric) {
            const value = numeric[0];
            const end = number.lastIndex;
            // A decimal comma following a reference cannot start another numeric literal.
            if (strict && char === from.decimal && followsValue(text, i)) return null;
            // A list separator cannot turn a standalone number into a reference union.
            if (strict && /^[,;،؛]/.test(text.slice(end).trimStart()) && /^=\s*[+-]?\s*$/.test(text.slice(0, i))) return null;
            // Number grouping is not formula syntax. A space after a row range may be an intersection.
            if (strict && /^(?:['’٬\u00A0\u202F]| +)\d/.test(scan.slice(end)) && !text.slice(0, i).trimEnd().endsWith(':')) return null;
            if (strict && value.endsWith(from.decimal) && /^\s*[\p{L}\p{N}_$"[(]/u.test(scan.slice(end))) return null;
            if (strict && /^[\p{L}_$]/u.test(scan.slice(end))) return null;
            result += value.replace(from.decimal, to.decimal);
            i = end;
            continue;
        }

        // Excel accepts an ASCII comma keyboard entry for the Divehi list separator.
        const isArgument = !inArray && (char === from.argument || (from.argument === '،' && char === ','));
        if (isArgument && strict) {
            // Excel's local Arabic punctuation accepts a trailing omitted argument, but requires a preceding one.
            if ((from.argument === '،' || from.argument === '؛') && /[(,]\s*$/.test(result)) return null;
            if (argumentUsed && argumentUsed !== char) return null;
            argumentUsed = char;
        }
        if (trackBindings && !inArray) {
            if (char === '(') {
                scopes.push(nextCall === 'LET' || nextCall === 'LAMBDA' ? { name: nextCall, start: i + 1, bindings: new Set() } : null);
                nextCall = '';
            } else if (char === ')') {
                scopes.pop();
            } else if (isArgument) {
                const scope = scopes[scopes.length - 1];
                if (scope) endBindingArgument(scope, text, i);
            }
        }

        if (isArgument || (inArray && char === from.column)) {
            result += inArray ? to.column : to.argument;
        } else if (inArray && char === from.row) {
            result += to.row;
        } else {
            if (strict && (separator.test(char) || (inArray && char === ':'))) {
                // A backslash can begin an Excel defined name outside an array.
                if (!(char === '\\' && !inArray && /[\p{L}_]/u.test(text[i + 1] ?? ''))) return null;
            }
            if (char === '{') {
                if (strict && inArray) return null;
                arrayStart = result.length + 1;
            } else if (char === '}') {
                if (strict && (!inArray || !parseArrayConstant(result.slice(arrayStart)))) return null;
                arrayStart = -1;
            } else if (strict && /\p{Nd}/u.test(char)) {
                // Other BMP decimal scripts cannot start a number or defined name in Excel.
                return null;
            }
            result += char;
        }
        i++;
    }
    return strict && arrayStart >= 0 ? null : result;
}

export function getFormulaSyntax(regionService: RegionService, localeService: LocaleService): IFormulaSyntax {
    const { decimal, argument, arrayColumn, arrayRow } = regionService.getFormulaSeparators();
    const fullWidthDigits = [LocaleType.ZH_CN, LocaleType.ZH_TW, LocaleType.ZH_HK, LocaleType.JA_JP, LocaleType.KO_KR].includes(localeService.getCurrentLocale());
    const local = { decimal, argument, column: arrayColumn, row: arrayRow, number: numberPattern(decimal), fullWidthDigits };
    const errorLabels = getErrorAliases(localeService);
    const aliases: IAliases = {
        local: new Map(),
        standard: new Map(),
        errors: Array.from(ERROR_LITERALS, (code) => [code, errorLabels[code] ?? code]),
    };
    for (const [name, local] of Object.entries(getFunctionAliases(localeService))) {
        aliases.local.set(name, local);
        aliases.standard.set(local.toUpperCase(), name);
    }
    return {
        argumentSeparator: local.argument,
        toStandard: (text) => translate(text, local, standard, aliases, true),
        toLocal: (text) => translate(text, standard, local, aliases, false)!,
        toEditorTokens: (text) => translate(text, local, standard, undefined, false)!,
    };
}
