import { IFormulaData } from '@univer/base-formula-engine';
import { SheetAction, ActionObservers, ISheetActionData, ObjectMatrixPrimitiveType, Workbook } from '@univer/core';
import { SetFormulaRangeData } from '../Apply/SetFormulaRangeData';

export interface ISetFormulaRangeActionData extends ISheetActionData {
    formulaData: IFormulaData;
}

export class SetFormulaRangeDataAction extends SheetAction<ISetFormulaRangeActionData, IFormulaData> {
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

    do(): ObjectMatrixPrimitiveType<string> {
        return this.redo();
    }

    redo(): IFormulaData {
        return SetFormulaRangeData();
    }

    undo(): void {
        SetFormulaRangeData();
    }

    validate(): boolean {
        return false;
    }
}
