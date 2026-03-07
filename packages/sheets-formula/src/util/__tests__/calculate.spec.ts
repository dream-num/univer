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

import type { Injector } from '@univerjs/core';
import type { ISheetData } from '@univerjs/engine-formula';
import { AstTreeBuilder, IFormulaCurrentConfigService, Interpreter, Lexer } from '@univerjs/engine-formula';
import { describe, expect, it, vi } from 'vitest';

import { calculateFormula } from '../calculate';

describe('calculateFormula', () => {
    it('should load formula config, build lexer and ast, then return the executed value', () => {
        const load = vi.fn();
        const treeBuilder = vi.fn(() => ['lexer-node']);
        const parse = vi.fn(() => ({ type: 'ast-node' }));
        const execute = vi.fn(() => ({
            isReferenceObject: () => false,
            isArray: () => false,
            isNumber: () => true,
            getValue: () => 42,
        }));

        const services = new Map<unknown, unknown>([
            [IFormulaCurrentConfigService, { load }],
            [Lexer, { treeBuilder }],
            [AstTreeBuilder, { parse }],
            [Interpreter, { execute }],
        ]);

        const injector = {
            get: (token: unknown) => services.get(token),
        } as unknown as Injector;

        const sheetData = {
            sheet1: {
                cellData: {},
                rowCount: 10,
                columnCount: 10,
                rowData: {},
                columnData: {},
            },
        } as unknown as ISheetData;

        const result = calculateFormula(injector, '=SUM(A1)', 'unit-1', sheetData);

        expect(load).toHaveBeenCalledWith(expect.objectContaining({
            allUnitData: {
                'unit-1': sheetData,
            },
            formulaData: {},
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: false,
        }));
        expect(treeBuilder).toHaveBeenCalledWith('=SUM(A1)');
        expect(parse).toHaveBeenCalledWith(['lexer-node']);
        expect(execute).toHaveBeenCalled();
        expect(result).toBe(42);
    });
});
