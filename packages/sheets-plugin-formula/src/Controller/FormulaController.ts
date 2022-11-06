import { FormulaEnginePlugin, IInterpreterDatasetConfig, SheetDataType, UnitDataType, SheetNameMapType } from '@univer/base-formula-engine';
import { SheetContext, Plugin } from '@univer/core';
import { IFormulaConfig } from '../Basic/IFormula';
import { FormulaDataModel } from '../Model/FormulaDataModel';

export class FormulaController {
    private _formulaDataModel: FormulaDataModel;

    private _formulaEngine: FormulaEnginePlugin;

    private _context: SheetContext;

    private _interpreterCalculatePropsCache: IInterpreterDatasetConfig;

    constructor(private _plugin: Plugin, config?: IFormulaConfig) {
        this._formulaDataModel = new FormulaDataModel(config);

        this._context = this._plugin.getContext();
    }

    getDataModel() {
        return this._formulaDataModel;
    }

    initialEditor() {}

    initialSelection() {}

    setFormulaEngine(formulaEngine: FormulaEnginePlugin) {
        this._formulaEngine = formulaEngine;
    }

    getFormulaEngine() {
        return this._formulaEngine;
    }

    toInterpreterCalculateProps(isRefresh = true) {
        if (isRefresh || !this._interpreterCalculatePropsCache) {
            this._interpreterCalculatePropsCache = this._toInterpreterCalculateProps();
        }

        return this._interpreterCalculatePropsCache;
    }

    getCommandManager() {
        return this._context.getCommandManager();
    }

    getWorkbook() {
        return this._context.getWorkBook();
    }

    getUnitId() {
        return this.getWorkbook().getUnitId();
    }

    private _toInterpreterCalculateProps(): IInterpreterDatasetConfig {
        const workbook = this._context.getWorkBook();
        const sheets = workbook.getSheets();
        const sheetData: SheetDataType = {};
        const unitData: UnitDataType = {};
        const sheetNameMap: SheetNameMapType = {};

        const currentUnitId = workbook.getUnitId();

        for (let sheet of sheets) {
            sheetData[sheet.getSheetId()] = sheet.getCellMatrix();
            sheetNameMap[sheet.getName()] = sheet.getSheetId();
        }

        unitData[currentUnitId] = sheetData;

        const formulaData = this._formulaDataModel.getFormulaData();

        const activeSheet = workbook.getActiveSheet();

        const rowCount = activeSheet.getRowCount();
        const columnCount = activeSheet.getColumnCount();

        return {
            unitData,
            formulaData,
            sheetNameMap,
            currentRow: -1,
            currentColumn: -1,
            currentSheetId: '',
            currentUnitId,
            rowCount,
            columnCount,
        };
    }
}
