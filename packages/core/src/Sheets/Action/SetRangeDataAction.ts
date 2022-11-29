import { SetRangeData } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { CONVERTOR_OPERATION } from '../../Const/CONST';
import { WorkSheetConvertor } from '../../Convertor/WorkSheetConvertor';
import { ICellData, ICopyToOptionsData, IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetRangeDataActionData extends ISheetActionData {
    cellValue: ObjectMatrixPrimitiveType<ICellData> | ICellData;
    rangeData: IRangeData;
    options?: ICopyToOptionsData;
}

/**
 * Modify values in the range
 *
 * @internal
 */
export class SetRangeDataAction extends SheetActionBase<
    ISetRangeDataActionData,
    ISetRangeDataActionData,
    ObjectMatrixPrimitiveType<ICellData> | ICellData
> {
    constructor(
        actionData: ISetRangeDataActionData,
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
            cellValue: this.do(),
        };

        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<ICellData> {
        const worksheet = this.getWorkSheet();
        const styles = this._workbook.getStyles();

        const result = SetRangeData(
            worksheet.getCellMatrix(),
            this._doActionData.cellValue,
            this._doActionData.rangeData,
            styles,
            this._doActionData.options
        );

        debugger;
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId, rangeData, options } = this._doActionData;
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            sheetId,
            cellValue: this.do(),
            rangeData,
            options,
        };
    }

    undo(): void {
        const { rangeData, sheetId, cellValue, options } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        const styles = this._workbook.getStyles();
        if (worksheet) {
            // update current data
            this._doActionData = {
                actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                sheetId,
                cellValue: SetRangeData(
                    worksheet.getCellMatrix(),
                    cellValue,
                    rangeData,
                    styles
                ),
                rangeData,
                options,
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
