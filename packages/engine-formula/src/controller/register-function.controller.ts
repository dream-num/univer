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
import { Inject } from '@wendellhu/redi';

import type { IRegisterFunctionMutationParam } from '../commands/mutations/register-function.mutation';
import { RegisterFunctionMutation } from '../commands/mutations/register-function.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import { IFunctionService } from '../services/function.service';

@OnLifecycle(LifecycleStages.Ready, RegisterFunctionController)
export class RegisterFunctionController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @IFunctionService private readonly _functionService: IFunctionService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo, options) => {
                if (command.id === RegisterFunctionMutation.id) {
                    const params = command.params as IRegisterFunctionMutationParam;

                    if (params == null) {
                        return;
                    }

                    const { functions } = params;
                    const functionList = functions.map((func) => {
                        // eslint-disable-next-line @typescript-eslint/no-implied-eval
                        const Instance = new Function(`return ${func}`)();
                        const name = Instance.name.toLocaleUpperCase();
                        return new Instance(name);
                    });
                    this._functionService.registerExecutors(...functionList);
                }
            })
        );
    }
}
