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

import type { ICellData, IWorkbookData, Nullable } from '@univerjs/core';
import { CellValueType, LocaleType, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import type { IUnitData } from '../../../../basics/common';
import type { BaseReferenceObject } from '../../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { ErrorType } from '../../../../basics/error-type';
import { Lexer } from '../../../../engine/analysis/lexer';
import { LexerNode } from '../../../../engine/analysis/lexer-node';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { CellReferenceObject } from '../../../../engine/reference-object/cell-reference-object';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { ALL_IMPLEMENTED_FUNCTIONS } from '../../../index';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Getpivotdata } from '../index';

const UNIT_ID = 'pivot-unit';
const SHEET_ID = 'pivot-sheet';

function text(value: string, indent?: number): ICellData {
    if (indent == null) {
        return { v: value, t: CellValueType.STRING };
    }
    return { v: value, t: CellValueType.STRING, s: { pd: { l: indent } } };
}

function number(value: number): ICellData {
    return { v: value, t: CellValueType.NUMBER };
}

function anchor(cells: Array<[number, number, Nullable<ICellData>]>, reference = 'A1'): BaseReferenceObject {
    const cellData: Record<number, Record<number, ICellData>> = {};
    for (const [row, column, cell] of cells) {
        if (cell == null) {
            continue;
        }
        cellData[row] = cellData[row] ?? {};
        cellData[row][column] = cell;
    }

    const unitData: IUnitData = {
        [UNIT_ID]: {
            [SHEET_ID]: {
                cellData: new ObjectMatrix(cellData),
                rowCount: 100,
                columnCount: 30,
                rowData: {},
                columnData: {},
            },
        },
    };

    const referenceObject = new CellReferenceObject(reference);
    referenceObject.setDefaultUnitId(UNIT_ID);
    referenceObject.setDefaultSheetId(SHEET_ID);
    referenceObject.setUnitData(unitData);

    return referenceObject;
}

const textArg = (value: string) => StringValueObject.create(value);

describe('GETPIVOTDATA', () => {
    const testFunction = new Getpivotdata(FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);

    const compactReport = anchor([
        [0, 0, text('Row Labels')],
        [0, 1, text('Count of Status')],
        [1, 0, text('E2E')],
        [1, 1, number(25)],
        [2, 0, text('Current', 1)],
        [2, 1, number(23)],
        [3, 0, text('IMC')],
        [3, 1, number(4)],
        [4, 0, text('Current', 1)],
        [4, 1, number(2)],
        [5, 0, text('Closed', 1)],
        [5, 1, number(2)],
        [6, 0, text('Grand Total')],
        [6, 1, number(56)],
    ]);

    it('resolves the indented item instead of the parent subtotal', () => {
        const result = testFunction.calculate(
            textArg('Status'),
            compactReport,
            textArg('Department'),
            textArg('IMC'),
            textArg('Status'),
            textArg('Current')
        ) as BaseValueObject;

        expect(getObjectValue(result)).toBe(2);
    });

    it('accepts the source field name of an aggregated caption', () => {
        const result = testFunction.calculate(
            textArg('Status'),
            compactReport
        ) as BaseValueObject;

        expect(getObjectValue(result)).toBe(56);
    });

    it('reads a rowless report from the measure caption row', () => {
        const rowlessReport = anchor([
            [1, 10, text('Sum of Created Value')],
            [1, 11, text('Sum of Built Cost')],
            [2, 10, number(700006621.4084)],
            [2, 11, number(427057283.8337)],
        ], 'K2');

        const result = testFunction.calculate(
            textArg('Sum of Built Cost'),
            rowlessReport
        ) as BaseValueObject;

        expect(getObjectValue(result)).toBeCloseTo(427057283.8337, 4);
    });

    it('reads a tabular report by field header and item label', () => {
        const report = anchor([
            [0, 0, text('Department')],
            [0, 1, text('Status')],
            [0, 2, text('Count')],
            [1, 0, text('IMC')],
            [1, 1, text('Current')],
            [1, 2, number(2)],
        ]);

        const result = testFunction.calculate(
            textArg('Count'),
            report,
            textArg('Department'),
            textArg('IMC'),
            textArg('Status'),
            textArg('Current')
        ) as BaseValueObject;

        expect(getObjectValue(result)).toBe(2);
    });

    it('selects a data column when the item is a column field', () => {
        const report = anchor([
            [0, 0, text('Department')],
            [0, 1, text('Sum of Cost')],
            [0, 2, text('Current')],
            [0, 3, text('Closed')],
            [1, 0, text('IMC')],
            [1, 1, number(10)],
            [1, 2, number(6)],
            [1, 3, number(4)],
        ]);

        const result = testFunction.calculate(
            textArg('Cost'),
            report,
            textArg('Department'),
            textArg('IMC'),
            textArg('Status'),
            textArg('Closed')
        ) as BaseValueObject;

        expect(getObjectValue(result)).toBe(4);
    });

    it('rejects subtotal items and unknown fields', () => {
        const subtotal = testFunction.calculate(
            textArg('Status'),
            compactReport,
            textArg('Department'),
            textArg('General Total')
        ) as BaseValueObject;
        const unknown = testFunction.calculate(
            textArg('Missing'),
            compactReport
        ) as BaseValueObject;

        expect(getObjectValue(subtotal)).toBe(ErrorType.REF);
        expect(getObjectValue(unknown)).toBe(ErrorType.REF);
    });

    it('requires a single-cell reference as the pivot table anchor', () => {
        const notReference = testFunction.calculate(
            textArg('Status'),
            textArg('A1')
        ) as BaseValueObject;
        const notSingleCell = testFunction.calculate(
            textArg('Status'),
            anchor([], 'A1:B2')
        ) as BaseValueObject;
        const oddArguments = testFunction.calculate(
            textArg('Status'),
            compactReport,
            textArg('Department')
        ) as BaseValueObject;

        expect(getObjectValue(notReference)).toBe(ErrorType.VALUE);
        expect(getObjectValue(notSingleCell)).toBe(ErrorType.VALUE);
        expect(getObjectValue(oddArguments)).toBe(ErrorType.VALUE);
    });

    it('is registered and evaluates through the formula interpreter', () => {
        const workbookData: IWorkbookData = {
            id: 'test',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            name: 'pivot-formula',
            sheetOrder: ['sheet1'],
            styles: {},
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    name: 'Pivot',
                    rowCount: 20,
                    columnCount: 10,
                    cellData: {
                        0: {
                            0: text('Row Labels'),
                            1: text('Count of Status'),
                            6: { v: '=GETPIVOTDATA("Status",A1,"Department","IMC","Status","Current")' },
                        },
                        1: {
                            0: text('IMC'),
                            1: number(4),
                        },
                        2: {
                            0: text('Current', 1),
                            1: number(2),
                        },
                    },
                },
            },
        };

        const testBed = createFunctionTestBed(workbookData);
        const currentConfigService = testBed.get(IFormulaCurrentConfigService);
        const runtimeService = testBed.get(IFormulaRuntimeService);
        const functionService = testBed.get(IFunctionService);

        functionService.registerExecutors(...ALL_IMPLEMENTED_FUNCTIONS.map(([FunctionCtor, name]) => new FunctionCtor(name)));
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
        runtimeService.setCurrent(0, 6, 1, 1, testBed.sheetId, testBed.unitId);

        const lexerNode = testBed.get(Lexer).treeBuilder('=GETPIVOTDATA("Status",A1,"Department","IMC","Status","Current")');
        expect(lexerNode).toBeInstanceOf(LexerNode);

        const astNode = testBed.get(AstTreeBuilder).parse(lexerNode as LexerNode);
        if (astNode == null) {
            throw new Error('Failed to build GETPIVOTDATA AST');
        }
        const result = testBed.get(Interpreter).execute(generateExecuteAstNodeData(astNode));

        expect(getObjectValue(result as BaseValueObject)).toBe(2);
        testBed.univer.dispose();
    });
});
