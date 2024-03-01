/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, IObjectMatrixPrimitiveType, IRange, Nullable } from '@univerjs/core';
import { Disposable, isFormulaId, isFormulaString, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import type {
    IArrayFormulaRangeType,
    IArrayFormulaUnitCellType,
    IFormulaData,
    IFormulaDataItem,
    INumfmtItemMap,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitData,
    IUnitSheetNameMap,
} from '../basics/common';
import { LexerTreeBuilder } from '../engine/analysis/lexer-tree-builder';

export interface IFormulaIdMap {
    f: string;
    r: number;
    c: number;
}

export class FormulaDataModel extends Disposable {
    private _formulaData: IFormulaData = {};

    private _arrayFormulaRange: IArrayFormulaRangeType = {};

    private _arrayFormulaCellData: IArrayFormulaUnitCellType = {};

    // TODO@Dushusir: Determine the node.js environment and synchronize to the resource plugin when SSC is used
    private _numfmtItemMap: INumfmtItemMap = {};

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();
    }

    clearPreviousArrayFormulaCellData(clearArrayFormulaCellData: IRuntimeUnitDataType) {
        Object.keys(clearArrayFormulaCellData).forEach((unitId) => {
            const clearSheetData = clearArrayFormulaCellData[unitId];

            if (clearSheetData == null) {
                return true;
            }

            Object.keys(clearSheetData).forEach((sheetId) => {
                const clearCellMatrixData = clearSheetData[sheetId];
                const rangeMatrix = this._arrayFormulaRange?.[unitId]?.[sheetId];
                if (rangeMatrix == null) {
                    return true;
                }

                let arrayFormulaCellMatrixData = new ObjectMatrix<Nullable<ICellData>>(); // Original array formula cell data.

                if (this._arrayFormulaCellData[unitId]?.[sheetId] != null) {
                    arrayFormulaCellMatrixData = new ObjectMatrix<Nullable<ICellData>>(
                        this._arrayFormulaCellData[unitId]?.[sheetId]
                    );
                }

                clearCellMatrixData.forValue((row, column) => {
                    const range = rangeMatrix?.[row]?.[column];
                    if (range == null) {
                        return true;
                    }
                    const { startRow, startColumn, endRow, endColumn } = range;
                    for (let r = startRow; r <= endRow; r++) {
                        for (let c = startColumn; c <= endColumn; c++) {
                            arrayFormulaCellMatrixData.setValue(r, c, null);
                        }
                    }
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

                let arrayFormulaRangeMatrix = new ObjectMatrix<IRange>(); // Original array formula range.

                let arrayFormulaCellMatrixData = new ObjectMatrix<Nullable<ICellData>>(); // Original array formula cell data.

                if (this._arrayFormulaRange[unitId]?.[sheetId] != null) {
                    arrayFormulaRangeMatrix = new ObjectMatrix<IRange>(this._arrayFormulaRange[unitId]?.[sheetId]);
                }

                if (this._arrayFormulaCellData[unitId]?.[sheetId] != null) {
                    arrayFormulaCellMatrixData = new ObjectMatrix<Nullable<ICellData>>(
                        this._arrayFormulaCellData[unitId]?.[sheetId]
                    );
                }

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

    getFormulaData() {
        return this._formulaData;
    }

    setFormulaData(value: IFormulaData) {
        this._formulaData = value;
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

    getNumfmtItemMap() {
        return this._numfmtItemMap;
    }

    getNumfmtValue(unitId: string, sheetId: string, row: number, column: number) {
        return this._numfmtItemMap[unitId]?.[sheetId]?.[row]?.[column];
    }

    setNumfmtItemMap(value: INumfmtItemMap) {
        this._numfmtItemMap = value;
    }

    updateNumfmtItemMap(value: INumfmtItemMap) {
        Object.keys(value).forEach((unitId) => {
            const sheetData = value[unitId];

            if (sheetData == null) {
                return true;
            }

            if (this._numfmtItemMap[unitId] == null) {
                this._numfmtItemMap[unitId] = {};
            }

            Object.keys(sheetData).forEach((sheetId) => {
                const numfmtItemMap = sheetData[sheetId];
                const numfmtItemMatrix = new ObjectMatrix(numfmtItemMap);

                if (this._numfmtItemMap[unitId]![sheetId] == null) {
                    this._numfmtItemMap[unitId]![sheetId] = {};
                }

                numfmtItemMatrix.forValue((r, c, numfmtItem) => {
                    if (this._numfmtItemMap[unitId]![sheetId][r] == null) {
                        this._numfmtItemMap[unitId]![sheetId][r] = {};
                    }

                    this._numfmtItemMap[unitId]![sheetId][r][c] = numfmtItem;
                });
            });
        });
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

                let rangeMatrix = new ObjectMatrix<IRange>();

                if (this._arrayFormulaRange[unitId]?.[sheetId]) {
                    rangeMatrix = new ObjectMatrix(this._arrayFormulaRange[unitId]?.[sheetId]);
                }

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

    initFormulaData() {
        // load formula data from workbook config data

        const unitFile = this._currentUniverService.getAllUniverSheetsInstance();
        if (unitFile.length === 0) {
            return;
        }
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        this._formulaData[unitId] = {};

        const worksheets = workbook.getSheets();
        worksheets.forEach((worksheet) => {
            const cellMatrix = worksheet.getCellMatrix();
            const sheetId = worksheet.getSheetId();

            initSheetFormulaData(this._formulaData, unitId, sheetId, cellMatrix);
        });
    }

    getCalculateData() {
        const unitAllSheet = this._currentUniverService.getAllUniverSheetsInstance();

        const allUnitData: IUnitData = {};

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
                };
                sheetNameMap[sheet.getName()] = sheet.getSheetId();
            }

            allUnitData[unitId] = sheetData;

            unitSheetNameMap[unitId] = sheetNameMap;
        }

        return {
            allUnitData,
            unitSheetNameMap,
        };
    }

    updateFormulaData(unitId: string, sheetId: string, cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>) {
        const cellMatrix = new ObjectMatrix(cellValue);

        const formulaIdMap = this.getFormulaIdMap(unitId, sheetId); // Connect the formula and ID
        const deleteFormulaIdMap = new Map<string, string | IFormulaIdMap>();

        const formulaData = this._formulaData;
        if (formulaData[unitId] == null) {
            formulaData[unitId] = {};
        }
        const workbookFormulaData = formulaData[unitId]!;

        if (workbookFormulaData[sheetId] == null) {
            workbookFormulaData[sheetId] = {};
        }

        const sheetFormulaDataMatrix = new ObjectMatrix<IFormulaDataItem>(workbookFormulaData[sheetId]);

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
            } else if (!checkFormulaString && !checkFormulaId && sheetFormulaDataMatrix.getValue(r, c)) {
                const currentFormulaInfo = sheetFormulaDataMatrix.getValue(r, c);
                const f = currentFormulaInfo?.f || '';
                const si = currentFormulaInfo?.si || '';

                // The id that needs to be offset
                if (isFormulaString(f) && isFormulaId(si)) {
                    deleteFormulaIdMap.set(si, f);
                }

                sheetFormulaDataMatrix.realDeleteValue(r, c);
            }
        });

        // Convert the formula ID to formula string
        sheetFormulaDataMatrix.forValue((r, c, cell) => {
            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';

            if (isFormulaId(formulaId)) {
                const formulaInfo = formulaIdMap.get(formulaId);
                const deleteFormula = deleteFormulaIdMap.get(formulaId);

                if (formulaInfo && !isFormulaString(formulaString)) {
                    const f = formulaInfo.f;
                    const x = c - formulaInfo.c;
                    const y = r - formulaInfo.r;
                    sheetFormulaDataMatrix.setValue(r, c, { f, si: formulaId, x, y });
                } else if (typeof deleteFormula === 'string') {
                    const x = cell.x || 0;
                    const y = cell.y || 0;
                    const offsetFormula = this._lexerTreeBuilder.moveFormulaRefOffset(deleteFormula, x, y);
                    deleteFormulaIdMap.set(formulaId, {
                        r,
                        c,
                        f: offsetFormula,
                    });

                    sheetFormulaDataMatrix.setValue(r, c, { f: offsetFormula, si: formulaId });
                } else if (typeof deleteFormula === 'object') {
                    const x = c - deleteFormula.c;
                    const y = r - deleteFormula.r;
                    sheetFormulaDataMatrix.setValue(r, c, {
                        f: deleteFormula.f,
                        si: formulaId,
                        x,
                        y,
                    });
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

        if (!arrayFormulaRange) return;

        const arrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange);

        const cellMatrix = new ObjectMatrix(cellValue);
        cellMatrix.forValue((r, c, cell) => {
            const arrayFormulaRangeValue = arrayFormulaRangeMatrix?.getValue(r, c);
            if (arrayFormulaRangeValue == null) {
                return true;
            }

            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';

            const checkFormulaString = isFormulaString(formulaString);
            const checkFormulaId = isFormulaId(formulaId);

            if (!checkFormulaString && !checkFormulaId) {
                arrayFormulaRangeMatrix.realDeleteValue(r, c);
            }
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
            const arrayFormulaRangeValue = arrayFormulaRangeMatrix?.getValue(r, c);
            if (arrayFormulaRangeValue == null) {
                return true;
            }

            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';

            const checkFormulaString = isFormulaString(formulaString);
            const checkFormulaId = isFormulaId(formulaId);

            if (!checkFormulaString && !checkFormulaId) {
                const { startRow, startColumn, endRow, endColumn } = arrayFormulaRangeValue;
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        arrayFormulaCellDataMatrix.realDeleteValue(r, c);
                    }
                }
            }
        });
    }

    updateNumfmtData(
        unitId: string,
        sheetId: string,
        cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>
    ) {
        // remove the array formula range when cell value is null

        const arrayFormulaRange = this._arrayFormulaRange[unitId]?.[sheetId];
        const arrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange);

        const numfmtData = this._numfmtItemMap[unitId]?.[sheetId];

        if (!numfmtData) return;

        const numfmtDataMatrix = new ObjectMatrix(numfmtData);

        const cellMatrix = new ObjectMatrix(cellValue);
        cellMatrix.forValue((r, c, cell) => {
            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';

            const checkFormulaString = isFormulaString(formulaString);
            const checkFormulaId = isFormulaId(formulaId);

            if (!checkFormulaString && !checkFormulaId) {
                numfmtDataMatrix.setValue(r, c, null);

                const arrayFormulaRangeValue = arrayFormulaRangeMatrix.getValue(r, c);
                if (arrayFormulaRangeValue) {
                    const { startRow, startColumn, endRow, endColumn } = arrayFormulaRangeValue;
                    for (let row = startRow; row <= endRow; row++) {
                        for (let column = startColumn; column <= endColumn; column++) {
                            numfmtDataMatrix.setValue(row, column, null);
                        }
                    }
                }
            }
        });
    }

    getFormulaItemBySId(sId: string, sheetId: string, unitId: string): Nullable<IFormulaDataItem> {
        const formulaData = this._formulaData;
        if (formulaData[unitId] == null) {
            return null;
        }
        const workbookFormulaData = formulaData[unitId];

        if (workbookFormulaData?.[sheetId] == null) {
            return null;
        }

        const cellMatrix = new ObjectMatrix(workbookFormulaData[sheetId]);

        let formulaDataItem: Nullable<IFormulaDataItem> = null;

        cellMatrix.forValue((row, column, item) => {
            const { f, si, x = 0, y = 0 } = item;

            if (si === sId && f.length > 0 && x === 0 && y === 0) {
                formulaDataItem = item;
                return false;
            }
        });

        return formulaDataItem;
    }

    getFormulaDataItem(row: number, column: number, sheetId: string, unitId: string) {
        return this._formulaData?.[unitId]?.[sheetId]?.[row]?.[column];
    }

    getFormulaIdMap(unitId: string, sheetId: string): Map<string, IFormulaIdMap> {
        const formulaIdMap = new Map<string, IFormulaIdMap>(); // Connect the formula and ID

        const formulaData = this._formulaData;
        if (formulaData[unitId] == null) {
            return formulaIdMap;
        }
        const workbookFormulaData = formulaData[unitId];

        if (workbookFormulaData?.[sheetId] == null) {
            return formulaIdMap;
        }

        const sheetFormulaDataMatrix = new ObjectMatrix(workbookFormulaData[sheetId]);

        sheetFormulaDataMatrix.forValue((r, c, cell) => {
            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';
            const x = cell?.x || 0;
            const y = cell?.y || 0;

            if (isFormulaString(formulaString) && isFormulaId(formulaId) && x === 0 && y === 0) {
                formulaIdMap.set(formulaId, { f: formulaString, r, c });
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
) {
    const formulaIdMap = new Map<string, { f: string; r: number; c: number }>(); // Connect the formula and ID
    const sheetFormulaDataMatrix = new ObjectMatrix<IFormulaDataItem>();
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
            }
        }
    });

    if (formulaData[unitId]) {
        formulaData[unitId]![sheetId] = sheetFormulaDataMatrix.getData();
    }
}
