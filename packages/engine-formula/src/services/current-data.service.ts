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

import type { IUnitRange, Nullable } from '@univerjs/core';
import { Disposable, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type {
    IDirtyUnitFeatureMap,
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetNameMap,
    IFormulaData,
    IFormulaDatasetConfig,
    INumfmtItemMap,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitData,
    IUnitExcludedCell,
    IUnitSheetIdToNameMap,
    IUnitSheetNameMap,
} from '../basics/common';
import { convertUnitDataToRuntime } from '../basics/runtime';

export const DEFAULT_DOCUMENT_SUB_COMPONENT_ID = '__default_document_sub_component_id20231101__';

export interface IFormulaCurrentConfigService {
    load(config: IFormulaDatasetConfig): void;

    getUnitData(): IUnitData;

    getFormulaData(): IFormulaData;

    getSheetNameMap(): IUnitSheetNameMap;

    isForceCalculate(): boolean;

    getDirtyRanges(): IUnitRange[];

    getDirtyNameMap(): IDirtyUnitSheetNameMap;

    getDirtyUnitFeatureMap(): IDirtyUnitFeatureMap;

    registerUnitData(unitData: IUnitData): void;

    registerFormulaData(formulaData: IFormulaData): void;

    registerSheetNameMap(sheetNameMap: IUnitSheetNameMap): void;

    getExcludedRange(): Nullable<IUnitExcludedCell>;

    loadDirtyRangesAndExcludedCell(dirtyRanges: IUnitRange[], excludedCell?: IUnitExcludedCell): void;

    getArrayFormulaCellData(): IRuntimeUnitDataType;

    getSheetName(unitId: string, sheetId: string): string;

    getDirtyUnitOtherFormulaMap(): IDirtyUnitOtherFormulaMap;
}

export class FormulaCurrentConfigService extends Disposable implements IFormulaCurrentConfigService {
    private _unitData: IUnitData = {};

    private _arrayFormulaCellData: IRuntimeUnitDataType = {};

    private _formulaData: IFormulaData = {};

    private _sheetNameMap: IUnitSheetNameMap = {};

    private _forceCalculate: boolean = false;

    private _dirtyRanges: IUnitRange[] = [];

    private _dirtyNameMap: IDirtyUnitSheetNameMap = {};

    private _numfmtItemMap: INumfmtItemMap = {};

    private _dirtyUnitFeatureMap: IDirtyUnitFeatureMap = {};

    private _dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = {};

    private _excludedCell: Nullable<IUnitExcludedCell>;

    private _sheetIdToNameMap: IUnitSheetIdToNameMap = {};

    constructor(@IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService) {
        super();
    }

    override dispose(): void {
        this._unitData = {};
        this._formulaData = {};
        this._arrayFormulaCellData = {};
        this._sheetNameMap = {};
        this._dirtyRanges = [];
        this._dirtyNameMap = {};
        this._numfmtItemMap = {};
        this._dirtyUnitFeatureMap = {};
        this._excludedCell = {};
        this._sheetIdToNameMap = {};
        this._dirtyUnitOtherFormulaMap = {};
    }

    getExcludedRange() {
        return this._excludedCell;
    }

    getUnitData() {
        return this._unitData;
    }

    getFormulaData() {
        return this._formulaData;
    }

    getArrayFormulaCellData() {
        return this._arrayFormulaCellData;
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

    getNumfmtItemMap() {
        return this._numfmtItemMap;
    }

    getDirtyUnitFeatureMap() {
        return this._dirtyUnitFeatureMap;
    }

    getSheetName(unitId: string, sheetId: string) {
        if (this._sheetIdToNameMap[unitId] == null) {
            return '';
        }

        return this._sheetIdToNameMap[unitId]![sheetId] || '';
    }

    getDirtyUnitOtherFormulaMap() {
        return this._dirtyUnitOtherFormulaMap;
    }

    load(config: IFormulaDatasetConfig) {
        if (config.allUnitData && config.unitSheetNameMap) {
            this._unitData = config.allUnitData;
            this._sheetNameMap = config.unitSheetNameMap;
        } else {
            const { allUnitData, unitSheetNameMap } = this._loadSheetData();

            this._unitData = allUnitData;

            this._sheetNameMap = unitSheetNameMap;
        }

        this._formulaData = config.formulaData;

        this._arrayFormulaCellData = convertUnitDataToRuntime(config.arrayFormulaCellData);

        this._forceCalculate = config.forceCalculate;

        this._dirtyRanges = config.dirtyRanges;

        this._dirtyNameMap = config.dirtyNameMap;

        this._numfmtItemMap = config.numfmtItemMap;

        this._dirtyUnitFeatureMap = config.dirtyUnitFeatureMap;

        this._dirtyUnitOtherFormulaMap = config.dirtyUnitOtherFormulaMap;

        this._excludedCell = config.excludedCell;

        this._mergeNameMap(this._sheetNameMap, this._dirtyNameMap);
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
    //     const unitAllDoc = this._currentUniverService.getAllUniverDocsInstance();

    //     const unitAllSlide = this._currentUniverService.getAllUniverSlidesInstance();

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
}

export const IFormulaCurrentConfigService = createIdentifier<FormulaCurrentConfigService>(
    'univer.formula.current-data.service'
);
