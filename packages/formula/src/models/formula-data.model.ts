import { ArrayFormulaDataType, IFormulaData, IFormulaDataItem } from '@univerjs/engine-formula';
import { Disposable, isFormulaId, isFormulaString, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';

export interface IFormulaConfig {
    notExecuteFormula?: boolean;

    formulaData: IFormulaData;
}

export class FormulaDataModel extends Disposable {
    private _formulaData: IFormulaData = {};

    private _arrayFormulaData: ArrayFormulaDataType = {};

    constructor(@IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService) {
        super();
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

    initFormulaData() {
        // load formula data from workbook config data
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        this._formulaData[unitId] = {};

        const worksheets = workbook.getSheets();
        worksheets.forEach((worksheet) => {
            const cellMatrix = worksheet.getCellMatrix();
            const formulaDataMatrix = new ObjectMatrix<IFormulaDataItem>();
            cellMatrix.forValue((r, c, cell) => {
                const formulaString = cell?.f || '';
                const formulaId = cell?.si || '';

                const checkFormulaString = isFormulaString(formulaString);
                const checkFormulaId = isFormulaId(formulaId);

                if (checkFormulaString && checkFormulaId) {
                    formulaDataMatrix.setValue(r, c, {
                        f: formulaString,
                        si: formulaId,
                    });
                } else if (checkFormulaString && !checkFormulaId) {
                    formulaDataMatrix.setValue(r, c, {
                        f: formulaString,
                    });
                } else if (!checkFormulaString && checkFormulaId) {
                    formulaDataMatrix.setValue(r, c, {
                        f: '',
                        si: formulaId,
                    });
                }
            });

            const sheetId = worksheet.getSheetId();
            this._formulaData[unitId][sheetId] = formulaDataMatrix.getData();
        });
    }
}
