import { SetRangeStyle } from '../Apply';
import { IRangeData, IStyleData } from '../../Types/Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandModel } from '../../Command';

export interface ISetRangeStyleActionData extends ISheetActionData {
    value: ObjectMatrixPrimitiveType<IStyleData>; //
    rangeData: IRangeData;
}

/**
 * @internal
 */
export class SetRangeStyleAction extends SheetActionBase<ISetRangeStyleActionData> {
    static NAME = 'SetRangeStyleAction';

    constructor(actionData: ISetRangeStyleActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        // store previous data
        this._oldActionData = {
            ...actionData,
            value: this.do(),
        };

        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<IStyleData> {
        const { value, rangeData } = this._doActionData;
        const styles = this._workbook.getStyles();
        const cellMatrix = this.getWorkSheet()!.getCellMatrix();

        const result = SetRangeStyle(cellMatrix, value, rangeData, styles);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo() {
        // update pre data
        const { sheetId, rangeData } = this._doActionData;
        this._oldActionData = {
            // actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            actionName: SetRangeStyleAction.NAME,
            sheetId,
            value: this.do(),
            rangeData,
        };
    }

    undo() {
        const { value, rangeData, sheetId } = this._oldActionData;
        const styles = this._workbook.getStyles();
        const cellMatrix = this.getWorkSheet()!.getCellMatrix();

        // update current data
        this._doActionData = {
            // actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            actionName: SetRangeStyleAction.NAME,
            sheetId,
            value: SetRangeStyle(cellMatrix, value, rangeData, styles),
            rangeData,
        };

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
