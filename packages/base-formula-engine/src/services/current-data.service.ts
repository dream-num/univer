import type { IUnitRange, Nullable } from '@univerjs/core';
import { Disposable, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type {
    IArrayFormulaUnitCellType,
    IFormulaData,
    IFormulaDatasetConfig,
    IOtherFormulaData,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitData,
    IUnitExcludedCell,
    IUnitSheetNameMap,
} from '../basics/common';

export const DEFAULT_DOCUMENT_SUB_COMPONENT_ID = '__default_document_sub_component_id20231101__';

export interface IFormulaCurrentConfigService {
    getUnitData(): IUnitData;

    getFormulaData(): IFormulaData;

    getOtherFormulaData(): IOtherFormulaData;

    getSheetNameMap(): IUnitSheetNameMap;

    isForceCalculate(): boolean;

    getDirtyRanges(): IUnitRange[];

    registerUnitData(unitData: IUnitData): void;

    registerFormulaData(formulaData: IFormulaData): void;

    registerSheetNameMap(sheetNameMap: IUnitSheetNameMap): void;

    getExcludedRange(): Nullable<IUnitExcludedCell>;

    loadDirtyRangesAndExcludedCell(dirtyRanges: IUnitRange[], excludedCell?: IUnitExcludedCell): void;
}

export class FormulaCurrentConfigService extends Disposable implements IFormulaCurrentConfigService {
    private _unitData: IUnitData = {};

    private _arrayFormulaCellData: IRuntimeUnitDataType = {};

    private _otherFormulaData: IOtherFormulaData = {};

    private _formulaData: IFormulaData = {};

    private _sheetNameMap: IUnitSheetNameMap = {};

    private _forceCalculate: boolean = false;

    private _dirtyRanges: IUnitRange[] = [];

    private _excludedCell: Nullable<IUnitExcludedCell>;

    constructor(@IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService) {
        super();
    }

    override dispose(): void {
        this._unitData = {};
        this._formulaData = {};
        this._arrayFormulaCellData = {};
        this._sheetNameMap = {};
        this._dirtyRanges = [];
        this._excludedCell = {};
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

    getOtherFormulaData() {
        return this._otherFormulaData;
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

    load(config: IFormulaDatasetConfig) {
        const { allUnitData, unitSheetNameMap } = this._loadSheetData();

        this._unitData = allUnitData;

        this._formulaData = config.formulaData;

        this._arrayFormulaCellData = this._dataToRuntime(config.arrayFormulaCellData);

        this._sheetNameMap = unitSheetNameMap;

        this._otherFormulaData = this._loadOtherFormulaData();

        this._forceCalculate = config.forceCalculate;

        this._dirtyRanges = config.dirtyRanges;

        this._excludedCell = config.excludedCell;
    }

    loadDirtyRangesAndExcludedCell(dirtyRanges: IUnitRange[], excludedCell?: IUnitExcludedCell) {
        this._dirtyRanges = dirtyRanges;

        this._excludedCell = excludedCell;
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

    private _dataToRuntime(unitData: IArrayFormulaUnitCellType) {
        const arrayFormulaCellData: IRuntimeUnitDataType = {};
        Object.keys(unitData).forEach((unitId) => {
            const sheetData = unitData[unitId];

            if (arrayFormulaCellData[unitId] == null) {
                arrayFormulaCellData[unitId] = {};
            }

            Object.keys(sheetData).forEach((sheetId) => {
                const cellData = sheetData[sheetId];

                arrayFormulaCellData[unitId][sheetId] = new ObjectMatrix(cellData);
            });
        });

        return arrayFormulaCellData;
    }

    private _loadOtherFormulaData() {
        const unitAllDoc = this._currentUniverService.getAllUniverDocsInstance();

        const unitAllSlide = this._currentUniverService.getAllUniverSlidesInstance();

        const otherFormulaData: IOtherFormulaData = {};

        for (const documentDataModel of unitAllDoc) {
            const unitId = documentDataModel.getUnitId();

            if (otherFormulaData[unitId] == null) {
                otherFormulaData[unitId] = {};
            }

            if (otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID] == null) {
                otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID] = {};
            }

            const subComponent = otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID];

            const customRanges = documentDataModel.getBody()?.customRanges;

            if (customRanges == null) {
                continue;
            }

            for (const customRange of customRanges) {
                subComponent[customRange.rangeId] = {
                    f: customRange.endIndex.toString(),
                };
            }
        }

        for (const slide of unitAllSlide) {
            const unitId = slide.getUnitId();

            if (otherFormulaData[unitId] == null) {
                otherFormulaData[unitId] = {};
            }

            if (otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID] == null) {
                otherFormulaData[unitId][DEFAULT_DOCUMENT_SUB_COMPONENT_ID] = {};
            }

            const pages = slide.getPages();

            if (pages == null) {
                continue;
            }

            const pageIds = Object.keys(pages);

            for (const pageId of pageIds) {
                const page = pages[pageId];

                const subComponent = otherFormulaData[unitId][pageId];

                const pageElements = page.pageElements;

                if (pageElements == null) {
                    continue;
                }

                const pageElementIds = Object.keys(pageElements);

                for (const pageElementId of pageElementIds) {
                    const pageElement = pageElements[pageElementId];
                    subComponent[pageElementId] = {
                        f: pageElement.title,
                    };
                }
            }
        }

        return otherFormulaData;
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
