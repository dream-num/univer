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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { formatExcelTextNumber } from '../format-excel-text-number';

export class Arraytotext extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(array: BaseValueObject, format?: BaseValueObject): BaseValueObject {
        let _format = format ?? NumberValueObject.create(0);

        if (format?.isNull()) {
            _format = NumberValueObject.create(0);
        }

        if (_format.isArray()) {
            const resultArray = (_format as ArrayValueObject).mapValue((formatObject) => this._handleSingleObject(array, formatObject));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(array, _format);
    }

    protected _handleSingleObject(array: BaseValueObject, format: BaseValueObject): BaseValueObject {
        if (array.isError()) {
            return array;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(format);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [formatObject] = variants as BaseValueObject[];

        const formatValue = this._readFormat(formatObject);
        if (formatValue !== 0 && formatValue !== 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        let result = '';

        for (let r = 0; r < arrayRowCount; r++) {
            for (let c = 0; c < arrayColumnCount; c++) {
                const valueObject = array.isArray() ? (array as ArrayValueObject).getRealValue(r, c) : array;
                result += this._serializeCell(valueObject, formatValue === 1);

                if (!(r === arrayRowCount - 1 && c === arrayColumnCount - 1)) {
                    if (formatValue) {
                        if (c === arrayColumnCount - 1) {
                            result += ';';
                        } else {
                            result += ',';
                        }
                    } else {
                        result += ', ';
                    }
                }
            }
        }

        if (formatValue) {
            result = `{${result}}`;
        }

        if (result.length > 32767) {
            return ErrorValueObject.create(ErrorType.CALC);
        }

        return StringValueObject.create(result);
    }

    private _serializeCell(value: BaseValueObject | null | undefined, strict: boolean): string {
        if (value == null || value.isNull()) return '';
        if (value.isNumber()) return this._formatNumber(Number(value.getValue()));
        const text = String(value.getValue());
        if (value.isBoolean()) return text.toUpperCase();
        return value.isString() && strict ? `"${text.replace(/"/g, '""')}"` : text;
    }

    protected _formatNumber(value: number): string {
        return formatExcelTextNumber(value, false);
    }

    protected _readFormat(format: BaseValueObject): number {
        return Number(format.getValue());
    }
}
