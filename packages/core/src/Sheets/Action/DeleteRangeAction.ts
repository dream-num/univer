import { DeleteRange, InsertRange } from '../Apply';
import { Dimension } from '../../Enum/Dimension';
import { ICellData, IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertRangeActionData, InsertRangeAction } from './InsertRangeAction';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface IDeleteRangeActionData extends ISheetActionData {
    shiftDimension: Dimension;
    rangeData: IRangeData;
}

/**
 * Delete the specified range and move the right or lower range
 *
 * @internal
 */
export class DeleteRangeAction extends SheetActionBase<
    IDeleteRangeActionData,
    IInsertRangeActionData,
    ObjectMatrixPrimitiveType<ICellData>
> {
    static NAME = 'DeleteRangeAction';

    constructor(
        actionData: IDeleteRangeActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            cellValue: this.do(),
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
            // actionName: ACTION_NAMES.INSERT_RANGE_ACTION,
            actionName: InsertRangeAction.NAME,
            shiftDimension,
            rangeData,
            cellValue: this.do(),
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
