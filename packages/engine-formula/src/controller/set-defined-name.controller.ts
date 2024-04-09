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
                    const { id, unitId, name, formulaOrRefString, comment, hidden, localSheetId } = params;
                    this._definedNamesService.registerDefinedName(unitId, {
                        id,
                        name: name.trim(),
                        formulaOrRefString: formulaOrRefString.trim(),
                        comment: comment?.trim(),
                        hidden,
                        localSheetId,
                    });
                } else if (command.id === RemoveDefinedNameMutation.id) {
                    const params = command.params as ISetDefinedNameMutationSearchParam;
                    if (params == null) {
                        return;
                    }
                    const { unitId, id } = params;
                    this._definedNamesService.removeDefinedName(unitId, id);
                }
            })
        );
    }
}
