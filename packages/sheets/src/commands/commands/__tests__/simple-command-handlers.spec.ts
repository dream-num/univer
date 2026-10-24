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

import type {
    ICellData,
    ICommandInfo,
    IMutationInfo,
    IObjectMatrixPrimitiveType,
    IRange,
    IWorkbookData,
    IWorksheetData,
    Workbook,
} from '@univerjs/core';
import {
    CanceledError,
    CellValueType,
    CommandType,
    DateSystem,
    ICommandService,
    ILogService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    PresetListType,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IDefinedNamesService, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { SplitDelimiterEnum } from '../../../basics/split-range-text';
import enUS from '../../../locale/en-US';
import { UniverSheetsPlugin } from '../../../plugin';
import { IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { AUTO_FILL_APPLY_TYPE } from '../../../services/auto-fill/type';
import { INumfmtService } from '../../../services/numfmt/type';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SheetInterceptorService } from '../../../services/sheet-interceptor/sheet-interceptor.service';
import { ReorderRangeMutation } from '../../mutations/reorder-range.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetWorksheetRowHeightMutation } from '../../mutations/set-worksheet-row-height.mutation';
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
import { getPrimaryForRange } from '../utils/selection-utils';

function createBed(cellData: IObjectMatrixPrimitiveType<ICellData> = {}, sheetData: Partial<IWorksheetData> = {}) {
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { enUS } });
    univer.registerPlugin(UniverSheetsPlugin);
    const injector = univer.__getInjector();
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'unit-1',
        appVersion: '3.0.0-alpha',
        name: 'Command consumers',
        locale: LocaleType.EN_US,
        dateSystem: DateSystem.Date1904,
        sheetOrder: ['sheet-1'],
        styles: { 'text-style': { n: { pattern: '@' } } },
        sheets: { 'sheet-1': { id: 'sheet-1', name: 'Sheet1', rowCount: 10, columnCount: 10, cellData, ...sheetData } },
    });
    onTestFinished(() => univer.dispose());
    injector.get(IUniverInstanceService).focusUnit('unit-1');
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);
    const commands = injector.get(ICommandService);
    const history = injector.get(IUndoRedoService);
    const worksheet = workbook.getSheetBySheetId('sheet-1')!;
    const selections = injector.get(SheetsSelectionsService);
    function select(range: IRange) {
        selections.setSelections([{ range, primary: getPrimaryForRange(range, worksheet), style: null }]);
    }
    return { univer, injector, workbook, worksheet, commands, history, selections, select };
}

function cancelMutation(commands: ICommandService, id: string) {
    const subscription = commands.beforeCommandExecuted((command) => {
        if (command.id === id) {
            throw new CanceledError();
        }
    });
    onTestFinished(() => subscription.dispose());
    return subscription;
}

function valueMutation(row: number, column: number, value: string | null): IMutationInfo {
    return {
        id: SetRangeValuesMutation.id,
        params: { unitId: 'unit-1', subUnitId: 'sheet-1', cellValue: { [row]: { [column]: { v: value } } } },
    };
}

function recordMutations(commands: ICommandService) {
    const events: ICommandInfo[] = [];
    const subscription = commands.onCommandExecuted((command) => {
        if (command.type === CommandType.MUTATION) {
            events.push(Tools.deepClone(command));
        }
    });
    onTestFinished(() => subscription.dispose());
    return events;
}

const nameParams = { unitId: 'unit-1', id: 'name-1', name: 'RevenueTotal', formulaOrRefString: '=SUM(Sheet1!A:A)' };

describe('InsertDefinedNameCommand', () => {
    it('creates a defined name and removes and recreates it through real undo/redo', async () => {
        const { commands, history, injector } = createBed();
        const names = injector.get(IDefinedNamesService);
        expect(commands.syncExecuteCommand(InsertDefinedNameCommand.id, nameParams)).toBe(true);
        expect(names.getValueById('unit-1', 'name-1')).toMatchObject(nameParamsWithoutUnit());
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(1);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(names.getValueById('unit-1', 'name-1')).toBeUndefined();
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(names.getValueById('unit-1', 'name-1')).toMatchObject(nameParamsWithoutUnit());
    });

    it('does not create a name or undo record when params are omitted or its real mutation is cancelled', () => {
        const { commands, history, injector } = createBed();
        expect(injector.invoke(InsertDefinedNameCommand.handler)).toBe(false);
        cancelMutation(commands, SetDefinedNameMutation.id);
        expect(commands.syncExecuteCommand(InsertDefinedNameCommand.id, nameParams)).toBe(false);
        expect(injector.get(IDefinedNamesService).getValueById('unit-1', 'name-1')).toBeUndefined();
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(0);
    });
});

function nameParamsWithoutUnit() {
    return { id: nameParams.id, name: nameParams.name, formulaOrRefString: nameParams.formulaOrRefString };
}

describe('AppendRowCommand', () => {
    it('inserts missing rows and columns, appends values, and restores dimensions through undo/redo', async () => {
        const { commands, worksheet } = createBed({ 0: { 0: { v: 'old' } } }, { rowCount: 5, columnCount: 3 });
        expect(commands.syncExecuteCommand(AppendRowCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: { 5: { 0: { v: 'new' }, 3: { v: 'overflow column' } } },
            insertRowNums: 1,
            insertColumnNums: 2,
            maxRows: 5,
            maxColumns: 3,
        })).toBe(true);
        expect([worksheet.getRowCount(), worksheet.getColumnCount()]).toEqual([6, 5]);
        expect(worksheet.getCellRaw(5, 3)?.v).toBe('overflow column');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect([worksheet.getRowCount(), worksheet.getColumnCount()]).toEqual([5, 3]);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe('old');
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(5, 0)?.v).toBe('new');
    });

    it('returns false without model changes or undo when its value mutation is cancelled', () => {
        const { commands, workbook, history } = createBed();
        const before = Tools.deepClone(workbook.getSnapshot());
        cancelMutation(commands, SetRangeValuesMutation.id);
        expect(commands.syncExecuteCommand(AppendRowCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: { 0: { 0: { v: 'new' } } },
        })).toBe(false);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(0);
    });
});

describe('SetRangeValuesCommand', () => {
    it('writes the real selected rectangle and includes command and auto-height interceptors in undo/redo', async () => {
        const { commands, worksheet, injector, select, selections } = createBed({
            1: { 1: { v: 'old-1' }, 2: { v: 'old-2' } },
            2: { 1: { v: 'old-3' }, 2: { v: 'old-4' } },
        });
        const range = { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 };
        select(range);
        const interceptors = injector.get(SheetInterceptorService);
        const commandHook = interceptors.interceptCommand({ getMutations: (info) => info.id === SetRangeValuesCommand.id
            ? { redos: [valueMutation(7, 7, 'intercepted')], undos: [valueMutation(7, 7, null)] }
            : { redos: [], undos: [] } });
        const originalHeight = worksheet.getRowHeight(1);
        const heightHook = interceptors.interceptAutoHeight({ getMutations: () => ({
            redos: [{ id: SetWorksheetRowHeightMutation.id, params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                ranges: [range],
                rowHeight: 42,
            } }],
            undos: [{ id: SetWorksheetRowHeightMutation.id, params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                ranges: [range],
                rowHeight: originalHeight,
            } }],
        }) });
        onTestFinished(() => {
            commandHook.dispose();
            heightHook.dispose();
        });
        expect(commands.syncExecuteCommand(SetRangeValuesCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            value: [[{ v: 'A' }, { v: 'B' }], [{ v: 'C' }, { v: 'D' }]],
            redoUndoId: 'set-range-values-test',
        })).toBe(true);
        expect(worksheet.getCellRaw(1, 1)?.v).toBe('A');
        expect(worksheet.getCellRaw(2, 2)?.v).toBe('D');
        expect(worksheet.getCellRaw(7, 7)?.v).toBe('intercepted');
        expect(worksheet.getRowHeight(1)).toBe(42);
        expect(selections.getCurrentLastSelection()?.range).toMatchObject(range);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(1, 1)?.v).toBe('old-1');
        expect(worksheet.getCellRaw(7, 7)?.v).toBeUndefined();
        expect(worksheet.getRowHeight(1)).toBe(originalHeight);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(2, 2)?.v).toBe('D');
        expect(worksheet.getCellRaw(7, 7)?.v).toBe('intercepted');
    });

    it('returns false without a selection or when a real follow-up mutation is cancelled', () => {
        const { commands, history, injector, select, worksheet } = createBed();
        expect(commands.syncExecuteCommand(SetRangeValuesCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            value: { v: 'A' },
        })).toBe(false);
        select({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 });
        const hook = injector.get(SheetInterceptorService).interceptCommand({ getMutations: (info) =>
            info.id === SetRangeValuesCommand.id
                ? { redos: [valueMutation(7, 7, 'follow-up')], undos: [valueMutation(7, 7, null)] }
                : { redos: [], undos: [] } });
        onTestFinished(() => hook.dispose());
        const cancel = commands.beforeCommandExecuted((event) => {
            if (event.id === SetRangeValuesMutation.id && worksheet.getCellRaw(0, 0)?.v === 'A') {
                throw new CanceledError();
            }
        });
        onTestFinished(() => cancel.dispose());
        expect(commands.syncExecuteCommand(SetRangeValuesCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            value: { v: 'A' },
        })).toBe(false);
        expect(worksheet.getCellRaw(7, 7)).toBeUndefined();
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(0);
    });
});

describe('RefillCommand', () => {
    it('reapplies real cached fill data with selected apply types and refuses an uncached refill', async () => {
        const { commands, worksheet, injector } = createBed({ 0: { 0: { v: 1 } }, 1: { 0: { v: 3 } } });
        expect(await commands.executeCommand(AutoFillCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            sourceRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            targetRange: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 0 },
            applyType: AUTO_FILL_APPLY_TYPE.SERIES,
        })).toBe(true);
        expect(worksheet.getCellRaw(2, 0)?.v).toBe(5);
        expect(await commands.executeCommand(RefillCommand.id, { type: AUTO_FILL_APPLY_TYPE.COPY })).toBe(true);
        expect(worksheet.getCellRaw(2, 0)?.v).toBe(1);
        expect(injector.get(IAutoFillService).applyType).toBe(AUTO_FILL_APPLY_TYPE.COPY);
        expect(await commands.executeCommand(RefillCommand.id, { type: AUTO_FILL_APPLY_TYPE.NO_FORMAT })).toBe(true);
        expect(worksheet.getCellRaw(3, 0)?.v).toBe(7);
        const empty = createBed();
        expect(await empty.commands.executeCommand(RefillCommand.id, { type: AUTO_FILL_APPLY_TYPE.COPY })).toBe(false);
        expect(empty.history.getUndoRedoStatus('unit-1').undos).toBe(0);
    });
});

describe('AutoFillCommand family', () => {
    it('fills explicit ranges with real autofill logic and restores values through undo', async () => {
        const { commands, worksheet, injector } = createBed({ 0: { 0: { v: 1 } }, 1: { 0: { v: 3 } } });
        const service = injector.get(IAutoFillService);
        const callThrough = vi.spyOn(service, 'triggerAutoFill');
        onTestFinished(() => callThrough.mockRestore());
        const sourceRange = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 };
        const targetRange = { startRow: 0, endRow: 4, startColumn: 0, endColumn: 0 };
        expect(await commands.executeCommand(AutoFillCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            sourceRange,
            targetRange,
            applyType: AUTO_FILL_APPLY_TYPE.SERIES,
        })).toBe(true);
        expect(callThrough).toHaveBeenCalledWith('unit-1', 'sheet-1', sourceRange, targetRange, AUTO_FILL_APPLY_TYPE.SERIES);
        expect(worksheet.getCellRaw(4, 0)?.v).toBe(9);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(4, 0)?.v).toBeUndefined();
        expect(await commands.executeCommand(AutoFillCommand.id, {
            unitId: 'missing',
            subUnitId: 'sheet-1',
            sourceRange,
            targetRange,
        })).toBe(false);
    });

    it('copy-fills down and right through real commands and hides the apply menu after success', async () => {
        const { commands, worksheet, injector, select } = createBed({ 2: { 0: { v: 'down' } }, 1: { 3: { v: 'right' } } });
        let menuVisible = true;
        const menu = injector.get(IAutoFillService).showMenu$.subscribe((value) => {
            menuVisible = value;
        });
        onTestFinished(() => menu.unsubscribe());
        select({ startRow: 3, endRow: 3, startColumn: 0, endColumn: 0 });
        expect(await commands.executeCommand(SheetCopyDownCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(3, 0)?.v).toBe('down');
        expect(menuVisible).toBe(false);
        select({ startRow: 1, endRow: 1, startColumn: 4, endColumn: 4 });
        expect(await commands.executeCommand(SheetCopyRightCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(1, 4)?.v).toBe('right');
        expect(menuVisible).toBe(false);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(1, 4)?.v).toBeUndefined();
    });

    it('does not copy-fill a top-left no-op or when actual autofill execution is cancelled', async () => {
        const { commands, select, worksheet, history, injector } = createBed({ 0: { 0: { v: 'source' } } });
        select({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 });
        expect(await commands.executeCommand(SheetCopyDownCommand.id)).toBe(false);
        expect(await commands.executeCommand(SheetCopyRightCommand.id)).toBe(false);
        select({ startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 });
        let menuVisible = true;
        const menu = injector.get(IAutoFillService).showMenu$.subscribe((value) => {
            menuVisible = value;
        });
        onTestFinished(() => menu.unsubscribe());
        injector.get(IAutoFillService).setShowMenu(true);
        cancelMutation(commands, AutoFillCommand.id);
        expect(await commands.executeCommand(SheetCopyDownCommand.id)).toBe(false);
        expect(menuVisible).toBe(true);
        expect(worksheet.getCellRaw(2, 0)).toBeUndefined();
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(0);
    });

    it('clears dragged content and includes real selection and after-interceptor changes in undo', async () => {
        const { commands, worksheet, injector, select, selections } = createBed({ 2: { 2: { v: 'old' } } });
        const oldRange = { startRow: 9, endRow: 9, startColumn: 9, endColumn: 9 };
        select(oldRange);
        const hook = injector.get(SheetInterceptorService).interceptAfterCommand({ getMutations: (info) =>
            info.id === SetRangeValuesMutation.id
                ? { redos: [valueMutation(7, 7, 'after clear')], undos: [valueMutation(7, 7, null)] }
                : { redos: [], undos: [] } });
        onTestFinished(() => hook.dispose());
        const range = { startRow: 2, endRow: 2, startColumn: 2, endColumn: 3 };
        expect(await commands.executeCommand(AutoClearContentCommand.id, { clearRange: range, selectionRange: range })).toBe(true);
        expect(worksheet.getCellRaw(2, 2)?.v).toBeUndefined();
        expect(worksheet.getCellRaw(7, 7)?.v).toBe('after clear');
        expect(selections.getCurrentLastSelection()?.range).toMatchObject(range);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(2, 2)?.v).toBe('old');
        expect(worksheet.getCellRaw(7, 7)?.v).toBeUndefined();
        expect(selections.getCurrentLastSelection()?.range).toMatchObject(oldRange);
    });
});

describe('TextToNumberCommand', () => {
    it('converts numeric text and updates real number formats, preserving original values on undo', async () => {
        const { commands, worksheet, injector } = createBed({ 0: {
            0: { v: '42', t: CellValueType.STRING },
            1: { v: '003', t: CellValueType.STRING, s: 'text-style' },
            2: { v: 'abc', t: CellValueType.STRING },
            3: { v: '20%', t: CellValueType.FORCE_STRING },
            4: { v: '01/02/1904', t: CellValueType.STRING },
        } });
        const formats = injector.get(INumfmtService);
        expect(commands.syncExecuteCommand(TextToNumberCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 4 }],
        })).toBe(true);
        expect([0, 1, 2, 3, 4].map((column) => worksheet.getCellRaw(0, column)?.v)).toEqual([42, 3, 'abc', 0.2, 1]);
        expect(formats.getValue('unit-1', 'sheet-1', 0, 3)?.pattern).toBe('0%');
        expect(formats.getValue('unit-1', 'sheet-1', 0, 1)?.pattern).toBeUndefined();
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(0, 1)?.v).toBe('003');
        expect(formats.getValue('unit-1', 'sheet-1', 0, 1)?.pattern).toBe('@');
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(0, 3)?.v).toBe(0.2);
    });

    it('returns false without a target or ranges and when its real value mutation is cancelled', () => {
        const { commands, worksheet, history } = createBed({ 0: { 0: { v: '42', t: CellValueType.STRING } } });
        const ranges = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }];
        expect(commands.syncExecuteCommand(TextToNumberCommand.id, { unitId: 'missing', subUnitId: 'sheet-1', ranges })).toBe(false);
        expect(commands.syncExecuteCommand(TextToNumberCommand.id, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(false);
        cancelMutation(commands, SetRangeValuesMutation.id);
        expect(commands.syncExecuteCommand(TextToNumberCommand.id, { unitId: 'unit-1', subUnitId: 'sheet-1', ranges })).toBe(false);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe('42');
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(0);
    });

    it('uses the current real selection when ranges are omitted', () => {
        const { commands, worksheet, select, history } = createBed({ 2: { 2: { v: '56', t: CellValueType.STRING } } });
        select({ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 });
        expect(commands.syncExecuteCommand(TextToNumberCommand.id, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(true);
        expect(worksheet.getCellRaw(2, 2)?.v).toBe(56);
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(1);
    });
});

function checklistCell(): ICellData {
    return { p: { id: 'doc-1', documentStyle: {}, body: {
        dataStream: 'Alpha\rBeta\r\n',
        paragraphs: [
            { startIndex: 5, paragraphId: 'para-1' },
            { startIndex: 10, paragraphId: 'para-2', bullet: {
                listId: 'check-1',
                listType: PresetListType.CHECK_LIST,
                nestingLevel: 0,
            } },
        ],
    } } };
}

describe('ToggleCellCheckboxCommand', () => {
    it('toggles the real rich-text checklist paragraph and preserves the prior cell through undo/redo', async () => {
        const { commands, worksheet } = createBed({ 4: { 3: checklistCell() } });
        const params = { unitId: 'unit-1', subUnitId: 'sheet-1', row: 4, col: 3, paragraphIndex: 10 };
        expect(commands.syncExecuteCommand(ToggleCellCheckboxCommand.id, params)).toBe(true);
        expect(worksheet.getCellRaw(4, 3)?.p?.body?.paragraphs?.[1].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(4, 3)?.p?.body?.paragraphs?.[1].bullet?.listType).toBe(PresetListType.CHECK_LIST);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(4, 3)?.p?.body?.paragraphs?.[1].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);
    });

    it('returns false for missing params, targets, rich text or checklist paragraph without history', () => {
        const { commands, history, worksheet } = createBed({ 0: { 0: { v: 'plain' } }, 4: { 3: checklistCell() } });
        const before = Tools.deepClone(worksheet.getSnapshot());
        expect(commands.syncExecuteCommand(ToggleCellCheckboxCommand.id)).toBe(false);
        expect(commands.syncExecuteCommand(ToggleCellCheckboxCommand.id, {
            unitId: 'missing',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            paragraphIndex: 0,
        })).toBe(false);
        expect(commands.syncExecuteCommand(ToggleCellCheckboxCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            paragraphIndex: 0,
        })).toBe(false);
        expect(commands.syncExecuteCommand(ToggleCellCheckboxCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 4,
            col: 3,
            paragraphIndex: 999,
        })).toBe(false);
        expect(worksheet.getSnapshot()).toEqual(before);
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(0);
    });
});

describe('SplitTextToColumnsCommand', () => {
    it('splits text into real adjacent columns, extends dimensions and undoes both effects', async () => {
        const { commands, worksheet } = createBed({
            0: { 1: { v: 'North,West,East', t: CellValueType.STRING } },
            1: { 1: { v: '1,2,3', t: CellValueType.STRING } },
        }, { columnCount: 3 });
        expect(commands.syncExecuteCommand(SplitTextToColumnsCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 1, startColumn: 1, endColumn: 1 },
            delimiter: SplitDelimiterEnum.Comma,
        })).toBe(true);
        expect([1, 2, 3].map((column) => worksheet.getCellRaw(0, column)?.v)).toEqual(['North', 'West', 'East']);
        expect([1, 2, 3].map((column) => worksheet.getCellRaw(1, column)?.v)).toEqual([1, 2, 3]);
        expect(worksheet.getColumnCount()).toBeGreaterThan(3);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getColumnCount()).toBe(3);
        expect(worksheet.getCellRaw(0, 1)?.v).toBe('North,West,East');
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(1, 3)?.v).toBe(3);
    });

    it('rejects multiple source columns, missing targets and cancelled real mutation sequences', () => {
        const { commands, worksheet, history } = createBed({ 0: { 0: { v: 'A,B', t: CellValueType.STRING } } });
        expect(() => commands.syncExecuteCommand(SplitTextToColumnsCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
        })).toThrowError('The range must be in the same column.');
        expect(commands.syncExecuteCommand(SplitTextToColumnsCommand.id, {
            unitId: 'missing',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        })).toBe(false);
        cancelMutation(commands, SetRangeValuesMutation.id);
        expect(commands.syncExecuteCommand(SplitTextToColumnsCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            delimiter: SplitDelimiterEnum.Comma,
        })).toBe(false);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe('A,B');
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(0);
    });
});

describe('ReorderRangeCommand', () => {
    it('reorders real cells with pre, command, post and auto-height mutations and symmetric undo/redo', async () => {
        const { commands, worksheet, injector } = createBed({ 0: { 0: { v: 'first' } }, 1: { 0: { v: 'second' } }, 2: { 0: { v: 'third' } } });
        const interceptors = injector.get(SheetInterceptorService);
        const during = interceptors.interceptCommand({ getMutations: (info) => info.id === ReorderRangeCommand.id
            ? { preRedos: [valueMutation(7, 0, 'before')], preUndos: [valueMutation(7, 0, null)], redos: [valueMutation(7, 1, 'during')], undos: [valueMutation(7, 1, null)] }
            : { redos: [], undos: [] } });
        const after = interceptors.interceptAfterCommand({ getMutations: (info) => info.id === ReorderRangeCommand.id
            ? { redos: [valueMutation(7, 2, 'after')], undos: [valueMutation(7, 2, null)] }
            : { redos: [], undos: [] } });
        const height = interceptors.interceptAutoHeight({ getMutations: () => ({
            redos: [valueMutation(7, 3, 'auto-height')],
            undos: [valueMutation(7, 3, null)],
        }) });
        onTestFinished(() => {
            during.dispose();
            after.dispose();
            height.dispose();
        });
        const events = recordMutations(commands);
        expect(commands.syncExecuteCommand(ReorderRangeCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
            order: { 0: 2, 1: 0, 2: 1 },
        })).toBe(true);
        expect([0, 1, 2].map((row) => worksheet.getCellRaw(row, 0)?.v)).toEqual(['third', 'first', 'second']);
        expect([0, 1, 2, 3].map((column) => worksheet.getCellRaw(7, column)?.v)).toEqual(['before', 'during', 'after', 'auto-height']);
        expect(events.map((event) => event.id)).toEqual([
            SetRangeValuesMutation.id,
            ReorderRangeMutation.id,
            SetRangeValuesMutation.id,
            SetRangeValuesMutation.id,
            SetRangeValuesMutation.id,
        ]);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect([0, 1, 2].map((row) => worksheet.getCellRaw(row, 0)?.v)).toEqual(['first', 'second', 'third']);
        expect([0, 1, 2, 3].map((column) => worksheet.getCellRaw(7, column)?.v)).toEqual([undefined, undefined, undefined, undefined]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe('third');
    });

    it('returns false without undo records when its actual reorder mutation is cancelled', () => {
        const { commands, worksheet, history } = createBed({ 0: { 0: { v: 'first' } }, 1: { 0: { v: 'second' } } });
        const before = Tools.deepClone(worksheet.getSnapshot());
        cancelMutation(commands, ReorderRangeMutation.id);
        expect(commands.syncExecuteCommand(ReorderRangeCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            order: { 0: 1, 1: 0 },
        })).toBe(false);
        expect(worksheet.getSnapshot()).toEqual(before);
        expect(history.getUndoRedoStatus('unit-1').undos).toBe(0);
    });
});
