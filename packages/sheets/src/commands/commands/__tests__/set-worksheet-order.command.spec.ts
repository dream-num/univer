// test for set worksheet name command
import type { Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RedoCommand, UndoCommand } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { InsertSheetMutation } from '../../mutations/insert-sheet.mutation';
import { SetWorksheetOrderMutation } from '../../mutations/set-worksheet-order.mutation';
import { SetWorksheetActiveOperation } from '../../operations/set-worksheet-active.operation';
import { InsertSheetCommand } from '../insert-sheet.command';
import { SetWorksheetActivateCommand } from '../set-worksheet-activate.command';
import { SetWorksheetOrderCommand } from '../set-worksheet-order.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test set worksheet order commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetWorksheetOrderCommand);
        commandService.registerCommand(SetWorksheetOrderMutation);
        commandService.registerCommand(SetWorksheetActivateCommand);
        commandService.registerCommand(SetWorksheetActiveOperation);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('set worksheet order', () => {
        describe('set worksheet order', async () => {
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
                    await commandService.executeCommand(SetWorksheetOrderCommand.id, {
                        order: 2,
                        workbookId: 'test',
                        worksheetId: 'sheet1',
                    })
                ).toBeTruthy();

                expect(workbook.getConfig().sheetOrder.indexOf('sheet1')).toEqual(2);
                // undo;
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(workbook.getConfig().sheetOrder.indexOf('sheet1')).toEqual(0);
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(workbook.getConfig().sheetOrder.indexOf('sheet1')).toEqual(2);
            });
        });
    });
});
