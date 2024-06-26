/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CommandService, ContextService, DesktopLogService, IContextService, ILogService, IUndoRedoService, LocalUndoRedoService, Univer, UniverInstanceService, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { Dependency, Injector } from '@wendellhu/redi';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BranchCoverage } from '../set-worksheet-show.command';

import { InsertSheetMutation } from '../../mutations/insert-sheet.mutation';
import { SetWorksheetHideMutation } from '../../mutations/set-worksheet-hide.mutation';
import { SetWorksheetActiveOperation } from '../../operations/set-worksheet-active.operation';
import { InsertSheetCommand } from '../insert-sheet.command';
import { SetWorksheetActivateCommand } from '../set-worksheet-activate.command';
import { SetWorksheetHideCommand } from '../set-worksheet-hide.command';
import { SetWorksheetShowCommand } from '../set-worksheet-show.command';
import { createBadCommandTestBed, createCommandTestBed } from './create-command-test-bed';
import { TestData } from './broken-test-functions';

describe('Test set worksheet show commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        TestData.testData = new TestData();

        commandService = get(ICommandService);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(SetWorksheetActiveOperation);
        commandService.registerCommand(SetWorksheetActivateCommand);
        commandService.registerCommand(SetWorksheetHideCommand);
        commandService.registerCommand(SetWorksheetHideMutation);
        commandService.registerCommand(SetWorksheetShowCommand);
    });

    afterEach(() => {
        univer.dispose();
    });

    afterAll(() => {
        BranchCoverage.coverage.printCoverage();
    });

    describe('set sheet show', () => {
        describe('set sheet show after make it hidden', async () => {
            it('correct situation: ', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');

                const targetActiveSheet = workbook.getActiveSheet();
                const targetSheetId = targetActiveSheet?.getSheetId();
                expect(
                    await commandService.executeCommand(SetWorksheetActivateCommand.id, { subUnitId: targetSheetId })
                ).toBeTruthy();

                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetWorksheetHideCommand.id, { subUnitId: targetSheetId })
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

        describe('set sheet show after make it hidden using worksheet show function', async () => {
            it('correct situation: ', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');

                const targetActiveSheet = workbook.getActiveSheet();
                const targetSheetId = targetActiveSheet?.getSheetId();
                expect(
                    await commandService.executeCommand(SetWorksheetActivateCommand.id, { subUnitId: targetSheetId })
                ).toBeTruthy();

                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(await commandService.executeCommand(InsertSheetCommand.id, {})).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetWorksheetHideCommand.id, { subUnitId: targetSheetId })
                ).toBeTruthy();

                expect(workbook.getSheetBySheetId(targetSheetId)?.getConfig().hidden).toBeTruthy();

                expect(
                    await commandService.executeCommand(SetWorksheetShowCommand.id, { subUnitId: targetSheetId })
                ).toBeTruthy();

                expect(workbook.getSheetBySheetId(targetSheetId)?.getConfig().hidden).toBeFalsy();
            });
        });

        describe('set sheet shown without a worksheet', async () => {
            it('correct situation: ', async () => {
                expect(
                    await commandService.executeCommand(SetWorksheetShowCommand.id, { subUnitId: null})
                ).toBeFalsy();
            });
        });

        describe('set sheet shown when it is not hidden', async () => {
            it('correct situation: ', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');

                const targetActiveSheet = workbook.getActiveSheet();
                const targetSheetId = targetActiveSheet?.getSheetId();
                expect(
                    await commandService.executeCommand(SetWorksheetActivateCommand.id, { subUnitId: targetSheetId })
                ).toBeTruthy();

                expect(
                    await commandService.executeCommand(SetWorksheetShowCommand.id, { subUnitId: targetSheetId })
                ).toBeFalsy();
            });
        });

        describe('set sheet shown with incorrect get injected', async () => {
            it('correct situation: ', async () => {
                let badInjector = createBadInjector();
                get = badInjector.get.bind(badInjector);
                commandService = get(ICommandService);
                commandService.registerCommand(SetWorksheetShowCommand);
                expect(
                    await commandService.executeCommand(SetWorksheetShowCommand.id, { subUnitId: null})
                ).toBeFalsy();
            });
        });

        describe('set sheet shown with adjusted test bed', async () => {
            it('correct situation: ', async () => {
                TestData.testData.spoofed = true;
                univer.dispose();

                const testBed = createBadCommandTestBed();
                univer = testBed.univer;
                get = testBed.get;

                commandService = get(ICommandService);
                commandService.registerCommand(SetWorksheetShowCommand);

                expect(
                    await commandService.executeCommand(SetWorksheetShowCommand.id, { subUnitId: null})
                ).toBeFalsy();
            });
        });
    });
});

function createBadInjector() {
    const dependencies: Dependency[] = [
        // abstract services
        [IUniverInstanceService, { useClass: UniverInstanceService }],
        [ICommandService, { useClass: CommandService, lazy: true }],
        [ILogService, { useClass: DesktopLogService, lazy: true }],
        [IUndoRedoService, { useClass: LocalUndoRedoService, lazy: true }],
        [IContextService, { useClass: ContextService }],
    ];

    return new Injector(dependencies);
}
