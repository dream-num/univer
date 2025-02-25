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

import type { IColumnData, IRowData, Nullable } from '@univerjs/core';
import { Tools } from '@univerjs/core';

/**
 * Reset the row data to undefined when undoing the operation
 * @param currentRow
 * @returns
 */
export function getOldRowData(currentRow: Nullable<Partial<IRowData>>, newRow: Nullable<Partial<IRowData>>): Nullable<Partial<IRowData>> {
    if (currentRow === null || currentRow === undefined) {
        return currentRow;
    }

    const row = Tools.deepClone(currentRow);

    if (newRow === null || newRow === undefined) {
        return row;
    }

    const oldRow: Partial<IRowData> = {};

    // Restore only changed properties
    if ('h' in newRow) {
        oldRow.h = row.h;
    }

    if ('ia' in newRow) {
        oldRow.ia = row.ia;
    }

    if ('ah' in newRow) {
        oldRow.ah = row.ah;
    }

    if ('hd' in newRow) {
        oldRow.hd = row.hd;
    }

    if ('s' in newRow) {
        oldRow.s = row.s;
    }

    if ('custom' in newRow) {
        oldRow.custom = row.custom;
    }

    return oldRow;
}

/**
 * Reset the column data to undefined when undoing the operation
 * @param currenColumn
 * @param newColumn
 * @returns
 */
export function getOldColumnData(currenColumn: Nullable<Partial<IColumnData>>, newColumn: Nullable<Partial<IColumnData>>): Nullable<Partial<IColumnData>> {
    if (currenColumn === null || currenColumn === undefined) {
        return currenColumn;
    }

    const column = Tools.deepClone(currenColumn);

    if (newColumn === null || newColumn === undefined) {
        return column;
    }

    const oldColumn: Partial<IColumnData> = {};

    // Restore only changed properties
    if ('w' in newColumn) {
        oldColumn.w = column.w;
    }

    if ('hd' in newColumn) {
        oldColumn.hd = column.hd;
    }

    if ('s' in newColumn) {
        oldColumn.s = column.s;
    }

    if ('custom' in newColumn) {
        oldColumn.custom = column.custom;
    }

    return oldColumn;
}
