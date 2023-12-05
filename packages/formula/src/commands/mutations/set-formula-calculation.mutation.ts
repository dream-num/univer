import type { ICommandInfo, IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { FormulaExecutedStateType, IExecutionInProgressParams } from '@univerjs/engine-formula';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetFormulaCalculationStartMutation {
    commands: ICommandInfo[];
    forceCalculation?: boolean;
}
/**
 * TODO: @DR-Univer
 * Trigger the calculation of the formula and stop the formula
 */
export const setFormulaCalculationStartMutation: IMutation<ISetFormulaCalculationStartMutation> = {
    id: 'formula.mutation.set-formula-calculation-start',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFormulaCalculationStartMutation) => true,
};

export interface ISetFormulaCalculationStopMutation {}

export const setFormulaCalculationStopMutation: IMutation<ISetFormulaCalculationStopMutation> = {
    id: 'formula.mutation.set-formula-calculation-stop',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFormulaCalculationStopMutation) => true,
};

export interface ISetFormulaCalculationNotificationMutation {
    functionsExecutedState?: FormulaExecutedStateType;
    stageInfo?: IExecutionInProgressParams;
}

export const setFormulaCalculationNotificationMutation: IMutation<ISetFormulaCalculationNotificationMutation> = {
    id: 'formula.mutation.set-formula-calculation-notification',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFormulaCalculationNotificationMutation) => true,
};
