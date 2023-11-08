import { ArrayFormulaDataType, FormulaDataType } from '@univerjs/base-formula-engine';
import { Disposable, ObjectMatrix } from '@univerjs/core';

export interface IFormulaConfig {
    formulaData: FormulaDataType;
    calculationChain?: string[];
    recalculationMode?: RecalculationModeType;
}

export enum RecalculationModeType {
    AUTOMATIC = 'Automatic',
    MANUAL = 'Manual',
    AUTOMATIC_EXCEPT_TABLE = 'AutomaticExceptTable',
}

export class FormulaDataModel extends Disposable {
    private _formulaData: FormulaDataType = {};

    private _arrayFormulaData: ArrayFormulaDataType = {};

    private _calculationChain: string[] = [];

    private _recalculationMode = RecalculationModeType.AUTOMATIC;

    constructor(config?: IFormulaConfig) {
        super();

        if (config?.formulaData) {
            this._formulaData = config.formulaData;
        }

        if (config?.calculationChain) {
            this._calculationChain = config.calculationChain;
        }

        if (config?.recalculationMode) {
            this._recalculationMode = config.recalculationMode;
        }
    }

    getFormulaData() {
        return this._formulaData;
    }

    setFormulaData(value: FormulaDataType) {
        this._formulaData = value;
    }

    getArrayFormulaData(): ArrayFormulaDataType {
        return this._arrayFormulaData;
    }

    setArrayFormulaData(value: ArrayFormulaDataType) {
        Object.keys(value).forEach((sheetId) => {
            const arrayFormula = value[sheetId];
            if (!this._arrayFormulaData[sheetId]) {
                this._arrayFormulaData[sheetId] = new ObjectMatrix();
            }
            arrayFormula.forValue((r, c, v) => {
                this._arrayFormulaData[sheetId].setValue(r, c, v);
            });
        });
    }
}
