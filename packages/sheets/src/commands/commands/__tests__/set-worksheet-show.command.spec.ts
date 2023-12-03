// test for remove sheet command
import type { Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RedoCommand, UndoCommand } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { InsertSheetMutation } from '../../mutations/insert-sheet.mutation';
import { SetWorksheetActivateMutation } from '../../mutations/set-worksheet-activate.mutation';
import { SetWorksheetHideMutation } from '../../mutations/set-worksheet-hide.mutation';
import { InsertSheetCommand } from '../insert-sheet.command';
import { SetWorksheetActivateCommand } from '../set-worksheet-activate.command';
import { SetWorksheetHideCommand } from '../set-worksheet-hide.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test set worksheet show commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(SetWorksheetActivateMutation);
        commandService.registerCommand(SetWorksheetActivateCommand);
        commandService.registerCommand(SetWorksheetHideCommand);
        commandService.registerCommand(SetWorksheetHideMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('set sheet show', () => {
        describe('set sheet show after make it hidden', async () => {
            it('correct situation: ', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');

                const targetActiveSheet = workbook.getActiveSheet();
                const targetSheetId = targetActiveSheet?.getSheetId();
                expect(
                    await commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId: targetSheetId })
                ).toBeTruthy();

                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetWorksheetHideCommand.id, { worksheetId: targetSheetId })
                ).toBeTruthy();

                expect(workbook.getSheetBySheetId(targetSheetId)?.getConfig().hidden).toBeTruthy();

                // undo;
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(workbook.getSheetBySheetId(targetSheetId)?.getConfig().hidden).toBeFalsy();
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(workbook.getSheetBySheetId(targetSheetId)?.getConfig().hidden).toBeTruthy();
            });
        });
    });
});
