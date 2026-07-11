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
import { PLUGIN_CONFIG_KEY_BASE } from '../../config/config';
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

    it('does not serialize functions for remote registration when the remote service is present', () => {
        const registerFunctions = vi.fn().mockResolvedValue(undefined);
        const registerAsyncFunctions = vi.fn().mockResolvedValue(undefined);
        const unregisterFunctions = vi.fn().mockResolvedValue(undefined);
        class TestRemoteRegisterFunctionService {
            registerFunctions = registerFunctions;
            registerAsyncFunctions = registerAsyncFunctions;
            unregisterFunctions = unregisterFunctions;
        }
        const injector = univer.__getInjector();

        injector.add([IRemoteRegisterFunctionService, { useClass: TestRemoteRegisterFunctionService as never }]);
        injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);

        const registerFunctionService = injector.get(IRegisterFunctionService);
        const functionService = injector.get(IFunctionService);

        const groupedFunction = () => 1;
        const asyncFunction = async () => 2;
        const groupedToString = vi.fn(() => '() => 1');
        const asyncToString = vi.fn(() => 'async () => 2');
        groupedFunction.toString = groupedToString;
        asyncFunction.toString = asyncToString;

        const groupedDisposable = registerFunctionService.registerFunctions({
            calculate: [
                [groupedFunction, 'REMOTE_GROUPED', 'Remote grouped function'],
            ],
        });
        const asyncDisposable = registerFunctionService.registerAsyncFunction({
            name: 'REMOTE_ASYNC',
            func: asyncFunction,
            description: 'Remote async function',
        });

        expect(functionService.hasExecutor('REMOTE_GROUPED')).toBe(true);
        expect(functionService.hasExecutor('REMOTE_ASYNC')).toBe(true);
        expect(groupedToString).not.toHaveBeenCalled();
        expect(asyncToString).not.toHaveBeenCalled();
        expect(registerFunctions).not.toHaveBeenCalled();
        expect(registerAsyncFunctions).not.toHaveBeenCalled();

        groupedDisposable.dispose();
        asyncDisposable.dispose();

        expect(unregisterFunctions).not.toHaveBeenCalled();
    });
});
