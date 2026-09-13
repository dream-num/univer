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

import type { IDisposable, Workbook, Worksheet } from '@univerjs/core';
import type {
    IRangeProtectionRule,
    EditStateEnum as RangeEditStateEnum,
} from '../../../../models/range-protection-rule.model';
import type { IObjectModel, IObjectPointModel } from '../../type';
import {
    DesktopLogService,
    ILogService,
    Injector,
    IPermissionService,
    IResourceManagerService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    EditStateEnum,
    RangeProtectionRuleModel,
    ViewStateEnum,
} from '../../../../models/range-protection-rule.model';
import { WorksheetProtectionPointModel } from '../worksheet-permission-point.model';
import { WorksheetProtectionRuleModel } from '../worksheet-permission-rule.model';
import { WorksheetPermissionService } from '../worksheet-permission.service';

class TestPermissionService {
    readonly addedPermissionIds: string[] = [];
    readonly deletedPermissionIds: string[] = [];
    readonly updatedPermissionPoints: Array<{ id: string; value: unknown }> = [];
    readonly permissionPoints = new Map<string, { id: string; value?: unknown }>();

    addPermissionPoint(point: { id: string; value?: unknown }) {
        if (this.permissionPoints.has(point.id)) {
            return false;
        }
        this.permissionPoints.set(point.id, point);
        this.addedPermissionIds.push(point.id);
        return true;
    }

    deletePermissionPoint(id: string) {
        this.deletedPermissionIds.push(id);
    }

    updatePermissionPoint(id: string, value: unknown) {
        const point = this.permissionPoints.get(id);
        if (point) {
            point.value = value;
        }
        this.updatedPermissionPoints.push({ id, value });
        return true;
    }

    getPermissionPoint(id: string) {
        return this.permissionPoints.get(id);
    }
}

class TestResourceManagerService {
    readonly resources: Array<{
        pluginName: string;
        toJson: () => string;
        parseJson: (json: string) => IObjectModel | IObjectPointModel;
        onLoad: (unitId: string, resources: IObjectModel | IObjectPointModel) => void;
        onUnLoad: (unitId: string) => void;
    }> = [];

    registerPluginResource(resource: TestResourceManagerService['resources'][number]): IDisposable {
        this.resources.push(resource);
        return { dispose: vi.fn() };
    }
}

class TestUniverInstanceService {
    readonly unitAdded$ = new Subject<{ unit: Workbook }>();
    readonly unitDisposed$ = new Subject<Workbook>();
    workbook!: Workbook;

    getAllUnitsForType(): Workbook[] {
        return [this.workbook];
    }

    getTypeOfUnitAdded$(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? this.unitAdded$ : new Subject<{ unit: Workbook }>();
    }

    getTypeOfUnitDisposed$(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? this.unitDisposed$ : new Subject<Workbook>();
    }

    getUnit(unitId: string): Workbook | undefined {
        return this.workbook.getUnitId() === unitId ? this.workbook : undefined;
    }
}

describe('WorksheetPermissionService', () => {
    let permissionService: TestPermissionService;
    let resourceManagerService: TestResourceManagerService;
    let univerInstanceService: TestUniverInstanceService;
    let worksheetRuleModel: WorksheetProtectionRuleModel;
    let worksheetPointModel: WorksheetProtectionPointModel;
    let rangeRuleModel: RangeProtectionRuleModel;
    let sheetCreated$: Subject<Worksheet>;
    let sheetDisposed$: Subject<Worksheet>;

    const createWorksheet = (sheetId: string) => ({ getSheetId: () => sheetId }) as unknown as Worksheet;
    const createWorkbook = (sheetIds = ['sheet-1']) => {
        sheetCreated$ = new Subject<Worksheet>();
        sheetDisposed$ = new Subject<Worksheet>();
        return {
            getUnitId: () => 'book-1',
            getSheets: () => sheetIds.map(createWorksheet),
            sheetCreated$,
            sheetDisposed$,
        } as unknown as Workbook;
    };

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IPermissionService, { useClass: TestPermissionService as never }]);
        injector.add([IResourceManagerService, { useClass: TestResourceManagerService as never }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([WorksheetProtectionRuleModel]);
        injector.add([WorksheetProtectionPointModel]);
        injector.add([RangeProtectionRuleModel]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([WorksheetPermissionService]);

        permissionService = injector.get(IPermissionService) as unknown as TestPermissionService;
        resourceManagerService = injector.get(IResourceManagerService) as unknown as TestResourceManagerService;
        univerInstanceService = injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService;
        worksheetRuleModel = injector.get(WorksheetProtectionRuleModel);
        worksheetPointModel = injector.get(WorksheetProtectionPointModel);
        rangeRuleModel = injector.get(RangeProtectionRuleModel);
        univerInstanceService.workbook = createWorkbook();
        injector.get(WorksheetPermissionService);
    });

    it('registers worksheet permission points for existing and newly created sheets', () => {
        expect(permissionService.addedPermissionIds.length).toBeGreaterThan(0);
        expect(permissionService.addedPermissionIds.every((id) => id.includes('book-1') && id.includes('sheet-1'))).toBe(true);

        permissionService.addedPermissionIds.length = 0;
        sheetCreated$.next(createWorksheet('sheet-2'));

        expect(permissionService.addedPermissionIds.length).toBeGreaterThan(0);
        expect(permissionService.addedPermissionIds.every((id) => id.includes('book-1') && id.includes('sheet-2'))).toBe(true);
    });

    it('removes worksheet and range permission points when a worksheet is disposed', () => {
        const rangeRule: IRangeProtectionRule = {
            id: 'range-rule-1',
            permissionId: 'range-perm-1',
            ranges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            unitType: UnitObject.SelectRange,
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            viewState: ViewStateEnum.OthersCanView as ViewStateEnum,
            editState: EditStateEnum.OnlyMe as RangeEditStateEnum,
        };
        rangeRuleModel.addRule('book-1', 'sheet-1', rangeRule);

        sheetDisposed$.next(createWorksheet('sheet-1'));

        expect(permissionService.deletedPermissionIds.some((id) => id.includes('range-perm-1'))).toBe(true);
        expect(permissionService.deletedPermissionIds.some((id) => id.includes('book-1') && id.includes('sheet-1'))).toBe(true);
    });

    it('updates worksheet permission points when protection rules are changed or removed', () => {
        const rule = {
            permissionId: 'worksheet-perm-1',
            unitType: UnitObject.Worksheet,
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        };

        worksheetRuleModel.addRule('book-1', rule);
        worksheetRuleModel.setRule('book-1', 'sheet-1', { ...rule, permissionId: 'worksheet-perm-2' });
        worksheetRuleModel.deleteRule('book-1', 'sheet-1');

        expect(permissionService.updatedPermissionPoints.some((item) => item.value === true)).toBe(true);
        expect(permissionService.updatedPermissionPoints.some((item) => item.value !== true)).toBe(true);
    });

    it('restores worksheet rule and point snapshots and removes resources on unload', () => {
        const ruleResource = resourceManagerService.resources[0];
        const pointResource = resourceManagerService.resources[1];
        const worksheetRule = {
            permissionId: 'worksheet-perm-1',
            unitType: UnitObject.Worksheet,
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        };
        const worksheetPoint = { unitId: 'book-1', subUnitId: 'sheet-1', permissionId: 'worksheet-point-1' };

        worksheetRuleModel.addRule('book-1', worksheetRule);
        worksheetPointModel.addRule(worksheetPoint);
        expect(ruleResource.toJson()).toContain('worksheet-perm-1');
        expect(pointResource.toJson()).toContain('worksheet-point-1');
        expect(ruleResource.parseJson('')).toEqual({});
        expect(pointResource.parseJson('{bad json')).toEqual({});

        permissionService.addedPermissionIds.length = 0;
        ruleResource.onLoad('book-1', { 'book-1': [{ ...worksheetRule, subUnitId: 'sheet-2' }] });
        pointResource.onLoad('book-1', { 'book-1': [{ unitId: 'book-1', subUnitId: 'sheet-2', permissionId: 'worksheet-point-2' }] });

        expect(worksheetRuleModel.getRule('book-1', 'sheet-2')?.permissionId).toBe('worksheet-perm-1');
        expect(worksheetPointModel.getRule('book-1', 'sheet-2')?.permissionId).toBe('worksheet-point-2');
        expect(permissionService.addedPermissionIds.some((id) => id.includes('book-1'))).toBe(true);

        ruleResource.onUnLoad('book-1');
        pointResource.onUnLoad('book-1');
        expect(worksheetRuleModel.getRule('book-1', 'sheet-1')).toBeUndefined();
        expect(worksheetPointModel.getRule('book-1', 'sheet-2')).toBeUndefined();
        expect(permissionService.deletedPermissionIds.some((id) => id.includes('book-1') && id.includes('sheet-1'))).toBe(true);
    });

    it('updates existing worksheet permission points when rule resources load', () => {
        const ruleResource = resourceManagerService.resources[0];
        const existingAddCount = permissionService.addedPermissionIds.length;

        ruleResource.onLoad('book-1', {
            'sheet-1': [{
                permissionId: 'worksheet-perm-1',
                unitType: UnitObject.Worksheet,
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                viewState: ViewStateEnum.OthersCanView,
                editState: EditStateEnum.OnlyMe,
            }],
        });

        expect(permissionService.addedPermissionIds.length).toBe(existingAddCount);
        expect(permissionService.updatedPermissionPoints.length).toBeGreaterThan(0);
        expect(permissionService.updatedPermissionPoints.every((item) => item.id.includes('book-1') && item.id.includes('sheet-1') && item.value === false)).toBe(true);
    });
});
