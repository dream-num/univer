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
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { gammaDensityTerm, gammaLogPrefix, gammaProbability, inverseGammaProbability } from './excel-incomplete-gamma';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

const MAX_DEGREES = 1e10;

type ChiSquareOperation = 'distribution' | 'right-tail' | 'inverse' | 'inverse-right-tail';

function chiSquareFunction(operation: ChiSquareOperation) {
    return class ExcelChiSquare extends BaseFunction {
        override minParams = operation === 'distribution' ? 3 : 2;

        override maxParams = this.minParams;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (cells) => {
                const error = cells.find((value) => value.isError());
                if (error) return error;
                const xObject = cells[0].convertToNumberObjectValue();
                if (xObject.isError()) return xObject;
                const degreesObject = cells[1].convertToNumberObjectValue();
                if (degreesObject.isError()) return degreesObject;
                const x = Number(xObject.getValue());
                const degrees = Math.trunc(Number(degreesObject.getValue()));
                const num = () => ErrorValueObject.create(ErrorType.NUM);
                if (!(degrees >= 1) || !Number.isFinite(degrees) || (operation !== 'inverse-right-tail' && degrees > MAX_DEGREES)) return num();

                let result: number;
                if (operation === 'inverse' || operation === 'inverse-right-tail') {
                    if (!(x >= 0 && x <= 1)) return num();
                    if (x === 0 || x === 1) {
                        return x === Number(operation === 'inverse-right-tail') ? NumberValueObject.create(0) : num();
                    }
                    result = 2 * inverseGammaProbability(x, degrees / 2, operation === 'inverse-right-tail');
                } else {
                    let cumulative = true;
                    if (operation === 'distribution') {
                        const flag = cells[2];
                        if (flag.isString()) {
                            const text = String(flag.getValue()).trim().toUpperCase();
                            if (text !== 'TRUE' && text !== 'FALSE') return ErrorValueObject.create(ErrorType.VALUE);
                            cumulative = text === 'TRUE';
                        } else {
                            cumulative = Boolean(flag.getValue());
                        }
                    }
                    if (!(x >= 0)) return num();
                    if (cumulative) {
                        result = gammaProbability(degrees / 2, x / 2, operation === 'right-tail');
                    } else if (x === 0) {
                        if (degrees === 1) return num();
                        result = degrees === 2 ? 0.5 : 0;
                    } else {
                        const shape = degrees / 2;
                        result = shape < 16 || x < 2.2
                            ? Math.exp(gammaLogPrefix(shape, x / 2) - Math.log(x))
                            : (shape / x) * gammaDensityTerm(shape, x / 2);
                    }
                }
                return Number.isFinite(result) ? NumberValueObject.create(result) : num();
            });
        }
    };
}

const ExcelChiSquareRightTail = chiSquareFunction('right-tail');
const ExcelChiSquareInverseRightTail = chiSquareFunction('inverse-right-tail');

export const excelChiSquareFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [chiSquareFunction('distribution'), FUNCTION_NAMES_STATISTICAL.CHISQ_DIST],
    [ExcelChiSquareRightTail, FUNCTION_NAMES_STATISTICAL.CHISQ_DIST_RT],
    [ExcelChiSquareRightTail, FUNCTION_NAMES_COMPATIBILITY.CHIDIST],
    [chiSquareFunction('inverse'), FUNCTION_NAMES_STATISTICAL.CHISQ_INV],
    [ExcelChiSquareInverseRightTail, FUNCTION_NAMES_STATISTICAL.CHISQ_INV_RT],
    [ExcelChiSquareInverseRightTail, FUNCTION_NAMES_COMPATIBILITY.CHIINV],
];
