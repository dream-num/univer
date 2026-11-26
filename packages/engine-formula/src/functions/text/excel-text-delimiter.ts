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

import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { expandArrayValueObject } from '../../engine/utils/array-object';
import { ErrorValueObject, formatValueForFormulaText } from '../../engine/value-object/base-value-object';
import { NullValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';

abstract class ExcelTextDelimiter extends BaseFunction {
    override minParams = 2;
    override maxParams = 6;

    protected abstract readonly _before: boolean;

    override calculate(text: BaseValueObject, delimiter: BaseValueObject, ...options: BaseValueObject[]): BaseValueObject {
        const delimiters = readDelimiters(delimiter);
        const values = [text, ...options];
        const arrays = values.filter((value): value is ArrayValueObject => value.isArray());
        if (arrays.length === 0) {
            return splitText(values, delimiters, this._before);
        }

        const rows = Math.max(...arrays.map((array) => array.getRowCount()));
        const columns = Math.max(...arrays.map((array) => array.getColumnCount()));
        const missing = ErrorValueObject.create(ErrorType.NA);
        const matrices = values.map((value) => expandArrayValueObject(rows, columns, value, missing));
        return matrices[0].mapValue((_, row, column) => splitText(
            matrices.map((array) => array.get(row, column) ?? missing),
            delimiters,
            this._before
        ));
    }
}

export class ExcelTextbefore extends ExcelTextDelimiter {
    protected override readonly _before = true;
}

export class ExcelTextafter extends ExcelTextDelimiter {
    protected override readonly _before = false;
}

function readDelimiters(value: BaseValueObject): string[] | ErrorValueObject {
    if (!value.isArray()) {
        return value.isError() ? value as ErrorValueObject : [delimiterText(value)];
    }
    const delimiters: string[] = [];
    let error: ErrorValueObject | undefined;
    (value as ArrayValueObject).iterator((delimiter) => {
        if (delimiter?.isError()) {
            error = delimiter as ErrorValueObject;
            return false;
        }
        delimiters.push(delimiter ? delimiterText(delimiter) : '');
    });
    return error ?? delimiters;
}

function delimiterText(value: BaseValueObject | null | undefined): string {
    return value && !value.isNull() ? formatValueForFormulaText(value.getValue()) : '';
}

function isOmitted(value: BaseValueObject | undefined): boolean {
    return value === undefined || (value instanceof NullValueObject && value.isOmitted());
}

function readNumber(value: BaseValueObject | undefined, defaultValue: number): number {
    if (isOmitted(value)) {
        return defaultValue;
    }
    const number = value!.convertToNumberObjectValue();
    return number.isError() ? NaN : Number(number.getValue());
}

function splitText(
    [input, instanceNumber, matchMode, matchEnd, ifNotFound]: BaseValueObject[],
    delimiters: string[] | ErrorValueObject,
    before: boolean
): BaseValueObject {
    if (input.isError()) {
        return input;
    }
    if (!Array.isArray(delimiters)) {
        return delimiters;
    }
    const optionError = [instanceNumber, matchMode, matchEnd].find((option) => option?.isError());
    if (optionError) {
        return optionError;
    }
    const instance = Math.floor(readNumber(instanceNumber, 1));
    const mode = Math.trunc(readNumber(matchMode, 0));
    const end = Math.trunc(readNumber(matchEnd, 0));
    if (!Number.isFinite(instance) || instance === 0 || (mode !== 0 && mode !== 1) || (end !== 0 && end !== 1)) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    const text = delimiterText(input);
    const fromEnd = instance < 0;
    const minWidth = delimiters.reduce((width, value) => Math.min(width, value.length), Infinity);
    const result = (start: number, finish: number) => StringValueObject.create(before ? text.slice(0, start) : text.slice(finish));
    if (minWidth === 0) {
        const position = fromEnd || text.length === 1 ? text.length : 0;
        return result(position, position);
    }
    const fallback = () => {
        if (isOmitted(ifNotFound)) {
            return ErrorValueObject.create(ErrorType.NA);
        }
        return ifNotFound.isError() ? ifNotFound : StringValueObject.create(delimiterText(ifNotFound));
    };
    if (Math.abs(instance) > text.length - minWidth + 1) {
        return isOmitted(instanceNumber) ? fallback() : ErrorValueObject.create(ErrorType.VALUE);
    }

    const source = mode === 1 ? foldDelimiterText(text) : text;
    const patterns = mode === 1 ? delimiters.map(foldDelimiterText) : delimiters;
    const hit = findDelimiterOccurrence(source, patterns, instance, end === 1);
    return hit ? result(hit.index, hit.index + hit.width) : fallback();
}

function findDelimiterOccurrence(
    source: string,
    patterns: string[],
    instance: number,
    matchEnd: boolean
): { index: number; width: number } | undefined {
    let remaining = Math.abs(instance);
    const fromEnd = instance < 0;
    let start = 0;
    let finish = source.length;
    while (start < finish) {
        const hit = findDelimiter(source.slice(start, finish), patterns, fromEnd);
        if (!hit) {
            break;
        }
        const position = start + hit.index;
        remaining--;
        if (remaining === 0) {
            return { index: position, width: hit.width };
        }
        if (fromEnd) {
            finish = position;
        } else {
            start = position + hit.width;
        }
    }
    if (matchEnd && remaining === 1) {
        return { index: fromEnd ? 0 : source.length, width: 0 };
    }
}

function findDelimiter(text: string, patterns: string[], fromEnd: boolean): { index: number; width: number } | undefined {
    let found: { index: number; width: number } | undefined;
    for (const pattern of patterns) {
        const index = fromEnd ? text.lastIndexOf(pattern) : text.indexOf(pattern);
        if (index < 0) {
            continue;
        }
        if (!found || (fromEnd ? index > found.index : index < found.index) || (index === found.index && pattern.length > found.width)) {
            found = { index, width: pattern.length };
        }
    }
    return found;
}

// Excel delimiter matching folds single BMP code units using its own case table.
// Each range records the first and last input, the stride, and the output offset.
export const TEXT_DELIMITER_CASE_RANGES = [
    [0x00C0, 0x00D6, 1, 32],
    [0x00D8, 0x00DE, 1, 32],
    [0x0100, 0x012E, 2, 1],
    [0x0130, 0x0130, 1, -199],
    [0x0132, 0x0136, 2, 1],
    [0x0139, 0x0147, 2, 1],
    [0x014A, 0x0176, 2, 1],
    [0x0178, 0x0178, 1, -121],
    [0x0179, 0x017D, 2, 1],
    [0x0181, 0x0181, 1, 210],
    [0x0182, 0x0184, 2, 1],
    [0x0186, 0x0186, 1, 206],
    [0x0187, 0x0187, 1, 1],
    [0x0189, 0x018A, 1, 205],
    [0x018B, 0x018B, 1, 1],
    [0x018E, 0x018E, 1, 79],
    [0x018F, 0x018F, 1, 202],
    [0x0190, 0x0190, 1, 203],
    [0x0191, 0x0191, 1, 1],
    [0x0193, 0x0193, 1, 205],
    [0x0194, 0x0194, 1, 207],
    [0x0196, 0x0196, 1, 211],
    [0x0197, 0x0197, 1, 209],
    [0x0198, 0x0198, 1, 1],
    [0x019C, 0x019C, 1, 211],
    [0x019D, 0x019D, 1, 213],
    [0x019F, 0x019F, 1, 214],
    [0x01A0, 0x01A4, 2, 1],
    [0x01A6, 0x01A6, 1, 218],
    [0x01A7, 0x01A7, 1, 1],
    [0x01A9, 0x01A9, 1, 218],
    [0x01AC, 0x01AC, 1, 1],
    [0x01AE, 0x01AE, 1, 218],
    [0x01AF, 0x01AF, 1, 1],
    [0x01B1, 0x01B2, 1, 217],
    [0x01B3, 0x01B5, 2, 1],
    [0x01B7, 0x01B7, 1, 219],
    [0x01B8, 0x01B8, 1, 1],
    [0x01BC, 0x01BC, 1, 1],
    [0x01C4, 0x01C4, 1, 2],
    [0x01C5, 0x01C5, 1, 1],
    [0x01C7, 0x01C7, 1, 2],
    [0x01C8, 0x01C8, 1, 1],
    [0x01CA, 0x01CA, 1, 2],
    [0x01CB, 0x01DB, 2, 1],
    [0x01DE, 0x01EE, 2, 1],
    [0x01F1, 0x01F1, 1, 2],
    [0x01F2, 0x01F4, 2, 1],
    [0x01F6, 0x01F6, 1, -97],
    [0x01F7, 0x01F7, 1, -56],
    [0x01F8, 0x021E, 2, 1],
    [0x0220, 0x0220, 1, -130],
    [0x0222, 0x0232, 2, 1],
    [0x023A, 0x023A, 1, 10795],
    [0x023B, 0x023B, 1, 1],
    [0x023D, 0x023D, 1, -163],
    [0x023E, 0x023E, 1, 10792],
    [0x0241, 0x0241, 1, 1],
    [0x0243, 0x0243, 1, -195],
    [0x0244, 0x0244, 1, 69],
    [0x0245, 0x0245, 1, 71],
    [0x0246, 0x024E, 2, 1],
    [0x0386, 0x0386, 1, 38],
    [0x0388, 0x038A, 1, 37],
    [0x038C, 0x038C, 1, 64],
    [0x038E, 0x038F, 1, 63],
    [0x0391, 0x03A1, 1, 32],
    [0x03A4, 0x03AB, 1, 32],
    [0x03DA, 0x03EE, 2, 1],
    [0x0400, 0x040F, 1, 80],
    [0x0410, 0x042F, 1, 32],
    [0x0460, 0x0480, 2, 1],
    [0x048A, 0x04BE, 2, 1],
    [0x04C0, 0x04C0, 1, 15],
    [0x04C1, 0x04CD, 2, 1],
    [0x04D0, 0x0512, 2, 1],
    [0x0531, 0x0556, 1, 48],
    [0x1E00, 0x1E94, 2, 1],
    [0x1EA0, 0x1EF8, 2, 1],
    [0x2132, 0x2132, 1, 28],
    [0x2183, 0x2183, 1, 1],
    [0x24B6, 0x24CF, 1, 26],
    [0x2C60, 0x2C60, 1, 1],
    [0x2C62, 0x2C62, 1, -10743],
    [0x2C63, 0x2C63, 1, -3814],
    [0x2C64, 0x2C64, 1, -10727],
    [0x2C67, 0x2C6B, 2, 1],
    [0x2C75, 0x2C75, 1, 1],
    [0xFF21, 0xFF3A, 1, 32],
] as const;
export const TEXT_DELIMITER_WORD_ENDS = '\t\n\r !"#$%&\'+,-./:;<=>?@[\\]_{|}';

let delimiterCaseMap: Map<number, string> | undefined;

function foldDelimiterText(text: string): string {
    if (!/[\u0080-\uFFFF]/.test(text)) {
        return text.toLowerCase();
    }
    delimiterCaseMap ??= new Map();
    if (delimiterCaseMap.size === 0) {
        for (const [first, last, step, offset] of TEXT_DELIMITER_CASE_RANGES) {
            for (let code = first; code <= last; code += step) {
                delimiterCaseMap.set(code, String.fromCharCode(code + offset));
            }
        }
    }
    return text.replace(/[A-Z\u0080-\uFFFF]/g, (character: string, index: number) => {
        if (character === 'Σ') {
            const next = text[index + 1];
            return next === undefined || TEXT_DELIMITER_WORD_ENDS.includes(next) ? 'ς' : 'σ';
        }
        return delimiterCaseMap!.get(character.charCodeAt(0)) ?? (character < '\u0080' ? character.toLowerCase() : character);
    });
}
