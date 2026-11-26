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
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { createSortCompare } from '../../../engine/utils/sort-compare';
import { compareSortValues, getSortIndices } from '../../../engine/utils/sort-order';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

type SortArguments = (Nullable<BaseValueObject> | number)[] | ErrorValueObject;

export class Sort extends BaseFunction {
    override minParams = 1;

    override maxParams = 4;

    override needsReferenceObject = true;

    override calculate(input: FunctionVariantType, indexInput?: FunctionVariantType, orderInput?: FunctionVariantType, byColInput?: FunctionVariantType) {
        const array = this._resolveReference(input);
        const sortIndex = indexInput && this._resolveReference(indexInput);
        const sortOrder = orderInput && this._resolveReference(orderInput);
        const byCol = byColInput && this._resolveReference(byColInput);
        let _sortIndex = sortIndex ?? NumberValueObject.create(1);
        let _sortOrder = sortOrder ?? NumberValueObject.create(1);
        const _byCol = byCol ?? BooleanValueObject.create(false);

        if (_sortIndex.isNull()) {
            _sortIndex = NumberValueObject.create(1);
        }

        if (_sortOrder.isNull()) {
            _sortOrder = NumberValueObject.create(1);
        }

        const error = [array, _sortIndex, _sortOrder].find((value) => value.isError());
        if (error) {
            return _byCol.isArray() ? (_byCol as ArrayValueObject).mapValue(() => error) : error;
        }
        const indices = this._sortArguments(_sortIndex);
        const orders = this._sortArguments(_sortOrder);
        if (_byCol.isArray()) {
            let currentArray = array;
            return _byCol.map((byColObject) => {
                const result = this._handleSingleObject(currentArray, indices, orders, byColObject);
                // Excel moves the input to its result and retains converted indices between lifts.
                if (!result.isError()) currentArray = NumberValueObject.create(0);

                return result.isArray() ? (result as ArrayValueObject).get(0, 0) as BaseValueObject : result;
            });
        }

        return this._handleSingleObject(array, indices, orders, _byCol);
    }

    private _handleSingleObject(array: BaseValueObject, sortIndex: SortArguments, sortOrder: SortArguments, byCol: BaseValueObject) {
        if (array.isError()) {
            return array;
        }

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        let _byCol = byCol;

        if (_byCol.isString()) {
            const text = String(_byCol.getValue()).toUpperCase();
            if (text !== 'TRUE' && text !== 'FALSE') return ErrorValueObject.create(ErrorType.VALUE);
            _byCol = BooleanValueObject.create(text === 'TRUE');
        }

        if (_byCol.isError()) {
            return _byCol;
        }

        const byColValue = Boolean(+_byCol.getValue());
        const bound = byColValue ? arrayRowCount : arrayColumnCount;
        const indices = this._coerceSortArguments(sortIndex, bound, 1, bound, true);
        if (indices instanceof ErrorValueObject) {
            return indices;
        }
        const orders = this._coerceSortArguments(sortOrder, indices.length, -1, 1, false);
        if (orders instanceof ErrorValueObject) {
            return orders;
        }
        if (orders.length !== 1 && orders.length !== indices.length) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (!array.isArray() || (arrayRowCount === 1 && arrayColumnCount === 1)) {
            return array;
        }

        const oriented = byColValue ? (array as ArrayValueObject).transpose() : array;
        const compare = createSortCompare();
        const comparators = indices.map((index, orderIndex) => {
            const order = orders.length === 1 ? orders[0] : orders[orderIndex];
            return (left: Nullable<BaseValueObject>[], right: Nullable<BaseValueObject>[]) => compareSortValues(left[index - 1], right[index - 1], order, compare);
        });
        const input = oriented.getArrayValue();
        const compareRows = (left: Nullable<BaseValueObject>[], right: Nullable<BaseValueObject>[]) => {
            for (const comparator of comparators) {
                const result = comparator(left, right);
                if (result) {
                    return result;
                }
            }
            return 0;
        };
        const simple = indices.every((index) => input[0][index - 1]?.isNumber()
            ? input.every((row) => row[index - 1]?.isNumber())
            : input.every((row) => row[index - 1]?.isString() && !/[^a-z0-9]/i.test(String(row[index - 1]!.getValue()))));
        const values = simple
            ? input.slice().sort(compareRows)
            : getSortIndices(input.length, (left, right) => compareRows(input[left], input[right])).map((index) => input[index]);
        const result = ArrayValueObject.create({
            calculateValueList: values,
            rowCount: values.length,
            columnCount: values[0].length,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
        return byColValue ? result.transpose() : result;
    }

    private _resolveReference(input: FunctionVariantType): BaseValueObject {
        if (!input.isReferenceObject()) {
            return input as BaseValueObject;
        }
        const array = (input as BaseReferenceObject).toArrayValueObject();
        if (array.getRowCount() !== 1 || array.getColumnCount() !== 1) {
            return array;
        }
        const cell = array.getFirstCell();
        return cell.isNull() ? NumberValueObject.create(0) : cell;
    }

    private _sortArguments(input: BaseValueObject): SortArguments {
        const array = input.isArray() ? input as ArrayValueObject : undefined;
        if (array && array.getRowCount() > 1 && array.getColumnCount() > 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return array ? array.getArrayValue().flat() : [input];
    }

    private _coerceSortArguments(input: SortArguments, maxCount: number, min: number, max: number, index: boolean): number[] | ErrorValueObject {
        if (input instanceof ErrorValueObject) return input;
        if (input.length > maxCount) return ErrorValueObject.create(ErrorType.VALUE);
        const parameters: number[] = [];
        for (let position = input.length - 1; position >= 0; position--) {
            const value = input[position];
            const resolved = typeof value === 'number' || value == null
                ? value
                : value.isString() ? value.convertToNumberObjectValue() : value;
            const number = Math.floor(typeof resolved === 'number' ? resolved : +(resolved?.getValue() ?? 0));
            if (!Number.isFinite(number) || number < min || number > max || (!index && number === 0)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
            parameters[position] = number;
            input[position] = number - (index ? 1 : 0);
        }
        return parameters;
    }
}
