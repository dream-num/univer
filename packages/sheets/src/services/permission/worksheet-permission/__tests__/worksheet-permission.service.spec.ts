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
import type { Subscription } from 'rxjs';
import { ICommandService, IPermissionService, IResourceManagerService, LocaleType, mergeWorksheetSnapshotWithDefault, SheetTypes, UniverInstanceType } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { IRangeProtectionRule } from '../../../../models/range-protection-rule.model';
import type { IWorksheetProtectionRule } from '../../type';
import { createCommandTestBed } from '../../../../commands/commands/__tests__/create-command-test-bed';
import { InsertSheetMutation } from '../../../../commands/mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../../../../commands/mutations/remove-sheet.mutation';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../../models/range-protection-rule.model';
import { RangeProtectionPermissionEditPoint } from '../../permission-point/range/edit';
import { WorksheetEditPermission } from '../../permission-point/worksheet/edit';
import { WorksheetViewPermission } from '../../permission-point/worksheet/view';
import { WorksheetProtectionPointModel } from '../worksheet-permission-point.model';
import { WorksheetProtectionRuleModel } from '../worksheet-permission-rule.model';
import { POINT_MODEL_PLUGIN_NAME, RULE_MODEL_PLUGIN_NAME, WorksheetPermissionService } from '../worksheet-permission.service';

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

const worksheetRule = (subUnitId: string, permissionId: string): IWorksheetProtectionRule => ({
    permissionId,
    unitType: UnitObject.Worksheet,
    unitId: 'test',
    subUnitId,
    viewState: ViewStateEnum.OthersCanView,
    editState: EditStateEnum.OnlyMe,
});

describe('WorksheetPermissionService', () => {
    let univer: Univer;
    let workbook: Workbook;
    let commandService: ICommandService;
    let permissionService: IPermissionService;
    let resourceManager: IResourceManagerService;
    let worksheetRuleModel: WorksheetProtectionRuleModel;
    let worksheetPointModel: WorksheetProtectionPointModel;
    let rangeRuleModel: RangeProtectionRuleModel;
    let publications: Array<{ id: string; value: boolean }>;
    let publicationSubscription: Subscription;

    const editPoint = (subUnitId: string) => new WorksheetEditPermission('test', subUnitId);

    beforeEach(() => {
        publications = [];
        const testBed = createCommandTestBed(workbookData, undefined, (injector) => {
            const permissionOwner = injector.get(WorksheetPermissionService);
            expect(permissionOwner.setWorksheetEditPermissionConstraint((worksheet) => worksheet.getConfig().type !== SheetTypes.CHART)).toBe(true);
            publicationSubscription = injector.get(IPermissionService).permissionPointUpdate$.subscribe((point) => {
                if (point instanceof WorksheetEditPermission) {
                    publications.push({ id: point.id, value: point.value });
                }
            });
        });
        univer = testBed.univer;
        workbook = testBed.sheet;
        commandService = testBed.get(ICommandService);
        permissionService = testBed.get(IPermissionService);
        resourceManager = testBed.get(IResourceManagerService);
        worksheetRuleModel = testBed.get(WorksheetProtectionRuleModel);
        worksheetPointModel = testBed.get(WorksheetProtectionPointModel);
        rangeRuleModel = testBed.get(RangeProtectionRuleModel);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(RemoveSheetMutation);
    });

    afterEach(() => {
        publicationSubscription.unsubscribe();
        univer.dispose();
    });

    it('publishes constrained edit points for existing and newly inserted chart sheets', () => {
        expect(publications).toContainEqual({ id: editPoint('chart').id, value: false });
        expect(publications).toContainEqual({ id: editPoint('grid').id, value: true });
        expect(permissionService.getPermissionPoint(editPoint('chart').id)?.value).toBe(false);
        expect(permissionService.getPermissionPoint(editPoint('grid').id)?.value).toBe(true);
        expect(commandService.syncExecuteCommand(InsertSheetMutation.id, {
            unitId: 'test',
            sheet: mergeWorksheetSnapshotWithDefault({ id: 'later-chart', name: 'Later chart', type: SheetTypes.CHART }),
        })).toBe(true);
        expect(publications).toContainEqual({ id: editPoint('later-chart').id, value: false });
    });

    it('removes worksheet and range points when the real worksheet is removed', () => {
        const rangeRule: IRangeProtectionRule = {
            id: 'range-rule',
            permissionId: 'range-permission',
            ranges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            unitType: UnitObject.SelectRange,
            unitId: 'test',
            subUnitId: 'grid',
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        };
        rangeRuleModel.addRule('test', 'grid', rangeRule);
        const rangePoint = new RangeProtectionPermissionEditPoint('test', 'grid', rangeRule.permissionId);
        expect(permissionService.addPermissionPoint(rangePoint)).toBe(true);
        expect(commandService.syncExecuteCommand(RemoveSheetMutation.id, { unitId: 'test', subUnitId: 'grid' })).toBe(true);
        expect(workbook.getSheetBySheetId('grid')).toBeUndefined();
        expect(permissionService.getPermissionPoint(editPoint('grid').id)).toBeUndefined();
        expect(permissionService.getPermissionPoint(new WorksheetViewPermission('test', 'grid').id)).toBeUndefined();
        expect(permissionService.getPermissionPoint(rangePoint.id)).toBeUndefined();
        expect(permissionService.getPermissionPoint(editPoint('chart').id)?.value).toBe(false);
    });

    it('combines rule updates with the chart constraint without transient allow', () => {
        worksheetRuleModel.addRule('test', worksheetRule('chart', 'chart-rule'));
        worksheetRuleModel.setRule('test', 'chart', worksheetRule('chart', 'revised-rule'));
        worksheetRuleModel.deleteRule('test', 'chart');
        permissionService.updatePermissionPoint(editPoint('chart').id, true);
        expect(publications.filter((point) => point.id === editPoint('chart').id).every((point) => point.value === false)).toBe(true);
        expect(permissionService.getPermissionPoint(editPoint('chart').id)?.value).toBe(false);
        expect(permissionService.getPermissionPoint(editPoint('grid').id)?.value).toBe(true);
    });

    it('round trips real worksheet resources and preserves chart denial on unload', () => {
        worksheetRuleModel.addRule('test', worksheetRule('grid', 'grid-rule'));
        worksheetPointModel.addRule({ unitId: 'test', subUnitId: 'grid', permissionId: 'grid-point-rule' });
        const resources = resourceManager.getResources('test', UniverInstanceType.UNIVER_SHEET);
        expect(resources.find((resource) => resource.name === RULE_MODEL_PLUGIN_NAME)?.data).toContain('grid-rule');
        expect(resources.find((resource) => resource.name === POINT_MODEL_PLUGIN_NAME)?.data).toContain('grid-point-rule');
        worksheetRuleModel.deleteRule('test', 'grid');
        worksheetPointModel.deleteRule('test', 'grid');
        resourceManager.loadResources('test', resources);
        expect(worksheetRuleModel.getRule('test', 'grid')?.permissionId).toBe('grid-rule');
        expect(worksheetPointModel.getRule('test', 'grid')?.permissionId).toBe('grid-point-rule');
        resourceManager.unloadResources('test', UniverInstanceType.UNIVER_SHEET);
        expect(worksheetRuleModel.getRule('test', 'grid')).toBeUndefined();
        expect(worksheetPointModel.getRule('test', 'grid')).toBeUndefined();
        expect(permissionService.getPermissionPoint(editPoint('chart').id)?.value).toBe(false);
    });

    it('keeps the existing observable subject and denial when requested edit changes', () => {
        const chartPoint = editPoint('chart');
        const chartSubject = permissionService.getPermissionPoint$(chartPoint.id);
        const observations: boolean[] = [];
        const subscription = chartSubject?.subscribe((point) => observations.push(point.value));

        permissionService.updatePermissionPoint(chartPoint.id, false);
        permissionService.updatePermissionPoint(chartPoint.id, true);

        expect(permissionService.getPermissionPoint$(chartPoint.id)).toBe(chartSubject);
        expect(permissionService.getPermissionPoint(chartPoint.id)?.value).toBe(false);
        expect(observations).toEqual([false, false, false]);
        subscription?.unsubscribe();
    });
});
