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

import type { IUniverEngineFormulaConfig } from '../../config/config';
import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { ErrorValueObject, formatValueForFormulaText } from '../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { ExcelChar } from './char';
import { formatExcelTextNumber } from './format-excel-text-number';
import { FUNCTION_NAMES_TEXT } from './function-names';

const MAX_INDEX = 0x7FFF_FFFF;
const MAX_CELL_TEXT_LENGTH = 32767;
const valueError = () => ErrorValueObject.create(ErrorType.VALUE);

function asText(value: BaseValueObject): string {
    if (value.isNull()) return '';
    if (value.isNumber()) return formatExcelTextNumber(Number(value.getValue()));
    return formatValueForFormulaText(value.getValue());
}

function readCount(value: BaseValueObject | undefined, fallback: number): number {
    if (value == null) return fallback;
    if (value.isNull()) return 0;
    const number = Math.floor(Number(value.convertToNumberObjectValue().getValue()));
    return Number.isFinite(number) && number >= 0 ? number : NaN;
}

function sliceEnd([value, countValue]: BaseValueObject[], fromRight: boolean): BaseValueObject {
    const count = readCount(countValue, 1);
    if (Number.isNaN(count)) return valueError();
    const text = asText(value);
    if (count >= text.length) return StringValueObject.create(text);
    if (count === 0) return StringValueObject.create('');
    const characters = Array.from(text);
    const result = fromRight ? characters.slice(-count) : characters.slice(0, count);
    return StringValueObject.create(result.join(''));
}

function midText([value, startValue, countValue]: BaseValueObject[]): BaseValueObject {
    const start = readCount(startValue, NaN);
    const count = readCount(countValue, NaN);
    if (!(start >= 1 && start <= MAX_INDEX && count >= 0 && count <= MAX_INDEX)) return valueError();
    return StringValueObject.create(asText(value).slice(start - 1, start - 1 + count));
}

function replaceText([value, startValue, countValue, replacement]: BaseValueObject[]): BaseValueObject {
    const start = readCount(startValue, NaN);
    const count = readCount(countValue, NaN);
    if (!(start >= 1 && start + count < MAX_INDEX)) return valueError();
    const text = asText(value);
    const result = text.slice(0, start - 1) + asText(replacement) + text.slice(start - 1 + count);
    return result.length > MAX_CELL_TEXT_LENGTH ? valueError() : StringValueObject.create(result);
}

function foldSearchText(text: string): string {
    if (!/[\u0080-\uFFFF]/.test(text)) return text.toUpperCase();
    return text.replace(/./gs, (unit) => {
        if (unit === 'ß') return 'ẞ';
        if (unit === 'ı') return unit;
        const upper = unit.toUpperCase();
        return upper.length === 1 ? upper : unit;
    });
}

function literalPattern(value: string): string {
    return value.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&');
}

function wildcardStart(text: string, pattern: string, start: number): number {
    // Match the fixed-length parts between stars in order. This avoids
    // backtracking through unbounded repetitions in the entire wildcard.
    const parts: string[] = [];
    let part = '';
    for (let index = 0; index < pattern.length; index++) {
        const unit = pattern[index];
        if (unit === '*') {
            parts.push(part);
            part = '';
        } else if (unit === '?') {
            part += '.';
        } else {
            part += literalPattern(unit === '~' ? pattern[++index] ?? '' : unit);
        }
    }
    parts.push(part);
    let first: number | undefined;
    let position = start;
    for (const expression of parts) {
        const segment = new RegExp(expression, 'gs');
        segment.lastIndex = position;
        const match = segment.exec(text);
        if (match == null) return -1;
        first ??= match.index;
        position = segment.lastIndex;
    }
    return first ?? start;
}

function findText([needleValue, textValue, startValue]: BaseValueObject[], search: boolean): BaseValueObject {
    const start = readCount(startValue, 1);
    let text = asText(textValue);
    let needle = asText(needleValue);
    if (!(start >= 1 && start <= text.length + (search ? 0 : 1))) return valueError();
    if (search) {
        text = foldSearchText(text);
        needle = foldSearchText(needle);
    }
    const index = search && /[*?~]/.test(needle)
        ? wildcardStart(text, needle, start - 1)
        : text.indexOf(needle, start - 1);
    return index < 0 ? valueError() : NumberValueObject.create(index + 1);
}

function byteTextFunction(min: number, max: number, calculate: (args: BaseValueObject[]) => BaseValueObject) {
    return class ExcelByteText extends BaseFunction {
        override minParams = min;

        override maxParams = max;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (values) => values.find((value) => value.isError()) ?? calculate(values));
        }
    };
}

function textSearchFunction(search: boolean) {
    return class ExcelTextSearch extends BaseFunction {
        override minParams = 2;

        override maxParams = 3;

        override needsReferenceObject = true;

        override calculate(...args: FunctionVariantType[]): BaseValueObject {
            const values = args.map((value) => {
                if (!value.isReferenceObject()) return value as BaseValueObject;
                const array = (value as BaseReferenceObject).toArrayValueObject();
                return array.getRowCount() === 1 && array.getColumnCount() === 1 ? array.getFirstCell() : array;
            });
            return mapFinancialScalars(values, (cells) => cells.find((cell) => cell.isError()) ?? findText(cells, search), true);
        }
    };
}

export const excelTextSearchFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [textSearchFunction(false), FUNCTION_NAMES_TEXT.FIND],
    [textSearchFunction(true), FUNCTION_NAMES_TEXT.SEARCH],
];

function unicode([value]: BaseValueObject[]): BaseValueObject {
    const code = asText(value).codePointAt(0);
    if (code === undefined || (code >= 0xD800 && code <= 0xDBFF)) return valueError();
    return NumberValueObject.create(code);
}

function substituteText([source, search, replacement, occurrence]: BaseValueObject[]): BaseValueObject {
    const instance = occurrence === undefined ? undefined : readCount(occurrence, NaN);
    if (occurrence?.isBoolean() || (instance !== undefined && !(instance > 0))) return valueError();
    const text = asText(source);
    const needle = asText(search);
    if (needle === '') return StringValueObject.create(text);
    const substitute = asText(replacement);
    if (instance === undefined) {
        return StringValueObject.create(text.replaceAll(needle, () => substitute));
    }
    // Excel counts overlapping occurrences when a specific occurrence is requested.
    let offset = -1;
    for (let count = 0; count < instance; count++) {
        offset = text.indexOf(needle, offset + 1);
        if (offset < 0) return StringValueObject.create(text);
    }
    return StringValueObject.create(text.slice(0, offset) + substitute + text.slice(offset + needle.length));
}

const ExcelTextLength = byteTextFunction(1, 1, ([value]) => NumberValueObject.create(asText(value).length));
const ExcelLeft = byteTextFunction(1, 2, (args) => sliceEnd(args, false));
const ExcelRight = byteTextFunction(1, 2, (args) => sliceEnd(args, true));
const ExcelMid = byteTextFunction(3, 3, midText);
const ExcelReplace = byteTextFunction(4, 4, replaceText);

export const excelByteTextFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelChar, FUNCTION_NAMES_TEXT.CHAR],
    [ExcelTextLength, FUNCTION_NAMES_TEXT.LEN],
    [ExcelTextLength, FUNCTION_NAMES_TEXT.LENB],
    [ExcelLeft, FUNCTION_NAMES_TEXT.LEFT],
    [ExcelLeft, FUNCTION_NAMES_TEXT.LEFTB],
    [ExcelRight, FUNCTION_NAMES_TEXT.RIGHT],
    [ExcelRight, FUNCTION_NAMES_TEXT.RIGHTB],
    [ExcelMid, FUNCTION_NAMES_TEXT.MID],
    [ExcelMid, FUNCTION_NAMES_TEXT.MIDB],
    [ExcelReplace, FUNCTION_NAMES_TEXT.REPLACE],
    [ExcelReplace, FUNCTION_NAMES_TEXT.REPLACEB],
    [textSearchFunction(false), FUNCTION_NAMES_TEXT.FINDB],
    [textSearchFunction(true), FUNCTION_NAMES_TEXT.SEARCHB],
    [byteTextFunction(1, 1, unicode), FUNCTION_NAMES_TEXT.UNICODE],
    [byteTextFunction(2, 2, ([left, right]) => BooleanValueObject.create(asText(left) === asText(right))), FUNCTION_NAMES_TEXT.EXACT],
    [byteTextFunction(3, 4, substituteText), FUNCTION_NAMES_TEXT.SUBSTITUTE],
];
