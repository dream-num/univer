import { Rect } from '@univerjs/base-render';
import { IRangeData, Nullable } from '@univerjs/core';

export interface IAntLineRange extends IRangeData {
    id?: string;
}

export class AntLine {
    private _range: IAntLineRange;

    private _rect: Nullable<Rect>;

    constructor(range: IAntLineRange) {
        this._range = range;
    }

    getRange(): IAntLineRange {
        return this._range;
    }

    getRect(): Nullable<Rect> {
        return this._rect;
    }

    setRect(rect: Rect): void {
        this._rect = rect;
    }

    setRange(range: IAntLineRange): void {
        this._range = range;
    }
}

export class AntLineModel {
    private _sheetId: string;

    private _antLineList: AntLine[];

    constructor(sheetId: string) {
        this._sheetId = sheetId;
        this._antLineList = [];
    }

    deleteAntLineById(id: string): void {
        const index = this._antLineList.findIndex((antLine) => antLine.getRange().id === id);
        if (index > -1) {
            this._antLineList.splice(index, 1);
        }
    }

    addAntLine(antLine: AntLine): void {
        this._antLineList.push(antLine);
    }

    getSheetId(): string {
        return this._sheetId;
    }

    getAntLineList(): AntLine[] {
        return this._antLineList;
    }

    getAntLineById(id: string): Nullable<AntLine> {
        const index = this._antLineList.findIndex((antLine) => antLine.getRange().id === id);
        if (index > -1) {
            return this._antLineList[index];
        }
    }
}
