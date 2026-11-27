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
import { getDateSerialNumberByObject } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { calculateAccruedInterest } from '../../../basics/financial';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Accrint extends BaseFunction {
    override minParams = 6;

    override maxParams = 8;

    override needsReferenceObject = true;

    override calculate(...input: FunctionVariantType[]): BaseValueObject {
        const args = input.map((arg, i) => {
            if (!arg.isReferenceObject()) return arg as BaseValueObject;
            const array = (arg as BaseReferenceObject).toArrayValueObject();
            if (array.getRowCount() !== 1 || array.getColumnCount() !== 1) return array;
            const cell = array.getFirstCell();
            return (i === 4 || i === 7) && cell.isNull() ? NumberValueObject.create(0) : cell;
        });
        const arrays = args.filter((arg): arg is ArrayValueObject => arg.isArray());
        const rows = Math.max(1, ...arrays.map((item) => item.getRowCount()));
        const cols = Math.max(1, ...arrays.map((item) => item.getColumnCount()));
        if (rows === 1 && cols === 1) return this._calculateSingle(args);
        const missing = ErrorValueObject.create(ErrorType.NA);
        const expanded = args.map((arg) => expandArrayValueObject(rows, cols, arg, missing));
        return expanded[0].map((_, row, col) => this._calculateSingle(expanded.map((arg) => arg.get(row, col) ?? missing)));
    }

    private _calculateSingle(args: BaseValueObject[]): BaseValueObject {
        const [issue, first, settlement, rate, par, frequency, basis, method] = args;
        const parArg = par.isNull() ? NumberValueObject.create(1000) : par;
        const basisArg = basis ?? NumberValueObject.create(0);
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(issue, first, settlement, rate, parArg, frequency, basisArg);
        if (isError) return errorObject as ErrorValueObject;

        const dateSystem = this.getDateSystem();
        const [issueArg, firstArg, settlementArg, rateArg, faceArg, freqArg, dayCountArg] = variants as BaseValueObject[];
        const issueDate = getDateSerialNumberByObject(issueArg, dateSystem);
        const firstDate = getDateSerialNumberByObject(firstArg, dateSystem);
        const settlementDate = getDateSerialNumberByObject(settlementArg, dateSystem);
        if (typeof issueDate !== 'number') return issueDate;
        if (typeof firstDate !== 'number') return firstDate;
        if (typeof settlementDate !== 'number') return settlementDate;

        const methodArg = method?.isArray() ? (method as ArrayValueObject).getFirstCell() : method;
        if (methodArg?.isError()) return methodArg;
        if (methodArg?.isString()) return ErrorValueObject.create(ErrorType.VALUE);
        const fromIssue = methodArg == null || methodArg.isNull() ? BooleanValueObject.create(true) : methodArg;
        const actualRate = Number(rateArg.getValue());
        const face = Number(faceArg.getValue());
        const freq = Math.floor(Number(freqArg.getValue()));
        const dayCount = Math.floor(Number(dayCountArg.getValue()));
        if ([actualRate, face, freq, dayCount].some(Number.isNaN)) return ErrorValueObject.create(ErrorType.VALUE);
        if (issueDate < 1 || firstDate < 1 || Math.floor(issueDate) >= Math.floor(settlementDate) ||
            actualRate <= 0 || face <= 0 || ![1, 2, 4].includes(freq) || dayCount < 0 || dayCount > 4) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = calculateAccruedInterest(Math.floor(issueDate), Math.floor(firstDate), Math.floor(settlementDate), actualRate, face, freq, dayCount, Boolean(fromIssue.getValue()), dateSystem);
        return typeof result === 'number' ? NumberValueObject.create(result) : ErrorValueObject.create(result);
    }
}
