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

import { Injector, IPermissionService, IResourceManagerService, IUniverInstanceService } from '@univerjs/core';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RangeProtectionRuleModel } from '../../../../models/range-protection-rule.model';
import { RangeProtectionCache } from '../../../../models/range-protection.cache';
import { RangeProtectionService } from '../range-protection.service';

describe('RangeProtectionService', () => {
    let ruleChange$: Subject<unknown>;
    let addedPermissionIds: string[];
    let deletedPermissionIds: string[];

    beforeEach(() => {
        ruleChange$ = new Subject();
        addedPermissionIds = [];
        deletedPermissionIds = [];
        const injector = new Injector();
        injector.add([RangeProtectionRuleModel, { useValue: { ruleChange$, toObject: () => ({}), fromObject: vi.fn(), getSubunitRuleList: () => [] } as unknown as RangeProtectionRuleModel }]);
        injector.add([IPermissionService, { useValue: {
            addPermissionPoint: (point: { id: string }) => {
                addedPermissionIds.push(point.id);
                return true;
            },
            deletePermissionPoint: (id: string) => deletedPermissionIds.push(id),
        } as unknown as IPermissionService }]);
        injector.add([IResourceManagerService, { useValue: { registerPluginResource: vi.fn(() => ({ dispose: vi.fn() })) } as unknown as IResourceManagerService }]);
        injector.add([RangeProtectionCache, { useValue: { reBuildCache: vi.fn(), deleteUnit: vi.fn() } as unknown as RangeProtectionCache }]);
        injector.add([IUniverInstanceService, { useValue: {} as IUniverInstanceService }]);
        injector.add([RangeProtectionService]);
        injector.get(RangeProtectionService);
    });

    it('adds and removes range permission points when protection rules change', () => {
        ruleChange$.next({ type: 'add', unitId: 'book-1', subUnitId: 'sheet-1', rule: { permissionId: 'perm-1' } });
        ruleChange$.next({ type: 'delete', unitId: 'book-1', subUnitId: 'sheet-1', rule: { permissionId: 'perm-1' } });

        expect(addedPermissionIds.every((id) => id.includes('perm-1'))).toBe(true);
        expect(deletedPermissionIds).toEqual(addedPermissionIds);
    });
});
