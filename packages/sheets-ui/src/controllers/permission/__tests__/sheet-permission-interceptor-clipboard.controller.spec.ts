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
import {
    CustomCommandExecutionError,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import {
    EditStateEnum,
    RangeProtectionPermissionEditPoint,
    RangeProtectionRuleModel,
    SheetPermissionCheckController,
    SheetsSelectionsService,
    ViewStateEnum,
    WorkbookInsertRowPermission,
    WorksheetInsertColumnPermission,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { clipboardTestBed } from '../../../services/clipboard/__tests__/clipboard-test-bed';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE } from '../../../services/clipboard/clipboard.service';
import {
    SHEET_PERMISSION_PASTE_PLUGIN,
    SheetPermissionInterceptorClipboardController,
} from '../sheet-permission-interceptor-clipboard.controller';

describe('SheetPermissionInterceptorClipboardController', () => {
    let univer: Univer;

    afterEach(() => univer.dispose());

    it.each(['none', 'source', 'peer'] as const)('checks the original absolute paste range with protection on %s', (protectedTarget) => {
        const testBed = clipboardTestBed(undefined, [[SheetPermissionInterceptorClipboardController]]);
        univer = testBed.univer;
        const { get } = testBed;
        const localeService = get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        get(SheetPermissionInterceptorClipboardController);
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
        const messages: string[] = [];
        const subscription = get(SheetPermissionCheckController).triggerPermissionUIEvent$.subscribe((message) => messages.push(message));
        const paste = () => hook.onBeforePaste!({
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { rows: [5, 6], cols: [7, 8] },
        });
        if (protectedTarget === 'source') {
            expect(paste).toThrow(CustomCommandExecutionError);
            expect(messages).toEqual([enUS['sheets-ui'].permission.dialog.pasteErr]);
        } else {
            expect(paste()).toBe(true);
            expect(messages).toEqual([]);
        }
        subscription.unsubscribe();
    });

    it('checks current write and insertion permissions against the expanded clipboard target', () => {
        const bed = clipboardTestBed(undefined, [[SheetPermissionInterceptorClipboardController]]);
        univer = bed.univer;
        const { get, sheet } = bed;
        get(SheetPermissionInterceptorClipboardController);
        const worksheet = sheet.getActiveSheet();
        const unitId = sheet.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const value = new WorksheetSetCellValuePermission(unitId, subUnitId);
        const insertRow = new WorkbookInsertRowPermission(unitId);
        const insertCol = new WorksheetInsertColumnPermission(unitId, subUnitId);
        const permissions = get(IPermissionService);
        for (const point of [value, insertRow, insertCol]) {
            permissions.addPermissionPoint(point);
            permissions.updatePermissionPoint(point.id, false);
        }
        const locale = get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const clipboard = get(ISheetClipboardService);
        const hook = clipboard.getClipboardHooks().find((item) => item.id === SHEET_PERMISSION_PASTE_PLUGIN)!;
        const beforePaste = (row: number, col: number) => hook.onBeforePaste!({
            unitId,
            subUnitId,
            range: { rows: [row], cols: [col] },
        }, { pasteType: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE });
        expect(() => beforePaste(0, 0)).toThrow(CustomCommandExecutionError);
        permissions.updatePermissionPoint(value.id, true);
        expect(beforePaste(0, 0)).toBe(true);
        expect(() => beforePaste(worksheet.getMaxRows(), 0)).toThrow(CustomCommandExecutionError);
        expect(() => beforePaste(0, worksheet.getMaxColumns())).toThrow(CustomCommandExecutionError);
    });
});
