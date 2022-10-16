import { ActionBase, ActionObservers, IActionData, Workbook } from '@univer/core';

export interface ISetNumfmtActionData extends IActionData {
    row: number;
    column: number;
    numfmt: string;
}

export class SetNumfmtAction extends ActionBase<ISetNumfmtActionData, ISetNumfmtActionData> {
    constructor(actionData: ISetNumfmtActionData, workbook: Workbook, observers: ActionObservers) {
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
