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
import { getFunctionAliases } from '../../services/formula/utils';
import { normalizeLambdaVariable } from '../utils/function-definition';

/** The input language and region of a single formula edit. */
export interface IFormulaSyntax {
    readonly region: string;
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
}

function numberPattern(decimal: string): RegExp {
    return new RegExp(`(?:\\d+(?:[${decimal}]\\d*)?|[${decimal}]\\d+)(?:[Ee][+-]?\\d+)?`, 'y');
}

// Excel stores 15 significant digits and expands an exponent when the result fits in 21 characters.
function normalizeScientificLiteral(value: string): string | null {
    const [mantissa, power] = value.toUpperCase().split('E');
    const [integer, fraction = ''] = mantissa.split('.');
    const digits = integer + fraction;
    const first = digits.search(/[1-9]/);
    const exponent = Number(power) + integer.length - first - 1;
    if (first < 0) return Number(power) > 307 ? null : '0';
    if (exponent > 307) return null;
    if (Number(value) < 2 ** -1022) return '0';

    const significant = digits.slice(first, first + 15).replace(/0+$/, '');
    if (exponent > 20 || (exponent < 0 && significant.length - exponent > 20)) {
        const prefix = significant.length === 1 ? significant : `${significant[0]}.${significant.slice(1)}`;
        return `${prefix}E${exponent < 0 ? '-' : '+'}${String(Math.abs(exponent)).padStart(2, '0')}`;
    }
    if (exponent < 0) return `0.${'0'.repeat(-exponent - 1)}${significant}`;
    const point = exponent + 1;
    return significant.length <= point
        ? significant.padEnd(point, '0')
        : `${significant.slice(0, point)}.${significant.slice(point)}`;
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

// eslint-disable-next-line complexity, max-lines-per-function -- One scanner preserves token boundaries and offsets across locale conversions.
function translate(text: string, from: ISeparators, to: ISeparators, aliases: IAliases | undefined, strict: boolean): string | null {
    const scopes: (IBindingScope | null)[] = [];
    const trackBindings = aliases?.local.size && /(?:LET|LAMBDA)\(/i.test(text);
    let argumentUsed: string | undefined;
    let nextCall = '';
    let result = '';
    let inArray = false;
    let i = 0;
    // A digit can begin an unquoted sheet name. Consume its period as part of the name.
    const identifier = /[\p{L}\p{N}_$][\p{L}\p{M}\p{N}.$_]*!|[\p{L}_$][\p{L}\p{M}\p{N}.$_]*/uy;
    const arrayName = /[\p{L}_][\p{L}\p{M}\p{N}_]*/uy;
    const dotSeparatesArray = from.column === '.' || from.row === '.';
    const number = from.number;
    while (i < text.length) {
        const char = text[i];
        const protectedEnd = getFormulaProtectedTokenEnd(text, i);
        if (protectedEnd !== i) {
            result += text.slice(i, protectedEnd);
            i = protectedEnd;
            continue;
        }

        const namePattern = inArray && dotSeparatesArray ? arrayName : identifier;
        namePattern.lastIndex = i;
        const name = namePattern.exec(text);
        if (name) {
            const end = namePattern.lastIndex;
            const isCall = text[end] === '(' && text[i - 1] !== '!' && text[i - 1] !== '\\';
            if (isCall) nextCall = name[0].toUpperCase().replace(/^_XLFN\./, '');
            if (aliases && isCall) {
                result += translateCall(name[0], aliases, scopes, strict);
            } else if (aliases && inArray) {
                const key = name[0].toUpperCase();
                const standardName = strict ? aliases.standard.get(key) : key;
                result += standardName === 'TRUE' || standardName === 'FALSE'
                    ? (strict ? standardName : aliases.local.get(key) ?? name[0])
                    : name[0];
            } else {
                result += name[0];
            }
            i = end;
            continue;
        }

        number.lastIndex = i;
        const numeric = number.exec(text);
        if (numeric) {
            const value = numeric[0];
            const end = number.lastIndex;
            // A decimal comma following a reference cannot start another numeric literal.
            if (strict && char === from.decimal && followsValue(text, i)) return null;
            // A list separator cannot turn a standalone number into a reference union.
            if (strict && /^[,;،؛]/.test(text.slice(end).trimStart()) && /^=\s*[+-]?\s*$/.test(text.slice(0, i))) return null;
            // Number grouping is not formula syntax. A space after a row range may be an intersection.
            if (strict && /^(?:['’٬\u00A0\u202F]| +)\d/.test(text.slice(end)) && !text.slice(0, i).trimEnd().endsWith(':')) return null;
            if (strict && value.endsWith(from.decimal) && /^\s*[\p{L}\p{N}_$"[(]/u.test(text.slice(end))) return null;
            const literal = value.replace(from.decimal, '.');
            const normalized = aliases && /e/i.test(literal) ? normalizeScientificLiteral(literal) : literal;
            if (normalized === null && strict) return null;
            result += (normalized ?? literal).replace('.', to.decimal);
            i = end;
            continue;
        }

        // Excel accepts an ASCII comma keyboard entry for the Divehi list separator.
        const isArgument = !inArray && (char === from.argument || (from.argument === '،' && char === ','));
        if (isArgument && strict) {
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
            if (char === '{') inArray = true;
            if (char === '}') inArray = false;
            result += char;
        }
        i++;
    }
    return result;
}

export function getFormulaSyntax(regionService: RegionService, localeService: LocaleService): IFormulaSyntax {
    const { decimal, argument, arrayColumn, arrayRow } = regionService.getFormulaSeparators();
    const local = { decimal, argument, column: arrayColumn, row: arrayRow, number: numberPattern(decimal) };
    const aliases: IAliases = { local: new Map(), standard: new Map() };
    for (const [name, local] of Object.entries(getFunctionAliases(localeService))) {
        aliases.local.set(name, local);
        aliases.standard.set(local.toUpperCase(), name);
    }
    return {
        region: regionService.getCurrentRegion(),
        argumentSeparator: local.argument,
        toStandard: (text) => translate(text, local, standard, aliases, true),
        toLocal: (text) => translate(text, standard, local, aliases, false)!,
        toEditorTokens: (text) => translate(text, local, standard, undefined, false)!,
    };
}
