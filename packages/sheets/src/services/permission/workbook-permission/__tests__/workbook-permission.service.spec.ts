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

import type { Workbook } from '@univerjs/core';
import type { IRangeProtectionRule } from '../../../../models/range-protection-rule.model';
import { Injector, IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../../models/range-protection-rule.model';
import { WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '../../worksheet-permission';
import { WorkbookPermissionService } from '../workbook-permission.service';

class TestPermissionService {
    readonly addedPermissionIds: string[] = [];
    readonly deletedPermissionIds: string[] = [];

    addPermissionPoint(point: { id: string }) {
        this.addedPermissionIds.push(point.id);
        return true;
    }

    deletePermissionPoint(id: string) {
        this.deletedPermissionIds.push(id);
    }
}

class TestUniverInstanceService {
    readonly sheetAdded$ = new Subject<{ unit: Workbook }>();
    readonly sheetDisposed$ = new Subject<Workbook>();

    getAllUnitsForType(): Workbook[] {
        return [];
    }

    getTypeOfUnitAdded$(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? this.sheetAdded$ : new Subject<{ unit: Workbook }>();
    }

    getTypeOfUnitDisposed$(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? this.sheetDisposed$ : new Subject<Workbook>();
    }
}

describe('WorkbookPermissionService', () => {
    let service: WorkbookPermissionService;
    let permissionService: TestPermissionService;
    let univerInstanceService: TestUniverInstanceService;
    let rangeRuleModel: RangeProtectionRuleModel;
    let worksheetRuleModel: WorksheetProtectionRuleModel;
    let worksheetPointModel: WorksheetProtectionPointModel;

    const createWorkbook = (unitId = 'book-1') => ({
        getUnitId: () => unitId,
        getSheets: () => [{ getSheetId: () => 'sheet-1' }],
    }) as unknown as Workbook;

    const rangeRule: IRangeProtectionRule = {
        id: 'range-rule-1',
        permissionId: 'range-perm-1',
        ranges: [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }],
        unitType: UnitObject.SelectRange,
        unitId: 'book-1',
        subUnitId: 'sheet-1',
        viewState: ViewStateEnum.OthersCanView,
        editState: EditStateEnum.OnlyMe,
    };

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IPermissionService, { useClass: TestPermissionService as never }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([RangeProtectionRuleModel]);
        injector.add([WorksheetProtectionRuleModel]);
        injector.add([WorksheetProtectionPointModel]);
        injector.add([WorkbookPermissionService]);

        permissionService = injector.get(IPermissionService) as unknown as TestPermissionService;
        univerInstanceService = injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService;
        rangeRuleModel = injector.get(RangeProtectionRuleModel);
        worksheetRuleModel = injector.get(WorksheetProtectionRuleModel);
        worksheetPointModel = injector.get(WorksheetProtectionPointModel);
        service = injector.get(WorkbookPermissionService);
    });

    it('registers workbook permission points when a workbook is added', () => {
        univerInstanceService.sheetAdded$.next({ unit: createWorkbook() });

        expect(permissionService.addedPermissionIds.length).toBeGreaterThan(0);
        expect(permissionService.addedPermissionIds.every((id) => id.includes('book-1'))).toBe(true);
    });

    it('publishes workbook permission initialization state changes', () => {
        const states: boolean[] = [];
        service.unitPermissionInitStateChange$.subscribe((state) => states.push(state));

        service.changeUnitInitState(true);

        expect(states).toEqual([false, true]);
    });

    it('deletes workbook, worksheet, and range permission points when a workbook is disposed', () => {
        rangeRuleModel.addRule('book-1', 'sheet-1', rangeRule);
        worksheetRuleModel.addRule('book-1', {
            permissionId: 'worksheet-rule-perm',
            unitType: UnitObject.Worksheet,
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        worksheetPointModel.addRule({ unitId: 'book-1', subUnitId: 'sheet-1', permissionId: 'worksheet-point-perm' });

        univerInstanceService.sheetDisposed$.next(createWorkbook());

        expect(permissionService.deletedPermissionIds.some((id) => id.includes('range-perm-1'))).toBe(true);
        expect(permissionService.deletedPermissionIds.some((id) => id.includes('sheet-1'))).toBe(true);
        expect(permissionService.deletedPermissionIds.some((id) => id.includes('book-1'))).toBe(true);
        expect(rangeRuleModel.getSubunitRuleList('book-1', 'sheet-1')).toEqual([]);
        expect(worksheetRuleModel.getRule('book-1', 'sheet-1')).toBeUndefined();
        expect(worksheetPointModel.getRule('book-1', 'sheet-1')).toBeUndefined();
    });
});
