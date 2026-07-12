/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import type { IRemoveSuperTableMutationParam, ISetSuperTableMutationParam } from '../commands/mutations/set-super-table.mutation';
import { Disposable, toDisposable } from '@univerjs/core';
import { RemoveSuperTableMutation, SetSuperTableMutation } from '../commands/mutations/set-super-table.mutation';
import { IActiveDirtyManagerService } from '../services/active-dirty-manager.service';

export class SuperTableActiveDirtyController extends Disposable {
    constructor(@IActiveDirtyManagerService private readonly _activeDirtyManagerService: IActiveDirtyManagerService) {
        super();
        this._initialize();
    }

    private _initialize(): void {
        this._activeDirtyManagerService.register(SetSuperTableMutation.id, {
            commandId: SetSuperTableMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as ISetSuperTableMutationParam;
                const tableNames = [params.tableName, params.oldTableName].filter((name): name is string => Boolean(name));
                return {
                    dirtyRanges: [{ unitId: params.unitId, sheetId: params.reference.sheetId, range: params.reference.range }],
                    dirtySuperTableMap: {
                        [params.unitId]: Object.fromEntries(tableNames.map((name) => [name, '1'])),
                    },
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.reference.sheetId]: '1',
                        },
                    },
                };
            },
        });

        this._activeDirtyManagerService.register(RemoveSuperTableMutation.id, {
            commandId: RemoveSuperTableMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IRemoveSuperTableMutationParam;
                return {
                    dirtyRanges: params.reference
                        ? [{ unitId: params.unitId, sheetId: params.reference.sheetId, range: params.reference.range }]
                        : undefined,
                    dirtySuperTableMap: {
                        [params.unitId]: {
                            [params.tableName]: '1',
                        },
                    },
                    clearDependencyTreeCache: params.reference
                        ? { [params.unitId]: { [params.reference.sheetId]: '1' } }
                        : undefined,
                };
            },
        });

        this.disposeWithMe(toDisposable(() => {
            this._activeDirtyManagerService.remove(SetSuperTableMutation.id);
            this._activeDirtyManagerService.remove(RemoveSuperTableMutation.id);
        }));
    }
}
