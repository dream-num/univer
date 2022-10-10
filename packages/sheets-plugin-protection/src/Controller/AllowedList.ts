import { Nullable, Rectangle } from '@univer/core';
import { Allowed } from './Allowed';

export class AllowedList {
    protected _allowList: Allowed[];

    constructor() {
        this._allowList = new Array<Allowed>();
    }

    removeAllow(allow: Allowed): void {
        for (let i = 0; i < this._allowList.length; i++) {
            if (this._allowList[i] === allow) {
                this._allowList.splice(i, 1);
            }
        }
    }

    addAllow(allow: Allowed): void {
        this._allowList.push(allow);
    }

    isLockCell(row: number, column: number): Nullable<Allowed> {
        for (let i = 0; i < this._allowList.length; i++) {
            const allowed = this._allowList[i];
            const range = allowed.getRange();
            const data = range.getRangeData();
            const rect = new Rectangle(data.startRow, data.startColumn, data.endRow, data.endColumn);
            const item = new Rectangle(row, column, row, column);
            if (rect.intersects(item)) {
                return allowed;
            }
        }
        return null;
    }
}
