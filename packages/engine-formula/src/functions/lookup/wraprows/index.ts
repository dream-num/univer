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
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Wraprows extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(vector: BaseValueObject, wrapCount: BaseValueObject, padWith?: BaseValueObject): BaseValueObject {
        let _padWith = padWith ?? ErrorValueObject.create(ErrorType.NA);

        if (_padWith.isNull()) {
            _padWith = ErrorValueObject.create(ErrorType.NA);
        }

        const vectorRowCount = vector.isArray() ? (vector as ArrayValueObject).getRowCount() : 1;
        const vectorColumnCount = vector.isArray() ? (vector as ArrayValueObject).getColumnCount() : 1;

        const maxRowLength = Math.max(
            wrapCount.isArray() ? (wrapCount as ArrayValueObject).getRowCount() : 1,
            _padWith.isArray() ? (_padWith as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            wrapCount.isArray() ? (wrapCount as ArrayValueObject).getColumnCount() : 1,
            _padWith.isArray() ? (_padWith as ArrayValueObject).getColumnCount() : 1
        );

        const wrapCountArray = expandArrayValueObject(maxRowLength, maxColumnLength, wrapCount, ErrorValueObject.create(ErrorType.NA));
        const padWithArray = expandArrayValueObject(maxRowLength, maxColumnLength, _padWith, ErrorValueObject.create(ErrorType.NA));

        const resultArray = wrapCountArray.mapValue((wrapCountObject, rowIndex, columnIndex) => {
            const padWithObject = padWithArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (vector.isError()) {
                return vector;
            }

            if (vector.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (wrapCountObject.isError()) {
                return wrapCountObject;
            }

            const wrapCountValue = Math.trunc(+wrapCountObject.getValue());

            if (
                (vectorRowCount > 1 && vectorColumnCount > 1) ||
                Number.isNaN(wrapCountValue)
            ) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (wrapCountValue < 1) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const vectorArray = vector.isArray() ? (vector as ArrayValueObject).getArrayValue().flat() : [vector];

            const result = this._getWrapArray(vectorArray as BaseValueObject[], wrapCountValue, padWithObject);

            if (maxRowLength > 1 || maxColumnLength > 1 || (result.length === 1 && result[0].length === 1)) {
                return result[0][0];
            }

            return ArrayValueObject.create({
                calculateValueList: result,
                rowCount: result.length,
                columnCount: result[0].length,
                unitId: this.unitId as string,
                sheetId: this.subUnitId as string,
                row: this.row,
                column: this.column,
            });
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _getWrapArray(vectorArray: BaseValueObject[], wrapCount: number, padWith: BaseValueObject): BaseValueObject[][] {
        const rows = Math.ceil(vectorArray.length / wrapCount);

        const _wrapCount = rows > 1 ? wrapCount : vectorArray.length;

        const result: BaseValueObject[][] = [];

        for (let r = 0; r < rows; r++) {
            const row = [];

            for (let c = 0; c < _wrapCount; c++) {
                const index = r * _wrapCount + c;

                if (index < vectorArray.length) {
                    row.push(vectorArray[index].isNull() ? NumberValueObject.create(0) : vectorArray[index]);
                } else {
                    row.push(padWith);
                }
            }

            result.push(row);
        }

        return result;
    }
}
