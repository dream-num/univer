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
import type { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { MAX_COLUMN_COUNT, MAX_ROW_COUNT } from '@univerjs/core';
import { ErrorType } from '../../basics/error-type';
import { deserializeRangeWithSheet } from '../../engine/utils/reference';
import { NodeType } from '../../engine/ast-node/node-type';
import { createNewArray, expandArrayValueObject } from '../../engine/utils/array-object';
import { createSortCompare } from '../../engine/utils/sort-compare';
import { isSingleValueObject } from '../../engine/utils/value-object';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_LOOKUP } from './function-names';
import { Lookup } from './lookup';

abstract class ExcelLegacyLookup extends BaseFunction {
    override minParams = 3;

    override maxParams = 4;

    protected abstract readonly _horizontal: boolean;

    override calculate(lookupValue: BaseValueObject, table: BaseValueObject, resultIndex: BaseValueObject, matchMode?: BaseValueObject): BaseValueObject {
        const key = firstValue(lookupValue);
        if (isSingleValueObject(lookupValue) && key.isError()) return key;
        if (table.isError()) return table;
        if (!table.isArray()) return ErrorValueObject.create(ErrorType.NA);

        const source = table as ArrayValueObject;
        let sortCompare: ReturnType<typeof createSortCompare> | undefined;
        const compare = (left: string, right: string) => (sortCompare ??= createSortCompare())(left, right);
        const index = firstValue(resultIndex);
        const mode = matchMode ? firstValue(matchMode) : undefined;
        const calculate = (value: BaseValueObject, outputIndex: BaseValueObject, flag?: BaseValueObject) =>
            this._lookUp(value, source, outputIndex, flag, compare);
        if (isSingleValueObject(lookupValue) && (!matchMode || isSingleValueObject(matchMode))) {
            if (!resultIndex.isArray() || isSingleValueObject(resultIndex)) return calculate(key, index, mode);
            return this._forArrayOfResultIndices(resultIndex as ArrayValueObject, (cell) => calculate(key, cell, mode));
        }

        const rows = Math.max(lookupValue.isArray() ? (lookupValue as ArrayValueObject).getRowCount() : 1, matchMode?.isArray() ? (matchMode as ArrayValueObject).getRowCount() : 1);
        const columns = Math.max(lookupValue.isArray() ? (lookupValue as ArrayValueObject).getColumnCount() : 1, matchMode?.isArray() ? (matchMode as ArrayValueObject).getColumnCount() : 1);
        const missing = ErrorValueObject.create(ErrorType.NA);
        const keys = expandArrayValueObject(rows, columns, lookupValue, missing);
        const flags = matchMode ? expandArrayValueObject(rows, columns, matchMode, missing) : undefined;
        return keys.mapValue((value, row, column) => calculate(value, index, flags?.get(row, column) ?? undefined));
    }

    private _forArrayOfResultIndices(indices: ArrayValueObject, calculate: (index: BaseValueObject) => BaseValueObject): BaseValueObject {
        const rows = indices.getRowCount();
        const columns = indices.getColumnCount();
        const result: BaseValueObject[][] = [];
        for (let row = 0; row < rows; row++) {
            const values: BaseValueObject[] = [];
            for (let col = 0; col < columns; col++) {
                const value = calculate(indices.get(row, col) ?? NullValueObject.create());
                if (value.isError()) return value;
                values.push(value);
            }
            result.push(values);
        }
        return createNewArray(result, rows, columns);
    }

    private _lookUp(
        key: BaseValueObject,
        table: ArrayValueObject,
        resultIndex: BaseValueObject,
        matchMode: BaseValueObject | undefined,
        compare: (left: string, right: string) => number
    ): BaseValueObject {
        if (key.isError()) return key;
        if (key.isString() && String(key.getValue()).length > 255) return ErrorValueObject.create(ErrorType.VALUE);
        const index = parseIndex(resultIndex);
        if (index instanceof ErrorValueObject) return index;
        const approximate = parseMatchMode(matchMode);
        if (approximate instanceof ErrorValueObject) return approximate;
        const searchAxis = this._horizontal ? table.getColumnCount() : table.getRowCount();
        const at = (position: number) => (this._horizontal ? table.get(0, position) : table.get(position, 0)) ?? NullValueObject.create();
        const value = key.isNull() ? NumberValueObject.create(0) : key;
        const position = approximate ? approximatePosition(searchAxis, at, value, compare) : exactPosition(searchAxis, at, value);
        if (position === undefined) return ErrorValueObject.create(ErrorType.NA);
        if (index < 1) return ErrorValueObject.create(ErrorType.VALUE);
        if (index > (this._horizontal ? table.getRowCount() : table.getColumnCount())) {
            return ErrorValueObject.create(ErrorType.REF);
        }
        const result = this._horizontal ? table.get(index - 1, position) : table.get(position, index - 1);
        return !result || result.isNull() ? NumberValueObject.create(0) : result;
    }
}

function firstValue(value: BaseValueObject): BaseValueObject {
    return value.isArray() ? (value as ArrayValueObject).getFirstCell() : value;
}

function parseIndex(value: BaseValueObject): number | ErrorValueObject {
    if (value.isError()) {
        return value.getValue() === ErrorType.NA ? Infinity : value as ErrorValueObject;
    }
    const number = value.convertToNumberObjectValue();
    if (number.isError()) return number as ErrorValueObject;
    return Math.floor(Number(number.getValue()));
}

function parseMatchMode(value: BaseValueObject | undefined): boolean | ErrorValueObject {
    if (!value) return true;
    if (value.isError()) return value as ErrorValueObject;
    if (value.isString()) {
        const text = String(value.getValue()).toUpperCase();
        if (text === 'FALSE' || text === 'TRUE') return text === 'TRUE';
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    return !value.isNull() && Boolean(value.getValue());
}

function rank(value: BaseValueObject): number {
    if (value.isNumber()) return 0;
    if (value.isString()) return 1;
    return value.isBoolean() ? 2 : 3;
}

function approximatePosition(
    length: number,
    at: (index: number) => BaseValueObject,
    query: BaseValueObject,
    compare: (left: string, right: string) => number
): number | undefined {
    const queryRank = rank(query);
    let left = 0;
    let right = length;
    let found: number | undefined;
    const order = (item: BaseValueObject): number => {
        const itemRank = rank(item);
        if (itemRank !== queryRank) return itemRank - queryRank;
        return queryRank === 1 ? compare(String(item.getValue()), String(query.getValue())) : Number(item.getValue()) - Number(query.getValue());
    };
    while (left < right) {
        const middle = left + Math.floor((right - left - 1) / 2);
        const item = at(middle);
        const comparison = order(item);
        if (comparison === 0) {
            let last = middle;
            while (last + 1 < length && order(at(last + 1)) === 0) last++;
            return last;
        }
        if (comparison > 0) {
            right = middle;
        } else {
            if (rank(item) === queryRank) found = middle;
            left = middle + 1;
        }
    }
    return found;
}

function exactPosition(length: number, at: (index: number) => BaseValueObject, query: BaseValueObject): number | undefined {
    const queryRank = rank(query);
    for (let position = 0; position < length; position++) {
        const item = at(position);
        if (rank(item) !== queryRank) continue;
        if (query.isNumber()) {
            if (item.getValue() === query.getValue()) return position;
        } else if (item.isEqual(query).getValue() === true) {
            return position;
        }
    }
}

class ExcelVlookup extends ExcelLegacyLookup {
    protected readonly _horizontal = false;
}

class ExcelHlookup extends ExcelLegacyLookup {
    protected readonly _horizontal = true;
}

function fixedReferenceShape(node: BaseAstNode): [number, number] | undefined {
    const token = node.nodeType === NodeType.UNION && node.getToken() === ':'
        ? node.getChildren().filter((child) => child.nodeType === NodeType.REFERENCE).map((child) => child.getToken()).join(':')
        : node.nodeType === NodeType.REFERENCE ? node.getToken() : '';
    if (!/^\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?$/i.test(token)) return;
    const { range } = deserializeRangeWithSheet(token);
    if (range.startAbsoluteRefType !== range.endAbsoluteRefType) return;
    return [range.endRow - range.startRow + 1, range.endColumn - range.startColumn + 1];
}

function lookupArgumentValue(argument: FunctionVariantType): BaseValueObject {
    return argument.isReferenceObject() ? (argument as BaseReferenceObject).toArrayValueObject() : argument as BaseValueObject;
}

class ExcelLookup extends Lookup {
    override needsExpandParams = false;
    override needsReferenceObject = true;
    private _projectedResult: BaseReferenceObject | undefined;

    override needsAddressDependencies = (args: readonly BaseAstNode[]): boolean => {
        if (args.length !== 3 || args[2].nodeType === NodeType.VALUE) return false;
        const search = fixedReferenceShape(args[1]);
        const result = fixedReferenceShape(args[2]);
        if (!search || !result) return true;
        if (Math.min(...search) > 1 || Math.min(...result) > 1) return false;
        return Math.max(...search) > Math.max(...result);
    };

    override takeAddressDependencyReferences(): readonly BaseReferenceObject[] | undefined {
        const projected = this._projectedResult;
        this._projectedResult = undefined;
        return projected ? [projected] : undefined;
    }

    override calculate(key: FunctionVariantType, source: FunctionVariantType, target?: FunctionVariantType): BaseValueObject {
        this._projectedResult = undefined;
        const value = lookupArgumentValue(key);
        const search = lookupArgumentValue(source) as ArrayValueObject;
        const result = target?.isReferenceObject() && search.isArray()
            ? this._projectResult(search, target as BaseReferenceObject)
            : target && lookupArgumentValue(target);
        if (value.isError()) return value;
        if (!result || !search.isArray() || (search.getRowCount() > 1 && search.getColumnCount() > 1)) {
            return super.calculate(value, search, result);
        }
        if (result.isError()) return result;

        const output = result.isArray() ? result as ArrayValueObject : undefined;
        const resultRows = output?.getRowCount() ?? 1;
        const resultColumns = output?.getColumnCount() ?? 1;
        const na = ErrorValueObject.create(ErrorType.NA);
        if (resultRows > 1 && resultColumns > 1) return na;

        const searchOne = (key: BaseValueObject) => output ? this.binarySearch(key, search, output) : this._scalarResult(key, search, result);
        return value.isArray() ? (value as ArrayValueObject).mapValue(searchOne) : searchOne(value);
    }

    private _projectResult(search: ArrayValueObject, target: BaseReferenceObject): BaseValueObject {
        const rows = target.getRowCount();
        const columns = target.getColumnCount();
        const searchRows = search.getRowCount();
        const searchColumns = search.getColumnCount();
        const length = Math.max(searchRows, searchColumns);
        if (target.isMultiArea() || (rows > 1 && columns > 1) || (searchRows > 1 && searchColumns > 1) || length <= Math.max(rows, columns)) {
            return lookupArgumentValue(target);
        }

        // A single cell extends across its row, independently of the search vector.
        const range = target.getRangePosition();
        const expanded = this.createReferenceObject(target, {
            ...range,
            endRow: rows === 1 ? range.endRow : Math.min(MAX_ROW_COUNT - 1, range.startRow + length - 1),
            endColumn: rows === 1 ? Math.min(MAX_COLUMN_COUNT - 1, range.startColumn + length - 1) : range.endColumn,
        });
        if (expanded instanceof ErrorValueObject) return expanded;
        this._projectedResult = expanded.withDateSystem(target.getDateSystem());
        return lookupArgumentValue(expanded);
    }

    override binarySearch(key: BaseValueObject, search: ArrayValueObject, result: ArrayValueObject): BaseValueObject {
        if (key.isError()) return key;
        const position = this._position(key, search);
        const rows = result.getRowCount();
        const columns = result.getColumnCount();
        if (position == null || position >= Math.max(rows, columns)) return ErrorValueObject.create(ErrorType.NA);
        const found = rows === 1 ? result.get(0, position) : result.get(position, 0);
        return found == null || found.isNull() ? NumberValueObject.create(0) : found;
    }

    private _position(key: BaseValueObject, search: ArrayValueObject): number | undefined {
        return search.binarySearch(key.isNull() ? NumberValueObject.create(0) : key, undefined, undefined, true);
    }

    private _scalarResult(key: BaseValueObject, search: ArrayValueObject, result: BaseValueObject): BaseValueObject {
        if (key.isError()) return key;
        return this._position(key, search) === 0 ? result : ErrorValueObject.create(ErrorType.NA);
    }
}

export const excelLegacyLookupFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelLookup, FUNCTION_NAMES_LOOKUP.LOOKUP],
    [ExcelVlookup, FUNCTION_NAMES_LOOKUP.VLOOKUP],
    [ExcelHlookup, FUNCTION_NAMES_LOOKUP.HLOOKUP],
];
