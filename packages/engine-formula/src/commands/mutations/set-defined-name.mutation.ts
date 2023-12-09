import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

export interface ISetDefinedNameMutationSearchParam {
    unitId: string;
    name: string;
}

export interface ISetDefinedNameMutationParam extends ISetDefinedNameMutationSearchParam {
    formulaOrRefString: string;
}
/**
 * In the formula engine, the mutation is solely responsible for communication between the worker and the main thread.
 * It requires setting local to true during execution.
 */
export const SetDefinedNameMutation: IMutation<ISetDefinedNameMutationParam> = {
    id: 'formula.mutation.set-defined-name',
    type: CommandType.MUTATION,
    handler: () => true,
};

export const RemoveDefinedNameMutation: IMutation<ISetDefinedNameMutationSearchParam> = {
    id: 'formula.mutation.remove-defined-name',
    type: CommandType.MUTATION,
    handler: () => true,
};
