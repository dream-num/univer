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

import type { Injector, Univer, Workbook } from '@univerjs/core';
import { BooleanNumber, ICommandService, IUniverInstanceService, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { InsertSheetMutation } from '../../mutations/insert-sheet.mutation';
import { SetWorksheetHideMutation } from '../../mutations/set-worksheet-hide.mutation';
import { SetWorksheetActiveOperation } from '../../operations/set-worksheet-active.operation';
import { InsertSheetCommand } from '../insert-sheet.command';
import { SetWorksheetActivateCommand } from '../set-worksheet-activate.command';
import { SetWorksheetHideCommand } from '../set-worksheet-hide.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test set worksheet hide commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetWorksheetHideCommand);
        commandService.registerCommand(SetWorksheetHideMutation);
        commandService.registerCommand(SetWorksheetActivateCommand);
        commandService.registerCommand(SetWorksheetActiveOperation);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('Set worksheet hide', () => {
        it('will set current active worksheet hidden', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            if (!workbook) throw new Error('This is an error');

            const targetActiveSheet = workbook.getActiveSheet();
            const targetSheetId = targetActiveSheet?.getSheetId();

            expect(
                await commandService.executeCommand(SetWorksheetActivateCommand.id, { subUnitId: targetSheetId })
            ).toBeTruthy();

            expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();

            expect(
                await commandService.executeCommand(SetWorksheetActivateCommand.id, { subUnitId: targetSheetId })
            ).toBeTruthy();
            expect(
                await commandService.executeCommand(SetWorksheetHideCommand.id, {
                    subUnitId: targetSheetId,
                })
            ).toBeTruthy();

            expect(targetActiveSheet?.getConfig().hidden).toBe(BooleanNumber.TRUE);

            // undo
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(targetActiveSheet?.getConfig().hidden).toBe(BooleanNumber.FALSE);
            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(targetActiveSheet?.getConfig().hidden).toBe(BooleanNumber.TRUE);
        });
    });
});
