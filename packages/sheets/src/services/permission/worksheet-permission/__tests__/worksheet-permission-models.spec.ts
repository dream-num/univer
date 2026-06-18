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

import { UnitAction, UnitObject } from '@univerjs/protocol';
import { describe, expect, it } from 'vitest';
import { EditStateEnum, ViewStateEnum } from '../../../../models/range-protection-rule.model';
import { defaultSheetActions } from '../type';
import { WorksheetProtectionPointModel } from '../worksheet-permission-point.model';
import { WorksheetProtectionRuleModel } from '../worksheet-permission-rule.model';

describe('worksheet protection defaults', () => {
    it('uses edit and copy as the default actions protected by a worksheet rule', () => {
        expect(defaultSheetActions).toEqual([UnitAction.Edit, UnitAction.Copy]);
    });
});

describe('WorksheetProtectionRuleModel', () => {
    it('adds, updates, deletes, serializes, and restores worksheet rules', () => {
        const model = new WorksheetProtectionRuleModel();
        const changes: string[] = [];
        const refreshes: string[] = [];
        let resetCount = 0;
        model.ruleChange$.subscribe((change) => changes.push(`${change.type}:${change.subUnitId}:${change.rule.permissionId}`));
        model.ruleRefresh$.subscribe((permissionId) => refreshes.push(permissionId));
        model.resetOrder$.subscribe(() => resetCount++);
        const originalRule = {
            permissionId: 'permission-1',
            unitType: UnitObject.Worksheet,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        };

        expect(model.getSheetRuleInitState()).toBe(false);
        model.changeRuleInitState(true);
        expect(model.getSheetRuleInitState()).toBe(true);

        model.addRule('unit-1', originalRule);
        expect(model.getRule('unit-1', 'sheet-1')).toEqual(originalRule);

        const updatedRule = { ...originalRule, permissionId: 'permission-2' };
        model.setRule('unit-1', 'sheet-1', updatedRule);
        model.setRule('unit-1', 'missing', { ...updatedRule, subUnitId: 'missing' });
        expect(model.getRule('unit-1', 'sheet-1')).toEqual(updatedRule);
        expect(model.getTargetByPermissionId('unit-1', 'permission-2')).toEqual(['unit-1', 'sheet-1']);
        expect(model.getTargetByPermissionId('unit-1', 'missing')).toBeUndefined();
        expect(model.getTargetByPermissionId('missing', 'permission-2')).toBeNull();
        expect(model.toObject()).toEqual({ 'unit-1': [updatedRule] });

        model.ruleRefresh('permission-2');
        model.resetOrder();
        expect(refreshes).toEqual(['permission-2']);
        expect(resetCount).toBe(1);

        const restored = new WorksheetProtectionRuleModel();
        restored.fromObject({ 'unit-2': [{ ...updatedRule, unitId: 'unit-2', subUnitId: 'sheet-2' }] });
        expect(restored.getRule('unit-2', 'sheet-2')).toEqual({ ...updatedRule, unitId: 'unit-2', subUnitId: 'sheet-2' });
        restored.deleteUnitModel('unit-2');
        expect(restored.toObject()).toEqual({});

        model.deleteRule('unit-1', 'sheet-1');
        model.deleteRule('unit-1', 'sheet-1');
        expect(model.getRule('unit-1', 'sheet-1')).toBeUndefined();
        expect(changes).toEqual(['add:sheet-1:permission-1', 'set:sheet-1:permission-2', 'delete:sheet-1:permission-2']);
    });
});

describe('WorksheetProtectionPointModel', () => {
    it('adds, deletes, serializes, and restores worksheet point rules', () => {
        const model = new WorksheetProtectionPointModel();
        const changes: string[] = [];
        model.pointChange$.subscribe((change) => changes.push(`${change.subUnitId}:${change.permissionId}`));
        const firstRule = { unitId: 'unit-1', subUnitId: 'sheet-1', permissionId: 'permission-1' };

        model.addRule(firstRule);
        expect(model.getRule('unit-1', 'sheet-1')).toEqual(firstRule);
        expect(model.toObject()).toEqual({ 'unit-1': [firstRule] });
        expect(model.getTargetByPermissionId('unit-1', 'permission-1')).toEqual(['unit-1', 'sheet-1']);
        expect(model.getTargetByPermissionId('unit-1', 'missing')).toBeUndefined();
        expect(model.getTargetByPermissionId('missing', 'permission-1')).toBeNull();

        const restored = new WorksheetProtectionPointModel();
        restored.fromObject({ 'unit-2': [{ unitId: 'unit-2', subUnitId: 'sheet-2', permissionId: 'permission-2' }] });
        expect(restored.getRule('unit-2', 'sheet-2')).toEqual({ unitId: 'unit-2', subUnitId: 'sheet-2', permissionId: 'permission-2' });
        restored.deleteUnitModel('unit-2');
        expect(restored.toObject()).toEqual({});

        model.deleteRule('unit-1', 'sheet-1');
        model.deleteRule('unit-1', 'sheet-1');
        expect(model.getRule('unit-1', 'sheet-1')).toBeUndefined();
        expect(changes).toEqual(['sheet-1:permission-1', 'sheet-1:permission-1']);
    });
});
