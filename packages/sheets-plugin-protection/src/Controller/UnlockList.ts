import { Nullable, Range, Rectangle } from '@univerjs/core';

export class UnlockList {
    protected _rangeList: Range[];

    constructor() {
        this._rangeList = new Array<Range>();
    }

    removeUnlock(range: Range): void {
        for (let i = 0; i < this._rangeList.length; i++) {
            if (this._rangeList[i] === range) {
                this._rangeList.splice(i, 1);
            }
        }
    }

    addUnlock(range: Range): void {
        this._rangeList.push(range);
    }

    isLockCell(row: number, column: number): Nullable<Rectangle> {
        for (let i = 0; i < this._rangeList.length; i++) {
            const range = this._rangeList[i];
            const data = range.getRangeData();
            const rect = new Rectangle(data.startRow, data.startColumn, data.endRow, data.endColumn);
            const item = new Rectangle(row, column, row, column);
            if (rect.intersects(item)) {
                return rect;
            }
        }
        return null;
    }
}
