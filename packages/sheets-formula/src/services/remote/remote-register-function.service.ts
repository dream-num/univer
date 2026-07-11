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

import { createIdentifier } from '@univerjs/core';
import { IFunctionService } from '@univerjs/engine-formula';

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
        rejectRemoteCustomFunctionRegistration(serializedFuncs);
    }

    async registerAsyncFunctions(serializedFuncs: Array<[string, string]>): Promise<void> {
        rejectRemoteCustomFunctionRegistration(serializedFuncs);
    }

    async unregisterFunctions(names: string[]): Promise<void> {
        this._functionService.unregisterExecutors(...names);
        this._functionService.unregisterDescriptions(...names);
        this._functionService.deleteFormulaAstCacheKey(...names);
    }
}

function rejectRemoteCustomFunctionRegistration(serializedFuncs: Array<[string, string]>): void {
    if (serializedFuncs.length === 0) {
        return;
    }

    throw new Error('Remote custom function registration is disabled because function deserialization over RPC is unsafe.');
}
