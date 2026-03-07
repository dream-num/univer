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

import { IConfigService, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { FunctionService, FunctionType, IFunctionService } from '@univerjs/engine-formula';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PLUGIN_CONFIG_KEY_BASE } from '../../controllers/config.schema';
import { DescriptionService, IDescriptionService } from '../description.service';
import { IRegisterFunctionService, RegisterFunctionService } from '../register-function.service';
import { IRemoteRegisterFunctionService } from '../remote/remote-register-function.service';

describe('RegisterFunctionService', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();

        injector.get(LocaleService).load({
            [LocaleType.ZH_CN]: {},
            [LocaleType.EN_US]: {},
        });
        injector.get(IConfigService).setConfig(PLUGIN_CONFIG_KEY_BASE, { description: [] });
        injector.add([IFunctionService, { useClass: FunctionService }]);
        injector.add([IDescriptionService, { useClass: DescriptionService }]);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('registers and disposes a single synchronous function with generated description', () => {
        const injector = univer.__getInjector();
        injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);

        const registerFunctionService = injector.get(IRegisterFunctionService);
        const functionService = injector.get(IFunctionService);
        const deleteFormulaAstCacheKeySpy = vi.spyOn(functionService, 'deleteFormulaAstCacheKey');

        const disposable = registerFunctionService.registerFunction({
            name: 'DOUBLE',
            func: (value) => Number(value) * 2,
            description: 'Double the incoming value',
        });

        expect(functionService.hasExecutor('DOUBLE')).toBe(true);
        expect(functionService.getDescription('DOUBLE')).toMatchObject({
            functionName: 'DOUBLE',
            functionType: FunctionType.User,
            description: 'Double the incoming value',
            abstract: 'Double the incoming value',
        });

        disposable.dispose();

        expect(functionService.hasExecutor('DOUBLE')).toBe(false);
        expect(functionService.hasDescription('DOUBLE')).toBe(false);
        expect(deleteFormulaAstCacheKeySpy).toHaveBeenCalledWith('DOUBLE');
    });

    it('registers grouped functions with fallback descriptions when custom descriptions are omitted', () => {
        const injector = univer.__getInjector();
        injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);

        const registerFunctionService = injector.get(IRegisterFunctionService);
        const functionService = injector.get(IFunctionService);

        const disposable = registerFunctionService.registerFunctions({
            calculate: [
                [(left, right) => Number(left) + Number(right), 'ADD2', 'Add two numbers'],
            ],
        });

        expect(functionService.hasExecutor('ADD2')).toBe(true);
        expect(functionService.getDescription('ADD2')).toMatchObject({
            functionName: 'ADD2',
            abstract: 'Add two numbers',
            description: '',
        });

        disposable.dispose();

        expect(functionService.hasExecutor('ADD2')).toBe(false);
    });

    it('uses remote registration hooks for grouped and async functions when the remote service is present', () => {
        const remoteRegisterFunctionService: IRemoteRegisterFunctionService = {
            registerFunctions: vi.fn().mockResolvedValue(undefined),
            registerAsyncFunctions: vi.fn().mockResolvedValue(undefined),
            unregisterFunctions: vi.fn().mockResolvedValue(undefined),
        };
        const injector = univer.__getInjector();

        injector.add([IRemoteRegisterFunctionService, { useValue: remoteRegisterFunctionService }]);
        injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);

        const registerFunctionService = injector.get(IRegisterFunctionService);

        const groupedDisposable = registerFunctionService.registerFunctions({
            calculate: [
                [() => 1, 'REMOTE_GROUPED', 'Remote grouped function'],
            ],
        });
        const asyncDisposable = registerFunctionService.registerAsyncFunction({
            name: 'REMOTE_ASYNC',
            func: async () => 2,
            description: 'Remote async function',
        });

        expect(remoteRegisterFunctionService.registerFunctions).toHaveBeenCalledTimes(1);
        expect(remoteRegisterFunctionService.registerFunctions).toHaveBeenCalledWith([
            [expect.stringContaining('() => 1'), 'REMOTE_GROUPED'],
        ]);
        expect(remoteRegisterFunctionService.registerAsyncFunctions).toHaveBeenCalledTimes(1);
        expect(remoteRegisterFunctionService.registerAsyncFunctions).toHaveBeenCalledWith([
            [expect.stringContaining('async'), 'REMOTE_ASYNC'],
        ]);

        groupedDisposable.dispose();
        asyncDisposable.dispose();

        expect(remoteRegisterFunctionService.unregisterFunctions).toHaveBeenCalledWith(['REMOTE_GROUPED']);
        expect(remoteRegisterFunctionService.unregisterFunctions).toHaveBeenCalledWith(['REMOTE_ASYNC']);
    });
});
