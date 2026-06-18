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

import type { IAccessor } from '@univerjs/core';
import {
    CellValueType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    PresetListType,
} from '@univerjs/core';
import { RemoveDefinedNameMutation, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { SplitDelimiterEnum } from '../../../basics/split-range-text';
import { IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { AUTO_FILL_APPLY_TYPE } from '../../../services/auto-fill/type';
import { INumfmtService } from '../../../services/numfmt/type';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SheetInterceptorService } from '../../../services/sheet-interceptor/sheet-interceptor.service';
import { SheetSkeletonService } from '../../../skeleton/skeleton.service';
import { InsertColMutation, InsertRowMutation } from '../../mutations/insert-row-col.mutation';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '../../mutations/numfmt.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../mutations/remove-row-col.mutation';
import { ReorderRangeMutation } from '../../mutations/reorder-range.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { AppendRowCommand } from '../append-row.command';
import {
    AutoClearContentCommand,
    AutoFillCommand,
    SheetCopyDownCommand,
    SheetCopyRightCommand,
} from '../auto-fill.command';
import { InsertDefinedNameCommand } from '../insert-defined-name.command';
import { RefillCommand } from '../refill.command';
import { ReorderRangeCommand } from '../reorder-range.command';
import { SetRangeValuesCommand } from '../set-range-values.command';
import { SplitTextToColumnsCommand } from '../split-text-to-columns.command';
import { TextToNumberCommand } from '../text-to-number.command';
import { ToggleCellCheckboxCommand } from '../toggle-checkbox.command';

function createAccessor(records: Map<unknown, unknown>): IAccessor {
    return {
        get: (token: unknown) => records.get(token) as never,
        has: (token: unknown) => records.has(token),
    } as IAccessor;
}

function createStyles() {
    return {
        getStyleByCell: (cell?: { s?: unknown }) => typeof cell?.s === 'object' ? cell.s : null,
        get: (id: string) => id === 'text-style' ? { n: { pattern: '@' } } : null,
    };
}

function createWorkbook(worksheet: unknown) {
    return {
        getUnitId: () => 'unit-1',
        getSheetBySheetId: (subUnitId: string) => subUnitId === 'sheet-1' ? worksheet : null,
        getActiveSheet: () => worksheet,
        getStyles: createStyles,
    };
}

function createUniverInstanceService(worksheet: unknown) {
    const workbook = createWorkbook(worksheet);
    return {
        getUnit: (unitId: string) => unitId === 'unit-1' ? workbook : null,
        getUniverSheetInstance: (unitId: string) => unitId === 'unit-1' ? workbook : null,
        getCurrentUnitOfType: () => workbook,
    };
}

describe('InsertDefinedNameCommand', () => {
    it('creates a defined name and records the remove mutation as undo', () => {
        const calls: Array<{ id: string; params: unknown }> = [];
        const undoRecords: unknown[] = [];
        const commandService = {
            syncExecuteCommand: (id: string, params: unknown) => {
                calls.push({ id, params });
                return true;
            },
        };
        const undoRedoService = {
            pushUndoRedo: (record: unknown) => undoRecords.push(record),
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
        ]));
        const params = {
            unitId: 'unit-1',
            id: 'name-1',
            name: 'RevenueTotal',
            formulaOrRefString: '=SUM(Sheet1!A:A)',
        };

        expect(InsertDefinedNameCommand.handler(accessor, params)).toBe(true);
        expect(calls).toEqual([{ id: SetDefinedNameMutation.id, params }]);
        expect(undoRecords).toEqual([{
            unitID: 'unit-1',
            undoMutations: [{ id: RemoveDefinedNameMutation.id, params }],
            redoMutations: [{ id: SetDefinedNameMutation.id, params }],
        }]);
    });

    it('does not create undo records without params or when the mutation fails', () => {
        const undoRecords: unknown[] = [];
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: () => false }],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
        ]));

        expect(InsertDefinedNameCommand.handler(accessor, undefined)).toBe(false);
        expect(InsertDefinedNameCommand.handler(accessor, {
            unitId: 'unit-1',
            id: 'name-1',
            name: 'RevenueTotal',
            formulaOrRefString: '=SUM(Sheet1!A:A)',
        })).toBe(false);
        expect(undoRecords).toEqual([]);
    });
});

describe('AppendRowCommand', () => {
    it('inserts missing sheet rows and columns before appending cell values', () => {
        const executed: Array<{ id: string; params: unknown }> = [];
        const undoRecords: unknown[] = [];
        const cellMatrix = new ObjectMatrix({ 5: { 0: { v: 'old' } } });
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getCellMatrix: () => cellMatrix,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: (id: string, params: unknown) => {
                executed.push({ id, params });
                return true;
            } }],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
        ]));
        const cellValue = { 5: { 0: { v: 'new' }, 3: { v: 'overflow column' } } };

        expect(AppendRowCommand.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue,
            insertRowNums: 1,
            insertColumnNums: 2,
            maxRows: 5,
            maxColumns: 3,
        })).toBe(true);
        expect(executed.map((call) => call.id)).toEqual([InsertColMutation.id, InsertRowMutation.id, SetRangeValuesMutation.id]);
        expect(undoRecords[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [
                { id: SetRangeValuesMutation.id },
                { id: RemoveRowMutation.id },
                { id: RemoveColMutation.id },
            ],
            redoMutations: [
                { id: InsertColMutation.id },
                { id: InsertRowMutation.id },
                { id: SetRangeValuesMutation.id },
            ],
        });
    });

    it('returns false when append mutations do not complete', () => {
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: () => false }],
            [IUndoRedoService, { pushUndoRedo: () => undefined }],
            [IUniverInstanceService, createUniverInstanceService({ getSheetId: () => 'sheet-1', getCellMatrix: () => new ObjectMatrix() })],
        ]));

        expect(AppendRowCommand.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: { 0: { 0: { v: 'new' } } },
        })).toBe(false);
    });
});

describe('SetRangeValuesCommand', () => {
    it('sets a two-dimensional value array over the current selection and follows the target range', () => {
        const executed: Array<{ id: string; params: unknown }> = [];
        const undoRecords: unknown[] = [];
        const cellMatrix = new ObjectMatrix({
            1: { 1: { v: 'old-1' }, 2: { v: 'old-2' } },
            2: { 1: { v: 'old-3' }, 2: { v: 'old-4' } },
        });
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getCellMatrix: () => cellMatrix,
            getCellHeight: () => 24,
            getMergedCell: () => null,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: (id: string, params: unknown) => {
                executed.push({ id, params });
                return true;
            } }],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 } }] }],
            [SheetInterceptorService, {
                onCommandExecute: () => ({ redos: [{ id: 'interceptor-redo', params: {} }], undos: [{ id: 'interceptor-undo', params: {} }] }),
                generateMutationsOfAutoHeight: () => ({ redos: [{ id: 'auto-height-redo', params: {} }], undos: [{ id: 'auto-height-undo', params: {} }] }),
            }],
        ]));

        expect(SetRangeValuesCommand.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            value: [[{ v: 'A' }, { v: 'B' }], [{ v: 'C' }, { v: 'D' }]],
            redoUndoId: 'set-range-values-test',
        })).toBe(true);
        expect(executed.map((call) => call.id)).toEqual([SetRangeValuesMutation.id, 'interceptor-redo', 'auto-height-redo']);
        expect(executed[0].params).toMatchObject({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: { 1: { 1: { v: 'A' }, 2: { v: 'B' } }, 2: { 1: { v: 'C' }, 2: { v: 'D' } } },
        });
        expect(undoRecords[0]).toMatchObject({
            unitID: 'unit-1',
            id: 'set-range-values-test',
            undoMutations: [{ id: SetRangeValuesMutation.id }, { id: 'interceptor-undo' }, { id: 'auto-height-undo' }, { id: SetSelectionsOperation.id }],
            redoMutations: [{ id: SetRangeValuesMutation.id }, { id: 'interceptor-redo' }, { id: 'auto-height-redo' }, { id: SetSelectionsOperation.id }],
        });
    });

    it('returns false when no range can be resolved or post mutations fail', () => {
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getCellMatrix: () => new ObjectMatrix(),
            getCellHeight: () => undefined,
            getMergedCell: () => null,
        };
        const noRangeAccessor = createAccessor(new Map<unknown, unknown>([
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [SheetsSelectionsService, { getCurrentSelections: () => [] }],
        ]));
        expect(SetRangeValuesCommand.handler(noRangeAccessor, { unitId: 'unit-1', subUnitId: 'sheet-1', value: { v: 'A' } })).toBe(false);

        const failedAccessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: (id: string) => id !== 'interceptor-redo' }],
            [IUndoRedoService, { pushUndoRedo: () => undefined }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }] }],
            [SheetInterceptorService, {
                onCommandExecute: () => ({ redos: [{ id: 'interceptor-redo', params: {} }], undos: [] }),
                generateMutationsOfAutoHeight: () => ({ redos: [], undos: [] }),
            }],
        ]));
        expect(SetRangeValuesCommand.handler(failedAccessor, { unitId: 'unit-1', subUnitId: 'sheet-1', value: { v: 'A' } })).toBe(false);
    });
});

describe('RefillCommand', () => {
    it('delegates the selected auto-fill apply type to the auto-fill service', async () => {
        const filledTypes: AUTO_FILL_APPLY_TYPE[] = [];
        const autoFillService = {
            fillData: (type: AUTO_FILL_APPLY_TYPE) => {
                filledTypes.push(type);
                return type === AUTO_FILL_APPLY_TYPE.COPY;
            },
        };
        const accessor = createAccessor(new Map<unknown, unknown>([[IAutoFillService, autoFillService]]));

        await expect(RefillCommand.handler(accessor, { type: AUTO_FILL_APPLY_TYPE.COPY })).resolves.toBe(true);
        await expect(RefillCommand.handler(accessor, { type: AUTO_FILL_APPLY_TYPE.NO_FORMAT })).resolves.toBe(false);
        expect(filledTypes).toEqual([AUTO_FILL_APPLY_TYPE.COPY, AUTO_FILL_APPLY_TYPE.NO_FORMAT]);
    });
});

describe('AutoFillCommand family', () => {
    it('delegates explicit auto-fill ranges to the auto-fill service target', async () => {
        const calls: unknown[] = [];
        const worksheet = { getSheetId: () => 'sheet-1' };
        const autoFillService = {
            triggerAutoFill: (...args: unknown[]) => {
                calls.push(args);
                return Promise.resolve(true);
            },
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [IAutoFillService, autoFillService],
        ]));
        const sourceRange = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 };
        const targetRange = { startRow: 0, endRow: 4, startColumn: 0, endColumn: 1 };

        await expect(AutoFillCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', sourceRange, targetRange, applyType: AUTO_FILL_APPLY_TYPE.SERIES })).resolves.toBe(true);
        expect(calls).toEqual([['unit-1', 'sheet-1', sourceRange, targetRange, AUTO_FILL_APPLY_TYPE.SERIES]]);

        const noTargetAccessor = createAccessor(new Map<unknown, unknown>([
            [IUniverInstanceService, { getUnit: () => null }],
            [IAutoFillService, autoFillService],
        ]));
        await expect(AutoFillCommand.handler(noTargetAccessor, { unitId: 'missing', subUnitId: 'sheet-1', sourceRange, targetRange })).resolves.toBe(false);
    });

    it('copy-fills down and right from the current selection and hides the apply menu after success', async () => {
        const commandCalls: unknown[] = [];
        const shownStates: boolean[] = [];
        const worksheet = { getSheetId: () => 'sheet-1' };
        const commandService = {
            executeCommand: async (id: string, params: unknown) => {
                commandCalls.push({ id, params });
                return true;
            },
        };
        const autoFillService = {
            setShowMenu: (show: boolean) => shownStates.push(show),
        };
        const selections = [
            { range: { startRow: 3, endRow: 3, startColumn: 0, endColumn: 2 } },
            { range: { startRow: 1, endRow: 3, startColumn: 4, endColumn: 4 } },
        ];
        let selectionIndex = 0;
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [IAutoFillService, autoFillService],
            [SheetsSelectionsService, { getCurrentLastSelection: () => selections[selectionIndex++] }],
        ]));

        await expect(SheetCopyDownCommand.handler(accessor)).resolves.toBe(true);
        await expect(SheetCopyRightCommand.handler(accessor)).resolves.toBe(true);
        expect(commandCalls).toEqual([
            {
                id: AutoFillCommand.id,
                params: {
                    sourceRange: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 2 },
                    targetRange: { startRow: 2, endRow: 3, startColumn: 0, endColumn: 2 },
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    applyType: AUTO_FILL_APPLY_TYPE.COPY,
                },
            },
            {
                id: AutoFillCommand.id,
                params: {
                    sourceRange: { startRow: 1, endRow: 3, startColumn: 3, endColumn: 3 },
                    targetRange: { startRow: 1, endRow: 3, startColumn: 3, endColumn: 4 },
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    applyType: AUTO_FILL_APPLY_TYPE.COPY,
                },
            },
        ]);
        expect(shownStates).toEqual([false, false]);
    });

    it('does not copy-fill when the selection cannot produce a source range or the command fails', async () => {
        const worksheet = { getSheetId: () => 'sheet-1' };
        const accessorAtTopLeft = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { executeCommand: async () => true }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [IAutoFillService, { setShowMenu: () => undefined }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => ({ range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }) }],
        ]));
        await expect(SheetCopyDownCommand.handler(accessorAtTopLeft)).resolves.toBe(false);
        await expect(SheetCopyRightCommand.handler(accessorAtTopLeft)).resolves.toBe(false);

        const shownStates: boolean[] = [];
        const failedAccessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { executeCommand: async () => false }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [IAutoFillService, { setShowMenu: (show: boolean) => shownStates.push(show) }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => ({ range: { startRow: 2, endRow: 4, startColumn: 0, endColumn: 1 } }) }],
        ]));
        await expect(SheetCopyDownCommand.handler(failedAccessor)).resolves.toBe(false);
        expect(shownStates).toEqual([]);
    });

    it('clears dragged content, restores selection on undo, and runs after-interceptor mutations', async () => {
        const executed: unknown[] = [];
        const undoRecords: unknown[] = [];
        const oldSelection = { range: { startRow: 9, endRow: 9, startColumn: 9, endColumn: 9 } };
        const cellMatrix = new ObjectMatrix({ 2: { 2: { v: 'old' } } });
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getCellMatrix: () => cellMatrix,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: (id: string, params: unknown) => {
                executed.push({ id, params });
                return true;
            } }],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [SheetsSelectionsService, { getCurrentLastSelection: () => oldSelection }],
            [SheetInterceptorService, { afterCommandExecute: () => ({ redos: [{ id: 'after-redo', params: {} }], undos: [{ id: 'after-undo', params: {} }] }) }],
        ]));

        await expect(AutoClearContentCommand.handler(accessor, {
            clearRange: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 3 },
            selectionRange: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 3 },
        })).resolves.toBe(true);
        expect((executed[0] as { id: string }).id).toBe(SetRangeValuesMutation.id);
        expect((executed[1] as { id: string }).id).toBe(SetSelectionsOperation.id);
        expect((executed[2] as { id: string }).id).toBe('after-redo');
        expect(undoRecords[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [
                { id: SetRangeValuesMutation.id },
                { id: SetSelectionsOperation.id, params: { selections: [oldSelection], unitId: 'unit-1', subUnitId: 'sheet-1' } },
                { id: 'after-undo' },
            ],
        });
    });
});

describe('TextToNumberCommand', () => {
    it('converts numeric text cells and removes text number format where needed', () => {
        const executed: Array<{ id: string; params: unknown }> = [];
        const undoRecords: unknown[] = [];
        const cellMatrix = new ObjectMatrix({
            0: {
                0: { v: '42', t: CellValueType.STRING },
                1: { v: '003', t: CellValueType.NUMBER, s: 'text-style' },
                2: { v: 'abc', t: CellValueType.STRING },
            },
        });
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getCellRaw: (row: number, col: number) => cellMatrix.getValue(row, col),
            getCellMatrix: () => cellMatrix,
            getStyleDataByHash: (id: string) => id === 'text-style' ? { n: { pattern: '@' } } : null,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: (id: string, params: unknown) => {
                executed.push({ id, params });
                return true;
            } }],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [INumfmtService, { getValue: (_unitId: string, _subUnitId: string, row: number, col: number) => row === 0 && col === 1 ? { pattern: '@' } : null }],
        ]));

        expect(TextToNumberCommand.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 }],
        })).toBe(true);
        expect(executed.map((call) => call.id)).toEqual([SetRangeValuesMutation.id, RemoveNumfmtMutation.id]);
        expect(executed[0].params).toMatchObject({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: {
                0: {
                    0: { v: 42, t: CellValueType.NUMBER },
                    1: { v: 3, t: CellValueType.NUMBER },
                },
            },
        });
        expect(executed[1].params).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [{ startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }],
        });
        expect(undoRecords[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [{ id: SetRangeValuesMutation.id }, { id: SetNumfmtMutation.id }],
        });
    });

    it('returns false without a target, without ranges, or when mutation execution fails', () => {
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getCellRaw: () => ({ v: '42', t: CellValueType.STRING }),
            getCellMatrix: () => new ObjectMatrix(),
            getStyleDataByHash: () => null,
        };
        const noTargetAccessor = createAccessor(new Map<unknown, unknown>([
            [IUniverInstanceService, { getUnit: () => null }],
        ]));
        expect(TextToNumberCommand.handler(noTargetAccessor, { unitId: 'missing', subUnitId: 'sheet-1', ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] })).toBe(false);

        const noRangesAccessor = createAccessor(new Map<unknown, unknown>([
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [SheetsSelectionsService, { getCurrentSelections: () => [] }],
        ]));
        expect(TextToNumberCommand.handler(noRangesAccessor, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(false);

        const failedAccessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: () => false }],
            [IUndoRedoService, { pushUndoRedo: () => undefined }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
        ]));
        expect(TextToNumberCommand.handler(failedAccessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] })).toBe(false);
    });

    it('uses current selections when ranges are omitted', () => {
        const executed: Array<{ id: string; params: unknown }> = [];
        const undoRecords: unknown[] = [];
        const cellMatrix = new ObjectMatrix({ 2: { 2: { v: '56', t: CellValueType.STRING } } });
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getCellRaw: (row: number, col: number) => cellMatrix.getValue(row, col),
            getCellMatrix: () => cellMatrix,
            getStyleDataByHash: () => null,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: (id: string, params: unknown) => {
                executed.push({ id, params });
                return true;
            } }],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 } }] }],
        ]));

        expect(TextToNumberCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(true);
        expect(executed[0]).toMatchObject({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                cellValue: { 2: { 2: { v: 56, t: CellValueType.NUMBER } } },
            },
        });
        expect(undoRecords).toHaveLength(1);
    });
});

describe('ToggleCellCheckboxCommand', () => {
    function createChecklistCell() {
        return {
            p: {
                id: 'doc-1',
                body: {
                    dataStream: 'Alpha\rBeta\r\n',
                    paragraphs: [
                        { startIndex: 5, paragraphId: 'para-1' },
                        {
                            startIndex: 10,
                            paragraphId: 'para-2',
                            bullet: {
                                listId: 'check-1',
                                listType: PresetListType.CHECK_LIST,
                                nestingLevel: 0,
                            },
                        },
                    ],
                },
            },
        };
    }

    it('toggles a rich-text checklist paragraph and records undo from the old cell value', () => {
        const executed: Array<{ id: string; params: unknown }> = [];
        const undoRecords: unknown[] = [];
        const cell = createChecklistCell();
        const cellMatrix = new ObjectMatrix({ 4: { 3: cell } });
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getCell: (row: number, col: number) => cellMatrix.getValue(row, col),
            getCellMatrix: () => cellMatrix,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: (id: string, params: unknown) => {
                executed.push({ id, params });
                return true;
            } }],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
        ]));

        expect(ToggleCellCheckboxCommand.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 4,
            col: 3,
            paragraphIndex: 10,
        })).toBe(true);

        const redoCell = (executed[0].params as { cellValue: Record<number, Record<number, { t: CellValueType; p: { body: { paragraphs: Array<{ bullet?: { listType: string } }> } } }>> }).cellValue[4][3];
        expect(executed[0].id).toBe(SetRangeValuesMutation.id);
        expect(redoCell.t).toBe(CellValueType.STRING);
        expect(redoCell.p.body.paragraphs[1].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);
        expect(undoRecords[0]).toMatchObject({
            unitID: 'unit-1',
            redoMutations: [{ id: SetRangeValuesMutation.id }],
            undoMutations: [{ id: SetRangeValuesMutation.id }],
        });
    });

    it('returns false when checkbox toggle has no target rich text or paragraph', () => {
        const worksheetWithoutRichText = {
            getSheetId: () => 'sheet-1',
            getCell: () => ({ v: 'plain' }),
            getCellMatrix: () => new ObjectMatrix(),
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: () => true }],
            [IUndoRedoService, { pushUndoRedo: () => undefined }],
            [IUniverInstanceService, createUniverInstanceService(worksheetWithoutRichText)],
        ]));

        expect(ToggleCellCheckboxCommand.handler(accessor, undefined as never)).toBe(false);
        expect(ToggleCellCheckboxCommand.handler(accessor, { unitId: 'missing', subUnitId: 'sheet-1', row: 0, col: 0, paragraphIndex: 0 })).toBe(false);
        expect(ToggleCellCheckboxCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', row: 0, col: 0, paragraphIndex: 0 })).toBe(false);

        const cell = createChecklistCell();
        const cellMatrix = new ObjectMatrix({ 4: { 3: cell } });
        const invalidParagraphAccessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: () => true }],
            [IUndoRedoService, { pushUndoRedo: () => undefined }],
            [IUniverInstanceService, createUniverInstanceService({
                getSheetId: () => 'sheet-1',
                getCell: (row: number, col: number) => cellMatrix.getValue(row, col),
                getCellMatrix: () => cellMatrix,
            })],
        ]));
        expect(ToggleCellCheckboxCommand.handler(invalidParagraphAccessor, { unitId: 'unit-1', subUnitId: 'sheet-1', row: 4, col: 3, paragraphIndex: 999 })).toBe(false);
    });
});

describe('SplitTextToColumnsCommand', () => {
    it('splits single-column text into adjacent columns and inserts columns when output exceeds sheet width', () => {
        const executed: Array<{ id: string; params: unknown }> = [];
        const undoRecords: unknown[] = [];
        const cellMatrix = new ObjectMatrix({
            0: { 1: { v: 'North,West,East', t: CellValueType.STRING } },
            1: { 1: { v: '1,2,3', t: CellValueType.STRING } },
        });
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getColumnCount: () => 3,
            getRowCount: () => 10,
            getMaxColumns: () => 3,
            getMaxRows: () => 10,
            getCell: (row: number, col: number) => cellMatrix.getValue(row, col),
            getCellMatrix: () => cellMatrix,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: (id: string, params: unknown) => {
                executed.push({ id, params });
                return true;
            } }],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
        ]));

        expect(SplitTextToColumnsCommand.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 1, startColumn: 1, endColumn: 1 },
            delimiter: SplitDelimiterEnum.Comma,
        })).toBe(true);

        expect(executed.map((call) => call.id)).toEqual(['sheet.mutation.insert-col', SetRangeValuesMutation.id]);
        expect(executed[1].params).toMatchObject({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: {
                0: {
                    1: { v: 'North' },
                    2: { v: 'West' },
                    3: { v: 'East' },
                },
                1: {
                    1: { v: '1' },
                    2: { v: '2' },
                    3: { v: '3' },
                },
            },
        });
        expect(undoRecords[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [{ id: SetRangeValuesMutation.id }, { id: 'sheet.mutation.remove-col' }],
        });
    });

    it('returns false for multi-column source ranges, missing targets, or failed mutation sequence', () => {
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getColumnCount: () => 5,
            getRowCount: () => 10,
            getMaxColumns: () => 5,
            getMaxRows: () => 10,
            getCell: () => ({ v: 'A,B', t: CellValueType.STRING }),
            getCellMatrix: () => new ObjectMatrix(),
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: () => true }],
            [IUndoRedoService, { pushUndoRedo: () => undefined }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
        ]));
        expect(() => SplitTextToColumnsCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 } })).toThrowError('The range must be in the same column.');

        const noTargetAccessor = createAccessor(new Map<unknown, unknown>([[IUniverInstanceService, { getUnit: () => null }]]));
        expect(SplitTextToColumnsCommand.handler(noTargetAccessor, { unitId: 'missing', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } })).toBe(false);

        const failedAccessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: () => false }],
            [IUndoRedoService, { pushUndoRedo: () => undefined }],
            [IUniverInstanceService, createUniverInstanceService(worksheet)],
        ]));
        expect(SplitTextToColumnsCommand.handler(failedAccessor, { unitId: 'unit-1', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } })).toBe(false);
    });
});

describe('ReorderRangeCommand', () => {
    it('executes reorder with interceptor and auto-height mutations and records undo/redo', () => {
        const executed: Array<{ id: string; params: unknown }> = [];
        const undoRecords: unknown[] = [];
        const commandService = {
            syncExecuteCommand: (id: string, params: unknown) => {
                executed.push({ id, params });
                return true;
            },
        };
        const sheetInterceptorService = {
            onCommandExecute: () => ({
                preRedos: [{ id: 'pre-redo', params: { stage: 'before' } }],
                redos: [{ id: 'redo-after-reorder', params: { stage: 'during' } }],
                preUndos: [{ id: 'pre-undo', params: { stage: 'before' } }],
                undos: [{ id: 'undo-after-reorder', params: { stage: 'during' } }],
            }),
            afterCommandExecute: () => ({
                redos: [{ id: 'post-redo', params: { stage: 'after' } }],
                undos: [{ id: 'post-undo', params: { stage: 'after' } }],
            }),
            generateMutationsOfAutoHeight: () => ({
                redos: [{ id: 'auto-height-redo', params: { stage: 'height' } }],
                undos: [{ id: 'auto-height-undo', params: { stage: 'height' } }],
            }),
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
            [SheetInterceptorService, sheetInterceptorService],
            [SheetSkeletonService, { getSkeleton: () => null }],
        ]));
        const range = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 };

        expect(ReorderRangeCommand.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range,
            order: { 0: 2, 1: 0, 2: 1 },
        })).toBe(true);

        expect(executed).toEqual([
            { id: 'pre-redo', params: { stage: 'before' } },
            { id: ReorderRangeMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', range, order: { 0: 2, 1: 0, 2: 1 } } },
            { id: 'redo-after-reorder', params: { stage: 'during' } },
            { id: 'post-redo', params: { stage: 'after' } },
            { id: 'auto-height-redo', params: { stage: 'height' } },
        ]);
        expect(undoRecords[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [
                { id: 'pre-undo' },
                { id: ReorderRangeMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', range, order: { 0: 1, 1: 2, 2: 0 } } },
                { id: 'undo-after-reorder' },
                { id: 'post-undo' },
                { id: 'auto-height-undo' },
            ],
            redoMutations: [
                { id: 'pre-redo' },
                { id: ReorderRangeMutation.id },
                { id: 'redo-after-reorder' },
                { id: 'post-redo' },
                { id: 'auto-height-redo' },
            ],
        });
    });

    it('returns false and skips undo records when the reorder sequence fails', () => {
        const undoRecords: unknown[] = [];
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, { syncExecuteCommand: () => false }],
            [IUndoRedoService, { pushUndoRedo: (record: unknown) => undoRecords.push(record) }],
            [SheetInterceptorService, {
                onCommandExecute: () => ({ preRedos: [], redos: [], preUndos: [], undos: [] }),
                afterCommandExecute: () => ({ redos: [], undos: [] }),
                generateMutationsOfAutoHeight: () => ({ redos: [], undos: [] }),
            }],
            [SheetSkeletonService, { getSkeleton: () => null }],
        ]));

        expect(ReorderRangeCommand.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            order: { 0: 1, 1: 0 },
        })).toBe(false);
        expect(undoRecords).toEqual([]);
    });
});
