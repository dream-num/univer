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

import type { IAccessor, IRange } from '@univerjs/core';
import type { IRangeProtectionRule } from '../../../models/range-protection-rule.model';
import type { IRangeThemeStyleJSON, RangeThemeStyle } from '../../../models/range-theme-util';
import { BooleanNumber, IUniverInstanceService } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { describe, expect, it } from 'vitest';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../models/range-protection-rule.model';
import { SheetRangeThemeModel } from '../../../models/range-theme-model';
import { WorksheetProtectionPointModel } from '../../../services/permission/worksheet-permission';
import { WorksheetProtectionRuleModel } from '../../../services/permission/worksheet-permission/worksheet-permission-rule.model';
import { AddRangeProtectionMutation, FactoryAddRangeProtectionMutation } from '../add-range-protection.mutation';
import { AddRangeThemeMutation } from '../add-range-theme.mutation';
import { DeleteRangeProtectionMutation, FactoryDeleteRangeProtectionMutation } from '../delete-range-protection.mutation';
import { EmptyMutation } from '../empty.mutation';
import { MarkDirtyFilterChangeMutation } from '../mark-dirty-filter-change.mutation';
import { RemoveRangeThemeMutation } from '../remove-range-theme.mutation';
import { ReorderRangeMutation, ReorderRangeUndoMutationFactory } from '../reorder-range.mutation';
import { FactorySetRangeProtectionMutation, SetRangeProtectionMutation } from '../set-range-protection.mutation';
import { SetRangeThemeMutation } from '../set-range-theme.mutation';
import { SetWorksheetColumnCountMutation, SetWorksheetColumnCountUndoMutationFactory } from '../set-worksheet-column-count.mutation';
import { SetWorksheetPermissionPointsMutation } from '../set-worksheet-permission-points.mutation';
import { SetWorksheetProtectionMutation } from '../set-worksheet-protection.mutation';
import { SetWorksheetRightToLeftMutation, SetWorksheetRightToLeftUndoMutationFactory } from '../set-worksheet-right-to-left.mutation';
import { SetWorksheetRowCountMutation, SetWorksheetRowCountUndoMutationFactory } from '../set-worksheet-row-count.mutation';
import { UnregisterWorksheetRangeThemeStyleMutation } from '../unregister-range-theme-style.mutation';

function createAccessor(records: Map<unknown, unknown>): IAccessor {
    return {
        get: (token: unknown) => records.get(token) as never,
        has: (token: unknown) => records.has(token),
    } as IAccessor;
}

function createRangeRule(id: string, range: IRange = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }): IRangeProtectionRule {
    return {
        id,
        permissionId: `permission-${id}`,
        ranges: [range],
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        unitType: UnitObject.SelectRange,
        viewState: ViewStateEnum.OthersCanView,
        editState: EditStateEnum.OnlyMe,
    };
}

describe('range protection mutations', () => {
    it('adds, updates, deletes rules and builds undo mutation payloads from model state', () => {
        const model = new RangeProtectionRuleModel();
        const accessor = createAccessor(new Map<unknown, unknown>([[RangeProtectionRuleModel, model]]));
        const firstRule = createRangeRule('rule-1');
        const secondRule = createRangeRule('rule-2', { startRow: 3, endRow: 3, startColumn: 2, endColumn: 4 });

        expect(AddRangeProtectionMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rules: [firstRule, secondRule] })).toBe(true);
        expect(model.getSubunitRuleList('unit-1', 'sheet-1')).toEqual([firstRule, secondRule]);
        expect(FactoryAddRangeProtectionMutation({ unitId: 'unit-1', subUnitId: 'sheet-1', rules: [firstRule, secondRule] })).toEqual({
            id: DeleteRangeProtectionMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', rules: [firstRule, secondRule], ruleIds: ['rule-1', 'rule-2'] },
        });

        const updatedRule = { ...firstRule, description: 'locked for planning' };
        expect(FactorySetRangeProtectionMutation(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ruleId: 'rule-1', rule: updatedRule })).toEqual({
            id: SetRangeProtectionMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', ruleId: 'rule-1', rule: firstRule },
        });
        expect(SetRangeProtectionMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ruleId: 'rule-1', rule: updatedRule })).toBe(true);
        expect(model.getRule('unit-1', 'sheet-1', 'rule-1')).toEqual(updatedRule);

        expect(FactoryDeleteRangeProtectionMutation(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ruleIds: ['rule-1', 'missing'] })).toEqual({
            id: AddRangeProtectionMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', rules: [updatedRule] },
        });
        expect(DeleteRangeProtectionMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ruleIds: ['rule-1', 'rule-2'] })).toBe(true);
        expect(model.getSubunitRuleListLength('unit-1', 'sheet-1')).toBe(0);
        expect(FactorySetRangeProtectionMutation(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', ruleId: 'rule-1', rule: updatedRule })).toBeNull();
    });
});

describe('worksheet protection mutations', () => {
    it('stores worksheet protection rules and permission point rules in their models', () => {
        const ruleModel = new WorksheetProtectionRuleModel();
        const pointModel = new WorksheetProtectionPointModel();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [WorksheetProtectionRuleModel, ruleModel],
            [WorksheetProtectionPointModel, pointModel],
        ]));
        const rule = {
            permissionId: 'permission-sheet-1',
            unitType: UnitObject.Worksheet,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            viewState: ViewStateEnum.NoOneElseCanView,
            editState: EditStateEnum.DesignedUserCanEdit,
        };

        ruleModel.addRule('unit-1', { ...rule, description: 'initial' });
        expect(SetWorksheetProtectionMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rule })).toBe(true);
        expect(ruleModel.getRule('unit-1', 'sheet-1')).toEqual(rule);

        expect(SetWorksheetPermissionPointsMutation.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rule: { unitId: 'unit-1', subUnitId: 'sheet-1', permissionId: 'permission-point-1' },
        })).toBe(true);
        expect(pointModel.getRule('unit-1', 'sheet-1')).toEqual({ unitId: 'unit-1', subUnitId: 'sheet-1', permissionId: 'permission-point-1' });
    });
});

describe('worksheet count and direction mutations', () => {
    it('changes worksheet row and column counts and creates undo payloads from old dimensions', () => {
        const worksheet = {
            rowCount: 12,
            columnCount: 8,
            getRowCount() { return this.rowCount; },
            setRowCount(rowCount: number) { this.rowCount = rowCount; },
            getColumnCount() { return this.columnCount; },
            setColumnCount(columnCount: number) { this.columnCount = columnCount; },
        };
        const workbook = {
            getSheetBySheetId: (subUnitId: string) => subUnitId === 'sheet-1' ? worksheet : null,
        };
        const univerInstanceService = {
            getUnit: (unitId: string) => unitId === 'unit-1' ? workbook : null,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([[IUniverInstanceService, univerInstanceService]]));

        expect(SetWorksheetRowCountUndoMutationFactory(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rowCount: 20 })).toEqual({ unitId: 'unit-1', subUnitId: 'sheet-1', rowCount: 12 });
        expect(SetWorksheetRowCountMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rowCount: 20 })).toBe(true);
        expect(worksheet.rowCount).toBe(20);

        expect(SetWorksheetColumnCountUndoMutationFactory(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', columnCount: 14 })).toEqual({ unitId: 'unit-1', subUnitId: 'sheet-1', columnCount: 8 });
        expect(SetWorksheetColumnCountMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', columnCount: 14 })).toBe(true);
        expect(worksheet.columnCount).toBe(14);

        expect(SetWorksheetRowCountMutation.handler(accessor, { unitId: 'missing', subUnitId: 'sheet-1', rowCount: 30 })).toBe(false);
        expect(SetWorksheetColumnCountMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'missing', columnCount: 30 })).toBe(false);
        expect(() => SetWorksheetRowCountUndoMutationFactory(accessor, { unitId: 'missing', subUnitId: 'sheet-1', rowCount: 1 })).toThrowError('[SetWorksheetRowCountUndoMutationFactory]: worksheet is null error!');
        expect(() => SetWorksheetColumnCountUndoMutationFactory(accessor, { unitId: 'unit-1', subUnitId: 'missing', columnCount: 1 })).toThrowError('[SetWorksheetColumnCountUndoMutationFactory]: worksheet is null error!');
    });

    it('updates right-to-left state and returns previous state for undo', () => {
        const config = { rightToLeft: BooleanNumber.FALSE };
        const worksheet = {
            getConfig: () => config,
        };
        const workbook = {
            getSheetBySheetId: (subUnitId: string) => subUnitId === 'sheet-1' ? worksheet : null,
        };
        const univerInstanceService = {
            getUniverSheetInstance: (unitId: string) => unitId === 'unit-1' ? workbook : null,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([[IUniverInstanceService, univerInstanceService]]));

        expect(SetWorksheetRightToLeftUndoMutationFactory(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rightToLeft: BooleanNumber.TRUE })).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rightToLeft: BooleanNumber.FALSE,
        });
        expect(SetWorksheetRightToLeftMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rightToLeft: BooleanNumber.TRUE })).toBe(true);
        expect(config.rightToLeft).toBe(BooleanNumber.TRUE);
        expect(SetWorksheetRightToLeftMutation.handler(accessor, { unitId: 'missing', subUnitId: 'sheet-1', rightToLeft: BooleanNumber.FALSE })).toBe(false);
        expect(SetWorksheetRightToLeftMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'missing', rightToLeft: BooleanNumber.FALSE })).toBe(false);
    });
});

describe('range theme mutations', () => {
    it('registers, edits, and removes custom range theme styles', () => {
        const registered = new Map<string, RangeThemeStyle>();
        const rangeThemeModel = {
            registerRangeThemeStyle: (_unitId: string, style: RangeThemeStyle) => registered.set(style.getName(), style),
            unregisterRangeThemeStyle: (_unitId: string, styleName: string) => registered.delete(styleName),
            getRangeThemeStyle: (_unitId: string, styleName: string) => registered.get(styleName),
        };
        const accessor = createAccessor(new Map<unknown, unknown>([[SheetRangeThemeModel, rangeThemeModel]]));
        const styleJSON: IRangeThemeStyleJSON = {
            name: 'sales',
            headerRowStyle: { bg: { rgb: '#eef2ff' } },
            firstRowStyle: { bg: { rgb: '#ffffff' } },
        };

        expect(AddRangeThemeMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', styleJSON })).toBe(true);
        expect(registered.get('sales')?.getHeaderRowStyle()).toEqual({ bg: { rgb: '#eef2ff' } });

        expect(SetRangeThemeMutation.handler(accessor, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            styleName: 'sales',
            style: {
                headerRowStyle: { bg: { rgb: '#111111' } },
                firstRowStyle: { bg: { rgb: '#222222' } },
                secondRowStyle: { bg: { rgb: '#333333' } },
                lastRowStyle: { bg: { rgb: '#444444' } },
            },
        })).toBe(true);
        expect(registered.get('sales')?.getHeaderRowStyle()).toEqual({ bg: { rgb: '#111111' } });
        expect(registered.get('sales')?.getLastRowStyle()).toEqual({ bg: { rgb: '#444444' } });

        expect(RemoveRangeThemeMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', styleName: 'sales' })).toBe(true);
        expect(registered.has('sales')).toBe(false);
        expect(AddRangeThemeMutation.handler(accessor, null as never)).toBe(false);
        expect(SetRangeThemeMutation.handler(accessor, null as never)).toBe(false);
        expect(SetRangeThemeMutation.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', styleName: 'missing', style: { headerRowStyle: { bg: { rgb: '#000000' } } } })).toBe(true);
        expect(RemoveRangeThemeMutation.handler(accessor, null as never)).toBe(false);
    });

    it('unregisters a worksheet theme style only when the workbook target exists', () => {
        const removed: string[] = [];
        const rangeThemeModel = {
            unregisterRangeThemeStyle: (unitId: string, themeName: string) => removed.push(`${unitId}:${themeName}`),
        };
        const worksheet = {
            getSheetId: () => 'sheet-1',
        };
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        };
        const univerInstanceService = {
            getUnit: (unitId: string) => unitId === 'unit-1' ? workbook : null,
            getCurrentUnitOfType: () => workbook,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [SheetRangeThemeModel, rangeThemeModel],
            [IUniverInstanceService, univerInstanceService],
        ]));

        expect(UnregisterWorksheetRangeThemeStyleMutation.handler(accessor, { unitId: 'unit-1', themeName: 'sales' })).toBe(true);
        expect(removed).toEqual(['unit-1:sales']);

        const missingAccessor = createAccessor(new Map<unknown, unknown>([
            [SheetRangeThemeModel, rangeThemeModel],
            [IUniverInstanceService, { ...univerInstanceService, getUnit: () => null }],
        ]));
        expect(UnregisterWorksheetRangeThemeStyleMutation.handler(missingAccessor, { unitId: 'missing', themeName: 'sales' })).toBe(false);
    });
});

describe('empty mutation', () => {
    it('returns success so command chains can use it as a no-op mutation', () => {
        expect(EmptyMutation.handler(createAccessor(new Map()), {})).toBe(true);
    });
});

describe('filter dirty and reorder mutations', () => {
    it('acknowledges filter range dirty markers for downstream listeners', () => {
        expect(MarkDirtyFilterChangeMutation.handler(createAccessor(new Map()), {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            filterRange: { startRow: 0, endRow: 4, startColumn: 0, endColumn: 3 },
        })).toBe(true);
    });

    it('reorders range rows from the requested source rows and creates inverse order for undo', () => {
        const writes: Array<{ row: number; col: number; value: unknown }> = [];
        const worksheet = {
            getCellRaw: (row: number, col: number) => ({ v: `${row}:${col}` }),
            getCellMatrix: () => ({
                setValue: (row: number, col: number, value: unknown) => writes.push({ row, col, value }),
            }),
        };
        const workbook = {
            getSheetBySheetId: (subUnitId: string) => subUnitId === 'sheet-1' ? worksheet : null,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([[IUniverInstanceService, {
            getUnit: (unitId: string) => unitId === 'unit-1' ? workbook : null,
        }]]));
        const params = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
            order: { 0: 2, 1: 0, 2: 1 },
        };

        expect(ReorderRangeUndoMutationFactory(params)).toEqual({
            ...params,
            order: { 0: 1, 1: 2, 2: 0 },
        });
        expect(ReorderRangeMutation.handler(accessor, params)).toBe(true);
        expect(writes).toEqual([
            { row: 0, col: 0, value: { v: '2:0' } },
            { row: 0, col: 1, value: { v: '2:1' } },
            { row: 1, col: 0, value: { v: '0:0' } },
            { row: 1, col: 1, value: { v: '0:1' } },
            { row: 2, col: 0, value: { v: '1:0' } },
            { row: 2, col: 1, value: { v: '1:1' } },
        ]);

        expect(ReorderRangeMutation.handler(createAccessor(new Map<unknown, unknown>([[IUniverInstanceService, {
            getUnit: () => ({ getSheetBySheetId: () => null }),
        }]])), params)).toBe(false);
    });
});
