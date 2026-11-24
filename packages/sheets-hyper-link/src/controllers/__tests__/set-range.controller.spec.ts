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
import {
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    ClearSelectionAllCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    SheetInterceptorService,
    SheetsSelectionsService,
    UniverSheetsPlugin,
} from '@univerjs/sheets';
import enUS from '@univerjs/sheets/locale/en-US';
import { describe, expect, it } from 'vitest';
import { AddHyperLinkMutation } from '../../commands/mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../../commands/mutations/remove-hyper-link.mutation';
import { HyperLinkModel } from '../../models/hyper-link.model';
import { SheetHyperLinkSetRangeController } from '../set-range.controller';

describe('SheetHyperLinkSetRangeController', () => {
    it.each([ClearSelectionContentCommand.id, ClearSelectionAllCommand.id, ClearSelectionFormatCommand.id])(
        'clears overlapping selections once and restores cells and links on undo (%s)',
        async (commandId) => {
            const univer = new Univer();
            univer.registerPlugin(UniverSheetsPlugin);
            const injector = univer.__getInjector();
            const locale = injector.get(LocaleService);
            locale.load({ [LocaleType.EN_US]: enUS });
            locale.setLocale(LocaleType.EN_US);
            locale.setDirection('ltr');
            injector.add([HyperLinkModel]);
            injector.add([SheetHyperLinkSetRangeController]);
            const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'test',
                locale: LocaleType.EN_US,
                sheetOrder: ['sheet1'],
                sheets: { sheet1: { id: 'sheet1', name: 'Sheet1', cellData: { 1: { 1: { v: 'Keep', s: { bl: 1 } } } } } },
            });
            try {
                injector.get(IUniverInstanceService).focusUnit('test');
                const commands = injector.get(ICommandService);
                commands.registerCommand(AddHyperLinkMutation);
                commands.registerCommand(RemoveHyperLinkMutation);
                injector.get(SheetHyperLinkSetRangeController);
                const target = { unitId: 'test', subUnitId: 'sheet1' };
                expect(commands.syncExecuteCommand(AddHyperLinkMutation.id, {
                    ...target,
                    link: { id: 'link', row: 1, column: 1, display: 'Keep', payload: 'https://example.com/link' },
                })).toBe(true);
                const link = () => injector.get(HyperLinkModel).getHyperLinkByLocation('test', 'sheet1', 1, 1);
                const sheet = workbook.getActiveSheet()!;
                expect(await commands.executeCommand(commandId, {
                    ...target,
                    ranges: [
                        { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
                        { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
                    ],
                })).toBe(true);
                expect(link()).toBeUndefined();
                expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
                expect(sheet.getCellRaw(1, 1)?.v).toBe('Keep');
                expect(sheet.getComposedCellStyle(1, 1)?.bl).toBe(1);
                expect(link()?.id).toBe('link');
                expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
                expect(link()).toBeUndefined();
            } finally {
                univer.dispose();
            }
        }
    );

    it.each([ClearSelectionContentCommand.id, ClearSelectionAllCommand.id, ClearSelectionFormatCommand.id])(
        'clears only hyperlinks in resolved ranges through redo and undo (%s)',
        (commandId) => {
            const univer = new Univer();
            const injector = univer.__getInjector();
            injector.add([HyperLinkModel]);
            injector.add([SheetsSelectionsService]);
            injector.add([SheetInterceptorService]);
            injector.add([SheetHyperLinkSetRangeController]);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'test',
                locale: LocaleType.EN_US,
                sheetOrder: ['sheet1'],
                sheets: { sheet1: { id: 'sheet1', name: 'Sheet1', cellData: {} } },
            });
            try {
                const commands = injector.get(ICommandService);
                commands.registerCommand(AddHyperLinkMutation);
                commands.registerCommand(RemoveHyperLinkMutation);
                const model = injector.get(HyperLinkModel);
                injector.get(SheetHyperLinkSetRangeController);
                injector.get(SheetsSelectionsService).addSelections([{
                    range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
                    primary: null,
                    style: null,
                }]);
                ['A', 'B', 'C'].forEach((id, row) => model.addHyperLink('test', 'sheet1', {
                    id,
                    row,
                    column: 0,
                    display: id,
                    payload: `https://example.com/${id}`,
                }));
                const mutations = injector.get(SheetInterceptorService).onCommandExecute({
                    id: commandId,
                    params: {
                        unitId: 'test',
                        subUnitId: 'sheet1',
                        ranges: [0, 2].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 0 })),
                    },
                });
                const links = () => [0, 1, 2].map((row) => model.getHyperLinkByLocation('test', 'sheet1', row, 0)?.id);
                mutations.redos.forEach(({ id, params }) => commands.syncExecuteCommand(id, params));
                expect(links()).toEqual([undefined, 'B', undefined]);
                mutations.undos.forEach(({ id, params }) => commands.syncExecuteCommand(id, params));
                expect(links()).toEqual(['A', 'B', 'C']);
                mutations.redos.forEach(({ id, params }) => commands.syncExecuteCommand(id, params));
                expect(links()).toEqual([undefined, 'B', undefined]);
            } finally {
                univer.dispose();
            }
        }
    );
});
