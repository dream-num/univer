import { SetRangeFormula } from '../Apply';
import { IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandManager, CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetRangeFormulaActionData extends ISheetActionData {
    cellFormula: ObjectMatrixPrimitiveType<string>;
    rangeData: IRangeData;
}

/**
 * @internal
 */
export class SetRangeFormulaAction extends SheetActionBase<
    ISetRangeFormulaActionData,
    ISetRangeFormulaActionData,
    ObjectMatrixPrimitiveType<string>
> {
    static NAME = 'SetRangeFormulaAction';

    constructor(
        actionData: ISetRangeFormulaActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            cellFormula: this.do(),
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
            // actionName: ACTION_NAMES.SET_RANGE_FORMULA_ACTION,
            actionName: SetRangeFormulaAction.NAME,
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
                // actionName: ACTION_NAMES.SET_RANGE_FORMULA_ACTION,
                actionName: SetRangeFormulaAction.NAME,
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

CommandManager.register(SetRangeFormulaAction.NAME, SetRangeFormulaAction);
