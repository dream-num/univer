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
import type { BaseReferenceObject } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { MultiAreaReferenceObject } from '../../engine/reference-object/multi-area-reference-object';
import { ErrorValueObject, formatValueForFormulaText } from '../../engine/value-object/base-value-object';
import { NullValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { FUNCTION_NAMES_LOOKUP } from '../lookup/function-names';
import { Tocol } from '../lookup/tocol';
import { Torow } from '../lookup/torow';
import { Arraytotext } from './arraytotext';
import { ExcelBahttext } from './bahttext';
import { Concat } from './concat';
import { Concatenate } from './concatenate';
import { ExcelDollar, ExcelFixed } from './excel-fixed-decimal';
import { ExcelText } from './excel-text-format';
import { toFullWidth, toHalfWidth, usesEastAsianCharacterWidth } from './excel-text-width';
import { ExcelNumbervalue, ExcelValue } from './excel-number-parsing';
import { formatExcelTextNumber } from './format-excel-text-number';
import { FUNCTION_NAMES_TEXT } from './function-names';
import { Lower } from './lower';
import { excelProperCase } from './proper/excel-proper-case';
import { Rept } from './rept';
import { T } from './t';
import { Textjoin } from './textjoin';
import { Textsplit } from './textsplit';
import { Upper } from './upper';

const MAX_CELL_TEXT_LENGTH = 32767;

function limitedText(value: string): BaseValueObject {
    return value.length > MAX_CELL_TEXT_LENGTH ? ErrorValueObject.create(ErrorType.CALC) : StringValueObject.create(value);
}

class ExcelValuetotext extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(...args: BaseValueObject[]): BaseValueObject {
        return mapFinancialScalars(args, ([value, format]) => {
            if (format?.isError()) return format;
            const option = format?.convertToNumberObjectValue();
            if (option?.isError()) return option;
            const mode = Math.floor(Number(option?.getValue() ?? 0));
            if (mode !== 0 && mode !== 1) return ErrorValueObject.create(ErrorType.VALUE);
            if (value.isNull()) return StringValueObject.create('');
            if (value.isNumber()) return limitedText(formatExcelTextNumber(Number(value.getValue())));
            if (value.isString() && mode === 1) {
                return limitedText(`"${String(value.getValue()).replace(/"/g, '""')}"`);
            }
            return limitedText(formatValueForFormulaText(value.getValue()));
        });
    }
}

class ExcelArraytotext extends Arraytotext {
    override needsReferenceObject = true;

    override calculate(array: BaseValueObject | BaseReferenceObject, format?: BaseValueObject | BaseReferenceObject): BaseValueObject {
        const option = format?.isReferenceObject() ? (format as BaseReferenceObject).toArrayValueObject() : format as BaseValueObject | undefined;
        if (!array.isReferenceObject()) return super.calculate(array as BaseValueObject, option);
        const source = (array as BaseReferenceObject).toArrayValueObject();
        const value = source.getRowCount() === 1 && source.getColumnCount() === 1
            ? source.getRealValue(0, 0) ?? NullValueObject.create()
            : source;
        return super.calculate(value, option);
    }

    protected override _handleSingleObject(array: BaseValueObject, format: BaseValueObject): BaseValueObject {
        if (array.isNull()) return ErrorValueObject.create(ErrorType.VALUE);
        return super._handleSingleObject(array, format);
    }

    protected override _formatNumber(value: number): string {
        return formatExcelTextNumber(value);
    }

    protected override _readFormat(format: BaseValueObject): number {
        return Math.floor(super._readFormat(format));
    }
}

class ExcelTextjoin extends Textjoin {
    protected override _formatNumber(value: number): string {
        return formatExcelTextNumber(value);
    }

    protected override _readIgnoreEmpty(value: BaseValueObject): boolean | ErrorValueObject {
        if (value instanceof NullValueObject) return value.isOmitted();
        if (value.isString()) {
            const text = String(value.getValue()).toUpperCase();
            if (text === 'TRUE' || text === 'FALSE') return text === 'TRUE';
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        return super._readIgnoreEmpty(value);
    }

    protected override _createResult(value: string): BaseValueObject {
        return limitedText(value);
    }

    protected override _createLengthError(): ErrorValueObject {
        return ErrorValueObject.create(ErrorType.CALC);
    }
}

class ExcelRept extends Rept {
    protected override _maxTimes(stringMaxLength: number, textLength: number): number {
        return textLength === 0 ? 0x7FFF_FFFE : super._maxTimes(stringMaxLength, textLength);
    }

    protected override _textValue(value: BaseValueObject): string | number | boolean | null {
        return value.isNumber() ? formatExcelTextNumber(Number(value.getValue())) : super._textValue(value);
    }
}

class ExcelConcat extends Concat {
    protected override _createLengthError(): ErrorValueObject {
        return ErrorValueObject.create(ErrorType.CALC);
    }

    protected override _formatText(value: string | number | boolean | null): string {
        return typeof value === 'number' ? formatExcelTextNumber(value) : super._formatText(value);
    }

    protected override _propagatesScalarErrors(): boolean {
        return true;
    }

    override calculate(...textValues: BaseValueObject[]): BaseValueObject {
        const result = super.calculate(...textValues);
        return result.isString() ? limitedText(String(result.getValue())) : result;
    }
}

class ExcelConcatenate extends Concatenate {
    protected override _formatText(value: string | number | boolean | null): string {
        return typeof value === 'number' ? formatExcelTextNumber(value) : super._formatText(value);
    }

    override calculate(...textValues: BaseValueObject[]): BaseValueObject {
        const result = super.calculate(...textValues);
        const trim = (value: BaseValueObject): BaseValueObject => {
            if (!value.isString()) return value;
            const text = String(value.getValue());
            return text.length <= MAX_CELL_TEXT_LENGTH ? value : StringValueObject.create(text.slice(0, MAX_CELL_TEXT_LENGTH));
        };
        return result.isArray() ? result.mapValue(trim) : trim(result);
    }
}

class ExcelTextsplit extends Textsplit {
    protected override _createDefaultPadding(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.NA);
    }

    protected override _isEmptyInput(value: BaseValueObject): boolean {
        return super._isEmptyInput(value) || value.getValue() === '';
    }

    protected override _preserveTextTokens(): boolean {
        return true;
    }
}

class ExcelT extends T {
    protected override _resolveReference(value: BaseReferenceObject): BaseValueObject {
        if (value instanceof MultiAreaReferenceObject && value.isArrayOfReferences()) {
            return value.toArrayValueObject();
        }
        return super._resolveReference(value);
    }
}

function formulaInputText(value: BaseValueObject): string {
    if (value.isNull()) return '';
    return value.isNumber() ? formatExcelTextNumber(Number(value.getValue())) : formatValueForFormulaText(value.getValue());
}

function changeCase(value: BaseValueObject, uppercase: boolean): BaseValueObject {
    if (value.isError()) return value;
    const text = formulaInputText(value);
    if (!/[^ -~]/.test(text)) {
        return StringValueObject.create(uppercase ? text.toUpperCase() : text.toLowerCase());
    }
    const characters = Array.from(text);
    const result = characters.map((character, index) => {
        if (character.length > 1 || (character >= '\u1F00' && character <= '\u1FFF')) return character;
        if (!uppercase) {
            if (character === 'İ') return 'i';
            if (character === 'ẞ') return character;
            if (character === 'Σ') {
                const next = characters[index + 1];
                return next && (next.charCodeAt(0) >= 128 || /[A-Za-z0-9]/.test(next)) ? 'σ' : 'ς';
            }
            return character.toLowerCase();
        }
        if (character === 'ΐ') return 'Ϊ';
        if (character === 'ΰ') return 'Ϋ';
        const upper = character.toUpperCase();
        return upper.length === 1 ? upper : character;
    }).join('');
    return StringValueObject.create(result);
}

class ExcelLower extends Lower {
    protected override _handleSingleObject(value: BaseValueObject): BaseValueObject {
        return changeCase(value, false);
    }
}

class ExcelUpper extends Upper {
    protected override _handleSingleObject(value: BaseValueObject): BaseValueObject {
        return changeCase(value, true);
    }
}

class ExcelProper extends BaseFunction {
    override minParams = 1;
    override maxParams = 1;
    override needsReferenceObject = true;

    override calculate(input: BaseValueObject | BaseReferenceObject): BaseValueObject {
        const reference = input.isReferenceObject();
        const value = reference ? (input as BaseReferenceObject).toArrayValueObject() : input as BaseValueObject;
        if (!value.isArray()) return this._convert(value);
        const array = value as ArrayValueObject;
        if (reference && array.getRowCount() === 1 && array.getColumnCount() === 1) {
            return this._convert(array.getFirstCell());
        }
        return array.mapValue((element) => this._convert(element));
    }

    private _convert(value: BaseValueObject): BaseValueObject {
        if (value.isError()) return value;
        return StringValueObject.create(excelProperCase(formulaInputText(value)));
    }
}

function textCleanup(cleanup: (text: string) => string) {
    return class ExcelTextCleanup extends BaseFunction {
        override minParams = 1;
        override maxParams = 1;

        override calculate(input: BaseValueObject): BaseValueObject {
            return mapFinancialScalars([input], ([value]) => value.isError()
                ? value
                : StringValueObject.create(cleanup(formulaInputText(value))));
        }
    };
}

// eslint-disable-next-line no-control-regex
const ExcelClean = textCleanup((text) => text.replace(/[\x00-\x1F\x80-\x9F]/g, ''));
const ExcelTrim = textCleanup((text) => {
    const collapsed = text.replace(/ +/g, ' ');
    const from = collapsed.startsWith(' ') ? 1 : 0;
    const to = collapsed.endsWith(' ') ? collapsed.length - 1 : collapsed.length;
    return collapsed.slice(from, to);
});

abstract class ExcelCharacterWidth extends BaseFunction {
    override minParams = 1;
    override maxParams = 1;

    private _getRegion?: () => string;

    protected abstract _convertWidth(text: string): string;

    override bindCalculationRegion(getRegion: () => string): void {
        this._getRegion = getRegion;
    }

    override calculate(input: BaseValueObject): BaseValueObject {
        const convertWidth = usesEastAsianCharacterWidth(this._getRegion?.());
        return mapFinancialScalars([input], ([value]) => {
            if (value.isError()) return value;
            const text = formulaInputText(value);
            return StringValueObject.create(convertWidth ? this._convertWidth(text) : text);
        });
    }
}

class ExcelAsc extends ExcelCharacterWidth {
    protected override _convertWidth(text: string): string {
        return toHalfWidth(text);
    }
}

class ExcelDbcs extends ExcelCharacterWidth {
    protected override _convertWidth(text: string): string {
        return toFullWidth(text);
    }
}

class ExcelTocol extends Tocol {
    protected override _flattenValue(value: BaseValueObject): BaseValueObject {
        return value;
    }

    protected override _preservesSingletonArray(): boolean {
        return true;
    }
}

class ExcelTorow extends Torow {
    protected override _flattenValue(value: BaseValueObject): BaseValueObject {
        return value;
    }

    protected override _preservesSingletonArray(): boolean {
        return true;
    }
}

export const excelTextSerializationFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelBahttext, FUNCTION_NAMES_TEXT.BAHTTEXT],
    [ExcelDollar, FUNCTION_NAMES_TEXT.DOLLAR],
    [ExcelFixed, FUNCTION_NAMES_TEXT.FIXED],
    [ExcelText, FUNCTION_NAMES_TEXT.TEXT],
    [ExcelTocol, FUNCTION_NAMES_LOOKUP.TOCOL],
    [ExcelTorow, FUNCTION_NAMES_LOOKUP.TOROW],
    [ExcelArraytotext, FUNCTION_NAMES_TEXT.ARRAYTOTEXT],
    [ExcelAsc, FUNCTION_NAMES_TEXT.ASC],
    [ExcelDbcs, FUNCTION_NAMES_TEXT.DBCS],
    [ExcelClean, FUNCTION_NAMES_TEXT.CLEAN],
    [ExcelConcat, FUNCTION_NAMES_TEXT.CONCAT],
    [ExcelConcatenate, FUNCTION_NAMES_TEXT.CONCATENATE],
    [ExcelLower, FUNCTION_NAMES_TEXT.LOWER],
    [ExcelProper, FUNCTION_NAMES_TEXT.PROPER],
    [ExcelRept, FUNCTION_NAMES_TEXT.REPT],
    [ExcelT, FUNCTION_NAMES_TEXT.T],
    [ExcelTextjoin, FUNCTION_NAMES_TEXT.TEXTJOIN],
    [ExcelTextsplit, FUNCTION_NAMES_TEXT.TEXTSPLIT],
    [ExcelTrim, FUNCTION_NAMES_TEXT.TRIM],
    [ExcelUpper, FUNCTION_NAMES_TEXT.UPPER],
    [ExcelNumbervalue, FUNCTION_NAMES_TEXT.NUMBERVALUE],
    [ExcelValue, FUNCTION_NAMES_TEXT.VALUE],
    [ExcelValuetotext, FUNCTION_NAMES_TEXT.VALUETOTEXT],
];
