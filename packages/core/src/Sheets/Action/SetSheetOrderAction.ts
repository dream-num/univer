import { SetSheetOrder } from '../Apply/SetSheetOrder';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { ISetSheetOrderActionData } from '../../Types/Interfaces/IActionModel';

export class SetSheetOrderAction extends SheetActionBase<ISetSheetOrderActionData, ISetSheetOrderActionData> {
    constructor(actionData: ISetSheetOrderActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            order: this.do(),
        };
        this.validate();
    }

    do(): number {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const workbook = context.getWorkBook();
        const result = SetSheetOrder(workbook, this._doActionData.sheetId, this._doActionData.order);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const workbook = context.getWorkBook();
        SetSheetOrder(workbook, this._oldActionData.sheetId, this._oldActionData.order);
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
