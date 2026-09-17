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

import type { IUnitRange, LocaleType, Nullable, Workbook } from '@univerjs/core';
import type {
    IArrayFormulaRangeType,
    IDirtyUnitDefinedNameMap,
    IDirtyUnitFeatureMap,
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetNameMap,
    IDirtyUnitSuperTableMap,
    IFormulaData,
    IFormulaDatasetConfig,
    IRuntimeUnitDataType,
    IUnitData,
    IUnitExcludedCell,
    IUnitRowData,
    IUnitSheetIdToNameMap,
    IUnitSheetNameMap,
    IUnitStylesData,
} from '../basics/common';

import { createIdentifier, Disposable, Inject, IUniverInstanceService, LocaleService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import { convertUnitDataToRuntime, copyUnitData } from '../basics/runtime';
import { FormulaDataModel } from '../models/formula-data.model';
import { ISheetRowFilteredService } from './sheet-row-filtered.service';

export interface IFormulaDirtyData {
    forceCalculation: boolean;
    dirtyRanges: IUnitRange[];
    dirtyNameMap: IDirtyUnitSheetNameMap;
    dirtyDefinedNameMap: IDirtyUnitDefinedNameMap;
    dirtySuperTableMap?: IDirtyUnitSuperTableMap;
    dirtyUnitFeatureMap: IDirtyUnitFeatureMap;
    dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap;
    clearDependencyTreeCache: IDirtyUnitSheetNameMap; // unitId -> sheetId
    maxIteration?: number;
    isCalculateTreeModel?: boolean; // whether to calculate the dependency tree model
    rowData?: IUnitRowData; // Include rows hidden by filters
}

export interface IFormulaCurrentConfigService {
    load(config: IFormulaDatasetConfig): void;

    getUnitData(): IUnitData;

    /**
     * Get the unit styles data.
     */
    getUnitStylesData(): IUnitStylesData;

    getFormulaData(): IFormulaData;

    getSheetNameMap(): IUnitSheetNameMap;

    isForceCalculate(): boolean;

    getDirtyRanges(): IUnitRange[];

    getDirtyNameMap(): IDirtyUnitSheetNameMap;

    getDirtyDefinedNameMap(): IDirtyUnitDefinedNameMap;

    getDirtySuperTableMap(): IDirtyUnitSuperTableMap;

    getDirtyUnitFeatureMap(): IDirtyUnitFeatureMap;

    registerUnitData(unitData: IUnitData): void;

    registerFormulaData(formulaData: IFormulaData): void;

    registerSheetNameMap(sheetNameMap: IUnitSheetNameMap): void;

    getExcludedRange(): Nullable<IUnitExcludedCell>;

    loadDirtyRangesAndExcludedCell(dirtyRanges: IUnitRange[], excludedCell?: IUnitExcludedCell): void;

    getArrayFormulaCellData(): IRuntimeUnitDataType;

    getArrayFormulaRange(): IArrayFormulaRangeType;

    getSheetName(unitId: string, sheetId: string): string;

    getDirtyUnitOtherFormulaMap(): IDirtyUnitOtherFormulaMap;

    getExecuteUnitId(): Nullable<string>;
    getExecuteSubUnitId(): Nullable<string>;

    setExecuteUnitId(unitId: string): void;
    setExecuteSubUnitId(subUnitId: string): void;

    getDirtyData(): IFormulaDirtyData;

    getClearDependencyTreeCache(): IDirtyUnitSheetNameMap;

    getLocale(): LocaleType;

    getSheetsInfo(): {
        sheetOrder: string[];
        sheetNameMap: { [sheetId: string]: string };
    };

    getSheetRowColumnCount(unitId: string, sheetId: string): { rowCount: number; columnCount: number };

    getFilteredOutRows(unitId: string, sheetId: string, startRow: number, endRow: number): number[];

    setSheetNameMap(sheetIdToNameMap: IUnitSheetIdToNameMap): void;

    loadDataLite(rowData?: IUnitRowData): void;
}

export class FormulaCurrentConfigService extends Disposable implements IFormulaCurrentConfigService {
    private _unitData: IUnitData = Object.create(null);

    private _unitStylesData: IUnitStylesData = Object.create(null);

    private _arrayFormulaCellData: IRuntimeUnitDataType = Object.create(null);

    private _arrayFormulaRange: IArrayFormulaRangeType = Object.create(null);

    private _formulaData: IFormulaData = Object.create(null);

    private _sheetNameMap: IUnitSheetNameMap = Object.create(null);

    private _forceCalculate: boolean = false;

    private _clearDependencyTreeCache: IDirtyUnitSheetNameMap = Object.create(null);

    private _dirtyRanges: IUnitRange[] = [];

    private _dirtyNameMap: IDirtyUnitSheetNameMap = Object.create(null);

    private _dirtyDefinedNameMap: IDirtyUnitDefinedNameMap = Object.create(null);

    private _dirtySuperTableMap: IDirtyUnitSuperTableMap = Object.create(null);

    private _dirtyUnitFeatureMap: IDirtyUnitFeatureMap = Object.create(null);

    private _dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = Object.create(null);

    private _excludedCell: Nullable<IUnitExcludedCell>;

    private _sheetIdToNameMap: IUnitSheetIdToNameMap = Object.create(null);

    private _executeUnitId: Nullable<string> = '';
    private _executeSubUnitId: Nullable<string> = '';

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(ISheetRowFilteredService) private readonly _sheetRowFilteredService: ISheetRowFilteredService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();
        this._unitData = Object.create(null);
        this._unitStylesData = Object.create(null);
        this._arrayFormulaCellData = Object.create(null);
        this._arrayFormulaRange = Object.create(null);
        this._formulaData = Object.create(null);
        this._sheetNameMap = Object.create(null);
        this._clearDependencyTreeCache = Object.create(null);
        this._dirtyRanges = [];
        this._dirtyNameMap = Object.create(null);
        this._dirtyDefinedNameMap = Object.create(null);
        this._dirtySuperTableMap = Object.create(null);
        this._dirtyUnitFeatureMap = Object.create(null);
        this._dirtyUnitOtherFormulaMap = Object.create(null);
        this._excludedCell = Object.create(null);
        this._sheetIdToNameMap = Object.create(null);
    }

    getExecuteUnitId() {
        return this._executeUnitId;
    }

    getExecuteSubUnitId() {
        return this._executeSubUnitId;
    }

    setExecuteUnitId(unitId: string) {
        this._executeUnitId = unitId;
    }

    setExecuteSubUnitId(subUnitId: string) {
        this._executeSubUnitId = subUnitId;
    }

    getExcludedRange() {
        return this._excludedCell;
    }

    getUnitData() {
        return this._unitData;
    }

    getUnitStylesData(): IUnitStylesData {
        return this._unitStylesData;
    }

    getFormulaData() {
        return this._formulaData;
    }

    getArrayFormulaCellData() {
        return this._arrayFormulaCellData;
    }

    getArrayFormulaRange() {
        return this._arrayFormulaRange;
    }

    getSheetNameMap() {
        return this._sheetNameMap;
    }

    isForceCalculate() {
        return this._forceCalculate;
    }

    getDirtyRanges() {
        return this._dirtyRanges;
    }

    getDirtyNameMap() {
        return this._dirtyNameMap;
    }

    getDirtyDefinedNameMap() {
        return this._dirtyDefinedNameMap;
    }

    getDirtySuperTableMap() {
        return this._dirtySuperTableMap;
    }

    getDirtyUnitFeatureMap() {
        return this._dirtyUnitFeatureMap;
    }

    getDirtyUnitOtherFormulaMap() {
        return this._dirtyUnitOtherFormulaMap;
    }

    getSheetName(unitId: string, sheetId: string) {
        if (this._sheetIdToNameMap[unitId] == null) {
            return '';
        }

        return this._sheetIdToNameMap[unitId]![sheetId] || '';
    }

    setSheetNameMap(sheetIdToNameMap: IUnitSheetIdToNameMap) {
        this._sheetIdToNameMap = copyUnitData(sheetIdToNameMap);
    }

    getClearDependencyTreeCache() {
        return this._clearDependencyTreeCache;
    }

    getLocale() {
        return this._localeService.getCurrentLocale();
    }

    getSheetsInfo() {
        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const { id, sheetOrder } = workbook.getSnapshot();

        return {
            sheetOrder,
            sheetNameMap: this._sheetIdToNameMap[id] as { [sheetId: string]: string },
        };
    }

    getSheetRowColumnCount(unitId: string, sheetId: string) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
        const worksheet = workbook?.getSheetBySheetId(sheetId);
        const snapshot = worksheet?.getSnapshot();

        if (!snapshot) {
            return { rowCount: 0, columnCount: 0 };
        }

        const { rowCount, columnCount } = snapshot;

        return { rowCount, columnCount };
    }

    getFilteredOutRows(unitId: string, sheetId: string, startRow: number, endRow: number) {
        const filteredOutRows: number[] = [];

        for (let r = startRow; r <= endRow; r++) {
            if (this._sheetRowFilteredService.getRowFiltered(unitId, sheetId, r)) {
                filteredOutRows.push(r);
            }
        }

        return filteredOutRows;
    }

    load(config: IFormulaDatasetConfig) {
        if (config.allUnitData && config.unitSheetNameMap && config.unitStylesData) {
            this._unitData = copyUnitData(config.allUnitData);
            this._unitStylesData = config.unitStylesData;
            this._sheetNameMap = copyUnitData(config.unitSheetNameMap);
        } else {
            const { allUnitData, unitSheetNameMap, unitStylesData } = this._loadSheetData();

            this._unitData = copyUnitData(allUnitData);

            this._unitStylesData = unitStylesData;

            this._sheetNameMap = copyUnitData(unitSheetNameMap);
        }

        // apply row data, including rows hidden by filters
        if (config.rowData) {
            this._applyUnitRowData(config.rowData);
        }

        this._formulaData = config.formulaData;

        this._arrayFormulaCellData = convertUnitDataToRuntime(config.arrayFormulaCellData);

        this._arrayFormulaRange = config.arrayFormulaRange;

        this._forceCalculate = config.forceCalculate;

        this._clearDependencyTreeCache = config.clearDependencyTreeCache || {};

        this._dirtyRanges = config.dirtyRanges;

        this._dirtyNameMap = config.dirtyNameMap;

        this._dirtyDefinedNameMap = config.dirtyDefinedNameMap;

        this._dirtySuperTableMap = config.dirtySuperTableMap || {};

        this._dirtyUnitFeatureMap = config.dirtyUnitFeatureMap;

        this._dirtyUnitOtherFormulaMap = config.dirtyUnitOtherFormulaMap;

        this._excludedCell = config.excludedCell;

        this._mergeNameMap(this._sheetNameMap, this._dirtyNameMap);
    }

    loadDataLite(rowData?: IUnitRowData) {
        const { allUnitData, unitSheetNameMap, unitStylesData } = this._loadSheetData();

        this._unitData = copyUnitData(allUnitData);

        this._unitStylesData = unitStylesData;

        this._sheetNameMap = copyUnitData(unitSheetNameMap);

        this._formulaData = this._formulaDataModel.getFormulaData();
        this._arrayFormulaCellData = convertUnitDataToRuntime(this._formulaDataModel.getArrayFormulaCellData());
        this._arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange();

        // apply row data, including rows hidden by filters
        rowData && this._applyUnitRowData(rowData);
    }

    getDirtyData(): IFormulaDirtyData {
        return {
            forceCalculation: this._forceCalculate,
            dirtyRanges: this._dirtyRanges,
            dirtyNameMap: this._dirtyNameMap,
            dirtyDefinedNameMap: this._dirtyDefinedNameMap,
            dirtySuperTableMap: this._dirtySuperTableMap,
            dirtyUnitFeatureMap: this._dirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap: this._dirtyUnitOtherFormulaMap,
            clearDependencyTreeCache: this._clearDependencyTreeCache,
        };
    }

    loadDirtyRangesAndExcludedCell(dirtyRanges: IUnitRange[], excludedCell?: IUnitExcludedCell) {
        this._dirtyRanges = dirtyRanges;

        this._excludedCell = excludedCell;

        /**
         * Mark dirty for expansion of array formulas, need to clear the worksheet's dirty flag.
         */
        this._dirtyNameMap = Object.create(null);
    }

    registerUnitData(unitData: IUnitData) {
        this._unitData = copyUnitData(unitData);
    }

    registerFormulaData(formulaData: IFormulaData) {
        this._formulaData = formulaData;
    }

    registerSheetNameMap(sheetNameMap: IUnitSheetNameMap) {
        this._sheetNameMap = copyUnitData(sheetNameMap);
    }

    private _mergeNameMap(unitSheetNameMap: IUnitSheetNameMap, dirtyNameMap: IDirtyUnitSheetNameMap) {
        Object.keys(dirtyNameMap).forEach((unitId) => {
            if (dirtyNameMap[unitId]) {
                Object.keys(dirtyNameMap[unitId]!).forEach((sheetId) => {
                    if (unitSheetNameMap[unitId] == null) {
                        unitSheetNameMap[unitId] = Object.create(null);
                    }
                    unitSheetNameMap[unitId]![dirtyNameMap[unitId]![sheetId]] = sheetId;
                });
            }
        });

        this._sheetIdToNameMap = Object.create(null);

        Object.keys(unitSheetNameMap).forEach((unitId) => {
            Object.keys(unitSheetNameMap[unitId]!).forEach((sheetName) => {
                if (this._sheetIdToNameMap[unitId] == null) {
                    this._sheetIdToNameMap[unitId] = Object.create(null);
                }
                this._sheetIdToNameMap[unitId]![unitSheetNameMap[unitId]![sheetName]] = sheetName;
            });
        });
    }

    private _loadSheetData() {
        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();

        this._executeUnitId = workbook?.getUnitId();
        this._executeSubUnitId = worksheet?.getSheetId();

        return this._formulaDataModel.getCalculateData();
    }

    /**
     * There is no filter information in the worker, it must be passed in from the main thread after it is ready
     * @param rowData
     */
    private _applyUnitRowData(rowData: IUnitRowData) {
        for (const unitId of Object.keys(rowData)) {
            if (rowData[unitId] == null) {
                continue;
            }

            for (const sheetId of Object.keys(rowData[unitId])) {
                if (rowData[unitId][sheetId] == null) {
                    continue;
                }

                if (this._unitData[unitId] == null) {
                    this._unitData[unitId] = Object.create(null);
                }

                if (this._unitData[unitId][sheetId] == null) {
                    this._unitData[unitId][sheetId] = {
                        cellData: new ObjectMatrix({}),
                        rowCount: 0,
                        columnCount: 0,
                        rowData: {},
                        columnData: {},
                    };
                }

                this._unitData[unitId][sheetId].rowData = rowData[unitId][sheetId];
            }
        }
    }
}

export const IFormulaCurrentConfigService = createIdentifier<IFormulaCurrentConfigService>(
    'univer.formula.current-data.service'
);
