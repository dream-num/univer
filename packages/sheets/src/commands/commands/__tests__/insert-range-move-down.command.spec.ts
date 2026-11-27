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

import { ICommandService, LocaleService, LocaleType, RedoCommand, UndoCommand } from '@univerjs/core';
import { describe, expect, it, onTestFinished } from 'vitest';
import enUS from '../../../locale/en-US';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { INTERCEPTOR_POINT } from '../../../services/sheet-interceptor/interceptor-const';
import { SheetInterceptorService } from '../../../services/sheet-interceptor/sheet-interceptor.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { InsertRowMutation } from '../../mutations/insert-row-col.mutation';
import { MoveRangeMutation } from '../../mutations/move-range.mutation';
import { RemoveRowMutation } from '../../mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { InsertRangeMoveDownCommand } from '../insert-range-move-down.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('InsertRangeMoveDownCommand', () => {
    it('inherits persisted row height from a filtered anchor through undo and redo', async () => {
        const bed = createCommandTestBed({
            id: 'test',
            name: 'Test',
            appVersion: '',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet'],
            sheets: {
                sheet: { id: 'sheet', rowCount: 4, columnCount: 2, rowData: { 2: { h: 37 } }, cellData: { 3: { 0: { v: 'tail' } } } },
            },
        });
        onTestFinished(() => bed.univer.dispose());
        const locale = bed.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const commands = bed.get(ICommandService);
        for (const command of [InsertRangeMoveDownCommand, InsertRowMutation, RemoveRowMutation, SetSelectionsOperation, SetRangeValuesMutation, MoveRangeMutation, AddWorksheetMergeMutation, RemoveWorksheetMergeMutation]) {
            commands.registerCommand(command);
        }
        bed.get(SheetInterceptorService).intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
            handler: (value, { row }, next) => next(value || row === 2),
        });
        bed.get(SheetsSelectionsService).setSelections('test', 'sheet', [{
            range: { startRow: 3, endRow: 3, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
        const worksheet = bed.sheet.getActiveSheet()!;
        expect(worksheet.getRowHeight(2)).toBe(0);
        expect(await commands.executeCommand(InsertRangeMoveDownCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(4, 0)?.v).toBe('tail');
        expect(worksheet.getRowManager().getRowHeight(4)).toBe(37);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getRowCount()).toBe(4);
        expect(worksheet.getCellRaw(3, 0)?.v).toBe('tail');
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getCellRaw(4, 0)?.v).toBe('tail');
        expect(worksheet.getRowManager().getRowHeight(4)).toBe(37);
    });
});
