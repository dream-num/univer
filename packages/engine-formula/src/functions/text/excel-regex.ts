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

import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { createNewArray, expandArrayValueObject } from '../../engine/utils/array-object';
import { handleRegExp } from '../../engine/utils/regexp-check';
import { ErrorValueObject, formatValueForFormulaText } from '../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';

const MAX_REPLACEMENT_LENGTH = 65_535;
const REPLACEMENT_TOKEN = /\\(?:\d+|x[\da-f]{2}|.)?|\$(?:[$&]|\d+|<[^>]+>|\{[^}]+\})?/gis;
const REPLACEMENT_ESCAPES: Readonly<Record<string, string>> = {
    '\\': '\\',
    $: '$',
    a: '\x07',
    e: '\x1B',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
};

export class ExcelRegexextract extends BaseFunction {
    override minParams = 2;
    override maxParams = 4;
    override needsReferenceObject = true;

    override calculate(
        text: FunctionVariantType,
        pattern: FunctionVariantType,
        returnMode: FunctionVariantType = NumberValueObject.create(0),
        caseSensitivity: FunctionVariantType = NumberValueObject.create(0)
    ): BaseValueObject {
        return calculateRegex([text, pattern, returnMode, caseSensitivity], extractText);
    }
}

export class ExcelRegextest extends BaseFunction {
    override minParams = 2;
    override maxParams = 3;
    override needsReferenceObject = true;

    override calculate(
        text: FunctionVariantType,
        pattern: FunctionVariantType,
        caseSensitivity: FunctionVariantType = NumberValueObject.create(0)
    ): BaseValueObject {
        return calculateRegex([text, pattern, caseSensitivity], ([value, expression, sensitivity], getRegex) => {
            const regex = getRegex(regexText(expression), numericRegexOption(sensitivity), false);
            return regex
                ? BooleanValueObject.create(regex.test(regexText(value)))
                : ErrorValueObject.create(ErrorType.VALUE);
        });
    }
}

export class ExcelRegexreplace extends BaseFunction {
    override minParams = 3;
    override maxParams = 5;
    override needsReferenceObject = true;

    override calculate(
        text: FunctionVariantType,
        pattern: FunctionVariantType,
        replacement: FunctionVariantType,
        occurrence: FunctionVariantType = NumberValueObject.create(0),
        caseSensitivity: FunctionVariantType = NumberValueObject.create(0)
    ): BaseValueObject {
        return calculateRegex([text, pattern, replacement, occurrence, caseSensitivity], replaceText);
    }
}

function calculateRegex(args: FunctionVariantType[], evaluate: (args: BaseValueObject[], getRegex: typeof compileRegex) => BaseValueObject): BaseValueObject {
    const inputs = args.map(readRegexArgument);
    const evaluateCell = (values: BaseValueObject[], getRegex: typeof compileRegex) => values.find((value) => value.isError()) ?? evaluate(values, getRegex);
    const arrays = inputs.filter((input): input is ArrayValueObject => input.isArray());
    if (arrays.length === 0) {
        return evaluateCell(inputs, compileRegex);
    }

    const rows = Math.max(...arrays.map((array) => array.getRowCount()));
    const columns = Math.max(...arrays.map((array) => array.getColumnCount()));
    const missing = ErrorValueObject.create(ErrorType.NA);
    const matrices = inputs.map((input) => expandArrayValueObject(rows, columns, input, missing));
    let compiled: { expression: string; mode: number; global: boolean; regex: RegExp | null } | undefined;
    const getRegex: typeof compileRegex = (expression, mode, global) => {
        if (compiled?.expression !== expression || compiled.mode !== mode || compiled.global !== global) {
            compiled = { expression, mode, global, regex: compileRegex(expression, mode, global) };
        }
        return compiled.regex;
    };
    return matrices[0].mapValue((_, row, column) => {
        const result = evaluateCell(matrices.map((matrix) => matrix.get(row, column) ?? missing), getRegex);
        return result.isArray() ? (result as ArrayValueObject).getFirstCell() : result;
    });
}

function extractText([text, pattern, returnMode, caseSensitivity]: BaseValueObject[], getRegex: typeof compileRegex): BaseValueObject {
    const mode = numericRegexOption(returnMode);
    if (![0, 1, 2].includes(mode)) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    const regex = getRegex(regexText(pattern), numericRegexOption(caseSensitivity), mode === 1);
    if (!regex) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    const match = regexText(text).match(regex);
    if (!match) {
        return ErrorValueObject.create(ErrorType.NA);
    }
    if (mode === 0) {
        return StringValueObject.create(match[0]);
    }
    const matches = mode === 1 ? match : match.slice(1);
    if (matches.length === 0) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    const cells = matches.map((result) => result === undefined ? ErrorValueObject.create(ErrorType.NA) : StringValueObject.create(result));
    return createNewArray([cells], 1, cells.length);
}

function replaceText([text, pattern, replacement, occurrence, caseSensitivity]: BaseValueObject[], getRegex: typeof compileRegex): BaseValueObject {
    const requested = numericRegexOption(occurrence);
    if (!Number.isFinite(requested) || requested < -2_147_483_648 || requested > 2_147_483_647) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    const regex = getRegex(regexText(pattern), numericRegexOption(caseSensitivity), true);
    if (!regex) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    const source = regexText(text);
    const template = regexText(replacement);
    const hasTemplateTokens = /[\\$]/.test(template);
    let target = requested;
    if (requested < 0) {
        for (const _ of source.matchAll(regex)) {
            target++;
        }
        target++;
        if (target < 1) {
            return StringValueObject.create(source);
        }
    }

    let result = '';
    let offset = 0;
    let seen = 0;
    for (const match of source.matchAll(regex)) {
        if (target !== 0 && ++seen !== target) {
            continue;
        }
        const expanded = hasTemplateTokens ? expandReplacement(template, match) : template;
        if (expanded === null) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        result += source.slice(offset, match.index) + expanded;
        if (result.length > MAX_REPLACEMENT_LENGTH) {
            return ErrorValueObject.create(ErrorType.CALC);
        }
        offset = match.index + match[0].length;
        if (target !== 0) {
            break;
        }
    }
    result += source.slice(offset);
    return result.length > MAX_REPLACEMENT_LENGTH
        ? ErrorValueObject.create(ErrorType.CALC)
        : StringValueObject.create(result);
}

function expandReplacement(template: string, match: RegExpMatchArray): string | null {
    let valid = true;
    const expanded = template.replace(REPLACEMENT_TOKEN, (token: string) => {
        if (token === '$$') {
            return '$';
        }
        if (token === '$&') {
            return match[0];
        }
        const value = token.slice(1);
        if (token[0] === '\\') {
            if (Object.prototype.hasOwnProperty.call(REPLACEMENT_ESCAPES, value)) {
                return REPLACEMENT_ESCAPES[value];
            }
            if (/^x[\da-fA-F]{2}$/.test(value)) {
                return String.fromCharCode(Number.parseInt(value.slice(1), 16));
            }
        }
        const group = value.startsWith('<') || value.startsWith('{') ? value.slice(1, -1) : value;
        if (/^\d+$/.test(group) && Number(group) < match.length) {
            return match[Number(group)] ?? '';
        }
        if (group !== value && match.groups && Object.prototype.hasOwnProperty.call(match.groups, group)) {
            return match.groups[group] ?? '';
        }
        valid = false;
        return '';
    });
    return valid ? expanded : null;
}

export function compileRegex(expression: string, mode: number, global: boolean): RegExp | null {
    if (mode !== 0 && mode !== 1) {
        return null;
    }
    const inlineFlags = /^\(\?([im]+)\)/.exec(expression);
    return handleRegExp(
        inlineFlags ? expression.slice(inlineFlags[0].length) : expression,
        global,
        mode === 1 || inlineFlags?.[1].includes('i'),
        { excelSyntax: true, multiline: inlineFlags?.[1].includes('m') }
    ).regExp;
}

function regexText(value: BaseValueObject): string {
    return value.isNull() ? '' : formatValueForFormulaText(value.getValue());
}

function readRegexArgument(input: FunctionVariantType): BaseValueObject {
    if (!input.isReferenceObject()) {
        return input as BaseValueObject;
    }
    const array = (input as BaseReferenceObject).toArrayValueObject();
    return array.getRowCount() === 1 && array.getColumnCount() === 1 ? array.getFirstCell() : array;
}

function numericRegexOption(option: BaseValueObject): number {
    if (option.isNull()) {
        return 0;
    }
    const number = option.convertToNumberObjectValue();
    return number.isError() ? NaN : Math.trunc(Number(number.getValue()));
}
