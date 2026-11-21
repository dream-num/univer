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

import type { Injector, IWorkbookData } from '@univerjs/core';
import type { LexerNode } from '../../engine/analysis/lexer-node';
import type { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import { CellValueType, LocaleType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { Lexer } from '../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../engine/analysis/parser';
import { Interpreter } from '../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../engine/utils/ast-node-tool';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IFunctionService } from '../../services/function.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { Chooserows } from '../lookup/chooserows';
import { FUNCTION_NAMES_LOOKUP } from '../lookup/function-names';
import { Index } from '../lookup/index/index';
import { Sortby } from '../lookup/sortby';
import { Take } from '../lookup/take';
import { Transpose } from '../lookup/transpose';
import { Unique } from '../lookup/unique';
import { FUNCTION_NAMES_MATH } from '../math/function-names';
import { Sumproduct } from '../math/sumproduct';
import { Compare } from '../meta/compare';
import { FUNCTION_NAMES_META } from '../meta/function-names';
import { Minus } from '../meta/minus';
import { getObjectValue } from '../util';
import { createFunctionTestBed } from './create-function-test-bed';

const getTestWorkbookData = (): IWorkbookData => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: { 0: { v: 1, t: CellValueType.NUMBER } },
                1: { 0: { v: 2, t: CellValueType.NUMBER } },
                2: { 0: { v: 3, t: CellValueType.NUMBER } },
                3: { 0: { v: 4, t: CellValueType.NUMBER } },
                4: { 0: { v: 5, t: CellValueType.NUMBER } },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
});

describe('Test a comparison computed again in the same calculation', () => {
    let get: Injector['get'];
    let calculate: (formula: string) => ReturnType<typeof getObjectValue>;

    beforeEach(() => {
        const testBed = createFunctionTestBed(getTestWorkbookData());
        get = testBed.get;

        const lexer = get(Lexer);
        const astTreeBuilder = get(AstTreeBuilder);
        const interpreter = get(Interpreter);

        get(IFormulaCurrentConfigService).load({
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
            allUnitData: {
                [testBed.unitId]: testBed.sheetData,
            },
        });

        const sheetItem = testBed.sheetData[testBed.sheetId];
        get(IFormulaRuntimeService).setCurrent(0, 5, sheetItem.rowCount, sheetItem.columnCount, testBed.sheetId, testBed.unitId);

        get(IFunctionService).registerExecutors(
            new Chooserows(FUNCTION_NAMES_LOOKUP.CHOOSEROWS),
            new Compare(FUNCTION_NAMES_META.COMPARE),
            new Index(FUNCTION_NAMES_LOOKUP.INDEX),
            new Minus(FUNCTION_NAMES_META.MINUS),
            new Sortby(FUNCTION_NAMES_LOOKUP.SORTBY),
            new Sumproduct(FUNCTION_NAMES_MATH.SUMPRODUCT),
            new Take(FUNCTION_NAMES_LOOKUP.TAKE),
            new Transpose(FUNCTION_NAMES_LOOKUP.TRANSPOSE),
            new Unique(FUNCTION_NAMES_LOOKUP.UNIQUE)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);
            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            return getObjectValue(interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode)));
        };
    });

    it('returns a full array the second time a range is compared with =', () => {
        // The first comparison builds the inverted index of A1:A5; the formulas below read it.
        expect(calculate('=SUMPRODUCT(--(A1:A5=2))')).toBe(1);

        expect(calculate('=A1:A5=2')).toStrictEqual([[false], [true], [false], [false], [false]]);
        expect(calculate('=TAKE(A1:A5=2,2)')).toStrictEqual([[false], [true]]);
        expect(calculate('=TRANSPOSE(A1:A5=2)')).toStrictEqual([[false, true, false, false, false]]);
        expect(calculate('=INDEX(A1:A5=2,2)')).toStrictEqual([[true]]);
        expect(calculate('=CHOOSEROWS(A1:A5=2,1)')).toStrictEqual([[false]]);
        expect(calculate('=UNIQUE(A1:A5=2)')).toStrictEqual([[false], [true]]);
        expect(calculate('=SORTBY(A1:A5,A1:A5=2,1)')).toStrictEqual([[1], [3], [4], [5], [2]]);
    });
});
