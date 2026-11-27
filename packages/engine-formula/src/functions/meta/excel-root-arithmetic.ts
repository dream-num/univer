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

import type { IUniverEngineFormulaConfig } from '../../config/config';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { cancelsToZero } from '../../basics/math';
import { createNewArray } from '../../engine/utils/array-object';
import { arithmeticOperandError, ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_META } from './function-names';
import { Minus } from './minus';
import { Plus } from './plus';

class ExcelFormulaResultPlus extends Plus {
    calculateAtFormulaRoot(left: BaseValueObject, right: BaseValueObject): BaseValueObject {
        return calculateRootArithmetic(left, right, false, (a, b) => super.calculate(a, b));
    }
}

class ExcelFormulaResultMinus extends Minus {
    calculateAtFormulaRoot(left: BaseValueObject, right: BaseValueObject): BaseValueObject {
        return calculateRootArithmetic(left, right, true, (a, b) => super.calculate(a, b));
    }
}

export const excelRootArithmeticFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelFormulaResultPlus, FUNCTION_NAMES_META.PLUS],
    [ExcelFormulaResultMinus, FUNCTION_NAMES_META.MINUS],
];

function calculateRootArithmetic(
    left: BaseValueObject,
    right: BaseValueObject,
    subtract: boolean,
    evaluate: (left: BaseValueObject, right: BaseValueObject) => BaseValueObject
): BaseValueObject {
    const calculate = (a: BaseValueObject, b: BaseValueObject) => {
        const result = b.isError() && !a.isError() ? arithmeticOperandError(a) ?? b : evaluate(a, b);
        if (!result.isNumber() || result.getValue() === 0) {
            return result;
        }
        const lhs = Number(a.convertToNumberObjectValue().getValue());
        const rhs = Number(b.convertToNumberObjectValue().getValue());
        return cancelsToZero(lhs, rhs, Number(result.getValue()), subtract)
            ? NumberValueObject.create(0)
            : result;
    };
    if (!left.isArray() && !right.isArray()) {
        return calculate(left, right);
    }

    const leftArray = left.isArray() ? left as ArrayValueObject : undefined;
    const rightArray = right.isArray() ? right as ArrayValueObject : undefined;
    const rows = Math.max(leftArray?.getRowCount() ?? 1, rightArray?.getRowCount() ?? 1);
    const columns = Math.max(leftArray?.getColumnCount() ?? 1, rightArray?.getColumnCount() ?? 1);
    const missing = ErrorValueObject.create(ErrorType.NA);
    const read = (value: BaseValueObject, array: ArrayValueObject | undefined, row: number, column: number) => array
        ? array.get(array.getRowCount() === 1 ? 0 : row, array.getColumnCount() === 1 ? 0 : column)
        : value;
    const result = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
        const a = read(left, leftArray, row, column);
        const b = read(right, rightArray, row, column);
        return a && b ? calculate(a, b) : missing;
    }));
    const array = createNewArray(result, rows, columns);
    if (!subtract) {
        array.setLegacyImplicitForAggregate(true);
    }
    return array;
}
