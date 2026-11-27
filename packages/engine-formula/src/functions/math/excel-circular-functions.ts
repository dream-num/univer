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
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_MATH } from './function-names';

const ANGLE_LIMIT = 2 ** 27;
const HALF_PI = Math.PI / 2;
// Split the extended-precision π/2 so each product with the quadrant is exact.
const HALF_PI_HIGH = 1.5707963109016418;
const HALF_PI_MIDDLE = 1.5893254712295857e-8;
const HALF_PI_LOW = 6.1257422745431e-17;

type Kernel = 'sin' | 'cos' | 'tan';

function circularValue(angle: number, kernel: Kernel): number {
    const quadrant = Math.round(angle / HALF_PI);
    const reduced = ((angle - quadrant * HALF_PI_HIGH) - quadrant * HALF_PI_MIDDLE) - quadrant * HALF_PI_LOW;
    const odd = (quadrant & 1) !== 0;
    if (kernel === 'tan') {
        const tangent = Math.tan(reduced);
        return odd ? -1 / tangent : tangent;
    }
    const secondHalf = (quadrant & 2) !== 0;
    if (kernel === 'sin') {
        const sine = odd ? Math.cos(reduced) : Math.sin(reduced);
        return secondHalf ? -sine : sine;
    }
    const cosine = odd ? -Math.sin(reduced) : Math.cos(reduced);
    return secondHalf ? -cosine : cosine;
}

function circularFunction(kernel: Kernel, reciprocal = false) {
    return class ExcelCircularFunction extends BaseFunction {
        override minParams = 1;
        override maxParams = 1;

        override calculate(value: BaseValueObject): BaseValueObject {
            const calculate = (cell: BaseValueObject) => {
                if (cell.isError()) return cell;
                const numeric = cell.convertToNumberObjectValue();
                if (numeric.isError()) return numeric;
                const angle = Number(numeric.getValue());
                if (Math.abs(angle) >= ANGLE_LIMIT) return ErrorValueObject.create(ErrorType.NUM);

                const result = circularValue(angle, kernel);
                if ((reciprocal && result === 0) || (kernel === 'tan' && !Number.isFinite(result))) {
                    return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
                }
                const output = reciprocal ? 1 / result : result;
                return Number.isFinite(output) ? NumberValueObject.create(output + 0) : ErrorValueObject.create(ErrorType.NUM);
            };
            if (!value.isArray()) return calculate(value);
            const array = value as ArrayValueObject;
            return array.getRowCount() === 1 && array.getColumnCount() === 1
                ? calculate(array.getFirstCell())
                : array.mapValue(calculate);
        }
    };
}

export const excelCircularFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [circularFunction('sin'), FUNCTION_NAMES_MATH.SIN],
    [circularFunction('cos'), FUNCTION_NAMES_MATH.COS],
    [circularFunction('tan'), FUNCTION_NAMES_MATH.TAN],
    [circularFunction('cos', true), FUNCTION_NAMES_MATH.SEC],
    [circularFunction('sin', true), FUNCTION_NAMES_MATH.CSC],
    [circularFunction('tan', true), FUNCTION_NAMES_MATH.COT],
];
