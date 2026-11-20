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
import { BooleanNumber, Direction, ICommandService, RedoCommand, UndoCommand } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { IAutoFillRule } from '../type';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from '../../__tests__/util';
import { SetRangeValuesMutation } from '../../../commands/mutations/set-range-values.mutation';
import { SetWorksheetRowAutoHeightMutation } from '../../../commands/mutations/set-worksheet-row-height.mutation';
import { SetSelectionsOperation } from '../../../commands/operations/selection.operation';
import { AutoFillController } from '../../../controllers/auto-fill.controller';
import { SheetsSelectionsService } from '../../selections/selection.service';
import { AutoFillService, IAutoFillService } from '../auto-fill.service';
import { AUTO_FILL_APPLY_TYPE, AUTO_FILL_DATA_TYPE, AUTO_FILL_HOOK_TYPE } from '../type';

describe('AutoFillService', () => {
    let univer: Univer;
    let get: Injector['get'];
    let workbook: Workbook;
    let unitId: string;
    let subUnitId: string;

    beforeEach(() => {
        const testBed = createTestBase({
            ...TEST_WORKBOOK_DATA_DEMO,
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    defaultRowHeight: 40,
                    rowData: {
                        2: { h: 50, ia: BooleanNumber.TRUE },
                        3: { ah: 80 },
                        4: { h: 30, ia: BooleanNumber.FALSE },
                        5: { h: 35 },
                    },
                    cellData: { 0: { 0: { v: 'Tall', s: { fs: 36 } }, 1: { v: 'Short', s: { fs: 10 } } } },
                },
            },
        }, [
            [SheetsSelectionsService],
            [IAutoFillService, { useClass: AutoFillService }],
            [AutoFillController],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        workbook = testBed.sheet;
        get(ICommandService).registerCommand(SetSelectionsOperation);
        unitId = workbook.getUnitId();
        subUnitId = workbook.getActiveSheet()!.getSheetId();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should initialize default rules by priority', () => {
        const service = get(IAutoFillService);
        const rules = service.getRules();
        expect(rules[0].type).toBe(AUTO_FILL_DATA_TYPE.DATE);
        expect(rules[rules.length - 1].type).toBe(AUTO_FILL_DATA_TYPE.OTHER);
    });

    it('should register rule by priority and reject duplicate type', () => {
        const service = get(IAutoFillService);
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
        const service = get(IAutoFillService);
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
        const service = get(IAutoFillService);
        service.autoFillLocation = {
            unitId,
            subUnitId,
            source: { rows: [0], cols: [0] },
            target: { rows: [1], cols: [0] },
        };
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
        const service = get(IAutoFillService);
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
        const service = get(IAutoFillService);
        service.autoFillLocation = null;
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.COPY)).toBe(false);
    });

    it('should select hooks using the requested type and commit it only after preparation', () => {
        const service = get(IAutoFillService);
        service.autoFillLocation = {
            unitId,
            subUnitId,
            source: { rows: [0], cols: [0] },
            target: { rows: [1], cols: [0] },
        };
        service.applyType = AUTO_FILL_APPLY_TYPE.ONLY_FORMAT;
        const observedTypes: AUTO_FILL_APPLY_TYPE[] = [];
        service.addHook({
            id: 'copy-only',
            disable: (_location, _direction, applyType) => applyType !== AUTO_FILL_APPLY_TYPE.COPY,
            onPrepareFillData: (_location, _direction, applyType) => {
                expect(applyType).toBe(AUTO_FILL_APPLY_TYPE.COPY);
                observedTypes.push(service.applyType);
                return () => {
                    observedTypes.push(service.applyType);
                    return { undos: [], redos: [] };
                };
            },
        });

        expect(service.getActiveHooks()).toEqual([]);
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.COPY)).toBe(true);
        expect(observedTypes).toEqual([AUTO_FILL_APPLY_TYPE.ONLY_FORMAT, AUTO_FILL_APPLY_TYPE.COPY]);
        expect(service.applyType).toBe(AUTO_FILL_APPLY_TYPE.COPY);
    });

    it('should trigger auto fill and set direction for expansion', async () => {
        const service = get(IAutoFillService);
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

    it('keeps destination row heights and grows auto-sized rows to fit the tallest filled cell', async () => {
        const service = get(IAutoFillService);
        get(AutoFillController);
        const commands = get(ICommandService);
        commands.registerCommand(SetRangeValuesMutation);
        commands.registerCommand(SetWorksheetRowAutoHeightMutation);
        const sheet = workbook.getActiveSheet()!;
        // Supply the cell measurements normally provided by the renderer.
        sheet.__registerGetCellHeight((_row, col) => col === 0 ? 64 : 17);
        const shortCell = { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 };
        await service.triggerAutoFill(unitId, subUnitId, shortCell, { ...shortCell, endRow: 1 }, AUTO_FILL_APPLY_TYPE.COPY);
        expect(sheet.getCellRaw(1, 1)?.v).toBe('Short');
        expect(sheet.getRowHeight(1)).toBe(40);

        const source = { ...shortCell, startColumn: 0 };
        await service.triggerAutoFill(unitId, subUnitId, source, { ...source, endRow: 5 }, AUTO_FILL_APPLY_TYPE.COPY);
        const heights = () => [1, 2, 3, 4, 5].map((row) => sheet.getRowHeight(row));
        expect(heights()).toEqual([64, 64, 80, 30, 35]);
        await commands.executeCommand(UndoCommand.id);
        expect(heights()).toEqual([40, 50, 80, 30, 35]);
        await commands.executeCommand(RedoCommand.id);
        expect(heights()).toEqual([64, 64, 80, 30, 35]);

        service.fillData(AUTO_FILL_APPLY_TYPE.NO_FORMAT);
        expect(sheet.getCellRaw(2, 0)?.v).toBe('Tall');
        expect(heights()).toEqual([40, 50, 80, 30, 35]);
    });
});
