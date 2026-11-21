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

import type { ISheetValueChangeContext } from '@univerjs/sheets';
import { DataValidationErrorStyle, DataValidationOperator, DataValidationType, UndoCommand } from '@univerjs/core';
import { AddDataValidationMutation } from '@univerjs/data-validation';
import { SetRangeValuesCommand, SheetInterceptorService } from '@univerjs/sheets';
import { ApplyTableAutoExpandMutation, SheetTableAutoExpandService, TableManager } from '@univerjs/sheets-table';
import { IDialogService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDvUiTestBed } from '../../__tests__/create-dv-ui-test-bed';
import { DataValidationRejectInputController } from '../dv-reject-input.controller';
import { DataValidationTableAutoExpandController } from '../dv-table-auto-expand.controller';

const original = { startRow: 2, endRow: 5, startColumn: 2, endColumn: 4 };
describe('DataValidationTableAutoExpandController', () => {
    let bed: ReturnType<typeof createDvUiTestBed>;
    let service: SheetTableAutoExpandService;
    let context: ISheetValueChangeContext;
    beforeEach(() => {
        bed = createDvUiTestBed();
        bed.injector.add([DataValidationTableAutoExpandController]);
        bed.injector.get(DataValidationTableAutoExpandController);
        bed.injector.add([TableManager]);
        bed.injector.add([SheetTableAutoExpandService]);

        bed.injector.get(TableManager).addTable('test', 'sheet1', 'Orders', original, ['Item', 'Qty', 'Total'], 'orders');
        service = bed.injector.get(SheetTableAutoExpandService);

        context = { unitId: 'test', subUnitId: 'sheet1', source: 'paste', ranges: [{ startRow: 6, endRow: 6, startColumn: 2, endColumn: 2 }], contentWrites: { 6: { 2: { v: 'Input' } } }, beforeCells: { 6: { 2: null } }, explicitStyleRanges: [], explicitValidationRanges: [] };
        bed.injector.get(SheetInterceptorService).onValueChange(context);
    });
    afterEach(() => bed.univer.dispose());

    function rule(uid: string, startRow = 3, endRow = 5, formula1 = '1') {
        bed.commandService.syncExecuteCommand(AddDataValidationMutation.id, { unitId: 'test', subUnitId: 'sheet1', rule: {
            uid,
            type: DataValidationType.DECIMAL,
            operator: DataValidationOperator.GREATER_THAN,
            formula1,
            errorStyle: DataValidationErrorStyle.STOP,
            showErrorMessage: true,
            ranges: [{ startRow, endRow, startColumn: 3, endColumn: 3 }],
        } });
    }

    it('extends equivalent rules regardless of UID without writing default cell values', () => {
        rule('first', 3, 3);
        rule('rest', 4, 5);
        const patch = service.prepare(context)[0];
        expect(patch.redoEffects).toHaveLength(1);
        expect(patch.redoEffects[0].id).toBe(AddDataValidationMutation.id);
        for (const mutation of patch.redoEffects) bed.commandService.syncExecuteCommand(mutation.id, mutation.params);
        expect(bed.dataValidationModel.getRuleByLocation('test', 'sheet1', 6, 3)?.formula1).toBe('1');
        expect(bed.workbook.getActiveSheet()!.getCellRaw(6, 3)?.v).toBeUndefined();
        for (const mutation of patch.undoEffects) bed.commandService.syncExecuteCommand(mutation.id, mutation.params);
        expect(bed.dataValidationModel.getRuleByLocation('test', 'sheet1', 6, 3)).toBeUndefined();
        expect(bed.dataValidationModel.getRuleByLocation('test', 'sheet1', 3, 3)?.uid).toBe('first');
    });

    it('captures sheet names with inherited validation effects for deterministic reference rebasing', () => {
        bed.workbook.addWorksheet('other', 1, { id: 'other', name: 'Other', rowCount: 30, columnCount: 20, cellData: {} });
        rule('source');
        const patch = service.prepare(context)[0];
        expect(patch.redoEffects.find((entry) => entry.id === AddDataValidationMutation.id)?.params).toMatchObject({ formulaSheetNames: { sheet1: bed.workbook.getSheetBySheetId('sheet1')!.getName(), other: 'Other' } });
    });

    it('does not infer mixed rules or override explicit validation writes', () => {
        rule('first', 3, 3);
        rule('rest', 4, 5, '2');
        expect(service.prepare(context)[0].redoEffects).toEqual([]);
        rule('same', 3, 5);
        context.explicitValidationRanges = [{ startRow: 6, endRow: 6, startColumn: 3, endColumn: 3 }];
        expect(service.prepare(context)[0].redoEffects).toEqual([]);
    });

    it.each([DataValidationErrorStyle.STOP, DataValidationErrorStyle.WARNING])('preserves a preexisting target validation rule with error style %s', (errorStyle) => {
        rule('source', 3, 5, '0');
        rule('target', 6, 6, '10');
        const target = bed.dataValidationModel.getRuleByLocation('test', 'sheet1', 6, 3)!;
        target.errorStyle = errorStyle;
        const patch = service.prepare(context)[0];
        for (const mutation of patch.redoEffects) bed.commandService.syncExecuteCommand(mutation.id, mutation.params);
        expect(bed.dataValidationModel.getRuleByLocation('test', 'sheet1', 6, 3)).toMatchObject({ uid: 'target', formula1: '10', errorStyle });
    });

    it('keeps legal editor input under inherited STOP validation and undoes the complete patch once', async () => {
        rule('source');
        const interceptor = bed.injector.get(SheetInterceptorService);
        bed.injector.add([IDialogService, { useValue: { open: vi.fn(), close: vi.fn() } as never }]);
        bed.injector.add([DataValidationRejectInputController]);
        bed.injector.get(DataValidationRejectInputController);
        bed.commandService.registerCommand(ApplyTableAutoExpandMutation);
        interceptor.interceptValueChange((ctx) => service.prepare(ctx).map((patch) => ({
            redo: { id: ApplyTableAutoExpandMutation.id, params: { unitId: patch.unitId, subUnitId: patch.subUnitId, patch, direction: 'redo' } },
            undo: { id: ApplyTableAutoExpandMutation.id, params: { unitId: patch.unitId, subUnitId: patch.subUnitId, patch, direction: 'undo' } },
        })));
        const sheet = bed.workbook.getActiveSheet()!;
        const before = interceptor.captureCellValidation(bed.workbook, sheet, 6, 3);
        expect(bed.commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 6, endRow: 6, startColumn: 3, endColumn: 3 },
            value: { v: 0 },
            valueChangeSource: 'editor',
        })).toBe(true);
        expect(bed.injector.get(TableManager).getTable('test', 'orders')!.getRange().endRow).toBe(6);
        expect(bed.dataValidationModel.getRuleByLocation('test', 'sheet1', 6, 3)).toBeDefined();
        expect(sheet.getCellRaw(6, 3)?.v).toBe(0);
        expect(await interceptor.onValidateCell(bed.workbook, sheet, 6, 3, before)).toBe(true);
        expect(await interceptor.onValidateCell(bed.workbook, sheet, 6, 3)).toBe(false);
        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(bed.injector.get(TableManager).getTable('test', 'orders')!.getRange()).toEqual(original);
        expect(bed.dataValidationModel.getRuleByLocation('test', 'sheet1', 6, 3)).toBeUndefined();
        expect(sheet.getCellRaw(6, 3)?.v).toBeFalsy();
    });
});
