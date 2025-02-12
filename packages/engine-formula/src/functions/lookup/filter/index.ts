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
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';

import { BaseFunction } from '../../base-function';

export class Filter extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(array: BaseValueObject, include: BaseValueObject, ifEmpty?: BaseValueObject) {
        const _ifEmpty = ifEmpty ?? ErrorValueObject.create(ErrorType.CALC);

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

        if (includeRowCount > 1 && includeColumnCount > 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if ((includeRowCount === 1 && includeColumnCount !== arrayColumnCount) || (includeColumnCount === 1 && includeRowCount !== arrayRowCount)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (arrayRowCount === 1 && arrayColumnCount === 1) {
            return this._getResultArrayByR1C1(array, include, _ifEmpty);
        }

        if (includeRowCount === 1) {
            if (includeColumnCount !== arrayColumnCount) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return this._getResultArrayByR1(arrayRowCount, arrayColumnCount, array, include, _ifEmpty);
        }

        if (includeColumnCount === 1) {
            if (includeRowCount !== arrayRowCount) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return this._getResultArrayByC1(arrayRowCount, arrayColumnCount, array, include, _ifEmpty);
        }

        return _ifEmpty;
    }

    private _getResultArrayByR1C1(array: BaseValueObject, include: BaseValueObject, ifEmpty: BaseValueObject): BaseValueObject {
        let _array = array;
        let _include = include;

        if (_array.isArray()) {
            _array = (_array as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_include.isArray()) {
            _include = (_include as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_include.isString()) {
            _include = _include.convertToNumberObjectValue();
        }

        if (_include.isError()) {
            return _include;
        }

        const includeValue = +_include.getValue();

        if (includeValue) {
            return _array;
        }

        return ifEmpty;
    }

    private _getResultArrayByR1(arrayRowCount: number, arrayColumnCount: number, array: BaseValueObject, include: BaseValueObject, ifEmpty: BaseValueObject): BaseValueObject {
        const resultArray: Array<Array<BaseValueObject>> = [];

        for (let c = 0; c < arrayColumnCount; c++) {
            let includeObject = (include as ArrayValueObject).get(0, c) as BaseValueObject;

            if (includeObject.isString()) {
                includeObject = includeObject.convertToNumberObjectValue();
            }

            if (includeObject.isError()) {
                return includeObject as ErrorValueObject;
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
            let includeObject = (include as ArrayValueObject).get(r, 0) as BaseValueObject;

            if (includeObject.isString()) {
                includeObject = includeObject.convertToNumberObjectValue();
            }

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
