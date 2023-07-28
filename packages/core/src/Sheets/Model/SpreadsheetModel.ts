import { Tools } from '../../Shared/Tools';
import { DEFAULT_WORKBOOK } from '../../Types/Const/CONST';
import { ISpreadsheetConfig } from '../../Types/Interfaces/ISpreadsheetData';
import { WorksheetModel } from './WorksheetModel';

export class SpreadsheetModel {
    worksheets: { [key: string]: WorksheetModel };

    private _snapshot: ISpreadsheetConfig;

    private _unitId: string;

    constructor(snapshot: Partial<ISpreadsheetConfig>) {
        this._snapshot = { ...DEFAULT_WORKBOOK, ...snapshot };
        this._unitId = this._snapshot.id ?? Tools.generateRandomId(6);
    }

    getSnapshot() {
        return this._snapshot;
    }

    getUnitId(): string {
        return this._unitId;
    }
}
