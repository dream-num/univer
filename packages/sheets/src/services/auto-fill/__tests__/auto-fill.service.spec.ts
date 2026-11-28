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
import {
    BooleanNumber,
    CommandType,
    Direction,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { IRenderManagerService, Spreadsheet } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { IAutoFillRule } from '../type';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from '../../__tests__/util';
import { SetRangeValuesMutation } from '../../../commands/mutations/set-range-values.mutation';
import { SetWorksheetRowAutoHeightMutation } from '../../../commands/mutations/set-worksheet-row-height.mutation';
import { SetSelectionsOperation } from '../../../commands/operations/selection.operation';
import { AutoFillController } from '../../../controllers/auto-fill.controller';
import { SheetSkeletonService } from '../../../skeleton/skeleton.service';
import { SheetsSelectionsService } from '../../selections/selection.service';
import { SheetInterceptorService } from '../../sheet-interceptor/sheet-interceptor.service';
import { AutoFillService, IAutoFillService } from '../auto-fill.service';
import { AUTO_FILL_APPLY_TYPE, AUTO_FILL_DATA_TYPE, AUTO_FILL_HOOK_TYPE } from '../type';

describe('AutoFillService', () => {
    let univer: Univer;
    let get: Injector['get'];
    let workbook: Workbook;
    let service: AutoFillService;
    let commandService: ICommandService;
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
            [SheetSkeletonService],
            [SheetInterceptorService],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        workbook = testBed.sheet;
        service = get(IAutoFillService) as AutoFillService;
        commandService = get(ICommandService);
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

    it('prepares content-fill effects from the restored baseline and removes them when switching to format-only', () => {
        commandService.registerCommand(SetRangeValuesMutation);
        const sheet = get(IUniverInstanceService).getUnit<Workbook>(unitId)!.getSheetBySheetId(subUnitId)!;
        let prepares = 0;
        get(SheetInterceptorService).interceptValueChange((context) => {
            prepares++;
            expect(context.beforeCells[4][1]?.v).not.toBe('Filled');
            expect(sheet.getCellRaw(4, 2)?.v).not.toBe('Inherited');
            return [{
                redo: { id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 2: { v: 'Inherited' } } } } },
                undo: { id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 2: null } } } },
            }];
        });
        service.autoFillLocation = { unitId, subUnitId, source: { rows: [3], cols: [1] }, target: { rows: [4], cols: [1] } };
        service.direction = Direction.DOWN;
        service.addHook({ id: 'content', onFillData: (_location, _direction, type) => ({
            redos: [{ id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 1: type === AUTO_FILL_APPLY_TYPE.ONLY_FORMAT ? { s: { bl: 1 } } : { v: 'Filled' } } } } }],
            undos: [{ id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 1: null } } } }],
        }) });
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.COPY)).toBe(true);
        expect(sheet.getCellRaw(4, 2)?.v).toBe('Inherited');
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.SERIES)).toBe(true);
        expect(prepares).toBe(2);
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.ONLY_FORMAT)).toBe(true);
        expect(sheet.getCellRaw(4, 2)?.v).toBeFalsy();
        expect(prepares).toBe(2);
        expect(get(IUndoRedoService).getUndoRedoStatus(unitId).undos).toBe(1);
    });

    it('restores the previous fill and apply type when a replacement hook throws after baseline restoration', () => {
        commandService.registerCommand(SetRangeValuesMutation);
        const sheet = get(IUniverInstanceService).getUnit<Workbook>(unitId)!.getSheetBySheetId(subUnitId)!;
        service.autoFillLocation = { unitId, subUnitId, source: { rows: [3], cols: [1] }, target: { rows: [4], cols: [1] } };
        service.direction = Direction.DOWN;
        service.addHook({ id: 'replacement', onFillData: (_location, _direction, type) => {
            if (type === AUTO_FILL_APPLY_TYPE.SERIES) throw new Error('Invalid replacement');
            return {
                redos: [{ id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 1: { v: 'Previous' } } } } }],
                undos: [{ id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 1: null } } } }],
            };
        } });
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.COPY)).toBe(true);
        expect(() => service.fillData(AUTO_FILL_APPLY_TYPE.SERIES)).toThrow('Invalid replacement');
        expect(sheet.getCellRaw(4, 1)?.v).toBe('Previous');
        expect(service.applyType).toBe(AUTO_FILL_APPLY_TYPE.COPY);
        expect(get(IUndoRedoService).getUndoRedoStatus(unitId).undos).toBe(1);
    });

    it('keeps the original fill and history when its previous inverse refuses execution', () => {
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand({ id: 'test.mutation.unavailable-inverse', type: CommandType.MUTATION, handler: () => false });
        const sheet = get(IUniverInstanceService).getUnit<Workbook>(unitId)!.getSheetBySheetId(subUnitId)!;
        service.autoFillLocation = { unitId, subUnitId, source: { rows: [3], cols: [1] }, target: { rows: [4], cols: [1] } };
        service.addHook({ id: 'owned', onFillData: (_location, _direction, type) => ({
            redos: [{ id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 1: { v: type === AUTO_FILL_APPLY_TYPE.COPY ? 'Owned' : 'Replacement' } } } } }],
            undos: [{ id: 'test.mutation.unavailable-inverse', params: { unitId, subUnitId } }],
        }) });
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.COPY)).toBe(true);
        const history = get(IUndoRedoService).pitchTopUndoElement();
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.SERIES)).toBe(false);
        expect(sheet.getCellRaw(4, 1)?.v).toBe('Owned');
        expect(service.applyType).toBe(AUTO_FILL_APPLY_TYPE.COPY);
        expect(get(IUndoRedoService).pitchTopUndoElement()).toBe(history);
    });

    it.each(['false', 'throw'])('restores the previous fill after a replacement mutation fails with %s', (failure) => {
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand({ id: 'test.mutation.failed-replacement', type: CommandType.MUTATION, handler: () => {
            if (failure === 'throw') throw new Error('Replacement mutation failed');
            return false;
        } });
        const sheet = get(IUniverInstanceService).getUnit<Workbook>(unitId)!.getSheetBySheetId(subUnitId)!;
        service.autoFillLocation = { unitId, subUnitId, source: { rows: [3], cols: [1] }, target: { rows: [4], cols: [1] } };
        service.addHook({ id: 'replacement-execution', onFillData: (_location, _direction, type) => ({
            redos: [
                { id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 1: { v: type === AUTO_FILL_APPLY_TYPE.COPY ? 'Previous' : 'Replacement' } } } } },
                ...(type === AUTO_FILL_APPLY_TYPE.SERIES ? [{ id: 'test.mutation.failed-replacement', params: { unitId, subUnitId } }] : []),
            ],
            undos: [{ id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 1: null } } } }],
        }) });
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.COPY)).toBe(true);
        const history = get(IUndoRedoService).pitchTopUndoElement();
        if (failure === 'throw') expect(() => service.fillData(AUTO_FILL_APPLY_TYPE.SERIES)).toThrow('Replacement mutation failed');
        else expect(service.fillData(AUTO_FILL_APPLY_TYPE.SERIES)).toBe(false);
        expect(sheet.getCellRaw(4, 1)?.v).toBe('Previous');
        expect(service.applyType).toBe(AUTO_FILL_APPLY_TYPE.COPY);
        expect(get(IUndoRedoService).pitchTopUndoElement()).toBe(history);
    });

    it.each(['false', 'throw'])('restores a fill when a later previous inverse fails with %s', (failure) => {
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand({ id: 'test.mutation.failed-fill-inverse', type: CommandType.MUTATION, handler: () => {
            if (failure === 'throw') throw new Error('Previous inverse failed');
            return false;
        } });
        const sheet = get(IUniverInstanceService).getUnit<Workbook>(unitId)!.getSheetBySheetId(subUnitId)!;
        service.autoFillLocation = { unitId, subUnitId, source: { rows: [3], cols: [1] }, target: { rows: [4], cols: [1] } };
        service.addHook({ id: 'inverse-execution', onFillData: () => ({
            redos: [{ id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 1: { v: 'Previous' } } } } }],
            undos: [
                { id: SetRangeValuesMutation.id, params: { unitId, subUnitId, cellValue: { 4: { 1: null } } } },
                { id: 'test.mutation.failed-fill-inverse', params: { unitId, subUnitId } },
            ],
        }) });
        expect(service.fillData(AUTO_FILL_APPLY_TYPE.COPY)).toBe(true);
        const history = get(IUndoRedoService).pitchTopUndoElement();
        if (failure === 'throw') expect(() => service.fillData(AUTO_FILL_APPLY_TYPE.SERIES)).toThrow('Previous inverse failed');
        else expect(service.fillData(AUTO_FILL_APPLY_TYPE.SERIES)).toBe(false);
        expect(sheet.getCellRaw(4, 1)?.v).toBe('Previous');
        expect(service.applyType).toBe(AUTO_FILL_APPLY_TYPE.COPY);
        expect(get(IUndoRedoService).pitchTopUndoElement()).toBe(history);
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

    it('resolves fill source and destination using the same display projection', async () => {
        const service = get(IAutoFillService);
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = get(SheetSkeletonService).createRenderSkeleton(worksheet, workbook.getStyles());
        skeleton.setProjection({ isRowFiltered: (row) => row === 1 || row === 4, getCell: () => undefined });
        const display = new Spreadsheet('test', skeleton);
        univer.__getInjector().add([IRenderManagerService, { useValue: {
            getRenderUnitById: () => ({ mainComponent: display }),
        } as never }]);
        try {
            const source = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 };
            const target = { ...source, endRow: 5 };
            expect(await service.triggerAutoFill(unitId, subUnitId, source, target, AUTO_FILL_APPLY_TYPE.COPY)).toBe(true);
            expect(service.autoFillLocation?.source.rows).toEqual([0, 2]);
            expect(service.autoFillLocation?.target.rows).toEqual([3, 5]);
        } finally {
            display.dispose();
            skeleton.dispose();
        }
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
