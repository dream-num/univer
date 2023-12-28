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

import { Disposable, DisposableCollection, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IFunctionNames } from '@univerjs/engine-formula';
import { BaseFunction, IFunctionService, RegisterFunctionMutation } from '@univerjs/engine-formula';
import type { Ctor } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Ready, FormulaAlgorithmController)
export class FormulaAlgorithmController extends Disposable {
    constructor(
        private _function: Array<[Ctor<BaseFunction>, IFunctionNames]>,
        @IFunctionService private readonly _functionService: IFunctionService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerFunctions();
    }

    private _registerFunctions() {
        const functions: BaseFunction[] = [...this._function].map((registerObject) => {
            const Func = registerObject[0] as Ctor<BaseFunction>;
            const name = registerObject[1] as IFunctionNames;

            return new Func(name);
        });

        this._functionService.registerExecutors(...functions);

        const functionList = functions.map((func) => funcToString(func));

        // Synchronous to worker
        this._commandService.executeCommand(
            RegisterFunctionMutation.id,
            {
                functions: functionList,
            },
            {
                local: true,
            }
        );
    }
}

function funcToString(func: any) {
    const coll = new DisposableCollection();
    const collAsString = instanceToString(coll).replace(/(?<=class)\b/, ' DisposableCollection');
    // console.log(collAsString);

    const dis = new Disposable();
    const disAsString = instanceToString(dis).replace(/(?<=class)\b/, ' Disposable');
    // console.log(disAsString);

    const instance = new BaseFunction(func.name);
    const instanceAsString = instanceToString(instance).replace(/(?<=class)\b/, ' BaseFunction');

    // const func = new Sum('SUM');
    const name = func.name.slice(0, 1) + func.name.slice(1).toLocaleLowerCase();
    const funcAsString = instanceToString(func).replace(/(?<=class)\b/, ` ${name}`);

    return `function (){${collAsString}\n${disAsString}\n${instanceAsString}\n${funcAsString}; return ${name} }()`;
}

function instanceToString(instance: { [key: string]: any }) {
    return instance.constructor.toString();
}
