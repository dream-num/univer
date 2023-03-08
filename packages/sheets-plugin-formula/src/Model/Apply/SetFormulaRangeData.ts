import { Tools, Workbook } from '@univerjs/core';
import { FormulaDataType } from '@univerjs/base-formula-engine';
import { FORMULA_PLUGIN_NAME } from '../../Basics';
import { FormulaPlugin } from '../../FormulaPlugin';

export function SetFormulaRangeData(workbook: Workbook, formulaData: FormulaDataType): FormulaDataType {
    const formulaDataModel = workbook.getContext().getPluginManager().getRequirePluginByName<FormulaPlugin>(FORMULA_PLUGIN_NAME).getFormulaController().getDataModel();

    // store old result
    const result = Tools.deepClone(formulaDataModel.getFormulaData());

    // update
    formulaDataModel.setFormulaData(formulaData);

    return result;
}
