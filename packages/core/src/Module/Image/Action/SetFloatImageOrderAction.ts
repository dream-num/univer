import { ActionObservers, ActionBase, IActionData } from '../../../Command';

import { WorkBook } from '../../../Sheets/Domain';

export interface ISetFloatImageOrderActionData extends IActionData {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class SetFloatImageOrderAction extends ActionBase<
    ISetFloatImageOrderActionData,
    ISetFloatImageOrderActionData
> {
    constructor(
        actionData: ISetFloatImageOrderActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
    }

    redo(): void {}

    do(): void {
        this.redo();
    }

    undo(): void {}

    validate(): boolean {
        return false;
    }
}
