import { SetRangeData } from '../Apply';
import { ACTION_NAMES } from '../../Const';
import { ObjectMatrixPrimitiveType } from '../../Shared';
import {
    SheetActionBase,
    ISheetActionData,
    ActionObservers,
    ActionType,
    CommandUnit,
} from '../../Command';
import { ICopyToOptionsData, ICellData } from '../../Interfaces';

/**
 * @internal
 */
export interface ISetRangeDataActionData extends ISheetActionData {
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
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
    ObjectMatrixPrimitiveType<ICellData>
> {
    static NAME = 'SetRangeDataAction';

    constructor(
        actionData: ISetRangeDataActionData,
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
        const styles = this._workbook.getStyles();

        const result = SetRangeData(
            worksheet.getCellMatrix(),
            this._doActionData.cellValue,
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
        const { sheetId, options } = this._doActionData;
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            sheetId,
            cellValue: this.do(),
            options,
        };
    }

    undo(): void {
        const { sheetId, cellValue, options } = this._oldActionData;
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
                    styles
                ),
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
