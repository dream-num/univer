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

import type { Injector, Univer, Workbook } from '@univerjs/core';
import { ICommandService, IConfirmService, IPermissionService, IUndoRedoService, IUniverInstanceService, LocaleService, RANGE_TYPE, RedoCommand, TestConfirmService, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { UnitObject } from '@univerjs/protocol';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeMutation,
    AddWorksheetMergeVerticalCommand,
    EditStateEnum,
    InsertColByRangeCommand,
    InsertColMutation,
    InsertRowByRangeCommand,
    InsertRowMutation,
    RangeProtectionPermissionEditPoint,
    RangeProtectionRuleModel,
    RemoveColByRangeCommand,
    RemoveColCommand,
    RemoveColMutation,
    RemoveRowByRangeCommand,
    RemoveRowCommand,
    RemoveRowMutation,
    RemoveWorksheetMergeCommand,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetPermissionCheckController,
    SheetsSelectionsService,
    ViewStateEnum,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RemoveColConfirmCommand, RemoveRowConfirmCommand } from '../remove-row-col-confirm.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test remove row col confirm commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [IConfirmService, { useClass: TestConfirmService }],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            // registered lazily; instantiated only by the tests covering permission checks
            [SheetPermissionCheckController],
        ]);
        univer = testBed.univer;

        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeAllCommand);
        commandService.registerCommand(AddWorksheetMergeVerticalCommand);
        commandService.registerCommand(AddWorksheetMergeHorizontalCommand);
        commandService.registerCommand(RemoveWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(RemoveRowConfirmCommand);
        commandService.registerCommand(RemoveRowCommand);
        commandService.registerCommand(RemoveRowMutation);
        commandService.registerCommand(RemoveColConfirmCommand);
        commandService.registerCommand(RemoveColCommand);
        commandService.registerCommand(RemoveColMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(InsertRowMutation);
        commandService.registerCommand(InsertColMutation);

        [
            RemoveColByRangeCommand,
            RemoveRowByRangeCommand,
            InsertRowByRangeCommand,
            InsertColByRangeCommand,
        ].forEach((command) => {
            commandService.registerCommand(command);
        });

        get(LocaleService).load({});
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('Remove row', () => {
        it('Will apply when select some rows', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getRowCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowCount();
            }

            expect(getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeTruthy();
            expect(getRowCount()).toBe(999);
        });

        it('Will not apply when select all rows', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 0, startColumn: Number.NaN, endRow: 999, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getRowCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowCount();
            }

            expect(getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeFalsy();
            expect(getRowCount()).toBe(1000);
        });

        it('Will remove all row ranges when there are multiple selections and undo in one step', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 3, startColumn: Number.NaN, endRow: 3, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 5, startColumn: Number.NaN, endRow: 5, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getWorksheet() {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!
                    .getSheetBySheetId('sheet1')!;
            }

            expect(getWorksheet().getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeTruthy();
            expect(getWorksheet().getRowCount()).toBe(997);
            // the cell at B21 (row 20) moves up by the three removed rows above it
            expect(getWorksheet().getCellMatrix().getValue(17, 1)?.v).toBe(2);

            // a single undo restores all removed rows at their original positions
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getWorksheet().getRowCount()).toBe(1000);
            expect(getWorksheet().getCellMatrix().getValue(20, 1)?.v).toBe(2);
        });

        it('Will remove duplicate and overlapping row selections only once', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 2, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getRowCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowCount();
            }

            expect(getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeTruthy();
            expect(getRowCount()).toBe(998);
        });

        it('Will not remove any rows when one of the selected ranges is rejected', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 3, startColumn: Number.NaN, endRow: 3, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 5, startColumn: Number.NaN, endRow: 5, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            // reject removing row 1, which is the last range to be removed in bottom-up order,
            // so a partial removal would already have happened without the pre-check
            const sheetInterceptorService = get(SheetInterceptorService);
            const disposable = sheetInterceptorService.interceptBeforeCommand({
                performCheck: async (info) => {
                    if (info.id !== RemoveRowCommand.id) {
                        return true;
                    }
                    const range = (info.params as { range?: { startRow: number; endRow: number } })?.range;
                    return !(range && range.startRow <= 1 && range.endRow >= 1);
                },
            });

            function getRowCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowCount();
            }

            expect(getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeFalsy();
            expect(getRowCount()).toBe(1000);

            disposable.dispose();
        });

        it('Will roll back already removed rows when a later range is rejected during execution', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 3, startColumn: Number.NaN, endRow: 3, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 5, startColumn: Number.NaN, endRow: 5, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getWorksheet() {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!
                    .getSheetBySheetId('sheet1')!;
            }

            // the check on row 1 passes while nothing has been removed yet (pre-check) but fails
            // once other rows were removed, simulating a veto that only occurs mid-execution
            const sheetInterceptorService = get(SheetInterceptorService);
            const disposable = sheetInterceptorService.interceptBeforeCommand({
                performCheck: async (info) => {
                    if (info.id !== RemoveRowCommand.id) {
                        return true;
                    }
                    const range = (info.params as { range?: { startRow: number; endRow: number } })?.range;
                    if (!(range && range.startRow <= 1 && range.endRow >= 1)) {
                        return true;
                    }
                    return getWorksheet().getRowCount() === 1000;
                },
            });

            expect(getWorksheet().getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeFalsy();
            // rows 5 and 3 were removed before the rejection and must be restored by the rollback
            expect(getWorksheet().getRowCount()).toBe(1000);
            expect(getWorksheet().getCellMatrix().getValue(20, 1)?.v).toBe(2);
            // the rolled back removal must not stay on the undo stack
            expect(await commandService.executeCommand(UndoCommand.id)).toBeFalsy();
            expect(getWorksheet().getRowCount()).toBe(1000);

            disposable.dispose();
        });

        it('Will preserve redo history, status and selections when a later range fails', async () => {
            const selectionManager = get(SheetsSelectionsService);
            const undoRedoService = get(IUndoRedoService);

            function getWorksheet() {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!
                    .getSheetBySheetId('sheet1')!;
            }

            // build up a redo history: remove row 10, then undo it
            selectionManager.addSelections([
                {
                    range: { startRow: 10, startColumn: Number.NaN, endRow: 10, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeTruthy();
            expect(getWorksheet().getRowCount()).toBe(999);
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getWorksheet().getRowCount()).toBe(1000);

            // let the trailing edge of the single removal's selection throttle pass
            await new Promise((resolve) => {
                setTimeout(resolve, 350);
            });

            selectionManager.setSelections([
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 3, startColumn: Number.NaN, endRow: 3, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 5, startColumn: Number.NaN, endRow: 5, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            // reject removing row 1 only once other rows were removed (i.e. after the pre-check)
            const sheetInterceptorService = get(SheetInterceptorService);
            const disposable = sheetInterceptorService.interceptBeforeCommand({
                performCheck: async (info) => {
                    if (info.id !== RemoveRowCommand.id) {
                        return true;
                    }
                    const range = (info.params as { range?: { startRow: number; endRow: number } })?.range;
                    if (!(range && range.startRow <= 1 && range.endRow >= 1)) {
                        return true;
                    }
                    return getWorksheet().getRowCount() === 1000;
                },
            });

            const statuses: Array<{ undos: number; redos: number }> = [];
            const subscription = undoRedoService.undoRedoStatus$.subscribe((status) => {
                statuses.push(status);
            });

            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeFalsy();
            expect(getWorksheet().getRowCount()).toBe(1000);

            // the previous redo history survives the failed removal
            expect(statuses.at(-1)).toEqual({ undos: 0, redos: 1 });

            // the original multi-selection is restored...
            const rowsOf = () => selectionManager.getCurrentSelections()?.map((s) => [s.range.startRow, s.range.endRow]);
            expect(rowsOf()).toEqual([[1, 1], [3, 3], [5, 5]]);
            // ...and stays restored after the selection throttle window has passed
            await new Promise((resolve) => {
                setTimeout(resolve, 350);
            });
            expect(rowsOf()).toEqual([[1, 1], [3, 3], [5, 5]]);

            // redo is still executable and removes row 10 again
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getWorksheet().getRowCount()).toBe(999);

            subscription.unsubscribe();
            disposable.dispose();
        });

        it('Will roll back already removed rows when range protection denies a protected row', async () => {
            // activate the real permission check controller
            get(SheetPermissionCheckController);

            const ruleModel = get(RangeProtectionRuleModel);
            ruleModel.addRule('test', 'sheet1', {
                id: 'rule-1',
                permissionId: 'permission-1',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 19 }],
                unitId: 'test',
                subUnitId: 'sheet1',
                unitType: UnitObject.SelectRange,
                viewState: ViewStateEnum.OthersCanView,
                editState: EditStateEnum.OnlyMe,
            });
            const permissionService = get(IPermissionService);
            const editPoint = new RangeProtectionPermissionEditPoint('test', 'sheet1', 'permission-1');
            permissionService.addPermissionPoint(editPoint);
            permissionService.updatePermissionPoint(editPoint.id, false);

            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 3, startColumn: Number.NaN, endRow: 3, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 5, startColumn: Number.NaN, endRow: 5, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getWorksheet() {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!
                    .getSheetBySheetId('sheet1')!;
            }

            expect(getWorksheet().getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeFalsy();
            // rows 5 and 3 were removed before the protected row 1 was rejected,
            // and must be restored by the rollback
            expect(getWorksheet().getRowCount()).toBe(1000);
            expect(getWorksheet().getCellMatrix().getValue(20, 1)?.v).toBe(2);
        });

        it('Will not apply when multiple selections cover all rows', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 0, startColumn: Number.NaN, endRow: 499, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 500, startColumn: Number.NaN, endRow: 999, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getRowCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowCount();
            }

            expect(getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeFalsy();
            expect(getRowCount()).toBe(1000);
        });
    });

    describe('Remove col', () => {
        it('Will apply when select some cols', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 1, endRow: Number.NaN, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            function getColumnCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getColumnCount();
            }

            expect(getColumnCount()).toBe(20);
            expect(await commandService.executeCommand(RemoveColConfirmCommand.id)).toBeTruthy();
            expect(getColumnCount()).toBe(19);
        });

        it('Will not apply when select all cols', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 0, endRow: Number.NaN, endColumn: 19, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            function getColumnCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getColumnCount();
            }

            expect(getColumnCount()).toBe(20);
            expect(await commandService.executeCommand(RemoveColConfirmCommand.id)).toBeFalsy();
            expect(getColumnCount()).toBe(20);
        });

        it('Will remove all column ranges when there are multiple selections and undo in one step', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 2, endRow: Number.NaN, endColumn: 2, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: Number.NaN, startColumn: 4, endRow: Number.NaN, endColumn: 4, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: Number.NaN, startColumn: 6, endRow: Number.NaN, endColumn: 6, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            function getWorksheet() {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!
                    .getSheetBySheetId('sheet1')!;
            }

            expect(getWorksheet().getColumnCount()).toBe(20);
            expect(await commandService.executeCommand(RemoveColConfirmCommand.id)).toBeTruthy();
            expect(getWorksheet().getColumnCount()).toBe(17);

            // a single undo restores all removed columns
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getWorksheet().getColumnCount()).toBe(20);
        });

        it('Will remove duplicate and overlapping column selections only once', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 1, endRow: Number.NaN, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: Number.NaN, startColumn: 1, endRow: Number.NaN, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: Number.NaN, startColumn: 1, endRow: Number.NaN, endColumn: 2, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            function getColumnCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getColumnCount();
            }

            expect(getColumnCount()).toBe(20);
            expect(await commandService.executeCommand(RemoveColConfirmCommand.id)).toBeTruthy();
            expect(getColumnCount()).toBe(18);
        });

        it('Will not remove any columns when one of the selected ranges is rejected', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 1, endRow: Number.NaN, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: Number.NaN, startColumn: 3, endRow: Number.NaN, endColumn: 3, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: Number.NaN, startColumn: 5, endRow: Number.NaN, endColumn: 5, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            // reject removing column 1, which is the last range to be removed in right-to-left
            // order, so a partial removal would already have happened without the pre-check
            const sheetInterceptorService = get(SheetInterceptorService);
            const disposable = sheetInterceptorService.interceptBeforeCommand({
                performCheck: async (info) => {
                    if (info.id !== RemoveColCommand.id) {
                        return true;
                    }
                    const range = (info.params as { range?: { startColumn: number; endColumn: number } })?.range;
                    return !(range && range.startColumn <= 1 && range.endColumn >= 1);
                },
            });

            function getColumnCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getColumnCount();
            }

            expect(getColumnCount()).toBe(20);
            expect(await commandService.executeCommand(RemoveColConfirmCommand.id)).toBeFalsy();
            expect(getColumnCount()).toBe(20);

            disposable.dispose();
        });

        it('Will roll back already removed columns when range protection denies a protected column', async () => {
            // activate the real permission check controller
            get(SheetPermissionCheckController);

            const ruleModel = get(RangeProtectionRuleModel);
            ruleModel.addRule('test', 'sheet1', {
                id: 'rule-1',
                permissionId: 'permission-1',
                ranges: [{ startRow: 0, endRow: 999, startColumn: 1, endColumn: 1 }],
                unitId: 'test',
                subUnitId: 'sheet1',
                unitType: UnitObject.SelectRange,
                viewState: ViewStateEnum.OthersCanView,
                editState: EditStateEnum.OnlyMe,
            });
            const permissionService = get(IPermissionService);
            const editPoint = new RangeProtectionPermissionEditPoint('test', 'sheet1', 'permission-1');
            permissionService.addPermissionPoint(editPoint);
            permissionService.updatePermissionPoint(editPoint.id, false);

            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 1, endRow: Number.NaN, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: Number.NaN, startColumn: 3, endRow: Number.NaN, endColumn: 3, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: Number.NaN, startColumn: 5, endRow: Number.NaN, endColumn: 5, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            function getWorksheet() {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!
                    .getSheetBySheetId('sheet1')!;
            }

            expect(getWorksheet().getColumnCount()).toBe(20);
            expect(await commandService.executeCommand(RemoveColConfirmCommand.id)).toBeFalsy();
            // columns 5 and 3 were removed before the protected column 1 was rejected,
            // and must be restored by the rollback
            expect(getWorksheet().getColumnCount()).toBe(20);
            expect(getWorksheet().getCellMatrix().getValue(20, 1)?.v).toBe(2);
        });

        it('Will not apply when multiple selections cover all cols', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 0, endRow: Number.NaN, endColumn: 9, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: Number.NaN, startColumn: 10, endRow: Number.NaN, endColumn: 19, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            function getColumnCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                    ?.getSheetBySheetId('sheet1')
                    ?.getColumnCount();
            }

            expect(getColumnCount()).toBe(20);
            expect(await commandService.executeCommand(RemoveColConfirmCommand.id)).toBeFalsy();
            expect(getColumnCount()).toBe(20);
        });
    });
});
