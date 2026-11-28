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

import { DataValidationErrorStyle, DataValidationOperator, DataValidationType } from '@univerjs/core';
import { AddDataValidationMutation } from '@univerjs/data-validation';
import { SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { IDialogService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDvUiTestBed } from '../../__tests__/create-dv-ui-test-bed';
import { DataValidationRejectInputController } from '../dv-reject-input.controller';

describe('DataValidationRejectInputController', () => {
    let bed: ReturnType<typeof createDvUiTestBed>;
    let interceptor: SheetInterceptorService;
    let open: ReturnType<typeof vi.fn>;
    beforeEach(() => {
        bed = createDvUiTestBed();
        open = vi.fn();
        bed.injector.add([IDialogService, { useValue: { open, close: vi.fn() } as never }]);
        bed.injector.add([DataValidationRejectInputController]);
        interceptor = bed.injector.get(SheetInterceptorService);
        bed.injector.get(DataValidationRejectInputController);
    });
    afterEach(() => bed.univer.dispose());
    function addRule(style = DataValidationErrorStyle.STOP) {
        bed.commandService.syncExecuteCommand(AddDataValidationMutation.id, { unitId: 'test', subUnitId: 'sheet1', rule: {
            uid: 'strict',
            type: DataValidationType.DECIMAL,
            operator: DataValidationOperator.GREATER_THAN,
            formula1: '1',
            errorStyle: style,
            showErrorMessage: true,
            ranges: [{ startRow: 6, endRow: 6, startColumn: 3, endColumn: 3 }],
        } });
    }
    it('does not retroactively reject this input under a newly inherited STOP rule, but rejects the next edit', async () => {
        const sheet = bed.workbook.getActiveSheet()!;
        const before = interceptor.captureCellValidation(bed.workbook, sheet, 6, 3);
        bed.commandService.syncExecuteCommand(SetRangeValuesMutation.id, { unitId: 'test', subUnitId: 'sheet1', cellValue: { 6: { 3: { v: 0 } } } });
        addRule();
        expect(await interceptor.onValidateCell(bed.workbook, sheet, 6, 3, before)).toBe(true);
        expect(open).not.toHaveBeenCalled();
        expect(await interceptor.onValidateCell(bed.workbook, sheet, 6, 3)).toBe(false);
        expect(open).toHaveBeenCalledWith(expect.objectContaining({ id: 'reject-input-dialog' }));
    });
    it('keeps preexisting STOP validation and allows valid values', async () => {
        addRule();
        const sheet = bed.workbook.getActiveSheet()!;
        const before = interceptor.captureCellValidation(bed.workbook, sheet, 6, 3);
        bed.commandService.syncExecuteCommand(SetRangeValuesMutation.id, { unitId: 'test', subUnitId: 'sheet1', cellValue: { 6: { 3: { v: 0 } } } });
        expect(await interceptor.onValidateCell(bed.workbook, sheet, 6, 3, before)).toBe(false);
        bed.commandService.syncExecuteCommand(SetRangeValuesMutation.id, { unitId: 'test', subUnitId: 'sheet1', cellValue: { 6: { 3: { v: 5 } } } });
        expect(await interceptor.onValidateCell(bed.workbook, sheet, 6, 3, before)).toBe(true);
    });
    it('allows warning rules and uses the existing rejection dialog', async () => {
        addRule(DataValidationErrorStyle.WARNING);
        const sheet = bed.workbook.getActiveSheet()!;
        bed.commandService.syncExecuteCommand(SetRangeValuesMutation.id, { unitId: 'test', subUnitId: 'sheet1', cellValue: { 6: { 3: { v: 0 } } } });
        expect(await interceptor.onValidateCell(bed.workbook, sheet, 6, 3)).toBe(true);
        bed.injector.get(DataValidationRejectInputController).showReject('Bad input');
        expect(open).toHaveBeenLastCalledWith(expect.objectContaining({ children: { title: 'Bad input' } }));
    });
});
