import { CellValueType, ICellData, ISpreadsheetConfig, ObjectMatrix } from '@univerjs/core';

type SheetDataType = { [sheetName: string]: ObjectMatrix<ICellData> };

type CellDataType = string | number | boolean;

export class FormulaCacheLoader {
    // Workbook data
    private _sheetData: SheetDataType;

    // Active worksheet name
    private _activeSheetName: string;

    // 18.5.1.2 table (Table)
    private _tableData: { [tableName: string]: string };

    // 18.2.6 definedNames (Defined Names)
    private _definedNames: { [name: string]: string };

    // formula runtime data
    private _sheetDataCache: SheetDataType = {};

    loadSheetData(workBookData: ISpreadsheetConfig) {}

    loadTableData(tableData: { [tableName: string]: string }) {}

    loadDefinedNames(definedNames: { [name: string]: string }) {}

    getSheetData(sheetName: string) {
        return this._sheetData[sheetName];
    }

    getActiveSheetData() {
        return this._sheetData[this._activeSheetName];
    }

    getTable(tableName: string) {
        return this._tableData[tableName];
    }

    getDefinedName(name: string) {
        return this._definedNames[name];
    }

    setSheetDataCache(sheetName: string, row: number, column: number, value: CellDataType, cellType: CellValueType) {
        if (!this._sheetDataCache) {
            this._sheetDataCache = {};
        }

        if (!this._sheetDataCache[sheetName]) {
            this._sheetDataCache[sheetName] = new ObjectMatrix<ICellData>();
        }

        const sheetDataCacheActive = this._sheetDataCache[sheetName];
        sheetDataCacheActive.setValue(row, column, {
            v: value,
            t: cellType,
        });
    }

    resetSheetDataCache() {
        this._sheetDataCache = {};
    }
}
