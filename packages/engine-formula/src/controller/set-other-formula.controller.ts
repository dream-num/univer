import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';

import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '../commands/mutations/set-other-formula.mutation';
import {
    type IOtherFormulaManagerInsertParam,
    type IOtherFormulaManagerSearchParam,
    IOtherFormulaManagerService,
} from '../services/other-formula-manager.service';

@OnLifecycle(LifecycleStages.Ready, SetOtherFormulaController)
export class SetOtherFormulaController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IOtherFormulaManagerService private readonly _otherFormulaManagerService: IOtherFormulaManagerService
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
                if (command.id === SetOtherFormulaMutation.id) {
                    const params = command.params as IOtherFormulaManagerInsertParam;
                    if (params == null) {
                        return;
                    }

                    this._otherFormulaManagerService.register(params);
                } else if (command.id === RemoveOtherFormulaMutation.id) {
                    const params = command.params as IOtherFormulaManagerSearchParam;
                    if (params == null) {
                        return;
                    }

                    this._otherFormulaManagerService.remove(params);
                }
            })
        );
    }
}
