import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import type { IFeatureCalculationManagerParam } from '../../services/feature-calculation-manager.service';

export interface ISetFeatureCalculationMutation {
    featureId: string;
    calculationParam: IFeatureCalculationManagerParam;
}
/**
 * In the formula engine, the mutation is solely responsible for communication between the worker and the main thread.
 * It requires setting local to true during execution.
 */
export const SetFeatureCalculationMutation: IMutation<ISetFeatureCalculationMutation> = {
    id: 'formula.mutation.set-feature-calculation',
    type: CommandType.MUTATION,
    handler: () => true,
};

export const RemoveFeatureCalculationMutation: IMutation<{ featureId: string }> = {
    id: 'formula.mutation.remove-feature-calculation',
    type: CommandType.MUTATION,
    handler: () => true,
};
