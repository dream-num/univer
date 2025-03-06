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

import type { BaseFunction } from '@univerjs/engine-formula';
import { createIdentifier } from '@univerjs/core';
import { AsyncCustomFunction, CustomFunction, IFunctionService } from '@univerjs/engine-formula';

export interface IRemoteRegisterFunctionService {
    registerFunctions(serializedFuncs: Array<[string, string]>): Promise<void>;
    registerAsyncFunctions(serializedFuncs: Array<[string, string]>): Promise<void>;
    unregisterFunctions(names: string[]): Promise<void>;
}

export const RemoteRegisterFunctionServiceName = 'sheets-formula.remote-register-function.service';
export const IRemoteRegisterFunctionService = createIdentifier<IRemoteRegisterFunctionService>(RemoteRegisterFunctionServiceName);

/**
 * This class should resident in the remote process.
 */
export class RemoteRegisterFunctionService implements IRemoteRegisterFunctionService {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService
    ) {}

    async registerFunctions(serializedFuncs: Array<[string, string]>): Promise<void> {
        const functionList = serializedFuncs.map(([func, name]) => {
            return createFunction(func, name);
        });

        this._functionService.registerExecutors(...functionList);
    }

    async registerAsyncFunctions(serializedFuncs: Array<[string, string]>): Promise<void> {
        const functionList = serializedFuncs.map(([func, name]) => {
            return createAsyncFunction(func, name);
        });

        this._functionService.registerExecutors(...functionList);
    }

    async unregisterFunctions(names: string[]): Promise<void> {
        this._functionService.unregisterExecutors(...names);
        this._functionService.unregisterDescriptions(...names);
        this._functionService.deleteFormulaAstCacheKey(...names);
    }
}

function createFunction(functionString: string, functionName: string) {
    const instance = new CustomFunction(functionName);
    // eslint-disable-next-line no-new-func
    const functionCalculate = new Function(`return ${functionString}`)();
    instance.calculateCustom = functionCalculate;
    return instance as BaseFunction;
}

function createAsyncFunction(functionString: string, functionName: string) {
    const instance = new AsyncCustomFunction(functionName);
    // eslint-disable-next-line no-new-func
    const functionCalculate = new Function(`return ${functionString}`)();
    instance.calculateCustom = functionCalculate;
    return instance as BaseFunction;
}
