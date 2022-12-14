import { SetSheetOrder } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandUnit } from '../../Command';

export interface ISetSheetOrderActionData extends ISheetActionData {
    sheetId: string;
    order: number;
}

export class SetSheetOrderAction extends SheetActionBase<
    ISetSheetOrderActionData,
    ISetSheetOrderActionData
> {
    constructor(
        actionData: ISetSheetOrderActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
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

    redo(): void {
        this.do();
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
