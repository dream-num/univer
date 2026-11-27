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
import type { NullValueObject } from '../../engine/value-object/primitive-object';
import { MultiAreaReferenceObject } from '../../engine/reference-object/multi-area-reference-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

abstract class ExcelExtrema extends BaseFunction {
    override minParams = 1;
    override maxParams = 255;
    override needsReferenceObject = true;
    override evaluatesIfArgumentsAsArrays = true;
    protected abstract readonly _select: (left: number, right: number) => number;
    protected readonly _includeReferenceValues: boolean = false;

    override calculate(...args: FunctionVariantType[]): BaseValueObject {
        let extreme: number | undefined;
        const record = (value: number) => {
            extreme = extreme === undefined ? value : this._select(extreme, value);
        };
        for (const argument of args) {
            const reference = argument.isReferenceObject() ? argument as BaseReferenceObject : undefined;
            const value = reference ? reference.toArrayValueObject() : argument as BaseValueObject;
            if (!value.isArray()) {
                if (value.isNull() && !(value as NullValueObject).isOmitted()) continue;
                const converted = value.convertToNumberObjectValue();
                if (converted.isError()) return converted;
                record(Number(converted.getValue()));
                continue;
            }

            const referenceValues = reference &&
                (!(reference instanceof MultiAreaReferenceObject) || !reference.isArrayOfReferences());
            let error: BaseValueObject | undefined;
            (value as ArrayValueObject).iterator((cell) => {
                if (cell?.isError()) {
                    error = cell;
                    return false;
                }
                if (cell?.isNumber() || (referenceValues && this._includeReferenceValues && cell?.isBoolean())) {
                    record(Number(cell.getValue()));
                } else if (referenceValues && this._includeReferenceValues && cell?.isString()) {
                    record(0);
                }
                return true;
            });
            if (error) return error;
        }
        return NumberValueObject.create(extreme ?? 0);
    }
}

class ExcelMax extends ExcelExtrema {
    protected readonly _select = Math.max;
}

class ExcelMin extends ExcelExtrema {
    protected readonly _select = Math.min;
}

class ExcelMaxa extends ExcelMax {
    protected override readonly _includeReferenceValues = true;
}

class ExcelMina extends ExcelMin {
    protected override readonly _includeReferenceValues = true;
}

export const excelExtremaFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelMax, FUNCTION_NAMES_STATISTICAL.MAX],
    [ExcelMin, FUNCTION_NAMES_STATISTICAL.MIN],
    [ExcelMaxa, FUNCTION_NAMES_STATISTICAL.MAXA],
    [ExcelMina, FUNCTION_NAMES_STATISTICAL.MINA],
];
