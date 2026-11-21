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

import type { IRange, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISheetValueChangeContext } from '@univerjs/sheets';
import { IPermissionService, LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import {
    ExclusiveRangeService,
    IExclusiveRangeService,
    INumfmtService,
    NumfmtService,
    RangeProtectionRuleModel,
    SheetInterceptorService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { SheetTableAutoExpandService, TableManager } from '@univerjs/sheets-table';
import enUS from '@univerjs/sheets-table/locale/en-US';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NumfmtTableAutoExpandController } from '../numfmt-table-auto-expand.controller';

const original = { startRow: 2, endRow: 5, startColumn: 2, endColumn: 4 };
const next = { startRow: 6, endRow: 6, startColumn: 2, endColumn: 2 };

describe('NumfmtTableAutoExpandController', () => {
    let univer: Univer;
    let workbook: Workbook;
    let manager: TableManager;
    let service: SheetTableAutoExpandService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([TableManager]);
        injector.add([INumfmtService, { useClass: NumfmtService }]);
        injector.add([NumfmtTableAutoExpandController]);
        injector.add([RangeProtectionRuleModel]);
        injector.add([IExclusiveRangeService, { useClass: ExclusiveRangeService }]);
        injector.add([SheetInterceptorService]);
        injector.get(NumfmtTableAutoExpandController);
        injector.add([SheetTableAutoExpandService]);
        const locale = injector.get(LocaleService);
        locale.load({ enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'book',
            name: 'Auto expansion',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet'],
            sheets: { sheet: { id: 'sheet', name: 'Sheet', rowCount: 20, columnCount: 15, cellData: {} } },
        });
        const permissions = injector.get(IPermissionService);
        permissions.addPermissionPoint(new WorkbookEditablePermission('book'));
        permissions.addPermissionPoint(new WorksheetEditPermission('book', 'sheet'));
        manager = injector.get(TableManager);
        manager.addTable('book', 'sheet', 'Orders', original, ['Item', 'Qty', 'Total'], 'orders');
        service = injector.get(SheetTableAutoExpandService);
        injector.get(NumfmtTableAutoExpandController);
    });

    afterEach(() => univer.dispose());

    function context(target: IRange = next): ISheetValueChangeContext {
        const ctx: ISheetValueChangeContext = {
            unitId: 'book',
            subUnitId: 'sheet',
            source: 'paste',
            ranges: [target],
            contentWrites: { [target.startRow]: { [target.startColumn]: { v: 'New' } } },
            beforeCells: { [target.startRow]: { [target.startColumn]: null } },
            explicitStyleRanges: [],
            explicitValidationRanges: [],
        };
        univer.__getInjector().get(SheetInterceptorService).onValueChange(ctx);
        return ctx;
    }

    function setPattern(row: number, pattern: string) {
        workbook.getActiveSheet()!.getCellMatrix().setValue(row, 3, { v: row, s: { n: { pattern } } });
    }

    it('extends consistent number formats with native redo and undo', () => {
        [3, 4, 5].forEach((row) => setPattern(row, '$0.00'));
        const patch = service.prepare(context())[0];
        expect(patch.redoEffects).toMatchObject([{ params: { values: { 0: { ranges: [{ startRow: 6, endRow: 6, startColumn: 3, endColumn: 3 }] } }, refMap: { 0: { pattern: '$0.00' } } } }]);
        expect(patch.undoEffects).toMatchObject([{ params: { ranges: [{ startRow: 6, endRow: 6, startColumn: 3, endColumn: 3 }] } }]);
    });

    it('does not infer mixed formats or copy a neighbor into a new column', () => {
        [3, 4, 5].forEach((row) => setPattern(row, row === 4 ? '0%' : '$0.00'));
        expect(service.prepare(context())[0].redoEffects).toEqual([]);
        expect(service.prepare(context({ startRow: 3, endRow: 3, startColumn: 5, endColumn: 5 }))[0].redoEffects).toEqual([]);
    });

    it.each(['editor', 'paste', 'fill'] as const)('preserves an existing format on a blank expansion cell for %s', (source) => {
        manager.getTable('book', 'orders')!.getTableColumnByIndex(1)!.style = { n: { pattern: '$0.00' } };
        workbook.getActiveSheet()!.getCellMatrix().setValue(6, 3, { s: { n: { pattern: '0%' } } });
        const ctx = context();
        ctx.source = source;
        expect(service.prepare(ctx)[0].redoEffects).toEqual([]);
        expect(univer.__getInjector().get(INumfmtService).getValue('book', 'sheet', 6, 3)?.pattern).toBe('0%');
    });

    it('prefers an explicit column format and preserves explicitly pasted formats', () => {
        manager.getTable('book', 'orders')!.getTableColumnByIndex(1)!.style = { n: { pattern: '0%' } };
        expect(service.prepare(context())[0].redoEffects).toMatchObject([{ params: { refMap: { 0: { pattern: '0%' } } } }]);
        const ctx = context();
        ctx.explicitStyleRanges = [{ ...next, startColumn: 3, endColumn: 3 }];
        expect(service.prepare(ctx)[0].redoEffects).toEqual([]);
    });
});
