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
import { ICommandService, IUniverInstanceService, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetWorksheetNameMutation } from '../../mutations/set-worksheet-name.mutation';
import { SetWorksheetNameCommand } from '../set-worksheet-name.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test set worksheet name commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetWorksheetNameMutation);
        commandService.registerCommand(SetWorksheetNameCommand);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('set worksheet name', () => {
        describe('set worksheet name', async () => {
            it('correct situation: ', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');

                expect(
                    await commandService.executeCommand(SetWorksheetNameCommand.id, {
                        unitId: 'test',
                        subUnitId: 'sheet1',
                        name: 'new name',
                    })
                ).toBeTruthy();

                expect(workbook.getSheetBySheetId('sheet1')?.getConfig().name).toEqual('new name');

                // undo;
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(workbook.getSheetBySheetId('sheet1')?.getConfig().name).toEqual('sheet1');
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(workbook.getSheetBySheetId('sheet1')?.getConfig().name).toEqual('new name');
            });
        });
    });
});
