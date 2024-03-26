/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import { Lexer } from '../../../../engine/analysis/lexer';
import type { LexerNode } from '../../../../engine/analysis/lexer-node';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import type { BaseReferenceObject } from '../../../../engine/reference-object/base-reference-object';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Offset } from '..';
import type { BaseValueObject, ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';
import type { ArrayValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test offset', () => {
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;
    let calculate: (formula: string) => Promise<(string | number | boolean | null)[][] | string | number | boolean>;

    beforeEach(() => {
        const testBed = createFunctionTestBed();

        get = testBed.get;

        lexer = get(Lexer);
        astTreeBuilder = get(AstTreeBuilder);
        interpreter = get(Interpreter);

        const functionService = get(IFunctionService);

        const formulaCurrentConfigService = get(IFormulaCurrentConfigService);

        const formulaRuntimeService = get(IFormulaRuntimeService);

        formulaCurrentConfigService.load({
            formulaData: {},
            arrayFormulaCellData: {},
            forceCalculate: false,
            numfmtItemMap: {},
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            excludedCell: {},
            allUnitData: {
                [testBed.unitId]: testBed.sheetData,
            },
        });

        const sheetItem = testBed.sheetData[testBed.sheetId];

        formulaRuntimeService.setCurrent(
            0,
            0,
            sheetItem.rowCount,
            sheetItem.columnCount,
            testBed.sheetId,
            testBed.unitId
        );

        functionService.registerExecutors(
            new Offset(FUNCTION_NAMES_LOOKUP.OFFSET)
        );

        calculate = async (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            if ((result as ErrorValueObject).isError()) {
                return (result as ErrorValueObject).getValue();
            } else if ((result as BaseReferenceObject).isReferenceObject()) {
                return (result as BaseReferenceObject).toArrayValueObject().toValue();
            } else if ((result as ArrayValueObject).isArray()) {
                return (result as ArrayValueObject).toValue();
            }
            return (result as BaseValueObject).getValue();
        };
    });

    describe('Offset', () => {
        it('Normal single cell', async () => {
            const result = await calculate('=OFFSET(A1,1,0,1,1)');

            expect(result).toStrictEqual([[3]]);
        });

        it('Normal array cell', async () => {
            const result = await calculate('=OFFSET(A1,1,0,3,1)');

            expect(result).toStrictEqual([[3], [1], [0]]);
        });

        it('TRUE as 1', async () => {
            const result = await calculate('=OFFSET(A1,TRUE,0,3,1)');

            expect(result).toStrictEqual([[3], [1], [0]]);
        });

        it('Height is negative', async () => {
            const result = await calculate('=OFFSET(A1,1,0,0,1)');

            expect(result).toStrictEqual(ErrorType.REF);
        });

        it('Offset outside sheet boundary', async () => {
            const result = await calculate('=OFFSET(A1,-1,0,1,1)');

            expect(result).toStrictEqual(ErrorType.REF);
        });

        it('The result of the OFFSET function is a reference', async () => {
            const result = await calculate('=OFFSET(A1,1,1):C2');

            expect(result).toStrictEqual([[4, 'B2']]);
        });

        it('Single value object', async () => {
            const result = await calculate('=OFFSET(1,1,1)');

            expect(result).toBe(ErrorType.VALUE);
        });
    });
});
