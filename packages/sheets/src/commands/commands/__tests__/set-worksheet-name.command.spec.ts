/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ICommandInfo, Injector, IWorkbookData, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
    WorksheetHiddenState,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { UniverSheetsPlugin } from '../../../plugin';
import { SetWorksheetNameMutation } from '../../mutations/set-worksheet-name.mutation';
import { SetWorksheetNameCommand } from '../set-worksheet-name.command';
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
                const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) {
                    throw new Error('This is an error');
                }

                expect(
                    await commandService.executeCommand(SetWorksheetNameCommand.id, {
                        unitId: 'test',
                        subUnitId: 'sheet1',
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

            it('carries the previous name through rename and undo/redo', async () => {
                const mutations: ICommandInfo[] = [];
                const listener = commandService.onMutationExecutedForCollab((mutation) => {
                    if (mutation.id === SetWorksheetNameMutation.id) {
                        mutations.push({ ...mutation, params: { ...mutation.params } });
                    }
                });
                try {
                    expect(await commandService.executeCommand(SetWorksheetNameCommand.id, {
                        unitId: 'test',
                        subUnitId: 'sheet1',
                        name: 'Sheet2',
                    })).toBe(true);
                    expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
                    expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
                    expect(mutations.map((mutation) => mutation.params)).toMatchObject([
                        { oldName: 'sheet1', name: 'Sheet2' },
                        // Undo the rename: Sheet2 -> sheet1.
                        { oldName: 'Sheet2', name: 'sheet1' },
                        // Redo the rename: sheet1 -> Sheet2.
                        { oldName: 'sheet1', name: 'Sheet2' },
                    ]);
                } finally {
                    listener.dispose();
                }
            });
        });
    });
});

it.each([false, true])('rejects other-sheet name collisions without mutation or history when another workbook is focused=%s', async (foreignFocus) => {
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
    const injector = univer.__getInjector();
    injector.get(LocaleService).setDirection('ltr');
    const commands = injector.get(ICommandService);
    const instances = injector.get(IUniverInstanceService);
    const history = injector.get(IUndoRedoService);
    let renameMutations = 0;
    const listener = commands.onMutationExecutedForCollab((mutation) => {
        if (mutation.id === SetWorksheetNameMutation.id) {
            renameMutations++;
        }
    });
    try {
        const owner = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'rename-owner',
            name: 'rename-owner',
            sheetOrder: ['orders', 'scratch', 'hidden'],
            sheets: {
                orders: { id: 'orders', name: 'Orders' },
                scratch: { id: 'scratch', name: 'Scratch' },
                hidden: { id: 'hidden', name: 'Hidden', hidden: WorksheetHiddenState.HIDDEN },
            },
        });
        const independent = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'independent',
            name: 'independent',
            sheetOrder: ['foreign'],
            sheets: { foreign: { id: 'foreign', name: 'ForeignOnly' } },
        });
        instances.focusUnit(foreignFocus ? 'independent' : 'rename-owner');
        const originalHistory = history.getUndoRedoStatus('rename-owner');
        const independentHistory = history.getUndoRedoStatus('independent');
        for (const name of ['Orders', 'oRdErS', 'Hidden', 'hIDDEN']) {
            expect(await commands.executeCommand(SetWorksheetNameCommand.id, {
                unitId: 'rename-owner',
                subUnitId: 'scratch',
                name,
            })).toBe(false);
            expect(owner.getSheetBySheetId('scratch')?.getName()).toBe('Scratch');
            expect(history.getUndoRedoStatus('rename-owner')).toEqual(originalHistory);
            expect(history.getUndoRedoStatus('independent')).toEqual(independentHistory);
            expect(renameMutations).toBe(0);
        }
        expect(await commands.executeCommand(SetWorksheetNameCommand.id, {
            unitId: 'rename-owner',
            subUnitId: 'scratch',
            name: 'sCrAtCh',
        })).toBe(true);
        expect(owner.getSheetBySheetId('scratch')?.getName()).toBe('sCrAtCh');
        expect(history.getUndoRedoStatus('rename-owner')).toEqual({ undos: originalHistory.undos + 1, redos: 0 });
        expect(await commands.executeCommand(SetWorksheetNameCommand.id, {
            unitId: 'rename-owner',
            subUnitId: 'scratch',
            name: 'ForeignOnly',
        })).toBe(true);
        expect(owner.getSheetBySheetId('scratch')?.getName()).toBe('ForeignOnly');
        expect(independent.getSheetBySheetId('foreign')?.getName()).toBe('ForeignOnly');
        expect(history.getUndoRedoStatus('independent')).toEqual(independentHistory);
    } finally {
        listener.dispose();
        univer.dispose();
    }
});
