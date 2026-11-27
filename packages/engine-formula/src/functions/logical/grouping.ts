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

import type { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import type { LambdaValueObjectObject } from '../../engine/value-object/lambda-value-object';
import { MAX_COLUMN_COUNT, MAX_ROW_COUNT } from '@univerjs/core';
import { ErrorType } from '../../basics/error-type';
import { normalizeFunctionToken } from '../../basics/function';
import { createNewArray } from '../../engine/utils/array-object';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject, StringValueObject } from '../../engine/value-object/primitive-object';

type GetVariant = (node: BaseAstNode) => FunctionVariantType | null;

interface IArrayInput {
    rowCount: number;
    columnCount: number;
    at: (row: number, column: number) => BaseValueObject;
}

interface IAggregator {
    name: string;
    lambda: LambdaValueObjectObject;
}

interface IAggregators {
    items: IAggregator[];
    vertical: boolean;
}

interface IMeasure {
    column: number;
    aggregator: IAggregator;
}

interface IGroup {
    key: BaseValueObject[];
    rows: number[];
    children: Map<string, IGroup>;
    parent?: IGroup;
}

const empty = StringValueObject.create('');
const blank = NullValueObject.create();
const invalid = () => ErrorValueObject.create(ErrorType.VALUE);

function readArray(argument: FunctionVariantType): IArrayInput | ErrorValueObject {
    const value = argument.isReferenceObject()
        ? (argument as BaseReferenceObject).toArrayValueObject()
        : argument as BaseValueObject;
    if (value.isError()) {
        return value as ErrorValueObject;
    }
    if (value.isArray()) {
        const array = value as ArrayValueObject;
        return {
            rowCount: array.getRowCount(),
            columnCount: array.getColumnCount(),
            at: (row, column) => array.getRealValue(row, column) ?? blank,
        };
    }
    return { rowCount: 1, columnCount: 1, at: () => value };
}

function argumentAt(children: BaseAstNode[], index: number, get: GetVariant): FunctionVariantType | undefined {
    const node = children[index];
    const value = node && get(node);
    return value && (value.isReferenceObject() || !(value as BaseValueObject).isNull()) ? value : undefined;
}

function integerArgument(value: FunctionVariantType | undefined, fallback: number): number | ErrorValueObject {
    if (!value) {
        return fallback;
    }
    const scalar = value.isReferenceObject() ? (value as BaseReferenceObject).getFirstCell() : value as BaseValueObject;
    if (scalar.isError()) {
        return scalar as ErrorValueObject;
    }
    const num = Number(scalar.getValue());
    return Number.isFinite(num) ? Math.trunc(num) : invalid();
}

function lambdaItems(node: BaseAstNode, get: GetVariant): IAggregator[] {
    const name = normalizeFunctionToken(node.getToken().trim().toUpperCase());
    if (name === 'HSTACK' || name === 'VSTACK') {
        const groups = node.getChildren().map((child) => lambdaItems(child, get));
        return groups.every((group) => group.length) ? groups.flat() : [];
    }
    const value = get(node) as BaseValueObject | null;
    if (!value) {
        return [];
    }
    if (value.isLambda()) {
        const lambda = value as LambdaValueObjectObject;
        const arity = lambda.getLambdaPrivacyVarKeys().length;
        return arity === 1 || arity === 2
            ? [{ name: name === 'PERCENTOF' ? '%' : name === 'LAMBDA' ? '' : name, lambda }]
            : [];
    }
    if (value.isArray()) {
        const array = value as ArrayValueObject;
        if (array.getRowCount() !== 1 && array.getColumnCount() !== 1) {
            return [];
        }
        const items: IAggregator[] = [];
        array.iterator((item) => {
            if (item?.isLambda()) {
                items.push({ name: '', lambda: item as LambdaValueObjectObject });
            }
        });
        return items.length === array.getRowCount() * array.getColumnCount() ? items : [];
    }
    return [];
}

function readAggregators(node: BaseAstNode, get: GetVariant): IAggregators {
    const value = get(node) as BaseValueObject | null;
    return {
        items: lambdaItems(node, get),
        vertical: normalizeFunctionToken(node.getToken().trim().toUpperCase()) === 'VSTACK' ||
            Boolean(value?.isArray() && (value as ArrayValueObject).getRowCount() > 1),
    };
}

function createGroup(key: BaseValueObject[], parent?: IGroup): IGroup {
    return { key, parent, rows: [], children: new Map() };
}

function keyRank(value: BaseValueObject): number {
    if (value.isNumber()) return 0;
    if (value.isString()) return 1;
    if (value.isBoolean()) return 2;
    if (value.isError()) return 3;
    return 4;
}

function keyToken(value: BaseValueObject): string {
    const rank = keyRank(value);
    return `${rank}:${rank === 4 ? '' : String(value.getValue()).toUpperCase()}`;
}

function compare(a: BaseValueObject, b: BaseValueObject): number {
    const rank = keyRank(a) - keyRank(b);
    if (rank) return rank;
    if (a.isNumber() && b.isNumber()) {
        return Number(a.getValue()) - Number(b.getValue());
    }
    return String(a.getValue()).toUpperCase().localeCompare(String(b.getValue()).toUpperCase());
}

function insert(root: IGroup, input: IArrayInput | undefined, row: number): void {
    root.rows.push(row);
    let group = root;
    if (!input) return;
    for (let column = 0; column < input.columnCount; column++) {
        const value = input.at(row, column);
        const token = keyToken(value);
        let child = group.children.get(token);
        if (!child) {
            child = createGroup([...group.key, value], group);
            group.children.set(token, child);
        }
        child.rows.push(row);
        group = child;
    }
}

function displayKey(group: IGroup, width: number, depth: number): BaseValueObject[] {
    return Array.from({ length: width }, (_, column) => {
        if (!group.parent && column === 0) {
            return StringValueObject.create(Math.abs(depth) > 1 ? 'Grand Total' : 'Total');
        }
        return group.key[column] ?? empty;
    });
}

function intersection(a: number[], b: number[]): number[] {
    const result: number[] = [];
    let left = 0;
    let right = 0;
    while (left < a.length && right < b.length) {
        if (a[left] === b[right]) {
            result.push(a[left++]);
            right++;
        } else if (a[left] < b[right]) {
            left++;
        } else {
            right++;
        }
    }
    return result;
}

function runAggregator(measure: IMeasure, values: IArrayInput, rows: number[], denominator: () => number[]): BaseValueObject {
    const toArray = (ids: number[]) => createNewArray(ids.map((row) => [values.at(row, measure.column)]), ids.length, 1);
    const lambda = measure.aggregator.lambda;
    const args = [toArray(rows)];
    if (lambda.getLambdaPrivacyVarKeys().length === 2) {
        args.push(toArray(denominator()));
    }
    const result = lambda.execute(...args);
    if (!result.isValueObject()) return invalid();
    const value = result as BaseValueObject;
    if (value.isArray()) return invalid();
    return value.isNull() ? NumberValueObject.create(0) : value;
}

function readSort(argument: FunctionVariantType | undefined, width: number, measures: number): number[] | ErrorValueObject {
    if (!argument) return [];
    const array = readArray(argument);
    if (array instanceof ErrorValueObject) return array;
    if (array.rowCount > 1 && array.columnCount > 1) return invalid();
    const order: number[] = [];
    for (let r = 0; r < array.rowCount; r++) {
        for (let c = 0; c < array.columnCount; c++) {
            const value = integerArgument(array.at(r, c), 0);
            if (typeof value !== 'number') return value;
            if (!value || Math.abs(value) > width + measures) return invalid();
            order.push(value);
        }
    }
    return order.length > 1 && order.some((item) => Math.abs(item) > width) ? invalid() : order;
}

function axisGroups(root: IGroup, width: number, depth: number, sort: number[], flat: boolean, sortValue: (group: IGroup, index: number) => BaseValueObject): IGroup[] {
    if (width === 0) return [root];
    const groups: IGroup[] = [];
    const absoluteDepth = Math.abs(depth);
    const byValue = sort.length === 1 && Math.abs(sort[0]) > width;
    const values = new Map<IGroup, BaseValueObject>();
    const getSortValue = (group: IGroup) => {
        let value = values.get(group);
        if (!value) {
            value = sortValue(group, Math.abs(sort[0]) - width - 1);
            values.set(group, value);
        }
        return value;
    };
    const compareValue = (left: IGroup, right: IGroup) => compare(getSortValue(left), getSortValue(right)) * Math.sign(sort[0]);
    const stack = [{ group: root, exiting: false }];
    while (stack.length) {
        const { group, exiting } = stack.pop()!;
        if (exiting) {
            groups.push(group);
            continue;
        }
        const level = group.key.length;
        const emit = level === width || level < absoluteDepth;
        if (emit) {
            if (depth < 0) groups.push(group);
            else stack.push({ group, exiting: true });
        }
        const children = [...group.children.values()];
        const order = sort.find((index) => Math.abs(index) === level + 1) ?? 1;
        children.sort((a, b) => (byValue ? compareValue(a, b) : 0) || compare(a.key[level], b.key[level]) * Math.sign(order));
        for (let index = children.length - 1; index >= 0; index--) {
            stack.push({ group: children[index], exiting: false });
        }
    }
    if (flat && sort.length) {
        const leaves = groups.filter((group) => group !== root);
        leaves.sort((a, b) => {
            if (byValue) return compareValue(a, b);
            for (const item of sort) {
                const column = Math.abs(item) - 1;
                const order = compare(a.key[column], b.key[column]);
                if (order) return order * Math.sign(item);
            }
            return 0;
        });
        return depth < 0 ? [root, ...leaves] : depth > 0 ? [...leaves, root] : leaves;
    }
    return groups;
}

function names(input: IArrayInput, prefix: string, supplied: boolean): BaseValueObject[] {
    return Array.from({ length: input.columnCount }, (_, column) => supplied
        ? input.at(0, column)
        : StringValueObject.create(`${prefix} ${column + 1}`));
}

interface ILayout {
    pivot: boolean;
    rowFields?: IArrayInput;
    colFields?: IArrayInput;
    values: IArrayInput;
    rowRoot: IGroup;
    colRoot: IGroup;
    rowGroups: IGroup[];
    colGroups: IGroup[];
    rowDepth: number;
    colDepth: number;
    measures: IMeasure[];
    aggregators: IAggregators;
    supplied: boolean;
    showHeaders: boolean;
    relativeTo: number;
}

function formatResult(layout: ILayout): BaseValueObject {
    const { pivot, rowFields, colFields, rowRoot, colRoot, rowGroups, colGroups, rowDepth, colDepth, values, measures, aggregators, supplied, showHeaders, relativeTo } = layout;
    const rwidth = rowFields?.columnCount ?? 0;
    const cwidth = colFields?.columnCount ?? 0;
    const vertical = aggregators.vertical && aggregators.items.length > 1;
    const multipleNames = aggregators.items.length > 1;
    const leading = rwidth + Number(vertical);
    const columnMeasures = vertical ? 1 : measures.length;
    const width = leading + colGroups.length * columnMeasures;
    const height = rowGroups.length * (vertical ? measures.length : 1) + cwidth + Number(showHeaders) * (1 + Number(cwidth > 0)) + Number(!vertical && multipleNames);
    if (width > MAX_COLUMN_COUNT || height > MAX_ROW_COUNT) {
        return ErrorValueObject.create(ErrorType.SPILL);
    }

    const result: BaseValueObject[][] = [];
    const ckeys = colGroups.map((group) => displayKey(group, cwidth, colDepth));
    const padding = (size: number): BaseValueObject[] => Array.from({ length: size }, () => empty);
    if (showHeaders && colFields) {
        const columnNames = names(colFields, 'Column Field', supplied);
        result.push([...padding(leading), ...columnNames.slice(0, width - leading), ...padding(Math.max(0, width - leading - columnNames.length))]);
    }
    for (let level = 0; level < cwidth; level++) {
        result.push([...padding(leading), ...ckeys.flatMap((key) => padding(columnMeasures).fill(key[level]))]);
    }
    if (!vertical && multipleNames) {
        result.push([...padding(leading), ...colGroups.flatMap(() => measures.map((measure) => StringValueObject.create(measure.aggregator.name)))]);
    }
    if (showHeaders) {
        const rowNames = rowFields ? names(rowFields, 'Row Field', supplied) : [];
        const valueNames = names(values, 'Value', supplied);
        result.push([...rowNames, ...padding(Number(vertical)), ...colGroups.flatMap(() => (vertical ? [measures[0]] : measures).map((measure) => valueNames[measure.column]))]);
    }

    for (const row of rowGroups) {
        const rowKey = displayKey(row, rwidth, rowDepth);
        const columns = colGroups.map((col) => {
            if (row === rowRoot) return col.rows;
            if (col === colRoot) return row.rows;
            return intersection(row.rows, col.rows);
        });
        const derive = (col: IGroup) => {
            if (!pivot || relativeTo === 2) return rowRoot.rows;
            if (relativeTo === 0) return col.rows;
            if (relativeTo === 1) return row.rows;
            if (relativeTo === 3) return intersection(row.rows, (col.parent ?? colRoot).rows);
            return intersection((row.parent ?? rowRoot).rows, col.rows);
        };
        const cell = (col: IGroup, index: number, measure: IMeasure) => {
            if (!columns[index].length || (cwidth > 0 && col === colRoot && values.columnCount > 1 && aggregators.items.length === 1)) {
                return empty;
            }
            return runAggregator(measure, values, columns[index], () => derive(col));
        };
        if (vertical) {
            for (const measure of measures) {
                result.push([...rowKey, StringValueObject.create(measure.aggregator.name), ...colGroups.map((col, index) => cell(col, index, measure))]);
            }
        } else {
            result.push([...rowKey, ...colGroups.flatMap((col, index) => measures.map((measure) => cell(col, index, measure)))]);
        }
    }
    return createNewArray(result, result.length, width);
}

interface IGroupingOptions {
    rowDepth: number;
    colDepth: number;
    rowSort: number[];
    colSort: number[];
    supplied: boolean;
    showHeaders: boolean;
    last: number;
}

function readOptions(
    pivot: boolean,
    argument: (index: number) => FunctionVariantType | undefined,
    rowWidth: number,
    colWidth: number,
    values: IArrayInput,
    measureCount: number
): IGroupingOptions | ErrorValueObject {
    const offset = Number(pivot);
    const headerArg = argument(3 + offset);
    const headers = integerArgument(headerArg, -1);
    const rowDepth = integerArgument(argument(4 + offset), Number(rowWidth > 0));
    const colDepth = integerArgument(pivot ? argument(7) : undefined, Number(colWidth > 0));
    const last = integerArgument(argument(pivot ? 10 : 7), 0);
    if (typeof headers !== 'number') return headers;
    if (typeof rowDepth !== 'number') return rowDepth;
    if (typeof colDepth !== 'number') return colDepth;
    if (typeof last !== 'number') return last;
    if (headers < -1 || headers > 3 || (headers === -1 && headerArg)) return invalid();
    if ((rowWidth > 0 && Math.abs(rowDepth) > rowWidth) || (colWidth > 0 && Math.abs(colDepth) > colWidth)) return invalid();
    if (last < 0 || last > (pivot ? 4 : 1) || (!pivot && last === 1 && Math.abs(rowDepth) > 1)) return invalid();

    const rowSort = readSort(argument(5 + offset), rowWidth, measureCount);
    const colSort = readSort(pivot ? argument(8) : undefined, colWidth, measureCount);
    if (rowSort instanceof ErrorValueObject) return rowSort;
    if (colSort instanceof ErrorValueObject) return colSort;

    const hasInferredHeader = headers === -1 && values.rowCount > 1 && values.at(0, 0).isString() && values.at(1, 0).isNumber();
    return {
        rowDepth,
        colDepth,
        rowSort: pivot && colWidth && !colDepth ? rowSort.filter((item) => Math.abs(item) <= rowWidth) : rowSort,
        colSort: rowWidth && !rowDepth ? colSort.filter((item) => Math.abs(item) <= colWidth) : colSort,
        supplied: headers === 1 || headers === 3 || hasInferredHeader,
        showHeaders: headers === 2 || headers === 3 || (hasInferredHeader && (rowWidth > 1 || colWidth > 1)),
        last,
    };
}

function getMeasures(values: IArrayInput, aggregators: IAggregators): IMeasure[] {
    const columns = values.columnCount;
    const count = aggregators.items.length;
    if (count === 0 || (columns > 1 && count > 1 && columns !== count)) return [];
    return Array.from({ length: Math.max(columns, count) }, (_, index) => ({
        column: columns === 1 ? 0 : index,
        aggregator: aggregators.items[count === 1 ? 0 : index],
    }));
}

export function calculateGroupedArray(pivot: boolean, children: BaseAstNode[], get: GetVariant): BaseValueObject {
    const argument = (index: number) => argumentAt(children, index, get);
    const read = (index: number) => {
        const value = argument(index);
        return value ? readArray(value) : undefined;
    };
    const offset = Number(pivot);
    const rowFields = read(0);
    const colFields = pivot ? read(1) : undefined;
    const values = read(1 + offset);
    const filter = read(pivot ? 9 : 6);
    if (rowFields instanceof ErrorValueObject) return rowFields;
    if (colFields instanceof ErrorValueObject) return colFields;
    if (values instanceof ErrorValueObject) return values;
    if (filter instanceof ErrorValueObject) return filter;
    if (!values || (!pivot && !rowFields)) return invalid();
    if ([rowFields, colFields, filter].some((array) => array && array.rowCount !== values.rowCount)) return invalid();
    if (filter && filter.columnCount !== 1) return invalid();

    const aggregators = readAggregators(children[2 + offset], get);
    const measures = getMeasures(values, aggregators);
    if (!measures.length) return invalid();

    const rwidth = rowFields?.columnCount ?? 0;
    const cwidth = colFields?.columnCount ?? 0;
    const options = readOptions(pivot, argument, rwidth, cwidth, values, measures.length);
    if (options instanceof ErrorValueObject) return options;
    const { rowDepth, colDepth, rowSort, colSort, supplied, showHeaders, last } = options;
    const rowRoot = createGroup([]);
    const colRoot = createGroup([]);
    for (let row = Number(supplied); row < values.rowCount; row++) {
        const include = filter?.at(row, 0);
        if (include?.isError()) return include;
        if (include && (include.isNull() || !Number(include.getValue()))) continue;
        insert(rowRoot, rowFields, row);
        insert(colRoot, colFields, row);
    }
    if (!rowRoot.rows.length) return invalid();
    const sortValue = (group: IGroup, index: number) => runAggregator(measures[index], values, group.rows, () => rowRoot.rows);
    return formatResult({
        pivot,
        rowFields,
        colFields,
        values,
        measures,
        aggregators,
        supplied,
        showHeaders,
        rowRoot,
        colRoot,
        rowDepth,
        colDepth,
        rowGroups: axisGroups(rowRoot, rwidth, rowDepth, rowSort, !pivot && last === 1, sortValue),
        colGroups: axisGroups(colRoot, cwidth, colDepth, colSort, false, sortValue),
        relativeTo: last,
    });
}
