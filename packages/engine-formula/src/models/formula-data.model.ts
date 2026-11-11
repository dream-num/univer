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
import { BooleanNumber, CellValueType, createBaseFormulaTableNameMap, Disposable, getBaseFormulaTableName, Inject, isFormulaId, isFormulaString, IUniverInstanceService, ObjectMatrix, RANGE_TYPE, Styles, UniverInstanceType } from '@univerjs/core';
import type {
    IArrayFormulaRangeType,
    IArrayFormulaUnitCellType,
    IFormulaData,
    IFormulaDataItem,
    IFormulaIdMap,
    IFormulaIdMapData,
    IFormulaUnitNameMap,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitData,
    IUnitImageFormulaDataType,
    IUnitRowData,
    IUnitSheetNameMap,
    IUnitStylesData,
} from '../basics/common';
import type { IImageFormulaInfo } from '../engine/value-object/primitive-object';
import type { ICircularReference } from '../services/runtime.service';
import type { IFormulaDataSnapshot } from './formula-data-snapshot';
import { copyUnitData } from '../basics/runtime';
import { LexerTreeBuilder } from '../engine/analysis/lexer-tree-builder';
import { deserializeRangeWithSheet } from '../engine/utils/reference';
import { clearArrayFormulaCellDataByCell, updateFormulaDataByCellValue } from './utils/formula-data-util';

export interface IRangeChange {
    oldCell: IRange;
    newCell: IRange | null;
}

const COMPACT_FORMULA_CHUNK_SIZE = 4096;
const SNAPSHOT_OUTPUT_METHODS = [
    'getMatrix',
    'forValue',
    'setValue',
    'getRowOrCreate',
    'getRow',
    'realDeleteValue',
    '_setOriginValue',
].map((name) => [name, Object.getOwnPropertyDescriptor(ObjectMatrix.prototype, name)?.value] as const);

interface ICompactFormulaChunk {
    coordinates: Uint32Array;
    /** Own formula text; '' for shared-formula followers. */
    formulas: string[];
    /** Shared-formula id per entry, created with the chunk's first shared-formula cell. */
    formulaIds?: Array<string | undefined>;
    /**
     * The sheet's formula id map once it is complete. Followers resolve against it to the same
     * `{ f, si, x, y }` items the object path writes; before that they keep the object path's raw shape.
     */
    formulaIdMap?: Record<string, IFormulaIdMap>;
}

type CompactFormulaData = Record<string, Record<string, ICompactFormulaChunk[]>>;

function materializeCompactFormulaSheet(
    chunks: ICompactFormulaChunk[],
    matrix: IObjectMatrixPrimitiveType<Nullable<IFormulaDataItem>>
): void {
    let previousRow: number | undefined;
    let row: Record<number, Nullable<IFormulaDataItem>> | undefined;
    // Numeric coordinates retain their enumeration order while consumed chunks can be released.
    while (chunks.length > 0) {
        const chunk = chunks.pop()!;
        for (let index = chunk.formulas.length - 1; index >= 0; index--) {
            const rowNumber = chunk.coordinates[index * 2];
            const column = chunk.coordinates[index * 2 + 1];
            const item = compactFormulaItem(chunk, index, rowNumber, column);
            // A follower without its shared formula is dropped, as the object path deletes it.
            if (!item) continue;
            if (previousRow !== rowNumber) {
                if (row) Object.setPrototypeOf(row, Object.prototype);
                row = Object.create(null);
                matrix[rowNumber] = row!;
                previousRow = rowNumber;
            }
            row![column] = item;
        }
    }
    // Captured coordinates were own data properties before any later prototype setters.
    if (row) Object.setPrototypeOf(row, Object.prototype);
}

function compactFormulaItem(
    chunk: ICompactFormulaChunk,
    index: number,
    row: number,
    column: number
): Nullable<IFormulaDataItem> {
    const f = chunk.formulas[index];
    const si = chunk.formulaIds?.[index];
    if (si === undefined) return { f };
    if (f !== '') return { f, si };
    const formulaIdMap = chunk.formulaIdMap;
    if (!formulaIdMap) return { f: '', si };
    const formulaInfo = formulaIdMap[si];
    return formulaInfo ? { f: formulaInfo.f, si, x: column - formulaInfo.c, y: row - formulaInfo.r } : null;
}

class CompactFormulaDataSnapshot implements IFormulaDataSnapshot {
    constructor(
        private _data: IFormulaData,
        private _compactData: CompactFormulaData | undefined
    ) {}

    materialize(): IFormulaData {
        const compactData = this._compactData;
        if (compactData) {
            for (const unitId in compactData) {
                for (const sheetId in compactData[unitId]) {
                    materializeCompactFormulaSheet(compactData[unitId][sheetId], this._data[unitId]![sheetId]!);
                }
            }
            this._compactData = undefined;
        }
        return this._data;
    }
}

function supportsCompactFormulaSnapshot(model: FormulaDataModel, isProxy?: (value: unknown) => boolean): boolean {
    if (
        isProxy?.(model) || Object.getPrototypeOf(model) !== FormulaDataModel.prototype ||
        Object.getPrototypeOf(ObjectMatrix.prototype) !== Object.prototype
    ) {
        return false;
    }
    for (let index = 0; index < SNAPSHOT_MODEL_METHODS.length; index++) {
        const name = SNAPSHOT_MODEL_METHODS[index][0];
        const method = SNAPSHOT_MODEL_METHODS[index][1];
        if (
            typeof method !== 'function' || Object.prototype.hasOwnProperty.call(model, name) ||
            Object.getOwnPropertyDescriptor(FormulaDataModel.prototype, name)?.value !== method
        ) {
            return false;
        }
    }
    // Compact output replaces ordinary DTO writes, not customized output-matrix behavior.
    for (let index = 0; index < SNAPSHOT_OUTPUT_METHODS.length; index++) {
        const name = SNAPSHOT_OUTPUT_METHODS[index][0];
        const method = SNAPSHOT_OUTPUT_METHODS[index][1];
        if (typeof method !== 'function' || Object.getOwnPropertyDescriptor(ObjectMatrix.prototype, name)?.value !== method) return false;
    }
    const prototypeKeys = Object.getOwnPropertyNames(Object.prototype);
    for (let index = 0; index < prototypeKeys.length; index++) {
        const key = prototypeKeys[index];
        if (
            !Number.isNaN(Number(key)) || key === 'f' || key === 'si' ||
            Object.getOwnPropertyDescriptor(Object.prototype, key)?.enumerable
        ) {
            return false;
        }
    }
    return true;
}

export class FormulaDataModel extends Disposable {
    private _circularReferences = new Map<string, ICircularReference>();

    private _formulaIdMapData: IFormulaIdMapData = Object.create(null);

    private _arrayFormulaRange: IArrayFormulaRangeType = Object.create(null);

    private _arrayFormulaCellData: IArrayFormulaUnitCellType = Object.create(null);

    private _unitImageFormulaData: IUnitImageFormulaDataType = Object.create(null);

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();

        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
                for (const [key, cell] of this._circularReferences) {
                    if (cell.unitId === workbook.getUnitId()) {
                        this._circularReferences.delete(key);
                    }
                }
            })
        );
    }

    override dispose() {
        super.dispose();
        this._circularReferences.clear();
        this._formulaIdMapData = Object.create(null);
        this._arrayFormulaRange = Object.create(null);
        this._arrayFormulaCellData = Object.create(null);
        this._unitImageFormulaData = Object.create(null);
    }

    setCircularReferences(cells: ICircularReference[]): void {
        this._circularReferences.clear();
        for (const cell of cells) {
            this._circularReferences.set(JSON.stringify([cell.unitId, cell.sheetId, cell.row, cell.column]), { ...cell });
        }
    }

    getCircularReferences(unitId: string): ICircularReference[] {
        return Array.from(this._circularReferences.values())
            .filter((cell) => cell.unitId === unitId)
            .map((cell) => ({ ...cell }));
    }

    isCircularReference(unitId: string, sheetId: string, row: number, column: number): boolean {
        return this._circularReferences.has(JSON.stringify([unitId, sheetId, row, column]));
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
                    this._arrayFormulaCellData[unitId]![sheetId] = arrayFormulaCellMatrixData.clone();
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
                this._arrayFormulaRange[unitId] = Object.create(null);
            }

            if (this._arrayFormulaCellData[unitId] == null) {
                this._arrayFormulaCellData[unitId] = Object.create(null);
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
                    this._arrayFormulaCellData[unitId]![sheetId] = arrayFormulaCellMatrixData.clone();
                }
            });
        });
    }

    getFormulaData(): IFormulaData {
        return this._collectFormulaData();
    }

    private _collectFormulaData(compactData?: CompactFormulaData): IFormulaData {
        const formulaData: IFormulaData = Object.create(null);
        const allSheets = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        for (let i = 0; i < allSheets.length; i++) {
            const workbook = allSheets[i];
            const unitId = workbook.getUnitId();
            formulaData[unitId] = Object.create(null);
            if (compactData) compactData[unitId] = Object.create(null);

            const worksheets = workbook.getSheets();
            for (let j = 0; j < worksheets.length; j++) {
                const worksheet = worksheets[j];
                const cellMatrix = worksheet.getCellMatrix();
                const sheetId = worksheet.getSheetId();

                const previousChunks = compactData?.[unitId][sheetId];
                if (previousChunks) {
                    materializeCompactFormulaSheet(previousChunks, formulaData[unitId]![sheetId]!);
                    delete compactData![unitId][sheetId];
                }
                this._initSheetArrayFormulaData(unitId, sheetId, cellMatrix);
                if (compactData) {
                    const compact = !Object.prototype.hasOwnProperty.call(formulaData[unitId]!, sheetId);
                    const result = buildSheetFormulaData(formulaData, unitId, sheetId, cellMatrix, compact);
                    this._formulaIdMapData[unitId] ??= Object.create(null);
                    this._formulaIdMapData[unitId]![sheetId] = result.formulaIdMap;
                    if (result.compactChunks) {
                        compactData[unitId][sheetId] = result.compactChunks;
                    } else {
                        delete compactData[unitId][sheetId];
                    }
                } else {
                    this.initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);
                }
            }
        }

        const allBases = this._univerInstanceService.getAllUnitsForType<BaseDataModel>(UniverInstanceType.UNIVER_BASE);
        for (let i = 0; i < allBases.length; i++) {
            const base = allBases[i];
            const snapshot = base.getSnapshot();
            const unitId = base.getUnitId();
            formulaData[unitId] = Object.create(null);
            if (compactData) delete compactData[unitId];

            const tables = Object.values(snapshot.tables);
            const formulaTableNames = createBaseFormulaTableNameMap(snapshot);
            for (let j = 0; j < tables.length; j++) {
                const table = tables[j];
                const tableFormulaData: Record<number, Record<number, IFormulaDataItem>> = Object.create(null);
                const normalizedFormulaByFieldId = new Map<string, string>();
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
                        let normalizedFormula = normalizedFormulaByFieldId.get(field.id);
                        if (normalizedFormula == null) {
                            normalizedFormula = normalizeBaseFormulaForEngine(formula, table, snapshot, formulaTableNames);
                            normalizedFormulaByFieldId.set(field.id, normalizedFormula);
                        }
                        tableFormulaData[row] ??= Object.create(null);
                        tableFormulaData[row][col] = {
                            f: normalizedFormula,
                            si: field.id,
                        };
                    }
                }
                formulaData[unitId]![table.id] = tableFormulaData;
            }
        }

        return formulaData;
    }

    /**
     * Internal calculation-engine capture; customized model methods retain the eager DTO path.
     * Reuse ordinary model traversal and metadata preparation, deferring per-formula DTO objects where possible.
     * The optional classifier is retained for cooperating engines that reject a proxied model before capture.
     */
    tryCreateFormulaDataSnapshot(isProxy?: (value: unknown) => boolean): IFormulaDataSnapshot | undefined {
        if (!supportsCompactFormulaSnapshot(this, isProxy)) return undefined;
        const compactData: CompactFormulaData = Object.create(null);
        const formulaData = this._collectFormulaData(compactData);
        return new CompactFormulaDataSnapshot(formulaData, compactData);
    }

    initSheetFormulaData(
        formulaData: IFormulaData,
        unitId: string,
        sheetId: string,
        cellMatrix: ObjectMatrix<Nullable<ICellData>>
    ): IFormulaData {
        const result = buildSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

        if (!this._formulaIdMapData[unitId]) {
            this._formulaIdMapData[unitId] = Object.create(null);
        }
        this._formulaIdMapData[unitId]![sheetId] = result.formulaIdMap;

        return result.formulaData;
    }

    clearFormulaIdMap(unitId: string, sheetId?: string) {
        if (sheetId == null) {
            delete this._formulaIdMapData[unitId];
            return;
        }

        const unitFormulaIdMap = this._formulaIdMapData[unitId];
        if (!unitFormulaIdMap) {
            return;
        }

        delete unitFormulaIdMap[sheetId];
        if (Object.keys(unitFormulaIdMap).length === 0) {
            delete this._formulaIdMapData[unitId];
        }
    }

    getSheetFormulaData(unitId: string, sheetId: string) {
        const formulaData: IFormulaData = Object.create(null);
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
        if (workbook == null) {
            return {};
        }

        formulaData[unitId] = Object.create(null);

        const worksheet = workbook.getSheetBySheetId(sheetId);
        if (worksheet == null) {
            return {};
        }

        const cellMatrix = worksheet.getCellMatrix();

        this._initSheetArrayFormulaData(unitId, sheetId, cellMatrix);
        this.initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

        return formulaData[unitId]![sheetId];
    }

    getArrayFormulaRange(): IArrayFormulaRangeType {
        return this._arrayFormulaRange;
    }

    setArrayFormulaRange(value: IArrayFormulaRangeType) {
        this._arrayFormulaRange = copyUnitData(value);
    }

    getArrayFormulaCellData() {
        return this._arrayFormulaCellData;
    }

    setArrayFormulaCellData(value: IArrayFormulaUnitCellType) {
        this._arrayFormulaCellData = copyUnitData(value);
    }

    getUnitImageFormulaData() {
        return this._unitImageFormulaData;
    }

    setUnitImageFormulaData(value: IUnitImageFormulaDataType) {
        this._unitImageFormulaData = copyUnitData(value);
    }

    mergeArrayFormulaRange(formulaData: IArrayFormulaRangeType) {
        Object.keys(formulaData).forEach((unitId) => {
            const sheetData = formulaData[unitId];

            if (sheetData == null) {
                return true;
            }

            if (!this._arrayFormulaRange[unitId]) {
                this._arrayFormulaRange[unitId] = Object.create(null);
            }

            Object.keys(sheetData).forEach((sheetId) => {
                const arrayFormula = new ObjectMatrix(sheetData[sheetId]);
                const rangeMatrix = new ObjectMatrix(this._arrayFormulaRange[unitId]?.[sheetId]);

                arrayFormula.forValue((r, c, v) => {
                    rangeMatrix.setValue(r, c, v);
                });

                if (this._arrayFormulaRange[unitId]) {
                    this._arrayFormulaRange[unitId]![sheetId] = rangeMatrix.clone();
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
                this._unitImageFormulaData[unitId] = Object.create(null);
            }

            const sheetIds = Object.keys(sheetData);

            for (let j = 0; j < sheetIds.length; j++) {
                const sheetId = sheetIds[j];

                const imageFormulaMatrix = sheetData[sheetId];
                if (!imageFormulaMatrix) continue;

                if (!this._unitImageFormulaData[unitId]![sheetId]) {
                    this._unitImageFormulaData[unitId]![sheetId] = new ObjectMatrix<Nullable<IImageFormulaInfo>>();
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
                this._arrayFormulaRange[unitId]![sheetId] = rangeMatrixData.clone();
            }
        }
    }

    getCalculateData() {
        const unitAllSheet = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);

        const allUnitData: IUnitData = Object.create(null);

        const unitStylesData: IUnitStylesData = Object.create(null);

        const unitSheetNameMap: IUnitSheetNameMap = Object.create(null);

        const unitNameMap: IFormulaUnitNameMap = Object.create(null);

        for (const workbook of unitAllSheet) {
            const unitId = workbook.getUnitId();

            unitNameMap[unitId] = {
                name: workbook.name,
                unitType: UniverInstanceType.UNIVER_SHEET,
            };

            const sheets = workbook.getSheets();

            const sheetData: ISheetData = Object.create(null);

            const sheetNameMap: { [sheetName: string]: string } = Object.create(null);

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
            unitNameMap[unitId] = {
                name: snapshot.name,
                unitType: UniverInstanceType.UNIVER_BASE,
            };
            const baseData: ISheetData = Object.create(null);
            const tableNameMap: { [tableName: string]: string } = Object.create(null);
            const formulaTableNames = createBaseFormulaTableNameMap(snapshot);

            for (const table of Object.values(snapshot.tables)) {
                baseData[table.id] = {
                    cellData: new ObjectMatrix(buildBaseRuntimeCellData(table)) as unknown as ObjectMatrix<ICellData>,
                    rowCount: table.recordOrder?.length ?? 0,
                    columnCount: table.fieldOrder.length,
                    rowData: {},
                    columnData: {},
                };
                addEngineBaseTableNameMappings(tableNameMap, table, formulaTableNames);
            }

            allUnitData[unitId] = baseData;
            unitStylesData[unitId] = new Styles();
            unitSheetNameMap[unitId] = tableNameMap;
        }

        return {
            allUnitData,
            unitStylesData,
            unitSheetNameMap,
            unitNameMap,
        };
    }

    /**
     * Get the hidden rows that are filtered or manually hidden.
     *
     * For formulas that are sensitive to hidden rows.
     */
    getHiddenRowsFiltered() {
        const unitAllSheet = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const rowData: IUnitRowData = Object.create(null);

        for (const workbook of unitAllSheet) {
            const unitId = workbook.getUnitId();
            const sheets = workbook.getSheets();
            rowData[unitId] = Object.create(null);

            for (const sheet of sheets) {
                const sheetId = sheet.getSheetId();
                rowData[unitId]![sheetId] = Object.create(null);

                const startRow = 0;
                const endRow = sheet.getRowCount() - 1;
                const sheetRowData: IObjectArrayPrimitiveType<Partial<IRowData> & { filtered?: boolean }> = Object.create(null);

                for (let i = startRow; i <= endRow; i++) {
                    if (!sheet.getRowVisible(i)) {
                        sheetRowData[i] = {
                            hd: BooleanNumber.TRUE,
                            ...(sheet.getRowFiltered(i) ? { filtered: true } : {}),
                        };
                    }
                }

                rowData[unitId]![sheetId] = sheetRowData;
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

        const formulaIdMap: { [formulaId: string]: IFormulaIdMap } = Object.create(null);
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

        const formulaData = buildSheetFormulaData({}, unitId, sheetId, sharedFormulaCellMatrix).formulaData;
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
            this._arrayFormulaRange[unitId]![sheetId] = arrayFormulaRangeMatrix.clone();
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
            this._arrayFormulaCellData[unitId]![sheetId] = arrayFormulaCellDataMatrix.clone();
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
            let formulaIdMap = this._formulaIdMapData[unitId]?.[sheetId];
            let formulaInfo = formulaIdMap?.[String(si)];
            const masterCell = formulaInfo == null ? null : cellMatrix.getValue(formulaInfo.r, formulaInfo.c);

            if (formulaInfo == null || masterCell?.si !== si || masterCell?.f !== formulaInfo.f) {
                this.initSheetFormulaData({}, unitId, sheetId, cellMatrix);
                formulaIdMap = this._formulaIdMapData[unitId]?.[sheetId];
                formulaInfo = formulaIdMap?.[String(si)];
            }

            if (!formulaInfo) {
                return null;
            }

            return this._lexerTreeBuilder.moveFormulaRefOffset(
                formulaInfo.f,
                column - formulaInfo.c,
                row - formulaInfo.r
            );
        }

        return null;
    }

    /**
     * Function to get all formula ranges
     * @returns
     */
    getFormulaDirtyRanges(): IUnitRange[] {
        // Customized models keep their formula DTO authoritative.
        if (!supportsCompactFormulaSnapshot(this)) {
            return this._getFormulaDirtyRangesFromData(this.getFormulaData());
        }

        const dirtyRanges: IUnitRange[] = [];
        const workbooks = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        for (let i = 0; i < workbooks.length; i++) {
            const workbook = workbooks[i];
            const unitId = workbook.getUnitId();
            const worksheets = workbook.getSheets();
            for (let j = 0; j < worksheets.length; j++) {
                const worksheet = worksheets[j];
                const sheetId = worksheet.getSheetId();
                const cellMatrix = worksheet.getCellMatrix();

                const formulaIdMap: Record<string, IFormulaIdMap> = Object.create(null);
                // Resolve followers against all anchors, including anchors after their followers.
                this._initSheetArrayFormulaData(unitId, sheetId, cellMatrix, formulaIdMap);
                const columnRanges: IColumnRowRanges = Object.create(null);
                cellMatrix.forValue((row, column, cell) => {
                    const formulaString = cell?.f || '';
                    const formulaId = cell?.si || '';
                    const checkFormulaString = isFormulaString(formulaString);
                    const hasSharedAnchor = isFormulaId(formulaId) && formulaIdMap[formulaId] !== undefined;
                    if (!(checkFormulaString || hasSharedAnchor) || (cell?.v !== undefined && cell?.v !== null)) {
                        return;
                    }
                    pushContinuousRow(columnRanges, row, column);
                });
                if (!this._formulaIdMapData[unitId]) {
                    this._formulaIdMapData[unitId] = Object.create(null);
                }
                this._formulaIdMapData[unitId]![sheetId] = formulaIdMap;
                pushColumnDirtyRanges(dirtyRanges, unitId, sheetId, columnRanges);
            }
        }

        return dirtyRanges;
    }

    private _getFormulaDirtyRangesFromData(formulaData: IFormulaData): IUnitRange[] {
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
                const columnRanges: IColumnRowRanges = Object.create(null);

                for (const rowStr of Object.keys(sheet)) {
                    const row = Number(rowStr);

                    for (const columnStr in sheet[row]) {
                        const column = Number(columnStr);

                        const currentCell = sheetInstance.getCellRaw(row, column);

                        // Calculation is only required when there is only a formula and no value
                        const isFormula = isFormulaString(currentCell?.f) || isFormulaId(currentCell?.si);
                        const noValue = currentCell?.v === undefined || currentCell?.v === null;

                        if (!(isFormula && noValue)) continue;

                        pushContinuousRow(columnRanges, row, column);
                    }
                }

                pushColumnDirtyRanges(dirtyRanges, unitId, sheetId, columnRanges);
            }
        }

        return dirtyRanges;
    }

    private _initSheetArrayFormulaData(
        unitId: string,
        sheetId: string,
        cellMatrix: ObjectMatrix<Nullable<ICellData>>,
        formulaIdMap?: Record<string, IFormulaIdMap>
    ) {
        let arrayFormulaRangeMatrix: Nullable<ObjectMatrix<IRange>>;
        let arrayFormulaCellDataMatrix: Nullable<ObjectMatrix<Nullable<ICellData>>>;
        const formulaIds = new Set<string>();

        cellMatrix.forValue((row, column, cell) => {
            const formulaId = cell?.si;
            const formula = cell?.f;
            if (isFormulaString(formula) && isFormulaId(formulaId)) {
                const id = String(formulaId);
                formulaIds.add(id);
                if (formulaIdMap) formulaIdMap[id] = { f: formula!, r: row, c: column };
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
                this._arrayFormulaRange[unitId] = Object.create(null);
            }
            if (!this._arrayFormulaCellData[unitId]) {
                this._arrayFormulaCellData[unitId] = Object.create(null);
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
            this._arrayFormulaRange[unitId]![sheetId] = arrayFormulaRangeMatrix.clone();
        }
        if (arrayFormulaCellDataMatrix && this._arrayFormulaCellData[unitId]) {
            this._arrayFormulaCellData[unitId]![sheetId] = arrayFormulaCellDataMatrix.clone();
        }
    }
}

const SNAPSHOT_MODEL_METHODS = ['getFormulaData', 'initSheetFormulaData', '_initSheetArrayFormulaData'].map((name) =>
    [name, Object.getOwnPropertyDescriptor(FormulaDataModel.prototype, name)?.value] as const
);

interface IColumnRowRanges {
    [column: number]: { startRow: number; endRow: number }[];
}

function pushContinuousRow(columnRanges: IColumnRowRanges, row: number, column: number): void {
    if (!columnRanges[column]) {
        columnRanges[column] = [];
    }

    const ranges = columnRanges[column];
    const lastRange = ranges[ranges.length - 1];

    // Extend the previous range when this row continues it; otherwise start a new range.
    if (lastRange && lastRange.endRow === row - 1) {
        lastRange.endRow = row;
    } else {
        ranges.push({ startRow: row, endRow: row });
    }
}

function pushColumnDirtyRanges(dirtyRanges: IUnitRange[], unitId: string, sheetId: string, columnRanges: IColumnRowRanges): void {
    for (const column in columnRanges) {
        const ranges = columnRanges[column];
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
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

function buildSheetFormulaData(
    formulaData: IFormulaData,
    unitId: string,
    sheetId: string,
    cellMatrix: ObjectMatrix<Nullable<ICellData>>,
    compact = false
) {
    const unitData = Object.assign(
        Object.create(null),
        Object.prototype.hasOwnProperty.call(formulaData, unitId) ? formulaData[unitId] : undefined
    );
    Object.defineProperty(formulaData, unitId, { value: unitData, writable: true, configurable: true, enumerable: true });
    if (!unitData[sheetId]) {
        unitData[sheetId] = Object.create(null);
    }

    const formulaIdMap: Record<string, IFormulaIdMap> = Object.create(null); // Connect the formula and ID
    const sheetFormulaDataMatrix = new ObjectMatrix<Nullable<IFormulaDataItem>>(unitData[sheetId]);
    let compactChunks: ICompactFormulaChunk[] | undefined = compact ? [] : undefined;
    let previousRow = -1;
    let previousColumn = -1;

    cellMatrix.forValue((r, c, cell) => {
        const formulaString = cell?.f || '';
        const formulaId = cell?.si || '';

        const checkFormulaString = isFormulaString(formulaString);
        const checkFormulaId = isFormulaId(formulaId);

        if (compactChunks) {
            const ordinaryFormula = typeof formulaString === 'string' && formulaId === '';
            // Shared formulas: the anchor keeps its text, followers resolve against the formula id map.
            const sharedFormula = typeof formulaString === 'string' && typeof formulaId === 'string' && checkFormulaId;
            const orderedCoordinates = r > previousRow || (r === previousRow && c > previousColumn);
            if (
                (ordinaryFormula || sharedFormula) && orderedCoordinates &&
                Number.isInteger(r) && r >= 0 && r <= 0xFFFF_FFFF &&
                Number.isInteger(c) && c >= 0 && c <= 0xFFFF_FFFF
            ) {
                previousRow = r;
                previousColumn = c;
                if (sharedFormula || checkFormulaString) {
                    let chunk = compactChunks[compactChunks.length - 1];
                    if (!chunk || chunk.formulas.length * 2 === chunk.coordinates.length) {
                        const size = compactChunks.length === 0 ? 128 : COMPACT_FORMULA_CHUNK_SIZE;
                        chunk = { coordinates: new Uint32Array(size * 2), formulas: [] };
                        compactChunks.push(chunk);
                    }
                    const index = chunk.formulas.length;
                    chunk.coordinates[index * 2] = r;
                    chunk.coordinates[index * 2 + 1] = c;
                    if (sharedFormula) {
                        chunk.formulas.push(checkFormulaString ? formulaString : '');
                        (chunk.formulaIds ??= [])[index] = formulaId;
                        if (checkFormulaString) formulaIdMap[formulaId] = { f: formulaString, r, c };
                    } else {
                        chunk.formulas.push(formulaString);
                    }
                }
                return;
            }
            // Continue from captured values; rereading the source would repeat getters and callbacks.
            materializeCompactFormulaSheet(compactChunks, sheetFormulaDataMatrix.getMatrix());
            compactChunks = undefined;
        }

        if (checkFormulaString && checkFormulaId) {
            sheetFormulaDataMatrix.setValue(r, c, { f: formulaString, si: formulaId });
            const formulaInfo = { f: formulaString, r, c };
            formulaIdMap[formulaId] = formulaInfo;
        } else if (checkFormulaString && !checkFormulaId) {
            sheetFormulaDataMatrix.setValue(r, c, { f: formulaString });
        } else if (!checkFormulaString && checkFormulaId) {
            sheetFormulaDataMatrix.setValue(r, c, { f: '', si: formulaId });
        }
    });

    if (
        compactChunks &&
        (Object.getPrototypeOf(String.prototype) !== Object.prototype || Symbol.toStringTag in String.prototype)
    ) {
        materializeCompactFormulaSheet(compactChunks, sheetFormulaDataMatrix.getMatrix());
        compactChunks = undefined;
    }

    if (compactChunks?.some((chunk) => chunk.formulaIds)) {
        // The snapshot resolves followers later, against the map as it is now.
        const resolution: Record<string, IFormulaIdMap> = Object.assign(Object.create(null), formulaIdMap);
        for (const chunk of compactChunks) chunk.formulaIdMap = resolution;
    }

    if (!compactChunks) {
        sheetFormulaDataMatrix.forValue((r, c, cell) => {
            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';

            if (isFormulaId(formulaId) && !isFormulaString(formulaString)) {
                const formulaInfo = formulaIdMap[formulaId];
                if (formulaInfo) {
                    const x = c - formulaInfo.c;
                    const y = r - formulaInfo.r;
                    const f = formulaInfo.f;
                    sheetFormulaDataMatrix.setValue(r, c, {
                        f,
                        si: formulaId,
                        x,
                        y,
                    });
                } else {
                    // If the formula ID is not found in the formula ID map, delete the formula ID.
                    // Prevent IDs without corresponding formulas from appearing
                    sheetFormulaDataMatrix.realDeleteValue(r, c);
                }
            }
        });
    }

    const newSheetFormulaData = sheetFormulaDataMatrix.getMatrix(); // Don't use clone, otherwise it will cause performance problems

    return {
        formulaData: {
            [unitId]: {
                [sheetId]: newSheetFormulaData,
            },
        },
        formulaIdMap,
        compactChunks,
    };
}

const BASE_LEGACY_FIELD_REF_PATTERN = /\{([^}]+)\}/g;
const BASE_TABLE_SCOPED_FIELD_REF_PATTERN = /\b([A-Z_][\w.]*)\[\[\s*#(This Row|Data)\s*\],\s*\[([^\]]+)\]\]/gi;
const BASE_TABLE_CURRENT_ROW_FIELD_REF_PATTERN = /\b([A-Z_][\w.]*)\[@\[([^\]]+)\]\]/gi;
const BASE_TABLE_FIELD_REF_PATTERN = /\b([A-Z_][\w.]*)\[([^\[\]#]+)\]/gi;
const BASE_SCOPED_FIELD_REF_PATTERN = /(^|[^\w\[])\[\[\s*#(This Row|Data)\s*\],\s*\[([^\]]+)\]\]/gi;
const BASE_CURRENT_ROW_FIELD_REF_PATTERN = /(^|[^\w\[])\[@\[([^\]]+)\]\](?!\])/g;
const BASE_BRACKET_FIELD_REF_PATTERN = /(^|[^\w\[])\[@?([^\[\]#]+)\](?!\])/g;
const BASE_EXTERNAL_A1_REF_PATTERN = /(?:'\[[^\]]+\](?:[^']|'')+'|\[[^\]]+\][^\s'!]+)!\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?/gi;
const BASE_EXTERNAL_STRUCTURED_REFERENCE_PREFIX = /(?:'((?:[^']|'')+)'|\[[^\]]+\]|[A-Za-z0-9_.-]+)![^\s!\[\]]+\[/g;

function normalizeBaseFormulaForEngine(
    formula: string,
    currentTable: ITableSnapshot,
    snapshot: IBaseSnapshot,
    formulaTableNames: ReadonlyMap<string, string>
): string {
    const refs: string[] = [];
    const hold = (ref: string) => {
        const index = refs.push(ref) - 1;
        return `__BASE_FORMULA_REF_${index}__`;
    };
    const normalized = protectBaseFormulaParts(formula, hold)
        .replace(BASE_LEGACY_FIELD_REF_PATTERN, (_match, fieldName: string) => hold(createEngineThisRowRef(currentTable, fieldName, formulaTableNames)))
        .replace(BASE_TABLE_SCOPED_FIELD_REF_PATTERN, (_match, sourceTableName: string, scope: string, fieldName: string) => {
            const targetTable = resolveBaseFormulaTable(sourceTableName, currentTable, snapshot, formulaTableNames);
            if (!targetTable) return `${sourceTableName}[[#${scope}],[${fieldName}]]`;
            return hold(scope.toLowerCase() === 'data'
                ? createEngineColumnRef(targetTable, fieldName, formulaTableNames)
                : createEngineThisRowRef(targetTable, fieldName, formulaTableNames));
        })
        .replace(BASE_TABLE_CURRENT_ROW_FIELD_REF_PATTERN, (_match, sourceTableName: string, fieldName: string) => {
            const targetTable = resolveBaseFormulaTable(sourceTableName, currentTable, snapshot, formulaTableNames);
            return targetTable
                ? hold(createEngineThisRowRef(targetTable, fieldName, formulaTableNames))
                : `${sourceTableName}[@[${fieldName}]]`;
        })
        .replace(BASE_SCOPED_FIELD_REF_PATTERN, (_match, prefix: string, scope: string, fieldName: string) => `${prefix}${hold(
            scope.toLowerCase() === 'data'
                ? createEngineColumnRef(currentTable, fieldName, formulaTableNames)
                : createEngineThisRowRef(currentTable, fieldName, formulaTableNames)
        )}`)
        .replace(BASE_CURRENT_ROW_FIELD_REF_PATTERN, (_match, prefix: string, fieldName: string) =>
            `${prefix}${hold(createEngineThisRowRef(currentTable, fieldName, formulaTableNames))}`)
        .replace(BASE_TABLE_FIELD_REF_PATTERN, (_match, sourceTableName: string, fieldName: string) => {
            const targetTable = resolveBaseFormulaTable(sourceTableName, currentTable, snapshot, formulaTableNames);
            if (targetTable) return hold(createEngineColumnRef(targetTable, fieldName, formulaTableNames));
            return `${sourceTableName}[${fieldName}]`;
        })
        .replace(BASE_BRACKET_FIELD_REF_PATTERN, (_match, prefix: string, fieldName: string) => `${prefix}${hold(createEngineThisRowRef(currentTable, fieldName, formulaTableNames))}`);
    return normalized.replace(/__BASE_FORMULA_REF_(\d+)__/g, (_match, index: string) => refs[Number(index)] ?? '');
}

function protectBaseExternalReferences(formula: string, replace: (reference: string) => string): string {
    const withProtectedA1 = formula.replace(BASE_EXTERNAL_A1_REF_PATTERN, (reference, offset: number) =>
        isInsideBaseFormulaString(formula, offset) ? reference : replace(reference));
    return protectBaseExternalStructuredReferences(withProtectedA1, replace);
}

function protectBaseFormulaParts(formula: string, replace: (reference: string) => string): string {
    return protectBaseFormulaStrings(protectBaseExternalReferences(formula, replace), replace);
}

function protectBaseFormulaStrings(formula: string, replace: (reference: string) => string): string {
    return formula.replace(/"(?:""|[^"])*"/g, replace);
}

function protectBaseExternalStructuredReferences(
    formula: string,
    replace: (reference: string) => string
): string {
    const spans: Array<{ start: number; end: number }> = [];
    BASE_EXTERNAL_STRUCTURED_REFERENCE_PREFIX.lastIndex = 0;
    while (true) {
        const match = BASE_EXTERNAL_STRUCTURED_REFERENCE_PREFIX.exec(formula);
        if (match == null) break;
        if (isInsideBaseFormulaString(formula, match.index)) continue;
        const openBracket = BASE_EXTERNAL_STRUCTURED_REFERENCE_PREFIX.lastIndex - 1;
        let depth = 0;
        for (let index = openBracket; index < formula.length; index++) {
            if (formula[index] === '[') depth++;
            if (formula[index] !== ']') continue;
            depth--;
            if (depth === 0) {
                spans.push({ start: match.index, end: index + 1 });
                BASE_EXTERNAL_STRUCTURED_REFERENCE_PREFIX.lastIndex = index + 1;
                break;
            }
        }
    }
    if (spans.length === 0) return formula;

    let result = '';
    let offset = 0;
    for (const span of spans) {
        result += formula.slice(offset, span.start);
        result += replace(formula.slice(span.start, span.end));
        offset = span.end;
    }
    return result + formula.slice(offset);
}

function isInsideBaseFormulaString(formula: string, position: number): boolean {
    let inString = false;
    for (let index = 0; index < position; index++) {
        if (formula[index] !== '"') continue;
        if (inString && formula[index + 1] === '"') {
            index++;
            continue;
        }
        inString = !inString;
    }
    return inString;
}

function createEngineThisRowRef(table: ITableSnapshot, fieldName: string, formulaTableNames: ReadonlyMap<string, string>): string {
    return `${formulaTableNames.get(table.id) ?? getBaseFormulaTableName(table, { tables: { [table.id]: table } })}[[#This Row],[${fieldName}]]`;
}

function createEngineColumnRef(table: ITableSnapshot, fieldName: string, formulaTableNames: ReadonlyMap<string, string>): string {
    return `${formulaTableNames.get(table.id) ?? getBaseFormulaTableName(table, { tables: { [table.id]: table } })}[[#Data],[${fieldName}]]`;
}

function addEngineBaseTableNameMappings(
    tableNameMap: Record<string, string>,
    table: ITableSnapshot,
    formulaTableNames: ReadonlyMap<string, string>
): void {
    tableNameMap[formulaTableNames.get(table.id) ?? table.name] = table.id;
}

function createStableExcelTableName(tableId: string): string {
    const encoded = Array.from(tableId, (character) => /[A-Za-z0-9]/.test(character)
        ? character
        : `_x${character.codePointAt(0)?.toString(16) ?? '0'}_`).join('');
    return `_T_${encoded}`;
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

function resolveBaseFormulaTable(
    tableName: string | undefined,
    currentTable: ITableSnapshot,
    snapshot: IBaseSnapshot,
    formulaTableNames: ReadonlyMap<string, string>
): ITableSnapshot | undefined {
    if (!tableName) {
        return currentTable;
    }
    const normalizedName = tableName.toLowerCase();
    const matches = Object.values(snapshot.tables).filter((table) =>
        table.id.toLowerCase() === normalizedName
        || table.name.toLowerCase() === normalizedName
        || formulaTableNames.get(table.id)?.toLowerCase() === normalizedName
        || createStableExcelTableName(table.id).toLowerCase() === normalizedName
    );
    return matches.length === 1 ? matches[0] : undefined;
}
