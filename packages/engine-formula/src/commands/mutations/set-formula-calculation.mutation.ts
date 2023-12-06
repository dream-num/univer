import type { ICommandInfo, IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { IRuntimeOtherUnitDataType, IRuntimeUnitDataType } from '../../basics/common';
import type { FormulaExecutedStateType, IExecutionInProgressParams } from '../../services/runtime.service';

export interface ISetFormulaCalculationStartMutation {
    commands: ICommandInfo[];
    forceCalculation?: boolean;
}
/**
 * TODO: @DR-Univer
 * Trigger the calculation of the formula and stop the formula
 */
export const SetFormulaCalculationStartMutation: IMutation<ISetFormulaCalculationStartMutation> = {
    id: 'formula.mutation.set-formula-calculation-start',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFormulaCalculationStartMutation) => true,
};

export interface ISetFormulaCalculationStopMutation {}

export const SetFormulaCalculationStopMutation: IMutation<ISetFormulaCalculationStopMutation> = {
    id: 'formula.mutation.set-formula-calculation-stop',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFormulaCalculationStopMutation) => true,
};

export interface ISetFormulaCalculationNotificationMutation {
    functionsExecutedState?: FormulaExecutedStateType;
    stageInfo?: IExecutionInProgressParams;
}

export const SetFormulaCalculationNotificationMutation: IMutation<ISetFormulaCalculationNotificationMutation> = {
    id: 'formula.mutation.set-formula-calculation-notification',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFormulaCalculationNotificationMutation) => true,
};

export interface ISetFormulaCalculationResultMutation {
    unitData: IRuntimeUnitDataType;
    unitOtherData: IRuntimeOtherUnitDataType;
}

export const SetFormulaCalculationResultMutation: IMutation<ISetFormulaCalculationResultMutation> = {
    id: 'formula.mutation.set-formula-calculation-result',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFormulaCalculationResultMutation) => true,
};
