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
import type { IUnitData } from '../../../../basics/common';
import type { BaseReferenceObject } from '../../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import type { IPivotFormulaReportLookup, PivotFormulaColumnSubtotal } from '../index';
import { CellValueType, Injector, LocaleType, ObjectMatrix, Rectangle } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
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
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
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

    it('uses registered report bounds and column totals when provided by the host', () => {
        const range = { startRow: 2, endRow: 5, startColumn: 0, endColumn: 3 };
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: (_unit, _sheet, candidate) => Rectangle.intersects(range, candidate)
                        ? {
                            ranges: [range],
                            fields: ['Region', 'Year', 'Category'],
                            columnFields: ['Year'],
                            dataFields: [{ sourceName: 'Amount', displayName: 'Sum of Amount' }],
                            layout: { firstDataRow: 4, pageFields: [{ names: ['Category'], value: 'X', displayValue: 'Combined' }] },
                        }
                        : undefined,
                };
            }
        }
        const injector = new Injector();
        const fn = injector.createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
        const cells: Array<[number, number, ICellData]> = [
            [2, 0, text('Sum of Amount')],
            [2, 1, text('Column Labels')],
            [3, 0, text('Row Labels')],
            [3, 1, number(2025)],
            [3, 2, number(2026)],
            [3, 3, text('Grand Total')],
            [4, 0, text('North')],
            [4, 1, number(80)],
            [4, 2, number(34)],
            [4, 3, number(114)],
            [5, 0, text('Grand Total')],
            [5, 1, number(80)],
            [5, 2, number(34)],
            [5, 3, number(114)],
        ];
        cells.push(...cells.map(([row, col, cell]): [number, number, ICellData] => [row, col + 7, cell]));
        const lookup = (reference: string, ...pairs: string[]) => getObjectValue(fn.calculate(textArg('Amount'), anchor(cells, reference), ...pairs.map(textArg)));
        try {
            expect(lookup('B5', 'Region', 'North')).toBe(114);
            expect(lookup('A3', 'Region', 'North', 'Year', '2025')).toBe(80);
            expect(lookup('A3', 'Year', '2025')).toBe(80);
            expect(lookup('A3', 'Region', 'North', 'Year', '2025', 'Category', 'X')).toBe(80);
            expect(lookup('A3', 'Region', 'North', 'Year', '2025', 'Category', 'Combined')).toBe(80);
            expect(lookup('A3', 'Region', 'North', 'Category', 'Y')).toBe(ErrorType.REF);
            expect(lookup('A3', 'Region', 'North', 'Year', 'Missing')).toBe(ErrorType.REF);
            expect(lookup('A3', 'Unknown', 'North')).toBe(ErrorType.REF);
            expect(lookup('H3', 'Region', 'North')).toBe(ErrorType.REF);
            range.endColumn = 2;
            expect(lookup('A3', 'Region', 'North')).toBe(ErrorType.REF);
        } finally {
            injector.dispose();
        }
    });

    it.each([
        [3, false],
        [undefined, false],
        [3, true],
    ])('matches column fields with data start row %s and RTL %s', (firstDataRow, rightToLeft) => {
        const range = { startRow: 0, endRow: 5, startColumn: 0, endColumn: 7 };
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: () => ({
                        ranges: [range],
                        fields: ['Category', 'Year', 'Fiscal Year', 'Quarter'],
                        columnFields: ['Year', 'Fiscal Year', 'Quarter'],
                        dataFields: [{ sourceName: 'Amount', displayName: 'Sum of Amount' }],
                        layout: { firstDataRow, rightToLeft, columnFieldNames: [['Year', 'Fiscal Year'], ['Quarter']] },
                    }),
                };
            }
        }
        const bed = createFunctionTestBed();
        const fn = bed.get(Injector).createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
        try {
            const grid = [
                ['Sum of Amount', 'Column Labels'],
                ['', 2025, '', '2025 Total', 2026, '', '2026 Total', 'Grand Total'],
                ['Row Labels', 'Q1', 'Q2', '', 'Q1', 'Q2'],
                ['East', 4, 5, 9, 6, 12, 18, 27],
                ['West', 1, 2, 3, 3, 10, 13, 16],
                ['Grand Total', 5, 7, 12, 9, 22, 31, 43],
            ];
            const cells = grid.flatMap((values, row) => values.flatMap((value, column): Array<[number, number, ICellData]> =>
                value === '' ? [] : [[row, rightToLeft ? range.endColumn - column : column, typeof value === 'number' ? number(value) : text(value)]]
            ));
            const report = anchor(cells);
            const lookup = (...pairs: string[]) => getObjectValue(fn.calculate(textArg('Amount'), report, ...pairs.map(textArg)));
            if (rightToLeft) {
                expect(getObjectValue(fn.calculate(textArg('Amount'), anchor(cells, 'B1')))).toBe(43);
            }
            expect(lookup('Year', '2026', 'Quarter', 'Q2')).toBe(22);
            expect(lookup('Quarter', 'Q2', 'Year', '2026')).toBe(22);
            expect(lookup('Quarter', 'Q2', 'Category', 'West', 'Year', '2026')).toBe(10);
            expect(lookup('Year', '2025', 'Quarter', 'Q2')).toBe(7);
            expect(lookup('Fiscal Year', '2026')).toBe(31);
            expect(lookup('Year', '2026', 'Category', 'East')).toBe(18);
            expect(lookup('Quarter', 'Q2')).toBe(ErrorType.REF);
            expect(lookup('Year', '2026', 'Fiscal Year', '2026')).toBe(31);
            expect(lookup('Year', '2026', 'Fiscal Year', '2025')).toBe(ErrorType.REF);
            expect(lookup('Year', '2026', 'Quarter', 'Q3')).toBe(ErrorType.REF);
            expect(lookup('Year', 'Column Labels', 'Quarter', '2025')).toBe(ErrorType.REF);
        } finally {
            bed.univer.dispose();
        }
    });

    it('matches column fields and the requested measure in the same column', () => {
        const range = { startRow: 0, endRow: 5, startColumn: 0, endColumn: 6 };
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: () => ({
                        ranges: [range],
                        fields: ['Category', 'Country', 'Channel'],
                        columnFields: ['Country', 'Channel'],
                        dataFields: [
                            { sourceName: 'Sales', displayName: 'Sum of Sales' },
                            { sourceName: 'Orders', displayName: 'Count of Country' },
                        ],
                        layout: { firstDataRow: 4 },
                    }),
                };
            }
        }
        const bed = createFunctionTestBed();
        const fn = bed.get(Injector).createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
        try {
            const grid = [
                ['', 'Column Labels'],
                ['', 'CA', '', 'US', '', 'Total Sum of Sales', 'Total Count of Country'],
                ['', 'Retail', '', 'Retail'],
                ['Row Labels', 'Sum of Sales', 'Count of Country', 'Sum of Sales', 'Count of Country'],
                ['West', 20, 1, 100, 1, 120, 2],
                ['Grand Total', 20, 1, 100, 1, 120, 2],
            ];
            const cells = grid.flatMap((row, r) => row.flatMap((value, c): Array<[number, number, ICellData]> =>
                value === '' ? [] : [[r, c, typeof value === 'number' ? number(value) : text(value)]]
            ));
            const lookup = (measure: string, ...pairs: string[]) => getObjectValue(fn.calculate(textArg(measure), anchor(cells), ...pairs.map(textArg)));
            expect(lookup('Sales', 'Country', 'US', 'Channel', 'Retail')).toBe(100);
            expect(lookup('Count of Country', 'Channel', 'Retail', 'Country', 'US')).toBe(1);
            expect(lookup('Sales', 'Country', 'Column Labels', 'Channel', 'US')).toBe(ErrorType.REF);
        } finally {
            bed.univer.dispose();
        }
    });

    it('keeps a legacy column grand total out of item matching', () => {
        const range = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 2 };
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: () => ({
                        ranges: [range],
                        fields: ['Category'],
                        columnFields: ['Category'],
                        dataFields: [{ sourceName: 'Sales', displayName: 'Sum of Sales' }],
                    }),
                };
            }
        }
        const bed = createFunctionTestBed();
        try {
            const fn = bed.get(Injector).createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
            const ref = anchor([
                [0, 0, text('Sum of Sales')],
                [0, 1, text('North')],
                [0, 2, text('Grand Total')],
                [1, 0, number(10)],
                [1, 1, number(10)],
                [1, 2, number(10)],
            ]);
            expect(getObjectValue(fn.calculate(textArg('Sales'), ref, textArg('Category'), textArg('North')))).toBe(10);
            expect(getObjectValue(fn.calculate(textArg('Sales'), ref, textArg('Category'), textArg('Grand Total')))).toBe(ErrorType.REF);
            expect(getObjectValue(fn.calculate(textArg('Sales'), ref))).toBe(10);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each(['legacy', 'ltr', 'rtl', 'disabled', 'collapsed'])('reads measure-specific column subtotals in %s reports', (mode) => {
        const range = { startRow: 0, endRow: 5, startColumn: 0, endColumn: 12 };
        const physical = (column: number) => mode === 'rtl' ? range.endColumn - column : column;
        const columnSubtotals: readonly PivotFormulaColumnSubtotal[] = mode === 'disabled'
            ? []
            : [
                mode === 'collapsed' ? [physical(5), 1, 0, ['North']] : [physical(5), 1, 0],
                [physical(6), 1, 1],
                [physical(9), 1, 0],
                [physical(10), 1, 1],
            ] as const;
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: () => ({
                        ranges: [range],
                        fields: ['Region', 'Category', 'Detail'],
                        columnFields: ['Category', 'Detail'],
                        dataFields: [
                            { sourceName: 'Sales', displayName: 'Sum of Sales' },
                            { sourceName: 'Units', displayName: 'Sum of Units' },
                        ],
                        layout: {
                            firstDataRow: 4,
                            rightToLeft: mode === 'rtl',
                            columnFieldNames: [['Category'], ['Detail']],
                            columnGrandTotals: [physical(11), physical(12)],
                            columnSubtotals: mode === 'legacy' ? undefined : columnSubtotals,
                        },
                    }),
                };
            }
        }
        const bed = createFunctionTestBed();
        const fn = bed.get(Injector).createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
        try {
            const grid = [
                ['', 'Column Labels'],
                ['', 'North', '', '', '', mode === 'legacy' ? 'North Sum of Sales' : 'Localized subtotal', 'North Sum of Units', 'South', '', 'South Sum of Sales', 'South Sum of Units'],
                ['', 'Online', '', 'Retail', '', '', '', 'Retail'],
                ['Row Labels', 'Sum of Sales', 'Sum of Units', 'Sum of Sales', 'Sum of Units', '', '', 'Sum of Sales', 'Sum of Units'],
                ['East', 20, 2, 10, 1, 30, 3, 90, 9, 90, 9, 120, 12],
                ['Grand Total', 20, 2, 10, 1, 30, 3, 90, 9, 90, 9, 120, 12],
            ];
            if (mode === 'collapsed') {
                for (const row of grid) row.fill('', 1, 5);
            }
            const cells = grid.flatMap((row, r) => row.flatMap((value, c): Array<[number, number, ICellData]> =>
                value === '' ? [] : [[r, physical(c), typeof value === 'number' ? number(value) : text(value)]]
            ));
            const lookup = (measure: string, ...pairs: string[]) => getObjectValue(fn.calculate(textArg(measure), anchor(cells), ...pairs.map(textArg)));
            expect(lookup('Sales', 'Category', 'North')).toBe(mode === 'disabled' ? ErrorType.REF : 30);
            expect(lookup('Sales', 'Category', 'North', 'Category', 'North')).toBe(mode === 'disabled' ? ErrorType.REF : 30);
            expect(lookup('Sales', 'Category', 'North', 'Category', 'South')).toBe(ErrorType.REF);
            expect(lookup('Units', 'Category', 'North', 'Region', 'East')).toBe(mode === 'disabled' ? ErrorType.REF : 3);
            expect(lookup('Units', 'Category', 'South')).toBe(9);
            expect(lookup('Sales', 'Detail', 'Retail', 'Category', 'North')).toBe(mode === 'collapsed' ? ErrorType.REF : 10);
            expect(lookup('Sales', 'Detail', 'Retail')).toBe(mode === 'collapsed' ? 90 : ErrorType.REF);
            expect(lookup('Units', 'Detail', 'Online')).toBe(mode === 'collapsed' ? ErrorType.REF : 2);
            expect(lookup('Units')).toBe(12);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([false, true])('reads measure groups above the deepest column field (RTL %s)', (rightToLeft) => {
        const range = { startRow: 0, endRow: 4, startColumn: 0, endColumn: 7 };
        const physical = (column: number) => rightToLeft ? range.endColumn - column : column;
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: () => ({
                        ranges: [range],
                        fields: ['Category', 'Detail'],
                        columnFields: ['Category', 'Detail'],
                        dataFields: [
                            { sourceName: 'Sales', displayName: 'Sum of Sales' },
                            { sourceName: 'Units', displayName: 'Sum of Units' },
                        ],
                        layout: {
                            firstDataRow: 4,
                            rightToLeft,
                            columnFieldNames: [['Category'], ['Detail']],
                            columnHeaders: { firstColumn: 0, fieldRows: [1, 3], measureRow: 2 },
                            columnGrandTotals: [physical(6), physical(7)],
                            columnSubtotals: [[physical(4), 1, 0], [physical(5), 1, 1]],
                        },
                    }),
                };
            }
        }
        const bed = createFunctionTestBed();
        try {
            const fn = bed.get(Injector).createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
            const cells = [
                ['Category', 'Values', 'Detail'],
                ['North', '', '', '', 'North Sum of Sales', 'North Sum of Units', 'Sum of Sales', 'Sum of Units'],
                ['Sum of Sales', '', 'Sum of Units'],
                ['Retail', 'Online', 'Retail', 'Online'],
                [10, 20, 1, 2, 30, 3, 30, 3],
            ].flatMap((row, r) => row.flatMap((value, c): Array<[number, number, ICellData]> =>
                value === '' ? [] : [[r, physical(c), typeof value === 'number' ? number(value) : text(value)]]
            ));
            const ref = anchor(cells);
            const lookup = (measure: string, ...pairs: string[]) => getObjectValue(fn.calculate(textArg(measure), ref, ...pairs.map(textArg)));
            expect(lookup('Sales', 'Category', 'North')).toBe(30);
            expect(lookup('Sales', 'Category', 'North', 'Detail', 'Online')).toBe(20);
            expect(lookup('Units', 'Category', 'North')).toBe(3);
            expect(lookup('Units', 'Detail', 'Online', 'Category', 'North')).toBe(2);
            expect(lookup('Sales')).toBe(30);
        } finally {
            bed.univer.dispose();
        }
    });

    it('matches separated column levels and selects the visible subtotal at the deepest requested level', () => {
        const range = { startRow: 0, endRow: 5, startColumn: 0, endColumn: 10 };
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: () => ({
                        ranges: [range],
                        fields: ['Region', 'Category', 'Detail', 'Segment'],
                        columnFields: ['Category', 'Detail', 'Segment'],
                        dataFields: [{ sourceName: 'Sales', displayName: 'Sum of Sales' }],
                        layout: {
                            firstDataRow: 4,
                            columnFieldNames: [['Category'], ['Detail'], ['Segment']],
                            columnGrandTotals: [10],
                            columnSubtotals: [[2, 2, -1], [4, 2, -1], [5, 1, -1], [8, 2, -1], [9, 1, -1]],
                        },
                    }),
                };
            }
        }
        const bed = createFunctionTestBed();
        const fn = bed.get(Injector).createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
        try {
            const grid = [
                ['Sum of Sales', 'Column Labels'],
                ['', 'North', '', '', '', 'North Total', 'South', '', '', 'South Total'],
                ['', 'Online', 'Online Total', 'Retail', 'Retail Total', '', 'Retail', '', 'Retail Total'],
                ['Row Labels', 'B', '', 'A', '', '', 'A', 'C'],
                ['East', 20, 20, 10, 10, 30],
                ['Grand Total', 20, 20, 10, 10, 30, 90, 11, 101, 101, 131],
            ];
            const cells = grid.flatMap((row, r) => row.flatMap((value, c): Array<[number, number, ICellData]> =>
                value === '' ? [] : [[r, c, typeof value === 'number' ? number(value) : text(value)]]
            ));
            const lookup = (...pairs: string[]) => getObjectValue(fn.calculate(textArg('Sales'), anchor(cells), ...pairs.map(textArg)));
            expect(lookup('Detail', 'Online')).toBe(20);
            expect(lookup('Detail', 'Retail')).toBe(ErrorType.REF);
            expect(lookup('Category', 'South', 'Segment', 'A')).toBe(90);
            expect(lookup('Detail', 'Retail', 'Segment', 'C')).toBe(11);
            expect(lookup('Category', 'South', 'Segment', 'A', 'Region', 'East')).toBe(0);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each(['tabular', 'compact', 'columns'])('keeps a subtotal from hiding a matching detail in %s reports', (layout) => {
        const compact = layout === 'compact';
        const columns = layout === 'columns';
        const reportLayout = columns
            ? { firstDataRow: 4, columnFieldNames: [['Category'], ['Middle'], ['Leaf']], columnGrandTotals: [3], columnSubtotals: [[1, 2, -1, ['East', 'Shared']]] as const }
            : {
                firstDataRow: 1,
                rowFieldNames: [['Category'], ['Middle'], ['Leaf']],
                compactRowGroups: compact ? [[1, 1], [2, 2, 'top'], [3, 1], [4, 2], [6, 0, 'bottom']] as const : undefined,
            };
        const grid = columns
            ? [
                ['Sum of Sales', 'Column Labels'],
                ['', 'East', 'West', 'Grand Total'],
                ['', 'Shared', 'Shared'],
                ['Row Labels', '', 'B'],
                ['Asia', 20, 30, 50],
                ['Grand Total', 20, 30, 50],
            ]
            : compact
                ? [
                    ['Row Labels', 'Sum of Sales'],
                    ['East'],
                    ['Shared', 20],
                    ['West'],
                    ['Shared'],
                    ['B', 30],
                    ['Grand Total', 50],
                ]
                : [
                    ['Category', 'Middle', 'Leaf', 'Sum of Sales'],
                    ['East', 'Shared', '', 20],
                    ['West', 'Shared', 'B', 30],
                    ['Grand Total', '', '', 50],
                ];
        const range = { startRow: 0, endRow: grid.length - 1, startColumn: 0, endColumn: Math.max(...grid.map((row) => row.length)) - 1 };
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: () => ({
                        ranges: [range],
                        fields: ['Region', 'Category', 'Middle', 'Leaf'],
                        columnFields: columns ? ['Category', 'Middle', 'Leaf'] : [],
                        dataFields: [{ sourceName: 'Sales', displayName: 'Sum of Sales' }],
                        layout: reportLayout,
                    }),
                };
            }
        }
        const bed = createFunctionTestBed();
        const fn = bed.get(Injector).createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
        try {
            const cells = grid.flatMap((row, r) => row.flatMap((value, c): Array<[number, number, ICellData]> =>
                value === '' ? [] : [[r, c, typeof value === 'number' ? number(value) : text(value)]]
            ));
            const lookup = (...pairs: string[]) => getObjectValue(fn.calculate(textArg('Sales'), anchor(cells), ...pairs.map(textArg)));
            expect(lookup('Middle', 'Shared')).toBe(ErrorType.REF);
            expect(lookup('Middle', 'Shared', 'Category', 'East')).toBe(20);
            expect(lookup('Middle', 'Shared', 'Category', 'West')).toBe(30);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each(['tabular', 'compact'])('checks each %s row criterion at its own level and rejects ambiguous visible items', (layout) => {
        const range = { startRow: 0, endRow: 9, startColumn: 0, endColumn: 2 };
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: () => ({
                        ranges: [range],
                        fields: ['Category', 'Group', 'Detail'],
                        columnFields: [],
                        dataFields: [{ sourceName: 'Sales', displayName: 'Sum of Sales' }],
                        layout: {
                            firstDataRow: 1,
                            rowFieldNames: [['Category', 'Group'], ['Detail']],
                            compactRowGroups: layout === 'compact' ? [[1, 1, 'top'], [4, 1, 'top'], [7, 1, 'top'], [9, 0, 'bottom']] : undefined,
                        },
                    }),
                };
            }
        }
        const bed = createFunctionTestBed();
        const fn = bed.get(Injector).createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
        try {
            const grid = layout === 'compact'
                ? [
                    ['Row Labels', 'Sum of Sales'],
                    ['Gift Total', 14],
                    ['North', 8],
                    ['(Blank)', 6],
                    ['North', 30],
                    ['Online', 20],
                    ['Retail', 10],
                    ['South', 90],
                    ['Retail', 90],
                    ['Grand Total', 134],
                ]
                : [
                    ['Category', 'Detail', 'Sum of Sales'],
                    ['Gift Total', 'North', 8],
                    ['', '(Blank)', 6],
                    ['Gift Total Total', '', 14],
                    ['North', 'Online', 20],
                    ['', 'Retail', 10],
                    ['North Total', '', 30],
                    ['South', 'Retail', 90],
                    ['South Total', '', 90],
                    ['Grand Total', '', 134],
                ];
            const cells = grid.flatMap((row, r) => row.flatMap((value, c): Array<[number, number, ICellData]> =>
                value === '' ? [] : [[r, c, typeof value === 'number' ? number(value) : text(value)]]
            ));
            const lookup = (...pairs: string[]) => getObjectValue(fn.calculate(textArg('Sales'), anchor(cells), ...pairs.map(textArg)));
            expect(lookup('Detail', 'Retail')).toBe(ErrorType.REF);
            expect(lookup('Detail', 'Online')).toBe(20);
            expect(lookup('Detail', 'North')).toBe(8);
            expect(lookup('Category', 'Gift Total')).toBe(14);
            expect(lookup('Detail', '(blank)')).toBe(6);
            expect(lookup('Category', 'North', 'Detail', 'Retail')).toBe(10);
            expect(lookup('Detail', 'Retail', 'Category', 'North')).toBe(10);
            expect(lookup('Detail', 'Retail', 'Group', 'South')).toBe(90);
            expect(lookup('Detail', 'Retail', 'Category', 'South', 'Group', 'South')).toBe(90);
            expect(lookup('Detail', 'Retail', 'Category', 'North', 'Group', 'South')).toBe(ErrorType.REF);
            expect(lookup('Category', 'Gift Total', 'Detail', 'Retail')).toBe(ErrorType.REF);
            expect(lookup()).toBe(134);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([
        [3, [5, 6]],
        [undefined, undefined],
        [3, []],
    ])('uses the actual grand totals with data start row %s and total columns %j', (firstDataRow, columnGrandTotals) => {
        const range = { startRow: 0, endRow: 4, startColumn: 0, endColumn: 6 };
        class HostedGetpivotdata extends Getpivotdata {
            protected override get pivotReportLookup(): IPivotFormulaReportLookup {
                return {
                    getPivotFormulaReport: () => ({
                        ranges: [range],
                        fields: ['Region', 'Channel'],
                        columnFields: ['Channel'],
                        dataFields: [
                            { sourceName: 'Amount', displayName: 'Sum of Amount' },
                            { sourceName: 'Quantity', displayName: 'Sum of Quantity' },
                        ],
                        layout: { firstDataRow, columnGrandTotals },
                    }),
                };
            }
        }
        const bed = createFunctionTestBed();
        const fn = bed.get(Injector).createInstance(HostedGetpivotdata, FUNCTION_NAMES_LOOKUP.GETPIVOTDATA);
        try {
            const grid = [
                ['', 'Column Labels'],
                ['', 'Total Sum of Amount', '', 'Retail', '', 'Total Sum of Amount', 'Total Sum of Quantity'],
                ['Row Labels', 'Sum of Amount', 'Sum of Quantity', 'Sum of Amount', 'Sum of Quantity'],
                ['East', 110, 3, 90, 2, 200, 5],
                ['Grand Total', 110, 3, 90, 2, 200, 5],
            ];
            const cells = grid.flatMap((row, r) => row.flatMap((value, c): Array<[number, number, ICellData]> =>
                value === '' ? [] : [[r, c, typeof value === 'number' ? number(value) : text(value)]]
            ));
            const lookup = (measure: string, ...pairs: string[]) => getObjectValue(fn.calculate(textArg(measure), anchor(cells), ...pairs.map(textArg)));
            expect.soft(lookup('Amount', 'Region', 'East', 'Channel', 'Total Sum of Amount')).toBe(110);
            expect(lookup('Quantity', 'Channel', 'Total Sum of Amount', 'Region', 'East')).toBe(3);
            expect(lookup('Amount')).toBe(columnGrandTotals?.length === 0 ? ErrorType.REF : 200);
            expect(lookup('Quantity')).toBe(columnGrandTotals?.length === 0 ? ErrorType.REF : 5);
        } finally {
            bed.univer.dispose();
        }
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
