import { ICommandService, ICurrentUniverService, Univer } from '@univerjs/core';
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
            return get(ICurrentUniverService)
                .getUniverSheetInstance('test')
                ?.getWorkBook()
                ?.getActiveSheet()
                ?.getTabColor();
        }
        describe('correct situations', () => {
            it('will set tab color to #cccccc', async () => {
                expect(await commandService.executeCommand(SetTabColorCommand.id, { value: '#cccccc' })).toBeTruthy();
                expect(getTabColor()).toBe('#cccccc');
            });
            it('will set tab color to red', async () => {
                expect(await commandService.executeCommand(SetTabColorCommand.id, { value: 'red' })).toBeTruthy();
                expect(getTabColor()).toBe('red');
            });
        });
    });
});
