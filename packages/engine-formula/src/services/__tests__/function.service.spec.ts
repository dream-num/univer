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

import { createIdentifier, Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import type { IFunctionNames } from '../../basics/function';
import { FunctionType } from '../../basics/function';
import { AstRootNode } from '../../engine/ast-node/ast-root-node';
import { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import { CustomFunction } from '../../functions/custom-function';
import { FormulaCacheService } from '../formula-cache.service';
import { FunctionService } from '../function.service';

function createService() {
    const injector = new Injector();
    injector.add([FormulaCacheService]);
    injector.add([FunctionService]);
    return { injector, service: injector.get(FunctionService), cache: injector.get(FormulaCacheService) };
}

const FACTOR = createIdentifier<number>('test.function-factor');

class StatefulFunction extends CustomFunction {
    #factor: number;

    constructor(name: string, factor: number) {
        super(name);
        this.#factor = factor;
    }

    override calculateCustom(value: number) {
        return value * this.#factor;
    }
}

describe('FunctionService', () => {
    it('recreates stateful functions using the target context without sharing executor state', () => {
        const host = createService();
        const target = createService();
        host.injector.add([FACTOR, { useValue: 2 }]);
        target.injector.add([FACTOR, { useValue: 5 }]);
        try {
            host.service.registerFunctionFactories({ name: 'SCALE', create: (accessor) =>
                new StatefulFunction('SCALE', accessor.get(FACTOR)) });
            const definitions = host.service.getFunctionRegistrations();
            target.service.registerFunctionFactories(...definitions);
            const first = host.service.getExecutor('SCALE')!;
            const second = target.service.getExecutor('SCALE')!;
            expect(first.calculateCustom(3)).toBe(6);
            expect(second.calculateCustom(3)).toBe(15);
            second.setRefInfo('private', 'sheet', 1, 1);
            expect(first.unitId).toBeUndefined();
            expect(second).not.toBe(first);
        } finally {
            host.injector.dispose();
            target.injector.dispose();
        }
    });

    it('publishes effective changes once per batch and protects newer registrations from old disposables', () => {
        const { injector, service } = createService();
        const received: Array<readonly IFunctionNames[]> = [];
        try {
            service.functionsChanged$.subscribe((names) => received.push(names));
            const first = service.registerFunctionFactories(
                { name: 'ONE', create: () => new StatefulFunction('ONE', 1) },
                { name: 'TWO', create: () => new StatefulFunction('TWO', 2) }
            );
            const version = service.functionVersion;
            const replacement = service.registerFunctionFactories({ name: 'ONE', create: () => new StatefulFunction('ONE', 3) });
            first.dispose();
            expect(service.getExecutor('ONE')?.calculateCustom(2)).toBe(6);
            expect(service.hasExecutor('TWO')).toBe(false);
            expect(service.functionVersion).toBe(version + 2);
            service.unregisterExecutors('MISSING');
            expect(received).toEqual([['ONE', 'TWO'], ['ONE'], ['TWO']]);
            replacement.dispose();
            replacement.dispose();
            expect(service.getFunctionRegistrations()).toEqual([]);
            expect(received).toEqual([['ONE', 'TWO'], ['ONE'], ['TWO'], ['ONE']]);
        } finally {
            injector.dispose();
        }
    });

    it('does not partially register a batch when a factory fails or returns a different name', () => {
        const { injector, service } = createService();
        try {
            expect(() => service.registerFunctionFactories(
                { name: 'FIRST', create: () => new StatefulFunction('FIRST', 1) },
                { name: 'SECOND', create: () => { throw new Error('factory failed'); } }
            )).toThrow('factory failed');
            expect(service.hasExecutor('FIRST')).toBe(false);
            expect(service.functionVersion).toBe(0);
            expect(() => service.registerFunctionFactories({ name: 'EXPECTED', create: () => new StatefulFunction('OTHER', 1) }))
                .toThrow();
            expect(service.getExecutors().size).toBe(0);
        } finally {
            injector.dispose();
        }
    });

    it('does not silently recreate a legacy executor from an obsolete factory', () => {
        const { injector, service } = createService();
        try {
            service.registerFunctionFactories({ name: 'SCALE', create: () => new StatefulFunction('SCALE', 1) });
            service.registerExecutors(new StatefulFunction('SCALE', 7));
            expect(service.getExecutor('SCALE')?.calculateCustom(2)).toBe(14);
            expect(() => service.getFunctionRegistrations()).toThrow('SCALE');
        } finally {
            injector.dispose();
        }
    });

    it('makes registered formula executors available until they are unregistered', () => {
        const { service } = createService();
        const sumExecutor = { name: 'SUM' };
        const avgExecutor = { name: 'AVERAGE' };

        service.registerExecutors(sumExecutor as never, avgExecutor as never);

        expect(service.hasExecutor('SUM')).toBe(true);
        expect(service.getExecutor('SUM')).toBe(sumExecutor);
        expect(service.getExecutors().size).toBe(2);

        service.unregisterExecutors('AVERAGE');
        expect(service.hasExecutor('AVERAGE')).toBe(false);
    });

    it('removes formula descriptions when a feature disposes its registration', () => {
        const { service } = createService();
        const sumDescription = {
            functionName: 'SUM',
            functionType: FunctionType.Math,
            description: 'sum',
            abstract: 'sum',
            functionParameter: [],
        };
        const avgDescription = {
            functionName: 'AVERAGE',
            functionType: FunctionType.Statistical,
            description: 'avg',
            abstract: 'avg',
            functionParameter: [],
        };

        const disposable = service.registerDescriptions(sumDescription as never, avgDescription as never);
        expect(service.hasDescription('SUM')).toBe(true);
        expect(service.getDescription('AVERAGE')?.description).toBe('avg');
        expect(service.getDescriptions().size).toBe(2);

        disposable.dispose();
        expect(service.hasDescription('SUM')).toBe(false);
        expect(service.hasDescription('AVERAGE')).toBe(false);
    });

    it('removes formula metadata and invalidates AST cache entries for unregistered function names', () => {
        const { service, cache } = createService();
        service.registerDescriptions({
            functionName: 'SUM',
            functionType: FunctionType.Math,
            description: 'sum',
            abstract: 'sum',
            functionParameter: [],
        } as never);
        expect(service.hasDescription('SUM')).toBe(true);
        service.unregisterDescriptions('SUM');
        expect(service.hasDescription('SUM')).toBe(false);

        const sumAst = new AstRootNode('ROOT');
        new BaseAstNode('SUM').setParent(sumAst);
        const textAst = new AstRootNode('ROOT');
        new BaseAstNode('TEXT').setParent(textAst);
        cache.setAst('unit_sheet_SUM_expr', 'unit', sumAst);
        cache.setAst('unit_sheet_TEXT_expr', 'unit', textAst);

        service.deleteFormulaAstCacheKey('SUM');
        expect(cache.getAst('unit_sheet_SUM_expr')).toBeUndefined();
        expect(cache.getAst('unit_sheet_TEXT_expr')).toBe(textAst);
    });

    it('drops registered formula executors and descriptions when the formula runtime is disposed', () => {
        const { service } = createService();
        service.registerExecutors({ name: 'SUM' } as never);
        service.registerDescriptions({
            functionName: 'SUM',
            functionType: FunctionType.Math,
            description: 'sum',
            abstract: 'sum',
            functionParameter: [],
        } as never);

        service.dispose();
        expect(service.getExecutors().size).toBe(0);
        expect(service.getDescriptions().size).toBe(0);
    });
});
