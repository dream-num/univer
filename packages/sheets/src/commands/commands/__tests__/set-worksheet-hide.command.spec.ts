import type { Univer } from '@univerjs/core';
import { BooleanNumber, ICommandService, IUniverInstanceService, RedoCommand, UndoCommand } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { InsertSheetMutation } from '../../mutations/insert-sheet.mutation';
import { SetWorksheetActivateMutation } from '../../mutations/set-worksheet-activate.mutation';
import { SetWorksheetHideMutation } from '../../mutations/set-worksheet-hide.mutation';
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
        commandService.registerCommand(SetWorksheetActivateMutation);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('Set worksheet hide', () => {
        it('will set current active worksheet hidden', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
            if (!workbook) throw new Error('This is an error');

            const targetActiveSheet = workbook.getActiveSheet();
            const targetSheetId = targetActiveSheet?.getSheetId();

            expect(
                await commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId: targetSheetId })
            ).toBeTruthy();

            expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();

            expect(
                await commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId: targetSheetId })
            ).toBeTruthy();
            expect(
                await commandService.executeCommand(SetWorksheetHideCommand.id, {
                    worksheetId: targetSheetId,
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
