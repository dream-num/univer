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

import type { Univer, Workbook } from '@univerjs/core';
import { IPermissionService, IUniverInstanceService, Tools, UniverInstanceType } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import {
    EditStateEnum,
    RangeProtectionPermissionEditPoint,
    RangeProtectionRuleModel,
    SheetsSelectionsService,
    ViewStateEnum,
} from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';
import { clipboardTestBed } from '../../../services/clipboard/__tests__/clipboard-test-bed';
import { ISheetClipboardService } from '../../../services/clipboard/clipboard.service';
import { SHEET_PERMISSION_PASTE_PLUGIN, SheetPermissionInterceptorClipboardController } from '../sheet-permission-interceptor-clipboard.controller';

describe('SheetPermissionInterceptorClipboardController', () => {
    let univer: Univer;

    afterEach(() => univer.dispose());

    it.each(['none', 'source', 'peer'] as const)('checks the original absolute paste range with protection on %s', (protectedTarget) => {
        const testBed = clipboardTestBed(undefined, [[SheetPermissionInterceptorClipboardController]]);
        univer = testBed.univer;
        const { get } = testBed;
        const controller = get(SheetPermissionInterceptorClipboardController);
        const instances = get(IUniverInstanceService);
        const source = instances.getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!;
        instances.createUnit(UniverInstanceType.UNIVER_SHEET, { ...Tools.deepClone(source.getSnapshot()), id: 'peer' });
        instances.setCurrentUnitForType('peer');
        get(SheetsSelectionsService).setSelections('peer', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
        if (protectedTarget !== 'none') {
            const unitId = protectedTarget === 'source' ? 'test' : 'peer';
            const permissionId = 'protected-paste-cell';
            get(RangeProtectionRuleModel).addRule(unitId, 'sheet1', {
                unitId,
                subUnitId: 'sheet1',
                id: 'rule',
                permissionId,
                ranges: [{ startRow: 6, endRow: 6, startColumn: 8, endColumn: 8 }],
                unitType: UnitObject.SelectRange,
                viewState: ViewStateEnum.OthersCanView,
                editState: EditStateEnum.OnlyMe,
            });
            const point = new RangeProtectionPermissionEditPoint(unitId, 'sheet1', permissionId);
            get(IPermissionService).addPermissionPoint(point);
            get(IPermissionService).updatePermissionPoint(point.id, false);
        }
        const clipboard = get(ISheetClipboardService);
        const hook = clipboard.getClipboardHooks().find((item) => item.id === SHEET_PERMISSION_PASTE_PLUGIN)!;
        expect(hook.onBeforePaste!({
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { rows: [5, 6], cols: [7, 8] },
        })).toBe(protectedTarget !== 'source');
        controller.dispose();
        expect(clipboard.getClipboardHooks().some((item) => item.id === SHEET_PERMISSION_PASTE_PLUGIN)).toBe(false);
    });
});
