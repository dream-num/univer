import { ActionBase, ActionObservers, IActionData, ObjectMatrixPrimitiveType, Workbook } from '@univer/core/src';
import { SetNumfmtRangeData } from '../Apply/SetNumfmtRangeData';

export interface ISetNumfmtRangeActionData extends IActionData {
    numfmtMatrix: ObjectMatrixPrimitiveType<string>;
}

export class SetNumfmtRangeDataAction extends ActionBase<ISetNumfmtRangeActionData, ISetNumfmtRangeActionData> {
    constructor(actionData: ISetNumfmtRangeActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            numfmtMatrix: this.do(),
            convertor: [],
        };
    }

    do(): ObjectMatrixPrimitiveType<string> {
        return this.redo();
    }

    redo(): ObjectMatrixPrimitiveType<string> {
        return SetNumfmtRangeData(this.getWorkBook(), this._doActionData.sheetId, this._doActionData.numfmtMatrix);
    }

    undo(): void {
        SetNumfmtRangeData(this.getWorkBook(), this._oldActionData.sheetId, this._oldActionData.numfmtMatrix);
    }

    validate(): boolean {
        return false;
    }
}
