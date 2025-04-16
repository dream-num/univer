/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICellData, IObjectArrayPrimitiveType, IObjectMatrixPrimitiveType, IRange, IRowData, IUnitRange, Nullable, Workbook } from '@univerjs/core';
import type {
    IArrayFormulaRangeType,
    IArrayFormulaUnitCellType,
    IFormulaData,
    IFormulaDataItem,
    IFormulaIdMap,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitData,
    IUnitRowData,
    IUnitSheetNameMap,
    IUnitStylesData,
} from '../basics/common';

import { BooleanNumber, Disposable, Inject, isFormulaId, isFormulaString, IUniverInstanceService, ObjectMatrix, RANGE_TYPE, UniverInstanceType } from '@univerjs/core';
import { LexerTreeBuilder } from '../engine/analysis/lexer-tree-builder';
import { clearArrayFormulaCellDataByCell, updateFormulaDataByCellValue } from './utils/formula-data-util';

export interface IRangeChange {
    oldCell: IRange;
    newCell: IRange | null;
}

export class FormulaDataModel extends Disposable {
    private _arrayFormulaRange: IArrayFormulaRangeType = {};

    private _arrayFormulaCellData: IArrayFormulaUnitCellType = {};

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();
    }

    override dispose() {
        super.dispose();
        this._arrayFormulaRange = {};
        this._arrayFormulaCellData = {};
    }

    clearPreviousArrayFormulaCellData(clearArrayFormulaCellData: IRuntimeUnitDataType) {
        Object.keys(clearArrayFormulaCellData).forEach((unitId) => {
            const clearSheetData = clearArrayFormulaCellData[unitId];

            if (clearSheetData == null) {
                return true;
            }

            Object.keys(clearSheetData).forEach((sheetId) => {
                const clearCellMatrixData = clearSheetData[sheetId];
                const formulaRange = this._arrayFormulaRange?.[unitId]?.[sheetId];
                if (formulaRange == null) {
                    return true;
                }

                const rangeMatrix = new ObjectMatrix<IRange>(formulaRange); // Original array formula range.
                let arrayFormulaCellMatrixData = new ObjectMatrix<Nullable<ICellData>>(); // Original array formula cell data.

                if (this._arrayFormulaCellData[unitId]?.[sheetId] != null) {
                    arrayFormulaCellMatrixData = new ObjectMatrix<Nullable<ICellData>>(
                        this._arrayFormulaCellData[unitId]?.[sheetId]
                    );
                }

                clearCellMatrixData.forValue((row, column) => {
                    const range = rangeMatrix.getValue(row, column);
                    if (range == null) {
                        return true;
                    }

                    const { startRow, startColumn, endRow, endColumn } = range;
                    for (let r = startRow; r <= endRow; r++) {
                        for (let c = startColumn; c <= endColumn; c++) {
                            arrayFormulaCellMatrixData.setValue(r, c, null);
                        }
                    }

                    // clear the array formula range
                    rangeMatrix.realDeleteValue(row, column);
                });

                if (this._arrayFormulaCellData[unitId]) {
                    this._arrayFormulaCellData[unitId]![sheetId] = arrayFormulaCellMatrixData.getData();
                }
            });
        });
    }

    mergeArrayFormulaCellData(unitData: IRuntimeUnitDataType) {
        Object.keys(unitData).forEach((unitId) => {
            const sheetData = unitData[unitId];

            if (sheetData == null) {
                return true;
            }

            if (this._arrayFormulaRange[unitId] == null) {
                this._arrayFormulaRange[unitId] = {};
            }

            if (this._arrayFormulaCellData[unitId] == null) {
                this._arrayFormulaCellData[unitId] = {};
            }

            Object.keys(sheetData).forEach((sheetId) => {
                const cellMatrixData = sheetData[sheetId]; // The runtime data for array formula value calculated by the formula engine.

                const arrayFormulaRangeMatrix = new ObjectMatrix<IRange>(this._arrayFormulaRange[unitId]?.[sheetId]); // Original array formula range.
                const arrayFormulaCellMatrixData = new ObjectMatrix<Nullable<ICellData>>(this._arrayFormulaCellData[unitId]?.[sheetId]); // Original array formula cell data.

                /**
                 * If the calculated value of the array formula is updated, clear the values within the original data formula range.
                 */
                cellMatrixData.forValue((row, column) => {
                    const arrayFormulaRange = arrayFormulaRangeMatrix?.getValue(row, column);
                    if (arrayFormulaRange == null) {
                        return true;
                    }
                    const { startRow, startColumn, endRow, endColumn } = arrayFormulaRange;
                    for (let r = startRow; r <= endRow; r++) {
                        for (let c = startColumn; c <= endColumn; c++) {
                            arrayFormulaCellMatrixData.setValue(r, c, null);
                        }
                    }
                });

                cellMatrixData.forValue((row, column, cellData) => {
                    arrayFormulaCellMatrixData.setValue(row, column, cellData);
                });

                if (this._arrayFormulaCellData[unitId]) {
                    this._arrayFormulaCellData[unitId]![sheetId] = arrayFormulaCellMatrixData.getData();
                }
            });
        });
    }

    getFormulaData(): IFormulaData {
        const formulaData: IFormulaData = {};
        const allSheets = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (allSheets.length === 0) {
            return formulaData;
        }

        allSheets.forEach((workbook) => {
            const unitId = workbook.getUnitId();
            formulaData[unitId] = {};

            const worksheets = workbook.getSheets();
            worksheets.forEach((worksheet) => {
                const cellMatrix = worksheet.getCellMatrix();
                const sheetId = worksheet.getSheetId();

                initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);
            });
        });

        return formulaData;
    }

    getSheetFormulaData(unitId: string, sheetId: string) {
        const formulaData: IFormulaData = {};
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
        if (workbook == null) {
            return {};
        }

        formulaData[unitId] = {};

        const worksheet = workbook.getSheetBySheetId(sheetId);
        if (worksheet == null) {
            return {};
        }

        const cellMatrix = worksheet.getCellMatrix();

        initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

        return formulaData[unitId][sheetId];
    }

    getArrayFormulaRange(): IArrayFormulaRangeType {
        return this._arrayFormulaRange;
    }

    setArrayFormulaRange(value: IArrayFormulaRangeType) {
        this._arrayFormulaRange = value;
    }

    getArrayFormulaCellData() {
        return this._arrayFormulaCellData;
    }

    setArrayFormulaCellData(value: IArrayFormulaUnitCellType) {
        this._arrayFormulaCellData = value;
    }

    mergeArrayFormulaRange(formulaData: IArrayFormulaRangeType) {
        Object.keys(formulaData).forEach((unitId) => {
            const sheetData = formulaData[unitId];

            if (sheetData == null) {
                return true;
            }

            if (!this._arrayFormulaRange[unitId]) {
                this._arrayFormulaRange[unitId] = {};
            }

            Object.keys(sheetData).forEach((sheetId) => {
                const arrayFormula = new ObjectMatrix(sheetData[sheetId]);
                const rangeMatrix = new ObjectMatrix(this._arrayFormulaRange[unitId]?.[sheetId]);

                arrayFormula.forValue((r, c, v) => {
                    rangeMatrix.setValue(r, c, v);
                });

                if (this._arrayFormulaRange[unitId]) {
                    this._arrayFormulaRange[unitId]![sheetId] = rangeMatrix.getData();
                }
            });
        });
    }

    deleteArrayFormulaRange(unitId: string, sheetId: string, row: number, column: number) {
        const cellMatrixData = this._arrayFormulaRange[unitId]?.[sheetId];
        if (cellMatrixData == null) {
            return;
        }
        const rangeMatrixData = new ObjectMatrix(cellMatrixData);
        if (rangeMatrixData.getValue(row, column)) {
            rangeMatrixData.realDeleteValue(row, column);

            if (this._arrayFormulaRange[unitId]) {
                this._arrayFormulaRange[unitId]![sheetId] = rangeMatrixData.getData();
            }
        }
    }

    getCalculateData() {
        const unitAllSheet = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);

        const allUnitData: IUnitData = {};

        const unitStylesData: IUnitStylesData = {};

        const unitSheetNameMap: IUnitSheetNameMap = {};

        for (const workbook of unitAllSheet) {
            const unitId = workbook.getUnitId();

            const sheets = workbook.getSheets();

            const sheetData: ISheetData = {};

            const sheetNameMap: { [sheetName: string]: string } = {};

            for (const sheet of sheets) {
                const sheetId = sheet.getSheetId();

                const sheetConfig = sheet.getConfig();
                sheetData[sheetId] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                    rowData: sheetConfig.rowData,
                    columnData: sheetConfig.columnData,
                    defaultRowHeight: sheetConfig.defaultRowHeight,
                    defaultColumnWidth: sheetConfig.defaultColumnWidth,
                };
                sheetNameMap[sheet.getName()] = sheet.getSheetId();
            }

            allUnitData[unitId] = sheetData;

            unitStylesData[unitId] = workbook.getStyles();

            unitSheetNameMap[unitId] = sheetNameMap;
        }

        return {
            allUnitData,
            unitStylesData,
            unitSheetNameMap,
        };
    }

    /**
     * Get the hidden rows that are filtered or manually hidden.
     *
     * For formulas that are sensitive to hidden rows.
     */
    getHiddenRowsFiltered() {
        const unitAllSheet = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const rowData: IUnitRowData = {};

        for (const workbook of unitAllSheet) {
            const unitId = workbook.getUnitId();
            const sheets = workbook.getSheets();
            rowData[unitId] = {};

            for (const sheet of sheets) {
                const sheetId = sheet.getSheetId();
                rowData[unitId][sheetId] = {};

                const startRow = 0;
                const endRow = sheet.getRowCount() - 1;
                const sheetRowData: IObjectArrayPrimitiveType<Partial<IRowData>> = {};

                for (let i = startRow; i <= endRow; i++) {
                    if (!sheet.getRowVisible(i)) {
                        sheetRowData[i] = {
                            hd: BooleanNumber.TRUE,
                        };
                    }
                }

                rowData[unitId][sheetId] = sheetRowData;
            }
        }

        return rowData;
    }

    updateFormulaData(unitId: string, sheetId: string, cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>) {
        const cellMatrix = new ObjectMatrix(cellValue);

        const formulaIdMap = this._getSheetFormulaIdMap(unitId, sheetId); // Connect the formula and ID

        const deleteFormulaIdMap = new Map<string, string | IFormulaIdMap>();

        const formulaData = this.getFormulaData();

        if (formulaData[unitId] == null) {
            formulaData[unitId] = {};
        }

        const workbookFormulaData = formulaData[unitId]!;

        if (workbookFormulaData[sheetId] == null) {
            workbookFormulaData[sheetId] = {};
        }

        const sheetFormulaDataMatrix = new ObjectMatrix<Nullable<IFormulaDataItem>>(workbookFormulaData[sheetId] || {});
        const newSheetFormulaDataMatrix = new ObjectMatrix<IFormulaDataItem | null>();

        cellMatrix.forValue((r, c, cell) => {
            updateFormulaDataByCellValue(sheetFormulaDataMatrix, newSheetFormulaDataMatrix, formulaIdMap, deleteFormulaIdMap, r, c, cell);
        });

        // Convert the formula ID to formula string
        sheetFormulaDataMatrix.forValue((r, c, cell) => {
            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';

            if (isFormulaId(formulaId)) {
                const formulaInfo = formulaIdMap?.[formulaId];
                const deleteFormula = deleteFormulaIdMap.get(formulaId);

                if (formulaInfo && !isFormulaString(formulaString)) {
                    const f = formulaInfo.f;
                    const x = c - formulaInfo.c;
                    const y = r - formulaInfo.r;

                    sheetFormulaDataMatrix.setValue(r, c, { f, si: formulaId, x, y });
                    newSheetFormulaDataMatrix.setValue(r, c, { f, si: formulaId, x, y });
                } else if (typeof deleteFormula === 'string') {
                    const x = cell?.x || 0;
                    const y = cell?.y || 0;
                    const offsetFormula = this._lexerTreeBuilder.moveFormulaRefOffset(deleteFormula, x, y);

                    deleteFormulaIdMap.set(formulaId, { r, c, f: offsetFormula });

                    sheetFormulaDataMatrix.setValue(r, c, { f: offsetFormula, si: formulaId });
                    newSheetFormulaDataMatrix.setValue(r, c, { f: offsetFormula, si: formulaId });
                } else if (typeof deleteFormula === 'object') {
                    const x = c - deleteFormula.c;
                    const y = r - deleteFormula.r;

                    sheetFormulaDataMatrix.setValue(r, c, { f: deleteFormula.f, si: formulaId, x, y });
                    newSheetFormulaDataMatrix.setValue(r, c, { f: deleteFormula.f, si: formulaId, x, y });
                }
            }
        });

        return newSheetFormulaDataMatrix.getMatrix();
    }

    updateArrayFormulaRange(
        unitId: string,
        sheetId: string,
        cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>
    ) {
        // remove the array formula range when cell value is null

        const arrayFormulaRange = this._arrayFormulaRange[unitId]?.[sheetId];

        if (!arrayFormulaRange) return;

        const arrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange);
        const cellMatrix = new ObjectMatrix(cellValue);

        cellMatrix.forValue((r, c, cell) => {
            arrayFormulaRangeMatrix.realDeleteValue(r, c);
        });
    }

    updateArrayFormulaCellData(
        unitId: string,
        sheetId: string,
        cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>
    ) {
        // remove the array formula range when cell value is null

        const arrayFormulaRange = this._arrayFormulaRange[unitId]?.[sheetId];

        if (!arrayFormulaRange) return;

        const arrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange);

        const arrayFormulaCellData = this._arrayFormulaCellData[unitId]?.[sheetId];

        if (!arrayFormulaCellData) return;

        const arrayFormulaCellDataMatrix = new ObjectMatrix(arrayFormulaCellData);

        const cellMatrix = new ObjectMatrix(cellValue);

        cellMatrix.forValue((r, c, cell) => {
            clearArrayFormulaCellDataByCell(arrayFormulaRangeMatrix, arrayFormulaCellDataMatrix, r, c);
        });
    }

    getFormulaStringByCell(row: number, column: number, sheetId: string, unitId: string) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
        if (workbook == null) {
            return null;
        }

        const worksheet = workbook.getSheetBySheetId(sheetId);
        if (worksheet == null) {
            return null;
        }

        const cellMatrix = worksheet.getCellMatrix();

        const cell = cellMatrix.getValue(row, column);

        if (cell == null) {
            return null;
        }

        const { f, si } = cell;

        if (isFormulaString(f)) {
            return f;
        }

        if (isFormulaId(si)) {
            let formulaString: Nullable<string> = null;

            // Get the result in one traversal, pay attention to performance
            cellMatrix.forValue((r, c, cell) => {
                if (cell == null) {
                    return true;
                }

                const { f, si: currentId } = cell;

                if (isFormulaString(f) && si === currentId) {
                    formulaString = this._lexerTreeBuilder.moveFormulaRefOffset(
                        f as string,
                        column - c,
                        row - r
                    );

                    return false;
                }
            });

            return formulaString;
        }

        return null;
    }

    /**
     * Function to get all formula ranges
     * @returns
     */
    getFormulaDirtyRanges(): IUnitRange[] {
        const formulaData = this.getFormulaData();

        const dirtyRanges: IUnitRange[] = [];

        for (const unitId in formulaData) {
            const workbook = formulaData[unitId];

            if (!workbook) continue;

            const workbookInstance = this._univerInstanceService.getUnit<Workbook>(unitId);

            if (!workbookInstance) continue;

            for (const sheetId in workbook) {
                const sheet = workbook[sheetId];

                if (!sheet) continue;

                const sheetInstance = workbookInstance.getSheetBySheetId(sheetId);

                if (!sheetInstance) continue;

                // Object to store continuous cell ranges by column
                const columnRanges: { [column: number]: { startRow: number; endRow: number }[] } = {};

                for (const rowStr of Object.keys(sheet)) {
                    const row = Number(rowStr);

                    for (const columnStr in sheet[row]) {
                        const column = Number(columnStr);

                        const currentCell = sheetInstance.getCellRaw(row, column);

                        // Calculation is only required when there is only a formula and no value
                        const isFormula = isFormulaString(currentCell?.f) || isFormulaId(currentCell?.si);
                        const noValue = currentCell?.v === undefined;

                        if (!(isFormula && noValue)) continue;

                        if (!columnRanges[column]) columnRanges[column] = [];

                        const lastRange = columnRanges[column].slice(-1)[0];

                        // If the current row is continuous with the last range, extend endRow
                        if (lastRange && lastRange.endRow === row - 1) {
                            lastRange.endRow = row;
                        } else {
                            // Otherwise, start a new range
                            columnRanges[column].push({ startRow: row, endRow: row });
                        }
                    }
                }

                // Convert collected column ranges to IUnitRange format
                for (const column in columnRanges) {
                    const currentColumnRanges = columnRanges[column];
                    for (let i = 0; i < currentColumnRanges.length; i++) {
                        const range = currentColumnRanges[i];
                        dirtyRanges.push({
                            unitId,
                            sheetId,
                            range: {
                                rangeType: RANGE_TYPE.NORMAL,
                                startRow: range.startRow,
                                endRow: range.endRow, // Use endRow as the inclusive end row
                                startColumn: Number(column),
                                endColumn: Number(column),
                            },
                        });
                    }
                }
            }
        }

        return dirtyRanges;
    }

    private _getSheetFormulaIdMap(unitId: string, sheetId: string) {
        const formulaIdMap: Nullable<{ [formulaId: string]: IFormulaIdMap }> = {}; // Connect the formula and ID

        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
        if (workbook == null) {
            return formulaIdMap;
        }

        const worksheet = workbook.getSheetBySheetId(sheetId);
        if (worksheet == null) {
            return formulaIdMap;
        }

        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.forValue((r, c, cell) => {
            if (cell == null) {
                return true;
            }

            const { f, si } = cell;

            if (isFormulaString(f) && isFormulaId(si)) {
                formulaIdMap[si as string] = { f: f as string, r, c };
            }
        });

        return formulaIdMap;
    }
}

export function initSheetFormulaData(
    formulaData: IFormulaData,
    unitId: string,
    sheetId: string,
    cellMatrix: ObjectMatrix<Nullable<ICellData>>
): IFormulaData {
    if (!formulaData[unitId]) {
        formulaData[unitId] = {};
    }

    if (!formulaData[unitId][sheetId]) {
        formulaData[unitId][sheetId] = {};
    }

    const formulaIdMap = new Map<string, { f: string; r: number; c: number }>(); // Connect the formula and ID
    const sheetFormulaDataMatrix = new ObjectMatrix<Nullable<IFormulaDataItem>>(formulaData[unitId][sheetId]);

    cellMatrix.forValue((r, c, cell) => {
        const formulaString = cell?.f || '';
        const formulaId = cell?.si || '';

        const checkFormulaString = isFormulaString(formulaString);
        const checkFormulaId = isFormulaId(formulaId);

        if (checkFormulaString && checkFormulaId) {
            sheetFormulaDataMatrix.setValue(r, c, {
                f: formulaString,
                si: formulaId,
            });
            formulaIdMap.set(formulaId, { f: formulaString, r, c });
        } else if (checkFormulaString && !checkFormulaId) {
            sheetFormulaDataMatrix.setValue(r, c, {
                f: formulaString,
            });
        } else if (!checkFormulaString && checkFormulaId) {
            sheetFormulaDataMatrix.setValue(r, c, {
                f: '',
                si: formulaId,
            });
        }
    });

    sheetFormulaDataMatrix.forValue((r, c, cell) => {
        const formulaString = cell?.f || '';
        const formulaId = cell?.si || '';

        if (isFormulaId(formulaId) && !isFormulaString(formulaString)) {
            const formulaInfo = formulaIdMap.get(formulaId);
            if (formulaInfo) {
                const f = formulaInfo.f;
                const x = c - formulaInfo.c;
                const y = r - formulaInfo.r;

                sheetFormulaDataMatrix.setValue(r, c, { f, si: formulaId, x, y });
            } else {
                // If the formula ID is not found in the formula ID map, delete the formula ID.
                // Prevent IDs without corresponding formulas from appearing
                sheetFormulaDataMatrix.realDeleteValue(r, c);
            }
        }
    });

    const newSheetFormulaData = sheetFormulaDataMatrix.getMatrix(); // Don't use clone, otherwise it will cause performance problems

    return {
        [unitId]: {
            [sheetId]: newSheetFormulaData,
        },
    };
}
