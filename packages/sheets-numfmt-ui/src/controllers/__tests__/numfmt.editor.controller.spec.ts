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
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    RegionService,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AFTER_CELL_EDIT,
    INumfmtService,
    NumfmtService,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NumfmtEditorController } from '../numfmt.editor.controller';

describe('NumfmtEditorController explicit command targets', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([INumfmtService, { useClass: NumfmtService }]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetsSelectionsService]);
        injector.add([SheetsNumfmtCellContentController]);
        injector.add([NumfmtEditorController]);
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: {} });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const commands = injector.get(ICommandService);
        for (const command of [
            SetRangeValuesCommand,
            SetRangeValuesMutation,
            SetNumfmtMutation,
            RemoveNumfmtMutation,
            SetSelectionsOperation,
            SetWorksheetActiveOperation,
        ]) {
            commands.registerCommand(command);
        }
    });

    afterEach(() => univer.dispose());

    for (const current of ['none', 'peer', 'other-worksheet'] as const) {
        for (const formatted of [false, true]) {
            it(`writes ${formatted ? 'parsed percentage' : 'plain numeric data'} with ${current} current and preserves history`, async () => {
                const injector = univer.__getInjector();
                const instances = injector.get(IUniverInstanceService);
                const peer = instances.createUnit<IWorkbookData, Workbook>(
                    UniverInstanceType.UNIVER_SHEET,
                    workbookData('peer'),
                    { makeCurrent: false }
                );
                const child = instances.createUnit<IWorkbookData, Workbook>(
                    UniverInstanceType.UNIVER_SHEET,
                    workbookData('child'),
                    { makeCurrent: false }
                );
                if (current !== 'none') {
                    instances.setCurrentUnitForType(current === 'peer' ? 'peer' : 'child');
                }
                injector.get(NumfmtEditorController);
                const worksheet = child.getSheetBySheetId('sheet2')!;
                const before = Tools.deepClone(worksheet.getCellRaw(0, 0));
                const peerBefore = Tools.deepClone(peer.getSnapshot());
                const otherSheetBefore = Tools.deepClone(child.getSheetBySheetId('sheet1')!.getSnapshot());
                let value: ICellData = { v: 42 };
                if (formatted) {
                    const interceptor = injector.get(SheetInterceptorService).writeCellInterceptor;
                    value = interceptor.fetchThroughInterceptors(AFTER_CELL_EDIT)({ v: '50%' }, {
                        workbook: child,
                        worksheet,
                        unitId: 'child',
                        subUnitId: 'sheet2',
                        row: 0,
                        col: 0,
                        origin: before,
                    })!;
                }
                const commands = injector.get(ICommandService);
                expect(await commands.executeCommand(SetRangeValuesCommand.id, {
                    unitId: 'child',
                    subUnitId: 'sheet2',
                    range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                    value,
                })).toBe(true);
                expect(worksheet.getCellRaw(0, 0)?.v).toBe(formatted ? 0.5 : 42);
                const pattern = injector.get(INumfmtService).getValue('child', 'sheet2', 0, 0)?.pattern;
                expect(pattern).toBe(formatted ? '0%' : undefined);
                expect(peer.getSnapshot()).toEqual(peerBefore);
                expect(child.getSheetBySheetId('sheet1')!.getSnapshot()).toEqual(otherSheetBefore);

                instances.focusUnit('child');
                expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
                expect(worksheet.getCellRaw(0, 0)?.v).toBe(before?.v);
                expect(injector.get(INumfmtService).getValue('child', 'sheet2', 0, 0)?.pattern).toBeUndefined();
                expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
                expect(worksheet.getCellRaw(0, 0)?.v).toBe(formatted ? 0.5 : 42);
                expect(injector.get(INumfmtService).getValue('child', 'sheet2', 0, 0)?.pattern).toBe(pattern);
                expect(peer.getSnapshot()).toEqual(peerBefore);
                expect(child.getSheetBySheetId('sheet1')!.getSnapshot()).toEqual(otherSheetBefore);
            });
        }
    }

    it('uses the active region when committing text in the same workbook', async () => {
        const injector = univer.__getInjector();
        const workbook = injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            workbookData('regions')
        );
        injector.get(NumfmtEditorController);
        const region = injector.get(RegionService);
        const worksheet = workbook.getSheetBySheetId('sheet2')!;
        const edit = injector.get(SheetInterceptorService).writeCellInterceptor.fetchThroughInterceptors(AFTER_CELL_EDIT);
        const commands = injector.get(ICommandService);
        const samples = [
            ['en-US', '1,234', 1234, CellValueType.NUMBER],
            ['de-DE', '1,234', 1.234, CellValueType.NUMBER],
            ['fr-CH', '1,234', '1,234', CellValueType.STRING],
            ['de-DE', '1234.56', '1234.56', CellValueType.STRING],
            ['en-IN', '1,23,456.70', 123456.7, CellValueType.NUMBER],
            ['fr-FR', '123456789123456789,01', '123456789123456789,01', CellValueType.FORCE_STRING],
        ] as const;
        for (const [row, [tag, input, expected, type]] of samples.entries()) {
            region.setRegion(tag);
            const target = { unitId: 'regions', subUnitId: 'sheet2' };
            const value = edit({ v: input }, { ...target, row, col: 1, workbook, worksheet, origin: null });
            await commands.executeCommand(SetRangeValuesCommand.id, {
                ...target,
                range: { startRow: row, endRow: row, startColumn: 1, endColumn: 1 },
                value,
            });
            expect(worksheet.getCellRaw(row, 1)).toMatchObject({ v: expected, t: type });
        }
    });

    it('writes accounting negatives without inventing a number format', async () => {
        const injector = univer.__getInjector();
        const instances = injector.get(IUniverInstanceService);
        const workbook = instances.createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            workbookData('paren'),
            { makeCurrent: true }
        );
        injector.get(NumfmtEditorController);
        const worksheet = workbook.getSheetBySheetId('sheet2')!;
        const commands = injector.get(ICommandService);
        const interceptor = injector.get(SheetInterceptorService).writeCellInterceptor;
        const numfmt = injector.get(INumfmtService);

        const cases: Array<{ input: string; value: number | string; pattern?: string }> = [
            { input: '(5)', value: -5 },
            { input: '(1,000)', value: -1000, pattern: '#,##0' },
            { input: '($1,000)', value: -1000, pattern: '$#,##0' },
            { input: '(5', value: '(5' },
            { input: '(+5)', value: '(+5)' },
        ];

        for (const [row, testCase] of cases.entries()) {
            const value = interceptor.fetchThroughInterceptors(AFTER_CELL_EDIT)({ v: testCase.input }, {
                workbook,
                worksheet,
                unitId: 'paren',
                subUnitId: 'sheet2',
                row,
                col: 0,
                origin: worksheet.getCellRaw(row, 0),
            })!;

            expect(await commands.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'paren',
                subUnitId: 'sheet2',
                range: { startRow: row, endRow: row, startColumn: 0, endColumn: 0 },
                value,
            })).toBe(true);

            expect(worksheet.getCellRaw(row, 0)?.v).toBe(testCase.value);
            expect(numfmt.getValue('paren', 'sheet2', row, 0)?.pattern).toBe(testCase.pattern);
        }
    });
});

function workbookData(id: string): IWorkbookData {
    return {
        id,
        name: id,
        appVersion: 'test',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['sheet1', 'sheet2'],
        sheets: {
            sheet1: { id: 'sheet1', name: 'Other', cellData: { 0: { 0: { v: 7 } } } },
            sheet2: { id: 'sheet2', name: 'Target', cellData: { 0: { 0: { v: 11 } } } },
        },
    };
}
