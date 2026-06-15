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

import { DesktopLogService, ILogService, Injector, IPermissionService, IResourceManagerService, IUniverInstanceService } from '@univerjs/core';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RangeProtectionRuleModel } from '../../../../models/range-protection-rule.model';
import { WorksheetProtectionPointModel } from '../worksheet-permission-point.model';
import { WorksheetProtectionRuleModel } from '../worksheet-permission-rule.model';
import { WorksheetPermissionService } from '../worksheet-permission.service';

describe('WorksheetPermissionService', () => {
    let addedPermissionIds: string[];
    let ruleChange$: Subject<unknown>;

    beforeEach(() => {
        addedPermissionIds = [];
        ruleChange$ = new Subject();
        const sheetCreated$ = new Subject();
        const sheetDisposed$ = new Subject();
        const workbook = {
            getUnitId: () => 'book-1',
            getSheets: () => [{ getSheetId: () => 'sheet-1' }],
            sheetCreated$,
            sheetDisposed$,
        };
        const injector = new Injector();
        injector.add([IPermissionService, { useValue: {
            addPermissionPoint: (point: { id: string }) => {
                addedPermissionIds.push(point.id);
                return true;
            },
            deletePermissionPoint: vi.fn(),
            updatePermissionPoint: vi.fn(),
        } as unknown as IPermissionService }]);
        injector.add([IUniverInstanceService, { useValue: {
            getAllUnitsForType: () => [workbook],
            getTypeOfUnitAdded$: () => new Subject(),
            getTypeOfUnitDisposed$: () => new Subject(),
            getUnit: () => workbook,
        } as unknown as IUniverInstanceService }]);
        injector.add([WorksheetProtectionRuleModel, { useValue: { ruleChange$, toObject: () => ({}), fromObject: vi.fn(), changeRuleInitState: vi.fn(), deleteUnitModel: vi.fn() } as unknown as WorksheetProtectionRuleModel }]);
        injector.add([WorksheetProtectionPointModel, { useValue: { toObject: () => ({}), fromObject: vi.fn(), deleteUnitModel: vi.fn() } as unknown as WorksheetProtectionPointModel }]);
        injector.add([IResourceManagerService, { useValue: { registerPluginResource: vi.fn(() => ({ dispose: vi.fn() })) } as unknown as IResourceManagerService }]);
        injector.add([RangeProtectionRuleModel, { useValue: { getSubunitRuleList: () => [] } as unknown as RangeProtectionRuleModel }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([WorksheetPermissionService]);
        injector.get(WorksheetPermissionService);
    });

    it('registers worksheet permission points for existing sheets', () => {
        expect(addedPermissionIds.length).toBeGreaterThan(0);
        expect(addedPermissionIds.every((id) => id.includes('book-1') && id.includes('sheet-1'))).toBe(true);
    });
});
