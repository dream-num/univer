import { SetRangeNote } from '../Apply';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { ISetRangeNoteActionData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const/ACTION_NAMES';

/**
 * @internal
 */
export class SetRangeNoteAction extends SheetActionBase<ISetRangeNoteActionData, ISetRangeNoteActionData, ObjectMatrixPrimitiveType<string>> {
    constructor(actionData: ISetRangeNoteActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            cellNote: this.do(),
        };

        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<string> {
        const worksheet = this.getWorkSheet();

        const result = SetRangeNote(worksheet.getCellMatrix(), this._doActionData.cellNote, this._doActionData.rangeData);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId, rangeData } = this._doActionData;
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_RANGE_NOTE_ACTION,
            // actionName: SetRangeNoteAction.NAME,
            sheetId,
            cellNote: this.do(),
            rangeData,
        };
    }

    undo(): void {
        const { rangeData, sheetId, cellNote } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        if (worksheet) {
            // update current data
            this._doActionData = {
                actionName: ACTION_NAMES.SET_RANGE_NOTE_ACTION,
                // actionName: SetRangeNoteAction.NAME,
                sheetId,
                cellNote: SetRangeNote(worksheet.getCellMatrix(), cellNote, rangeData),
                rangeData,
            };
            this._observers.notifyObservers({
                type: ActionType.UNDO,
                data: this._oldActionData,
                action: this,
            });
        }
    }

    validate(): boolean {
        return false;
    }
}
