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

import type { BaseAstNode } from '../../../engine/ast-node/base-ast-node';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { FUNCTION_NAMES_LOGICAL } from '../function-names';

type GroupByAggregatorName = 'SUM' | 'COUNT' | 'COUNTA' | 'PERCENTOF' | 'MIN' | 'MAX' | 'ARRAYTOTEXT';

interface IArrayInput {
    rowCount: number;
    columnCount: number;
    valueAt: (row: number, column: number) => BaseValueObject;
}

interface IGroupByGroup {
    key: BaseValueObject[];
    values: BaseValueObject[][];
}

export class Groupby extends BaseFunction {
    override minParams = 3;

    override maxParams = 7;

    override needsReferenceObject = true;

    override needsAstChildren = true;

    override calculateAst(
        children: BaseAstNode[],
        getVariant: (node: BaseAstNode) => FunctionVariantType | null
    ) {
        const rowFields = this._arrayInput(getVariant(children[0]));
        if (rowFields instanceof ErrorValueObject) {
            return rowFields;
        }

        const values = this._arrayInput(getVariant(children[1]));
        if (values instanceof ErrorValueObject) {
            return values;
        }

        const aggregators = this._aggregators(children[2]);
        if (aggregators.length === 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (values.rowCount !== rowFields.rowCount) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const includeTotal = children[4] == null ? true : this._numberValue(getVariant(children[4])) !== 0;
        const sortColumnValue = children[5] == null ? 0 : this._numberValue(getVariant(children[5]));
        const sortColumn = sortColumnValue === 0 ? undefined : Math.trunc(sortColumnValue);
        const filter = children[6] == null ? undefined : this._arrayInput(getVariant(children[6]));
        if (filter instanceof ErrorValueObject) {
            return filter;
        }

        const groupColumnCount = rowFields.columnCount;
        const valueColumnCount = values.columnCount;
        const outputValueColumnCount = this._outputValueColumnCount(valueColumnCount, aggregators.length);
        const groups: IGroupByGroup[] = [];
        const allValues = Array.from({ length: valueColumnCount }, () => [] as BaseValueObject[]);

        for (let row = 0; row < rowFields.rowCount; row++) {
            if (filter != null && !this._truthy(filter.valueAt(row, 0))) {
                continue;
            }

            const key: BaseValueObject[] = [];
            for (let column = 0; column < groupColumnCount; column++) {
                key.push(rowFields.valueAt(row, column));
            }

            let group = groups.find((item) => this._keysEqual(item.key, key));
            if (group == null) {
                group = {
                    key,
                    values: Array.from({ length: valueColumnCount }, () => [] as BaseValueObject[]),
                };
                groups.push(group);
            }

            for (let column = 0; column < valueColumnCount; column++) {
                const value = values.valueAt(row, column);
                group.values[column].push(value);
                allValues[column].push(value);
            }
        }

        this._sortGroups(groups, sortColumn);

        const includeHeader = aggregators.length > 1;
        const rowCount = groups.length + (includeHeader ? 1 : 0) + (includeTotal ? 1 : 0);
        const columnCount = groupColumnCount + outputValueColumnCount;
        const result: BaseValueObject[][] = [];

        if (includeHeader) {
            const header: BaseValueObject[] = [];
            for (let column = 0; column < groupColumnCount; column++) {
                header.push(StringValueObject.create(''));
            }
            for (let column = 0; column < outputValueColumnCount; column++) {
                header.push(StringValueObject.create(this._aggregatorHeader(this._aggregatorForOutput(aggregators, valueColumnCount, column))));
            }
            result.push(header);
        }

        for (const group of groups) {
            const row: BaseValueObject[] = [...group.key];
            for (let column = 0; column < outputValueColumnCount; column++) {
                const valueColumn = this._valueColumnForOutput(valueColumnCount, aggregators.length, column);
                const aggregator = this._aggregatorForOutput(aggregators, valueColumnCount, column);
                row.push(this._applyAggregator(aggregator, group.values[valueColumn], allValues[valueColumn]));
            }
            result.push(row);
        }

        if (includeTotal) {
            const row: BaseValueObject[] = [];
            for (let column = 0; column < groupColumnCount; column++) {
                row.push(StringValueObject.create(column === 0 ? 'Total' : ''));
            }
            for (let column = 0; column < outputValueColumnCount; column++) {
                const valueColumn = this._valueColumnForOutput(valueColumnCount, aggregators.length, column);
                const aggregator = this._aggregatorForOutput(aggregators, valueColumnCount, column);
                row.push(this._applyAggregator(aggregator, allValues[valueColumn], allValues[valueColumn]));
            }
            result.push(row);
        }

        return ArrayValueObject.create({
            calculateValueList: result,
            rowCount,
            columnCount,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }

    private _arrayInput(variant: FunctionVariantType | null): IArrayInput | ErrorValueObject {
        if (variant == null) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let value = variant;
        if (value.isReferenceObject()) {
            value = (value as BaseReferenceObject).toArrayValueObject();
        }

        if (value.isError()) {
            return value as ErrorValueObject;
        }

        if (value.isArray()) {
            const array = value as ArrayValueObject;
            return {
                rowCount: array.getRowCount(),
                columnCount: array.getColumnCount(),
                valueAt: (row, column) => array.get(row, column) ?? NullValueObject.create(),
            };
        }

        return {
            rowCount: 1,
            columnCount: 1,
            valueAt: (row, column) => row === 0 && column === 0 ? value as BaseValueObject : NullValueObject.create(),
        };
    }

    private _aggregators(node: BaseAstNode): GroupByAggregatorName[] {
        const name = this._normalizedFunctionName(node.getToken());
        if (name === FUNCTION_NAMES_LOGICAL.GROUPBY) {
            return [];
        }
        if (name === 'HSTACK') {
            return node.getChildren().flatMap((child) => this._aggregators(child));
        }
        if (this._isAggregatorName(name)) {
            return [name];
        }
        return [];
    }

    private _normalizedFunctionName(token: string): string {
        let normalized = token.toUpperCase();
        for (;;) {
            const prefix = ['_XLFN.', '_XLWS.', '_XLETA.'].find((item) => normalized.startsWith(item));
            if (prefix == null) {
                return normalized;
            }
            normalized = normalized.slice(prefix.length);
        }
    }

    private _isAggregatorName(name: string): name is GroupByAggregatorName {
        return name === 'SUM' ||
            name === 'COUNT' ||
            name === 'COUNTA' ||
            name === 'PERCENTOF' ||
            name === 'MIN' ||
            name === 'MAX' ||
            name === 'ARRAYTOTEXT';
    }

    private _outputValueColumnCount(valueColumnCount: number, aggregatorCount: number): number {
        if (valueColumnCount === 1) {
            return aggregatorCount;
        }
        if (aggregatorCount === 1 || valueColumnCount === aggregatorCount) {
            return valueColumnCount;
        }
        return Math.min(valueColumnCount, aggregatorCount);
    }

    private _valueColumnForOutput(valueColumnCount: number, aggregatorCount: number, outputColumn: number): number {
        if (valueColumnCount === 1) {
            return 0;
        }
        if (aggregatorCount === 1 || valueColumnCount === aggregatorCount) {
            return Math.min(outputColumn, valueColumnCount - 1);
        }
        return Math.min(outputColumn, valueColumnCount - 1);
    }

    private _aggregatorForOutput(aggregators: GroupByAggregatorName[], valueColumnCount: number, outputColumn: number): GroupByAggregatorName {
        if (aggregators.length === 1 || valueColumnCount === aggregators.length) {
            return aggregators[Math.min(outputColumn, aggregators.length - 1)];
        }
        return aggregators[Math.min(outputColumn, aggregators.length - 1)];
    }

    private _aggregatorHeader(aggregator: GroupByAggregatorName): string {
        return aggregator === 'PERCENTOF' ? '%' : aggregator;
    }

    private _applyAggregator(
        aggregator: GroupByAggregatorName,
        groupValues: BaseValueObject[],
        allValues: BaseValueObject[]
    ): BaseValueObject {
        switch (aggregator) {
            case 'SUM':
                return NumberValueObject.create(this._sum(groupValues));
            case 'COUNT':
                return NumberValueObject.create(groupValues.filter((value) => value.isNumber()).length);
            case 'COUNTA':
                return NumberValueObject.create(groupValues.filter((value) => !value.isNull() && !(value.isString() && value.getValue() === '')).length);
            case 'PERCENTOF': {
                const allTotal = this._sum(allValues);
                if (allTotal === 0) {
                    return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
                }
                return NumberValueObject.create(this._sum(groupValues) / allTotal);
            }
            case 'MIN': {
                const values = groupValues.map((value) => this._numericValue(value)).filter((value) => value != null) as number[];
                return NumberValueObject.create(values.length === 0 ? 0 : Math.min(...values));
            }
            case 'MAX': {
                const values = groupValues.map((value) => this._numericValue(value)).filter((value) => value != null) as number[];
                return NumberValueObject.create(values.length === 0 ? 0 : Math.max(...values));
            }
            case 'ARRAYTOTEXT':
                return StringValueObject.create(groupValues.map((value) => this._textValue(value)).filter(Boolean).join(', '));
        }
    }

    private _sum(values: BaseValueObject[]): number {
        return values.reduce((sum, value) => sum + (this._numericValue(value) ?? 0), 0);
    }

    private _numericValue(value: BaseValueObject): number | undefined {
        return value.isNumber() ? Number(value.getValue()) : undefined;
    }

    private _numberValue(variant: FunctionVariantType | null): number {
        if (variant == null || variant.isError()) {
            return 0;
        }
        if (variant.isReferenceObject()) {
            variant = (variant as BaseReferenceObject).getFirstCell();
        }
        if (variant.isArray()) {
            variant = (variant as ArrayValueObject).get(0, 0) ?? NullValueObject.create();
        }
        const value = (variant as BaseValueObject).getValue();
        return typeof value === 'number' ? Math.trunc(value) : Math.trunc(Number(value) || 0);
    }

    private _truthy(value: BaseValueObject): boolean {
        if (value.isError() || value.isNull()) {
            return false;
        }
        return Boolean(value.getValue());
    }

    private _keysEqual(left: BaseValueObject[], right: BaseValueObject[]): boolean {
        return left.length === right.length && left.every((value, index) => this._keyValue(value) === this._keyValue(right[index]));
    }

    private _keyValue(value: BaseValueObject): string {
        if (value.isError()) {
            return `error:${(value as ErrorValueObject).getErrorType()}`;
        }
        if (value.isNull()) {
            return 'null:';
        }
        return `${typeof value.getValue()}:${String(value.getValue())}`;
    }

    private _sortGroups(groups: IGroupByGroup[], sortColumn?: number): void {
        const descending = sortColumn != null && sortColumn < 0;
        const sortIndex = sortColumn == null ? undefined : Math.abs(sortColumn) - 1;
        groups.sort((left, right) => {
            const compare = sortIndex != null && sortIndex < left.key.length
                ? this._compareValue(left.key[sortIndex], right.key[sortIndex])
                : this._compareKey(left.key, right.key);
            return descending ? -compare : compare;
        });
    }

    private _compareKey(left: BaseValueObject[], right: BaseValueObject[]): number {
        for (let index = 0; index < Math.min(left.length, right.length); index++) {
            const compare = this._compareValue(left[index], right[index]);
            if (compare !== 0) {
                return compare;
            }
        }
        return left.length - right.length;
    }

    private _compareValue(left: BaseValueObject, right: BaseValueObject): number {
        const leftNumber = this._numericValue(left);
        const rightNumber = this._numericValue(right);
        if (leftNumber != null && rightNumber != null) {
            return leftNumber - rightNumber;
        }
        return this._textValue(left).toUpperCase().localeCompare(this._textValue(right).toUpperCase());
    }

    private _textValue(value: BaseValueObject): string {
        if (value.isNull()) {
            return '';
        }
        return String(value.getValue());
    }
}
