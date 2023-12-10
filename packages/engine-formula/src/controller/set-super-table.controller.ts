import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';

import { RemoveDefinedNameMutation, SetDefinedNameMutation } from '../commands/mutations/set-defined-name.mutation';
import {
    type ISetSuperTableMutationParam,
    type ISetSuperTableMutationSearchParam,
    SetSuperTableOptionMutation,
} from '../commands/mutations/set-super-table.mutation';
import type { ISuperTableOptionParam } from '../services/super-table.service';
import { ISuperTableService } from '../services/super-table.service';

@OnLifecycle(LifecycleStages.Ready, SetSuperTableController)
export class SetSuperTableController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @ISuperTableService private readonly _superTableService: ISuperTableService
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
                    const params = command.params as ISetSuperTableMutationParam;
                    if (params == null) {
                        return;
                    }
                    const { unitId, tableName, reference } = params;
                    this._superTableService.registerTable(unitId, tableName, reference);
                } else if (command.id === RemoveDefinedNameMutation.id) {
                    const params = command.params as ISetSuperTableMutationSearchParam;
                    if (params == null) {
                        return;
                    }
                    const { unitId, tableName } = params;
                    this._superTableService.remove(unitId, tableName);
                } else if (command.id === SetSuperTableOptionMutation.id) {
                    const params = command.params as ISuperTableOptionParam;
                    if (params == null) {
                        return;
                    }
                    const { tableOption, tableOptionType } = params;
                    this._superTableService.registerTableOptionMap(tableOption, tableOptionType);
                }
            })
        );
    }
}
