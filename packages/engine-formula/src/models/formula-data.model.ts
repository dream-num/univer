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

import type { BaseCellValue, BaseDataModel, IBaseCellData, IBaseSnapshot, ICellData, IFieldSnapshot, IObjectArrayPrimitiveType, IObjectMatrixPrimitiveType, IRange, IRowData, ITableSnapshot, IUnitRange, Nullable, Workbook } from '@univerjs/core';
import type {
    IArrayFormulaRangeType,
    IArrayFormulaUnitCellType,
    IFormulaData,
    IFormulaDataItem,
    IFormulaIdMap,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitData,
    IUnitImageFormulaDataType,
    IUnitRowData,
    IUnitSheetNameMap,
    IUnitStylesData,
} from '../basics/common';
import type { IImageFormulaInfo } from '../engine/value-object/primitive-object';
import { BooleanNumber, CellValueType, Disposable, Inject, isFormulaId, isFormulaString, IUniverInstanceService, ObjectMatrix, RANGE_TYPE, Styles, UniverInstanceType } from '@univerjs/core';
import { LexerTreeBuilder } from '../engine/analysis/lexer-tree-builder';
import { deserializeRangeWithSheet } from '../engine/utils/reference';
import { clearArrayFormulaCellDataByCell, updateFormulaDataByCellValue } from './utils/formula-data-util';

export interface IRangeChange {
    oldCell: IRange;
    newCell: IRange | null;
}

export class FormulaDataModel extends Disposable {
    private _arrayFormulaRange: IArrayFormulaRangeType = {};

    private _arrayFormulaCellData: IArrayFormulaUnitCellType = {};

    private _unitImageFormulaData: IUnitImageFormulaDataType = {};

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
        this._unitImageFormulaData = {};
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
                            arrayFormulaCellMatrixData.realDeleteValue(r, c);
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
                            arrayFormulaCellMatrixData.realDeleteValue(r, c);
                        }
                    }
                });

                cellMatrixData.forValue((row, column, cellData) => {
                    if (cellData == null) {
                        arrayFormulaCellMatrixData.realDeleteValue(row, column);
                    } else {
                        arrayFormulaCellMatrixData.setValue(row, column, cellData);
                    }
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
        for (let i = 0; i < allSheets.length; i++) {
            const workbook = allSheets[i];
            const unitId = workbook.getUnitId();
            formulaData[unitId] = {};

            const worksheets = workbook.getSheets();
            for (let j = 0; j < worksheets.length; j++) {
                const worksheet = worksheets[j];
                const cellMatrix = worksheet.getCellMatrix();
                const sheetId = worksheet.getSheetId();

                this._initSheetArrayFormulaData(unitId, sheetId, cellMatrix);
                initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);
            }
        }

        const allBases = this._univerInstanceService.getAllUnitsForType<BaseDataModel>(UniverInstanceType.UNIVER_BASE);
        for (let i = 0; i < allBases.length; i++) {
            const base = allBases[i];
            const snapshot = base.getSnapshot();
            const unitId = base.getUnitId();
            formulaData[unitId] = {};

            const tables = Object.values(snapshot.tables);
            for (let j = 0; j < tables.length; j++) {
                const table = tables[j];
                const tableFormulaData: Record<number, Record<number, IFormulaDataItem>> = {};
                const recordOrder = table.recordOrder;
                if (!recordOrder) {
                    formulaData[unitId]![table.id] = tableFormulaData;
                    continue;
                }
                for (let row = 0; row < recordOrder.length; row++) {
                    const recordId = recordOrder[row];
                    const record = table.records[recordId];
                    if (!record) {
                        continue;
                    }
                    for (let col = 0; col < table.fieldOrder.length; col++) {
                        const fieldId = table.fieldOrder[col];
                        const field = table.fields[fieldId];
                        if (!field || field.type !== 'formula') {
                            continue;
                        }
                        const formula = String(field.config?.formula ?? '').trim();
                        if (!formula) {
                            continue;
                        }
                        tableFormulaData[row] ??= {};
                        tableFormulaData[row][col] = {
                            f: normalizeBaseFormulaForEngine(formula, table, snapshot),
                            si: field.id,
                        };
                    }
                }
                formulaData[unitId]![table.id] = tableFormulaData;
            }
        }

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

        this._initSheetArrayFormulaData(unitId, sheetId, cellMatrix);
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

    getUnitImageFormulaData() {
        return this._unitImageFormulaData;
    }

    setUnitImageFormulaData(value: IUnitImageFormulaDataType) {
        this._unitImageFormulaData = value;
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

    mergeUnitImageFormulaData(formulaData: IUnitImageFormulaDataType) {
        const unitIds = Object.keys(formulaData);

        for (let i = 0; i < unitIds.length; i++) {
            const unitId = unitIds[i];

            const sheetData = formulaData[unitId];
            if (!sheetData) continue;

            if (!this._unitImageFormulaData[unitId]) {
                this._unitImageFormulaData[unitId] = {};
            }

            const sheetIds = Object.keys(sheetData);

            for (let j = 0; j < sheetIds.length; j++) {
                const sheetId = sheetIds[j];

                const imageFormulaMatrix = sheetData[sheetId];
                if (!imageFormulaMatrix) continue;

                if (!this._unitImageFormulaData[unitId][sheetId]) {
                    this._unitImageFormulaData[unitId][sheetId] = new ObjectMatrix<Nullable<IImageFormulaInfo>>();
                }

                imageFormulaMatrix.forValue((r, c, v) => {
                    this._unitImageFormulaData[unitId]![sheetId].setValue(r, c, v);
                });
            }
        }
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

        const unitAllBases = this._univerInstanceService.getAllUnitsForType<BaseDataModel>(UniverInstanceType.UNIVER_BASE);
        for (const base of unitAllBases) {
            const snapshot = base.getSnapshot();
            const unitId = base.getUnitId();
            const baseData: ISheetData = {};
            const tableNameMap: { [tableName: string]: string } = {};

            for (const table of Object.values(snapshot.tables)) {
                baseData[table.id] = {
                    cellData: new ObjectMatrix(buildBaseRuntimeCellData(table)) as unknown as ObjectMatrix<ICellData>,
                    rowCount: table.recordOrder?.length ?? 0,
                    columnCount: table.fieldOrder.length,
                    rowData: {},
                    columnData: {},
                };
                tableNameMap[table.name] = table.id;
            }

            allUnitData[unitId] = baseData;
            unitStylesData[unitId] = new Styles();
            unitSheetNameMap[unitId] = tableNameMap;
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
        const newSheetFormulaDataMatrix = new ObjectMatrix<IFormulaDataItem | null>();
        const worksheetCellMatrix = this._univerInstanceService
            .getUnit<Workbook>(unitId)
            ?.getSheetBySheetId(sheetId)
            ?.getCellMatrix();
        const affectedFormulaIds = new Set<string>();

        cellMatrix.forValue((r, c, cell) => {
            const currentCell = worksheetCellMatrix?.getValue(r, c);
            const currentFormulaId = currentCell?.si;
            const formulaId = cell?.si;
            const hasCurrentFormulaId = isFormulaId(currentFormulaId);
            const hasFormulaId = isFormulaId(formulaId);
            const formulaString = cell?.f;

            if (hasCurrentFormulaId) {
                affectedFormulaIds.add(String(currentFormulaId));
            }
            if (hasFormulaId) {
                affectedFormulaIds.add(String(formulaId));
            }

            if (!hasCurrentFormulaId && !hasFormulaId) {
                if (typeof formulaString === 'string' && isFormulaString(formulaString)) {
                    newSheetFormulaDataMatrix.setValue(r, c, { f: formulaString });
                } else if (isFormulaString(currentCell?.f)) {
                    newSheetFormulaDataMatrix.setValue(r, c, null);
                }
            }
        });

        if (affectedFormulaIds.size === 0) {
            return newSheetFormulaDataMatrix.getMatrix();
        }

        const formulaIdMap: { [formulaId: string]: IFormulaIdMap } = {};
        const sharedFormulaCellMatrix = new ObjectMatrix<Nullable<ICellData>>();
        worksheetCellMatrix?.forValue((r, c, cell) => {
            const formulaId = cell?.si;
            if (!isFormulaId(formulaId) || !affectedFormulaIds.has(String(formulaId))) {
                return;
            }

            sharedFormulaCellMatrix.setValue(r, c, cell);

            if (typeof cell?.f === 'string' && isFormulaString(cell.f)) {
                formulaIdMap[String(formulaId)] = { f: cell.f, r, c };
            }
        });

        const formulaData: IFormulaData = {};
        initSheetFormulaData(formulaData, unitId, sheetId, sharedFormulaCellMatrix);
        const deleteFormulaIdMap = new Map<string, string | IFormulaIdMap>();
        const sheetFormulaDataMatrix = new ObjectMatrix<Nullable<IFormulaDataItem>>(formulaData[unitId]?.[sheetId] ?? {});

        cellMatrix.forValue((r, c, cell) => {
            const currentFormulaId = worksheetCellMatrix?.getValue(r, c)?.si;
            if (!isFormulaId(currentFormulaId) && !isFormulaId(cell?.si)) {
                return;
            }

            updateFormulaDataByCellValue(sheetFormulaDataMatrix, newSheetFormulaDataMatrix, formulaIdMap, deleteFormulaIdMap, r, c, cell);
        });

        this._rebindSharedFormulaData(sheetFormulaDataMatrix, newSheetFormulaDataMatrix, formulaIdMap, deleteFormulaIdMap);

        return newSheetFormulaDataMatrix.getMatrix();
    }

    private _rebindSharedFormulaData(
        sheetFormulaDataMatrix: ObjectMatrix<Nullable<IFormulaDataItem>>,
        newSheetFormulaDataMatrix: ObjectMatrix<IFormulaDataItem | null>,
        formulaIdMap: { [formulaId: string]: IFormulaIdMap },
        deleteFormulaIdMap: Map<string, string | IFormulaIdMap>
    ) {
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
    }

    updateArrayFormulaRange(
        unitId: string,
        sheetId: string,
        cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>
    ) {
        // remove the array formula range when cell value is null

        const arrayFormulaRange = this._arrayFormulaRange[unitId]?.[sheetId];

        if (!arrayFormulaRange) return false;

        const arrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange);
        const cellMatrix = new ObjectMatrix(cellValue);
        let changed = false;

        cellMatrix.forValue((r, c) => {
            if (arrayFormulaRangeMatrix.getValue(r, c) != null) {
                arrayFormulaRangeMatrix.realDeleteValue(r, c);
                changed = true;
            }
        });

        if (changed && this._arrayFormulaRange[unitId]) {
            this._arrayFormulaRange[unitId]![sheetId] = arrayFormulaRangeMatrix.getData();
        }

        return changed;
    }

    updateArrayFormulaCellData(
        unitId: string,
        sheetId: string,
        cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>
    ) {
        // remove the array formula range when cell value is null

        const arrayFormulaRange = this._arrayFormulaRange[unitId]?.[sheetId];

        if (!arrayFormulaRange) return false;

        const arrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange);

        const arrayFormulaCellData = this._arrayFormulaCellData[unitId]?.[sheetId];

        if (!arrayFormulaCellData) return false;

        const arrayFormulaCellDataMatrix = new ObjectMatrix(arrayFormulaCellData);

        const cellMatrix = new ObjectMatrix(cellValue);
        let changed = false;

        cellMatrix.forValue((r, c) => {
            changed = clearArrayFormulaCellDataByCell(arrayFormulaRangeMatrix, arrayFormulaCellDataMatrix, r, c) || changed;
        });

        if (changed && this._arrayFormulaCellData[unitId]) {
            this._arrayFormulaCellData[unitId]![sheetId] = arrayFormulaCellDataMatrix.getData();
        }

        return changed;
    }

    updateImageFormulaData(unitId: string, sheetId: string, cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>) {
        const imageFormulaData = this._unitImageFormulaData[unitId]?.[sheetId];
        if (!imageFormulaData) {
            return;
        }

        const cellMatrix = new ObjectMatrix(cellValue);

        cellMatrix.forValue((r, c) => {
            imageFormulaData.realDeleteValue(r, c);
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

            const workbookInstance = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);

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
                        const noValue = currentCell?.v === undefined || currentCell?.v === null;

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

    private _initSheetArrayFormulaData(unitId: string, sheetId: string, cellMatrix: ObjectMatrix<Nullable<ICellData>>) {
        let arrayFormulaRangeMatrix: Nullable<ObjectMatrix<IRange>>;
        let arrayFormulaCellDataMatrix: Nullable<ObjectMatrix<Nullable<ICellData>>>;
        const formulaIds = new Set<string>();

        cellMatrix.forValue((_, __, cell) => {
            const formulaId = cell?.si;
            if (isFormulaString(cell?.f) && isFormulaId(formulaId)) {
                formulaIds.add(String(formulaId));
            }
        });

        cellMatrix.forValue((row, column, cell) => {
            const ref = (cell as (ICellData & { ref?: string }) | null)?.ref;
            const formula = cell?.f;
            const formulaId = cell?.si;
            const hasOwnFormula = isFormulaString(formula);
            const hasSharedFormula = isFormulaId(formulaId) && formulaIds.has(String(formulaId));

            if ((!hasOwnFormula && !hasSharedFormula) || typeof ref !== 'string' || ref.length === 0) {
                return true;
            }

            const { range } = deserializeRangeWithSheet(ref);
            if (!Number.isFinite(range.startRow) || !Number.isFinite(range.startColumn) || !Number.isFinite(range.endRow) || !Number.isFinite(range.endColumn)) {
                return true;
            }

            if (
                range.startRow === row &&
                range.endRow === row &&
                range.startColumn === column &&
                range.endColumn === column &&
                !isArrayConstantFormula(formula)
            ) {
                return true;
            }

            if (!this._arrayFormulaRange[unitId]) {
                this._arrayFormulaRange[unitId] = {};
            }
            if (!this._arrayFormulaCellData[unitId]) {
                this._arrayFormulaCellData[unitId] = {};
            }

            arrayFormulaRangeMatrix ??= new ObjectMatrix<IRange>(this._arrayFormulaRange[unitId]?.[sheetId]);
            arrayFormulaCellDataMatrix ??= new ObjectMatrix<Nullable<ICellData>>(this._arrayFormulaCellData[unitId]?.[sheetId]);

            if (arrayFormulaRangeMatrix.getValue(row, column) == null) {
                arrayFormulaRangeMatrix.setValue(row, column, range);
            }

            for (let r = range.startRow; r <= range.endRow; r++) {
                for (let c = range.startColumn; c <= range.endColumn; c++) {
                    if (arrayFormulaCellDataMatrix.getValue(r, c) != null) {
                        continue;
                    }

                    const rangeCell = cellMatrix.getValue(r, c);
                    if (rangeCell != null) {
                        arrayFormulaCellDataMatrix.setValue(r, c, { ...rangeCell });
                    }
                }
            }
        });

        if (arrayFormulaRangeMatrix && this._arrayFormulaRange[unitId]) {
            this._arrayFormulaRange[unitId]![sheetId] = arrayFormulaRangeMatrix.getData();
        }
        if (arrayFormulaCellDataMatrix && this._arrayFormulaCellData[unitId]) {
            this._arrayFormulaCellData[unitId]![sheetId] = arrayFormulaCellDataMatrix.getData();
        }
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
                const x = c - formulaInfo.c;
                const y = r - formulaInfo.r;
                const f = formulaInfo.f;

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

const BASE_LEGACY_FIELD_REF_PATTERN = /\{([^}]+)\}/g;
const BASE_TABLE_FIELD_REF_PATTERN = /\b([A-Z_]\w*)\[([^\]]+)\]/gi;
const BASE_BRACKET_FIELD_REF_PATTERN = /(^|[^A-Za-z0-9_\]\[])\[([^\]]+)\]/g;

function normalizeBaseFormulaForEngine(formula: string, currentTable: ITableSnapshot, snapshot: IBaseSnapshot): string {
    const refs: string[] = [];
    const hold = (ref: string) => {
        const index = refs.push(ref) - 1;
        return `__BASE_FORMULA_REF_${index}__`;
    };
    const normalized = formula
        .replace(BASE_LEGACY_FIELD_REF_PATTERN, (_match, fieldName: string) => hold(createEngineThisRowRef(currentTable, fieldName, snapshot)))
        .replace(BASE_TABLE_FIELD_REF_PATTERN, (_match, sourceTableName: string, fieldName: string) => {
            const targetTable = resolveBaseFormulaTable(sourceTableName, currentTable, snapshot);
            return targetTable ? hold(createEngineThisRowRef(targetTable, fieldName, snapshot)) : `${sourceTableName}[${fieldName}]`;
        })
        .replace(BASE_BRACKET_FIELD_REF_PATTERN, (_match, prefix: string, fieldName: string) => `${prefix}${hold(createEngineThisRowRef(currentTable, fieldName, snapshot))}`);
    return normalized.replace(/__BASE_FORMULA_REF_(\d+)__/g, (_match, index: string) => refs[Number(index)] ?? '');
}

function createEngineThisRowRef(table: ITableSnapshot, fieldName: string, snapshot: IBaseSnapshot): string {
    return `${getEngineBaseTableName(table, snapshot)}[[#This Row],[${fieldName}]]`;
}

function getEngineBaseTableName(table: ITableSnapshot, snapshot: IBaseSnapshot): string {
    const tables = Object.values(snapshot.tables);
    let sameNameCount = 0;
    for (let i = 0; i < tables.length; i++) {
        const item = tables[i];
        if (item.name === table.name) {
            sameNameCount++;
            if (sameNameCount > 1) {
                break;
            }
        }
    }
    return sameNameCount === 1 ? table.name : table.id;
}

function buildBaseRuntimeCellData(table: ITableSnapshot): Record<number, Record<number, IBaseCellData>> {
    const cellData: Record<number, Record<number, IBaseCellData>> = { ...table.cellData };
    const fieldOrder: string[] = [];
    for (let i = 0; i < table.fieldOrder.length; i++) {
        const fieldId = table.fieldOrder[i];
        if (table.fields[fieldId]) {
            fieldOrder.push(fieldId);
        }
    }
    let recordOrder: string[];
    if (table.recordOrder) {
        recordOrder = [];
        for (let i = 0; i < table.recordOrder.length; i++) {
            const recordId = table.recordOrder[i];
            if (table.records[recordId]) {
                recordOrder.push(recordId);
            }
        }
    } else {
        const allRecords = Object.values(table.records ?? {});
        const records: typeof allRecords = [];
        for (let i = 0; i < allRecords.length; i++) {
            const record = allRecords[i];
            records.push(record);
        }
        records.sort((a, b) => a.orderKey.localeCompare(b.orderKey));
        recordOrder = [];
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            recordOrder.push(record.id);
        }
    }

    for (let row = 0; row < recordOrder.length; row++) {
        const recordId = recordOrder[row];
        const record = table.records[recordId];
        if (!record) {
            continue;
        }
        cellData[row] = { ...cellData[row] };
        for (let col = 0; col < fieldOrder.length; col++) {
            const fieldId = fieldOrder[col];
            if (!Object.prototype.hasOwnProperty.call(record.values ?? {}, fieldId)) {
                continue;
            }
            cellData[row][col] = toBaseRuntimeCellData(record.values[fieldId], table.fields[fieldId]);
        }
    }

    return cellData;
}

function toBaseRuntimeCellData(value: BaseCellValue | IBaseCellData, field?: IFieldSnapshot): IBaseCellData {
    if (isBaseCellData(value)) {
        return normalizeBaseCellData(value);
    }
    if (field?.type === 'attachment') {
        return { v: '', t: CellValueType.STRING };
    }
    if (Array.isArray(value)) {
        return { v: value.join(', '), t: CellValueType.STRING };
    }
    if (field?.type === 'link' && value && typeof value === 'object') {
        const link = value as { text?: unknown; url?: unknown };
        return { v: String(link.text ?? link.url ?? ''), t: CellValueType.STRING };
    }
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return { v: value, t: inferBaseRuntimeCellType(value) };
    }
    return { v: null, t: null };
}

function normalizeBaseCellData(cell: IBaseCellData): IBaseCellData {
    const type = inferBaseRuntimeCellType(cell.v ?? null);
    return { ...cell, t: type };
}

function inferBaseRuntimeCellType(value: IBaseCellData['v']): CellValueType | null {
    if (typeof value === 'number') {
        return CellValueType.NUMBER;
    }
    if (typeof value === 'boolean') {
        return CellValueType.BOOLEAN;
    }
    if (typeof value === 'string') {
        return CellValueType.STRING;
    }
    return null;
}

function isArrayConstantFormula(formula: unknown): formula is string {
    return typeof formula === 'string' && /^=\s*\{/.test(formula);
}

function isBaseCellData(value: unknown): value is IBaseCellData {
    return !!value && typeof value === 'object' && (
        Object.prototype.hasOwnProperty.call(value, 'v')
        || Object.prototype.hasOwnProperty.call(value, 't')
        || Object.prototype.hasOwnProperty.call(value, 'p')
        || Object.prototype.hasOwnProperty.call(value, 'f')
        || Object.prototype.hasOwnProperty.call(value, 'si')
    );
}

function resolveBaseFormulaTable(tableName: string | undefined, currentTable: ITableSnapshot, snapshot: IBaseSnapshot): ITableSnapshot | undefined {
    if (!tableName || tableName === 'table' || tableName === currentTable.id || tableName === currentTable.name) {
        return currentTable;
    }

    const byId = snapshot.tables[tableName];
    if (byId) {
        return byId;
    }

    const matches = Object.values(snapshot.tables).filter((table) => table.name === tableName);
    return matches.length === 1 ? matches[0] : undefined;
}
