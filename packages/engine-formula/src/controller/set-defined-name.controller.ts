import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';

import type {
    ISetDefinedNameMutationParam,
    ISetDefinedNameMutationSearchParam,
} from '../commands/mutations/set-defined-name.mutation';
import { RemoveDefinedNameMutation, SetDefinedNameMutation } from '../commands/mutations/set-defined-name.mutation';
import { IDefinedNamesService } from '../services/defined-names.service';

@OnLifecycle(LifecycleStages.Ready, SetDefinedNameController)
export class SetDefinedNameController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService
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
                if (command.id === SetDefinedNameMutation.id) {
                    const params = command.params as ISetDefinedNameMutationParam;
                    if (params == null) {
                        return;
                    }
                    const { unitId, name, formulaOrRefString } = params;
                    this._definedNamesService.registerDefinedName(unitId, name, formulaOrRefString);
                } else if (command.id === RemoveDefinedNameMutation.id) {
                    const params = command.params as ISetDefinedNameMutationSearchParam;
                    if (params == null) {
                        return;
                    }
                    const { unitId, name } = params;
                    this._definedNamesService.removeDefinedName(unitId, name);
                }
            })
        );
    }
}
