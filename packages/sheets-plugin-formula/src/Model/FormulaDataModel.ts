import { FormulaDataType } from '@univer/base-formula-engine';
import { IFormulaConfig, RecalculationModeType } from '../Basic/IFormula';

export class FormulaDataModel {
    private _formulaData: FormulaDataType = {};

    private _calculationChain: string[] = [];

    private _recalculationMode = RecalculationModeType.AUTOMATIC;

    constructor(config?: IFormulaConfig) {
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
}
