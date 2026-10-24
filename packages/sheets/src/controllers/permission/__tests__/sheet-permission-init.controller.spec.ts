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

import type { IWorkbookData, Univer, Workbook } from '@univerjs/core';
import type { IAllowedResponse } from '@univerjs/protocol';
import { IAuthzIoService, ICommandService, IPermissionService, IResourceManagerService, IUndoRedoService, IUniverInstanceService, LocaleType, SheetTypes, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import { SetWorksheetNameCommand } from '../../../commands/commands/set-worksheet-name.command';
import { InsertSheetMutation } from '../../../commands/mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../../../commands/mutations/remove-sheet.mutation';
import { SetWorksheetNameMutation } from '../../../commands/mutations/set-worksheet-name.mutation';
import { EditStateEnum, ViewStateEnum } from '../../../models/range-protection-rule.model';
import { WorksheetEditPermission } from '../../../services/permission/permission-point/worksheet/edit';
import { WorksheetViewPermission } from '../../../services/permission/permission-point/worksheet/view';
import { WorksheetProtectionRuleModel } from '../../../services/permission/worksheet-permission/worksheet-permission-rule.model';
import { WorksheetPermissionService } from '../../../services/permission/worksheet-permission/worksheet-permission.service';
import { SheetPermissionInitController } from '../sheet-permission-init.controller';

const workbookData: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART },
        grid: { id: 'grid', name: 'Grid', type: SheetTypes.GRID },
    },
    sheetOrder: ['chart', 'grid'],
    locale: LocaleType.EN_US,
    name: 'Permission test',
    styles: {},
};

describe('SheetPermissionInitController with local chart edit constraint', () => {
    let univer: Univer;
    let controller: SheetPermissionInitController;
    let authz: IAuthzIoService;
    let permissions: IPermissionService;
    let rules: WorksheetProtectionRuleModel;
    let resources: IResourceManagerService;
    let users: UserManagerService;
    let commands: ICommandService;
    let history: IUndoRedoService;

    const editPoint = (sheetId: string) => new WorksheetEditPermission('test', sheetId);

    beforeEach(() => {
        const bed = createCommandTestBed(workbookData, [[SheetPermissionInitController]], (injector) => {
            const owner = injector.get(WorksheetPermissionService);
            expect(owner.setWorksheetEditPermissionConstraint((sheet) => sheet.getConfig().type !== SheetTypes.CHART)).toBe(true);
        });
        univer = bed.univer;
        controller = bed.get(SheetPermissionInitController);
        authz = bed.get(IAuthzIoService);
        permissions = bed.get(IPermissionService);
        rules = bed.get(WorksheetProtectionRuleModel);
        resources = bed.get(IResourceManagerService);
        users = bed.get(UserManagerService);
        commands = bed.get(ICommandService);
        history = bed.get(IUndoRedoService);
        commands.registerCommand(SetWorksheetNameCommand);
        commands.registerCommand(SetWorksheetNameMutation);
        commands.registerCommand(RemoveSheetMutation);
        commands.registerCommand(InsertSheetMutation);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        univer.dispose();
    });

    it('keeps a retained chart point denied through deferred allow, user switch and resource reload', async () => {
        let finishAllowed!: (actions: IAllowedResponse['actions']) => void;
        const pendingAllowed = new Promise<IAllowedResponse['actions']>((done) => {
            finishAllowed = done;
        });
        vi.spyOn(authz, 'allowed').mockImplementation((request) => {
            if (request.objectID === 'chart-rule') {
                return pendingAllowed;
            }
            return Promise.resolve(request.actions.map((action) => ({ action, allowed: true })));
        });
        controller.initPermission();
        const chartPoint = editPoint('chart');
        const subject = permissions.getPermissionPoint$(chartPoint.id);
        const observed: boolean[] = [];
        const subscription = permissions.permissionPointUpdate$.subscribe((point) => {
            if (point instanceof WorksheetEditPermission && point.id === chartPoint.id) {
                observed.push(point.value);
            }
        });
        rules.addRule('test', {
            permissionId: 'chart-rule',
            unitType: chartPoint.type,
            unitId: 'test',
            subUnitId: 'chart',
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        expect(permissions.getPermissionPoint(chartPoint.id)?.value).toBe(false);
        finishAllowed([{ action: UnitAction.Edit, allowed: true }]);
        await Promise.resolve();
        expect(permissions.getPermissionPoint(chartPoint.id)?.value).toBe(false);

        const snapshot = resources.getResources('test', UniverInstanceType.UNIVER_SHEET);
        resources.unloadResources('test', UniverInstanceType.UNIVER_SHEET);
        expect(permissions.getPermissionPoint(chartPoint.id)?.value).toBe(false);
        resources.loadResources('test', snapshot);
        expect(permissions.getPermissionPoint(chartPoint.id)?.value).toBe(false);

        users.setCurrentUser({ userID: 'other-user', name: 'Other user' });
        await Promise.resolve();
        expect(permissions.getPermissionPoint$(chartPoint.id)).toBe(subject);
        expect(permissions.getPermissionPoint(chartPoint.id)?.value).toBe(false);
        expect(observed.every((value) => value === false)).toBe(true);
        subscription.unsubscribe();
    });

    it('still applies external authorization to an ordinary GRID sheet', async () => {
        vi.spyOn(authz, 'allowed').mockImplementation((request) => Promise.resolve(
            request.actions.map((action) => ({ action, allowed: request.objectID !== 'grid-rule' }))
        ));
        controller.initPermission();
        const gridPoint = editPoint('grid');
        expect(permissions.getPermissionPoint(gridPoint.id)?.value).toBe(true);
        rules.addRule('test', {
            permissionId: 'grid-rule',
            unitType: gridPoint.type,
            unitId: 'test',
            subUnitId: 'grid',
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        await Promise.resolve();
        expect(permissions.getPermissionPoint(gridPoint.id)?.value).toBe(false);
        expect(permissions.getPermissionPoint(editPoint('chart').id)?.value).toBe(false);
    });
    it('repeated effective-no-change refresh preserves real GRID undo history', async () => {
        vi.spyOn(authz, 'allowed').mockImplementation((request) => Promise.resolve(
            request.actions.map((action) => ({ action, allowed: true }))
        ));
        controller.initPermission();
        rules.addRule('test', {
            permissionId: 'chart-rule',
            unitType: editPoint('chart').type,
            unitId: 'test',
            subUnitId: 'chart',
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        await Promise.resolve();
        expect(commands.syncExecuteCommand(SetWorksheetNameCommand.id, {
            unitId: 'test',
            subUnitId: 'grid',
            name: 'Renamed grid',
        })).toBe(true);
        expect(history.getUndoRedoStatus('test').undos).toBe(1);

        controller.refreshPermission('test', 'chart-rule');
        await Promise.resolve();
        controller.refreshPermission('test', 'chart-rule');
        await Promise.resolve();

        expect(permissions.getPermissionPoint(editPoint('chart').id)?.value).toBe(false);
        expect(history.getUndoRedoStatus('test').undos).toBe(1);
    });

    it('ignores old refresh completion after a chart sheet with the same ID is recreated', async () => {
        vi.spyOn(authz, 'allowed').mockImplementation((request) => Promise.resolve(
            request.actions.map((action) => ({ action, allowed: true }))
        ));
        controller.initPermission();
        rules.addRule('test', {
            permissionId: 'chart-rule',
            unitType: editPoint('chart').type,
            unitId: 'test',
            subUnitId: 'chart',
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        await Promise.resolve();
        expect(commands.syncExecuteCommand(SetWorksheetNameCommand.id, {
            unitId: 'test',
            subUnitId: 'grid',
            name: 'Renamed grid',
        })).toBe(true);
        const before = history.getUndoRedoStatus('test').undos;
        expect(before).toBe(1);

        let finishAllowed!: (actions: IAllowedResponse['actions']) => void;
        const pendingAllowed = new Promise<IAllowedResponse['actions']>((done) => {
            finishAllowed = done;
        });
        vi.spyOn(authz, 'allowed').mockReturnValue(pendingAllowed);
        controller.refreshPermission('test', 'chart-rule');
        const workbook = univer.__getInjector().get(IUniverInstanceService).getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!;
        const snapshot = workbook.getSheetBySheetId('chart')!.getSnapshot();
        const oldPoint = permissions.getPermissionPoint(editPoint('chart').id);
        expect(commands.syncExecuteCommand(RemoveSheetMutation.id, { unitId: 'test', subUnitId: 'chart' })).toBe(true);
        expect(commands.syncExecuteCommand(InsertSheetMutation.id, { unitId: 'test', sheet: snapshot })).toBe(true);
        const newPoint = permissions.getPermissionPoint(editPoint('chart').id);
        expect(newPoint).not.toBe(oldPoint);
        expect(newPoint?.value).toBe(false);

        const newView = permissions.getPermissionPoint(new WorksheetViewPermission('test', 'chart').id);
        expect(newView?.value).toBe(true);
        finishAllowed([{ action: UnitAction.Edit, allowed: false }, { action: UnitAction.View, allowed: false }]);
        await Promise.resolve();
        expect(permissions.getPermissionPoint(editPoint('chart').id)).toBe(newPoint);
        expect(newPoint?.value).toBe(false);
        expect(newView?.value).toBe(true);
        expect(history.getUndoRedoStatus('test').undos).toBe(before);
    });
});
