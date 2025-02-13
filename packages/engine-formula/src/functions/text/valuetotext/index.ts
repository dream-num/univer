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
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Valuetotext extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(value: BaseValueObject, format?: BaseValueObject): BaseValueObject {
        const _format = format ?? NumberValueObject.create(0);

        const maxRowLength = Math.max(
            value.isArray() ? (value as ArrayValueObject).getRowCount() : 1,
            _format.isArray() ? (_format as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            value.isArray() ? (value as ArrayValueObject).getColumnCount() : 1,
            _format.isArray() ? (_format as ArrayValueObject).getColumnCount() : 1
        );

        const valueArray = expandArrayValueObject(maxRowLength, maxColumnLength, value, ErrorValueObject.create(ErrorType.NA));
        const formatArray = expandArrayValueObject(maxRowLength, maxColumnLength, _format, ErrorValueObject.create(ErrorType.NA));

        const resultArray = valueArray.mapValue((valueObject, rowIndex, columnIndex) => {
            const formatObject = formatArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (valueObject.isError()) {
                return valueObject;
            }

            if (formatObject.isError()) {
                return formatObject;
            }

            return this._handleSingleObject(valueObject, formatObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(value: BaseValueObject, format: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(format);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [formatObject] = variants as BaseValueObject[];

        const formatValue = Math.floor(+formatObject.getValue());

        if (formatValue < 0 || formatValue > 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (value.isNull()) {
            return StringValueObject.create('');
        }

        if (value.isBoolean()) {
            return value;
        }

        if (value.isNumber()) {
            return NumberValueObject.create(value.getValue() as number);
        }

        const result = formatValue ? `"${value.getValue()}"` : `${value.getValue()}`;

        return StringValueObject.create(result);
    }
}
