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

import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { BaseFunction, IFunctionNames } from '@univerjs/engine-formula';
import { IFunctionService } from '@univerjs/engine-formula';
import type { Ctor } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Ready, FormulaAlgorithmController)
export class FormulaAlgorithmController extends Disposable {
    constructor(
        private _function: Array<[Ctor<BaseFunction>, IFunctionNames]>,
        @IFunctionService private readonly _functionService: IFunctionService
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
    }
}
