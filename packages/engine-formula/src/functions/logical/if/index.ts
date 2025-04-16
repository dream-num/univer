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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class If extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(logicalTest: BaseValueObject, valueIfTrue: BaseValueObject, valueIfFalse: BaseValueObject = BooleanValueObject.create(false)) {
        // get single value object
        const _logicalTest = this._getSingleValueObject(logicalTest);

        if (_logicalTest.isError()) {
            return _logicalTest;
        }

        if (!_logicalTest.isArray()) {
            return _logicalTest.getValue() ? valueIfTrue : valueIfFalse;
        }

        // get max row length
        const maxRowLength = Math.max(
            _logicalTest.isArray() ? (_logicalTest as ArrayValueObject).getRowCount() : 1,
            valueIfTrue.isArray() ? (valueIfTrue as ArrayValueObject).getRowCount() : 1,
            valueIfFalse.isArray() ? (valueIfFalse as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            _logicalTest.isArray() ? (_logicalTest as ArrayValueObject).getColumnCount() : 1,
            valueIfTrue.isArray() ? (valueIfTrue as ArrayValueObject).getColumnCount() : 1,
            valueIfFalse.isArray() ? (valueIfFalse as ArrayValueObject).getColumnCount() : 1
        );

        const logicalTestArray = expandArrayValueObject(maxRowLength, maxColumnLength, _logicalTest);
        const valueIfTrueArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfTrue, ErrorValueObject.create(ErrorType.NA));
        const valueIfFalseArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfFalse, ErrorValueObject.create(ErrorType.NA));

        return logicalTestArray.map((logicalTestValue, rowIndex, columnIndex) => {
            if (logicalTestValue.isNull()) {
                return ErrorValueObject.create(ErrorType.NA);
            } else {
                const valueIfTrueValue = valueIfTrueArray.get(rowIndex, columnIndex) || NullValueObject.create();
                const valueIfFalseValue = valueIfFalseArray.get(rowIndex, columnIndex) || NullValueObject.create();

                return this._calculateSingleCell(logicalTestValue, valueIfTrueValue, valueIfFalseValue);
            }
        });
    }

    private _getSingleValueObject(valueObject: BaseValueObject) {
        if (valueObject.isArray() && (valueObject as ArrayValueObject).getRowCount() === 1 && (valueObject as ArrayValueObject).getColumnCount() === 1) {
            return (valueObject as ArrayValueObject).getFirstCell();
        }
        return valueObject;
    }

    private _calculateSingleCell(logicalTest: BaseValueObject, valueIfTrue: BaseValueObject, valueIfFalse: BaseValueObject) {
        if (logicalTest.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const logicalTestValue = logicalTest.getValue();

        // true or non-zero
        if (logicalTestValue) {
            if (valueIfTrue.isNull()) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            return valueIfTrue;
        }

        if (valueIfFalse.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        return valueIfFalse;
    }
}
