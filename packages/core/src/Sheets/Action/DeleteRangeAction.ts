import { DeleteRange, InsertRange } from '../Apply';
import { ACTION_NAMES } from '../../Const';
import { CONVERTOR_OPERATION } from '../../Const/CONST';
import { WorkSheetConvertor } from '../../Convertor/WorkSheetConvertor';
import { Workbook1 } from '../Domain';
import { Dimension } from '../../Enum/Dimension';
import { ICellData, IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertRangeActionData } from './InsertRangeAction';

/**
 * @internal
 */
export interface IDeleteRangeActionData extends IActionData {
    shiftDimension: Dimension;
    rangeData: IRangeData;
}

/**
 * Delete the specified range and move the right or lower range
 *
 * @internal
 */
export class DeleteRangeAction extends ActionBase<
    IDeleteRangeActionData,
    IInsertRangeActionData,
    ObjectMatrixPrimitiveType<ICellData>
> {
    constructor(
        actionData: IDeleteRangeActionData,
        workbook: Workbook1,
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
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.INSERT)],
        };
        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<ICellData> {
        const worksheet = this.getWorkSheet();

        const result = DeleteRange(
            {
                rowCount: worksheet.getConfig().rowCount,
                columnCount: worksheet.getConfig().columnCount,
            },
            worksheet.getCellMatrix(),
            this._doActionData.shiftDimension,
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
        const { sheetId, rangeData, shiftDimension } = this._doActionData;
        this._oldActionData = {
            sheetId,
            actionName: ACTION_NAMES.INSERT_RANGE_ACTION,
            shiftDimension,
            rangeData,
            cellValue: this.do(),
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.INSERT)],
        };
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const { shiftDimension, rangeData, cellValue } = this._oldActionData;
        if (worksheet) {
            InsertRange(
                {
                    rowCount: worksheet.getConfig().rowCount,
                    columnCount: worksheet.getConfig().columnCount,
                },
                worksheet.getCellMatrix(),
                shiftDimension,
                rangeData,
                cellValue
            );

            this._observers.notifyObservers({
                type: ActionType.UNDO,
                data: this._oldActionData,
                action: this,
            });
            // no need update current data
        }
    }

    validate(): boolean {
        return false;
    }
}
