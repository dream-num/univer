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
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class If extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(logicalTest: BaseValueObject, valueIfTrue: BaseValueObject, valueIfFalse: BaseValueObject = BooleanValueObject.create(false)) {
        let _logicalTest = logicalTest;

        if (logicalTest.isArray()) {
            const rowCount = (logicalTest as ArrayValueObject).getRowCount();
            const columnCount = (logicalTest as ArrayValueObject).getColumnCount();

            if (rowCount === 1 && columnCount === 1) {
                _logicalTest = (logicalTest as ArrayValueObject).get(0, 0) as BaseValueObject;
            }
        }

        if (!_logicalTest.isArray()) {
            return this._handleSingleObject(_logicalTest, valueIfTrue, valueIfFalse);
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

        const logicalTestArray = expandArrayValueObject(maxRowLength, maxColumnLength, _logicalTest, ErrorValueObject.create(ErrorType.NA));
        const valueIfTrueArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfTrue, ErrorValueObject.create(ErrorType.NA));
        const valueIfFalseArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfFalse, ErrorValueObject.create(ErrorType.NA));

        return logicalTestArray.mapValue((logicalTestValue, rowIndex, columnIndex) => {
            const valueIfTrueValue = valueIfTrueArray.get(rowIndex, columnIndex) as BaseValueObject;
            const valueIfFalseValue = valueIfFalseArray.get(rowIndex, columnIndex) as BaseValueObject;

            return this._handleSingleObject(logicalTestValue, valueIfTrueValue, valueIfFalseValue);
        });
    }

    private _handleSingleObject(logicalTest: BaseValueObject, valueIfTrue: BaseValueObject, valueIfFalse: BaseValueObject) {
        if (logicalTest.isError()) {
            return logicalTest;
        }

        const logicalTestValue = logicalTest.getValue();

        // true or non-zero
        return logicalTestValue
            ? valueIfTrue.isNull()
                ? NumberValueObject.create(0)
                : valueIfTrue
            : valueIfFalse.isNull()
                ? NumberValueObject.create(0)
                : valueIfFalse;
    }
}
