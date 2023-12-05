import type { Nullable } from '../../shared/types';
import { CellValueType } from '../enum/text-style';
import type { IDocumentData } from './i-document-data';
import type { IStyleData } from './i-style-data';

/**
 * Cell value type
 */
export type ICellV = string | number | boolean;

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
    v?: Nullable<ICellV>;
    // Usually the type is automatically determined based on the data, or the user directly specifies
    t?: Nullable<CellValueType>; // 1 string, 2 number, 3 boolean, 4 force string, green icon, set null for cell clear all
    f?: Nullable<string>; // formula '=SUM(1)'
    si?: Nullable<string>; // formula id
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isICellData(value: any): value is ICellData {
    return (
        (value &&
            ((value as ICellData).s !== undefined ||
                (value as ICellData).p !== undefined ||
                (value as ICellData).v !== undefined)) ||
        (value as ICellData).f !== undefined ||
        (value as ICellData).si !== undefined
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

    const { v, f, si, p, s } = cell;

    if (!(v == null || (typeof v === 'string' && v.length === 0))) {
        return false;
    }

    if ((f != null && f.length > 0) || (si != null && si.length > 0)) {
        return false;
    }

    if (p != null) {
        return false;
    }

    return true;
}
