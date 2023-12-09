// test for remove sheet command
import type { Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RedoCommand, UndoCommand } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { InsertSheetMutation } from '../../mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../../mutations/remove-sheet.mutation';
import { SetWorksheetActiveOperation } from '../../operations/set-worksheet-active.operation';
import { InsertSheetCommand } from '../insert-sheet.command';
import { RemoveSheetCommand } from '../remove-sheet.command';
import { SetWorksheetActivateCommand } from '../set-worksheet-activate.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test remove worksheet commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(RemoveSheetCommand);
        commandService.registerCommand(RemoveSheetMutation);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(SetWorksheetActivateCommand);
        commandService.registerCommand(SetWorksheetActiveOperation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('remove sheet', () => {
        describe('remove the only sheet', async () => {
            it('will be not working if there is only one sheet', async () => {
                expect(
                    await commandService.executeCommand(RemoveSheetCommand.id, {
                        workbookId: 'test',
                        sheetId: 'sheet1',
                    })
                ).toBeFalsy();
            });
            it('will be working if there are more than one sheet', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');

                const targetActiveSheet = workbook.getActiveSheet();
                const targetSheetId = targetActiveSheet?.getSheetId();
                expect(
                    await commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId: targetSheetId })
                ).toBeTruthy();

                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(
                    await commandService.executeCommand(RemoveSheetCommand.id, {
                        workbookId: 'test',
                        sheetId: 'sheet1',
                    })
                ).toBeTruthy();

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(workbook.getSheetSize()).toBe(2);
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(workbook.getSheetSize()).toBe(1);
            });
        });
    });
});
