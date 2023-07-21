import { ISpreadsheetConfig } from '../../Types/Interfaces/ISpreadsheetData';
import { WorksheetModel } from './WorksheetModel';

export class SpreadsheetModel {
    worksheets: { [key: string]: WorksheetModel };

    constructor(private univerSheetData: Partial<ISpreadsheetConfig>) {}
}
