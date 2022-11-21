import { SetRangeFormat } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { CONVERTOR_OPERATION } from '../../Const/CONST';
import { WorkSheetConvertor } from '../../Convertor/WorkSheetConvertor';
import { IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetRangeFormatActionData extends ISheetActionData {
    cellFormat: ObjectMatrixPrimitiveType<string>;
    rangeData: IRangeData;
}

/**
 * @internal
 */
export class SetRangeFormatAction extends SheetActionBase<
    ISetRangeFormatActionData,
    ISetRangeFormatActionData,
    ObjectMatrixPrimitiveType<string>
> {
    constructor(
        actionData: ISetRangeFormatActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);

        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this._oldActionData = {
            ...actionData,
            cellFormat: this.do(),
        };

        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<string> {
        const worksheet = this.getWorkSheet();

        const result = SetRangeFormat(
            worksheet.getCellMatrix(),
            this._doActionData.cellFormat,
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
            actionName: ACTION_NAMES.SET_RANGE_FORMAT_ACTION,
            sheetId,
            cellFormat: this.do(),
            rangeData,
        };
        // this.do();
    }

    undo(): void {
        const { rangeData, sheetId, cellFormat } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        if (worksheet) {
            // update current data
            this._doActionData = {
                actionName: ACTION_NAMES.SET_RANGE_FORMAT_ACTION,
                sheetId,
                cellFormat: SetRangeFormat(
                    worksheet.getCellMatrix(),
                    cellFormat,
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
        // SetRangeFormat(worksheet.getCellMatrix(), cellFormat, rangeData);
    }

    validate(): boolean {
        return false;
    }
}
