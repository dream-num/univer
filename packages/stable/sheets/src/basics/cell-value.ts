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

import type { ICellData, Nullable } from '@univerjs/core';
import { CellValueType, isSafeNumeric } from '@univerjs/core';

/**
 * Get cell value from new value by type
 * @param type
 * @param cell
 * @returns
 */
export function getCellValue(type: Nullable<CellValueType>, cell: ICellData) {
    if (type === CellValueType.NUMBER) {
        return Number(cell.v);
    }

    if (type === CellValueType.BOOLEAN) {
        return extractBooleanValue(cell.v) ? 1 : 0;
    }

    if (type === CellValueType.STRING || type === CellValueType.FORCE_STRING) {
        return `${cell.v}`;
    }

    return cell.v;
}

/**
 * Check if the value can be casted to a boolean.
 * @internal
 * @param value
 * @returns It would return null if the value cannot be casted to a boolean, and would return the boolean value if it can be casted.
 */
export function extractBooleanValue(value: Nullable<string | number | boolean>): Nullable<boolean> {
    if (typeof value === 'string') {
        if (value.toUpperCase() === 'TRUE') {
            return true;
        };

        if (value.toUpperCase() === 'FALSE') {
            return false;
        }

        if (isSafeNumeric(value)) {
            if (Number(value) === 0) {
                return false;
            }

            if (Number(value) === 1) {
                return true;
            }
        }
    }

    if (typeof value === 'number') {
        if (value === 0) {
            return false;
        }

        if (value === 1) {
            return true;
        }
    }

    if (typeof value === 'boolean') {
        return value;
    }

    return null;
}

/**
 * Supplement the data of the cell, set the other value to NULL, Used to reset properties when undoing
 * @param value
 * @returns
 */
export function setNull(value: Nullable<ICellData>) {
    if (value == null) return null;

    if (value.f === undefined) {
        value.f = null;
    }

    if (value.si === undefined) {
        value.si = null;
    }

    if (value.p === undefined) {
        value.p = null;
    }

    if (value.v === undefined) {
        value.v = null;
    }

    if (value.t === undefined) {
        value.t = null;
    }

    if (value.s === undefined) {
        value.s = null;
    }

    if (value.custom === undefined) {
        value.custom = null;
    }

    return value;
}
