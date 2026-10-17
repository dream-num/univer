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
import { createFunctionTestBed } from '../../../functions/__tests__/create-function-test-bed';
import { FUNCTION_NAMES_INFORMATION } from '../../../functions/information/function-names';
import { Isnumber } from '../../../functions/information/isnumber';
import { Compare } from '../../../functions/meta/compare';
import { FUNCTION_NAMES_META } from '../../../functions/meta/function-names';
import { Concatenate } from '../../../functions/text/concatenate';
import { FUNCTION_NAMES_TEXT } from '../../../functions/text/function-names';
import { getObjectValue } from '../../../functions/util';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { Lexer } from '../../analysis/lexer';
import { LexerNode } from '../../analysis/lexer-node';
import { AstTreeBuilder } from '../../analysis/parser';
import { Interpreter } from '../../interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../utils/ast-node-tool';
import { BaseAstNode } from '../base-ast-node';

function createCalculate() {
    const testBed = createFunctionTestBed();
    const currentConfigService = testBed.get(IFormulaCurrentConfigService);
    const runtimeService = testBed.get(IFormulaRuntimeService);
    const lexer = testBed.get(Lexer);
    const astTreeBuilder = testBed.get(AstTreeBuilder);
    const interpreter = testBed.get(Interpreter);

    currentConfigService.load({
        formulaData: {},
        arrayFormulaCellData: {},
        arrayFormulaRange: {},
        forceCalculate: false,
        dirtyRanges: [],
        dirtyNameMap: {},
        dirtyDefinedNameMap: {},
        dirtyUnitFeatureMap: {},
        dirtyUnitOtherFormulaMap: {},
        excludedCell: {},
        allUnitData: { [testBed.unitId]: testBed.sheetData },
    });
    runtimeService.setCurrent(0, 0, 1, 1, testBed.sheetId, testBed.unitId);
    testBed.get(IFunctionService).registerExecutors(
        new Compare(FUNCTION_NAMES_META.COMPARE),
        new Concatenate(FUNCTION_NAMES_TEXT.CONCATENATE),
        new Isnumber(FUNCTION_NAMES_INFORMATION.ISNUMBER)
    );

    return (formula: string) => {
        const lexerNode = lexer.treeBuilder(formula);
        if (!(lexerNode instanceof LexerNode)) throw new TypeError(`Failed to parse formula: ${formula}`);
        const astNode = astTreeBuilder.parse(lexerNode);
        if (!(astNode instanceof BaseAstNode)) throw new TypeError(`Failed to build AST: ${formula}`);
        return getObjectValue(interpreter.execute(generateExecuteAstNodeData(astNode)));
    };
}

describe('ValueNode number literals', () => {
    it('treats non-canonical number literals as numbers', () => {
        const calculate = createCalculate();

        expect(calculate('=12.50')).toBe(12.5);
        expect(calculate('=.5')).toBe(0.5);
        expect(calculate('=007')).toBe(7);
        expect(calculate('=1E3')).toBe(1000);
        expect(calculate('=1.5E+2')).toBe(150);
        expect(calculate('=ISNUMBER(12.50)')).toBe(true);
        expect(calculate('=ISNUMBER(.5)')).toBe(true);
        expect(calculate('=12.50=12.5')).toBe(true);
    });

    it('converts number literals to canonical text', () => {
        const calculate = createCalculate();

        expect(calculate('=12.50&""')).toStrictEqual([['12.5']]);
        expect(calculate('=1.0&"x"')).toStrictEqual([['1x']]);
        expect(calculate('=1E3&""')).toStrictEqual([['1000']]);
        expect(calculate('=.5&""')).toStrictEqual([['0.5']]);
        expect(calculate('=-12.50&""')).toStrictEqual([['-12.5']]);
    });

    it('treats number literals in array constants as numbers', () => {
        const calculate = createCalculate();

        expect(calculate('={1.50,.5;007,1E3}')).toStrictEqual([[1.5, 0.5], [7, 1000]]);
    });

    it('keeps quoted number text as text', () => {
        const calculate = createCalculate();

        expect(calculate('="12.50"')).toBe('12.50');
        expect(calculate('="007"&""')).toStrictEqual([['007']]);
        expect(calculate('=ISNUMBER("12.50")')).toBe(false);
    });
});
