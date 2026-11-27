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
import { isMatchWildcard, normalizeTextForComparison } from '../../engine/utils/compare';
import { createSortCompare } from '../../engine/utils/sort-compare';
import { ErrorValueObject, formatValueForFormulaText } from '../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { compileRegex } from '../text/excel-regex';
import { FUNCTION_NAMES_LOOKUP } from './function-names';
import { Match } from './match';

interface ILookupVector {
    length: number;
    at: (index: number) => BaseValueObject;
}

type CompareValues = (left: BaseValueObject, right: BaseValueObject) => number;

function asVector(source: BaseValueObject, allowScalar: boolean): ILookupVector | undefined {
    if (!source.isArray()) return allowScalar ? { length: 1, at: () => source } : undefined;
    const array = source as ArrayValueObject;
    const horizontal = array.getRowCount() === 1;
    if (!horizontal && array.getColumnCount() !== 1) return;
    const empty = NullValueObject.create();
    return {
        length: horizontal ? array.getColumnCount() : array.getRowCount(),
        at: (index) => (horizontal ? array.get(0, index) : array.get(index, 0)) ?? empty,
    };
}

function valueRank(value: BaseValueObject): number {
    if (value.isNumber()) return 0;
    if (value.isString()) return 1;
    if (value.isBoolean()) return 2;
    return value.isNull() ? 3 : 4;
}

function createComparison(): CompareValues {
    let compareText: ReturnType<typeof createSortCompare> | undefined;
    return (left, right) => {
        const kind = valueRank(left) - valueRank(right);
        if (kind !== 0) return kind;
        if (left.isString()) return (compareText ??= createSortCompare())(String(left.getValue()), String(right.getValue()));
        return left.isNull() ? 0 : Number(left.getValue()) - Number(right.getValue());
    };
}

function readArgument(argument: FunctionVariantType, keepShape = false): BaseValueObject {
    if (!argument.isReferenceObject()) return argument as BaseValueObject;
    const reference = argument as BaseReferenceObject;
    return !keepShape && !reference.isMultiArea() && reference.getRowCount() === 1 && reference.getColumnCount() === 1
        ? reference.getFirstCell()
        : reference.toArrayValueObject();
}

function result(position: number | undefined): BaseValueObject {
    return position === undefined ? ErrorValueObject.create(ErrorType.NA) : NumberValueObject.create(position + 1);
}

function findPosition(length: number, reverse: boolean, matches: (index: number) => boolean): number | undefined {
    for (let offset = 0; offset < length; offset++) {
        const index = reverse ? length - offset - 1 : offset;
        if (matches(index)) return index;
    }
}

function probe(first: number, end: number, comparable: (index: number) => boolean): number | undefined {
    const middle = first + Math.floor((end - first - 1) / 2);
    for (let index = middle; index < end; index++) {
        if (comparable(index)) return index;
    }
    for (let index = middle - 1; index >= first; index--) {
        if (comparable(index)) return index;
    }
}

function exactPosition(vector: ILookupVector, key: BaseValueObject, reverse: boolean, wildcard: boolean): number | undefined {
    if (key.isString()) {
        const text = normalizeTextForComparison(String(key.getValue()));
        return findPosition(vector.length, reverse, (index) => {
            const candidate = vector.at(index);
            if (!candidate.isString()) return false;
            const value = normalizeTextForComparison(String(candidate.getValue()));
            return wildcard ? isMatchWildcard(value, text) : value === text;
        });
    }
    const rank = valueRank(key);
    return findPosition(vector.length, reverse, (index) => {
        const candidate = vector.at(index);
        return valueRank(candidate) === rank && candidate.getValue() === key.getValue();
    });
}

function legacyApproximate(vector: ILookupVector, key: BaseValueObject, descending: boolean, compare: CompareValues): number | undefined {
    const rank = valueRank(key);
    const { at, length } = vector;
    const comparable = (index: number) => valueRank(at(index)) === rank;
    let found: number | undefined;
    if (descending) {
        for (let index = 0; index < length; index++) {
            if (!comparable(index)) continue;
            const order = compare(at(index), key);
            if (order < 0) break;
            if (order === 0) return index;
            found = index;
        }
        return found;
    }

    let first = 0;
    let end = length;
    while (first < end) {
        const index = probe(first, end, comparable);
        if (index === undefined) break;
        const order = compare(at(index), key);
        if (order > 0) {
            end = index;
        } else if (order < 0) {
            found = index;
            first = index + 1;
        } else {
            let last = index;
            for (let position = index + 1; position < length; position++) {
                if (!comparable(position)) continue;
                if (compare(at(position), key) !== 0) break;
                last = position;
            }
            return last;
        }
    }
    return found;
}

class ExcelMatch extends Match {
    override calculate(keyInput: FunctionVariantType, sourceInput: FunctionVariantType, modeInput?: FunctionVariantType): BaseValueObject {
        const key = readArgument(keyInput);
        if (key.isError()) return key;
        const source = readArgument(sourceInput, true);
        if (source.isError()) return source;
        const vector = asVector(source, false);
        if (!vector) return ErrorValueObject.create(ErrorType.NA);
        const mode = modeInput ? readArgument(modeInput) : NumberValueObject.create(1);
        if (modeInput?.isReferenceObject() && mode.isError()) return ErrorValueObject.create(ErrorType.REF);
        const compare = createComparison();
        return mapFinancialScalars([key, mode], ([lookup, option]) => {
            if (lookup.isError()) return lookup;
            if (lookup.isString() && String(lookup.getValue()).length > 255) return ErrorValueObject.create(ErrorType.VALUE);
            const value = lookup.isNull() ? NumberValueObject.create(0) : lookup;
            const type = option.isError() ? option : option.convertToNumberObjectValue();
            if (type.isError()) return type;
            const sign = Number(type.getValue());
            return result(sign === 0 ? exactPosition(vector, value, false, value.isString() && /[~*?]/.test(String(value.getValue()))) : legacyApproximate(vector, value, sign < 0, compare));
        });
    }
}

function binarySearch(vector: ILookupVector, key: BaseValueObject, mode: number, reverse: boolean, compare: CompareValues): number | undefined {
    let first = 0;
    let end = vector.length;
    let exact: number | undefined;
    let smaller: number | undefined;
    let larger: number | undefined;
    const comparable = (index: number) => !vector.at(index).isError();
    while (first < end) {
        const index = probe(first, end, comparable);
        if (index === undefined) break;
        const order = compare(vector.at(index), key);
        if (order < 0) smaller = index;
        else if (order > 0) larger = index;
        else exact = index;
        // Keep searching toward the first ascending or last descending duplicate.
        if (reverse ? order >= 0 : order < 0) first = index + 1;
        else end = index;
    }
    return exact ?? (mode < 0 ? smaller : mode > 0 ? larger : undefined);
}

function nearestPosition(vector: ILookupVector, key: BaseValueObject, mode: number, reverse: boolean, compare: CompareValues): number | undefined {
    let nearest: number | undefined;
    const exact = findPosition(vector.length, reverse, (index) => {
        const candidate = vector.at(index);
        if (candidate.isError()) return false;
        const order = compare(candidate, key);
        if (order === 0) return true;
        if (order * mode > 0 && (nearest === undefined || compare(candidate, vector.at(nearest)) * mode < 0)) nearest = index;
        return false;
    });
    return exact ?? nearest;
}

function matchOption(value: BaseValueObject, fallback: number): number | BaseValueObject {
    if (value instanceof NullValueObject && value.isOmitted()) return fallback;
    const number = value.isError() ? value : value.convertToNumberObjectValue();
    return number.isError() ? number : Math.floor(Number(number.getValue()));
}

class ExcelXmatch extends BaseFunction {
    override minParams = 2;
    override maxParams = 4;

    override calculate(key: BaseValueObject, source: BaseValueObject, modeInput?: BaseValueObject, searchInput?: BaseValueObject): BaseValueObject {
        if (key.isError()) return key;
        if (source.isError()) return source;
        const vector = asVector(source, true);
        if (!vector) return ErrorValueObject.create(ErrorType.VALUE);
        const compare = createComparison();
        return mapFinancialScalars(
            [key, modeInput ?? NumberValueObject.create(0), searchInput ?? NumberValueObject.create(1)],
            ([lookup, mode, search]) => {
                if (lookup.isError()) return lookup;
                const type = matchOption(mode, 0);
                if (typeof type !== 'number') return type;
                const direction = matchOption(search, 1);
                if (typeof direction !== 'number') return direction;
                if (![-1, 0, 1, 2, 3].includes(type) || ![-2, -1, 1, 2].includes(direction) || (type >= 2 && Math.abs(direction) === 2)) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }
                const reverse = direction < 0;
                if (type === 3) {
                    const regex = compileRegex(lookup.isNull() ? '' : formatValueForFormulaText(lookup.getValue()), 0, false);
                    if (!regex) return ErrorValueObject.create(ErrorType.VALUE);
                    return result(findPosition(vector.length, reverse, (index) => {
                        const candidate = vector.at(index);
                        return !candidate.isError() && regex.test(candidate.isNull() ? '' : formatValueForFormulaText(candidate.getValue()));
                    }));
                }
                if (Math.abs(direction) === 2) return result(binarySearch(vector, lookup, type, reverse, compare));
                if (type === 0 || type === 2) return result(exactPosition(vector, lookup, reverse, type === 2));
                return result(nearestPosition(vector, lookup, type, reverse, compare));
            }
        );
    }
}

export const excelMatchFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelMatch, FUNCTION_NAMES_LOOKUP.MATCH],
    [ExcelXmatch, FUNCTION_NAMES_LOOKUP.XMATCH],
];
