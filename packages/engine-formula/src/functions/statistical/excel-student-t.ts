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
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { studentTDensityFromSquare, studentTPositiveTailFromSquare, studentTQuantile } from '../../basics/statistical';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { ConfidenceT } from './confidence-t';
import { coerceExcelCumulative } from './excel-distribution-arguments';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';
import { TInv } from './t-inv';
import { TInv2t } from './t-inv-2t';
import { TTest } from './t-test';

class ExcelTTest extends TTest {
    protected override _lowerTail(statistic: number, degrees: number): number {
        return studentTPositiveTailFromSquare(statistic * statistic, degrees);
    }
}

class ExcelTInv extends TInv {
    protected override _probabilityError(probability: number, degrees: number): ErrorType | undefined {
        return probability === 0 && degrees === 1 ? ErrorType.DIV_BY_ZERO : super._probabilityError(probability, degrees);
    }

    protected override _quantile(probability: number, degrees: number): number {
        return studentTQuantile(probability, degrees);
    }
}

class ExcelTInv2t extends TInv2t {
    protected override _probabilityError(probability: number, degrees: number): ErrorType | undefined {
        if (probability === 0 && degrees === 1) return ErrorType.DIV_BY_ZERO;
        return probability <= 0 || probability >= 2 ? ErrorType.NUM : undefined;
    }

    protected override _quantile(probability: number, degrees: number): number {
        return -studentTQuantile(probability / 2, degrees);
    }
}

class ExcelConfidenceT extends ConfidenceT {
    protected override _margin(alpha: number, standardDev: number, size: number): BaseValueObject {
        if (size - 1 > 1e10) return ErrorValueObject.create(ErrorType.NUM);
        const value = -studentTQuantile(alpha / 2, size - 1) * standardDev / Math.sqrt(size);
        return Number.isFinite(value) ? NumberValueObject.create(value) : ErrorValueObject.create(ErrorType.NUM);
    }
}

type StudentTDistribution = 'distribution' | 'right-tail' | 'two-tails' | 'legacy';

function studentTDistributionFunction(operation: StudentTDistribution) {
    return class ExcelStudentTDistribution extends BaseFunction {
        override minParams = operation === 'distribution' || operation === 'legacy' ? 3 : 2;

        override maxParams = this.minParams;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (cells) => {
                const error = cells.find((cell) => cell.isError());
                if (error) return error;
                const xObject = cells[0].convertToNumberObjectValue();
                if (xObject.isError()) return xObject;
                const degreesObject = cells[1].convertToNumberObjectValue();
                if (degreesObject.isError()) return degreesObject;
                const x = Number(xObject.getValue());
                const degrees = Math.trunc(Number(degreesObject.getValue()));
                const square = x * x;

                let tails = operation === 'two-tails' ? 2 : 1;
                if (operation === 'legacy') {
                    const tailsObject = cells[2].convertToNumberObjectValue();
                    if (tailsObject.isError()) return tailsObject;
                    tails = Math.trunc(Number(tailsObject.getValue()));
                }
                if (operation === 'distribution') {
                    const cumulative = coerceExcelCumulative(cells[2]);
                    if (typeof cumulative !== 'boolean') return cumulative;
                    if (!cumulative) {
                        if (degrees === 0 || (degrees < 0 && square === -degrees)) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
                        if (degrees < 1 || !Number.isFinite(square)) return ErrorValueObject.create(ErrorType.NUM);
                        const value = studentTDensityFromSquare(square, degrees);
                        return Number.isFinite(value) ? NumberValueObject.create(value) : ErrorValueObject.create(ErrorType.NUM);
                    }
                }

                const negativeDomain = (operation === 'legacy' || operation === 'two-tails') && x < 0;
                if (!(degrees >= 1 && degrees <= 1e10) || !Number.isFinite(square) || negativeDomain || (tails !== 1 && tails !== 2)) {
                    return ErrorValueObject.create(ErrorType.NUM);
                }
                const positiveTail = studentTPositiveTailFromSquare(square, degrees);
                if (operation === 'distribution') return NumberValueObject.create(x < 0 ? positiveTail : 1 - positiveTail);
                return NumberValueObject.create(x < 0 ? 1 - positiveTail : tails * positiveTail);
            });
        }
    };
}

export const excelStudentTFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelTTest, FUNCTION_NAMES_STATISTICAL.T_TEST],
    [ExcelTTest, FUNCTION_NAMES_COMPATIBILITY.TTEST],
    [ExcelTInv, FUNCTION_NAMES_STATISTICAL.T_INV],
    [ExcelTInv2t, FUNCTION_NAMES_STATISTICAL.T_INV_2T],
    [ExcelTInv2t, FUNCTION_NAMES_COMPATIBILITY.TINV],
    [ExcelConfidenceT, FUNCTION_NAMES_STATISTICAL.CONFIDENCE_T],
    [studentTDistributionFunction('distribution'), FUNCTION_NAMES_STATISTICAL.T_DIST],
    [studentTDistributionFunction('right-tail'), FUNCTION_NAMES_STATISTICAL.T_DIST_RT],
    [studentTDistributionFunction('two-tails'), FUNCTION_NAMES_STATISTICAL.T_DIST_2T],
    [studentTDistributionFunction('legacy'), FUNCTION_NAMES_COMPATIBILITY.TDIST],
];
