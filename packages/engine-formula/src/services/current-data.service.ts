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

import type { IUnitRange, LocaleType, Nullable, Workbook } from '@univerjs/core';
import type {
    IArrayFormulaRangeType,
    IDirtyUnitFeatureMap,
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetDefinedNameMap,
    IDirtyUnitSheetNameMap,
    IFormulaData,
    IFormulaDatasetConfig,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitData,
    IUnitExcludedCell,
    IUnitSheetIdToNameMap,
    IUnitSheetNameMap,
    IUnitStylesData,
} from '../basics/common';

import { createIdentifier, Disposable, Inject, IUniverInstanceService, LocaleService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import { convertUnitDataToRuntime } from '../basics/runtime';

export interface IFormulaDirtyData {
    forceCalculation: boolean;
    dirtyRanges: IUnitRange[];
    dirtyNameMap: IDirtyUnitSheetNameMap;
    dirtyDefinedNameMap: IDirtyUnitSheetDefinedNameMap;
    dirtyUnitFeatureMap: IDirtyUnitFeatureMap;
    dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap;
    clearDependencyTreeCache: IDirtyUnitSheetNameMap; // unitId -> sheetId
    maxIteration?: number;
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

    getDirtyDefinedNameMap(): IDirtyUnitSheetDefinedNameMap;

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
}

export class FormulaCurrentConfigService extends Disposable implements IFormulaCurrentConfigService {
    private _unitData: IUnitData = {};

    private _unitStylesData: IUnitStylesData = {};

    private _arrayFormulaCellData: IRuntimeUnitDataType = {};

    private _arrayFormulaRange: IArrayFormulaRangeType = {};

    private _formulaData: IFormulaData = {};

    private _sheetNameMap: IUnitSheetNameMap = {};

    private _forceCalculate: boolean = false;

    private _clearDependencyTreeCache: IDirtyUnitSheetNameMap = {};

    private _dirtyRanges: IUnitRange[] = [];

    private _dirtyNameMap: IDirtyUnitSheetNameMap = {};

    private _dirtyDefinedNameMap: IDirtyUnitSheetDefinedNameMap = {};

    private _dirtyUnitFeatureMap: IDirtyUnitFeatureMap = {};

    private _dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = {};

    private _excludedCell: Nullable<IUnitExcludedCell>;

    private _sheetIdToNameMap: IUnitSheetIdToNameMap = {};

    private _executeUnitId: Nullable<string> = '';
    private _executeSubUnitId: Nullable<string> = '';

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
    }

    override dispose(): void {
        this._unitData = {};
        this._unitStylesData = {};
        this._formulaData = {};
        this._arrayFormulaCellData = {};
        this._arrayFormulaRange = {};
        this._sheetNameMap = {};
        this._dirtyRanges = [];
        this._dirtyNameMap = {};
        this._dirtyDefinedNameMap = {};
        this._dirtyUnitFeatureMap = {};
        this._excludedCell = {};
        this._sheetIdToNameMap = {};
        this._dirtyUnitOtherFormulaMap = {};
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

    getClearDependencyTreeCache() {
        return this._clearDependencyTreeCache;
    }

    getLocale() {
        return this._localeService.getCurrentLocale();
    }

    getSheetsInfo() {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
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

    load(config: IFormulaDatasetConfig) {
        if (config.allUnitData && config.unitSheetNameMap && config.unitStylesData) {
            this._unitData = config.allUnitData;
            this._unitStylesData = config.unitStylesData;
            this._sheetNameMap = config.unitSheetNameMap;
        } else {
            const { allUnitData, unitSheetNameMap, unitStylesData } = this._loadSheetData();

            this._unitData = allUnitData;

            this._unitStylesData = unitStylesData;

            this._sheetNameMap = unitSheetNameMap;
        }

        this._formulaData = config.formulaData;

        this._arrayFormulaCellData = convertUnitDataToRuntime(config.arrayFormulaCellData);

        this._arrayFormulaRange = config.arrayFormulaRange;

        this._forceCalculate = config.forceCalculate;

        this._clearDependencyTreeCache = config.clearDependencyTreeCache || {};

        this._dirtyRanges = config.dirtyRanges;

        this._dirtyNameMap = config.dirtyNameMap;

        this._dirtyDefinedNameMap = config.dirtyDefinedNameMap;

        this._dirtyUnitFeatureMap = config.dirtyUnitFeatureMap;

        this._dirtyUnitOtherFormulaMap = config.dirtyUnitOtherFormulaMap;

        this._excludedCell = config.excludedCell;

        this._mergeNameMap(this._sheetNameMap, this._dirtyNameMap);
    }

    getDirtyData(): IFormulaDirtyData {
        return {
            forceCalculation: this._forceCalculate,
            dirtyRanges: this._dirtyRanges,
            dirtyNameMap: this._dirtyNameMap,
            dirtyDefinedNameMap: this._dirtyDefinedNameMap,
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
        this._dirtyNameMap = {};
    }

    registerUnitData(unitData: IUnitData) {
        this._unitData = unitData;
    }

    registerFormulaData(formulaData: IFormulaData) {
        this._formulaData = formulaData;
    }

    registerSheetNameMap(sheetNameMap: IUnitSheetNameMap) {
        this._sheetNameMap = sheetNameMap;
    }

    // private _loadOtherFormulaData() {
    //     const unitAllDoc = this._univerInstanceService.getAllUniverDocsInstance();

    //     const unitAllSlide = this._univerInstanceService.getAllUniverSlidesInstance();

    //     const otherFormulaData: IOtherFormulaData = {};

    //     for (const documentDataModel of unitAllDoc) {
    //         const unitId = documentDataModel.getUnitId();

    //         if (otherFormulaData[unitId] == null) {
    //             otherFormulaData[unitId] = {};
    //         }

    //         if (otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID] == null) {
    //             otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID] = {};
    //         }

    //         const subComponent = otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID];

    //         const customRanges = documentDataModel.getBody()?.customRanges;

    //         if (customRanges == null) {
    //             continue;
    //         }

    //         for (const customRange of customRanges) {
    //             subComponent[customRange.rangeId] = {
    //                 f: customRange.endIndex.toString(),
    //             };
    //         }
    //     }

    //     for (const slide of unitAllSlide) {
    //         const unitId = slide.getUnitId();

    //         if (otherFormulaData[unitId] == null) {
    //             otherFormulaData[unitId] = {};
    //         }

    //         if (otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID] == null) {
    //             otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID] = {};
    //         }

    //         const pages = slide.getPages();

    //         if (pages == null) {
    //             continue;
    //         }

    //         const pageIds = Object.keys(pages);

    //         for (const pageId of pageIds) {
    //             const page = pages[pageId];

    //             const subComponent = otherFormulaData[unitId][pageId];

    //             const pageElements = page.pageElements;

    //             if (pageElements == null) {
    //                 continue;
    //             }

    //             const pageElementIds = Object.keys(pageElements);

    //             for (const pageElementId of pageElementIds) {
    //                 const pageElement = pageElements[pageElementId];
    //                 subComponent[pageElementId] = {
    //                     f: pageElement.title,
    //                 };
    //             }
    //         }
    //     }

    //     return otherFormulaData;
    // }

    private _mergeNameMap(unitSheetNameMap: IUnitSheetNameMap, dirtyNameMap: IDirtyUnitSheetNameMap) {
        Object.keys(dirtyNameMap).forEach((unitId) => {
            if (dirtyNameMap[unitId]) {
                Object.keys(dirtyNameMap[unitId]!).forEach((sheetId) => {
                    if (unitSheetNameMap[unitId] == null) {
                        unitSheetNameMap[unitId] = {};
                    }
                    unitSheetNameMap[unitId]![dirtyNameMap[unitId]![sheetId]] = sheetId;
                });
            }
        });

        this._sheetIdToNameMap = {};

        Object.keys(unitSheetNameMap).forEach((unitId) => {
            Object.keys(unitSheetNameMap[unitId]!).forEach((sheetName) => {
                if (this._sheetIdToNameMap[unitId] == null) {
                    this._sheetIdToNameMap[unitId] = {};
                }
                this._sheetIdToNameMap[unitId]![unitSheetNameMap[unitId]![sheetName]] = sheetName;
            });
        });
    }

    private _loadSheetData() {
        const unitAllSheet = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);

        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();

        this._executeUnitId = workbook?.getUnitId();
        this._executeSubUnitId = worksheet?.getSheetId();

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
}

export const IFormulaCurrentConfigService = createIdentifier<FormulaCurrentConfigService>(
    'univer.formula.current-data.service'
);
