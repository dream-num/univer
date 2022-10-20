import { ActionBase, ActionObservers, IActionData, Workbook } from '@univer/core';
import { SetNumfmtCoords } from '../Apply/SetNumfmtCoords';

export interface ISetNumfmtCoordsActionData extends IActionData {
    row: number;
    column: number;
    numfmt: string;
}

export class SetNumfmtCoordsAction extends ActionBase<ISetNumfmtCoordsActionData, ISetNumfmtCoordsActionData> {
    constructor(actionData: ISetNumfmtCoordsActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            numfmt: this.do(),
            convertor: [],
        };
        this.do();
    }

    redo(): string {
        return SetNumfmtCoords(this.getWorkBook(), this._doActionData.sheetId, this._doActionData.row, this._doActionData.column, this._doActionData.numfmt);
    }

    do(): string {
        return this.redo();
    }

    undo(): void {
        SetNumfmtCoords(this.getWorkBook(), this._oldActionData.sheetId, this._oldActionData.row, this._oldActionData.column, this._oldActionData.numfmt);
    }

    validate(): boolean {
        return false;
    }
}
