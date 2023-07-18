import { ICellData, IStyleData } from '../../Types/Interfaces';
import { IKeyType, Nullable, Tools } from '../../Shared';

/**
 * Styles in a workbook, cells locate styles based on style IDs
 */
export class Styles {
    private _styles: IKeyType<Nullable<IStyleData>>;

    constructor(styles: IKeyType<Nullable<IStyleData>> = {}) {
        this._styles = styles;
    }

    each(
        callback: (
            value: [string, Nullable<IStyleData>],
            index: number,
            array: Array<[string, Nullable<IStyleData>]>
        ) => void
    ) {
        Object.entries(this._styles).forEach(callback);
        return this;
    }

    search(data: IStyleData): string {
        const { _styles } = this;

        for (const id in _styles) {
            if (Tools.diffValue(_styles[id], data)) {
                return id;
            }
        }
        return '-1';
    }

    get(id: string | Nullable<IStyleData>): Nullable<IStyleData> {
        id = String(id);
        if (typeof id !== 'string') return id;
        return this._styles[id];
    }

    add(data: IStyleData): string {
        const id = Tools.generateRandomId(6);
        this._styles[id] = data;
        return id;
    }

    setValue(data: Nullable<IStyleData>): Nullable<string> {
        if (data == null) return;
        const result = this.search(data);
        if (result !== '-1') {
            return result;
        }
        return this.add(data);
    }

    toJSON(): IKeyType<Nullable<IStyleData>> {
        return this._styles;
    }

    getStyleByCell(cell: Nullable<ICellData>): Nullable<IStyleData> {
        let style;
        if (cell && Tools.isObject(cell.s)) {
            style = cell.s as IStyleData;
        } else {
            style = cell?.s && this.get(cell.s);
        }

        return style as IStyleData;
    }
}
