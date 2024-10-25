/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, Inject } from '@univerjs/core';

import { RemoveDefinedNameMutation, SetDefinedNameMutation } from '../commands/mutations/set-defined-name.mutation';
import {
    type ISetSuperTableMutationParam,
    type ISetSuperTableMutationSearchParam,
    SetSuperTableOptionMutation,
} from '../commands/mutations/set-super-table.mutation';
import { type ISuperTableOptionParam, SuperTableService } from '../services/super-table.service';

/**
 * This controller is for syncing super tables between the host thread and the worker thread.
 *
 * @deprecated Should be under formula interface.
 */
export class SetSuperTableController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SuperTableService) private readonly _superTableService: SuperTableService
    ) {
        super();

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
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
        }));
    }
}
