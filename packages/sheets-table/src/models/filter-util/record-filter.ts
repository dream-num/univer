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

import type { Worksheet } from '@univerjs/core';
import type { ITableRecordFilterItem, TableRecordValue } from '../../types/type';
import { CellValueType, FilterSelectionMode, numfmt, RecordValueType } from '@univerjs/core';
import { extractFormulaError } from '@univerjs/engine-formula';
import { TableColumnFilterTypeEnum } from '../../types/enum';
import { convertCellDataToString } from '../../util';

/**
 * Formula errors are recognized when the cell retains formula, shared-formula, or intercepted array-formula context.
 */
export function getTableRecordValue(sheet: Worksheet, row: number, column: number): TableRecordValue {
    const cell = sheet.getCell(row, column);
    const error = extractFormulaError(cell, cell?.isInArrayFormulaRange === true);
    if (error !== null) {
        return { type: RecordValueType.Error, value: error };
    }

    if (!cell) {
        return { type: RecordValueType.Blank };
    }
    if (cell.p) {
        return { type: RecordValueType.String, value: convertCellDataToString(cell) };
    }

    const value = cell.v;
    if (value === null || value === undefined) {
        return { type: RecordValueType.Blank };
    }

    if (cell.t === CellValueType.STRING || cell.t === CellValueType.FORCE_STRING) {
        return { type: RecordValueType.String, value: String(value) };
    }
    if (cell.t === CellValueType.BOOLEAN) {
        return { type: RecordValueType.Boolean, value: getBooleanValue(value) };
    }
    if (cell.t === CellValueType.NUMBER || typeof value === 'number') {
        const numberValue = getFiniteNumberValue(getNumberCellValue(
            sheet,
            row,
            column,
            value,
            cell.t === CellValueType.NUMBER,
            cell.isInArrayFormulaRange === true
        ));
        const pattern = sheet.getComposedCellStyleByCellData(row, column, cell).n?.pattern;
        return pattern && numfmt.getFormatInfo(pattern).isDate
            ? { type: RecordValueType.Date, value: numberValue }
            : { type: RecordValueType.Number, value: numberValue };
    }
    if (typeof value === 'boolean') {
        return { type: RecordValueType.Boolean, value };
    }
    if (typeof value === 'string') {
        return { type: RecordValueType.String, value };
    }

    throw new TypeError('Invalid table record cell value.');
}

export function getTableRecordValueKey(_value: TableRecordValue): string {
    const value = _value as unknown;
    if (!isRecord(value) || typeof value.type !== 'string') {
        throw new TypeError('Invalid table record value.');
    }

    switch (value.type) {
        case RecordValueType.Blank:
            if ('value' in value) {
                throw new TypeError('Blank table record values cannot have a value.');
            }
            return '["blank"]';
        case RecordValueType.String:
        case RecordValueType.Error:
            if (typeof value.value !== 'string') {
                throw new TypeError('Invalid table record value.');
            }
            return JSON.stringify([value.type, value.value]);
        case RecordValueType.Boolean:
            if (typeof value.value !== 'boolean') {
                throw new TypeError('Invalid table record value.');
            }
            return JSON.stringify([value.type, value.value]);
        case RecordValueType.Number:
        case RecordValueType.Date:
            if (typeof value.value !== 'number') {
                throw new TypeError('Invalid table record value.');
            }
            if (!Number.isFinite(value.value)) {
                throw new RangeError('Table record numeric values must be finite.');
            }
            return JSON.stringify([value.type, value.value === 0 ? 0 : value.value]);
        default:
            throw new TypeError('Unknown table record value type.');
    }
}

export function compileTableRecordFilter(_filter: ITableRecordFilterItem): (value: TableRecordValue) => boolean {
    const filter = _filter as unknown;
    if (!isRecord(filter) || filter.filterType !== TableColumnFilterTypeEnum.record) {
        throw new TypeError('Invalid table record filter.');
    }
    if ((filter.mode !== FilterSelectionMode.Include && filter.mode !== FilterSelectionMode.Exclude) || !Array.isArray(filter.values)) {
        throw new TypeError('Invalid table record filter.');
    }

    const keys = new Set(filter.values.map((value) => getTableRecordValueKey(value as TableRecordValue)));
    if (filter.mode === FilterSelectionMode.Include) {
        return (value) => keys.has(getTableRecordValueKey(value));
    }
    return (value) => !keys.has(getTableRecordValueKey(value));
}

export function cloneTableRecordFilter(filter: ITableRecordFilterItem): ITableRecordFilterItem {
    compileTableRecordFilter(filter);
    return {
        filterType: TableColumnFilterTypeEnum.record,
        mode: filter.mode,
        values: filter.values.map((value) => value.type === RecordValueType.Blank ? { type: RecordValueType.Blank } : { ...value }),
    };
}

function getBooleanValue(value: unknown): boolean {
    if (value === true || value === 1 || (typeof value === 'string' && value.toUpperCase() === 'TRUE')) {
        return true;
    }
    if (value === false || value === 0 || (typeof value === 'string' && value.toUpperCase() === 'FALSE')) {
        return false;
    }
    throw new TypeError('Invalid table record boolean value.');
}

function getFiniteNumberValue(value: unknown): number {
    const numberValue = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numberValue)) {
        throw new RangeError('Table record numeric values must be finite.');
    }
    return numberValue;
}

function getNumberCellValue(
    sheet: Worksheet,
    row: number,
    column: number,
    value: unknown,
    isNumberCell: boolean,
    isArrayFormulaCell: boolean
): unknown {
    if (!isNumberCell || isArrayFormulaCell) {
        return value;
    }
    return sheet.getCellRaw(row, column)?.v ?? value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
