import { Tools } from '../../Shared/Tools';
import { ISpreadsheetConfig } from '../../Types/Interfaces/ISpreadsheetData';
import { WorksheetModel } from './WorksheetModel';

export class SpreadsheetModel {
    worksheets: { [key: string]: WorksheetModel };

    private _unitId: string;

    constructor(private snapshot: Partial<ISpreadsheetConfig>) {
        this._unitId = snapshot.id || Tools.generateRandomId();
    }

    getUnitId(): string {
        return this._unitId;
    }
}
