import { FormulaDataType } from '@univer/base-formula-engine';
import { SheetActionBase, ActionObservers, ISheetActionData, Workbook } from '@univer/core';
import { SetFormulaRangeData } from '../Apply/SetFormulaRangeData';

export interface ISetFormulaRangeActionData extends ISheetActionData {
    formulaData: FormulaDataType;
}

export class SetFormulaRangeDataAction extends SheetActionBase<ISetFormulaRangeActionData, ISetFormulaRangeActionData, FormulaDataType> {
    constructor(actionData: ISetFormulaRangeActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            formulaData: this.do(),
        };
    }

    do(): FormulaDataType {
        return this.redo();
    }

    redo(): FormulaDataType {
        const { _workbook } = this;
        const { formulaData } = this._doActionData;
        return SetFormulaRangeData(_workbook, formulaData);
    }

    undo(): void {
        const { _workbook } = this;
        const { formulaData } = this._oldActionData;
        SetFormulaRangeData(_workbook, formulaData);
    }

    validate(): boolean {
        return false;
    }
}
