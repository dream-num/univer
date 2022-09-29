import { SetRangeStyle } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { WorkBook } from '../Domain';
import { IRangeData, IStyleData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

export interface ISetRangeStyleActionData extends IActionData {
    value: ObjectMatrixPrimitiveType<IStyleData>; //
    rangeData: IRangeData;
}

/**
 * @internal
 */
export class SetRangeStyleAction extends ActionBase<ISetRangeStyleActionData> {
    constructor(
        actionData: ISetRangeStyleActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

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
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
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
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
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
