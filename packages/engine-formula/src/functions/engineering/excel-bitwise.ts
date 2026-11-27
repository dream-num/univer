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
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { FUNCTION_NAMES_ENGINEERING } from './function-names';

const BIT_WIDTH = 48;
const MAX_BIT_NUMBER = 2 ** BIT_WIDTH - 1;
const MAX_SHIFT = 53;

function isBitNumber(number: number): boolean {
    return Number.isInteger(number) && number >= 0 && number <= MAX_BIT_NUMBER;
}

function coerceNumber(value: BaseValueObject): BaseValueObject {
    return value.isError() ? value : value.convertToNumberObjectValue();
}

function bitFunction(evaluate: (number: number, argument: number) => number) {
    return class ExcelBitFunction extends BaseFunction {
        override minParams = 2;
        override maxParams = 2;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, ([first, second]) => {
                const left = coerceNumber(first);
                if (left.isError()) return left;
                const right = coerceNumber(second);
                if (right.isError()) return right;
                const number = Number(left.getValue());
                const argument = Number(right.getValue());
                const result = isBitNumber(number) ? evaluate(number, argument) : NaN;
                return isBitNumber(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
            });
        }
    };
}

function bitwise(operation: (left: bigint, right: bigint) => bigint) {
    return bitFunction((left, right) => isBitNumber(right) ? Number(operation(BigInt(left), BigInt(right))) : NaN);
}

function shiftBits(number: number, shift: number): number {
    if (number === 0) return 0;
    const displacement = Math.trunc(shift);
    if (Math.abs(displacement) > MAX_SHIFT) return NaN;
    // Excel clears the result for shifts beyond the operand width.
    if (Math.abs(displacement) > BIT_WIDTH) return 0;
    return Math.trunc(number * 2 ** displacement);
}

export const excelBitwiseFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [bitwise((left, right) => left & right), FUNCTION_NAMES_ENGINEERING.BITAND],
    [bitwise((left, right) => left | right), FUNCTION_NAMES_ENGINEERING.BITOR],
    [bitwise((left, right) => left ^ right), FUNCTION_NAMES_ENGINEERING.BITXOR],
    [bitFunction(shiftBits), FUNCTION_NAMES_ENGINEERING.BITLSHIFT],
    [bitFunction((number, shift) => shiftBits(number, -shift)), FUNCTION_NAMES_ENGINEERING.BITRSHIFT],
];
