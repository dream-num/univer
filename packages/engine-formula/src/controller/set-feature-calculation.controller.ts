import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';

import {
    type ISetFeatureCalculationMutation,
    RemoveFeatureCalculationMutation,
    SetFeatureCalculationMutation,
} from '../commands/mutations/set-feature-calculation.mutation';
import { IFeatureCalculationManagerService } from '../services/feature-calculation-manager.service';

@OnLifecycle(LifecycleStages.Ready, SetFeatureCalculationController)
export class SetFeatureCalculationController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFeatureCalculationManagerService
        private readonly _featureCalculationManagerService: IFeatureCalculationManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFeatureCalculationMutation.id) {
                    const params = command.params as ISetFeatureCalculationMutation;
                    if (params == null) {
                        return;
                    }
                    const { featureId, calculationParam } = params;
                    this._featureCalculationManagerService.register(featureId, calculationParam);
                } else if (command.id === RemoveFeatureCalculationMutation.id) {
                    const params = command.params as { featureId: string };
                    if (params == null) {
                        return;
                    }
                    const { featureId } = params;
                    this._featureCalculationManagerService.remove(featureId);
                }
            })
        );
    }
}
