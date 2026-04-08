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

import type { Injector, IRange, Univer, Workbook } from '@univerjs/core';
import type { IAutoFillRule } from '../type';
import { Direction, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SetSelectionsOperation } from '../../../commands/operations/selection.operation';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from '../../__tests__/util';
import { SheetsSelectionsService } from '../../selections/selection.service';
import { AutoFillService } from '../auto-fill.service';
import { AUTO_FILL_APPLY_TYPE, AUTO_FILL_DATA_TYPE, AUTO_FILL_HOOK_TYPE } from '../type';

describe('AutoFillService', () => {
    let univer: Univer;
    let get: Injector['get'];
    let service: AutoFillService;
    let commandService: ICommandService;
    let unitId: string;
    let subUnitId: string;

    beforeEach(() => {
        const testBed = createTestBase(TEST_WORKBOOK_DATA_DEMO, [
            [SheetsSelectionsService],
            [AutoFillService],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        service = get(AutoFillService);
        commandService = get(ICommandService);
        commandService.registerCommand(SetSelectionsOperation);

        const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        unitId = workbook.getUnitId();
        subUnitId = workbook.getActiveSheet()!.getSheetId();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should initialize default rules by priority', () => {
        const rules = service.getRules();
        expect(rules[0].type).toBe(AUTO_FILL_DATA_TYPE.DATE);
        expect(rules[rules.length - 1].type).toBe(AUTO_FILL_DATA_TYPE.OTHER);
    });

    it('should register rule by priority and reject duplicate type', () => {
        const customRule: IAutoFillRule = {
            type: 'custom-rule',
            priority: 2000,
            match: () => false,
            isContinue: () => false,
        };
        service.registerRule(customRule);
        expect(service.getRules()[0].type).toBe('custom-rule');

        expect(() => service.registerRule(customRule)).toThrow();
    });

    it('should add hooks with defaults and remove by disposable', () => {
        const disposable = service.addHook({
            id: 'append-hook',
        });

        const currentHook = service.getAllHooks().find((h) => h.id === 'append-hook');
        expect(currentHook?.type).toBe(AUTO_FILL_HOOK_TYPE.APPEND);
        expect(currentHook?.priority).toBe(0);

        expect(() => service.addHook({ id: 'append-hook' })).toThrow();

        disposable.dispose();
        expect(service.getAllHooks().find((h) => h.id === 'append-hook')).toBeUndefined();
    });

    it('should pick ONLY hook by max priority, otherwise default + append hooks', () => {
        service.autoFillLocation = {
            unitId,
            subUnitId,
            source: { rows: [0], cols: [0] },
            target: { rows: [1], cols: [0] },
        } as any;
        service.direction = Direction.DOWN;
        service.applyType = AUTO_FILL_APPLY_TYPE.COPY;

        const disposeDefaultLow = service.addHook({ id: 'default-low', type: AUTO_FILL_HOOK_TYPE.DEFAULT, priority: 1 });
        const disposeDefaultHigh = service.addHook({ id: 'default-high', type: AUTO_FILL_HOOK_TYPE.DEFAULT, priority: 9 });
        service.addHook({ id: 'append', type: AUTO_FILL_HOOK_TYPE.APPEND, priority: 1 });
        service.addHook({
            id: 'append-disabled',
            type: AUTO_FILL_HOOK_TYPE.APPEND,
            disable: () => true,
        });
        const disposeOnlyLow = service.addHook({ id: 'only-low', type: AUTO_FILL_HOOK_TYPE.ONLY, priority: 1 });
        const disposeOnlyHigh = service.addHook({ id: 'only-high', type: AUTO_FILL_HOOK_TYPE.ONLY, priority: 8 });

        expect(service.getActiveHooks().map((h) => h.id)).toEqual(['only-high']);

        disposeOnlyLow.dispose();
        disposeOnlyHigh.dispose();

        expect(service.getActiveHooks().map((h) => h.id)).toEqual(['default-high', 'append']);

        disposeDefaultLow.dispose();
        disposeDefaultHigh.dispose();
    });

    it('should toggle menu/status flags and apply type', () => {
        service.setDisableApplyType(AUTO_FILL_APPLY_TYPE.COPY, true);
        expect(service.menu.find((item) => item.value === AUTO_FILL_APPLY_TYPE.COPY)?.disable).toBe(true);

        let showMenu = false;
        const sub = service.showMenu$.subscribe((v) => {
            showMenu = v;
        });
        service.setShowMenu(true);
        expect(showMenu).toBe(true);
        sub.unsubscribe();

        service.setFillingStyle(false);
        expect(service.isFillingStyle()).toBe(false);
    });

    it('should return false when filling without location', () => {
        service.autoFillLocation = null;
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.COPY)).toBe(false);
    });

    it('should trigger auto fill and set direction for expansion', async () => {
        const source: IRange = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };

        expect(await service.triggerAutoFill(unitId, subUnitId, source, source, AUTO_FILL_APPLY_TYPE.COPY)).toBe(false);

        const result = await service.triggerAutoFill(
            unitId,
            subUnitId,
            source,
            { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
            AUTO_FILL_APPLY_TYPE.COPY
        );

        expect(result).toBe(true);
        expect(service.direction).toBe(Direction.DOWN);
        expect(service.autoFillLocation?.unitId).toBe(unitId);
    });

    it('should replay previous undo mutations before next fill', () => {
        service.autoFillLocation = {
            unitId,
            subUnitId,
            source: { rows: [0], cols: [0] },
            target: { rows: [1], cols: [0] },
        } as any;
        service.direction = Direction.DOWN;
        const prevRange = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
        (service as any)._prevUndos = [{
            id: SetSelectionsOperation.id,
            params: {
                unitId,
                subUnitId,
                selections: [{ range: prevRange, primary: null, style: null }],
            },
        }];

        const syncSpy = vi.spyOn(commandService, 'syncExecuteCommand');
        service.fillData(AUTO_FILL_APPLY_TYPE.COPY);

        expect(syncSpy).toHaveBeenCalledWith(SetSelectionsOperation.id, {
            unitId,
            subUnitId,
            selections: [{ range: prevRange, primary: null, style: null }],
        });
        expect((service as any)._prevUndos).toEqual([]);
    });

    it('should skip auto-height mutation generation in NO_FORMAT mode', () => {
        const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        service.applyType = AUTO_FILL_APPLY_TYPE.NO_FORMAT;

        const result = (service as any)._getAutoHeightUndoRedos([], workbook, worksheet);
        expect(result).toEqual({ undos: [], redos: [] });
    });
});
