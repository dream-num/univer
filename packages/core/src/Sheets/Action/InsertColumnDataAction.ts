import { InsertDataColumn, RemoveColumnData } from '../Apply';
import { Workbook } from '../Domain';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetAction, ISheetActionData } from '../../Command/SheetAction';
import { ICellData } from '../../Interfaces';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveColumnDataAction } from './RemoveColumnDataAction';
import { ObjectArray } from '../../Shared';

/**
 * @internal
 */
export interface IInsertColumnDataActionData extends ISheetActionData {
    columnIndex: number;
    columnData: ObjectMatrixPrimitiveType<ICellData>; // TODO Does it need to be merged with IKeyValue
}

/**
 * Insert the column data of the specified column index
 *
 * @internal
 */
export class InsertColumnDataAction extends SheetAction<
    IInsertColumnDataActionData,
    IRemoveColumnDataAction
> {
    constructor(
        actionData: IInsertColumnDataActionData,
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
            columnCount: ObjectArray.getMaxLength(actionData.columnData[0]),
            convertor: [],
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();

        InsertDataColumn(
            this._doActionData.columnIndex,
            this._doActionData.columnData,
            worksheet.getCellMatrix().toJSON()
        );

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();

        RemoveColumnData(
            this._oldActionData.columnIndex,
            this._oldActionData.columnCount,
            worksheet.getCellMatrix().toJSON()
        );

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
