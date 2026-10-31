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

import type { IDisposable, IRange, IWorkbookData, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import {
    ClearSelectionAllCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    INTERCEPTOR_POINT,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    SheetsSelectionsService,
    UniverSheetsPlugin,
} from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { describe, expect, it } from 'vitest';
import { AddHyperLinkMutation } from '../../commands/mutations/add-hyper-link.mutation';
import enUS from '../../locale/en-US';
import { HyperLinkModel } from '../../models/hyper-link.model';
import { UniverSheetsHyperLinkPlugin } from '../../plugin';
import { SheetHyperLinkSetRangeController } from '../set-range.controller';

function workbookData(id: string): IWorkbookData {
    return {
        id,
        name: 'Hyperlink clear workbook',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['orders', 'summary'],
        sheets: {
            orders: {
                id: 'orders',
                name: 'Orders',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    1: { 1: { v: 'outside' } },
                    6: { 9: { v: 'first' }, 10: { v: 'second' } },
                    8: { 9: { v: 'third' } },
                },
            },
            summary: {
                id: 'summary',
                name: 'Summary',
                rowCount: 20,
                columnCount: 20,
                cellData: { 1: { 1: { v: 'independent' } } },
            },
        },
    };
}

function createTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...enUS } });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsHyperLinkPlugin);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData('main'));
    const independent = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData('independent'));
    const commands = injector.get(ICommandService);
    const instances = injector.get(IUniverInstanceService);
    const selections = injector.get(SheetsSelectionsService);
    const model = injector.get(HyperLinkModel);
    const controller = injector.get(SheetHyperLinkSetRangeController);
    for (const unit of [workbook, independent]) {
        const unitId = unit.getUnitId();
        for (const [id, row, column] of [
            ['outside', 1, 1],
            ['first', 6, 9],
            ['second', 6, 10],
            ['third', 8, 9],
        ] as const) {
            expect(commands.syncExecuteCommand(AddHyperLinkMutation.id, {
                unitId,
                subUnitId: 'orders',
                link: { id, row, column, display: id, payload: `https://univer.ai/${id}` },
            })).toBe(true);
        }
        expect(commands.syncExecuteCommand(AddHyperLinkMutation.id, {
            unitId,
            subUnitId: 'summary',
            link: { id: 'independent-link', row: 1, column: 1, display: 'independent', payload: 'https://univer.ai/independent' },
        })).toBe(true);
    }
    return { univer, workbook, independent, commands, instances, selections, model, controller };
}

const clearCommands = [ClearSelectionContentCommand, ClearSelectionFormatCommand, ClearSelectionAllCommand];

describe('SheetHyperLinkSetRangeController clear commands', () => {
    it('clears multiple toolbar ranges once while preserving unselected links', async () => {
        const bed = createTestBed();
        try {
            bed.instances.focusUnit('main');
            expect(bed.commands.syncExecuteCommand(SetWorksheetActiveOperation.id, {
                unitId: 'main',
                subUnitId: 'orders',
            })).toBe(true);
            bed.selections.setSelections('main', 'orders', [6, 8].map((row) => ({
                range: { startRow: row, endRow: row, startColumn: 9, endColumn: 9 },
                primary: null,
                style: null,
            })));
            const before = Tools.deepClone(bed.model.getAll());
            expect(await bed.commands.executeCommand(ClearSelectionAllCommand.id)).toBe(true);
            expect(bed.model.getSubUnit('main', 'orders').map((link) => link.id)).toEqual(['outside', 'second']);
            expect(await bed.commands.executeCommand(UndoCommand.id, { unitId: 'main' })).toBe(true);
            expect(bed.model.getAll()).toEqual(before);
            expect(await bed.commands.executeCommand(RedoCommand.id, { unitId: 'main' })).toBe(true);
            expect(bed.model.getSubUnit('main', 'orders').map((link) => link.id)).toEqual(['outside', 'second']);
        } finally {
            bed.univer.dispose();
        }
    });

    for (const clear of clearCommands) {
        it(`${clear.id} preserves hyperlinks in filtered rows while clearing visible rows`, async () => {
            const bed = createTestBed();
            let filteredRow: IDisposable | undefined;
            try {
                bed.instances.focusUnit('main');
                expect(bed.commands.syncExecuteCommand(SetWorksheetActiveOperation.id, {
                    unitId: 'main',
                    subUnitId: 'orders',
                })).toBe(true);
                const worksheet = bed.workbook.getSheetBySheetId('orders')!;
                filteredRow = bed.univer.__getInjector().get(SheetInterceptorService).intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
                    handler(filtered, location, next) {
                        if (location.unitId === 'main' && location.subUnitId === 'orders' && location.row === 6) {
                            return true;
                        }
                        return next(filtered);
                    },
                });
                expect(worksheet.getRowFiltered(6)).toBe(true);
                const before = Tools.deepClone(bed.model.getAll());
                const ranges: IRange[] = [{ startRow: 6, endRow: 8, startColumn: 9, endColumn: 9 }];
                expect(await bed.commands.executeCommand(clear.id, { unitId: 'main', subUnitId: 'orders', ranges })).toBe(true);
                expect(worksheet.getCellRaw(6, 9)?.v).toBe('first');
                expect(bed.model.getSubUnit('main', 'orders').map((link) => link.id)).toEqual(['outside', 'first', 'second']);
                expect(await bed.commands.executeCommand(UndoCommand.id, { unitId: 'main' })).toBe(true);
                expect(bed.model.getAll()).toEqual(before);
                expect(await bed.commands.executeCommand(RedoCommand.id, { unitId: 'main' })).toBe(true);
                expect(bed.model.getSubUnit('main', 'orders').map((link) => link.id)).toEqual(['outside', 'first', 'second']);
            } finally {
                filteredRow?.dispose();
                bed.univer.dispose();
            }
        });

        for (const focusIndependent of [false, true]) {
            it(`${clear.id} removes only explicitly targeted links across discrete overlapping ranges; other unit=${focusIndependent}`, async () => {
                const bed = createTestBed();
                try {
                    const before = Tools.deepClone(bed.model.getAll());
                    const current = focusIndependent ? bed.independent : bed.workbook;
                    bed.instances.focusUnit(current.getUnitId());
                    expect(bed.commands.syncExecuteCommand(SetWorksheetActiveOperation.id, {
                        unitId: current.getUnitId(),
                        subUnitId: 'summary',
                    })).toBe(true);
                    bed.selections.setSelections(current.getUnitId(), 'summary', [{
                        range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                        primary: null,
                        style: null,
                    }]);
                    const ranges: IRange[] = [
                        { startRow: 6, endRow: 6, startColumn: 9, endColumn: 10 },
                        { startRow: 6, endRow: 6, startColumn: 9, endColumn: 9 },
                        { startRow: 8, endRow: 8, startColumn: 9, endColumn: 9 },
                    ];
                    const params = { unitId: 'main', subUnitId: 'orders', ranges };
                    const originalParams = Tools.deepClone(params);
                    expect(await bed.commands.executeCommand(clear.id, params)).toBe(true);
                    expect(params).toEqual(originalParams);
                    const expected = Tools.deepClone(before);
                    const targetLinks = expected.flat().find((sheet) => sheet.unitId === 'main' && sheet.subUnitId === 'orders')!;
                    targetLinks.links = targetLinks.links.filter((link) => link.id === 'outside');
                    expect(bed.model.getSubUnit('main', 'orders')).toEqual(targetLinks.links);
                    expect(bed.model.getAll()).toEqual(expected);
                    expect(bed.workbook.getSheetBySheetId('orders')!.getCellRaw(1, 1)?.v).toBe('outside');
                    bed.instances.focusUnit('main');
                    expect(await bed.commands.executeCommand(UndoCommand.id, { unitId: 'main' })).toBe(true);
                    expect(bed.model.getAll()).toEqual(before);
                    expect(await bed.commands.executeCommand(RedoCommand.id, { unitId: 'main' })).toBe(true);
                    expect(bed.model.getAll()).toEqual(expected);
                    expect(bed.model.getSubUnit(current.getUnitId(), 'summary')).toEqual(before
                        .flat()
                        .find((sheet) => sheet.unitId === current.getUnitId() && sheet.subUnitId === 'summary')!.links);
                } finally {
                    bed.univer.dispose();
                }
            });
        }

        it(`${clear.id} retains the current-selection toolbar contract without explicit params`, async () => {
            const bed = createTestBed();
            try {
                bed.instances.focusUnit('main');
                expect(bed.commands.syncExecuteCommand(SetWorksheetActiveOperation.id, {
                    unitId: 'main',
                    subUnitId: 'orders',
                })).toBe(true);
                bed.selections.setSelections('main', 'orders', [{
                    range: { startRow: 6, endRow: 6, startColumn: 9, endColumn: 9 },
                    primary: null,
                    style: null,
                }]);
                const before = Tools.deepClone(bed.model.getAll());
                expect(await bed.commands.executeCommand(clear.id)).toBe(true);
                expect(bed.model.getSubUnit('main', 'orders').map((link) => link.id)).toEqual(['outside', 'second', 'third']);
                expect(await bed.commands.executeCommand(UndoCommand.id, { unitId: 'main' })).toBe(true);
                expect(bed.model.getAll()).toEqual(before);
                expect(await bed.commands.executeCommand(RedoCommand.id, { unitId: 'main' })).toBe(true);
                expect(bed.model.getSubUnit('main', 'orders').map((link) => link.id)).toEqual(['outside', 'second', 'third']);
            } finally {
                bed.univer.dispose();
            }
        });
    }
});
