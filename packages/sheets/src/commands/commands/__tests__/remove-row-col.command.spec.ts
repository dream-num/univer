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

import type { ICellData, Injector, IWorkbookData, Nullable, Univer, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RANGE_TYPE,
    RedoCommand,
    Tools,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, Spreadsheet, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IRemoveRowColCommandParams } from '../remove-row-col.command';
import { MergeCellController } from '../../../controllers/merge-cell.controller';
import { RefRangeService } from '../../../services/ref-range/ref-range.service';
import { handleDefaultRangeChangeWithEffectRefCommands } from '../../../services/ref-range/util';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SheetInterceptorService } from '../../../services/sheet-interceptor/sheet-interceptor.service';
import { SheetSkeletonService } from '../../../skeleton/skeleton.service';
import { InsertColMutation, InsertRowMutation } from '../../mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../mutations/remove-row-col.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { InsertColByRangeCommand, InsertRowByRangeCommand } from '../insert-row-col.command';
import { RemoveColByRangeCommand, RemoveColCommand, RemoveRowByRangeCommand, RemoveRowCommand } from '../remove-row-col.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test remove rows cols', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
            setTransform: () => {},
            clearRect: () => {},
        } as unknown as CanvasRenderingContext2D);
        const testBed = createMoveRowsColsTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);

        [
            RemoveRowCommand,
            RemoveColCommand,
            RemoveRowByRangeCommand,
            RemoveColByRangeCommand,
            RemoveColMutation,
            RemoveRowMutation,
            InsertRowMutation,
            InsertColMutation,
            InsertRowByRangeCommand,
            InsertColByRangeCommand,
            SetSelectionsOperation,
            SetRangeValuesMutation,
        ].forEach((c) => commandService.registerCommand(c));
        get(MergeCellController);
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    it('deletes only the focused pane\'s filtered-visible rows and restores them on undo', async () => {
        const workbook = get(IUniverInstanceService).getUnit<Workbook>('test')!;
        const worksheet = workbook.getActiveSheet()!;
        const target = { unitId: workbook.getUnitId(), subUnitId: worksheet.getSheetId() };
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            ...target,
            cellValue: { 0: { 0: { v: 'A' } }, 1: { 0: { v: 'B' } }, 2: { 0: { v: 'C' } }, 3: { 0: { v: 'D' } } },
        });
        univer.registerPlugin(UniverRenderEnginePlugin);
        const renders = get(IRenderManagerService);
        renders.createRender(target.unitId);
        const pane = renders.createRender(target.unitId, { embeddedRender: true }, 'right-pane');
        const skeleton = get(SheetSkeletonService).createRenderSkeleton(worksheet, workbook.getStyles(), pane.scene);
        skeleton.setProjection({ isRowFiltered: (row) => row === 1, getCell: () => undefined });
        pane.mainComponent = univer.__getInjector().createInstance(Spreadsheet, 'right-sheet', skeleton);
        renders.focusRender?.('right-pane');
        const rowCount = worksheet.getRowCount();
        let referencedRange = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
        const watch = get(RefRangeService).registerRefRange(referencedRange, (command) => {
            referencedRange = handleDefaultRangeChangeWithEffectRefCommands(referencedRange, command)!;
            return { redos: [], undos: [] };
        }, target.unitId, target.subUnitId);
        try {
            expect(await commandService.executeCommand(RemoveRowCommand.id, {
                ...target,
                range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 19, rangeType: RANGE_TYPE.ROW },
            })).toBe(true);
            expect([0, 1].map((row) => worksheet.getCellRaw(row, 0)?.v)).toEqual(['B', 'D']);
            expect(worksheet.getRowCount()).toBe(rowCount - 2);
            expect(referencedRange).toEqual({ startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 });
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect([0, 1, 2, 3].map((row) => worksheet.getCellRaw(row, 0)?.v)).toEqual(['A', 'B', 'C', 'D']);
            expect(worksheet.getRowCount()).toBe(rowCount);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect([0, 1].map((row) => worksheet.getCellRaw(row, 0)?.v)).toEqual(['B', 'D']);
        } finally {
            watch.dispose();
            skeleton.dispose();
        }
    });

    it('does not delete rows while the focused view projection is pending', async () => {
        const workbook = get(IUniverInstanceService).getUnit<Workbook>('test')!;
        const worksheet = workbook.getActiveSheet()!;
        univer.registerPlugin(UniverRenderEnginePlugin);
        const pane = get(IRenderManagerService).createRender(workbook.getUnitId());
        get(SheetSkeletonService).setDisplayProjectionPending(pane.scene, worksheet.getSheetId(), true);
        const rowCount = worksheet.getRowCount();
        expect(await commandService.executeCommand(RemoveRowCommand.id, {
            range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 19, rangeType: RANGE_TYPE.ROW },
        })).toBe(false);
        expect(worksheet.getRowCount()).toBe(rowCount);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe('A1');
    });

    it('aborts deletion if focus changes while an asynchronous permission check is pending', async () => {
        const workbook = get(IUniverInstanceService).getUnit<Workbook>('test')!;
        const worksheet = workbook.getActiveSheet()!;
        univer.registerPlugin(UniverRenderEnginePlugin);
        const renders = get(IRenderManagerService);
        renders.createRender('test');
        const pane = renders.createRender('test', { embeddedRender: true }, 'right-pane');
        const skeleton = get(SheetSkeletonService).createRenderSkeleton(worksheet, workbook.getStyles(), pane.scene);
        skeleton.setProjection({ isRowFiltered: (row) => row === 1, getCell: () => undefined });
        pane.mainComponent = univer.__getInjector().createInstance(Spreadsheet, 'right-sheet', skeleton);
        renders.focusRender?.('right-pane');
        const check = get(SheetInterceptorService).interceptBeforeCommand({
            performCheck: async () => {
                renders.focusRender?.('test');
                return true;
            },
        });
        try {
            const count = worksheet.getRowCount();
            expect(await commandService.executeCommand(RemoveRowCommand.id, {
                range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 19 },
            })).toBe(false);
            expect(worksheet.getRowCount()).toBe(count);
            expect(worksheet.getCellRaw(1, 0)?.v).toBe('B1');
        } finally {
            check.dispose();
            skeleton.dispose();
        }
    });

    function selectRow(rowStart: number, rowEnd: number): void {
        const selectionManagerService = get(SheetsSelectionsService);
        const endColumn = getColCount() - 1;
        selectionManagerService.addSelections([
            {
                range: { startRow: rowStart, startColumn: 0, endColumn, endRow: rowEnd, rangeType: RANGE_TYPE.ROW },
                primary: {
                    startRow: rowStart,
                    endRow: rowEnd,
                    startColumn: 0,
                    endColumn,
                    actualColumn: 0,
                    actualRow: rowStart,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function getColCount(): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getColumnCount();
    }

    function getCellInfo(row: number, col: number): Nullable<ICellData> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getCellMatrix().getValue(row, col);
    }

    describe('Remove rows', () => {
        it('Should move to up works, undo will recover the deleted data', async () => {
            selectRow(0, 0);

            const result = await commandService.executeCommand<IRemoveRowColCommandParams>(RemoveRowCommand.id, {
                range: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 19,
                    rangeType: RANGE_TYPE.ROW,
                },
            });
            expect(result).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('B1');

            // undo
            await commandService.executeCommand(UndoCommand.id);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            // redo
            await commandService.executeCommand(RedoCommand.id);
            expect(getCellInfo(0, 0)?.v).toEqual('B1');
        });
    });
    describe('Remove cols', () => {
        it('Should move to left works, undo will recover the deleted data', async () => {
            selectRow(0, 0);

            const result = await commandService.executeCommand<IRemoveRowColCommandParams>(RemoveColCommand.id, {
                range: {
                    startRow: 0,
                    endRow: 19,
                    startColumn: 0,
                    endColumn: 0,
                    rangeType: RANGE_TYPE.COLUMN,
                },
            });
            expect(result).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A2');

            // undo
            await commandService.executeCommand(UndoCommand.id);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            // redo
            await commandService.executeCommand(RedoCommand.id);
            expect(getCellInfo(0, 0)?.v).toEqual('A2');
        });
    });
});

const TEST_ROWS_COLS_MOVE_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                        s: 's1',
                    },
                    1: {
                        v: 'A2',
                        s: 's1',
                    },
                },
                1: {
                    0: {
                        v: 'B1',
                        s: 's1',
                    },
                    1: {
                        v: 'B2',
                        s: 's2',
                    },
                    4: {
                        v: 'E2',
                        s: 's3',
                    },
                },
                2: {
                    1: {
                        v: 'B3',
                        s: 's4',
                    },
                },
            },
            rowData: { 1: { h: 30 } },
            columnData: { 1: { w: 30 } },
            rowCount: 20,
            columnCount: 20,
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

function createMoveRowsColsTestBed() {
    return createCommandTestBed(Tools.deepClone(TEST_ROWS_COLS_MOVE_DEMO), [[MergeCellController], [RefRangeService]]);
}
