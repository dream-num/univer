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
    CellValueType,
    IAuthzIoService,
    ICommandService,
    IPermissionService,
    IResourceLoaderService,
    IResourceManagerService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import {
    AddRangeProtectionMutation,
    AddWorksheetProtectionMutation,
    DeleteRangeProtectionMutation,
    DeleteWorksheetProtectionMutation,
    EditStateEnum,
    SetRangeProtectionMutation,
    SetRangeValuesCommand,
    SetWorksheetPermissionPointsCommand,
    SheetPermissionCheckController,
    SheetPermissionInitController,
    UniverSheetsPlugin,
    ViewStateEnum,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import enUS from '@univerjs/sheets/locale/en-US';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ITestBed } from './create-test-bed';
import { createFacadeTestBed } from './create-test-bed';

function createPermissionRuntime(snapshot?: IWorkbookData, initialize = true) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    function workbookData(id: string): IWorkbookData {
        return {
            id,
            name: id,
            appVersion: 'test',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    name: 'Sheet',
                    rowCount: 10,
                    columnCount: 10,
                    cellData: { 0: { 0: { v: 11, t: CellValueType.NUMBER }, 1: { v: 77 } } },
                },
            },
        };
    }
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, snapshot || workbookData('owner'));
    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData('foreign'));
    if (initialize) {
        injector.get(SheetPermissionInitController).initPermission();
    }
    const api = FUniver.newAPI(injector);
    return { univer, injector, api, workbook };
}

async function protectIndependentWorksheet(runtime: ReturnType<typeof createPermissionRuntime>, owner = 'foreign') {
    const permission = runtime.api.getWorkbook(owner)!.getSheetByName('Sheet')!.getWorksheetPermission();
    await permission.protect({ name: 'Independent protection' });
    await permission.setPoint(runtime.api.Enum.WorksheetPermissionPoint.Edit, false);
    const permissionId = await runtime.injector.get(IAuthzIoService).create({
        objectType: UnitObject.Worksheet,
        worksheetObject: {
            unitID: owner,
            name: 'Independent operations',
            collaborators: [],
            strategies: [],
            scope: undefined,
        },
    });
    expect(await runtime.injector.get(ICommandService).executeCommand(SetWorksheetPermissionPointsCommand.id, {
        rule: { unitId: owner, subUnitId: 'sheet', permissionId },
    })).toBe(true);
}

describe('range permission facade local persistence', () => {
    it('rejects a range rule whose authorization belongs to another workbook', async () => {
        const runtime = createPermissionRuntime();
        try {
            const { api, injector } = runtime;
            const ownerSheet = api.getWorkbook('owner')!.getSheetByName('Sheet')!;
            const ownerRule = await ownerSheet.getRange('A1').getRangePermission().protect();
            const commands = injector.get(ICommandService);
            expect(commands.syncExecuteCommand(AddRangeProtectionMutation.id, {
                unitId: 'foreign',
                subUnitId: 'sheet',
                rules: [{
                    id: 'foreign-range',
                    permissionId: ownerRule.permissionId,
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                    unitId: 'foreign',
                    subUnitId: 'sheet',
                    unitType: UnitObject.SelectRange,
                    editState: EditStateEnum.OnlyMe,
                    viewState: ViewStateEnum.OthersCanView,
                }],
            })).toBe(true);
            const foreignSheet = api.getWorkbook('foreign')!.getSheetByName('Sheet')!;
            const foreignRule = (await foreignSheet.getRange('A1').getRangePermission().listRules({ ignoreCollaborators: true }))[0];
            const permissions = injector.get(IPermissionService);
            const pointId = `${UnitObject.SelectRange}.${UnitAction.Edit}.${ownerRule.permissionId}`;
            permissions.deletePermissionPoint(pointId);
            const loader = injector.get(IResourceLoaderService);
            const ownerBefore = Tools.deepClone(loader.saveUnit('owner'));
            const foreignBefore = Tools.deepClone(loader.saveUnit('foreign'));
            await expect(foreignRule.setPoint(api.Enum.RangePermissionPoint.Edit, false)).rejects.toThrow(/unitID|workbook|owner/i);
            expect(permissions.getPermissionPoint(pointId)).toBeUndefined();
            expect(loader.saveUnit('owner')).toEqual(ownerBefore);
            expect(loader.saveUnit('foreign')).toEqual(foreignBefore);
        } finally {
            runtime.univer.dispose();
        }
    });

    it('persists an explicit denial while a newly loaded protection point still has its initialization value', async () => {
        const original = createPermissionRuntime();
        let restored: ReturnType<typeof createPermissionRuntime> | undefined;
        try {
            const rule = await original.api.getWorkbook('owner')!.getSheetByName('Sheet')!.getRange('A1').getRangePermission().protect();
            await rule.setPoint(original.api.Enum.RangePermissionPoint.Edit, false);
            await rule.setPoint(original.api.Enum.RangePermissionPoint.Edit, true);
            const snapshot = original.injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('owner')!;
            restored = createPermissionRuntime(JSON.parse(JSON.stringify(snapshot)), false);
            const loaded = (await restored.api.getWorkbook('owner')!.getSheetByName('Sheet')!.getRange('A1').getRangePermission().listRules({ ignoreCollaborators: true }))[0];
            expect(loaded.getPoint(restored.api.Enum.RangePermissionPoint.Edit)).toBe(false);
            await loaded.setPoint(restored.api.Enum.RangePermissionPoint.Edit, false);
            expect(await restored.injector.get(IAuthzIoService).allowed({
                unitID: 'owner',
                objectID: loaded.permissionId,
                objectType: UnitObject.SelectRange,
                actions: [UnitAction.Edit],
            })).toEqual([{ action: UnitAction.Edit, allowed: false }]);
            restored.injector.get(SheetPermissionInitController).initPermission();
            await expect.poll(() => loaded.getPoint(restored!.api.Enum.RangePermissionPoint.Edit)).toBe(false);
        } finally {
            restored?.univer.dispose();
            original.univer.dispose();
        }
    });
    for (const editable of [false, true]) {
        it(`keeps the public Edit=${editable} grant consistent with the local authorization provider`, async () => {
            const runtime = createPermissionRuntime();
            try {
                const sheet = runtime.api.getWorkbook('owner')!.getSheetByName('Sheet')!;
                const rule = await sheet.getRange('A1').getRangePermission().protect();
                await rule.setPoint(runtime.api.Enum.RangePermissionPoint.Edit, false);
                if (editable) {
                    await rule.setPoint(runtime.api.Enum.RangePermissionPoint.Edit, true);
                }
                expect(rule.getPoint(runtime.api.Enum.RangePermissionPoint.Edit)).toBe(editable);
                expect(await runtime.injector.get(IAuthzIoService).allowed({
                    unitID: 'owner',
                    objectID: rule.permissionId,
                    objectType: UnitObject.SelectRange,
                    actions: [UnitAction.Edit],
                })).toEqual([{ action: UnitAction.Edit, allowed: editable }]);
            } finally {
                runtime.univer.dispose();
            }
        });

        it(`restores Edit=${editable} for an existing host after JSON reopening without another permission setter`, async () => {
            const runtime = createPermissionRuntime();
            try {
                const { injector, api } = runtime;
                const loader = injector.get(IResourceLoaderService);
                await protectIndependentWorksheet(runtime);
                const foreignBefore = Tools.deepClone(loader.saveUnit('foreign'));
                const foreignHistory = injector.get(IUndoRedoService).getUndoRedoStatus('foreign');
                const rule = await api.getWorkbook('owner')!.getSheetByName('Sheet')!.getRange('A1').getRangePermission().protect();
                await rule.setPoint(api.Enum.RangePermissionPoint.Edit, false);
                if (editable) {
                    await rule.setPoint(api.Enum.RangePermissionPoint.Edit, true);
                }
                const saved = loader.saveUnit<IWorkbookData>('owner')!;
                injector.get(IUniverInstanceService).disposeUnit('owner');
                runtime.univer.createUnit<IWorkbookData, Workbook>(
                    UniverInstanceType.UNIVER_SHEET,
                    JSON.parse(JSON.stringify(saved))
                );
                const reopened = api.getWorkbook('owner')!.getSheetByName('Sheet')!;
                const loadedRule = (await reopened.getWorksheetPermission()
                    .listRangeProtectionRules({ ignoreCollaborators: true }))[0];
                expect(loadedRule.id).toBe(rule.id);
                expect(loadedRule.permissionId).toBe(rule.permissionId);
                await expect.poll(() => loadedRule.getPoint(api.Enum.RangePermissionPoint.Edit)).toBe(editable);
                const point = injector.get(IPermissionService).getPermissionPoint(`${UnitObject.SelectRange}.${UnitAction.Edit}.${rule.permissionId}`);
                expect(point?.value).toBe(editable);
                const before = Tools.deepClone(loader.saveUnit('owner'));
                const history = injector.get(IUndoRedoService).getUndoRedoStatus('owner');
                const errors: string[] = [];
                const subscription = injector.get(SheetPermissionCheckController).triggerPermissionUIEvent$.subscribe((message) => errors.push(message));
                try {
                    expect(injector.get(ICommandService).syncExecuteCommand(SetRangeValuesCommand.id, {
                        unitId: 'owner',
                        subUnitId: 'sheet',
                        range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                        value: { v: 22, t: CellValueType.NUMBER },
                    })).toBe(editable);
                } finally {
                    subscription.unsubscribe();
                }
                if (editable) {
                    expect(errors).toEqual([]);
                    expect(reopened.getRange('A1').getValue()).toBe(22);
                    expect(injector.get(IUndoRedoService).getUndoRedoStatus('owner').undos).toBe(history.undos + 1);
                    const changed = Tools.deepClone(loader.saveUnit('owner'));
                    injector.get(IUniverInstanceService).focusUnit('owner');
                    expect(await injector.get(ICommandService).executeCommand(UndoCommand.id)).toBe(true);
                    expect(loader.saveUnit('owner')).toEqual(before);
                    expect(await injector.get(ICommandService).executeCommand(RedoCommand.id)).toBe(true);
                    expect(loader.saveUnit('owner')).toEqual(changed);
                } else {
                    expect(errors).toHaveLength(1);
                    expect(loader.saveUnit('owner')).toEqual(before);
                    expect(injector.get(IUndoRedoService).getUndoRedoStatus('owner')).toEqual(history);
                }
                expect(loader.saveUnit('foreign')).toEqual(foreignBefore);
                expect(injector.get(IUndoRedoService).getUndoRedoStatus('foreign')).toEqual(foreignHistory);
            } finally {
                runtime.univer.dispose();
            }
        });
    }
});

describe('worksheet and workbook permission facade local persistence', () => {
    for (const scope of ['worksheet', 'workbook'] as const) {
        it(`persists explicit ${scope} permission even when it matches the newly loaded initialization value`, async () => {
            const original = createPermissionRuntime();
            let restored: ReturnType<typeof createPermissionRuntime> | undefined;
            try {
                const workbook = original.api.getWorkbook('owner')!;
                let objectID = 'owner';
                if (scope === 'worksheet') {
                    const permission = workbook.getSheetByName('Sheet')!.getWorksheetPermission();
                    objectID = await permission.protect();
                    await permission.setPoint(original.api.Enum.WorksheetPermissionPoint.Edit, false);
                    await permission.setPoint(original.api.Enum.WorksheetPermissionPoint.Edit, true);
                } else {
                    await workbook.getWorkbookPermission().setPoint(original.api.Enum.WorkbookPermissionPoint.Edit, false);
                }
                const saved = original.injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('owner')!;
                restored = createPermissionRuntime(JSON.parse(JSON.stringify(saved)), false);
                const loaded = restored.api.getWorkbook('owner')!;
                const value = scope === 'workbook';
                if (scope === 'worksheet') {
                    const permission = loaded.getSheetByName('Sheet')!.getWorksheetPermission();
                    expect(permission.getPoint(restored.api.Enum.WorksheetPermissionPoint.Edit)).toBe(false);
                    await permission.setPoint(restored.api.Enum.WorksheetPermissionPoint.Edit, false);
                } else {
                    const permission = loaded.getWorkbookPermission();
                    expect(permission.getPoint(restored.api.Enum.WorkbookPermissionPoint.Edit)).toBe(true);
                    await permission.setPoint(restored.api.Enum.WorkbookPermissionPoint.Edit, true);
                }
                expect(await restored.injector.get(IAuthzIoService).allowed({
                    unitID: 'owner',
                    objectID,
                    objectType: scope === 'worksheet' ? UnitObject.Worksheet : UnitObject.Workbook,
                    actions: [UnitAction.Edit],
                })).toEqual([{ action: UnitAction.Edit, allowed: value }]);
                restored.injector.get(SheetPermissionInitController).initPermission();
                await expect.poll(() => scope === 'worksheet'
                    ? loaded.getSheetByName('Sheet')!.getWorksheetPermission().canEdit()
                    : loaded.getWorkbookPermission().canEdit()).toBe(value);
            } finally {
                restored?.univer.dispose();
                original.univer.dispose();
            }
        });
    }
    it('replaces only the requested worksheet resources and resets removed rules without loading foreign legacy entries', async () => {
        const runtime = createPermissionRuntime(undefined, false);
        try {
            const { injector, api } = runtime;
            await protectIndependentWorksheet(runtime, 'owner');
            await protectIndependentWorksheet(runtime);
            const loader = injector.get(IResourceLoaderService);
            const foreign = Tools.deepClone(loader.saveUnit<IWorkbookData>('foreign')!);
            const foreignHistory = injector.get(IUndoRedoService).getUndoRedoStatus('foreign');
            const ownHistory = injector.get(IUndoRedoService).getUndoRedoStatus('owner');
            const replacement = foreign.resources.filter((resource) => resource.name === 'SHEET_WORKSHEET_PROTECTION_PLUGIN'
                || resource.name === 'SHEET_WORKSHEET_PROTECTION_POINT_PLUGIN');
            injector.get(IResourceManagerService).loadResources('owner', replacement);
            expect(injector.get(WorksheetProtectionRuleModel).getRule('owner', 'sheet')).toBeUndefined();
            expect(injector.get(WorksheetProtectionPointModel).getRule('owner', 'sheet')).toBeUndefined();
            expect(api.getWorkbook('owner')!.getSheetByName('Sheet')!.getWorksheetPermission().canEdit()).toBe(true);
            const own = loader.saveUnit<IWorkbookData>('owner')!;
            for (const resource of own.resources.filter((entry) => replacement.some((item) => item.name === entry.name))) {
                expect(JSON.parse(resource.data)).toEqual({});
            }
            expect(injector.get(IUndoRedoService).getUndoRedoStatus('owner')).toEqual(ownHistory);
            expect(loader.saveUnit('foreign')).toEqual(foreign);
            expect(injector.get(IUndoRedoService).getUndoRedoStatus('foreign')).toEqual(foreignHistory);
            expect(injector.get(ICommandService).syncExecuteCommand(SetRangeValuesCommand.id, {
                unitId: 'owner',
                subUnitId: 'sheet',
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                value: { v: 22, t: CellValueType.NUMBER },
            })).toBe(true);
            expect(api.getWorkbook('owner')!.getSheetByName('Sheet')!.getRange('A1').getValue()).toBe(22);
            injector.get(IUniverInstanceService).focusUnit('owner');
            expect(await injector.get(ICommandService).executeCommand(UndoCommand.id)).toBe(true);
            expect(loader.saveUnit('owner')).toEqual(own);
            expect(loader.saveUnit('foreign')).toEqual(foreign);
        } finally {
            runtime.univer.dispose();
        }
    });
    for (const scope of ['worksheet', 'workbook'] as const) {
        for (const editable of [false, true]) {
            it(`preserves public ${scope} Edit=${editable} in authorization and after same-host JSON reopening`, async () => {
                const runtime = createPermissionRuntime();
                try {
                    const { api, injector } = runtime;
                    const workbook = api.getWorkbook('owner')!;
                    const sheet = workbook.getSheetByName('Sheet')!;
                    const loader = injector.get(IResourceLoaderService);
                    await protectIndependentWorksheet(runtime);
                    const foreignBefore = Tools.deepClone(loader.saveUnit('foreign'));
                    const foreignHistory = injector.get(IUndoRedoService).getUndoRedoStatus('foreign');
                    let objectID = 'owner';
                    let getPoint: () => boolean;
                    let setPoint: (value: boolean) => Promise<void>;
                    if (scope === 'worksheet') {
                        const permission = sheet.getWorksheetPermission();
                        objectID = await permission.protect();
                        getPoint = () => permission.getPoint(api.Enum.WorksheetPermissionPoint.Edit);
                        setPoint = (value) => permission.setPoint(api.Enum.WorksheetPermissionPoint.Edit, value);
                    } else {
                        const permission = workbook.getWorkbookPermission();
                        getPoint = () => permission.getPoint(api.Enum.WorkbookPermissionPoint.Edit);
                        setPoint = (value) => permission.setPoint(api.Enum.WorkbookPermissionPoint.Edit, value);
                    }
                    await setPoint(false);
                    if (editable) {
                        await setPoint(true);
                    }
                    expect(getPoint()).toBe(editable);
                    expect(await injector.get(IAuthzIoService).allowed({
                        unitID: 'owner',
                        objectID,
                        objectType: scope === 'worksheet' ? UnitObject.Worksheet : UnitObject.Workbook,
                        actions: [UnitAction.Edit],
                    })).toEqual([{ action: UnitAction.Edit, allowed: editable }]);
                    const saved = loader.saveUnit<IWorkbookData>('owner')!;
                    injector.get(IUniverInstanceService).disposeUnit('owner');
                    runtime.univer.createUnit<IWorkbookData, Workbook>(
                        UniverInstanceType.UNIVER_SHEET,
                        JSON.parse(JSON.stringify(saved))
                    );
                    await expect.poll(getPoint).toBe(editable);
                    const before = Tools.deepClone(loader.saveUnit('owner'));
                    const history = injector.get(IUndoRedoService).getUndoRedoStatus('owner');
                    const errors: string[] = [];
                    const subscription = injector.get(SheetPermissionCheckController).triggerPermissionUIEvent$.subscribe((message) => errors.push(message));
                    try {
                        expect(injector.get(ICommandService).syncExecuteCommand(SetRangeValuesCommand.id, {
                            unitId: 'owner',
                            subUnitId: 'sheet',
                            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                            value: { v: 22, t: CellValueType.NUMBER },
                        })).toBe(editable);
                    } finally {
                        subscription.unsubscribe();
                    }
                    if (editable) {
                        expect(errors).toEqual([]);
                        expect(api.getWorkbook('owner')!.getSheetByName('Sheet')!.getRange('A1').getValue()).toBe(22);
                        expect(injector.get(IUndoRedoService).getUndoRedoStatus('owner').undos).toBe(history.undos + 1);
                        const changed = Tools.deepClone(loader.saveUnit('owner'));
                        injector.get(IUniverInstanceService).focusUnit('owner');
                        expect(await injector.get(ICommandService).executeCommand(UndoCommand.id)).toBe(true);
                        expect(loader.saveUnit('owner')).toEqual(before);
                        expect(await injector.get(ICommandService).executeCommand(RedoCommand.id)).toBe(true);
                        expect(loader.saveUnit('owner')).toEqual(changed);
                    } else {
                        expect(errors).toHaveLength(1);
                        expect(loader.saveUnit('owner')).toEqual(before);
                        expect(injector.get(IUndoRedoService).getUndoRedoStatus('owner')).toEqual(history);
                    }
                    expect(loader.saveUnit('foreign')).toEqual(foreignBefore);
                    expect(injector.get(IUndoRedoService).getUndoRedoStatus('foreign')).toEqual(foreignHistory);
                } finally {
                    runtime.univer.dispose();
                }
            });
        }
    }
});

describe('sheets facade permissions', () => {
    let testBed: ITestBed;

    beforeEach(() => {
        testBed = createFacadeTestBed();
        [
            AddWorksheetProtectionMutation,
            DeleteWorksheetProtectionMutation,
            AddRangeProtectionMutation,
            DeleteRangeProtectionMutation,
            SetRangeProtectionMutation,
        ].forEach((command) => testBed.get(ICommandService).registerCommand(command));
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('applies workbook modes and collaborator changes through the permission facade', async () => {
        const { univerAPI } = testBed;
        const workbookPermission = univerAPI.getActiveWorkbook()!.getWorkbookPermission();

        expect(workbookPermission.canEdit()).toBe(true);

        await workbookPermission.setReadOnly();
        expect(workbookPermission.canEdit()).toBe(false);
        expect(workbookPermission.getPoint(univerAPI.Enum.WorkbookPermissionPoint.View)).toBe(true);

        await workbookPermission.setEditable();
        expect(workbookPermission.canEdit()).toBe(true);
        expect(workbookPermission.getSnapshot()[univerAPI.Enum.WorkbookPermissionPoint.CreateSheet]).toBe(true);

        await workbookPermission.setPoint(univerAPI.Enum.WorkbookPermissionPoint.Print, false);
        expect(workbookPermission.getPoint(univerAPI.Enum.WorkbookPermissionPoint.Print)).toBe(false);
        await workbookPermission.setPoint(univerAPI.Enum.WorkbookPermissionPoint.Print, false);
        expect(workbookPermission.getPoint(univerAPI.Enum.WorkbookPermissionPoint.Print)).toBe(false);

        await workbookPermission.setCollaborators([
            { user: { userID: 'u-1', name: 'Editor', avatar: 'editor.png' }, role: univerAPI.Enum.UnitRole.Editor },
        ]);
        await workbookPermission.addCollaborator({ userID: 'u-2', name: 'Reader', avatar: '' }, univerAPI.Enum.UnitRole.Reader);
        await workbookPermission.updateCollaborator({ userID: 'u-2', name: 'Reader updated', avatar: 'reader.png' }, univerAPI.Enum.UnitRole.Editor);

        expect(await workbookPermission.listCollaborators()).toEqual([]);

        await workbookPermission.removeCollaborator('u-1');
        await workbookPermission.removeCollaborators(['u-2']);
        expect(await workbookPermission.listCollaborators()).toEqual([]);
    });

    it('protects a worksheet and range, then restores editing after unprotecting', async () => {
        const { univerAPI } = testBed;
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const worksheetPermission = worksheet.getWorksheetPermission();
        const protectedRange = worksheet.getRange('A1:B2');
        const rangePermission = protectedRange.getRangePermission();

        expect(worksheetPermission.isProtected()).toBe(false);
        expect(rangePermission.isProtected()).toBe(false);
        expect(worksheetPermission.canEditCell(0, 0)).toBe(true);

        const worksheetPermissionId = await worksheetPermission.protect({ name: 'Quarter close sheet' });
        expect(worksheetPermissionId).toBeTruthy();
        expect(worksheetPermission.isProtected()).toBe(true);

        await worksheetPermission.setMode('readOnly');
        expect(worksheetPermission.canEdit()).toBe(false);
        expect(worksheetPermission.canView()).toBe(true);
        expect(worksheetPermission.canEditCell(3, 3)).toBe(false);
        expect(worksheetPermission.getSnapshot()[univerAPI.Enum.WorksheetPermissionPoint.View]).toBe(true);

        await worksheetPermission.setEditable();
        expect(worksheetPermission.canEdit()).toBe(true);

        const rule = await rangePermission.protect({
            name: 'Locked input cells',
            allowViewByOthers: false,
        });
        expect(rangePermission.isProtected()).toBe(true);
        expect(rule.options).toMatchObject({ name: 'Locked input cells', allowViewByOthers: false });
        expect(rule.ranges.map((range) => range.getA1Notation())).toEqual(['A1:B2']);

        await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, false);
        await rule.setPoint(univerAPI.Enum.RangePermissionPoint.View, true);
        await rule.setPoint(univerAPI.Enum.RangePermissionPoint.ManageCollaborator, false);
        await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Delete, false);
        expect(rule.canEdit()).toBe(false);
        expect(rule.canView()).toBe(true);
        expect(rule.canManageCollaborator()).toBe(false);
        expect(rule.canDelete()).toBe(false);
        expect(rule.getSnapshot()[univerAPI.Enum.RangePermissionPoint.Edit]).toBe(false);
        expect(worksheetPermission.canEditCell(0, 0)).toBe(false);
        expect(worksheetPermission.canEditCell(5, 5)).toBe(true);

        await expect(rule.updateRanges([])).rejects.toThrow('Ranges cannot be empty');
        await rule.updateRanges([worksheet.getRange('C1:C2')]);
        expect(rule.ranges.map((range) => range.getA1Notation())).toEqual(['C1:C2']);
        expect((await worksheetPermission.listRangeProtectionRules({ ignoreCollaborators: true })).map((item) => item.id)).toEqual([rule.id]);
        expect((await rangePermission.listRules({ ignoreCollaborators: true }))).toEqual([]);
        expect((await worksheet.getRange('C1').getRangePermission().listRules({ ignoreCollaborators: true })).map((item) => item.id)).toEqual([rule.id]);

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const collaboratorRule = await worksheet.getRange('E1:E2').getRangePermission().protect({
            name: 'Missing collaborator range',
            allowedUsers: ['missing-user'],
        });
        consoleErrorSpy.mockRestore();
        expect(collaboratorRule.options.name).toBe('Missing collaborator range');

        await expect(rule.updateRanges([worksheet.getRange('E2:E3')]))
            .rejects
            .toThrow('Range protection cannot intersect with other protection rules');

        await expect(worksheet.getRange('C2:D3').getRangePermission().protect({ name: 'Overlapping range' }))
            .rejects
            .toThrow('Range is already protected');

        expect(await collaboratorRule.remove()).toBe(true);
        expect(await rule.remove()).toBe(true);
        expect(await rangePermission.unprotect()).toBe(true);
        expect(worksheet.getRange('C1').getRangePermission().isProtected()).toBe(false);

        expect(await worksheetPermission.unprotect()).toBe(true);
        expect(worksheetPermission.isProtected()).toBe(false);
    });

    it('applies worksheet protection config and manages range rules in batches', async () => {
        const { univerAPI } = testBed;
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const worksheetPermission = worksheet.getWorksheetPermission();

        await expect(worksheetPermission.protectRanges([])).rejects.toThrow('Configs cannot be empty');
        await expect(worksheetPermission.setPoint(univerAPI.Enum.WorksheetPermissionPoint.Edit, false))
            .rejects
            .toThrow('worksheet protection does not exist');

        await worksheetPermission.protect({ name: 'Shared planning sheet' });
        await worksheetPermission.applyConfig({
            mode: 'filterOnly',
            points: {
                [univerAPI.Enum.WorksheetPermissionPoint.Edit]: true,
                [univerAPI.Enum.WorksheetPermissionPoint.InsertRow]: false,
            },
            rangeProtections: [
                {
                    rangeRefs: ['E1:E2'],
                    options: { name: 'Forecast totals', allowViewByOthers: false },
                },
            ],
        });

        expect(worksheetPermission.canEdit()).toBe(true);
        expect(worksheetPermission.getPoint(univerAPI.Enum.WorksheetPermissionPoint.Filter)).toBe(true);
        expect(worksheetPermission.getPoint(univerAPI.Enum.WorksheetPermissionPoint.InsertRow)).toBe(false);
        expect(worksheetPermission.canViewCell(0, 4)).toBe(false);
        expect(worksheetPermission.canViewCell(5, 5)).toBe(true);

        const budgetRules = await worksheetPermission.protectRanges([
            {
                ranges: [worksheet.getRange('A5:B6')],
                options: { name: 'Budget input' },
            },
            {
                ranges: [worksheet.getRange('D5:D6')],
                options: { name: 'Approval input', allowViewByOthers: true },
            },
        ]);

        expect(budgetRules.map((rule) => rule.options.name)).toEqual(['Budget input', 'Approval input']);
        expect((await worksheetPermission.listRangeProtectionRules({ ignoreCollaborators: true })).map((rule) => rule.options.name)).toEqual([
            'Forecast totals',
            'Budget input',
            'Approval input',
        ]);

        const debugBudgetCell = await worksheetPermission.debugCellPermission(4, 0);
        expect(debugBudgetCell?.options.name).toBe('Budget input');
        expect(await worksheetPermission.debugCellPermission(9, 9)).toBeUndefined();

        await expect(worksheetPermission.protectRanges([
            {
                ranges: [worksheet.getRange('A6:C7')],
                options: { name: 'Overlapping budget' },
            },
        ])).rejects.toThrow('The specified ranges overlap with existing protected ranges: A6:C7');

        expect(await worksheetPermission.unprotectRules(budgetRules.map((rule) => rule.id))).toBe(true);
        expect((await worksheetPermission.listRangeProtectionRules({ ignoreCollaborators: true })).map((rule) => rule.options.name)).toEqual(['Forecast totals']);
        expect(await worksheetPermission.unprotectRules([])).toBe(true);

        expect(await worksheetPermission.unprotect()).toBe(true);
        expect(worksheetPermission.isProtected()).toBe(false);
    });

    it('reports a failed range unprotect when the delete mutation cannot run', async () => {
        const { univerAPI, get } = testBed;
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const rangePermission = worksheet.getRange('G1:G2').getRangePermission();

        await rangePermission.protect({ name: 'Locked scenario cells' });
        get(ICommandService).unregisterCommand(DeleteRangeProtectionMutation.id);

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        await expect(rangePermission.unprotect()).rejects.toThrow('is not registered');
        consoleErrorSpy.mockRestore();
        expect(rangePermission.isProtected()).toBe(true);
    });
});
