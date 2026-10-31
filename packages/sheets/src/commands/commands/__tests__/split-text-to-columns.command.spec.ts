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

import type { ICellData, IWorkbookData, Workbook } from '@univerjs/core';
import {
    CellValueType,
    ICommandService,
    IResourceLoaderService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    ObjectMatrix,
    RANGE_TYPE,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { expect, it } from 'vitest';
import { SplitDelimiterEnum } from '../../../basics/split-range-text';
import enUS from '../../../locale/en-US';
import { UniverSheetsPlugin } from '../../../plugin';
import { SetWorksheetActiveOperation } from '../../operations/set-worksheet-active.operation';
import { SetRangeValuesCommand } from '../set-range-values.command';
import { SplitTextToColumnsCommand } from '../split-text-to-columns.command';

const cases = [
    {
        name: 'zero start with General format',
        startRow: 0,
        startColumn: 9,
        columnCount: 14,
        general: true,
        first: [12, 2, 8],
        second: [13, 3, 10],
        continued: [14, 4, 12],
    },
    { name: 'nonzero start one', startRow: 1, startColumn: 9, columnCount: 14 },
    { name: 'nonzero start four and another workbook active', startRow: 4, startColumn: 9, columnCount: 14, otherActive: true },
    { name: 'blank and numeric middle rows plus blank end', startRow: 0, startColumn: 9, columnCount: 14, mixed: true },
    { name: 'exactly fitting the last three columns', startRow: 3, startColumn: 9, columnCount: 12 },
    {
        name: 'appending exactly one missing column',
        startRow: 3,
        startColumn: 10,
        columnCount: 12,
        first: ['0012', '2', 8],
        second: ['0013', '3', 10],
        continued: ['0014', '4', 12],
    },
    {
        name: 'appending exactly two missing columns',
        startRow: 3,
        startColumn: 11,
        columnCount: 12,
        first: ['0012', 2, 8],
        second: ['0013', 3, 10],
        continued: ['0014', 4, 12],
    },
    { name: 'a whole-column source', startRow: 3, startColumn: 9, columnCount: 14, wholeColumn: true },
];

it('does not add history or change numeric cells when there is no text to split', () => {
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
    try {
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'no-text',
            name: 'No text',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['source'],
            sheets: {
                source: { id: 'source', name: 'Source', rowCount: 5, columnCount: 5, cellData: { 0: { 0: { v: 42, t: CellValueType.NUMBER } } } },
            },
        });
        const injector = univer.__getInjector();
        injector.get(LocaleService).setDirection('ltr');
        const commands = injector.get(ICommandService);
        const history = injector.get(IUndoRedoService);
        const before = history.getUndoRedoStatus('no-text');
        const cellBefore = Tools.deepClone(workbook.getSheetBySheetId('source')?.getCellRaw(0, 0));

        expect(commands.syncExecuteCommand(SplitTextToColumnsCommand.id, {
            unitId: 'no-text',
            subUnitId: 'source',
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            delimiter: SplitDelimiterEnum.Comma,
        })).toBe(false);
        expect(history.getUndoRedoStatus('no-text')).toEqual(before);
        expect(workbook.getSheetBySheetId('source')?.getCellRaw(0, 0)).toEqual(cellBefore);
    } finally {
        univer.dispose();
    }
});

it.each(cases)('splits text at $name without clearing unrelated data and restores history and reopening', async (scenario) => {
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
    const injector = univer.__getInjector();
    injector.get(LocaleService).setDirection('ltr');
    const commands = injector.get(ICommandService);
    const instances = injector.get(IUniverInstanceService);
    const { startRow, startColumn, columnCount } = scenario;
    const rows: ICellData[] = scenario.mixed
        ? [{ v: '0012,2,8' }, { v: null }, { v: 0, t: CellValueType.NUMBER }, { v: false, t: CellValueType.BOOLEAN }, { v: '0013,3,10' }, { v: null }]
        : [{ v: '0012,2,8' }, { v: '0013,3,10' }];
    const matrix = new ObjectMatrix<ICellData>();
    const style = scenario.general ? {} : { s: 'text' };
    rows.forEach((cell, index) => {
        matrix.setValue(startRow + index, startColumn, {
            ...cell,
            ...(typeof cell.v === 'string' ? { t: CellValueType.STRING } : {}),
            ...style,
        });
        for (let offset = 1; offset < 3 && startColumn + offset < columnCount; offset++) {
            matrix.setValue(startRow + index, startColumn + offset, {
                v: `keep-${index}-${offset}`,
                t: CellValueType.STRING,
                ...style,
            });
        }
        if (startColumn + 3 < columnCount) {
            matrix.setValue(startRow + index, startColumn + 3, { v: 77, t: CellValueType.NUMBER });
        }
    });
    matrix.setValue(15, columnCount - 1, { v: 88, t: CellValueType.NUMBER });
    try {
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'split',
            name: 'Split',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: { text: { n: { pattern: '@' } } },
            sheetOrder: ['source', 'active'],
            sheets: {
                source: { id: 'source', name: 'Source', rowCount: 20, columnCount, cellData: matrix.getMatrix() },
                active: { id: 'active', name: 'Active', rowCount: 20, columnCount, cellData: { [startRow]: { [startColumn]: { v: 'active,sentinel' } } } },
            },
        });
        const other = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'other',
            name: 'Other',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['source'],
            sheets: { source: { id: 'source', name: 'Source', rowCount: 20, columnCount, cellData: { [startRow]: { [startColumn]: { v: 'other,sentinel' } } } } },
        });
        const sheet = workbook.getSheetBySheetId('source');
        if (!sheet) {
            throw new Error('Expected the real source worksheet');
        }
        const before = Tools.deepClone(sheet.getCellMatrix().getMatrix());
        const otherBefore = Tools.deepClone(other.getSnapshot());
        const activeBefore = Tools.deepClone(workbook.getSheetBySheetId('active')?.getSnapshot());
        instances.focusUnit(scenario.otherActive ? 'other' : 'split');
        expect(commands.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: scenario.otherActive ? 'other' : 'split',
            subUnitId: scenario.otherActive ? 'source' : 'active',
        })).toBe(true);
        const range = scenario.wholeColumn
            ? { startRow: Number.NaN, endRow: Number.NaN, startColumn, endColumn: startColumn, rangeType: RANGE_TYPE.COLUMN }
            : { startRow, endRow: startRow + rows.length - 1, startColumn, endColumn: startColumn };
        const split = () => commands.syncExecuteCommand(SplitTextToColumnsCommand.id, {
            unitId: 'split',
            subUnitId: 'source',
            range,
            delimiter: SplitDelimiterEnum.Comma,
        });
        expect(split()).toBe(true);
        expect(sheet.getColumnCount()).toBe(Math.max(columnCount, startColumn + 3));
        if (scenario.mixed) {
            for (const index of [2, 3, 1, 5]) {
                for (let offset = 0; offset < 3; offset++) {
                    expect(sheet.getCellRaw(startRow + index, startColumn + offset)).toEqual(before[startRow + index][startColumn + offset]);
                }
            }
        }
        const secondRow = startRow + (scenario.mixed ? 4 : 1);
        const expectedFirst = scenario.first ?? ['0012', '2', '8'];
        const expectedSecond = scenario.second ?? ['0013', '3', '10'];
        const assertSplit = (current: Workbook) => {
            const currentSheet = current.getSheetBySheetId('source');
            expect([0, 1, 2].map((offset) => currentSheet?.getCellRaw(startRow, startColumn + offset)?.v))
                .toEqual(expectedFirst);
            expect([0, 1, 2].map((offset) => currentSheet?.getCellRaw(secondRow, startColumn + offset)?.v))
                .toEqual(expectedSecond);
            expect(currentSheet?.getColumnCount()).toBe(Math.max(columnCount, startColumn + 3));
            expect(currentSheet?.getCellRaw(15, columnCount - 1)?.v).toBe(88);
            if (startColumn + 3 < columnCount) {
                expect(currentSheet?.getCellRaw(startRow, startColumn + 3)?.v).toBe(77);
            }
        };
        assertSplit(workbook);
        expect(other.getSnapshot()).toEqual(otherBefore);
        expect(workbook.getSheetBySheetId('active')?.getSnapshot()).toEqual(activeBefore);
        instances.focusUnit('split');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(sheet.getColumnCount()).toBe(columnCount);
        expect(sheet.getCellMatrix().getMatrix()).toEqual(before);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        assertSplit(workbook);
        const snapshot = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('split');
        if (!snapshot) {
            throw new Error('Expected the actual workbook snapshot');
        }
        expect(instances.disposeUnit('split')).toBe(true);
        const reopened = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
        assertSplit(reopened);
        instances.focusUnit('split');
        expect(await commands.executeCommand(SetRangeValuesCommand.id, {
            unitId: 'split',
            subUnitId: 'source',
            range: { startRow, endRow: startRow, startColumn, endColumn: startColumn },
            value: { v: '0014,4,12' },
        })).toBe(true);
        expect(split()).toBe(true);
        expect([0, 1, 2].map((offset) => reopened.getSheetBySheetId('source')?.getCellRaw(startRow, startColumn + offset)?.v))
            .toEqual(scenario.continued ?? ['0014', '4', '12']);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(reopened.getSheetBySheetId('source')?.getCellRaw(startRow, startColumn)?.v).toBe('0014,4,12');
        expect(other.getSnapshot()).toEqual(otherBefore);
    } finally {
        univer.dispose();
    }
});
