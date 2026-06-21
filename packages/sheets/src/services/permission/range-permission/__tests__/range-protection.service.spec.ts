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

import type { IDisposable, IPermissionPoint, IRange, Workbook } from '@univerjs/core';
import type { IRangeProtectionRule } from '../../../../models/range-protection-rule.model';
import { Injector, IPermissionService, IResourceManagerService, IUniverInstanceService } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../../models/range-protection-rule.model';
import { RangeProtectionCache } from '../../../../models/range-protection.cache';
import { RangeProtectionService } from '../range-protection.service';

class TestPermissionService {
    readonly permissionPointUpdate$ = new Subject<unknown>();
    readonly addedPermissionIds: string[] = [];
    readonly deletedPermissionIds: string[] = [];
    readonly updatedPermissionPoints: Array<{ id: string; value: unknown }> = [];
    readonly permissionPoints = new Map<string, IPermissionPoint<boolean>>();

    addPermissionPoint(point: IPermissionPoint<boolean>) {
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

    updatePermissionPoint(permissionId: string, value: boolean) {
        const point = this.permissionPoints.get(permissionId);
        if (point) {
            point.value = value;
        }
        this.updatedPermissionPoints.push({ id: permissionId, value });
        return true;
    }

    getPermissionPoint(permissionId: string): IPermissionPoint<boolean> | undefined {
        return this.permissionPoints.get(permissionId);
    }

    getPermissionPoint$(permissionId: string) {
        return of(this.getPermissionPoint(permissionId));
    }

    clearPermissionMap() {
        this.addedPermissionIds.length = 0;
        this.deletedPermissionIds.length = 0;
        this.updatedPermissionPoints.length = 0;
        this.permissionPoints.clear();
    }

    composePermission(permissionIds: string[]) {
        return permissionIds.map((id) => this.getPermissionPoint(id));
    }

    composePermission$(permissionIds: string[]) {
        return of(this.composePermission(permissionIds));
    }

    getAllPermissionPoint() {
        return new Map();
    }

    getShowComponents() {
        return true;
    }

    setShowComponents() {
        return undefined;
    }
}

class TestResourceManagerService {
    registeredResource!: {
        toJson: (unitId: string) => string;
        parseJson: (json: string) => unknown;
        onLoad: (unitId: string, resources: Record<string, IRangeProtectionRule[]>) => void;
        onUnLoad: (unitId: string) => void;
    };

    registerPluginResource(resource: TestResourceManagerService['registeredResource']): IDisposable {
        this.registeredResource = resource;
        return { dispose: vi.fn() };
    }
}

class TestUniverInstanceService {
    getAllUnitsForType(): Workbook[] {
        return [];
    }

    getUnit(): Workbook | null {
        return null;
    }
}

describe('RangeProtectionService', () => {
    let ruleModel: RangeProtectionRuleModel;
    let permissionService: TestPermissionService;
    let resourceManagerService: TestResourceManagerService;
    let cache: RangeProtectionCache;

    const createRule = (id: string, permissionId: string, ranges: IRange[] = [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }]): IRangeProtectionRule => ({
        id,
        permissionId,
        ranges,
        unitType: UnitObject.SelectRange,
        unitId: 'book-1',
        subUnitId: 'sheet-1',
        viewState: ViewStateEnum.OthersCanView,
        editState: EditStateEnum.OnlyMe,
    });

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IPermissionService, { useClass: TestPermissionService as never }]);
        injector.add([IResourceManagerService, { useClass: TestResourceManagerService as never }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([RangeProtectionRuleModel]);
        injector.add([RangeProtectionCache]);
        injector.add([RangeProtectionService]);

        permissionService = injector.get(IPermissionService) as unknown as TestPermissionService;
        resourceManagerService = injector.get(IResourceManagerService) as unknown as TestResourceManagerService;
        ruleModel = injector.get(RangeProtectionRuleModel);
        cache = injector.get(RangeProtectionCache);
        vi.spyOn(cache, 'reBuildCache');
        vi.spyOn(cache, 'deleteUnit');
        injector.get(RangeProtectionService);
    });

    it('adds and removes range permission points when protection rules change', () => {
        const rule = createRule('rule-1', 'perm-1');

        ruleModel.addRule('book-1', 'sheet-1', rule);
        ruleModel.deleteRule('book-1', 'sheet-1', 'rule-1');

        expect(permissionService.addedPermissionIds.every((id) => id.includes('perm-1'))).toBe(true);
        expect(permissionService.deletedPermissionIds).toEqual(permissionService.addedPermissionIds);
    });

    it('replaces permission points when a range rule moves to a new permission id', () => {
        const oldRule = createRule('rule-1', 'old-perm');
        const newRule = createRule('rule-1', 'new-perm');

        ruleModel.addRule('book-1', 'sheet-1', oldRule);
        permissionService.addedPermissionIds.length = 0;
        ruleModel.setRule('book-1', 'sheet-1', 'rule-1', newRule);

        expect(permissionService.deletedPermissionIds.every((id) => id.includes('old-perm'))).toBe(true);
        expect(permissionService.addedPermissionIds.every((id) => id.includes('new-perm'))).toBe(true);
    });

    it('restores range protection snapshot and rebuilds cache for loaded sheets', () => {
        const loadedRule = createRule('loaded-rule', 'perm-loaded');
        ruleModel.addRule('book-1', 'sheet-1', createRule('json-rule', 'perm-json'));

        expect(resourceManagerService.registeredResource.toJson('book-1')).toContain('perm-json');
        expect(resourceManagerService.registeredResource.toJson('missing')).toBe('');
        expect(resourceManagerService.registeredResource.parseJson('')).toEqual({});
        expect(resourceManagerService.registeredResource.parseJson('{bad json')).toEqual({});
        expect(resourceManagerService.registeredResource.parseJson('{"sheet-1":[]}')).toEqual({ 'sheet-1': [] });

        permissionService.addedPermissionIds.length = 0;
        resourceManagerService.registeredResource.onLoad('book-2', { 'sheet-2': [loadedRule] });

        expect(ruleModel.getRule('book-2', 'sheet-2', 'loaded-rule')).toEqual(loadedRule);
        expect(permissionService.addedPermissionIds.every((id) => id.includes('perm-loaded'))).toBe(true);
        expect(cache.reBuildCache).toHaveBeenCalledWith('book-2', 'sheet-2');

        resourceManagerService.registeredResource.onUnLoad('book-2');
        expect(cache.deleteUnit).toHaveBeenCalledWith('book-2');
    });

    it('updates existing range permission points when snapshot resources load', () => {
        const rule = createRule('rule-1', 'perm-existing');
        ruleModel.addRule('book-1', 'sheet-1', rule);
        const existingAddCount = permissionService.addedPermissionIds.length;

        resourceManagerService.registeredResource.onLoad('book-1', { 'sheet-1': [rule] });

        expect(permissionService.addedPermissionIds.length).toBe(existingAddCount);
        expect(permissionService.updatedPermissionPoints.length).toBeGreaterThan(0);
        expect(permissionService.updatedPermissionPoints.every((item) => item.id.includes('perm-existing') && item.value === false)).toBe(true);
    });
});
