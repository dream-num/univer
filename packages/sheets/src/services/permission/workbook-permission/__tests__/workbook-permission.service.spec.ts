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

import { Injector, IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RangeProtectionRuleModel } from '../../../../models/range-protection-rule.model';
import { WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '../../worksheet-permission';
import { WorkbookPermissionService } from '../workbook-permission.service';

describe('WorkbookPermissionService', () => {
    let service: WorkbookPermissionService;
    let addedPermissionIds: string[];
    let sheetAdded$: Subject<unknown>;
    let sheetDisposed$: Subject<unknown>;

    beforeEach(() => {
        addedPermissionIds = [];
        sheetAdded$ = new Subject();
        sheetDisposed$ = new Subject();
        const injector = new Injector();
        injector.add([IPermissionService, { useValue: {
            addPermissionPoint: (point: { id: string }) => {
                addedPermissionIds.push(point.id);
                return true;
            },
            deletePermissionPoint: vi.fn(),
        } as unknown as IPermissionService }]);
        injector.add([IUniverInstanceService, { useValue: {
            getAllUnitsForType: () => [],
            getTypeOfUnitAdded$: (type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SHEET ? sheetAdded$ : new Subject(),
            getTypeOfUnitDisposed$: (type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SHEET ? sheetDisposed$ : new Subject(),
        } as unknown as IUniverInstanceService }]);
        injector.add([RangeProtectionRuleModel, { useValue: { getSubunitRuleList: () => [], deleteUnitModel: vi.fn() } as unknown as RangeProtectionRuleModel }]);
        injector.add([WorksheetProtectionRuleModel, { useValue: { deleteUnitModel: vi.fn() } as unknown as WorksheetProtectionRuleModel }]);
        injector.add([WorksheetProtectionPointModel, { useValue: { deleteUnitModel: vi.fn() } as unknown as WorksheetProtectionPointModel }]);
        injector.add([WorkbookPermissionService]);
        service = injector.get(WorkbookPermissionService);
    });

    it('registers workbook permission points when a workbook is added', () => {
        sheetAdded$.next({ unit: { getUnitId: () => 'book-1' } });

        expect(addedPermissionIds.length).toBeGreaterThan(0);
        expect(addedPermissionIds.every((id) => id.includes('book-1'))).toBe(true);
    });

    it('publishes workbook permission initialization state changes', () => {
        const states: boolean[] = [];
        service.unitPermissionInitStateChange$.subscribe((state) => states.push(state));

        service.changeUnitInitState(true);

        expect(states).toEqual([false, true]);
    });
});
