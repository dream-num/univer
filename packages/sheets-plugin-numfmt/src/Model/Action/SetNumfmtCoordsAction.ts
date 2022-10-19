import { ActionBase, ActionObservers, IActionData, Workbook } from '@univer/core';

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
            convertor: [],
        };
        this.do();
    }

    redo(): void {
        // todo ...
    }

    do(): void {
        this.redo();
    }

    undo(): void {
        // todo ...
    }

    validate(): boolean {
        return false;
    }
}
