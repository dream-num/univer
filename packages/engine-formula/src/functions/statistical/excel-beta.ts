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
import { BooleanValueObject } from '../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { BetaDist } from './beta-dist';
import { BetaInv } from './beta-inv';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

class ExcelBetaDist extends BetaDist {
    protected override readonly useExcelArguments = true;
}

class ExcelBetadist extends ExcelBetaDist {
    override minParams = 3;
    override maxParams = 5;

    override calculate(x: BaseValueObject, alpha: BaseValueObject, beta: BaseValueObject, a?: BaseValueObject, b?: BaseValueObject): BaseValueObject {
        return super.calculate(x, alpha, beta, BooleanValueObject.create(true), a, b);
    }
}

class ExcelBetaInv extends BetaInv {
    protected override readonly useExcelArguments = true;
}

export const excelBetaFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelBetaDist, FUNCTION_NAMES_STATISTICAL.BETA_DIST],
    [ExcelBetadist, FUNCTION_NAMES_COMPATIBILITY.BETADIST],
    [ExcelBetaInv, FUNCTION_NAMES_STATISTICAL.BETA_INV],
    [ExcelBetaInv, FUNCTION_NAMES_COMPATIBILITY.BETAINV],
];
