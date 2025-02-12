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
import { getFormatPreview } from '../../../basics/format';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { round } from '../../../engine/utils/math-kit';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Fixed extends BaseFunction {
    override minParams = 1;

    override maxParams = 3;

    override calculate(number: BaseValueObject, decimals?: BaseValueObject, noCommas?: BaseValueObject): BaseValueObject {
        let _decimals = decimals ?? NumberValueObject.create(2);

        if (_decimals.isNull()) {
            _decimals = NumberValueObject.create(2);
        }

        let _noCommas = noCommas ?? BooleanValueObject.create(false);

        if (_noCommas.isNull()) {
            _noCommas = BooleanValueObject.create(false);
        }

        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            _decimals.isArray() ? (_decimals as ArrayValueObject).getRowCount() : 1,
            _noCommas.isArray() ? (_noCommas as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            _decimals.isArray() ? (_decimals as ArrayValueObject).getColumnCount() : 1,
            _noCommas.isArray() ? (_noCommas as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const decimalsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _decimals, ErrorValueObject.create(ErrorType.NA));
        const noCommasArray = expandArrayValueObject(maxRowLength, maxColumnLength, _noCommas, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.mapValue((numberObject, rowIndex, columnIndex) => {
            const decimalsObject = decimalsArray.get(rowIndex, columnIndex) as BaseValueObject;
            const noCommasObject = noCommasArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (numberObject.isError()) {
                return numberObject;
            }

            if (decimalsObject.isError()) {
                return decimalsObject;
            }

            if (noCommasObject.isError()) {
                return noCommasObject;
            }

            return this._handleSingleObject(numberObject, decimalsObject, noCommasObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(number: BaseValueObject, decimals: BaseValueObject, noCommas: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(number, decimals, noCommas);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject, decimalsObject, noCommasObject] = variants as BaseValueObject[];

        let numberValue = +numberObject.getValue();
        let decimalsValue = Math.trunc(+decimalsObject.getValue());
        const noCommasValue = +noCommasObject.getValue();

        if (decimalsValue > 127) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (decimalsValue < 0) {
            if (`${numberValue}`.length < Math.abs(decimalsValue)) {
                numberValue = 0;
            } else {
                numberValue = numberValue < 0 ? -round(Math.abs(numberValue), decimalsValue) : round(numberValue, decimalsValue);
            }

            decimalsValue = 0;
        }

        let pattern = noCommasValue ? '###0' : '#,##0';

        if (decimalsValue > 0) {
            pattern += `.${'0'.repeat(decimalsValue)}`;
        }

        const result = getFormatPreview(pattern, numberValue);

        return StringValueObject.create(result);
    }
}
