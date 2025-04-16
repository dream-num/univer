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

import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Log extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(number: BaseValueObject, base?: BaseValueObject) {
        const _base = base ?? NumberValueObject.create(10);

        if (number.isError()) {
            return number;
        }

        if (_base.isError()) {
            return _base;
        }

        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            _base.isArray() ? (_base as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            _base.isArray() ? (_base as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const baseArray = expandArrayValueObject(maxRowLength, maxColumnLength, _base, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.map((numberObject, rowIndex, columnIndex) => {
            let baseObject = baseArray.get(rowIndex, columnIndex) as BaseValueObject;

            let _numberObject = numberObject;

            if (_numberObject.isString()) {
                _numberObject = _numberObject.convertToNumberObjectValue();
            }

            if (_numberObject.isError()) {
                return _numberObject;
            }

            if (baseObject.isString()) {
                baseObject = baseObject.convertToNumberObjectValue();
            }

            if (baseObject.isError()) {
                return baseObject;
            }

            const numberValue = +_numberObject.getValue();
            const baseValue = +baseObject.getValue();

            if (numberValue <= 0 || baseValue <= 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const baseLog = Math.log(baseValue);

            if (baseLog === 0) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            const result = Math.log(numberValue) / baseLog;

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
