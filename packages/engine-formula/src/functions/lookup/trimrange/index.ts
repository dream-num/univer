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

import type { IRange } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { RangeReferenceObject } from '../../../engine/reference-object/range-reference-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { copyReferenceContext } from '../../../engine/utils/three-dimensional-reference';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { FUNCTION_NAMES_LOOKUP } from '../function-names';

const DENSE_TRIM_LIMIT = 4096;

export class Trimrange extends BaseFunction {
    override minParams = 1;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(value: FunctionVariantType, rows?: FunctionVariantType, columns?: FunctionVariantType) {
        if (value.isError()) {
            return value;
        }

        const rowArg = readTrimArgument(rows);
        const columnArg = readTrimArgument(columns);
        if (rowArg?.isArray() || columnArg?.isArray()) {
            return trimArrayArguments(rowArg, columnArg);
        }

        const rowMode = getTrimMode(rowArg);
        const columnMode = getTrimMode(columnArg);
        if (typeof rowMode !== 'number') {
            return rowMode;
        }
        if (typeof columnMode !== 'number') {
            return columnMode;
        }

        if (value.isReferenceObject()) {
            return trimReference(value as BaseReferenceObject, rowMode, columnMode);
        }
        if (!value.isArray()) {
            return (value as BaseValueObject).isNull() && (rowMode !== 0 || columnMode !== 0) ? ErrorValueObject.create(ErrorType.REF) : value;
        }

        const array = value as ArrayValueObject;
        const source = {
            startRow: 0,
            endRow: array.getRowCount() - 1,
            startColumn: 0,
            endColumn: array.getColumnCount() - 1,
        };
        const bounds = trimBounds(source, rowMode, columnMode, (row, column) => array.get(row, column)?.isNull() ?? true);
        return bounds
            ? array.slice([bounds.startRow, bounds.endRow + 1], [bounds.startColumn, bounds.endColumn + 1]) ?? ErrorValueObject.create(ErrorType.REF)
            : ErrorValueObject.create(ErrorType.REF);
    }
}

export class TrimReferenceOperator extends Trimrange {
    override maxParams = 1;

    override calculate(value: FunctionVariantType) {
        const mode = this.name === FUNCTION_NAMES_LOOKUP._TRO_LEADING ? 1 : this.name === FUNCTION_NAMES_LOOKUP._TRO_TRAILING ? 2 : 3;
        const argument = NumberValueObject.create(mode);
        return super.calculate(value, argument, argument);
    }
}

function readTrimArgument(arg?: FunctionVariantType): BaseValueObject | undefined {
    if (!arg?.isReferenceObject()) {
        return arg as BaseValueObject | undefined;
    }
    const reference = arg as BaseReferenceObject;
    if (reference.isMultiArea()) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    const range = reference.getRangePosition();
    if (range.startRow !== range.endRow || range.startColumn !== range.endColumn) {
        return reference.toArrayValueObject();
    }
    const value = reference.getFirstCell();
    return value.isNull() ? NumberValueObject.create(0) : value;
}

function getTrimMode(value?: BaseValueObject) {
    if (value == null || value.isNull()) {
        return 3;
    }
    if (value.isError()) {
        return value;
    }
    if (value.isArray() || (value.isString() && String(value.getValue()).trim() === '')) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    const mode = Number(value.getValue());
    return Number.isInteger(mode) && mode >= 0 && mode <= 3 ? mode : ErrorValueObject.create(ErrorType.VALUE);
}

function trimArrayArguments(rows?: BaseValueObject, columns?: BaseValueObject) {
    const rowArg = rows ?? NumberValueObject.create(3);
    const columnArg = columns ?? NumberValueObject.create(3);
    const rowArray = rowArg.isArray() ? rowArg as ArrayValueObject : undefined;
    const columnArray = columnArg.isArray() ? columnArg as ArrayValueObject : undefined;
    const rowCount = Math.max(rowArray?.getRowCount() ?? 1, columnArray?.getRowCount() ?? 1);
    const columnCount = Math.max(rowArray?.getColumnCount() ?? 1, columnArray?.getColumnCount() ?? 1);
    const missing = ErrorValueObject.create(ErrorType.NA);
    const expandedRows = expandArrayValueObject(rowCount, columnCount, rowArg, missing);
    const expandedColumns = expandArrayValueObject(rowCount, columnCount, columnArg, missing);
    const invalid = ErrorValueObject.create(ErrorType.VALUE);
    return expandedRows.mapValue((row, rowIndex, columnIndex) => {
        const column = expandedColumns.get(rowIndex, columnIndex);
        return row?.isError() ? row : column?.isError() ? column : invalid;
    });
}

function trimReference(reference: BaseReferenceObject, rowMode: number, columnMode: number) {
    if (reference.isMultiArea()) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    if (reference.isExceedRange() || (reference.getForcedSheetName() && !reference.getForcedSheetId())) {
        return ErrorValueObject.create(ErrorType.REF);
    }
    if (rowMode === 0 && columnMode === 0) {
        return reference;
    }
    const source = reference.getRangePosition();
    const { startRow, endRow, startColumn, endColumn } = source;
    const area = (endRow - startRow + 1) * (endColumn - startColumn + 1);
    const bounds = area > DENSE_TRIM_LIMIT
        ? trimSparseReference(reference, source, rowMode, columnMode)
        : trimBounds(source, rowMode, columnMode, (row, column) => reference.isCellBlank(row, column));
    if (!bounds) {
        return ErrorValueObject.create(ErrorType.REF);
    }

    // Use the allocated grid to find data and preserve an open end for an untrimmed tail.
    const raw = reference.getRangeData();
    const trimmed = new RangeReferenceObject({
        ...bounds,
        endRow: !(rowMode & 2) && Number.isNaN(raw.endRow) ? Number.NaN : bounds.endRow,
        endColumn: !(columnMode & 2) && Number.isNaN(raw.endColumn) ? Number.NaN : bounds.endColumn,
    }, reference.getForcedSheetId(), reference.getForcedUnitId());
    copyReferenceContext(reference, trimmed);
    trimmed.setForcedSheetName(reference.getForcedSheetName());
    trimmed.setRefOffset(0, 0);
    return trimmed;
}

function trimSparseReference(reference: BaseReferenceObject, source: IRange, rowMode: number, columnMode: number) {
    const unitId = reference.getUnitId();
    const sheetId = reference.getSheetId();
    const matrices = [
        reference.getCurrentActiveSheetData()?.cellData,
        reference.getCurrentRuntimeSheetData(),
        reference.getCurrentActiveArrayFormulaCellData(),
        reference.getCurrentRuntimeActiveArrayFormulaCellData(),
        ...Object.values(reference.getRuntimeFeatureCellData()).map((feature) => feature[unitId]?.[sheetId]),
    ];
    let firstRow = Infinity;
    let lastRow = -Infinity;
    let firstColumn = Infinity;
    let lastColumn = -Infinity;
    for (const matrix of matrices) {
        matrix?.forEach((row, cells) => {
            if (row < source.startRow || row > source.endRow) {
                return;
            }

            for (const key of Object.keys(cells)) {
                const column = Number(key);
                if (column < source.startColumn || column > source.endColumn || reference.isCellBlank(row, column)) {
                    continue;
                }
                firstRow = Math.min(firstRow, row);
                lastRow = Math.max(lastRow, row);
                firstColumn = Math.min(firstColumn, column);
                lastColumn = Math.max(lastColumn, column);
            }
        });
    }
    if (!Number.isFinite(firstRow)) {
        return;
    }
    return {
        startRow: rowMode & 1 ? firstRow : source.startRow,
        endRow: rowMode & 2 ? lastRow : source.endRow,
        startColumn: columnMode & 1 ? firstColumn : source.startColumn,
        endColumn: columnMode & 2 ? lastColumn : source.endColumn,
    };
}

function trimBounds(
    source: IRange,
    rowMode: number,
    columnMode: number,
    isBlank: (row: number, column: number) => boolean
) {
    const { startRow: firstRow, endRow: lastRow, startColumn: firstColumn, endColumn: lastColumn } = source;
    const rowIsBlank = (row: number) => {
        for (let column = firstColumn; column <= lastColumn; column++) {
            if (!isBlank(row, column)) {
                return false;
            }
        }
        return true;
    };
    const [startRow, endRow] = trimEdges(firstRow, lastRow, rowMode, rowIsBlank);
    if (startRow > endRow) {
        return;
    }

    const columnIsBlank = (column: number) => {
        for (let row = startRow; row <= endRow; row++) {
            if (!isBlank(row, column)) {
                return false;
            }
        }
        return true;
    };
    const [startColumn, endColumn] = trimEdges(firstColumn, lastColumn, columnMode, columnIsBlank);
    if (startColumn <= endColumn) {
        return { startRow, endRow, startColumn, endColumn };
    }
}

function trimEdges(first: number, last: number, mode: number, isBlank: (index: number) => boolean) {
    let start = first;
    let end = last;
    if (mode & 1) {
        while (start <= end && isBlank(start)) {
            start++;
        }
    }
    if (mode & 2) {
        while (end >= start && isBlank(end)) {
            end--;
        }
    }
    return [start, end] as const;
}
