/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Nullable } from '../../shared/types';
import { CellValueType } from '../enum/text-style';
import type { ICellCustomRender } from './i-cell-custom-render';
import type { IDocumentData } from './i-document-data';
import type { IStyleData } from './i-style-data';
import type { ICellValidationData } from './i-cell-validation-data';

/**
 * Cell value type
 */
export type CellValue = string | number | boolean;

/**
 * Cell data
 */
export interface ICellData {
    /**
     * The unique key, a random string, is used for the plug-in to associate the cell. When the cell information changes,
     * the plug-in does not need to change the data, reducing the pressure on the back-end interface id?: string.
     */
    p?: Nullable<IDocumentData>; // univer docs, set null for cell clear all

    /** style id */
    s?: Nullable<IStyleData | string>;

    /**
     * Origin value
     */
    v?: Nullable<CellValue>;

    // Usually the type is automatically determined based on the data, or the user directly specifies
    t?: Nullable<CellValueType>; // 1 string, 2 number, 3 boolean, 4 force string, green icon, set null for cell clear all

    /**
     * Raw formula string. For example `=SUM(A1:B4)`.
     */
    f?: Nullable<string>;

    /**
     * Id of the formula.
     */
    si?: Nullable<string>;

    /**
     * User stored custom fields
     */
    custom?: Nullable<Record<string, any>>;
}

export interface ICellMarksStyle {
    color: string;
    size: number;
}

export interface ICellMarks {
    tl?: ICellMarksStyle;
    tr?: ICellMarksStyle;
    bl?: ICellMarksStyle;
    br?: ICellMarksStyle;
    isSkip?: boolean;
}

export interface ICellDataForSheetInterceptor extends ICellData {
    interceptorStyle?: Nullable<IStyleData>;
    isInArrayFormulaRange?: Nullable<boolean>;
    dataValidation?: Nullable<ICellValidationData>;
    markers?: ICellMarks;
    customRender?: Nullable<ICellCustomRender[]>;
    interceptorAutoHeight?: number;
}

export function isICellData(value: any): value is ICellData {
    return (
        value &&
        ((value as ICellData).s !== undefined ||
            (value as ICellData).p !== undefined ||
            (value as ICellData).v !== undefined ||
            (value as ICellData).t !== undefined ||
            (value as ICellData).f !== undefined ||
            (value as ICellData).si !== undefined)
    );
}

export function getCellValueType(cell: ICellData) {
    if (cell.t !== undefined) {
        return cell.t;
    }
    if (typeof cell.v === 'string') {
        return CellValueType.STRING;
    }
    if (typeof cell.v === 'number') {
        return CellValueType.NUMBER;
    }
    if (typeof cell.v === 'boolean') {
        return CellValueType.BOOLEAN;
    }
}

export function isNullCell(cell: Nullable<ICellData>) {
    if (cell == null) {
        return true;
    }

    const { v, f, si, p, s, custom } = cell;

    if (!(v == null || (typeof v === 'string' && v.length === 0))) {
        return false;
    }

    if ((f != null && f.length > 0) || (si != null && si.length > 0)) {
        return false;
    }

    if (p != null) {
        return false;
    }

    if (custom != null) {
        return false;
    }

    return true;
}

export function isCellV(cell: Nullable<ICellData | CellValue>) {
    return cell != null && (typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean');
}
