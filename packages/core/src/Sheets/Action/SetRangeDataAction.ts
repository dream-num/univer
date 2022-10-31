import { SetRangeData } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { CONVERTOR_OPERATION } from '../../Const/CONST';
import { WorkSheetConvertor } from '../../Convertor/WorkSheetConvertor';
import { Workbook } from '../Domain';
import { ICellData, ICopyToOptionsData, IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetRangeDataActionData extends IActionData {
    cellValue: ObjectMatrixPrimitiveType<ICellData> | ICellData;
    rangeData: IRangeData;
    options?: ICopyToOptionsData;
}

/**
 * Modify values in the range
 *
 * @internal
 */
export class SetRangeDataAction extends ActionBase<
    ISetRangeDataActionData,
    ISetRangeDataActionData,
    ObjectMatrixPrimitiveType<ICellData> | ICellData
> {
    constructor(
        actionData: ISetRangeDataActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

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
