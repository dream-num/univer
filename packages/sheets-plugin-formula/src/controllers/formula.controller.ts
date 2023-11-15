import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';

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
        [SetFormulaDataMutation].forEach((command) =>
            this.disposeWithMe(this._commandService.registerCommand(command))
        );
    }
}
