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

import type { IRange, IWorkbookData, Workbook } from '@univerjs/core';
import {
    CellValueType,
    ICommandService,
    IPermissionService,
    IResourceLoaderService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RANGE_TYPE,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DefinedNamesService,
    FormulaDataModel,
    FunctionService,
    IDefinedNamesService,
    IFunctionService,
    LexerTreeBuilder,
} from '@univerjs/engine-formula';
import { UnitObject } from '@univerjs/protocol';
import { describe, expect, it } from 'vitest';
import { SplitDelimiterEnum } from '../../../basics/split-range-text';
import { ReorderRangeCommand } from '../../../commands/commands/reorder-range.command';
import { SetRangeValuesCommand } from '../../../commands/commands/set-range-values.command';
import { SplitTextToColumnsCommand } from '../../../commands/commands/split-text-to-columns.command';
import { AddRangeProtectionMutation } from '../../../commands/mutations/add-range-protection.mutation';
import { ReorderRangeMutation } from '../../../commands/mutations/reorder-range.mutation';
import { SetWorksheetActiveOperation } from '../../../commands/operations/set-worksheet-active.operation';
import enUS from '../../../locale/en-US';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../models/range-protection-rule.model';
import { RangeProtectionCache } from '../../../models/range-protection.cache';
import { UniverSheetsPlugin } from '../../../plugin';
import { createTestBase } from '../../../services/__tests__/util';
import { AutoFillService, IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { RangeProtectionPermissionEditPoint } from '../../../services/permission/permission-point/range/edit';
import { RangeProtectionPermissionViewPoint } from '../../../services/permission/permission-point/range/view';
import { WorkbookEditablePermission } from '../../../services/permission/permission-point/workbook/editable';
import { WorkbookInsertColumnPermission } from '../../../services/permission/permission-point/workbook/insert-column';
import { WorksheetEditPermission } from '../../../services/permission/permission-point/worksheet/edit';
import { WorksheetInsertColumnPermission } from '../../../services/permission/permission-point/worksheet/insert-column';
import {
    WorksheetSetCellValuePermission,
} from '../../../services/permission/permission-point/worksheet/set-cell-value';
import { WorksheetSortPermission } from '../../../services/permission/permission-point/worksheet/sort';
import { RangeProtectionService } from '../../../services/permission/range-permission/range-protection.service';
import {
    WorksheetProtectionRuleModel,
} from '../../../services/permission/worksheet-permission/worksheet-permission-rule.model';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SheetInterceptorService } from '../../../services/sheet-interceptor/sheet-interceptor.service';
import { SheetSkeletonService } from '../../../skeleton/skeleton.service';
import { SheetPermissionCheckController } from '../sheet-permission-check.controller';

const WORKBOOK: IWorkbookData = {
    id: 'test',
    name: 'Permission regression',
    appVersion: '1.0.0',
    locale: LocaleType.EN_US,
    styles: {},
    sheetOrder: ['independent', 'source'],
    sheets: {
        source: {
            id: 'source',
            name: 'Source',
            rowCount: 10,
            columnCount: 10,
            cellData: { 0: { 0: { v: 'O01' }, 1: { v: 10 }, 3: { v: 'outside' } }, 1: { 0: { v: 'O02' }, 1: { v: 20 } } },
        },
        independent: {
            id: 'independent',
            name: 'Independent',
            rowCount: 10,
            columnCount: 10,
            cellData: { 0: { 0: { v: 'independent' } } },
        },
    },
};

function createRuntime() {
    const runtime = createTestBase(JSON.parse(JSON.stringify(WORKBOOK)), [
        [SheetsSelectionsService],
        [SheetInterceptorService],
        [SheetSkeletonService],
        [IAutoFillService, { useClass: AutoFillService }],
        [RangeProtectionRuleModel],
        [RangeProtectionCache],
        [RangeProtectionService],
        [WorksheetProtectionRuleModel],
        [LexerTreeBuilder],
        [FormulaDataModel],
        [IFunctionService, { useClass: FunctionService }],
        [IDefinedNamesService, { useClass: DefinedNamesService }],
        [SheetPermissionCheckController],
    ]);
    const locale = runtime.get(LocaleService);
    locale.load({ enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    return runtime;
}

describe('SheetPermissionCheckController reorder permission', () => {
    it.each(['range', 'worksheet-edit', 'worksheet-sort', 'workbook'] as const)(
        'rejects %s denial on the explicit owner before mutations and recovers with symmetric history',
        async (permissionKind) => {
            const runtime = createRuntime();
            try {
                const commands = runtime.get(ICommandService);
                [ReorderRangeCommand, ReorderRangeMutation, AddRangeProtectionMutation]
                    .forEach((command) => commands.registerCommand(command));
                runtime.get(RangeProtectionService);
                const locale = runtime.get(LocaleService);
                const controller = runtime.get(SheetPermissionCheckController);
                const errors: string[] = [];
                const subscription = controller.triggerPermissionUIEvent$.subscribe((error) => errors.push(error));
                try {
                    const protectedCell = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
                    expect(commands.syncExecuteCommand(AddRangeProtectionMutation.id, {
                        unitId: 'test',
                        subUnitId: 'source',
                        rules: [{
                            id: 'locked',
                            permissionId: 'locked-permission',
                            ranges: [protectedCell],
                            unitId: 'test',
                            subUnitId: 'source',
                            unitType: UnitObject.SelectRange,
                            editState: EditStateEnum.OnlyMe,
                            viewState: ViewStateEnum.OthersCanView,
                        }],
                    })).toBe(true);
                    const permissions = runtime.get(IPermissionService);
                    const point = createDeniedPoint(permissionKind);
                    if (!permissions.getPermissionPoint(point.id)) {
                        permissions.addPermissionPoint(point);
                    }
                    permissions.updatePermissionPoint(point.id, false);
                    const source = runtime.sheet.getSheetBySheetId('source')!;
                    const independent = runtime.sheet.getSheetBySheetId('independent')!;
                    const before = source.getCellMatrix().getMatrix();
                    const original = JSON.parse(JSON.stringify(before));
                    const saved = runtime.get(IResourceLoaderService).saveUnit<IWorkbookData>('test');
                    expect(saved).not.toBeNull();
                    const resources = saved!.resources;
                    expect(resources?.some((resource) => resource.name === 'SHEET_RANGE_PROTECTION_PLUGIN')).toBe(true);
                    const history = runtime.get(IUndoRedoService);
                    const previousHistory = history.getUndoRedoStatus('test');
                    const params = {
                        unitId: 'test',
                        subUnitId: 'source',
                        range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
                        order: { 0: 1, 1: 0 },
                    };
                    expect(runtime.sheet.getActiveSheet()?.getSheetId()).toBe('independent');
                    expect(commands.syncExecuteCommand(ReorderRangeCommand.id, params)).toBe(false);
                    expect(source.getCellMatrix().getMatrix()).toEqual(original);
                    const deniedSnapshot = runtime.get(IResourceLoaderService).saveUnit<IWorkbookData>('test');
                    expect(deniedSnapshot).not.toBeNull();
                    expect(deniedSnapshot!.resources).toEqual(resources);
                    expect(independent.getCellRaw(0, 0)?.v).toBe('independent');
                    expect(history.getUndoRedoStatus('test')).toEqual(previousHistory);
                    expect(errors).toEqual([locale.t('sheets.permission.dialog.editErr')]);
                    permissions.updatePermissionPoint(point.id, true);
                    expect(commands.syncExecuteCommand(ReorderRangeCommand.id, params)).toBe(true);
                    expect(source.getCellRaw(0, 0)?.v).toBe('O02');
                    expect(source.getCellRaw(1, 0)?.v).toBe('O01');
                    expect(source.getCellRaw(0, 3)?.v).toBe('outside');
                    expect(independent.getCellRaw(0, 0)?.v).toBe('independent');
                    expect(history.getUndoRedoStatus('test')).toEqual({ undos: previousHistory.undos + 1, redos: 0 });
                    expect(commands.syncExecuteCommand('univer.command.undo')).toBe(true);
                    expect(source.getCellMatrix().getMatrix()).toEqual(original);
                    expect(commands.syncExecuteCommand('univer.command.redo')).toBe(true);
                    expect(source.getCellRaw(0, 0)?.v).toBe('O02');
                    expect(errors).toHaveLength(1);
                } finally {
                    subscription.unsubscribe();
                }
            } finally {
                runtime.univer.dispose();
            }
        }
    );

    it('allows a reorder outside a denied range on the same worksheet', () => {
        const runtime = createRuntime();
        try {
            const commands = runtime.get(ICommandService);
            [ReorderRangeCommand, ReorderRangeMutation, AddRangeProtectionMutation]
                .forEach((command) => commands.registerCommand(command));
            runtime.get(RangeProtectionService);
            runtime.get(SheetPermissionCheckController);
            expect(commands.syncExecuteCommand(AddRangeProtectionMutation.id, {
                unitId: 'test',
                subUnitId: 'source',
                rules: [{
                    id: 'outside-rule',
                    permissionId: 'outside-permission',
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 3, endColumn: 3 }],
                    unitId: 'test',
                    subUnitId: 'source',
                    unitType: UnitObject.SelectRange,
                    editState: EditStateEnum.OnlyMe,
                    viewState: ViewStateEnum.OthersCanView,
                }],
            })).toBe(true);
            runtime.get(IPermissionService).updatePermissionPoint(
                new RangeProtectionPermissionEditPoint('test', 'source', 'outside-permission').id,
                false
            );
            expect(commands.syncExecuteCommand(ReorderRangeCommand.id, {
                unitId: 'test',
                subUnitId: 'source',
                range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
                order: { 0: 1, 1: 0 },
            })).toBe(true);
            expect(runtime.sheet.getSheetBySheetId('source')?.getCellRaw(0, 0)?.v).toBe('O02');
            expect(runtime.sheet.getSheetBySheetId('source')?.getCellRaw(0, 3)?.v).toBe('outside');
        } finally {
            runtime.univer.dispose();
        }
    });
});

function createDeniedPoint(kind: 'range' | 'worksheet-edit' | 'worksheet-sort' | 'workbook') {
    switch (kind) {
        case 'range':
            return new RangeProtectionPermissionEditPoint('test', 'source', 'locked-permission');
        case 'worksheet-edit':
            return new WorksheetEditPermission('test', 'source');
        case 'worksheet-sort':
            return new WorksheetSortPermission('test', 'source');
        case 'workbook':
            return new WorkbookEditablePermission('test');
    }
}

function createSplitRuntime(append = false, skipped = false) {
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
    const injector = univer.__getInjector();
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    injector.get(LocaleService).setDirection('ltr');
    const column = append ? 3 : 2;
    const sourceCell = (value: string) => ({ v: value, t: CellValueType.STRING, s: 'text' });
    const data: IWorkbookData = {
        id: 'split-owner',
        name: 'Split permission',
        appVersion: '1.0.0',
        locale: LocaleType.EN_US,
        styles: { text: { n: { pattern: '@' } } },
        sheetOrder: ['active', 'source'],
        sheets: {
            active: { id: 'active', name: 'Active', rowCount: 20, columnCount: 4, cellData: { 0: { 0: { v: 'active sentinel' } } } },
            source: {
                id: 'source',
                name: 'Source',
                rowCount: 20,
                columnCount: 4,
                cellData: skipped
                    ? {
                        1: { [column]: sourceCell('0012,2'), [column + 1]: { v: 'first target', s: 'text' } },
                        2: { [column]: { v: 0, t: CellValueType.NUMBER }, [column + 1]: { v: 77 } },
                        3: { [column]: { v: false, t: CellValueType.BOOLEAN }, [column + 1]: { v: 88 } },
                        4: { [column]: { v: null }, [column + 1]: { v: 99 } },
                        5: { [column]: sourceCell('0013'), [column + 1]: { v: 'padding target', s: 'text' } },
                    }
                    : {
                        1: { [column]: sourceCell('0012,2'), ...(!append && { [column + 1]: sourceCell('target') }) },
                        2: { [column]: sourceCell('0013'), ...(!append && { [column + 1]: sourceCell('padding') }) },
                        9: { 0: { v: 123, t: CellValueType.NUMBER } },
                    },
            },
        },
    };
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
    const other = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        ...Tools.deepClone(data),
        id: 'split-other',
        name: 'Independent',
    });
    const instances = injector.get(IUniverInstanceService);
    instances.focusUnit('split-other');
    const commands = injector.get(ICommandService);
    const permissions = injector.get(IPermissionService);
    const controller = injector.get(SheetPermissionCheckController);
    const sheet = workbook.getSheetBySheetId('source');
    if (!sheet) {
        throw new Error('Expected actual source worksheet');
    }
    const setPoint = (point: ReturnType<typeof createSplitPoint>, value: boolean) => {
        if (!permissions.getPermissionPoint(point.id)) {
            permissions.addPermissionPoint(point);
        }
        permissions.updatePermissionPoint(point.id, value);
    };
    setPoint(new WorkbookEditablePermission('split-other'), false);
    return { univer, injector, commands, permissions, controller, workbook, other, instances, sheet, column, setPoint };
}

function createSplitPoint(kind: 'output' | 'padding' | 'workbook' | 'worksheet' | 'cell-value' | 'workbook-insert' | 'worksheet-insert' | 'append-anchor') {
    switch (kind) {
        case 'workbook': return new WorkbookEditablePermission('split-owner');
        case 'worksheet': return new WorksheetEditPermission('split-owner', 'source');
        case 'cell-value': return new WorksheetSetCellValuePermission('split-owner', 'source');
        case 'workbook-insert': return new WorkbookInsertColumnPermission('split-owner');
        case 'worksheet-insert': return new WorksheetInsertColumnPermission('split-owner', 'source');
        default: return new RangeProtectionPermissionEditPoint('split-owner', 'source', 'split-lock');
    }
}

describe('SheetPermissionCheckController split permission', () => {
    it.each(['output', 'padding', 'workbook', 'worksheet', 'cell-value', 'workbook-insert', 'worksheet-insert', 'append-anchor'] as const)(
        'rejects %s on the actual split owner before writing or appending and recovers with history and JSON',
        async (kind) => {
            const append = kind === 'workbook-insert' || kind === 'worksheet-insert' || kind === 'append-anchor';
            const runtime = createSplitRuntime(append);
            try {
                const { injector, commands, sheet, other, column, setPoint, instances } = runtime;
                const range: IRange = { startRow: 1, endRow: 2, startColumn: column, endColumn: column };
                const protectionRange = kind === 'append-anchor'
                    ? { startRow: 0, endRow: 0, startColumn: 3, endColumn: 3 }
                    : { startRow: kind === 'padding' ? 2 : 1, endRow: kind === 'padding' ? 2 : 1, startColumn: 3, endColumn: 3 };
                expect(commands.syncExecuteCommand(AddRangeProtectionMutation.id, {
                    unitId: 'split-owner',
                    subUnitId: 'source',
                    rules: [{
                        id: 'split-rule',
                        permissionId: 'split-lock',
                        ranges: [protectionRange],
                        unitId: 'split-owner',
                        subUnitId: 'source',
                        unitType: UnitObject.SelectRange,
                        editState: EditStateEnum.OnlyMe,
                        viewState: ViewStateEnum.OthersCanView,
                    }],
                })).toBe(true);
                setPoint(new RangeProtectionPermissionViewPoint('split-owner', 'source', 'split-lock'), true);
                const point = createSplitPoint(kind);
                setPoint(point, false);
                expect(runtime.permissions.getPermissionPoint(point.id)?.value).toBe(false);
                expect(sheet.getColumnCount()).toBe(4);
                const errors: string[] = [];
                const subscription = runtime.controller.triggerPermissionUIEvent$.subscribe((error) => errors.push(error));
                try {
                    const loader = injector.get(IResourceLoaderService);
                    const history = injector.get(IUndoRedoService);
                    const before = Tools.deepClone(loader.saveUnit<IWorkbookData>('split-owner'));
                    const otherBefore = Tools.deepClone(loader.saveUnit<IWorkbookData>('split-other'));
                    const oldHistory = history.getUndoRedoStatus('split-owner');
                    const params = { unitId: 'split-owner', subUnitId: 'source', range, delimiter: SplitDelimiterEnum.Comma };
                    expect(commands.syncExecuteCommand(SplitTextToColumnsCommand.id, params)).toBe(false);
                    expect(loader.saveUnit<IWorkbookData>('split-owner')).toEqual(before);
                    expect(loader.saveUnit<IWorkbookData>('split-other')).toEqual(otherBefore);
                    expect(history.getUndoRedoStatus('split-owner')).toEqual(oldHistory);
                    const appendDenied = kind === 'workbook-insert' || kind === 'worksheet-insert' || kind === 'append-anchor';
                    expect(errors).toEqual([injector.get(LocaleService).t(
                        appendDenied ? 'sheets.permission.dialog.insertRowColErr' : 'sheets.permission.dialog.editErr'
                    )]);
                    setPoint(point, true);
                    setPoint(createSplitPoint('output'), true);
                    const authorized = Tools.deepClone(loader.saveUnit<IWorkbookData>('split-owner'));
                    expect(commands.syncExecuteCommand(SplitTextToColumnsCommand.id, params)).toBe(true);
                    expect(sheet.getCellRaw(1, column)?.v).toBe('0012');
                    expect(sheet.getCellRaw(1, column + 1)?.v).toBe(append ? 2 : '2');
                    expect(sheet.getCellRaw(2, column)?.v).toBe('0013');
                    expect(sheet.getCellRaw(2, column + 1)?.v).toBeUndefined();
                    expect(sheet.getColumnCount()).toBe(append ? 5 : 4);
                    expect(history.getUndoRedoStatus('split-owner')).toEqual({ undos: oldHistory.undos + 1, redos: 0 });
                    expect(loader.saveUnit<IWorkbookData>('split-other')).toEqual(otherBefore);
                    instances.focusUnit('split-owner');
                    expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
                    expect(loader.saveUnit<IWorkbookData>('split-owner')).toEqual(authorized);
                    expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
                    const saved = loader.saveUnit<IWorkbookData>('split-owner');
                    if (!saved) {
                        throw new Error('Expected actual saved split workbook');
                    }
                    expect(instances.disposeUnit('split-owner')).toBe(true);
                    const reopened = runtime.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(saved)));
                    expect(reopened.getSheetBySheetId('source')?.getCellRaw(1, column)?.v).toBe('0012');
                    instances.focusUnit('split-owner');
                    expect(commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'split-owner', subUnitId: 'source' })).toBe(true);
                    setPoint(point, true);
                    setPoint(createSplitPoint('output'), true);
                    setPoint(new RangeProtectionPermissionViewPoint('split-owner', 'source', 'split-lock'), true);
                    expect(commands.syncExecuteCommand(SetRangeValuesCommand.id, {
                        unitId: 'split-owner',
                        subUnitId: 'source',
                        range: { startRow: 1, endRow: 1, startColumn: column, endColumn: column },
                        value: { v: '0014,4', t: CellValueType.STRING, f: null, p: null },
                    })).toBe(true);
                    expect(commands.syncExecuteCommand(SplitTextToColumnsCommand.id, {
                        ...params,
                        range: { startRow: 1, endRow: 1, startColumn: column, endColumn: column },
                    })).toBe(true);
                    expect(reopened.getSheetBySheetId('source')?.getCellRaw(1, column)?.v).toBe('0014');
                    expect(reopened.getSheetBySheetId('source')?.getCellRaw(1, column + 1)?.v).toBe(append ? 4 : '4');
                    expect(other.getSheetBySheetId('source')?.getCellRaw(1, column)?.v).toBe('0012,2');
                    expect(loader.saveUnit<IWorkbookData>('split-other')).toEqual(otherBefore);
                    expect(reopened.getSheetBySheetId('active')?.getCellRaw(0, 0)?.v).toBe('active sentinel');
                    expect(errors).toHaveLength(1);
                } finally {
                    subscription.unsubscribe();
                }
            } finally {
                runtime.univer.dispose();
            }
        }
    );

    it.each([false, true])('allows protected skipped numeric, Boolean and empty rows with whole-column=%s', (wholeColumn) => {
        const runtime = createSplitRuntime(false, true);
        try {
            const { injector, commands, sheet, column } = runtime;
            expect(commands.syncExecuteCommand(AddRangeProtectionMutation.id, {
                unitId: 'split-owner',
                subUnitId: 'source',
                rules: [{
                    id: 'skipped-rule',
                    permissionId: 'split-lock',
                    ranges: [{ startRow: 2, endRow: 4, startColumn: column, endColumn: column + 1 }],
                    unitId: 'split-owner',
                    subUnitId: 'source',
                    unitType: UnitObject.SelectRange,
                    editState: EditStateEnum.OnlyMe,
                    viewState: ViewStateEnum.OthersCanView,
                }],
            })).toBe(true);
            runtime.setPoint(new RangeProtectionPermissionViewPoint('split-owner', 'source', 'split-lock'), true);
            runtime.setPoint(createSplitPoint('output'), false);
            const before = Tools.deepClone(sheet.getCellMatrix().getMatrix());
            const independent = Tools.deepClone(injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('split-other'));
            expect(commands.syncExecuteCommand(SplitTextToColumnsCommand.id, {
                unitId: 'split-owner',
                subUnitId: 'source',
                delimiter: SplitDelimiterEnum.Comma,
                range: wholeColumn
                    ? { startRow: Number.NaN, endRow: Number.NaN, startColumn: column, endColumn: column, rangeType: RANGE_TYPE.COLUMN }
                    : { startRow: 1, endRow: 5, startColumn: column, endColumn: column },
            })).toBe(true);
            expect(sheet.getCellRaw(1, column)?.v).toBe('0012');
            expect(sheet.getCellRaw(5, column)?.v).toBe('0013');
            for (const row of [2, 3, 4]) {
                expect(sheet.getCellRaw(row, column)).toEqual(before[row][column]);
                expect(sheet.getCellRaw(row, column + 1)).toEqual(before[row][column + 1]);
            }
            expect(injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('split-other')).toEqual(independent);
        } finally {
            runtime.univer.dispose();
        }
    });
});
