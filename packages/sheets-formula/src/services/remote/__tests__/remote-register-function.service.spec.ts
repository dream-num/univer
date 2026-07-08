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

import { Injector } from '@univerjs/core';
import { FunctionService, IFunctionService } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { IRemoteRegisterFunctionService, RemoteRegisterFunctionService } from '../remote-register-function.service';

function createService(): { service: IRemoteRegisterFunctionService; functionService: IFunctionService } {
    const injector = new Injector();
    injector.add([IFunctionService, { useClass: FunctionService }]);
    injector.add([IRemoteRegisterFunctionService, { useClass: RemoteRegisterFunctionService }]);
    return {
        service: injector.get(IRemoteRegisterFunctionService),
        functionService: injector.get(IFunctionService),
    };
}

describe('RemoteRegisterFunctionService', () => {
    it('rejects serialized remote formula executors without evaluating them', async () => {
        const { service, functionService } = createService();
        const marker = '__REMOTE_REGISTER_FUNCTION_SERVICE_POC_EXECUTED__';

        delete (globalThis as Record<string, unknown>)[marker];

        await expect(service.registerFunctions([
            [`(() => { globalThis.${marker} = true; return (value) => value + 1; })()`, 'REMOTE_ADD_ONE'],
        ])).rejects.toThrow('Remote custom function registration is disabled');

        await expect(service.registerAsyncFunctions([
            [`(() => { globalThis.${marker} = true; return async (value) => value * 2; })()`, 'REMOTE_DOUBLE'],
        ])).rejects.toThrow('Remote custom function registration is disabled');

        expect((globalThis as Record<string, unknown>)[marker]).toBeUndefined();
        expect(functionService.hasExecutor('REMOTE_ADD_ONE')).toBe(false);
        expect(functionService.hasExecutor('REMOTE_DOUBLE')).toBe(false);

        delete (globalThis as Record<string, unknown>)[marker];
    });

    it('removes remote formula executors and their metadata', async () => {
        const { service, functionService } = createService();

        functionService.registerDescriptions({
            functionName: 'REMOTE_ADD_ONE',
            functionType: 0,
            description: 'remote add one',
            abstract: 'remote add one',
            functionParameter: [],
        } as never);
        await service.unregisterFunctions(['REMOTE_ADD_ONE', 'REMOTE_DOUBLE']);

        expect(functionService.hasExecutor('REMOTE_ADD_ONE')).toBe(false);
        expect(functionService.hasExecutor('REMOTE_DOUBLE')).toBe(false);
        expect(functionService.hasDescription('REMOTE_ADD_ONE')).toBe(false);
    });
});
