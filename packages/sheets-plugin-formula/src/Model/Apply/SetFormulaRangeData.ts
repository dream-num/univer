import { Tools, Workbook } from '@univer/core';
import { FormulaDataType } from '@univer/base-formula-engine';
import { FORMULA_PLUGIN_NAME } from '../../Basic';
import { FormulaPlugin } from '../../FormulaPlugin';

export function SetFormulaRangeData(workbook: Workbook, formulaData: FormulaDataType): FormulaDataType {
    const formulaDataModel = workbook.getContext().getPluginManager().getRequirePluginByName<FormulaPlugin>(FORMULA_PLUGIN_NAME).getFormulaController().getDataModel();

    // store old result
    const result = Tools.deepClone(formulaDataModel.getFormulaData());

    // update
    formulaDataModel.setFormulaData(formulaData);

    return result;
}
