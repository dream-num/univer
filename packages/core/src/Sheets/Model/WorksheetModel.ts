import { ObjectArray } from '../../Shared/ObjectArray';
import { ObjectMatrix } from '../../Shared/ObjectMatrix';
import { Tools } from '../../Shared/Tools';
import { IKeyType, Nullable } from '../../Shared/Types';
import { ICellData } from '../../Types/Interfaces/ICellData';
import { IColumnData } from '../../Types/Interfaces/IColumnData';
import { IRangeData } from '../../Types/Interfaces/IRangeData';
import { IRowData } from '../../Types/Interfaces/IRowData';
import { IStyleData } from '../../Types/Interfaces/IStyleData';

export class WorksheetModel {
    activation: boolean;

    column: ObjectArray<IColumnData>;

    row: ObjectArray<IRowData>;

    cell: ObjectMatrix<ICellData>;

    sheetId: string;

    merge: IRangeData[];

    style: IKeyType<Nullable<IStyleData>>;

    eachStyle(callback: (value: [string, Nullable<IStyleData>], index: number, array: Array<[string, Nullable<IStyleData>]>) => void) {
        Object.entries(this.style).forEach(callback);
        return this;
    }

    searchStyle(data: IStyleData): string {
        const { style } = this;

        for (const id in style) {
            if (Tools.diffValue(style[id], data)) {
                return id;
            }
        }
        return '-1';
    }

    addStyle(data: IStyleData): string {
        const id = Tools.generateRandomId(6);
        this.style[id] = data;
        return id;
    }

    setStyleValue(data: Nullable<IStyleData>): Nullable<string> {
        if (data == null) return;
        const result = this.searchStyle(data);
        if (result !== '-1') {
            return result;
        }
        return this.addStyle(data);
    }

    getStyleById(id: string | Nullable<IStyleData>): Nullable<IStyleData> {
        id = String(id);
        if (typeof id !== 'string') return id;
        return this.style[id];
    }

    getStyleByCell(cell: Nullable<ICellData>): Nullable<IStyleData> {
        let style;
        if (cell && Tools.isObject(cell.s)) {
            style = cell.s as IStyleData;
        } else {
            style = cell?.s && this.getStyleById(cell.s);
        }

        return style as IStyleData;
    }

    getStyleJSON(): IKeyType<Nullable<IStyleData>> {
        return this.style;
    }
}
