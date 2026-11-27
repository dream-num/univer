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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { getFinancialDateSerialNumberByObject, getFinancialNumberByObject, getYearFraction } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Yearfrac extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(start: FunctionVariantType, end: FunctionVariantType, basis?: FunctionVariantType) {
        const args = [start, end, basis ?? NumberValueObject.create(0)].map((value) => this._resolveReference(value));
        const arrays = args.filter((value): value is ArrayValueObject => value.isArray());
        const rows = Math.max(1, ...arrays.map((value) => value.getRowCount()));
        const columns = Math.max(1, ...arrays.map((value) => value.getColumnCount()));
        const expanded = args.map((value) => expandArrayValueObject(rows, columns, value, ErrorValueObject.create(ErrorType.NA)));
        const result = expanded[0].mapValue((_, row, column) => {
            const values = expanded.map((array, index) => {
                const cell = array.get(row, column) as BaseValueObject;
                return args[index].isArray() && cell.isNull() ? NumberValueObject.create(0) : cell;
            });
            return this._calculate(values[0], values[1], values[2]);
        });
        return rows === 1 && columns === 1 ? result.getFirstCell() : result;
    }

    private _calculate(startDate: BaseValueObject, endDate: BaseValueObject, basis: BaseValueObject): BaseValueObject {
        if (basis.isError()) return basis;
        if (basis.isBoolean()) return ErrorValueObject.create(ErrorType.VALUE);
        const basisNumber = basis.isNull() ? 0 : getFinancialNumberByObject(basis, this.getDateSystem());
        if (typeof basisNumber !== 'number') return basisNumber;
        const basisValue = Math.floor(basisNumber);
        if (basisNumber < 0 || basisValue > 4) return ErrorValueObject.create(ErrorType.NUM);
        const first = getFinancialDateSerialNumberByObject(startDate, this.getDateSystem());
        if (typeof first !== 'number') return first;
        const last = getFinancialDateSerialNumberByObject(endDate, this.getDateSystem());
        if (typeof last !== 'number') return last;
        const fraction = getYearFraction(first, last, basisValue, this.getDateSystem());
        return Number.isFinite(fraction) ? NumberValueObject.create(fraction) : ErrorValueObject.create(ErrorType.NUM);
    }

    private _resolveReference(input: FunctionVariantType): BaseValueObject {
        if (!input.isReferenceObject()) return input as BaseValueObject;
        const reference = input as BaseReferenceObject;
        const range = reference.getRangePosition();
        if (range.startRow !== range.endRow || range.startColumn !== range.endColumn) return ErrorValueObject.create(ErrorType.VALUE);
        const array = reference.toArrayValueObject();
        const values = array.map((cell) => {
            if (cell.isNull()) return NumberValueObject.create(0);
            if (!cell.isString()) return cell;
            const serial = getFinancialNumberByObject(cell, this.getDateSystem());
            return typeof serial === 'number' ? NumberValueObject.create(serial) : serial;
        }) as ArrayValueObject;
        return values.getRowCount() === 1 && values.getColumnCount() === 1 ? values.getFirstCell() : values;
    }
}
