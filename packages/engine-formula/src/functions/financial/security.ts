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

import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import type { NullValueObject } from '../../engine/value-object/primitive-object';
import { getFinancialDateSerialNumberByObject, getFinancialNumberByObject, getYearFraction } from '../../basics/date';
import { ErrorType } from '../../basics/error-type';
import { expandArrayValueObject } from '../../engine/utils/array-object';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';

type SecurityMode = 'accrintm' | 'disc' | 'pricedisc' | 'yielddisc' | 'intrate' | 'received';

export abstract class SecurityFunction extends BaseFunction {
    override minParams = 4;

    override maxParams = 5;

    override needsReferenceObject = true;

    protected abstract readonly mode: SecurityMode;

    override calculate(...input: FunctionVariantType[]): BaseValueObject {
        const args = input.map((value, index) => this._resolveReference(value, index < 2));
        args[4] ??= NumberValueObject.create(0);
        const arrays = args.filter((value): value is ArrayValueObject => value.isArray());
        const rows = Math.max(1, ...arrays.map((value) => value.getRowCount()));
        const columns = Math.max(1, ...arrays.map((value) => value.getColumnCount()));
        const expanded = args.map((value) => expandArrayValueObject(rows, columns, value, ErrorValueObject.create(ErrorType.NA)));
        const result = expanded[0].mapValue((_, row, column) => this._calculate(expanded.map((array, index) => {
            const cell = array.get(row, column) as BaseValueObject;
            return args[index].isArray() && cell.isNull() ? NumberValueObject.create(0) : cell;
        })));
        return rows === 1 && columns === 1 ? result.getFirstCell() : result;
    }

    private _calculate(args: BaseValueObject[]): BaseValueObject {
        const readBasis = (): number | ErrorValueObject => {
            const value = args[4].isNull() ? 0 : getFinancialNumberByObject(args[4], this.getDateSystem());
            if (typeof value !== 'number') return value;
            return value < 0 || value >= 5 ? ErrorValueObject.create(ErrorType.NUM) : Math.floor(value);
        };
        let basis = this.mode === 'accrintm' ? 0 : readBasis();
        if (typeof basis !== 'number') return basis;
        const values: number[] = [];
        for (let index = 0; index < 4; index++) {
            const value = index < 2
                ? getFinancialDateSerialNumberByObject(args[index], this.getDateSystem())
                : index === 3 && this.mode === 'accrintm' && args[index].isNull() && (args[index] as NullValueObject).isOmitted() ? 1000 : getFinancialNumberByObject(args[index], this.getDateSystem());
            if (typeof value !== 'number') return value;
            values.push(value);
        }
        if (this.mode === 'accrintm') basis = readBasis();
        if (typeof basis !== 'number') return basis;
        const [start, end, x, y] = values;
        if (start > end || (start === end && this.mode !== 'accrintm') || x <= 0 || y <= 0) return ErrorValueObject.create(ErrorType.NUM);
        const fraction = getYearFraction(start, end, basis, this.getDateSystem());
        if (!Number.isFinite(fraction) && !(this.mode === 'accrintm' && basis === 1)) return ErrorValueObject.create(ErrorType.NUM);
        let result: number;
        switch (this.mode) {
            case 'accrintm':
                // ACCRINTM retains zero after an unchecked denominator or multiplication failure.
                result = y * x * fraction;
                if (!Number.isFinite(result)) result = 0;
                break;
            case 'disc':
                result = (1 - x / y) / fraction;
                break;
            case 'pricedisc':
                result = y * (1 - x * fraction);
                break;
            case 'yielddisc':
                result = (y / x - 1) / fraction;
                break;
            case 'intrate':
                result = (y - x) / (x * fraction);
                break;
            case 'received':
                if (y * fraction >= 1) return ErrorValueObject.create(ErrorType.NUM);
                result = x / (1 - y * fraction);
                break;
        }
        return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
    }

    private _resolveReference(value: FunctionVariantType, asDate: boolean): BaseValueObject {
        if (!value.isReferenceObject()) return value as BaseValueObject;
        const reference = value as BaseReferenceObject;
        const range = reference.getRangePosition();
        if (range.startRow !== range.endRow || range.startColumn !== range.endColumn) return ErrorValueObject.create(ErrorType.VALUE);
        const array = reference.toArrayValueObject();
        const cell = array.getFirstCell();
        if (cell.isNull()) return NumberValueObject.create(0);
        if (!asDate || !cell.isString()) return cell;
        const serial = getFinancialNumberByObject(cell, this.getDateSystem());
        return typeof serial === 'number' ? NumberValueObject.create(serial) : serial;
    }
}
