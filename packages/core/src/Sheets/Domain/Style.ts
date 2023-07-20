import { SpreadsheetModel } from '../Model/SpreadsheetModel';

/**
 * Styles in a workbook, cells locate styles based on style IDs
 */
export class Style {
    private model: SpreadsheetModel;

    constructor(model: SpreadsheetModel) {
        this.model = model;
    }
}
