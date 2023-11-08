// test for set worksheet name command
import { ICommandService, IUniverInstanceService, RedoCommand, UndoCommand, Univer } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetWorksheetNameCommand, SetWorksheetNameMutation } from '../../..';
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
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');

                expect(
                    await commandService.executeCommand(SetWorksheetNameCommand.id, {
                        workbookId: 'test',
                        worksheetId: 'sheet1',
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
