import { FormulaEnginePlugin, IInterpreterCalculateProps, SheetDataType, SheetNameMapType } from '@univer/base-formula-engine';
import { Context, Plugin } from '@univer/core';
import { IFormulaConfig } from '../Basic/IFormula';
import { FormulaDataModel } from '../Model/FormulaDataModel';

export class FormulaController {
    private _formulaDataModel: FormulaDataModel;

    private _formulaEngine: FormulaEnginePlugin;

    private _context: Context;

    private _interpreterCalculatePropsCache: IInterpreterCalculateProps;

    constructor(private _plugin: Plugin, config?: IFormulaConfig) {
        this._formulaDataModel = new FormulaDataModel(config);

        this._context = this._plugin.getContext();
    }

    initialEditor() {}

    initialSelection() {}

    setFormulaEngine(formulaEngine: FormulaEnginePlugin) {
        this._formulaEngine = formulaEngine;
    }

    getFormulaEngine() {
        return this._formulaEngine;
    }

    toInterpreterCalculateProps(currentRow: number, currentColumn: number, isRefresh = true) {
        if (isRefresh || !this._interpreterCalculatePropsCache) {
            this._interpreterCalculatePropsCache = this._toInterpreterCalculateProps(currentRow, currentColumn);
        }

        this._interpreterCalculatePropsCache.currentRow = currentRow;
        this._interpreterCalculatePropsCache.currentRow = currentColumn;

        return this._interpreterCalculatePropsCache;
    }

    private _toInterpreterCalculateProps(currentRow: number, currentColumn: number): IInterpreterCalculateProps {
        const workbook = this._context.getWorkBook();
        const sheets = workbook.getSheets();
        const sheetData: SheetDataType = {};
        const sheetNameMap: SheetNameMapType = {};

        for (let sheet of sheets) {
            sheetData[sheet.getSheetId()] = sheet.getCellMatrix();
            sheetNameMap[sheet.getName()] = sheet.getSheetId();
        }

        const formulaData = this._formulaDataModel.getFormulaData();

        const activeSheet = workbook.getActiveSheet();

        const currentSheetId = activeSheet.getSheetId();

        const rowCount = activeSheet.getRowCount();
        const columnCount = activeSheet.getColumnCount();

        return {
            sheetData,
            formulaData,
            sheetNameMap,
            currentRow,
            currentColumn,
            currentSheetId,
            rowCount,
            columnCount,
        };
    }
}
