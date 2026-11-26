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
import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { chisquareSurvival } from '../../basics/statistical';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { FUNCTION_NAMES_MATH } from '../math/function-names';
import { Correl } from './correl';
import { CovarianceP } from './covariance-p';
import { CovarianceS } from './covariance-s';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';
import { Intercept } from './intercept';
import { Pearson } from './pearson';
import { Rsq } from './rsq';
import { Slope } from './slope';
import { Steyx } from './steyx';

function numericPairArgument(value: FunctionVariantType): BaseValueObject {
    if (!value.isReferenceObject()) return value as BaseValueObject;
    const array = (value as BaseReferenceObject).toArrayValueObject();
    return array.getRowCount() === 1 && array.getColumnCount() === 1 ? array.getFirstCell() : array;
}

function pairedAggregate(operation?: (left: number, right: number) => number) {
    return class ExcelPairedAggregate extends BaseFunction {
        override minParams = 2;

        override maxParams = 2;

        override needsReferenceObject = true;

        override calculate(leftArgument: FunctionVariantType, rightArgument: FunctionVariantType): BaseValueObject {
            const left = numericPairArgument(leftArgument);
            const right = numericPairArgument(rightArgument);
            if (left.isError()) return left;
            if (right.isError()) return right;
            if (left.isNull() || right.isNull()) return ErrorValueObject.create(ErrorType.VALUE);

            const leftArray = left.isArray() ? left as ArrayValueObject : undefined;
            const rightArray = right.isArray() ? right as ArrayValueObject : undefined;
            const rows = leftArray?.getRowCount() ?? 1;
            const columns = leftArray?.getColumnCount() ?? 1;
            const rightColumns = rightArray?.getColumnCount() ?? 1;
            const count = rows * columns;
            if (count !== (rightArray?.getRowCount() ?? 1) * rightColumns) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            let rightError: BaseValueObject | undefined;
            let hasNumbers = false;
            let total = 0;
            let zeroExpected = false;
            let negativeExpected = false;
            for (let index = 0; index < count; index++) {
                const x = leftArray ? leftArray.get(Math.floor(index / columns), index % columns) : left;
                const y = rightArray ? rightArray.get(Math.floor(index / rightColumns), index % rightColumns) : right;
                if (x?.isError()) return x;
                if (y?.isError()) rightError ??= y;
                if (!x?.isNumber() || !y?.isNumber()) continue;
                hasNumbers = true;
                const actual = Number(x.getValue());
                const expected = Number(y.getValue());
                if (operation) {
                    total += operation(actual, expected);
                } else if (expected > 0) {
                    total += (actual - expected) ** 2 / expected;
                } else if (expected === 0) {
                    zeroExpected = true;
                } else {
                    negativeExpected = true;
                }
            }
            if (rightError) return rightError;
            if (!operation && count <= 1) return ErrorValueObject.create(ErrorType.NA);
            if (!hasNumbers || zeroExpected) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            if (negativeExpected || !Number.isFinite(total)) return ErrorValueObject.create(ErrorType.NUM);
            if (operation) return NumberValueObject.create(total);
            const degrees = Math.max(rows - 1, 1) * Math.max(columns - 1, 1);
            return NumberValueObject.create(chisquareSurvival(total, degrees));
        }
    };
}

const ExcelChisquareTest = pairedAggregate();

class ExcelCorrel extends Correl {
    protected override readonly numbersOnly = true;
}

class ExcelCovarianceP extends CovarianceP {
    protected override readonly numbersOnly = true;
}

class ExcelCovarianceS extends CovarianceS {
    protected override readonly numbersOnly = true;
}

class ExcelIntercept extends Intercept {
    protected override readonly numbersOnly = true;
}

class ExcelPearson extends Pearson {
    protected override readonly numbersOnly = true;
}

class ExcelRsq extends Rsq {
    protected override readonly numbersOnly = true;
}

class ExcelSlope extends Slope {
    protected override readonly numbersOnly = true;
}

class ExcelSteyx extends Steyx {
    protected override readonly numbersOnly = true;
}

export const excelPairedNumericFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelCorrel, FUNCTION_NAMES_STATISTICAL.CORREL],
    [ExcelCovarianceP, FUNCTION_NAMES_STATISTICAL.COVARIANCE_P],
    [ExcelCovarianceS, FUNCTION_NAMES_STATISTICAL.COVARIANCE_S],
    [ExcelIntercept, FUNCTION_NAMES_STATISTICAL.INTERCEPT],
    [ExcelPearson, FUNCTION_NAMES_STATISTICAL.PEARSON],
    [ExcelRsq, FUNCTION_NAMES_STATISTICAL.RSQ],
    [ExcelSlope, FUNCTION_NAMES_STATISTICAL.SLOPE],
    [ExcelSteyx, FUNCTION_NAMES_STATISTICAL.STEYX],
    [ExcelCovarianceP, FUNCTION_NAMES_COMPATIBILITY.COVAR],
    [pairedAggregate((left, right) => left ** 2 - right ** 2), FUNCTION_NAMES_MATH.SUMX2MY2],
    [pairedAggregate((left, right) => left ** 2 + right ** 2), FUNCTION_NAMES_MATH.SUMX2PY2],
    [pairedAggregate((left, right) => (left - right) ** 2), FUNCTION_NAMES_MATH.SUMXMY2],
    [ExcelChisquareTest, FUNCTION_NAMES_STATISTICAL.CHISQ_TEST],
    [ExcelChisquareTest, FUNCTION_NAMES_COMPATIBILITY.CHITEST],
];
