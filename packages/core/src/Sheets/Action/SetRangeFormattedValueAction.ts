import { SetRangeFormattedValue } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { CONVERTOR_OPERATION } from '../../Const/CONST';
import { WorkSheetConvertor } from '../../Convertor/WorkSheetConvertor';
import { Workbook } from '../Domain';
import { ICellV, IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetRangeFormattedValueActionData extends IActionData {
    cellValue: ObjectMatrixPrimitiveType<ICellV>;
    rangeData: IRangeData;
}

/**
 * @internal
 */
export class SetRangeFormattedValueAction extends ActionBase<
    ISetRangeFormattedValueActionData,
    ISetRangeFormattedValueActionData,
    ObjectMatrixPrimitiveType<ICellV>
> {
    constructor(
        actionData: ISetRangeFormattedValueActionData,
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

    do(): ObjectMatrixPrimitiveType<ICellV> {
        const worksheet = this.getWorkSheet();

        const result = SetRangeFormattedValue(
            worksheet.getCellMatrix(),
            this._doActionData.cellValue,
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
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            sheetId,
            cellValue: this.do(),
            rangeData,
        };
    }

    undo(): void {
        const { rangeData, sheetId, cellValue } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        if (worksheet) {
            // update current data
            this._doActionData = {
                actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                sheetId,
                cellValue: SetRangeFormattedValue(
                    worksheet.getCellMatrix(),
                    cellValue,
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
