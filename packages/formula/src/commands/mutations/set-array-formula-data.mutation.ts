import type { IMutation } from '@univerjs/core';
import { CommandType, Tools } from '@univerjs/core';
import type { IArrayFormulaRangeType, IArrayFormulaUnitCellType } from '@univerjs/engine-formula';
import type { IAccessor } from '@wendellhu/redi';

import { FormulaDataModel } from '../../models/formula-data.model';

export interface ISetArrayFormulaDataMutationParams {
    arrayFormulaRange: IArrayFormulaRangeType;
    arrayFormulaCellData: IArrayFormulaUnitCellType;
}

export const SetArrayFormulaDataUndoMutationFactory = (accessor: IAccessor): ISetArrayFormulaDataMutationParams => {
    const formulaDataModel = accessor.get(FormulaDataModel);
    const arrayFormulaRange = Tools.deepClone(formulaDataModel.getArrayFormulaRange());
    const arrayFormulaCellData = Tools.deepClone(formulaDataModel.getArrayFormulaCellData());
    return {
        arrayFormulaRange,
        arrayFormulaCellData,
    };
};

export const SetArrayFormulaDataMutation: IMutation<ISetArrayFormulaDataMutationParams> = {
    id: 'formula.mutation.set-array-formula-data',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetArrayFormulaDataMutationParams) => {
        const formulaDataModel = accessor.get(FormulaDataModel);
        formulaDataModel.setArrayFormulaRange(params.arrayFormulaRange);
        formulaDataModel.setArrayFormulaCellData(params.arrayFormulaCellData);
        return true;
    },
};
