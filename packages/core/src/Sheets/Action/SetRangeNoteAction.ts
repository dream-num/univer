import { SetRangeNote } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { Workbook } from '../Domain';
import { IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetRangeNoteActionData extends ISheetActionData {
    cellNote: ObjectMatrixPrimitiveType<string>;
    rangeData: IRangeData;
}

/**
 * @internal
 */
export class SetRangeNoteAction extends SheetActionBase<
    ISetRangeNoteActionData,
    ISetRangeNoteActionData,
    ObjectMatrixPrimitiveType<string>
> {
    constructor(
        actionData: ISetRangeNoteActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            cellNote: this.do(),
            convertor: [],
        };

        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<string> {
        const worksheet = this.getWorkSheet();

        const result = SetRangeNote(
            worksheet.getCellMatrix(),
            this._doActionData.cellNote,
            this._doActionData.rangeData
        );

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
                sheetId,
                cellNote: SetRangeNote(
                    worksheet.getCellMatrix(),
                    cellNote,
                    rangeData
                ),
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
