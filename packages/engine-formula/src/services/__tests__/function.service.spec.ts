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

import { describe, expect, it } from 'vitest';
import { FunctionType } from '../../basics/function';
import { FORMULA_AST_CACHE } from '../../engine/utils/generate-ast-node';
import { FunctionService } from '../function.service';

describe('FunctionService', () => {
    it('should register/query/unregister executors', () => {
        const service = new FunctionService();
        const sumExecutor = { name: 'SUM' };
        const avgExecutor = { name: 'AVERAGE' };

        service.registerExecutors(sumExecutor as never, avgExecutor as never);

        expect(service.hasExecutor('SUM')).toBe(true);
        expect(service.getExecutor('SUM')).toBe(sumExecutor);
        expect(service.getExecutors().size).toBe(2);

        service.unregisterExecutors('AVERAGE');
        expect(service.hasExecutor('AVERAGE')).toBe(false);
    });

    it('should register descriptions and cleanup by disposable', () => {
        const service = new FunctionService();
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

    it('should unregister descriptions and clear formula AST cache by function tokens', () => {
        const service = new FunctionService();
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

        FORMULA_AST_CACHE.clear();
        FORMULA_AST_CACHE.set('unit_sheet_SUM_expr', {} as never);
        FORMULA_AST_CACHE.set('unit_sheet_TEXT_expr', {} as never);

        service.deleteFormulaAstCacheKey('SUM');
        expect(FORMULA_AST_CACHE.get('unit_sheet_SUM_expr')).toBeUndefined();
        expect(FORMULA_AST_CACHE.get('unit_sheet_TEXT_expr')).toBeDefined();
    });

    it('should clear internal maps on dispose', () => {
        const service = new FunctionService();
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
