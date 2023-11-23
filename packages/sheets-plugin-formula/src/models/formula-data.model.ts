import { ArrayFormulaDataType, IFormulaData } from '@univerjs/base-formula-engine';
import { Disposable, ObjectMatrix } from '@univerjs/core';

export interface IFormulaConfig {
    notExecuteFormula?: boolean;

    formulaData: IFormulaData;
}

export class FormulaDataModel extends Disposable {
    private _formulaData: IFormulaData = {};

    private _arrayFormulaData: ArrayFormulaDataType = {};

    constructor(config?: IFormulaConfig) {
        super();

        if (config?.formulaData) {
            this._formulaData = config.formulaData;
        }
    }

    getFormulaData() {
        return this._formulaData;
    }

    setFormulaData(value: IFormulaData) {
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
