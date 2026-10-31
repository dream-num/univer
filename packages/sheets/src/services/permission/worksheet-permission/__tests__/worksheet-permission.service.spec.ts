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
    IAuthzIoService,
    ICommandService,
    IPermissionService,
    IResourceLoaderService,
    IResourceManagerService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UnitObject } from '@univerjs/protocol';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetWorksheetPermissionPointsCommand } from '../../../../commands/commands/set-worksheet-permission-points.command';
import { SetWorksheetProtectionMutation } from '../../../../commands/mutations/set-worksheet-protection.mutation';
import enUS from '../../../../locale/en-US';
import { UniverSheetsPlugin } from '../../../../plugin';
import { RangeProtectionPermissionEditPoint } from '../../permission-point/range/edit';
import { WorksheetEditPermission } from '../../permission-point/worksheet/edit';
import { getAllWorksheetPermissionPoint, getAllWorksheetPermissionPointByPointPanel } from '../utils';
import { WorksheetProtectionPointModel } from '../worksheet-permission-point.model';
import { WorksheetProtectionRuleModel } from '../worksheet-permission-rule.model';
import { POINT_MODEL_PLUGIN_NAME, RULE_MODEL_PLUGIN_NAME, WorksheetPermissionService } from '../worksheet-permission.service';
import '../../../../facade/f-enum';
import '../../../../facade/f-range';
import '../../../../facade/f-univer';
import '../../../../facade/f-workbook';
import '../../../../facade/f-worksheet';

function createRuntime() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    const snapshot: IWorkbookData = {
        id: 'book-1',
        name: 'Owner',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['sheet-1', 'retained'],
        sheets: {
            'sheet-1': { id: 'sheet-1', name: 'Source', rowCount: 10, columnCount: 10, cellData: { 0: { 0: { v: 11 } } } },
            retained: { id: 'retained', name: 'Retained', rowCount: 10, columnCount: 10 },
        },
    };
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, snapshot);
    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, { ...Tools.deepClone(snapshot), id: 'foreign' });
    const api = FUniver.newAPI(injector);
    injector.get(WorksheetPermissionService);
    return { univer, injector, workbook, api };
}

describe('WorksheetPermissionService', () => {
    let runtime: ReturnType<typeof createRuntime>;
    beforeEach(() => {
        runtime = createRuntime();
    });
    afterEach(() => {
        runtime.univer.dispose();
    });

    it('registers worksheet permission points for existing and newly created actual sheets', () => {
        const { injector, api } = runtime;
        const permissions = injector.get(IPermissionService);
        const constructors = [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()];
        for (const Point of constructors) {
            expect(permissions.getPermissionPoint(new Point('book-1', 'sheet-1').id)).toBeDefined();
        }
        const sheet = api.getWorkbook('book-1')!.insertSheet('Second', { sheet: { id: 'sheet-2' } });
        expect(sheet.getSheetId()).toBe('sheet-2');
        for (const Point of constructors) {
            expect(permissions.getPermissionPoint(new Point('book-1', 'sheet-2').id)).toBeDefined();
            expect(permissions.getPermissionPoint(new Point('foreign', 'sheet-2').id)).toBeUndefined();
        }
    });

    it('removes worksheet and range permission points when an actual worksheet is deleted', async () => {
        const { injector, api } = runtime;
        const permissions = injector.get(IPermissionService);
        const source = api.getWorkbook('book-1')!.getSheetByName('Source')!;
        const rule = await source.getRange('A1:B2').getRangePermission().protect();
        const rangePoint = new RangeProtectionPermissionEditPoint('book-1', 'sheet-1', rule.permissionId);
        expect(permissions.getPermissionPoint(rangePoint.id)).toBeDefined();
        const foreign = Tools.deepClone(injector.get(IResourceLoaderService).saveUnit('foreign'));
        expect(api.getWorkbook('book-1')!.deleteSheet('sheet-1')).toBe(true);
        expect(permissions.getPermissionPoint(rangePoint.id)).toBeUndefined();
        for (const Point of [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()]) {
            expect(permissions.getPermissionPoint(new Point('book-1', 'sheet-1').id)).toBeUndefined();
            expect(permissions.getPermissionPoint(new Point('foreign', 'sheet-1').id)).toBeDefined();
        }
        expect(injector.get(IResourceLoaderService).saveUnit('foreign')).toEqual(foreign);
    });

    it('updates the actual protection binding through mutations and restores worksheet access when protection is removed', async () => {
        const { injector, api } = runtime;
        const permission = api.getWorkbook('book-1')!.getSheetByName('Source')!.getWorksheetPermission();
        const originalID = await permission.protect();
        await permission.setPoint(api.Enum.WorksheetPermissionPoint.Edit, false);
        expect(permission.canEdit()).toBe(false);
        const model = injector.get(WorksheetProtectionRuleModel);
        const original = Tools.deepClone(model.getRule('book-1', 'sheet-1')!);
        const replacementID = await injector.get(IAuthzIoService).create({
            objectType: UnitObject.Worksheet,
            worksheetObject: { unitID: 'book-1', name: 'Replacement', collaborators: [], strategies: [], scope: undefined },
        });
        expect(injector.get(ICommandService).syncExecuteCommand(SetWorksheetProtectionMutation.id, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            rule: { ...original, permissionId: replacementID },
        })).toBe(true);
        expect(model.getRule('book-1', 'sheet-1')?.permissionId).toBe(replacementID);
        expect(replacementID).not.toBe(originalID);
        await permission.setPoint(api.Enum.WorksheetPermissionPoint.Edit, false);
        expect(permission.canEdit()).toBe(false);
        await permission.unprotect();
        expect(model.getRule('book-1', 'sheet-1')).toBeUndefined();
        expect(permission.canEdit()).toBe(true);
    });

    it('restores actual rule and operations resources and removes only their owner on workbook unload', async () => {
        const { injector, api } = runtime;
        const permission = api.getWorkbook('book-1')!.getSheetByName('Source')!.getWorksheetPermission();
        const permissionID = await permission.protect();
        await permission.setPoint(api.Enum.WorksheetPermissionPoint.Edit, false);
        const pointID = await injector.get(IAuthzIoService).create({
            objectType: UnitObject.Worksheet,
            worksheetObject: { unitID: 'book-1', name: 'Operations', collaborators: [], strategies: [], scope: undefined },
        });
        expect(await injector.get(ICommandService).executeCommand(SetWorksheetPermissionPointsCommand.id, {
            rule: { unitId: 'book-1', subUnitId: 'sheet-1', permissionId: pointID },
        })).toBe(true);
        const resources = injector.get(IResourceManagerService);
        const ruleHook = resources.getAllResourceHooks().find((hook) => hook.pluginName === RULE_MODEL_PLUGIN_NAME)!;
        const pointHook = resources.getAllResourceHooks().find((hook) => hook.pluginName === POINT_MODEL_PLUGIN_NAME)!;
        expect(JSON.parse(ruleHook.toJson('book-1'))['book-1'][0].permissionId).toBe(permissionID);
        expect(JSON.parse(pointHook.toJson('book-1'))['book-1'][0].permissionId).toBe(pointID);
        expect(ruleHook.parseJson('')).toEqual({});
        expect(pointHook.parseJson('{bad json')).toEqual({});
        const loader = injector.get(IResourceLoaderService);
        const saved = Tools.deepClone(loader.saveUnit<IWorkbookData>('book-1')!);
        const foreign = Tools.deepClone(loader.saveUnit('foreign'));
        injector.get(IUniverInstanceService).disposeUnit('book-1');
        expect(injector.get(WorksheetProtectionRuleModel).getRule('book-1', 'sheet-1')).toBeUndefined();
        expect(injector.get(WorksheetProtectionPointModel).getRule('book-1', 'sheet-1')).toBeUndefined();
        expect(injector.get(IPermissionService).getPermissionPoint(new WorksheetEditPermission('book-1', 'sheet-1').id)).toBeUndefined();
        expect(loader.saveUnit('foreign')).toEqual(foreign);
        runtime.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(saved)));
        expect(injector.get(WorksheetProtectionRuleModel).getRule('book-1', 'sheet-1')?.permissionId).toBe(permissionID);
        expect(injector.get(WorksheetProtectionPointModel).getRule('book-1', 'sheet-1')?.permissionId).toBe(pointID);
        expect(loader.saveUnit('foreign')).toEqual(foreign);
    });

    it('updates existing worksheet points in place from a correctly owned loaded rule resource', async () => {
        const { injector, api } = runtime;
        const permission = api.getWorkbook('book-1')!.getSheetByName('Source')!.getWorksheetPermission();
        await permission.protect();
        const permissions = injector.get(IPermissionService);
        const pointID = new WorksheetEditPermission('book-1', 'sheet-1').id;
        const point = permissions.getPermissionPoint(pointID);
        const count = permissions.getAllPermissionPoint().size;
        const foreign = Tools.deepClone(injector.get(IResourceLoaderService).saveUnit('foreign'));
        const saved = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('book-1')!;
        injector.get(IResourceManagerService).loadResources('book-1', saved.resources);
        expect(permissions.getPermissionPoint(pointID)).toBe(point);
        expect(permissions.getPermissionPoint(pointID)?.value).toBe(false);
        expect(permissions.getAllPermissionPoint().size).toBe(count);
        expect(injector.get(IResourceLoaderService).saveUnit('foreign')).toEqual(foreign);
    });
});
