import type { IArrayFormulaUnitDataType, IUnitArrayFormulaDataType } from '@univerjs/base-formula-engine';
import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { FormulaDataModel } from '../../models/formula-data.model';

export interface ISetArrayFormulaDataMutationParams {
    arrayFormulaData: IUnitArrayFormulaDataType;
    arrayFormulaUnitData: IArrayFormulaUnitDataType;
}

export const SetArrayFormulaDataMutation: IMutation<ISetArrayFormulaDataMutationParams> = {
    id: 'formula.mutation.set-array-formula-data',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetArrayFormulaDataMutationParams) => {
        const formulaDataModel = accessor.get(FormulaDataModel);
        formulaDataModel.setArrayFormulaData(params.arrayFormulaData);
        formulaDataModel.setArrayFormulaUnitData(params.arrayFormulaUnitData);
        return true;
    },
};
