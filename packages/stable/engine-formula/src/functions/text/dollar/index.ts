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
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { round } from '../../../engine/utils/math-kit';
import { applyCurrencyFormat } from '../../../engine/utils/numfmt-kit';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Dollar extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override needsLocale = true;

    override calculate(number: BaseValueObject, decimals?: BaseValueObject): BaseValueObject {
        let _decimals = decimals ?? NumberValueObject.create(2);

        if (_decimals.isNull()) {
            _decimals = NumberValueObject.create(2);
        }

        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            _decimals.isArray() ? (_decimals as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            _decimals.isArray() ? (_decimals as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const decimalsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _decimals, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.mapValue((numberObject, rowIndex, columnIndex) => {
            const decimalsObject = decimalsArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (numberObject.isError()) {
                return numberObject;
            }

            if (decimalsObject.isError()) {
                return decimalsObject;
            }

            return this._handleSingleObject(numberObject, decimalsObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(number: BaseValueObject, decimals: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(number, decimals);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject, decimalsObject] = variants as BaseValueObject[];

        let numberValue = +numberObject.getValue();
        let decimalsValue = Math.trunc(+decimalsObject.getValue());

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

        const result = applyCurrencyFormat(this.getLocale(), numberValue, decimalsValue);

        return StringValueObject.create(result);
    }
}
