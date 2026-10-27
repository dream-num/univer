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

import type { IFreeze, Injector, IWorkbookData, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    RedoCommand,
    SheetTypes,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
import { CancelFrozenCommand, getPrimaryForRange, SetSelectionsOperation, SheetsSelectionsService, UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { IScrollStateWithSearchParam } from '../../../services/scroll-manager.service';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import {
    SetColumnFrozenCommand,
    SetFirstColumnFrozenCommand,
    SetFirstRowFrozenCommand,
    SetRowFrozenCommand,
    SetSelectionFrozenCommand,
} from '../set-frozen.command';
import { createFrozenCommandTestBed } from './create-selection-command-test-bed';

describe('Test commands used for change selections', () => {
    let univer: Univer | null = null;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManagerService: SheetsSelectionsService;
    let scrollManagerService: SheetScrollManagerService;

    const searchParam = {
        unitId: 'test',
        sheetId: 'sheet1',
    };

    function select(
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        actualRow: number,
        actualColumn: number,
        isMerged: boolean,
        isMergedMainCell: boolean
    ) {
        selectionManagerService.addSelections([
            {
                range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,
                    actualRow,
                    actualColumn,
                    isMerged,
                    isMergedMainCell,
                },
                style: null,
            },
        ]);
    }

    const scrollTo = (startRow: number, startColumn: number, offsetX = 0, offsetY = 0) => {
        const scrollInfo = {
            sheetViewStartRow: startRow,
            sheetViewStartColumn: startColumn,
            offsetX,
            offsetY,
            ...searchParam,
        };
        scrollManagerService.emitRawScrollParam(scrollInfo);
        scrollManagerService.setValidScrollState(scrollInfo);
    };

    const getFreeze = () => {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        return worksheet?.getConfig().freeze;
    };

    function disposeTestBed() {
        univer?.dispose();
        univer = null;
    }

    function prepareTestBed(snapshot?: IWorkbookData) {
        const testBed = createFrozenCommandTestBed(snapshot);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        selectionManagerService = get(SheetsSelectionsService);
        scrollManagerService = get(SheetScrollManagerService);
        scrollManagerService.setSearchParam({
            ...searchParam,
        });
        const scrollState = scrollManagerService.getScrollStateByParam(searchParam);
        const scrollStateWithSheetId: IScrollStateWithSearchParam = {
            ...scrollState!,
            ...searchParam,
        };
        scrollManagerService.emitRawScrollParam(scrollStateWithSheetId);
    }

    afterEach(disposeTestBed);

    describe('Freeze', () => {
        beforeEach(() => prepareTestBed());

        it('Should freeze row and col on current cell', async () => {
            select(2, 2, 2, 2, 2, 2, false, false);

            await commandService.executeCommand(SetSelectionFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === 2 && config.startColumn === 2).toBeTruthy();
        });

        it.each(['D12', '$D$12', 'D12:F15'])('freezes a parsed reference %s and supports undo and redo', async (reference) => {
            const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            const { range } = deserializeRangeWithSheet(reference);
            const originalFreeze = { ...worksheet.getFreeze() };
            commandService.syncExecuteCommand(SetSelectionsOperation.id, {
                unitId: workbook.getUnitId(),
                subUnitId: worksheet.getSheetId(),
                selections: [{ range, primary: getPrimaryForRange(range, worksheet), style: null }],
            });

            expect(selectionManagerService.getCurrentLastSelectionPrimaryCell()).toMatchObject({
                actualRow: 11,
                actualColumn: 3,
            });
            await expect(commandService.executeCommand(SetSelectionFrozenCommand.id)).resolves.toBe(true);
            const expectedFreeze = { startRow: 11, startColumn: 3, xSplit: 3, ySplit: 11 };
            expect(getFreeze()).toEqual(expectedFreeze);

            await commandService.executeCommand(UndoCommand.id);
            expect(getFreeze()).toEqual(originalFreeze);
            await commandService.executeCommand(RedoCommand.id);
            expect(getFreeze()).toEqual(expectedFreeze);
        });

        it('Should keep default freeze config when selection is invalid', async () => {
            await commandService.executeCommand(CancelFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === -1 && config.startColumn === -1).toBeTruthy();
        });

        it('Should freeze current row', async () => {
            select(2, 2, 2, 2, 2, 2, false, false);

            await commandService.executeCommand(SetRowFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === 2 && config.startColumn === -1).toBeTruthy();
        });

        it('Should freeze current column', async () => {
            select(2, 2, 2, 2, 2, 2, false, false);

            await commandService.executeCommand(SetColumnFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === -1 && config.startColumn === 2).toBeTruthy();
        });

        it('xSplit or ySplit must bigger than 0 if row or column was set', async () => {
            select(2, 2, 2, 2, 2, 2, false, false);
            scrollTo(2, 2);
            let config: IFreeze | undefined;
            await commandService.executeCommand(SetColumnFrozenCommand.id);
            config = getFreeze();
            expect(config?.startRow === -1 && config.startColumn === 2).toBeTruthy();
            expect(config?.xSplit).toBe(1);

            await commandService.executeCommand(SetRowFrozenCommand.id);
            config = getFreeze();
            expect(config?.startRow === 2 && config.startColumn === -1).toBeTruthy();
            expect(config?.ySplit).toBe(1);

            await commandService.executeCommand(SetSelectionFrozenCommand.id);
            config = getFreeze();
            expect(config?.startRow === 2 && config.startColumn === 2).toBeTruthy();
            expect(config?.ySplit).toBe(1);
            expect(config?.xSplit).toBe(1);
        });

        it('Should freeze first row and first column based on current viewport', async () => {
            scrollTo(4, 6);

            await commandService.executeCommand(SetFirstRowFrozenCommand.id);
            let config = getFreeze();
            expect(config?.startRow).toBe(5);
            expect(config?.startColumn).toBe(-1);
            expect(config?.ySplit).toBe(1);

            await commandService.executeCommand(SetFirstColumnFrozenCommand.id);
            config = getFreeze();
            expect(config?.startRow).toBe(-1);
            expect(config?.startColumn).toBe(7);
            expect(config?.xSplit).toBe(1);
        });

        it('Should not freeze when the whole sheet is selected', async () => {
            selectionManagerService.setSelections([
                {
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 19,
                        endColumn: 19,
                        rangeType: RANGE_TYPE.ALL,
                    },
                    primary: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 19,
                        endColumn: 19,
                        actualRow: 0,
                        actualColumn: 0,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ]);

            await expect(commandService.executeCommand(SetSelectionFrozenCommand.id)).resolves.toBe(false);
            expect(getFreeze()).toEqual({
                startRow: -1,
                startColumn: -1,
                xSplit: 0,
                ySplit: 0,
            });
        });

        it('Should cancel all freeze', async () => {
            await commandService.executeCommand(CancelFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === -1 && config.startColumn === -1).toBeTruthy();
        });
    });
});

it('rejects Chart Sheet freeze commands before reading Grid render state or writing a mutation', async () => {
    const univer = new Univer();
    try {
        univer.registerPlugin(UniverSheetsPlugin);
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'chart-freeze',
            sheetOrder: ['chart'],
            sheets: { chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, rowCount: 0, columnCount: 0 } },
        });
        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        const commands = injector.get(ICommandService);
        commands.registerCommand(SetSelectionFrozenCommand);
        commands.registerCommand(SetFirstRowFrozenCommand);
        injector.get(SheetsSelectionsService).addSelections([{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
        const before = JSON.stringify(workbook.getSnapshot());
        const history = injector.get(IUndoRedoService).pitchTopUndoElement();
        expect(await commands.executeCommand(SetFirstRowFrozenCommand.id)).toBe(false);
        expect(JSON.stringify(workbook.getSnapshot())).toBe(before);
        expect(injector.get(IUndoRedoService).pitchTopUndoElement()).toBe(history);
    } finally {
        univer.dispose();
    }
});
