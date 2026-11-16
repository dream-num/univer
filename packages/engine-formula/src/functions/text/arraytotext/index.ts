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

    private _handleSingleObject(array: BaseValueObject, format: BaseValueObject): BaseValueObject {
        if (array.isError()) {
            return array;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(format);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [formatObject] = variants as BaseValueObject[];

        const formatValue = +formatObject.getValue();
        if (formatValue !== 0 && formatValue !== 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        let result = '';

        for (let r = 0; r < arrayRowCount; r++) {
            for (let c = 0; c < arrayColumnCount; c++) {
                const valueObject = array.isArray() ? (array as ArrayValueObject).getRealValue(r, c) : array;
                let value = valueObject == null || valueObject.isNull() ? '' : String(valueObject.getValue());
                if (valueObject?.isNumber()) {
                    value = formatNumber(Number(valueObject.getValue()));
                } else if (valueObject?.isBoolean()) {
                    value = value.toUpperCase();
                }
                if (valueObject?.isString() && formatValue) {
                    result += `"${value.replace(/"/g, '""')}"`;
                } else {
                    result += value;
                }

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
}

function formatNumber(value: number): string {
    if (!Number.isFinite(value) || (Number.isInteger(value) && Math.abs(value) < 1e15)) {
        return String(value);
    }
    const [coefficient, power] = Math.abs(value).toExponential(14).split('e');
    const exponent = Number(power);
    const mantissa = coefficient.replace(/\.?0+$/, '');
    const sign = value < 0 ? '-' : '';
    if (exponent >= 20 || exponent < -18) {
        return `${sign}${mantissa}E${power}`;
    }
    const digits = mantissa.replace('.', '');
    const point = exponent + 1;
    if (point <= 0) {
        return `${sign}0.${'0'.repeat(-point)}${digits}`;
    }
    if (point >= digits.length) {
        return sign + digits.padEnd(point, '0');
    }
    return `${sign}${digits.slice(0, point)}.${digits.slice(point)}`;
}
