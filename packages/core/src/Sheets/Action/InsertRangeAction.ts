import { DeleteRange, InsertRange } from '../Apply';
import { ACTION_NAMES } from '../../Const';
import { Workbook } from '../Domain';
import { Dimension } from '../../Enum/Dimension';
import { ICellData, IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IDeleteRangeActionData } from './DeleteRangeAction';

/**
 * @internal
 */
export interface IInsertRangeActionData extends ISheetActionData {
    shiftDimension: Dimension;
    rangeData: IRangeData;
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
}

/**
 * Insert data into a range and move the range to the right or below
 *
 * @internal
 */
export class InsertRangeAction extends SheetActionBase<
    IInsertRangeActionData,
    IDeleteRangeActionData
> {
    constructor(
        actionData: IInsertRangeActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this.do();
        this._oldActionData = {
            ...actionData,
            convertor: [],
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();
        if (worksheet) {
            InsertRange(
                {
                    rowCount: worksheet.getLastRow(),
                    columnCount: worksheet.getLastColumn(),
                },
                worksheet.getCellMatrix(),
                this._doActionData.shiftDimension,
                this._doActionData.rangeData,
                this._doActionData.cellValue
            );

            this._observers.notifyObservers({
                type: ActionType.REDO,
                data: this._doActionData,
                action: this,
            });
        }
    }

    redo(): void {
        this.do();
        // no need store
    }

    undo(): void {
        const { rangeData, sheetId, shiftDimension } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        if (worksheet) {
            // update current data
            this._doActionData = {
                actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                sheetId,
                cellValue: DeleteRange(
                    {
                        rowCount: worksheet.getLastRow(),
                        columnCount: worksheet.getLastColumn(),
                    },
                    worksheet.getCellMatrix(),
                    shiftDimension,
                    rangeData
                ),
                rangeData,
                shiftDimension,
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
