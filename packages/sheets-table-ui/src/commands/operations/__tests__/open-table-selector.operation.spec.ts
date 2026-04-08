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

import { ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { AddSheetTableCommand } from '@univerjs/sheets-table';
import { IDialogService } from '@univerjs/ui';

import { describe, expect, it, vi } from 'vitest';
import { openRangeSelector, OpenTableSelectorOperation } from '../open-table-selector.operation';

const sheetsMocks = vi.hoisted(() => ({
    getSheetCommandTarget: vi.fn(),
    isSingleCellSelection: vi.fn(),
    expandToContinuousRange: vi.fn(),
    SheetsSelectionsService: Symbol('SheetsSelectionsService'),
}));

vi.mock('@univerjs/sheets', async () => {
    const actual = await vi.importActual('@univerjs/sheets');
    return {
        ...actual,
        getSheetCommandTarget: sheetsMocks.getSheetCommandTarget,
        isSingleCellSelection: sheetsMocks.isSingleCellSelection,
        expandToContinuousRange: sheetsMocks.expandToContinuousRange,
        SheetsSelectionsService: sheetsMocks.SheetsSelectionsService,
    };
});

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

describe('open-table-selector operation', () => {
    it('openRangeSelector should resolve selected range and close dialog', async () => {
        const close = vi.fn();
        const dialogService = {
            open: vi.fn((props: any) => {
                props.children.label.props.onConfirm({ unitId: 'u1', subUnitId: 's1', range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 } });
            }),
            close,
        };

        const accessor = createAccessor([
            [IDialogService, dialogService],
            [LocaleService, { t: () => 'Select range' }],
        ]);

        const result = await openRangeSelector(accessor, 'u1', 's1', { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 });

        expect(result).toEqual({ unitId: 'u1', subUnitId: 's1', range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 } });
        expect(close).toHaveBeenCalled();
    });

    it('openRangeSelector should resolve null on cancel and close callbacks', async () => {
        const close = vi.fn();
        const dialogService = {
            open: vi.fn((props: any) => {
                props.children.label.props.onCancel();
                props.onClose();
            }),
            close,
        };

        const accessor = createAccessor([
            [IDialogService, dialogService],
            [LocaleService, { t: () => 'Select range' }],
        ]);

        const result = await openRangeSelector(accessor, 'u1', 's1', { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, 't1');

        expect(result).toBeNull();
        expect(close).toHaveBeenCalledTimes(2);
    });

    it('OpenTableSelectorOperation should return false without sheet target', async () => {
        sheetsMocks.getSheetCommandTarget.mockReturnValue(null);

        const accessor = createAccessor([
            [IUniverInstanceService, {}],
            [ICommandService, { executeCommand: vi.fn() }],
            [SheetsSelectionsService, { getCurrentLastSelection: vi.fn() }],
            [IDialogService, { open: vi.fn(), close: vi.fn() }],
            [LocaleService, { t: () => 'Select range' }],
        ]);

        await expect(OpenTableSelectorOperation.handler(accessor)).resolves.toBe(false);
    });

    it('OpenTableSelectorOperation should expand single-cell selection and execute add-table command', async () => {
        sheetsMocks.getSheetCommandTarget.mockReturnValue({
            unitId: 'u1',
            subUnitId: 's1',
            worksheet: { id: 'sheet' },
        });
        sheetsMocks.isSingleCellSelection.mockReturnValue(true);
        sheetsMocks.expandToContinuousRange.mockReturnValue({ startRow: 1, endRow: 4, startColumn: 1, endColumn: 3 });

        const executeCommand = vi.fn();
        const dialogService = {
            open: vi.fn((props: any) => {
                props.children.label.props.onConfirm({
                    unitId: 'u1',
                    subUnitId: 's1',
                    range: { startRow: 1, endRow: 4, startColumn: 1, endColumn: 3 },
                });
            }),
            close: vi.fn(),
        };

        const accessor = createAccessor([
            [IUniverInstanceService, {}],
            [ICommandService, { executeCommand }],
            [SheetsSelectionsService, {
                getCurrentLastSelection: () => ({
                    range: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 },
                }),
            }],
            [IDialogService, dialogService],
            [LocaleService, { t: () => 'Select range' }],
        ]);

        await expect(OpenTableSelectorOperation.handler(accessor)).resolves.toBe(true);

        expect(sheetsMocks.expandToContinuousRange).toHaveBeenCalledWith(
            { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 },
            { up: true, left: true, right: true, down: true },
            { id: 'sheet' }
        );

        expect(executeCommand).toHaveBeenCalledWith(AddSheetTableCommand.id, {
            unitId: 'u1',
            subUnitId: 's1',
            range: { startRow: 1, endRow: 4, startColumn: 1, endColumn: 3 },
        });
    });

    it('OpenTableSelectorOperation should keep multi-cell selections unchanged and stop when dialog is cancelled', async () => {
        sheetsMocks.expandToContinuousRange.mockClear();
        sheetsMocks.getSheetCommandTarget.mockReturnValue({
            unitId: 'u1',
            subUnitId: 's1',
            worksheet: { id: 'sheet' },
        });
        sheetsMocks.isSingleCellSelection.mockReturnValue(false);

        const executeCommand = vi.fn();
        const dialogService = {
            open: vi.fn((props: any) => {
                props.children.label.props.onCancel();
            }),
            close: vi.fn(),
        };

        const accessor = createAccessor([
            [IUniverInstanceService, {}],
            [ICommandService, { executeCommand }],
            [SheetsSelectionsService, {
                getCurrentLastSelection: () => ({
                    range: { startRow: 2, endRow: 4, startColumn: 2, endColumn: 5 },
                }),
            }],
            [IDialogService, dialogService],
            [LocaleService, { t: () => 'Select range' }],
        ]);

        await expect(OpenTableSelectorOperation.handler(accessor)).resolves.toBe(false);
        expect(sheetsMocks.expandToContinuousRange).not.toHaveBeenCalled();
        expect(executeCommand).not.toHaveBeenCalled();
    });
});
