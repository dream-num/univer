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
import type { LexerNode } from '../../../../engine/analysis/lexer-node';
import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import { CellValueType, LocaleType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { Lexer } from '../../../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { Divided } from '../../../meta/divided';
import { FUNCTION_NAMES_META } from '../../../meta/function-names';
import { Plus } from '../../../meta/plus';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sum } from '../../sum';
import { Sumproduct } from '../index';

const getTestWorkbookData = (): IWorkbookData => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: { v: 10, t: CellValueType.NUMBER },
                    1: { v: 100, t: CellValueType.NUMBER },
                    2: { v: 0.1, t: CellValueType.NUMBER },
                },
                1: {
                    0: { v: 20, t: CellValueType.NUMBER },
                    1: { v: 200, t: CellValueType.NUMBER },
                    2: { v: 0.2, t: CellValueType.NUMBER },
                },
                2: {
                    0: { v: 30, t: CellValueType.NUMBER },
                    1: { v: 300, t: CellValueType.NUMBER },
                    2: { v: 0.3, t: CellValueType.NUMBER },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
});

describe('Test sumproduct function', () => {
    const testFunction = new Sumproduct(FUNCTION_NAMES_MATH.SUMPRODUCT);
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;
    let calculate: (formula: string) => (string | number | boolean | null)[][] | string | number | boolean;

    beforeEach(() => {
        const testBed = createFunctionTestBed(getTestWorkbookData());

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

        formulaRuntimeService.setCurrent(
            0,
            0,
            sheetItem.rowCount,
            sheetItem.columnCount,
            testBed.sheetId,
            testBed.unitId
        );

        functionService.registerExecutors(
            new Sumproduct(FUNCTION_NAMES_MATH.SUMPRODUCT),
            new Sum(FUNCTION_NAMES_MATH.SUM),
            new Plus(FUNCTION_NAMES_META.PLUS),
            new Divided(FUNCTION_NAMES_META.DIVIDED)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);
            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Sumproduct', () => {
        it('Array1 is array, not includes error', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(1), StringValueObject.create('2'), NumberValueObject.create(3)],
                    [NullValueObject.create(), StringValueObject.create('test'), NumberValueObject.create(2)],
                    [BooleanValueObject.create(true), StringValueObject.create(' '), BooleanValueObject.create(false)],
                ],
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1);
            expect(getObjectValue(result)).toBe(6);
        });

        it('Array1 is array, includes error', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '2', 3],
                    [null, 'test', ErrorType.NUM],
                    [true, ' ', false],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Array1 is array, other variants has same dimension', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(1), StringValueObject.create('2'), NumberValueObject.create(3)],
                    [NullValueObject.create(), StringValueObject.create('test'), NumberValueObject.create(2)],
                    [BooleanValueObject.create(true), StringValueObject.create(' '), BooleanValueObject.create(false)],
                ],
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(1), NumberValueObject.create(1), NumberValueObject.create(1)],
                    [NullValueObject.create(), StringValueObject.create('test'), NumberValueObject.create(2)],
                    [BooleanValueObject.create(true), NumberValueObject.create(1), BooleanValueObject.create(false)],
                ],
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(8);
        });

        it('Array1 is array, other variants is not same dimension', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '2', 3],
                    [null, 'test', 2],
                    [true, ' ', false],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 1, 1],
                    [true, 1, false],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('More test', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(2)],
                    [NumberValueObject.create(1.570796327)],
                    [NumberValueObject.create(1.316957897)],
                    [NumberValueObject.create(1.570796327)],
                    [NumberValueObject.create(0.168236118)],
                    [NumberValueObject.create(57)],
                    [NumberValueObject.create(0)],
                    [NumberValueObject.create(2.99822295)],
                    [NumberValueObject.create(0.785398163)],
                    [NumberValueObject.create(0.643501109)],
                    [NumberValueObject.create(0.100335348)],
                    [StringValueObject.create('0000001111')],
                    [NumberValueObject.create(3)],
                    [NumberValueObject.create(-6)],
                    [NumberValueObject.create(6)],
                    [NumberValueObject.create(28)],
                    [NumberValueObject.create(36)],
                    [NumberValueObject.create(0.540302306)],
                    [NumberValueObject.create(27.30823284)],
                    [NumberValueObject.create(-0.156119952)],
                ],
                rowCount: 20,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(1.037314721)],
                    [NumberValueObject.create(1.537780562)],
                    [NumberValueObject.create(0.469642441)],
                    [NumberValueObject.create(255)],
                    [NumberValueObject.create(180)],
                    [NumberValueObject.create(2)],
                    [NumberValueObject.create(7.389056099)],
                    [NumberValueObject.create(120)],
                    [NumberValueObject.create(48)],
                    [NumberValueObject.create(2)],
                    [NumberValueObject.create(-4)],
                    [NumberValueObject.create(-4)],
                    [NumberValueObject.create(1)],
                    [NumberValueObject.create(8)],
                    [NumberValueObject.create(10)],
                    [NullValueObject.create()],
                    [NumberValueObject.create(3)],
                    [NumberValueObject.create(3)],
                    [NumberValueObject.create(5)],
                    [NumberValueObject.create(1)],
                ],
                rowCount: 20,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result, true)).toBe(1209.32171126296);
        });

        it('uses legacy implicit intersection for derived arrays passed to SUM', async () => {
            const result = await calculate('=SUMPRODUCT(C1:C3,A1:A3+B1:B3)/SUM(A1:A3+B1:B3)');

            expect(result).toBeCloseTo((0.1 * 110 + 0.2 * 220 + 0.3 * 330) / 110, 12);
        });
    });
});
