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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Filter extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(array: BaseValueObject, include: BaseValueObject, ifEmpty?: BaseValueObject) {
        const _ifEmpty = ifEmpty == null || ifEmpty.isNull() ? ErrorValueObject.create(ErrorType.CALC) : ifEmpty;

        if (array.isError()) {
            return array;
        }

        if (include.isError()) {
            return include;
        }

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const includeRowCount = include.isArray() ? (include as ArrayValueObject).getRowCount() : 1;
        const includeColumnCount = include.isArray() ? (include as ArrayValueObject).getColumnCount() : 1;

        const filterColumns = includeRowCount === 1 && includeColumnCount === arrayColumnCount;
        const filterRows = includeColumnCount === 1 && includeRowCount === arrayRowCount;
        if (!filterColumns && !filterRows) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (arrayRowCount === 1 && arrayColumnCount === 1) {
            return this._getResultArrayByR1C1(array, include, _ifEmpty);
        }

        return filterColumns
            ? this._getResultArrayByR1(arrayRowCount, arrayColumnCount, array, include, _ifEmpty)
            : this._getResultArrayByC1(arrayRowCount, arrayColumnCount, array, include, _ifEmpty);
    }

    private _getIncludeValue(include: BaseValueObject, row: number, column: number): BaseValueObject {
        const value = include.isArray()
            ? (include as ArrayValueObject).getValueOrDefault(row, column) ?? NullValueObject.create()
            : include;
        if (!value.isString()) {
            return value;
        }

        const text = String(value.getValue()).toUpperCase();
        if (text === 'TRUE' || text === 'FALSE') {
            return BooleanValueObject.create(text === 'TRUE');
        }
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    private _getResultArrayByR1C1(array: BaseValueObject, include: BaseValueObject, ifEmpty: BaseValueObject): BaseValueObject {
        const _include = this._getIncludeValue(include, 0, 0);
        if (_include.isError()) {
            return _include;
        }

        const includeValue = +_include.getValue();

        if (includeValue) {
            return expandArrayValueObject(1, 1, array);
        }

        return ifEmpty;
    }

    private _getResultArrayByR1(arrayRowCount: number, arrayColumnCount: number, array: BaseValueObject, include: BaseValueObject, ifEmpty: BaseValueObject): BaseValueObject {
        const resultArray: Array<Array<BaseValueObject>> = [];

        for (let c = 0; c < arrayColumnCount; c++) {
            const includeObject = this._getIncludeValue(include, 0, c);
            if (includeObject.isError()) {
                return includeObject;
            }

            const includeValue = +includeObject.getValue();

            if (!includeValue) {
                continue;
            }

            for (let r = 0; r < arrayRowCount; r++) {
                if (!resultArray[r]) {
                    resultArray[r] = [];
                }

                const arrayObject = (array as ArrayValueObject).get(r, c) as BaseValueObject;

                resultArray[r].push(arrayObject);
            }
        }

        if (resultArray.length === 0) {
            return ifEmpty;
        }

        return ArrayValueObject.create({
            calculateValueList: resultArray,
            rowCount: resultArray.length,
            columnCount: resultArray[0].length || 0,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }

    private _getResultArrayByC1(arrayRowCount: number, arrayColumnCount: number, array: BaseValueObject, include: BaseValueObject, ifEmpty: BaseValueObject): BaseValueObject {
        const resultArray: Array<Array<BaseValueObject>> = [];

        for (let r = 0; r < arrayRowCount; r++) {
            const includeObject = this._getIncludeValue(include, r, 0);
            if (includeObject.isError()) {
                return includeObject;
            }

            const includeValue = +includeObject.getValue();

            if (!includeValue) {
                continue;
            }

            const row = [];

            for (let c = 0; c < arrayColumnCount; c++) {
                const arrayObject = (array as ArrayValueObject).get(r, c) as BaseValueObject;

                row.push(arrayObject);
            }

            resultArray.push(row);
        }

        if (resultArray.length === 0) {
            return ifEmpty;
        }

        return ArrayValueObject.create({
            calculateValueList: resultArray,
            rowCount: resultArray.length,
            columnCount: resultArray[0].length || 0,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }
}
