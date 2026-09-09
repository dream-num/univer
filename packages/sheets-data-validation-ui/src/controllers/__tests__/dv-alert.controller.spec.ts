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

import type { IHoverCellPosition } from '@univerjs/sheets-ui';
import type { Subject } from 'rxjs';
import {
    DataValidationOperator,
    DataValidationStatus,
    DataValidationType,
    IUniverInstanceService,
    LocaleService,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, RefSelectionsService, SetRangeValuesMutation } from '@univerjs/sheets';
import { AddSheetDataValidationCommand } from '@univerjs/sheets-data-validation';
import {
    CellAlertManagerService,
    CellPopupManagerService,
    HoverManagerService,
    SheetCanvasPopManagerService,
} from '@univerjs/sheets-ui';
import { CanvasPopupService, ICanvasPopupService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDvUiTestBed } from '../../__tests__/create-dv-ui-test-bed';
import enUS from '../../locale/en-US';
import { DataValidationAlertController } from '../dv-alert.controller';

afterEach(() => {
    vi.useRealTimers();
});

describe('DataValidationAlertController', () => {
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
