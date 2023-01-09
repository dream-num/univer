import { Rect } from '@univer/base-render';
import { IRangeData, Nullable } from '@univer/core';

export interface IArrayFormLineRange extends IRangeData {
    id?: string;
}

export class ArrayFormLine {
    private _range: IArrayFormLineRange;

    private _rect: Nullable<Rect[]>;

    constructor(range: IArrayFormLineRange) {
        this._range = range;
    }

    getRange(): IArrayFormLineRange {
        return this._range;
    }

    getPath(): Nullable<Rect[]> {
        return this._rect;
    }

    setPath(rect: Rect[]): void {
        this._rect = rect;
    }

    setRange(range: IArrayFormLineRange): void {
        this._range = range;
    }
}

export class ArrayFormLineModel {
    private _sheetId: string;

    private _arrayFormLineList: ArrayFormLine[];

    constructor(sheetId: string) {
        this._sheetId = sheetId;
        this._arrayFormLineList = [];
    }

    deleteArrayFormLineById(id: string): void {
        const index = this._arrayFormLineList.findIndex((arrayFormLine) => arrayFormLine.getRange().id === id);
        if (index > -1) {
            this._arrayFormLineList.splice(index, 1);
        }
    }

    addArrayFormLine(arrayFormLine: ArrayFormLine): void {
        this._arrayFormLineList.push(arrayFormLine);
    }

    getSheetId(): string {
        return this._sheetId;
    }

    getArrayFormLineList(): ArrayFormLine[] {
        return this._arrayFormLineList;
    }

    getArrayFormLineById(id: string): Nullable<ArrayFormLine> {
        const index = this._arrayFormLineList.findIndex((arrayFormLine) => arrayFormLine.getRange().id === id);
        if (index > -1) {
            return this._arrayFormLineList[index];
        }
    }
}
