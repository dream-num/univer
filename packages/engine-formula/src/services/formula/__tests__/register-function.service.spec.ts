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

import { Injector, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FunctionType } from '../../../basics/function';
import { FormulaCacheService } from '../../formula-cache.service';
import { FunctionService, IFunctionService } from '../../function.service';
import { DescriptionService, IDescriptionService } from '../description.service';
import { IRegisterFunctionService, RegisterFunctionService } from '../register-function.service';

describe('RegisterFunctionService', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();

        injector.get(LocaleService).load({
            [LocaleType.ZH_CN]: {},
            [LocaleType.EN_US]: {},
        });
        injector.add([FormulaCacheService]);
        injector.add([IFunctionService, { useClass: FunctionService }]);
        injector.add([IDescriptionService, { useClass: DescriptionService }]);
    });

    afterEach(() => {
        univer.dispose();
    });

    it.each([false, true])('retains a factory for callback registrations (async=%s)', async (asyncMode) => {
        const injector = univer.__getInjector();
        injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);
        const registration = injector.get(IRegisterFunctionService).registerFunction({
            name: 'SCALE',
            description: '',
            async: asyncMode,
            func: asyncMode ? (value) => Promise.resolve(Number(value) * 2) : (value) => Number(value) * 2,
        });
        const target = new Injector();
        target.add([FormulaCacheService]);
        target.add([IFunctionService, { useClass: FunctionService }]);
        try {
            const host = injector.get(IFunctionService);
            const functions = target.get(IFunctionService);
            functions.registerFunctionFactories(...host.getFunctionRegistrations());
            expect(await functions.getExecutor('SCALE')!.calculateCustom(7)).toBe(14);
            expect(functions.getExecutor('SCALE')!.isAsync()).toBe(asyncMode);
            expect(functions.getExecutor('SCALE')).not.toBe(host.getExecutor('SCALE'));
            registration.dispose();
            expect(host.getFunctionRegistrations()).toEqual([]);
        } finally {
            target.dispose();
        }
    });

    it('registers and disposes a single synchronous function with generated description', () => {
        const injector = univer.__getInjector();
        injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);

        const registerFunctionService = injector.get(IRegisterFunctionService);
        const functionService = injector.get(IFunctionService);

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
});
