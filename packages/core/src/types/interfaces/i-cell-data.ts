import type { Nullable } from '../../shared/types';
import { CellValueType } from '../enum/text-style';
import type { IDocumentData } from './i-document-data';
import type { IStyleData } from './i-style-data';

/**
 * Cell value type
 */
export type ICellV = string | number | boolean;

/**
 * 判断单元格类型，
 * - 先判断 p 是否存在，存在即为 富文本
 * - 再判断 f 是否存在，存在即为 公式
 * - 再判断 s 对应 style 的 fm 格式判断单元格类型
 */
export interface ICellData {
    // The unique key, a random string, is used for the plug-in to associate the cell. When the cell information changes, the plug-in does not need to change the data, reducing the pressure on the back-end interface
    // id?: string;
    p?: Nullable<IDocumentData>; // univer docs, set null for cell clear all
    s?: Nullable<IStyleData | string>; // style id
    /**
     * Origin value
     */
    v?: Nullable<ICellV>;
    /**
     * @deprecated
     */
    m?: Nullable<string>; // formatted value
    // Usually the type is automatically determined based on the data, or the user directly specifies
    t?: Nullable<CellValueType>; // 0 string, 1 number, 2 boolean, 3 force string, green icon, set null for cell clear all
    f?: Nullable<string>; // formula '=SUM(1)'
    si?: Nullable<string>; // formula id
    /**
     * format
     */
    // fm?: IFormatData;
    // TODO: plugin, move to meta data
    // pluginMeta:{},
    // mt:{},// meta data // 例如 单元格图片功能，考虑存储在这
    // h?: string; // hyperlink{}
    /**
     * 类型type:
     * 1. link
     * 2. sheetId
     * 3. rangeId
     * 4. range
     * 5. email
     *
     *  u: "Formula!A1" // url
        m: "" // message
        t: "link" // type
        h: 0 or 1 // hidden
     */
    // n?: string; // note comment postil
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isICellData(value: any): value is ICellData {
    return (
        (value &&
            ((value as ICellData).s !== undefined ||
                (value as ICellData).p !== undefined ||
                (value as ICellData).v !== undefined)) ||
        (value as ICellData).f !== undefined
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
