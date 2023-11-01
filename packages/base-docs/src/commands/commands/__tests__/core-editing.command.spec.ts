/* eslint-disable no-magic-numbers */

import { ICommandService, Univer } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetInlineFormatBoldCommand } from '../inline-format.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('example', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetInlineFormatBoldCommand);
    });

    afterEach(() => univer.dispose());

    describe('XXX', () => {
        it('Should XXX', async () => {
            expect(true).toBe(true);
        });
    });
});
