import { Disposable, IUnitRange } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import { FormulaDataType, IFormulaDatasetConfig, SheetNameMapType, UnitDataType } from '../Basics/Common';

export interface ICurrentConfigService {
    getUnitData(): UnitDataType;

    getFormulaData(): FormulaDataType;

    getSheetNameMap(): SheetNameMapType;

    isForceCalculate(): boolean;

    getUpdateRangeList(): IUnitRange[];

    registerUnitData(unitData: UnitDataType): void;

    registerFormulaData(formulaData: FormulaDataType): void;

    registerSheetNameMap(sheetNameMap: SheetNameMapType): void;
}

export class CurrentConfigService extends Disposable implements ICurrentConfigService {
    private _unitData: UnitDataType = {};
    private _formulaData: FormulaDataType = {};
    private _sheetNameMap: SheetNameMapType = {};

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

    registerUnitData(unitData: UnitDataType) {
        this._unitData = unitData;
    }

    registerFormulaData(formulaData: FormulaDataType) {
        this._formulaData = formulaData;
    }

    registerSheetNameMap(sheetNameMap: SheetNameMapType) {
        this._sheetNameMap = sheetNameMap;
    }
}

export const ICurrentConfigService = createIdentifier<CurrentConfigService>('univer.formula.current-data.service');
