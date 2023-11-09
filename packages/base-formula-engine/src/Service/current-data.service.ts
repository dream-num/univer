import { Disposable, IUnitRange } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import { IFormulaData, IFormulaDatasetConfig, IUnitData, IUnitSheetNameMap } from '../Basics/Common';

export interface IFormulaCurrentConfigService {
    getUnitData(): IUnitData;

    getFormulaData(): IFormulaData;

    getSheetNameMap(): IUnitSheetNameMap;

    isForceCalculate(): boolean;

    getUpdateRangeList(): IUnitRange[];

    registerUnitData(unitData: IUnitData): void;

    registerFormulaData(formulaData: IFormulaData): void;

    registerSheetNameMap(sheetNameMap: IUnitSheetNameMap): void;
}

export class FormulaCurrentConfigService extends Disposable implements IFormulaCurrentConfigService {
    private _unitData: IUnitData = {};
    private _formulaData: IFormulaData = {};
    private _sheetNameMap: IUnitSheetNameMap = {};

    private _forceCalculate: boolean = false;

    private _updateRangeList: IUnitRange[] = [];

    override dispose(): void {
        this._unitData = {};
        this._formulaData = {};
        this._sheetNameMap = {};
        this._updateRangeList = [];
    }

    getUnitData() {
        return this._unitData;
    }

    getFormulaData() {
        return this._formulaData;
    }

    getSheetNameMap() {
        return this._sheetNameMap;
    }

    isForceCalculate() {
        return this._forceCalculate;
    }

    getUpdateRangeList() {
        return this._updateRangeList;
    }

    load(config: IFormulaDatasetConfig) {
        this._unitData = config.unitData;
        this._formulaData = config.formulaData;
        this._sheetNameMap = config.sheetNameMap;

        this._forceCalculate = config.forceCalculate;

        this._updateRangeList = config.updateRangeList;
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
}

export const IFormulaCurrentConfigService = createIdentifier<FormulaCurrentConfigService>(
    'univer.formula.current-data.service'
);
