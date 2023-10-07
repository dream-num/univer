import { ICommandService, ICurrentUniverService, RedoCommand, UndoCommand, Univer } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetTabColorMutation } from '../../..';
import { SetTabColorCommand } from '../set-tab-color.command';
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
            return get(ICurrentUniverService).getUniverSheetInstance('test')?.getActiveSheet()?.getTabColor();
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
