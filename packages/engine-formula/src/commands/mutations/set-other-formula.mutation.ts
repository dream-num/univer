import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import type {
    IOtherFormulaManagerInsertParam,
    IOtherFormulaManagerSearchParam,
} from '../../services/other-formula-manager.service';

/**
 * In the formula engine, the mutation is solely responsible for communication between the worker and the main thread.
 * It requires setting local to true during execution.
 */
export const SetOtherFormulaMutation: IMutation<IOtherFormulaManagerInsertParam> = {
    id: 'formula.mutation.set-other-formula',
    type: CommandType.MUTATION,
    handler: () => true,
};

export const RemoveOtherFormulaMutation: IMutation<IOtherFormulaManagerSearchParam> = {
    id: 'formula.mutation.remove-other-formula',
    type: CommandType.MUTATION,
    handler: () => true,
};
