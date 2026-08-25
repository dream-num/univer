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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { LambdaValueObjectObject } from '../../value-object/lambda-value-object';
import { DateSystem, LocaleType, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { createFunctionTestBed } from '../../../functions/__tests__/create-function-test-bed';
import { AsyncCustomFunction, CustomFunction } from '../../../functions/custom-function';
import { DateFunction } from '../../../functions/date/date';
import { FUNCTION_NAMES_DATE } from '../../../functions/date/function-names';
import { Accrint } from '../../../functions/financial/accrint';
import { FUNCTION_NAMES_FINANCIAL } from '../../../functions/financial/function-names';
import { Abs } from '../../../functions/math/abs';
import { FUNCTION_NAMES_MATH } from '../../../functions/math/function-names';
import { FUNCTION_NAMES_META } from '../../../functions/meta/function-names';
import { Plus } from '../../../functions/meta/plus';
import { FUNCTION_NAMES_TEXT } from '../../../functions/text/function-names';
import { Substitute } from '../../../functions/text/substitute';
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

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.FR_FR,
        name: 'Locale-independent date parsing',
        sheetOrder: ['sheet1'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                rowCount: 1,
                columnCount: 1,
            },
        },
        styles: {},
    };
}

function createDateSystemWorkbookData(id: string, dateSystem: DateSystem): IWorkbookData {
    return {
        ...createWorkbookData(),
        id,
        locale: LocaleType.EN_US,
        name: id,
        dateSystem,
    };
}

describe('FunctionNode workbook context', () => {
    it('does not use the executing workbook locale to parse formula text', () => {
        const testBed = createFunctionTestBed(createWorkbookData());
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
        testBed.get(IFunctionService).registerExecutors(new Accrint(FUNCTION_NAMES_FINANCIAL.ACCRINT));
        testBed.get(IFunctionService).registerExecutors(new Plus(FUNCTION_NAMES_META.PLUS));

        const calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);
            if (!(lexerNode instanceof LexerNode)) throw new TypeError(`Failed to parse formula: ${formula}`);
            const astNode = astTreeBuilder.parse(lexerNode);
            if (!(astNode instanceof BaseAstNode)) throw new TypeError(`Failed to build AST: ${formula}`);
            return getObjectValue(interpreter.execute(generateExecuteAstNodeData(astNode)));
        };

        expect(calculate('=ACCRINT("31/01/2024","31/07/2024","01/05/2024",0.1,1000,2)'))
            .toBe(ErrorType.VALUE);
        expect(calculate('=1+"1,5"')).toBe(ErrorType.VALUE);
    });

    it('uses the executing workbook date system for implicit string coercion', async () => {
        const testBed = createFunctionTestBed(createDateSystemWorkbookData('date-1900', DateSystem.Date1900));
        const date1904Workbook = testBed.univer.createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            createDateSystemWorkbookData('date-1904', DateSystem.Date1904)
        );
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
        testBed.get(IFunctionService).registerExecutors(new Plus(FUNCTION_NAMES_META.PLUS));
        testBed.get(IFunctionService).registerExecutors(new Abs(FUNCTION_NAMES_MATH.ABS));
        testBed.get(IFunctionService).registerExecutors(new Substitute(FUNCTION_NAMES_TEXT.SUBSTITUTE));
        testBed.get(IFunctionService).registerExecutors(new DateFunction(FUNCTION_NAMES_DATE.DATE));
        const customDate = new CustomFunction('CUSTOMDATE');
        customDate.calculateCustom = () => '1904-1-1';
        const customDateArray = new CustomFunction('CUSTOMDATEARRAY');
        customDateArray.calculateCustom = () => [['1904-1-1']];
        const asyncCustomDate = new AsyncCustomFunction('ASYNCCUSTOMDATE');
        const date1904Result = createDeferred<string>();
        const date1900Result = createDeferred<string>();
        const date1904Started = createDeferred<void>();
        const date1900Started = createDeferred<void>();
        asyncCustomDate.calculateCustom = (dateSystem) => {
            if (dateSystem === '1904') {
                date1904Started.resolve();
                return date1904Result.promise;
            }

            date1900Started.resolve();
            return date1900Result.promise;
        };
        testBed.get(IFunctionService).registerExecutors(customDate, customDateArray, asyncCustomDate);

        const calculate = (unitId: string, sheetId: string, formula = '="1904-1-1"+0') => {
            runtimeService.setCurrent(0, 0, 1, 1, sheetId, unitId);
            const lexerNode = lexer.treeBuilder(formula);
            if (!(lexerNode instanceof LexerNode)) throw new TypeError('Failed to parse implicit date coercion formula');
            const astNode = astTreeBuilder.parse(lexerNode);
            if (!(astNode instanceof BaseAstNode)) throw new TypeError('Failed to build implicit date coercion AST');
            return getObjectValue(interpreter.execute(generateExecuteAstNodeData(astNode)));
        };
        const calculateAsync = async (unitId: string, sheetId: string, formula: string) => {
            runtimeService.setCurrent(0, 0, 1, 1, sheetId, unitId);
            const lexerNode = lexer.treeBuilder(formula);
            if (!(lexerNode instanceof LexerNode)) throw new TypeError('Failed to parse async custom function formula');
            const astNode = astTreeBuilder.parse(lexerNode);
            if (!(astNode instanceof BaseAstNode)) throw new TypeError('Failed to build async custom function AST');
            return getObjectValue(await interpreter.executeAsync(generateExecuteAstNodeData(astNode)));
        };

        expect(calculate(testBed.unitId, testBed.sheetId)).toBe(1462);
        expect(calculate(date1904Workbook.getUnitId(), date1904Workbook.getActiveSheet()!.getSheetId())).toBe(0);
        expect(calculate(testBed.unitId, testBed.sheetId, '=DATE(1904,1,1)')).toBe(1462);
        expect(calculate(
            date1904Workbook.getUnitId(),
            date1904Workbook.getActiveSheet()!.getSheetId(),
            '=DATE(1904,1,1)'
        )).toBe(0);
        expect(calculate(
            date1904Workbook.getUnitId(),
            date1904Workbook.getActiveSheet()!.getSheetId(),
            '=ABS("1904-1-1")'
        )).toBe(0);
        expect(calculate(
            date1904Workbook.getUnitId(),
            date1904Workbook.getActiveSheet()!.getSheetId(),
            '=ABS(SUBSTITUTE("1904/1/1","/","-"))'
        )).toBe(0);
        expect(calculate(testBed.unitId, testBed.sheetId, '=ABS(SUBSTITUTE("1904/1/1","/","-"))')).toBe(1462);
        expect(calculate(
            date1904Workbook.getUnitId(),
            date1904Workbook.getActiveSheet()!.getSheetId(),
            '=ABS(CUSTOMDATE())'
        )).toBe(0);
        expect(calculate(
            date1904Workbook.getUnitId(),
            date1904Workbook.getActiveSheet()!.getSheetId(),
            '=ABS(CUSTOMDATEARRAY())'
        )).toStrictEqual([[0]]);

        runtimeService.setCurrent(
            0,
            0,
            1,
            1,
            date1904Workbook.getActiveSheet()!.getSheetId(),
            date1904Workbook.getUnitId()
        );
        const lambdaLexerNode = lexer.treeBuilder('=LAMBDA(value,ABS(value))');
        if (!(lambdaLexerNode instanceof LexerNode)) throw new TypeError('Failed to parse lambda formula');
        const lambdaAstNode = astTreeBuilder.parse(lambdaLexerNode);
        if (!(lambdaAstNode instanceof BaseAstNode)) throw new TypeError('Failed to build lambda AST');
        const lambda = interpreter.execute(generateExecuteAstNodeData(lambdaAstNode)) as LambdaValueObjectObject;
        expect(lambda.executeCustom('1904-1-1').getValue()).toBe(0);

        const pending1904 = calculateAsync(
            date1904Workbook.getUnitId(),
            date1904Workbook.getActiveSheet()!.getSheetId(),
            '=ABS(ASYNCCUSTOMDATE("1904"))'
        );
        await date1904Started.promise;
        const pending1900 = calculateAsync(testBed.unitId, testBed.sheetId, '=ABS(ASYNCCUSTOMDATE("1900"))');
        await date1900Started.promise;
        date1904Result.resolve('1904-1-1');
        expect(await pending1904).toBe(0);
        date1900Result.resolve('1904-1-1');
        expect(await pending1900).toBe(1462);

        expect(calculate(testBed.unitId, testBed.sheetId)).toBe(1462);
    });
});

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((promiseResolve) => {
        resolve = promiseResolve;
    });

    return { promise, resolve };
}
