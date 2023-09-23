import { ICommandService, Univer } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, it } from 'vitest';

import { SetBoldCommand } from '../set-style.command';
import { createCommandTestBed } from '../testing/create-command-test-bed';

describe('test style command', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
    });

    afterEach(() => {
        // TODO: should dispose Univer instance
    });

    describe('bold', () => {
        describe('correct situations', () => {
            it('will toggle bold style when there is a selected range', () => {
                commandService.executeCommand(SetBoldCommand.id);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', () => {});
        });
    });
});
