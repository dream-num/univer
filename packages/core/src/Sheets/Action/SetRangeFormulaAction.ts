import { SetRangeFormula } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { Workbook1 } from '../Domain';
import { IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetRangeFormulaActionData extends IActionData {
    cellFormula: ObjectMatrixPrimitiveType<string>;
    rangeData: IRangeData;
}

/**
 * @internal
 */
export class SetRangeFormulaAction extends ActionBase<
    ISetRangeFormulaActionData,
    ISetRangeFormulaActionData,
    ObjectMatrixPrimitiveType<string>
> {
    constructor(
        actionData: ISetRangeFormulaActionData,
        workbook: Workbook1,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            cellFormula: this.do(),
            convertor: [],
        };

        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<string> {
        const worksheet = this.getWorkSheet();

        const result = SetRangeFormula(
            worksheet.getCellMatrix(),
            this._doActionData.cellFormula,
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
            actionName: ACTION_NAMES.SET_RANGE_FORMULA_ACTION,
            sheetId,
            cellFormula: this.do(),
            rangeData,
        };
    }

    undo(): void {
        const { rangeData, sheetId, cellFormula } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        if (worksheet) {
            // update current data
            this._doActionData = {
                actionName: ACTION_NAMES.SET_RANGE_FORMULA_ACTION,
                sheetId,
                cellFormula: SetRangeFormula(
                    worksheet.getCellMatrix(),
                    cellFormula,
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
