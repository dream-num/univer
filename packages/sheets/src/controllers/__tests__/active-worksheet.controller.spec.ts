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

import { ICommandService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import { RemoveSheetMutation } from '../../commands/mutations/remove-sheet.mutation';
import { SetWorksheetActiveOperation } from '../../commands/operations/set-worksheet-active.operation';
import { ActiveWorksheetController } from '../active-worksheet.controller';

describe('ActiveWorksheetController', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;

    beforeEach(() => {
        testBed = createCommandTestBed(undefined, [[ActiveWorksheetController]]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(RemoveSheetMutation);
        commandService.registerCommand(SetWorksheetActiveOperation);
        testBed.get(ActiveWorksheetController);
        testBed.sheet.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'sheet2' });
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('switches away from an active worksheet before disposing it', () => {
        const commandService = testBed.get(ICommandService);
        const workbook = testBed.sheet;
        const activeSheetIdsAtDisposal: string[] = [];
        workbook.sheetDisposed$.subscribe(() => {
            activeSheetIdsAtDisposal.push(workbook.getActiveSheet().getSheetId());
        });

        expect(commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet2',
        })).toBe(true);
        expect(commandService.syncExecuteCommand(RemoveSheetMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet2',
        })).toBe(true);

        expect(activeSheetIdsAtDisposal).toEqual(['sheet1']);
        expect(workbook.getActiveSheet().getSheetId()).toBe('sheet1');
    });

    it('switches to the next worksheet when removing the first worksheet', () => {
        const commandService = testBed.get(ICommandService);
        const workbook = testBed.sheet;
        const activeSheetIdsAtDisposal: string[] = [];
        workbook.sheetDisposed$.subscribe(() => {
            activeSheetIdsAtDisposal.push(workbook.getActiveSheet().getSheetId());
        });

        expect(commandService.syncExecuteCommand(RemoveSheetMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        expect(activeSheetIdsAtDisposal).toEqual(['sheet2']);
        expect(workbook.getActiveSheet().getSheetId()).toBe('sheet2');
    });

    it('keeps the active worksheet when removing a different worksheet', () => {
        const commandService = testBed.get(ICommandService);
        const workbook = testBed.sheet;
        const activeSheetIdsAtDisposal: string[] = [];
        workbook.sheetDisposed$.subscribe(() => {
            activeSheetIdsAtDisposal.push(workbook.getActiveSheet().getSheetId());
        });

        expect(commandService.syncExecuteCommand(RemoveSheetMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet2',
        })).toBe(true);

        expect(activeSheetIdsAtDisposal).toEqual(['sheet1']);
        expect(workbook.getActiveSheet().getSheetId()).toBe('sheet1');
    });
});
