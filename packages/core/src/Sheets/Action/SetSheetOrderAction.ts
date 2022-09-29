import { SetSheetOrder } from '../Apply';
import { WorkBook } from '../Domain';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

export interface ISetSheetOrderActionData extends IActionData {
    sheetId: string;
    order: number;
}

export class SetSheetOrderAction extends ActionBase<
    ISetSheetOrderActionData,
    ISetSheetOrderActionData
> {
    constructor(
        actionData: ISetSheetOrderActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            order: this.do(),
            convertor: [],
        };
        this.validate();
    }

    do(): number {
        return this.redo();
    }

    redo(): number {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const workbook = context.getWorkBook();
        const result = SetSheetOrder(
            workbook,
            this._doActionData.sheetId,
            this._doActionData.order
        );
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const workbook = context.getWorkBook();
        SetSheetOrder(
            workbook,
            this._oldActionData.sheetId,
            this._oldActionData.order
        );
        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}
