// test for copy sheet command
import { ICommandService, IUniverInstanceService, RedoCommand, UndoCommand, Univer, Worksheet } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
    CopySheetCommand,
    InsertSheetMutation,
    RemoveSheetCommand,
    RemoveSheetMutation,
    SetWorksheetActivateCommand,
    SetWorksheetActivateMutation,
} from '../../..';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test copy worksheet commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(CopySheetCommand);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(SetWorksheetActivateMutation);
        commandService.registerCommand(SetWorksheetActivateCommand);
        commandService.registerCommand(RemoveSheetCommand);
        commandService.registerCommand(RemoveSheetMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('copy sheet', () => {
        describe('copy the only sheet', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');
                function getSheetCopyPart(sheet: Worksheet) {
                    const config = sheet.getConfig();
                    const { id, name, status, ...rest } = config;
                    return rest;
                }

                expect(
                    await commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId: 'sheet1' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(CopySheetCommand.id, {
                        workbookId: 'test',
                        worksheetId: 'sheet1',
                    })
                ).toBeTruthy();

                const [oldSheet, newSheet] = workbook.getSheets();

                expect(getSheetCopyPart(newSheet)).toEqual(getSheetCopyPart(oldSheet));

                // undo;
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(workbook.getSheetSize()).toBe(1);
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(workbook.getSheetSize()).toBe(2);
                const [oldSheet2, newSheet2] = workbook.getSheets();

                expect(getSheetCopyPart(newSheet2)).toEqual(getSheetCopyPart(oldSheet2));
            });
        });
    });
});
