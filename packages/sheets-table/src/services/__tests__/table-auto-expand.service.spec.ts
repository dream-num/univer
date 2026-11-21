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

import type { ICellData, IRange, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISheetValueChangeContext } from '@univerjs/sheets';
import {
    BooleanNumber,
    IPermissionService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    EditStateEnum,
    ExclusiveRangeService,
    IExclusiveRangeService,
    RangeProtectionPermissionEditPoint,
    RangeProtectionRuleModel,
    ViewStateEnum,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../locale/en-US';
import { TableManager } from '../../models/table-manager';
import { SheetTableAutoExpandService } from '../table-auto-expand.service';

const original = { startRow: 2, endRow: 5, startColumn: 2, endColumn: 4 };
const next = { startRow: 6, endRow: 6, startColumn: 2, endColumn: 2 };

describe('SheetTableAutoExpandService', () => {
    let univer: Univer;
    let workbook: Workbook;
    let manager: TableManager;
    let service: SheetTableAutoExpandService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([TableManager]);
        injector.add([RangeProtectionRuleModel]);
        injector.add([IExclusiveRangeService, { useClass: ExclusiveRangeService }]);
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
    });

    afterEach(() => univer.dispose());

    function context(target: IRange = next): ISheetValueChangeContext {
        return {
            unitId: 'book',
            subUnitId: 'sheet',
            source: 'paste',
            ranges: [target],
            contentWrites: { [target.startRow]: { [target.startColumn]: { v: 'New' } } },
            beforeCells: { [target.startRow]: { [target.startColumn]: null } },
            explicitStyleRanges: [],
            explicitValidationRanges: [],
        };
    }

    it('prepares the whole new strip without mutating the table', () => {
        const patches = service.prepare(context());
        expect(patches).toHaveLength(1);
        expect(patches[0].before.range).toEqual(original);
        expect(patches[0].after.range).toEqual({ ...original, endRow: 6 });
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(original);
    });

    it.each([{ v: 88 }, { f: '=""', v: '' }, { v: 0 }, { v: false }, { p: { id: 'note', documentStyle: {}, body: { dataStream: 'Note\r\n' } } }])('rejects preexisting content anywhere in the added strip: %o', (cell: ICellData) => {
        workbook.getActiveSheet()!.getCellMatrix().setValue(6, 4, cell);
        expect(service.prepare(context())).toEqual([]);
    });

    it('uses the before snapshot when the paste has already overwritten existing content', () => {
        const ctx = context();
        ctx.beforeCells = { 6: { 2: { v: 99 } } };
        workbook.getActiveSheet()!.getCellMatrix().setValue(6, 2, { v: 'New' });
        expect(service.prepare(ctx)).toEqual([]);
    });

    it('does not confuse this operation input with an existing obstacle', () => {
        workbook.getActiveSheet()!.getCellMatrix().setValue(6, 2, { v: 'New' });
        expect(service.prepare(context())).toHaveLength(1);
    });

    it('rejects a whole batch when only its final new row intersects an exclusive obstacle', () => {
        const exclusive = univer.__getInjector().get(IExclusiveRangeService);
        exclusive.addExclusiveRange('book', 'sheet', 'pivot-test', [{ groupId: 'pivot', range: { startRow: 8, endRow: 10, startColumn: 4, endColumn: 6 } }]);
        expect(service.prepare(context({ ...next, endRow: 8 }))).toEqual([]);
    });

    it('keeps another table independent when only the first expansion is blocked', () => {
        manager.addTable('book', 'sheet', 'Other', { ...original, startColumn: 7, endColumn: 9 }, ['A', 'B', 'C'], 'other');
        workbook.getActiveSheet()!.getCellMatrix().setValue(6, 4, { v: 88 });
        expect(service.prepare(context({ ...next, endColumn: 9 })).map((patch) => patch.tableId)).toEqual(['other']);
    });

    it('rejects expansion beyond the worksheet instead of increasing its size', () => {
        expect(service.prepare(context({ ...next, endRow: 20 }))).toEqual([]);
        expect(workbook.getActiveSheet()!.getRowCount()).toBe(20);
    });

    it('rejects a merge outside the written cell but inside the added strip', () => {
        workbook.getActiveSheet()!.setMergeData([{ startRow: 6, endRow: 7, startColumn: 4, endColumn: 5 }]);
        expect(service.prepare(context())).toEqual([]);
    });

    it('rejects a merge planned by this paste before it exists in the worksheet', () => {
        const ctx = context();
        ctx.mutations = [{ id: AddWorksheetMergeMutation.id, params: { unitId: 'book', subUnitId: 'sheet', ranges: [{ startRow: 6, endRow: 6, startColumn: 3, endColumn: 4 }] } }];
        expect(service.prepare(ctx)).toEqual([]);
    });

    it('rejects another table outside the written cell but inside the added strip', () => {
        manager.addTable('book', 'sheet', 'Obstacle', { startRow: 6, endRow: 8, startColumn: 4, endColumn: 6 }, ['A', 'B', 'C'], 'obstacle');
        expect(service.prepare(context()).filter((patch) => patch.tableId === 'orders')).toEqual([]);
    });

    it('checks protected cells outside the actual input', () => {
        const injector = univer.__getInjector();
        const point = new RangeProtectionPermissionEditPoint('book', 'sheet', 'deny');
        injector.get(IPermissionService).addPermissionPoint(point);
        injector.get(IPermissionService).updatePermissionPoint(point.id, false);
        injector.get(RangeProtectionRuleModel).addRule('book', 'sheet', {
            id: 'deny',
            permissionId: 'deny',
            ranges: [{ ...next, startColumn: 4, endColumn: 4 }],
            unitId: 'book',
            subUnitId: 'sheet',
            unitType: point.type,
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        expect(service.prepare(context())).toEqual([]);
    });

    it('generates full stable metadata for appended columns, preserving the original IDs', () => {
        const patches = service.prepare(context({ startRow: 3, endRow: 3, startColumn: 5, endColumn: 6 }));
        expect(patches).toHaveLength(1);
        const patch = JSON.parse(JSON.stringify(patches[0]));
        expect(patch.after.columns).toHaveLength(5);
        expect(patch.after.columns.slice(0, 3)).toEqual(patch.before.columns);
        expect(new Set(patch.after.columns.map((column: { id: string }) => column.id)).size).toBe(5);
        expect(patch.after.columns[3].displayName).toBe('Column 4');
        expect(patch.after.columns[4].displayName).toBe('Column 5');
        expect(manager.getTable('book', 'orders')!.getColumnsCount()).toBe(3);
    });

    it('keeps hidden physical rows and columns eligible without bridging an unwritten gap', () => {
        const sheet = workbook.getActiveSheet()!;
        sheet.getRowManager().getRowOrCreate(6).hd = BooleanNumber.TRUE;
        sheet.getColumnManager().getColumnOrCreate(5).hd = BooleanNumber.TRUE;
        expect(service.prepare(context())[0].after.range.endRow).toBe(6);
        expect(service.prepare(context({ startRow: 3, endRow: 3, startColumn: 5, endColumn: 5 }))[0].after.range.endColumn).toBe(5);
        expect(service.prepare(context({ ...next, startRow: 7, endRow: 7 }))).toEqual([]);
    });

    it.each(['', 'Item', '42'])('uses native header names without renaming an explicit %j header', (name) => {
        const ctx = context({ startRow: 2, endRow: 3, startColumn: 5, endColumn: 5 });
        ctx.contentWrites = { 2: { 5: { v: name } }, 3: { 5: { v: 'Body' } } };
        const patch = service.prepare(ctx)[0];
        expect(patch.after.columns[3].displayName).toBe(name || 'Column 4');
        expect(ctx.contentWrites[2][5]?.v).toBe(name);
    });

    it('prevents growth below a footer while allowing columns to its right', () => {
        const table = manager.getTable('book', 'orders')!;
        table.fromJSON({ ...table.toJSON(), options: { ...table.toJSON().options, showFooter: true } });
        expect(service.prepare(context())).toEqual([]);
        expect(service.prepare(context({ startRow: 3, endRow: 3, startColumn: 5, endColumn: 5 }))).toHaveLength(1);
    });

    it('does not use the first data row as a header when headers are hidden', () => {
        manager.getTable('book', 'orders')!.setShowHeader(false);
        const ctx = context({ startRow: 2, endRow: 2, startColumn: 5, endColumn: 5 });
        ctx.contentWrites = { 2: { 5: { v: 'Body value' } } };
        expect(service.prepare(ctx)[0].after.columns[3].displayName).toBe('Column 4');
    });
});
