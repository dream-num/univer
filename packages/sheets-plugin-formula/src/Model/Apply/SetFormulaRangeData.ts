import { FormulaDataType } from '@univerjs/base-formula-engine';
import { Tools, Workbook } from '@univerjs/core';

import { FormulaController } from '../../Controller/FormulaController';

export function SetFormulaRangeData(workbook: Workbook, formulaData: FormulaDataType, _formulaController: FormulaController): FormulaDataType {
    const formulaDataModel = _formulaController.getDataModel();

    // store old result
    const result = Tools.deepClone(formulaDataModel.getFormulaData());

    // update
    formulaDataModel.setFormulaData(formulaData);

    return result as FormulaDataType;
}
