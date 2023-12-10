import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import type { ISuperTable } from '../../basics/common';
import type { ISuperTableOptionParam } from '../../services/super-table.service';

export interface ISetSuperTableMutationSearchParam {
    unitId: string;
    tableName: string;
}

export interface ISetSuperTableMutationParam extends ISetSuperTableMutationSearchParam {
    reference: ISuperTable;
}
/**
 * In the formula engine, the mutation is solely responsible for communication between the worker and the main thread.
 * It requires setting local to true during execution.
 */
export const SetSuperTableMutation: IMutation<ISetSuperTableMutationParam> = {
    id: 'formula.mutation.set-super-table',
    type: CommandType.MUTATION,
    handler: () => true,
};

export const RemoveSuperTableMutation: IMutation<ISetSuperTableMutationSearchParam> = {
    id: 'formula.mutation.remove-super-table',
    type: CommandType.MUTATION,
    handler: () => true,
};

export const SetSuperTableOptionMutation: IMutation<ISuperTableOptionParam> = {
    id: 'formula.mutation.set-super-table-option',
    type: CommandType.MUTATION,
    handler: () => true,
};
