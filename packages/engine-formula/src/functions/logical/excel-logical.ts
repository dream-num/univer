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
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { Sum } from '../math/sum';
import { And } from './and';
import { Byrow } from './byrow';
import { Map } from './map';
import { Reduce } from './reduce';
import { Scan } from './scan';
import { Makearray } from './makearray';
import { FUNCTION_NAMES_LOGICAL } from './function-names';
import { If } from './if';
import { Or } from './or';
import { Xor } from './xor';

function booleanText(value: BaseValueObject): boolean | undefined {
    if (!value.isString()) return;
    const text = String(value.getValue()).toUpperCase();
    if (text === 'TRUE') return true;
    if (text === 'FALSE') return false;
}

function convertDirectArgument(value: BaseValueObject): BaseValueObject {
    if (value instanceof NullValueObject && value.isOmitted()) return BooleanValueObject.create(false);
    const bool = booleanText(value);
    return bool === undefined ? value : BooleanValueObject.create(bool);
}

class ExcelAnd extends And {
    override calculate(...args: BaseValueObject[]): BaseValueObject {
        return super.calculate(...args.map(convertDirectArgument));
    }
}

class ExcelOr extends Or {
    override calculate(...args: BaseValueObject[]): BaseValueObject {
        return super.calculate(...args.map(convertDirectArgument));
    }
}

class ExcelXor extends Xor {
    override calculate(...args: BaseValueObject[]): BaseValueObject {
        return super.calculate(...args.map(convertDirectArgument));
    }
}

class ExcelNot extends BaseFunction {
    override minParams = 1;
    override maxParams = 1;

    override calculate(arg: BaseValueObject): BaseValueObject {
        return arg.isArray()
            ? (arg as ArrayValueObject).mapValue((cell) => this._negate(cell))
            : this._negate(arg);
    }

    private _negate(value: BaseValueObject): BaseValueObject {
        if (value.isError()) return value;
        if (value.isNull() || value.isNumber() || value.isBoolean()) return BooleanValueObject.create(!value.getValue());
        const bool = booleanText(value);
        return bool === undefined ? ErrorValueObject.create(ErrorType.VALUE) : BooleanValueObject.create(!bool);
    }
}

function resolveSelectionArgument(arg: FunctionVariantType): BaseValueObject {
    if (!arg.isReferenceObject()) return arg as BaseValueObject;
    const array = (arg as BaseReferenceObject).toArrayValueObject();
    return array.getRowCount() === 1 && array.getColumnCount() === 1 ? array.getFirstCell() : array;
}

function selectionResult(value: BaseValueObject): BaseValueObject {
    if (value.isArray()) return (value as ArrayValueObject).mapValue(selectionResult);
    return value.isNull() ? NumberValueObject.create(0) : value;
}

class ExcelIf extends If {
    override getOmittedBranchResult(): BaseValueObject {
        return NullValueObject.create(true);
    }
}

function conditionValue(condition: BaseValueObject): boolean | BaseValueObject {
    if (condition.isError()) return condition;
    if (condition.isNumber() || condition.isBoolean() || condition.isNull()) return Boolean(condition.getValue());
    return booleanText(condition) ?? ErrorValueObject.create(ErrorType.VALUE);
}

class ExcelIfs extends BaseFunction {
    override minParams = 2;
    override maxParams = 254;
    override needsReferenceObject = true;

    override calculate(...input: FunctionVariantType[]): BaseValueObject {
        if (input.length % 2 !== 0) return ErrorValueObject.create(ErrorType.NA);
        const pairs = input.map(resolveSelectionArgument);
        for (let index = 0; index < pairs.length; index += 2) {
            if (pairs[index].isArray()) return mapFinancialScalars(pairs, (cells) => this._select(cells));
            const condition = conditionValue(pairs[index]);
            if (condition === true) return selectionResult(pairs[index + 1]);
            if (condition !== false) return condition;
        }
        return ErrorValueObject.create(ErrorType.NA);
    }

    private _select(pairs: BaseValueObject[]): BaseValueObject {
        for (let index = 0; index < pairs.length; index += 2) {
            const condition = conditionValue(pairs[index]);
            if (condition === true) return selectionResult(pairs[index + 1]);
            if (condition !== false) return condition;
        }
        return ErrorValueObject.create(ErrorType.NA);
    }
}

function switchValuesEqual(expression: BaseValueObject, candidate: BaseValueObject): boolean {
    const left = expression.getValue() ?? 0;
    const right = candidate.getValue() ?? 0;
    if (typeof left === 'string' && typeof right === 'string') return left.toLowerCase() === right.toLowerCase();
    if (typeof left === 'number' && typeof right === 'number') return left === right || left.toPrecision(15) === right.toPrecision(15);
    return left === right;
}

class ExcelSwitch extends BaseFunction {
    override minParams = 3;
    override maxParams = 255;
    override needsReferenceObject = true;

    override calculate(...input: FunctionVariantType[]): BaseValueObject {
        const values = input.map(resolveSelectionArgument);
        const [expression, ...args] = values;
        const pairEnd = args.length - (args.length % 2);
        if (!expression.isArray()) {
            if (expression.isError()) return expression;
            for (let index = 0; index < pairEnd; index += 2) {
                const candidate = args[index];
                if (candidate.isArray()) break;
                if (candidate.isError()) return candidate;
                if (switchValuesEqual(expression, candidate)) return selectionResult(args[index + 1]);
                if (index + 2 === pairEnd) return this._fallback(args, pairEnd);
            }
        }
        return mapFinancialScalars(values, ([expression, ...pairs]) => {
            if (expression.isError()) return expression;
            for (let index = 0; index < pairEnd; index += 2) {
                const candidate = pairs[index];
                if (candidate.isError()) return candidate;
                if (switchValuesEqual(expression, candidate)) return selectionResult(pairs[index + 1]);
            }
            return this._fallback(pairs, pairEnd);
        });
    }

    private _fallback(args: BaseValueObject[], pairEnd: number): BaseValueObject {
        return pairEnd < args.length ? selectionResult(args[pairEnd]) : ErrorValueObject.create(ErrorType.NA);
    }
}

class ExcelPercentof extends Sum {
    override minParams = 2;
    override maxParams = 2;
    override needsReferenceObject = true;

    override calculate(subset: FunctionVariantType, all: FunctionVariantType): BaseValueObject {
        if (subset.isError()) return subset as BaseValueObject;
        if (all.isError()) return all as BaseValueObject;
        const subtotal = this._aggregate(subset);
        if (subtotal.isError()) return subtotal;
        const total = this._aggregate(all);
        return total.isError() ? total : subtotal.divided(total);
    }

    private _aggregate(argument: FunctionVariantType): BaseValueObject {
        const values = argument.isReferenceObject()
            ? (argument as BaseReferenceObject).toArrayValueObject()
            : argument as BaseValueObject;
        const total = super.calculate(values);
        return total.isError() && values.isArray() ? ErrorValueObject.create(ErrorType.NUM) : total;
    }
}

class ExcelByrow extends Byrow {
    protected override readonly excelCompatibility = true;
}

class ExcelMap extends Map {
    protected override readonly excelCompatibility = true;
}

class ExcelReduce extends Reduce {
    protected override readonly excelCompatibility = true;
}

class ExcelScan extends Scan {
    protected override readonly excelCompatibility = true;
}

class ExcelMakearray extends Makearray {
    protected override readonly excelCompatibility = true;
}

export const excelLogicalFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelAnd, FUNCTION_NAMES_LOGICAL.AND],
    [ExcelByrow, FUNCTION_NAMES_LOGICAL.BYROW],
    [ExcelMap, FUNCTION_NAMES_LOGICAL.MAP],
    [ExcelReduce, FUNCTION_NAMES_LOGICAL.REDUCE],
    [ExcelScan, FUNCTION_NAMES_LOGICAL.SCAN],
    [ExcelMakearray, FUNCTION_NAMES_LOGICAL.MAKEARRAY],

    [ExcelIf, FUNCTION_NAMES_LOGICAL.IF],
    [ExcelIfs, FUNCTION_NAMES_LOGICAL.IFS],
    [ExcelNot, FUNCTION_NAMES_LOGICAL.NOT],
    [ExcelOr, FUNCTION_NAMES_LOGICAL.OR],
    [ExcelPercentof, FUNCTION_NAMES_LOGICAL.PERCENTOF],
    [ExcelSwitch, FUNCTION_NAMES_LOGICAL.SWITCH],
    [ExcelXor, FUNCTION_NAMES_LOGICAL.XOR],
];
