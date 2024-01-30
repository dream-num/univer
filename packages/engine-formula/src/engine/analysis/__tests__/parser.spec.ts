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

import { ErrorType } from '../../../basics/error-type';
import { FUNCTION_NAMES_MATH } from '../../../functions/math/function-names';
import { Sum } from '../../../functions/math/sum';
import { FUNCTION_NAMES_META } from '../../../functions/meta/function-names';
import { Plus } from '../../../functions/meta/plus';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import type { BaseAstNode } from '../../ast-node/base-ast-node';
import { Interpreter } from '../../interpreter/interpreter';
import type { BaseValueObject } from '../../value-object/base-value-object';
import { Lexer } from '../lexer';
import type { LexerNode } from '../lexer-node';
import { AstTreeBuilder } from '../parser';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test indirect', () => {
    // const textFunction = new Makearray(FUNCTION_NAMES_LOGICAL.MAKEARRAY);
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;

    beforeEach(() => {
        const testBed = createCommandTestBed();

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

        functionService.registerExecutors(new Sum(FUNCTION_NAMES_MATH.SUM), new Plus(FUNCTION_NAMES_META.PLUS));
    });

    describe('normal', () => {
        it('Ref error', async () => {
            const lexerNode = lexer.treeBuilder(`=sum(${ErrorType.REF} + 1)`);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.REF);
        });

        it('Name error', async () => {
            const lexerNode = lexer.treeBuilder(`=sum(${ErrorType.NAME} + 1, sum(${ErrorType.REF} + 1))`);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.NAME);
        });
    });
});
