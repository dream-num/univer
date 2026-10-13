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

import type { ICellData, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISetFormulaCalculationNotificationMutation } from '@univerjs/engine-formula';
import type { ICellAlert } from '@univerjs/sheets-ui';
import { CellValueType, ICommandService, LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder, SetFormulaCalculationNotificationMutation } from '@univerjs/engine-formula';
import { getPrimaryForRange, SetWorkbookCalculationSettingsMutation, SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { CellAlertManagerService, CellAlertType, IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { IDialogService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CalculationOptionsOperation } from '../../commands/operations/calculation-options.operation';
import enUS from '../../locale/en-US';
import { CALCULATION_OPTIONS_COMPONENT } from '../../views/calculation-options/interface';
import { FormulaAlertRenderController } from '../formula-alert-render.controller';

function createController() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'u',
        name: 'Test',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        sheetOrder: ['s'],
        styles: {},
        sheets: { s: { id: 's', name: 'Sheet1', rowCount: 20, columnCount: 20, cellData: { 0: { 0: { f: '=1/0', v: '#DIV/0!', t: CellValueType.STRING } } } } },
    });
    const worksheet = workbook.getActiveSheet();
    const getCell = vi.spyOn(worksheet, 'getCell');
    const alerts = new Map<string, { alert: ICellAlert }>();
    const showAlert = vi.fn((alert: ICellAlert) => alerts.set(alert.key, { alert }));
    const editor$ = new Subject<void>();
    let editing = false;
    const openDialog = vi.fn();
    const resetCache = vi.fn();
    const reCalculate = vi.fn();
    // These providers represent the renderer and editor, unavailable in this model test.
    injector.add([CellAlertManagerService, { useValue: {
        currentAlert: alerts,
        showAlert,
        removeAlert: (key: string) => alerts.delete(key),
    } as never }]);
    injector.add([IEditorBridgeService, { useValue: {
        visible$: editor$,
        isVisible: () => ({ visible: editing }),
    } as never }]);
    injector.add([IDialogService, { useValue: { open: openDialog, close: vi.fn() } as never }]);
    injector.add([SheetsSelectionsService]);
    injector.add([SheetSkeletonService, { useValue: { getSkeletonsByUnitId: () => [{ resetCache }] } as never }]);
    injector.add([SheetSkeletonManagerService, { useValue: { reCalculate } as never }]);
    injector.add([LexerTreeBuilder]);
    injector.add([FormulaDataModel]);
    injector.add([FormulaAlertRenderController, {
        useFactory: () => injector.createInstance(FormulaAlertRenderController, { unit: workbook } as never),
    }]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const commands = injector.get(ICommandService);
    commands.registerCommand(SetFormulaCalculationNotificationMutation);
    commands.registerCommand(CalculationOptionsOperation);
    commands.registerCommand(SetWorkbookCalculationSettingsMutation);
    const controller = injector.get(FormulaAlertRenderController);
    getCell.mockClear();
    function notify(params: ISetFormulaCalculationNotificationMutation) {
        commands.syncExecuteCommand(SetFormulaCalculationNotificationMutation.id, params);
    }
    return {
        controller,
        injector,
        univer,
        showAlert,
        alerts,
        worksheet,
        openDialog,
        resetCache,
        reCalculate,
        focus(row = 0) {
            const range = { startRow: row, endRow: row, startColumn: 0, endColumn: 0 };
            injector.get(SheetsSelectionsService).setSelections('u', 's', [{
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            }]);
        },
        setCell(next: ICellData) {
            worksheet.getCellMatrix().setValue(0, 0, next);
            notify({ circularReferences: [] });
        },
        setEditing(value: boolean) {
            editing = value;
            editor$.next();
        },
        setEnabled(value: boolean) {
            commands.syncExecuteCommand(SetWorkbookCalculationSettingsMutation.id, {
                unitId: 'u',
                settings: { ...workbook.getCalculationSettings(), iterativeCalculation: value },
            });
        },
        notify,
    };
}

describe('FormulaAlertRenderController', () => {
    const disposables: Array<() => void> = [];
    afterEach(() => disposables.splice(0).forEach((dispose) => dispose()));
    function setup() {
        const bed = createController();
        disposables.push(() => {
            bed.controller.dispose();
            bed.univer.dispose();
        });
        return bed;
    }

    it('checks the focused cell and retains the same alert on repeated focus', () => {
        const bed = setup();
        expect(bed.worksheet.getCell).not.toHaveBeenCalled();
        bed.focus();
        expect(bed.showAlert).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Error',
            message: 'Divide by zero error',
            location: { unitId: 'u', subUnitId: 's', row: 0, col: 0 },
        }));
        bed.focus();
        expect(bed.showAlert).toHaveBeenCalledTimes(1);
        bed.focus(1);
        expect(bed.alerts.size).toBe(0);
        bed.focus();
        expect(bed.showAlert).toHaveBeenCalledTimes(2);
    });

    it('refreshes an unchanged focus after calculation and opens the shared settings operation', () => {
        const bed = setup();
        bed.setCell({ f: '=A1', v: 0, t: CellValueType.NUMBER });
        bed.focus();
        expect(bed.alerts.size).toBe(0);
        bed.notify({ circularReferences: [{ unitId: 'u', sheetId: 's', row: 0, column: 0, groupId: 'g', iterations: 0 }] });
        const alert = bed.alerts.get('SHEET_FORMULA_ALERT:u')!.alert;
        expect(alert.type).toBe(CellAlertType.ERROR);
        expect(bed.resetCache).toHaveBeenCalledTimes(1);
        expect(bed.reCalculate).toHaveBeenCalledTimes(1);
        expect(alert.action?.label).toBe('Iterative Calculation');
        alert.action!.onSelect();
        expect(bed.openDialog).toHaveBeenCalledWith(expect.objectContaining({
            children: { label: { name: CALCULATION_OPTIONS_COMPONENT, props: { unitId: 'u' } } },
        }));
        bed.setEnabled(true);
        expect(bed.alerts.size).toBe(0);
        expect(bed.resetCache).toHaveBeenCalledTimes(2);
        bed.setEnabled(false);
        expect(bed.alerts.size).toBe(1);
        expect(bed.resetCache).toHaveBeenCalledTimes(3);
        bed.notify({ circularReferences: [] });
        expect(bed.alerts.size).toBe(0);
        expect(bed.resetCache).toHaveBeenCalledTimes(4);
    });

    it('closes during editing and when the error or cycle disappears', () => {
        const bed = setup();
        bed.focus();
        bed.setEditing(true);
        expect(bed.alerts.size).toBe(0);
        bed.setEditing(false);
        expect(bed.alerts.size).toBe(1);
        bed.setCell({ f: '=1', v: 1, t: CellValueType.NUMBER });
        expect(bed.alerts.size).toBe(0);
        bed.notify({ circularReferences: [] });
        expect(bed.alerts.size).toBe(0);
    });
});
