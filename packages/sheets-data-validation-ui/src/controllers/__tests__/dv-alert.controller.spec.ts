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

import type { Nullable } from '@univerjs/core';
import type { IHoverCellPosition } from '@univerjs/sheets-ui';
import type { Subject } from 'rxjs';
import {
    DataValidationOperator,
    DataValidationStatus,
    DataValidationType,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, RefSelectionsService, SetRangeValuesMutation } from '@univerjs/sheets';
import {
    AddSheetDataValidationCommand,
    RemoveSheetDataValidationCommand,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
} from '@univerjs/sheets-data-validation';
import sheetsDataValidationEnUS from '@univerjs/sheets-data-validation/locale/en-US';
import {
    CellAlertManagerService,
    CellPopupManagerService,
    HoverManagerService,
    SheetCanvasPopManagerService,
} from '@univerjs/sheets-ui';
import { CanvasPopupService, ICanvasPopupService } from '@univerjs/ui';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { createDvUiTestBed } from '../../__tests__/create-dv-ui-test-bed';
import enUS from '../../locale/en-US';
import { DataValidationAlertController } from '../dv-alert.controller';

afterEach(() => {
    vi.useRealTimers();
});

function createAlertTestBed() {
    vi.useFakeTimers();
    const testBed = createDvUiTestBed();
    const { injector } = testBed;
    onTestFinished(() => {
        testBed.univer.dispose();
        vi.clearAllTimers();
    });
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
    injector.add([IRefSelectionsService, { useClass: RefSelectionsService }]);
    injector.add([SheetCanvasPopManagerService]);
    injector.add([CellPopupManagerService]);
    injector.add([CellAlertManagerService]);
    injector.add([HoverManagerService]);
    injector.add([DataValidationAlertController]);
    injector.get(LocaleService).load({ [LocaleType.EN_US]: { ...sheetsDataValidationEnUS, ...enUS } });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    const input = injector.get(HoverManagerService) as unknown as { _currentCell$: Subject<Nullable<IHoverCellPosition>> };
    const hoverCell = (row: number | null, col = 0) => {
        input._currentCell$.next(row === null
            ? null
            : {
                location: { unitId: 'test', subUnitId: 'sheet1', row, col },
                position: { startX: col * 100, endX: (col + 1) * 100, startY: row * 28, endY: (row + 1) * 28 },
            });
    };
    const rule = {
        uid: 'date-alert-rule',
        type: DataValidationType.DATE,
        ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
        showErrorMessage: true,
        error: 'Expected a date',
    };
    const setValue = (value: number | string, row = 0) => testBed.commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
        unitId: 'test',
        subUnitId: 'sheet1',
        cellValue: { [row]: { 0: { v: value } } },
    });
    const addRule = () => testBed.commandService.syncExecuteCommand(AddSheetDataValidationCommand.id, {
        unitId: 'test',
        subUnitId: 'sheet1',
        rule,
    });
    return { ...testBed, hoverCell, setValue, addRule, rule, alerts: injector.get(CellAlertManagerService) };
}

describe('DataValidationAlertController', () => {
    it('closes on undo and reopens on redo without moving the pointer', async () => {
        const { injector, commandService, alerts, setValue, addRule, hoverCell } = createAlertTestBed();
        injector.get(DataValidationAlertController);
        setValue(1);
        addRule();
        hoverCell(0);
        await vi.advanceTimersByTimeAsync(120);
        expect(alerts.currentAlert.size).toBe(1);

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(alerts.currentAlert.size).toBe(0);
        await vi.advanceTimersByTimeAsync(120);
        expect(alerts.currentAlert.size).toBe(0);

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        await vi.advanceTimersByTimeAsync(0);
        expect(alerts.currentAlert.size).toBe(1);
    });

    it.each(['remove', 'range'] as const)('closes when the hovered rule changes through %s', async (action) => {
        const { injector, commandService, alerts, setValue, addRule, hoverCell, rule } = createAlertTestBed();
        injector.get(DataValidationAlertController);
        setValue(1);
        addRule();
        hoverCell(0);
        await vi.advanceTimersByTimeAsync(120);
        expect(alerts.currentAlert.size).toBe(1);

        await commandService.executeCommand(
            action === 'remove' ? RemoveSheetDataValidationCommand.id : UpdateSheetDataValidationRangeCommand.id,
            { unitId: 'test', subUnitId: 'sheet1', ruleId: rule.uid, ranges: [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }] }
        );
        expect(alerts.currentAlert.size).toBe(0);
        await vi.advanceTimersByTimeAsync(120);
        expect(alerts.currentAlert.size).toBe(0);
    });

    it('refreshes changed error text and ignores unrelated rules', async () => {
        const { injector, commandService, alerts, setValue, addRule, hoverCell, rule } = createAlertTestBed();
        injector.get(DataValidationAlertController);
        setValue(1);
        addRule();
        hoverCell(0);
        await vi.advanceTimersByTimeAsync(120);
        expect([...alerts.currentAlert.values()][0].alert.message).toBe('Expected a date');

        await commandService.executeCommand(UpdateSheetDataValidationOptionsCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ruleId: rule.uid,
            options: { showErrorMessage: true, error: 'Updated date error' },
        });
        await vi.advanceTimersByTimeAsync(0);
        expect([...alerts.currentAlert.values()][0].alert.message).toBe('Updated date error');
        const currentAlert = [...alerts.currentAlert.values()][0];
        await commandService.executeCommand(AddSheetDataValidationCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rule: { ...rule, uid: 'unrelated-rule', ranges: [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }] },
        });
        await vi.advanceTimersByTimeAsync(0);
        expect([...alerts.currentAlert.values()][0]).toBe(currentAlert);
    });

    it('closes when a hovered value becomes valid and opens when it becomes invalid again', async () => {
        const { injector, alerts, setValue, addRule, hoverCell } = createAlertTestBed();
        injector.get(DataValidationAlertController);
        setValue(1);
        addRule();
        hoverCell(0);
        await vi.advanceTimersByTimeAsync(120);
        expect(alerts.currentAlert.size).toBe(1);

        setValue('2026-10-15');
        await vi.advanceTimersByTimeAsync(0);
        expect(alerts.currentAlert.size).toBe(0);
        setValue(1);
        await vi.advanceTimersByTimeAsync(0);
        expect(alerts.currentAlert.size).toBe(1);
    });

    it.each(['undo', 'leave', 'dispose'] as const)('ignores a pending validation result after %s', async (action) => {
        const { injector, commandService, alerts, setValue, addRule, hoverCell, dataValidationModel, workbook, rule } = createAlertTestBed();
        const controller = injector.get(DataValidationAlertController);
        setValue(1);
        addRule();
        hoverCell(0);
        await vi.advanceTimersByTimeAsync(120);
        expect(alerts.currentAlert.size).toBe(1);

        setValue(2);
        expect(dataValidationModel.validator(rule, {
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 0,
            col: 0,
            workbook,
            worksheet: workbook.getActiveSheet(),
        })).toBe(DataValidationStatus.VALIDATING);
        if (action === 'undo') {
            expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
        } else if (action === 'leave') {
            hoverCell(null);
        } else {
            controller.dispose();
        }
        await vi.advanceTimersByTimeAsync(120);
        expect(alerts.currentAlert.size).toBe(0);
    });

    it.each(['active', 'inactive', 'disposed', 'switched-after-open'] as const)('handles delayed validation hover for a %s worksheet', async (state) => {
        vi.useFakeTimers();
        const { univer, injector, workbook, commandService, dataValidationModel } = createDvUiTestBed();
        try {
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
            injector.add([IRefSelectionsService, { useClass: RefSelectionsService }]);
            injector.add([SheetCanvasPopManagerService]);
            injector.add([CellPopupManagerService]);
            injector.add([CellAlertManagerService]);
            injector.add([HoverManagerService]);
            injector.add([DataValidationAlertController]);
            injector.get(LocaleService).load({ enUS });
            injector.get(DataValidationAlertController);
            const rule = {
                uid: 'delayed-alert-rule',
                type: DataValidationType.DECIMAL,
                operator: DataValidationOperator.GREATER_THAN,
                formula1: '111',
                ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            };
            commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                cellValue: { 0: { 0: { v: 1 } } },
            });
            commandService.syncExecuteCommand(AddSheetDataValidationCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                rule,
            });
            const location = { unitId: 'test', subUnitId: 'sheet1', row: 0, col: 0 };
            const validation = { ...location, workbook, worksheet: workbook.getActiveSheet() };
            dataValidationModel.validator(rule, validation);
            await vi.advanceTimersByTimeAsync(0);
            expect(dataValidationModel.validator(rule, validation)).toBe(DataValidationStatus.INVALID);
            const hover = injector.get(HoverManagerService);
            const input = hover as unknown as { _currentCell$: Subject<IHoverCellPosition> };
            input._currentCell$.next({ location } as IHoverCellPosition);
            if (state === 'inactive') {
                workbook.setActiveSheet(workbook.getSheetBySheetId('sheet2')!);
            } else if (state === 'disposed') {
                injector.get(IUniverInstanceService).disposeUnit(workbook.getUnitId());
            }
            await vi.advanceTimersByTimeAsync(120);
            const alerts = injector.get(CellAlertManagerService);
            expect(alerts.currentAlert.size).toBe(state === 'active' || state === 'switched-after-open' ? 1 : 0);
            if (state === 'switched-after-open') {
                workbook.setActiveSheet(workbook.getSheetBySheetId('sheet2')!);
                expect(alerts.currentAlert.size).toBe(0);
            }
            if (state === 'active') {
                hover.triggerScroll();
                await vi.advanceTimersByTimeAsync(120);
                expect(alerts.currentAlert.size).toBe(0);
            }
        } finally {
            univer.dispose();
        }
    });
});
