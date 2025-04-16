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

import type { Nullable } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { getCompare } from '../../../engine/utils/compare';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';

import { BaseFunction } from '../../base-function';

export class Sort extends BaseFunction {
    override minParams = 1;

    override maxParams = 4;

    override calculate(array: BaseValueObject, sortIndex?: BaseValueObject, sortOrder?: BaseValueObject, byCol?: BaseValueObject) {
        const _sortIndex = sortIndex ?? NumberValueObject.create(1);
        const _sortOrder = sortOrder ?? NumberValueObject.create(1);
        const _byCol = byCol ?? BooleanValueObject.create(false);

        if (_byCol.isArray()) {
            const byColRowCount = (_byCol as ArrayValueObject).getRowCount();
            const byColColumnCount = (_byCol as ArrayValueObject).getColumnCount();

            if (byColRowCount === 1 && byColColumnCount === 1) {
                const byColObject = (_byCol as ArrayValueObject).get(0, 0) as BaseValueObject;

                return this._handleSingleObject(array, _sortIndex, _sortOrder, byColObject);
            }

            return _byCol.map((byColObject) => {
                const result = this._handleSingleObject(array, _sortIndex, _sortOrder, byColObject);

                return result.isArray() ? (result as ArrayValueObject).get(0, 0) as BaseValueObject : result;
            });
        }

        return this._handleSingleObject(array, _sortIndex, _sortOrder, _byCol);
    }

    private _handleSingleObject(array: BaseValueObject, sortIndex: BaseValueObject, sortOrder: BaseValueObject, byCol: BaseValueObject) {
        if (array.isError()) {
            return array;
        }

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const _sortIndex = this._checkArrayError(sortIndex);

        if (_sortIndex.isError()) {
            return _sortIndex;
        }

        const sortIndexValue = Math.floor(+_sortIndex.getValue());

        if (sortIndexValue < 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const _sortOrder = this._checkArrayError(sortOrder);

        if (_sortOrder.isError()) {
            return _sortOrder;
        }

        const sortOrderValue = Math.floor(+_sortOrder.getValue());

        if (sortOrderValue !== -1 && sortOrderValue !== 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let _byCol = byCol;

        if (_byCol.isString()) {
            _byCol = _byCol.convertToNumberObjectValue();
        }

        if (_byCol.isError()) {
            return _byCol;
        }

        if (!array.isArray() || (arrayRowCount === 1 && arrayColumnCount === 1)) {
            return array;
        }

        const byColValue = +_byCol.getValue();

        return this._getResult(array, sortIndexValue, sortOrderValue, byColValue, arrayRowCount, arrayColumnCount);
    }

    private _checkArrayError(variant: BaseValueObject): BaseValueObject {
        let _variant = variant;

        if (_variant.isArray()) {
            const rowCount = (_variant as ArrayValueObject).getRowCount();
            const columnCount = (_variant as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _variant = (_variant as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_variant.isString()) {
            _variant = _variant.convertToNumberObjectValue();
        }

        return _variant;
    }

    private _getResult(array: BaseValueObject, sortIndexValue: number, sortOrderValue: 1 | -1, byColValue: number, arrayRowCount: number, arrayColumnCount: number): BaseValueObject {
        if (!byColValue) {
            if (sortIndexValue > arrayColumnCount) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const arrayValue = array.getArrayValue();
            arrayValue.sort(this._sort(sortIndexValue - 1, sortOrderValue));

            return ArrayValueObject.create({
                calculateValueList: arrayValue,
                rowCount: arrayValue.length,
                columnCount: arrayValue[0].length || 0,
                unitId: this.unitId as string,
                sheetId: this.subUnitId as string,
                row: this.row,
                column: this.column,
            });
        } else {
            if (sortIndexValue > arrayRowCount) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const arrayValue = (array as ArrayValueObject).transpose().getArrayValue();
            arrayValue.sort(this._sort(sortIndexValue - 1, sortOrderValue));

            const newArray = ArrayValueObject.create({
                calculateValueList: arrayValue,
                rowCount: arrayValue.length,
                columnCount: arrayValue[0].length || 0,
                unitId: this.unitId as string,
                sheetId: this.subUnitId as string,
                row: this.row,
                column: this.column,
            });

            return newArray.transpose();
        }
    }

    private _sort(sortIndex: number, sortOrder: 1 | -1 = 1) {
        const compare = getCompare();

        if (sortOrder === 1) {
            return this._sortAsc(sortIndex, compare);
        } else {
            return this._sortDesc(sortIndex, compare);
        }
    }

    private _sortAsc(sortIndex: number, compare: Function) {
        return (a: Nullable<BaseValueObject>[], b: Nullable<BaseValueObject>[]) => {
            const columnA = a[sortIndex];
            const columnB = b[sortIndex];

            if (columnA == null || columnA.isNull()) {
                return 1;
            }

            if (columnB == null || columnB.isNull()) {
                return -1;
            }

            if (columnA.isError() && columnB.isError()) {
                return 0;
            }

            if (columnA.isError()) {
                return 1;
            }

            if (columnB.isError()) {
                return -1;
            }

            const columnAValue = (columnA as BaseValueObject).getValue();
            const columnBValue = (columnB as BaseValueObject).getValue();

            if (columnA.isBoolean() && columnAValue === true) {
                return 1;
            }

            if (columnB.isBoolean() && columnBValue === true) {
                return -1;
            }

            if (columnA.isBoolean() && columnAValue === false) {
                return 1;
            }

            if (columnB.isBoolean() && columnBValue === false) {
                return -1;
            }

            if (columnA.isNumber() && columnB.isNumber()) {
                return (+columnAValue) - (+columnBValue);
            }

            return compare(
                columnAValue as string,
                columnBValue as string
            );
        };
    }

    private _sortDesc(sortIndex: number, compare: Function) {
        return (a: Nullable<BaseValueObject>[], b: Nullable<BaseValueObject>[]) => {
            const columnA = a[sortIndex];
            const columnB = b[sortIndex];

            if (columnA == null || columnA.isNull()) {
                return 1;
            }

            if (columnB == null || columnB.isNull()) {
                return -1;
            }

            if (columnA.isError() && columnB.isError()) {
                return 0;
            }

            if (columnA.isError()) {
                return -1;
            }

            if (columnB.isError()) {
                return 1;
            }

            const columnAValue = (columnA as BaseValueObject).getValue();
            const columnBValue = (columnB as BaseValueObject).getValue();

            if (columnA.isBoolean() && columnAValue === true) {
                return -1;
            }

            if (columnB.isBoolean() && columnBValue === true) {
                return 1;
            }

            if (columnA.isBoolean() && columnAValue === false) {
                return -1;
            }

            if (columnB.isBoolean() && columnBValue === false) {
                return 1;
            }

            if (columnA.isNumber() && columnB.isNumber()) {
                return (+columnBValue) - (+columnAValue);
            }

            return compare(
                columnBValue as string,
                columnAValue as string
            );
        };
    }
}
