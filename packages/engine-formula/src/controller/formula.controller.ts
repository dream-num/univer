import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';

import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';

@OnLifecycle(LifecycleStages.Ready, FormulaController)
export class FormulaController extends Disposable {
    constructor(@ICommandService private readonly _commandService: ICommandService) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerCommands();
    }

    private _registerCommands(): void {
        [
            SetFormulaDataMutation,
            SetArrayFormulaDataMutation,
            SetFormulaCalculationStartMutation,
            SetFormulaCalculationStopMutation,
            SetFormulaCalculationNotificationMutation,
            SetFormulaCalculationResultMutation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}
