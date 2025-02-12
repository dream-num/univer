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
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Torow extends BaseFunction {
    override minParams = 1;

    override maxParams = 3;

    override calculate(array: BaseValueObject, ignore?: BaseValueObject, scanByColumn?: BaseValueObject): BaseValueObject {
        const _ignore = ignore ?? NumberValueObject.create(0);
        const _scanByColumn = scanByColumn ?? BooleanValueObject.create(false);

        const maxRowLength = Math.max(
            _ignore.isArray() ? (_ignore as ArrayValueObject).getRowCount() : 1,
            _scanByColumn.isArray() ? (_scanByColumn as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            _ignore.isArray() ? (_ignore as ArrayValueObject).getColumnCount() : 1,
            _scanByColumn.isArray() ? (_scanByColumn as ArrayValueObject).getColumnCount() : 1
        );

        const ignoreArray = expandArrayValueObject(maxRowLength, maxColumnLength, _ignore, ErrorValueObject.create(ErrorType.NA));
        const scanByColumnArray = expandArrayValueObject(maxRowLength, maxColumnLength, _scanByColumn, ErrorValueObject.create(ErrorType.NA));

        const resultArray = ignoreArray.mapValue((ignoreObject, rowIndex, columnIndex) => {
            const scanByColumnObject = scanByColumnArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (array.isError()) {
                return array;
            }

            if (ignoreObject.isError()) {
                return ignoreObject;
            }

            if (scanByColumnObject.isError()) {
                return scanByColumnObject;
            }

            const ignoreValue = Math.trunc(+ignoreObject.getValue());
            const scanByColumnValue = +scanByColumnObject.getValue();

            if (Number.isNaN(ignoreValue) || ignoreValue < 0 || ignoreValue > 3 || Number.isNaN(scanByColumnValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (array.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (!array.isArray()) {
                return array;
            }

            let result: BaseValueObject[] = [];

            if (scanByColumnValue) {
                result = this._getArrayValueByColumn(array, ignoreValue);
            } else {
                result = this._getArrayValueByRow(array, ignoreValue);
            }

            if (result.length === 0) {
                return ErrorValueObject.create(ErrorType.CALC);
            }

            if (maxRowLength > 1 || maxColumnLength > 1 || result.length === 1) {
                return result[0];
            }

            return ArrayValueObject.create({
                calculateValueList: [result],
                rowCount: 1,
                columnCount: result.length,
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

    private _getArrayValueByColumn(array: BaseValueObject, ignore: number): BaseValueObject[] {
        const _array = array as ArrayValueObject;
        const arrayRowCount = _array.getRowCount();
        const arrayColumnCount = _array.getColumnCount();

        const result: BaseValueObject[] = [];

        for (let c = 0; c < arrayColumnCount; c++) {
            for (let r = 0; r < arrayRowCount; r++) {
                const valueObject = _array.get(r, c) as BaseValueObject;

                if (!this._isIgnore(valueObject, ignore)) {
                    result.push(valueObject.isNull() ? NumberValueObject.create(0) : valueObject);
                }
            }
        }

        return result;
    }

    private _getArrayValueByRow(array: BaseValueObject, ignore: number): BaseValueObject[] {
        const _array = array as ArrayValueObject;
        const arrayRowCount = _array.getRowCount();
        const arrayColumnCount = _array.getColumnCount();

        const result: BaseValueObject[] = [];

        for (let r = 0; r < arrayRowCount; r++) {
            for (let c = 0; c < arrayColumnCount; c++) {
                const valueObject = _array.get(r, c) as BaseValueObject;

                if (!this._isIgnore(valueObject, ignore)) {
                    result.push(valueObject.isNull() ? NumberValueObject.create(0) : valueObject);
                }
            }
        }

        return result;
    }

    private _isIgnore(valueObject: BaseValueObject, ignore: number): boolean {
        switch (ignore) {
            case 0:
                return false;
            case 1:
                return valueObject.isNull();
            case 2:
                return valueObject.isError();
            case 3:
                return valueObject.isNull() || valueObject.isError();
            default:
                return false;
        }
    }
}
