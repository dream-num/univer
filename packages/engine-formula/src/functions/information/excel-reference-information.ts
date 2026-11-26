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
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { HorizontalAlign, numfmt } from '@univerjs/core';
import { ErrorType } from '../../basics/error-type';
import { MultiAreaReferenceObject } from '../../engine/reference-object/multi-area-reference-object';
import { createNewArray } from '../../engine/utils/array-object';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { Cell } from './cell';
import { FUNCTION_NAMES_INFORMATION } from './function-names';
import { Isformula } from './isformula';
import { Sheet } from './sheet';

class ExcelCell extends Cell {
    override implicitIntersectionReferenceArguments = [1];

    protected override _handleSingleObject(infoType: BaseValueObject, reference: FunctionVariantType, infoTypeIsArray = false): BaseValueObject {
        if (infoType.isError()) return infoType;
        if (!reference.isReferenceObject()) return super._handleSingleObject(infoType, reference, infoTypeIsArray);

        const target = reference as BaseReferenceObject;
        const { startRow, startColumn } = target.getRangePosition();
        const type = String(infoType.getValue()).toLowerCase();
        switch (type) {
            case 'contents':
                return target.getCellByPosition(startRow, startColumn);
            case 'prefix': {
                const raw = target.getCurrentActiveSheetData()?.cellData.getValue(startRow, startColumn);
                if (raw?.v == null || raw.f || raw.si || !target.getCellByPosition(startRow, startColumn).isString()) {
                    return StringValueObject.create('');
                }
                const alignment = target.getCurrentStylesData()?.getStyleByCell(raw)?.ht;
                return StringValueObject.create(alignment === HorizontalAlign.CENTER ? '^' : alignment === HorizontalAlign.RIGHT ? '"' : "'");
            }
            case 'format':
            case 'color':
            case 'parentheses': {
                const raw = target.getCurrentActiveSheetData()?.cellData.getValue(startRow, startColumn);
                const style = target.getCurrentStylesData()?.getStyleByCell(raw);
                return excelCellFormat(type, style?.n?.pattern ?? 'General');
            }
            default:
                return super._handleSingleObject(infoType, reference, infoTypeIsArray);
        }
    }
}

function excelCellFormat(type: string, pattern: string): BaseValueObject {
    const { BREAK, COLOR, CONDITION, ESCAPED, FILL, SKIP, STRING, LOCALE, DURATION } = numfmt.tokenTypes;
    const tokens = numfmt.tokenize(pattern);
    const firstBreak = tokens.findIndex(({ type }) => type === BREAK);
    const positive = firstBreak === -1 ? tokens : tokens.slice(0, firstBreak);
    const afterPositive = firstBreak === -1 ? [] : tokens.slice(firstBreak + 1);
    const lastNumericToken = afterPositive.findIndex(({ type }) => type === BREAK);
    const negative = lastNumericToken === -1 ? afterPositive : afterPositive.slice(0, lastNumericToken);
    const hasColor = negative.length > 0 && [...positive, ...negative].some(({ type }) => type === COLOR);
    const leading = positive.find(({ type }) => type !== COLOR && type !== CONDITION);
    const parentheses = leading?.raw === '(';
    if (type === 'color') return NumberValueObject.create(Number(hasColor));
    if (type === 'parentheses') return NumberValueObject.create(Number(parentheses));

    const format = numfmt.getFormatInfo(pattern);
    const raw = positive
        .filter(({ type }) => ![COLOR, CONDITION, ESCAPED, FILL, SKIP, STRING, LOCALE].some((ignored) => type === ignored))
        .map(({ raw }) => raw)
        .join('')
        .toLowerCase();
    const fractionDigits = raw.match(/\.([0#?]+)/u)?.[1]?.length ?? 0;
    const grouping = raw.includes('#,##') ? ',' : 'F';
    let code = format.code.replace(/(?:-|\(\))+$/u, '');
    if (/^\[\$-f800\]/iu.test(pattern.trimStart()) || positive.some(({ type }) => type === DURATION)) {
        code = 'G';
    } else if (positive.some(({ type }) => type === LOCALE) && /^m{1,2}\/d{1,2}\/y{2,4}$/u.test(raw)) {
        code = 'D2';
    } else if (/^h{1,2}:m{1,2}:s{1,2}\.0+$/u.test(raw)) {
        code = 'D8';
    } else if (raw.includes('$')) {
        code = `C${fractionDigits}`;
    } else if (format.type === 'currency') {
        code = `${grouping}${fractionDigits}`;
    } else if (/e[+-]0/u.test(raw)) {
        code = `S${fractionDigits}`;
    }
    return StringValueObject.create(`${code}${hasColor ? '-' : ''}${parentheses ? '()' : ''}`);
}

class ExcelIsformula extends Isformula {
    override implicitIntersectionReferenceArguments = [0];

    override calculate(value: FunctionVariantType): BaseValueObject {
        if (value instanceof MultiAreaReferenceObject && value.isArrayOfReferences()) {
            const cells = value.getAreas().map((row) => row.map((cell) => this.calculate(cell)));
            return createNewArray(cells, value.getRowCount(), value.getColumnCount());
        }
        if (value.isReferenceObject() || value.isError()) return super.calculate(value);
        const valueError = ErrorValueObject.create(ErrorType.VALUE);
        return value.isArray() ? (value as ArrayValueObject).mapValue((item) => item.isError() ? item : valueError) : valueError;
    }
}

class ExcelSheet extends Sheet {
    override calculate(value?: FunctionVariantType): BaseValueObject {
        if (value instanceof MultiAreaReferenceObject && value.isSheetSpan) {
            const first = value.getAreas()[0]?.[0];
            return first ? super.calculate(first) : ErrorValueObject.create(ErrorType.REF);
        }
        return super.calculate(value);
    }
}

export const excelReferenceInformationFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelSheet, FUNCTION_NAMES_INFORMATION.SHEET],
    [ExcelCell, FUNCTION_NAMES_INFORMATION.CELL],
    [ExcelIsformula, FUNCTION_NAMES_INFORMATION.ISFORMULA],
];
