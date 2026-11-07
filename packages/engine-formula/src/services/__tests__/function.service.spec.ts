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
import { describe, expect, it } from 'vitest';
import { FunctionType } from '../../basics/function';
import { AstRootNode } from '../../engine/ast-node/ast-root-node';
import { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import { FormulaCacheService } from '../formula-cache.service';
import { FunctionService } from '../function.service';

function createService() {
    const injector = new Injector();
    injector.add([FormulaCacheService]);
    injector.add([FunctionService]);
    return { service: injector.get(FunctionService), cache: injector.get(FormulaCacheService) };
}

describe('FunctionService', () => {
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
