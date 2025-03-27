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

import type { CellValue, ICellData, IStyleData, Nullable, Styles } from '@univerjs/core';
import { CellValueType, isBooleanString, isRealNum } from '@univerjs/core';
import { isTextFormat } from '@univerjs/engine-numfmt';

/**
 * Get cell value type by style, new value and old value.
 * If the new value contains t, then take t directly. In other cases, we need to dynamically determine based on actual data and styles
 * @param newVal
 * @param oldVal
 * @returns
 */
export function getCellType(styles: Styles, newVal: ICellData, oldVal: ICellData) {
    if (newVal.t) return newVal.t;
    if (newVal.v === null) return null;

    const newStyle = styles.getStyleByCell(newVal);
    const oldStyle = styles.getStyleByCell(oldVal);

    if (oldVal.t === CellValueType.FORCE_STRING) {
        // For cells with forced strings, set the percentage format and still use forced strings
        // For cells with forced strings, update to the number and convert to ordinary numbers
        // For cells with forced strings and text formats, update to the number and still use forced strings
        if (!isTextFormat(oldStyle?.n?.pattern) && newVal.v !== undefined) {
            if (isRealNum(newVal.v)) {
                return CellValueType.NUMBER;
            } else if (isBooleanString(`${newVal.v}`)) {
                return CellValueType.BOOLEAN;
            }
        }

        return CellValueType.FORCE_STRING;
    }

    // For cells with ordinary numbers, set the text format and convert the cell type to text
    if (hasNumberFormat(newStyle)) {
        if (isTextFormat(newStyle?.n?.pattern)) {
            return CellValueType.STRING;
        }

        return checkCellValueTypeByValue(newVal, oldVal);
    }

    // For cells with text format, the cell type is still text when numbers are written, because the ISNUMBER function detects FALSE
    if (isTextFormat(oldStyle?.n?.pattern)) {
        return CellValueType.STRING;
    }

    return checkCellValueTypeByValue(newVal, oldVal);
}

function checkCellValueTypeByValue(newVal: ICellData, oldVal: ICellData): Nullable<CellValueType> {
    return newVal.v !== undefined ? checkCellValueType(newVal.v, newVal.t) : checkCellValueType(oldVal.v, oldVal.t);
}

function hasNumberFormat(style: Nullable<IStyleData>) {
    return !!style?.n?.pattern;
}

/**
 * Get the correct type after setting values to a cell.
 *
 * @param v the new value
 * @param type the old type
 * @returns the new type
 */
export function checkCellValueType(v: Nullable<CellValue>, type: Nullable<CellValueType>): Nullable<CellValueType> {
    if (v === null) return null;

    if (typeof v === 'string') {
        // Support scientific notation, such as 10e+1
        if (isRealNum(v)) {
            if ((+v === 0 || +v === 1) && type === CellValueType.BOOLEAN) {
                return CellValueType.BOOLEAN;
            }

            return CellValueType.NUMBER;
        } else if (isBooleanString(v)) {
            return CellValueType.BOOLEAN;
        }
        return CellValueType.STRING;
    }

    if (typeof v === 'number') {
        if ((v === 0 || v === 1) && type === CellValueType.BOOLEAN) {
            return CellValueType.BOOLEAN;
        }
        return CellValueType.NUMBER;
    }

    if (typeof v === 'boolean') {
        return CellValueType.BOOLEAN;
    }

    return CellValueType.FORCE_STRING;
}

export function getCellTypeByPattern(cell: ICellData, pattern: string) {
    if (cell.t === CellValueType.FORCE_STRING) {
        return CellValueType.FORCE_STRING;
    }

    if (isTextFormat(pattern)) {
        return CellValueType.STRING;
    }

    return checkCellValueType(cell.v, cell.t);
}
