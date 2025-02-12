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

import type { Injector, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RedoCommand, UndoCommand } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetTabColorCommand } from '../set-tab-color.command';
import { SetTabColorMutation } from '../../mutations/set-tab-color.mutation';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test tab color commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetTabColorCommand);
        commandService.registerCommand(SetTabColorMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('Set several specific colors', () => {
        function getTabColor() {
            return get(IUniverInstanceService).getUniverSheetInstance('test')?.getActiveSheet()?.getTabColor();
        }

        describe('correct situations', () => {
            it('will set tab color', async () => {
                expect(await commandService.executeCommand(SetTabColorCommand.id, { value: '#cccccc' })).toBeTruthy();
                expect(getTabColor()).toBe('#cccccc');

                expect(await commandService.executeCommand(SetTabColorCommand.id, { value: 'red' })).toBeTruthy();
                expect(getTabColor()).toBe('red');
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getTabColor()).toBe('#cccccc');
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getTabColor()).toBe('red');
            });
        });
    });
});
