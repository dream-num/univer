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

import { ICommandService, Inject, Injector, LocaleService, LocaleType, ObjectMatrix, Plugin } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import type { IFormulaDatasetConfig } from '../../basics/common';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import type { IAllRuntimeData } from '../runtime.service';
import { SetArrayFormulaDataMutation } from '../../commands/mutations/set-array-formula-data.mutation';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaDependencyCalculationResultMutation,
} from '../../commands/mutations/set-formula-calculation.mutation';
import { CalculateController } from '../../controllers/calculate.controller';
import { createCommandTestBed } from '../../engine/analysis/__tests__/create-command-test-bed';
import { Lexer } from '../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../engine/analysis/parser';
import { AstRootNode } from '../../engine/ast-node/ast-root-node';
import { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import { Interpreter } from '../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../engine/utils/ast-node-tool';
import { generateAstNode } from '../../engine/utils/generate-ast-node';
import { AsyncCustomFunction, CustomFunction } from '../../functions/custom-function';
import { Sum } from '../../functions/math/sum';
import { Minus } from '../../functions/meta/minus';
import { ICalculateFormulaService } from '../calculate-formula.service';
import { IFormulaCurrentConfigService } from '../current-data.service';
import { IDefinedNamesService } from '../defined-names.service';
import { FormulaCacheService } from '../formula-cache.service';
import { DescriptionService, IDescriptionService } from '../formula/description.service';
import { IRegisterFunctionService, RegisterFunctionService } from '../formula/register-function.service';
import { IFunctionService } from '../function.service';
import { IFormulaRuntimeService } from '../runtime.service';

function dataset(client: ReturnType<typeof createCommandTestBed>, values: number[] = [1, 2], formula = '=SUM(A1:A2)'): IFormulaDatasetConfig {
    return {
        allUnitData: { [client.unitId]: { [client.sheetId]: {
            ...client.sheetData[client.sheetId],
            cellData: new ObjectMatrix({ 0: { 0: { v: values[0] }, 2: { f: formula } }, 1: { 0: { v: values[1] } } }),
        } } },
        unitSheetNameMap: { [client.unitId]: { [client.sheetId]: 'Main' } },
        unitStylesData: {},
        formulaData: { [client.unitId]: { [client.sheetId]: { 0: { 2: { f: formula } } } } },
        arrayFormulaCellData: {},
        arrayFormulaRange: {},
        forceCalculate: true,
        dirtyRanges: [],
        dirtyNameMap: {},
        dirtyDefinedNameMap: {},
        dirtyUnitFeatureMap: {},
        dirtyUnitOtherFormulaMap: {},
    };
}

function initialize(client: ReturnType<typeof createCommandTestBed>) {
    client.get(IFormulaCurrentConfigService).load(dataset(client));
    client.get(IFormulaRuntimeService).setCurrent(0, 2, 1, 1, client.sheetId, client.unitId);
}

function evaluate(client: ReturnType<typeof createCommandTestBed>, formula: string) {
    const node = generateAstNode(client.unitId, formula, client.get(Lexer), client.get(AstTreeBuilder), client.get(IFormulaCurrentConfigService), client.sheetId);
    const value = client.get(Interpreter).execute(generateExecuteAstNodeData(node));
    return (value as BaseValueObject).getValue();
}

async function calculate(client: ReturnType<typeof createCommandTestBed>, values: number[], formula = '=SUM(A1:A2)') {
    const service = client.get(ICalculateFormulaService);
    let result: IAllRuntimeData | undefined;
    const sub = service.executionCompleteListener$.subscribe((data) => {
        result = data;
    });
    try {
        await service.execute(dataset(client, values, formula));
        return result?.unitData[client.unitId]?.[client.sheetId]?.getValue(0, 2)?.v;
    } finally { sub.unsubscribe(); }
}

function registerCustom(client: ReturnType<typeof createCommandTestBed>, value: number) {
    const executor = new CustomFunction('CUSTOM');
    executor.calculateCustom = () => value;
    client.get(IFunctionService).registerExecutors(executor);
}

describe('FormulaCacheService calculation isolation', () => {
    it.each([
        ['=CUSTOM(0)', 'CUSTOM', 42],
        ['=CUSTOM (0)', 'CUSTOM', 42],
        ['=_xlfn.CUSTOM(0)', 'CUSTOM', 42],
        ['=_xlws.CUSTOM(0)', 'CUSTOM', 42],
        ['=_xleta.CUSTOM(0)', 'CUSTOM', 42],
        ['=_XlFn.cUsToM (0)', 'CUSTOM', 42],
        ['=-_xlfn.CUSTOM(0)', 'CUSTOM', -42],
        ['=@_xlws.CUSTOM(0)', 'CUSTOM', 42],
        ['=REGEXTEST(0)', 'REGEXMATCH', 42],
        ['=_xlfn.REGEXTEST(0)', 'REGEXMATCH', 42],
    ] as const)('refreshes a cached unknown function through registration: %s', (formula, name, expected) => {
        const client = createCommandTestBed(undefined, [
            [IDescriptionService, { useClass: DescriptionService }],
            [IRegisterFunctionService, { useClass: RegisterFunctionService }],
        ]);
        try {
            initialize(client);
            client.get(LocaleService).load({ [LocaleType.ZH_CN]: {}, [LocaleType.EN_US]: {} });
            const functions = client.get(IFunctionService);
            functions.registerExecutors(new Minus('MINUS'));
            const registration = client.get(IRegisterFunctionService);
            expect(evaluate(client, formula)).toBe('#NAME?');
            const disposable = registration.registerFunction({ name, func: () => 42, description: 'Cache recovery' });
            functions.deleteFormulaAstCacheKey(name);
            expect(evaluate(client, formula)).toBe(expected);
            disposable.dispose();
            expect(evaluate(client, formula)).toBe('#NAME?');
            registration.registerFunction({ name, func: () => 84, description: 'Replacement executor' });
            expect(evaluate(client, formula)).toBe(expected * 2);
        } finally { client.univer.dispose(); }
    });

    it('single instance recalculates aggregates after source values change', async () => {
        const client = createCommandTestBed();
        client.get(IFunctionService).registerExecutors(new Sum('SUM'));
        try {
            expect(await calculate(client, [1, 2])).toBe(3);
            expect(await calculate(client, [10, 20])).toBe(30);
            expect(await calculate(client, [1, 2])).toBe(3);
        } finally { client.univer.dispose(); }
    });

    it('sequential independent engines calculate the same document with different data', async () => {
        const clients = [createCommandTestBed(), createCommandTestBed()];
        clients.forEach((client) => client.get(IFunctionService).registerExecutors(new Sum('SUM')));
        try {
            expect(await calculate(clients[0], [1, 2])).toBe(3);
            expect(await calculate(clients[1], [10, 20])).toBe(30);
        } finally { clients.forEach((client) => client.univer.dispose()); }
    });

    it('concurrent independent engines isolate range array caches', async () => {
        const clients = [createCommandTestBed(), createCommandTestBed()];
        clients.forEach((client) => client.get(IFunctionService).registerExecutors(new Sum('SUM')));
        try {
            const values = await Promise.all([calculate(clients[0], [1, 2]), calculate(clients[1], [10, 20])]);
            expect(values).toEqual([3, 30]);
        } finally { clients.forEach((client) => client.univer.dispose()); }
    });

    it('independent engines isolate expanded defined names with matching document IDs', () => {
        const clients = [createCommandTestBed(), createCommandTestBed()];
        try {
            const values = clients.map((client, index) => {
                initialize(client);
                client.get(IDefinedNamesService).registerDefinedName(client.unitId, {
                    id: 'rate',
                    name: 'LocalRate',
                    formulaOrRefString: String((index + 1) * 10),
                });
                return evaluate(client, '=LocalRate');
            });
            expect(values).toEqual([10, 20]);
        } finally { clients.forEach((client) => client.univer.dispose()); }
    });

    it('single instance refreshes a defined name with its dirty metadata', () => {
        const client = createCommandTestBed();
        try {
            initialize(client);
            const names = client.get(IDefinedNamesService);
            names.registerDefinedName(client.unitId, { id: 'rate', name: 'LocalRate', formulaOrRefString: '10' });
            expect(evaluate(client, '=LocalRate')).toBe(10);
            names.registerDefinedName(client.unitId, { id: 'rate', name: 'LocalRate', formulaOrRefString: '20' });
            client.get(IFormulaCurrentConfigService).load({ ...dataset(client), dirtyDefinedNameMap: { [client.unitId]: { LocalRate: 'LocalRate' } } });
            expect(evaluate(client, '=LocalRate')).toBe(20);
        } finally { client.univer.dispose(); }
    });

    it('refreshes a nested defined name absent from the outer formula text', () => {
        const client = createCommandTestBed();
        try {
            initialize(client);
            const names = client.get(IDefinedNamesService);
            names.registerDefinedName(client.unitId, { id: 'inner', name: 'InnerRate', formulaOrRefString: '10' });
            names.registerDefinedName(client.unitId, { id: 'outer', name: 'OuterRate', formulaOrRefString: 'InnerRate' });
            expect(evaluate(client, '=OuterRate')).toBe(10);
            names.registerDefinedName(client.unitId, { id: 'inner', name: 'InnerRate', formulaOrRefString: '20' });
            client.get(IFormulaCurrentConfigService).load({ ...dataset(client), dirtyDefinedNameMap: { [client.unitId]: { InnerRate: 'InnerRate' } } });
            expect(evaluate(client, '=OuterRate')).toBe(20);
            client.get(IFormulaCurrentConfigService).load(dataset(client));
            expect(evaluate(client, '=OuterRate')).toBe(20);
        } finally { client.univer.dispose(); }
    });

    for (const length of ['short', 'boundary', 'long'] as const) {
        it(`single instance replaces a custom executor with ${length} cache key`, () => {
            const client = createCommandTestBed();
            try {
                initialize(client);
                const originalPrefix = `${client.unitId}:${client.sheetId}:0:0:`;
                const targetLength = length === 'boundary' ? 64 - originalPrefix.length : length === 'long' ? 80 : 9;
                const formula = `=CUSTOM(${'0'.repeat(Math.max(0, targetLength - 9))})`;
                registerCustom(client, 1);
                expect(evaluate(client, formula)).toBe(1);
                const functions = client.get(IFunctionService);
                functions.unregisterExecutors('CUSTOM');
                functions.deleteFormulaAstCacheKey('CUSTOM');
                registerCustom(client, 2);
                expect(evaluate(client, formula)).toBe(2);
            } finally { client.univer.dispose(); }
        });
    }
});

describe('FormulaCacheService lifecycle', () => {
    it('retries a resized reference after an interrupted calculation and releases its context', async () => {
        const client = createCommandTestBed();
        const service = client.get(ICalculateFormulaService);
        let release!: (value: number) => void;
        let started!: () => void;
        let shouldWait = false;
        const pending = new Promise<number>((resolve) => {
            release = resolve;
        });
        const ready = new Promise<void>((resolve) => {
            started = resolve;
        });
        const executor = new AsyncCustomFunction('WAITFORVALUE');
        executor.calculateCustom = async () => {
            if (shouldWait) {
                started();
                return pending;
            }
            return 0;
        };
        client.get(IFunctionService).registerExecutors(new Sum('SUM'), executor);
        const config = dataset(client, [1, 2], '=SUM(A:A,WAITFORVALUE())');
        const sheet = config.allUnitData![client.unitId][client.sheetId];
        sheet.rowCount = 2;
        sheet.cellData.setValue(2, 0, { v: 10 });
        const run = async (forceCalculate: boolean) => {
            let value: unknown;
            const subscription = service.executionCompleteListener$.subscribe((data) => {
                value = data.unitData[client.unitId]?.[client.sheetId]?.getValue(0, 2)?.v;
            });
            try {
                await service.execute({ ...config, forceCalculate });
                return value;
            } finally {
                subscription.unsubscribe();
            }
        };
        try {
            expect(await run(true)).toBe(3);
            sheet.rowCount = 3;
            shouldWait = true;
            const interrupted = run(false);
            await ready;
            const context = client.get(IFormulaRuntimeService).getCalculationCache?.();
            expect(context?.closed).toBe(false);
            service.stopFormulaExecution();
            shouldWait = false;
            release(0);
            await interrupted;
            expect(context?.closed).toBe(true);
            expect(await run(false)).toBe(13);
        } finally {
            release(0);
            client.univer.dispose();
        }
    });

    it('releases an initialized cache when a later plugin constructor fails', () => {
        const client = createCommandTestBed();
        const cache = client.get(FormulaCacheService);
        const context = cache.createCalculation();
        class FailingPlugin extends Plugin {
            static override pluginName = 'formula-cache-failing-initialization';

            constructor(
                _config: undefined,
                @Inject(Injector) protected override readonly _injector: Injector,
                @Inject(FormulaCacheService) ownedCache: FormulaCacheService
            ) {
                super();
                ownedCache.setAst('partial', client.unitId, new AstRootNode('partial'));
                throw new Error('Expected initialization failure');
            }
        }
        try {
            expect(() => client.univer.registerPlugin(FailingPlugin)).toThrow('Expected initialization failure');
            expect(cache.getAst('partial')).toBeDefined();
        } finally {
            client.univer.dispose();
        }
        expect(context?.closed).toBe(true);
        expect(cache.closed).toBe(true);
        expect(cache.getAst('partial')).toBeUndefined();
    });

    it('detaches calculation result and progress forwarding when the controller is disposed', async () => {
        const client = createCommandTestBed(undefined, [[CalculateController]]);
        client.get(IFunctionService).registerExecutors(new Sum('SUM'));
        const commands = client.get(ICommandService);
        [SetArrayFormulaDataMutation, SetFormulaCalculationNotificationMutation, SetFormulaCalculationResultMutation, SetFormulaDependencyCalculationResultMutation]
            .forEach((mutation) => commands.registerCommand(mutation));
        const seen: string[] = [];
        const listener = commands.onCommandExecuted((command) => seen.push(command.id));
        const controller = client.get(CalculateController);
        try {
            expect(await calculate(client, [1, 2])).toBe(3);
            expect(seen).toContain(SetFormulaCalculationNotificationMutation.id);
            controller.dispose();
            seen.length = 0;
            expect(await calculate(client, [10, 20])).toBe(30);
            expect(seen).toEqual([]);
        } finally {
            listener.dispose();
            client.univer.dispose();
        }
    });

    it('releases cached references across 100 create/dispose cycles without evicting another engine', async () => {
        const survivor = createCommandTestBed();
        survivor.get(IFunctionService).registerExecutors(new Sum('SUM'));
        try {
            expect(await calculate(survivor, [10, 20])).toBe(30);
            const survivorCache = survivor.get(FormulaCacheService);
            const survivorAst = new AstRootNode('survivor');
            survivorCache.setAst('survivor', survivor.unitId, survivorAst);
            for (let round = 0; round < 100; round++) {
                const client = createCommandTestBed();
                client.get(IFunctionService).registerExecutors(new Sum('SUM'));
                const cache = client.get(FormulaCacheService);
                expect(await calculate(client, [1, 2])).toBe(3);
                const context = client.get(IFormulaRuntimeService).getCalculationCache?.();
                cache.setAst('late', client.unitId, new AstRootNode('late'));
                client.univer.dispose();
                cache.dispose();
                expect(context?.closed).toBe(true);
                expect(cache.closed).toBe(true);
                expect(cache.getAst('late')).toBeUndefined();
                expect(cache.createCalculation()).toBeUndefined();
                cache.setAst('late', 'new', new AstRootNode('must not survive'));
                expect(cache.getAst('late')).toBeUndefined();
                expect(survivorCache.getAst('survivor')).toBe(survivorAst);
            }
            expect(await calculate(survivor, [20, 40])).toBe(60);
        } finally { survivor.univer.dispose(); }
    });

    it('invalidates only the closed workbook, including long cache keys', () => {
        const client = createCommandTestBed();
        try {
            const cache = client.get(FormulaCacheService);
            const first = new AstRootNode('first');
            const second = new AstRootNode('second');
            const longKey = 'formula'.repeat(30);
            cache.setAst(longKey, 'closed', first);
            cache.setAst('remaining', 'open', second);
            cache.clearUnit('closed');
            expect(cache.getAst(longKey)).toBeUndefined();
            expect(cache.getAst('remaining')).toBe(second);
        } finally { client.univer.dispose(); }
    });

    it('invalidates expanded custom functions by AST tokens, not by a shortened cache key', () => {
        const client = createCommandTestBed();
        try {
            const cache = client.get(FormulaCacheService);
            const ast = new AstRootNode('ROOT');
            new BaseAstNode('CUSTOM').setParent(ast);
            const key = 'LocalRate'.repeat(20);
            cache.setAst(key, client.unitId, ast);
            cache.clearFunctions(['custom']);
            expect(cache.getAst(key)).toBeUndefined();
        } finally { client.univer.dispose(); }
    });

    it('discards a late async result and queued executions after disposal, while a replacement engine works', async () => {
        const client = createCommandTestBed();
        let release!: (value: number) => void;
        let started!: () => void;
        const pending = new Promise<number>((resolve) => {
            release = resolve;
        });
        const ready = new Promise<void>((resolve) => {
            started = resolve;
        });
        const executor = new AsyncCustomFunction('WAITFORVALUE');
        executor.calculateCustom = () => {
            started();
            return pending;
        };
        client.get(IFunctionService).registerExecutors(executor);
        const service = client.get(ICalculateFormulaService);
        const cache = client.get(FormulaCacheService);
        const runtime = client.get(IFormulaRuntimeService);
        let emitted = 0;
        const subscription = service.executionCompleteListener$.subscribe(() => {
            emitted++;
        });
        const first = service.execute(dataset(client, [1, 2], '=WAITFORVALUE()'));
        await ready;
        const queued = service.execute(dataset(client, [9, 9]));
        client.univer.dispose();
        const replacement = createCommandTestBed();
        replacement.get(IFunctionService).registerExecutors(new Sum('SUM'));
        try {
            expect(await calculate(replacement, [10, 20])).toBe(30);
            release(123);
            await Promise.all([first, queued]);
            expect(emitted).toBe(0);
            expect(Object.keys(runtime.getUnitData())).toHaveLength(0);
            expect(Object.keys(runtime.getRuntimeOtherData())).toHaveLength(0);
            expect(cache.closed).toBe(true);
            expect(cache.createCalculation()).toBeUndefined();
        } finally {
            release(123);
            subscription.unsubscribe();
            replacement.univer.dispose();
        }
    });
});
