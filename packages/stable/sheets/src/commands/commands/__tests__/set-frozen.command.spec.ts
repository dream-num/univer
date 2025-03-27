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

import type { Injector, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleType, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetFrozenMutation } from '../../mutations/set-frozen.mutation';
import { SetFrozenCommand } from '../set-frozen.command';
import { createCommandTestBed } from './create-command-test-bed';

const WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'B1',
                    },
                    2: {
                        v: 'C1',
                    },
                },
                1: {
                    0: {
                        v: 'A2',
                    },
                    1: {
                        v: 'B2',
                    },
                    3: {
                        v: 'D2',
                    },
                    6: {
                        v: 'G2',
                    },
                    9: {
                        v: 'J2',
                    },
                },
                2: {
                    5: {
                        v: 'F3',
                    },
                    9: {
                        v: 'J3',
                    },
                },
                4: {
                    2: {
                        v: 'C5',
                    },
                },
                5: {
                    3: {
                        v: 'D6',
                    },
                },
            },
            mergeData: [],
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

describe('Test set frozen commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed(WORKBOOK_DATA_DEMO);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetFrozenCommand);
        commandService.registerCommand(SetFrozenMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('set frozen', () => {
        describe('set frozen', async () => {
            it('correct situation: ', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');

                const targetActiveSheet = workbook.getActiveSheet()!;
                const targetSheetId = targetActiveSheet?.getSheetId();
                const originFreeze = workbook.getSheetBySheetId(targetSheetId)?.getConfig().freeze;
                expect(
                    await commandService.executeCommand(SetFrozenCommand.id, {
                        startRow: 1,
                        startColumn: 1,
                        xSplit: 1,
                        ySplit: 1,
                    })
                ).toBeTruthy();

                expect(workbook.getSheetBySheetId(targetSheetId)?.getConfig().freeze).toEqual({
                    startRow: 1,
                    startColumn: 1,
                    xSplit: 1,
                    ySplit: 1,
                });

                expect(workbook.getSheetBySheetId(targetSheetId)?.getConfig().freeze).toEqual({
                    startRow: 1,
                    startColumn: 1,
                    xSplit: 1,
                    ySplit: 1,
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(workbook.getSheetBySheetId(targetSheetId)?.getConfig().freeze).toEqual(originFreeze);
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(workbook.getSheetBySheetId(targetSheetId)?.getConfig().freeze).toEqual({
                    startRow: 1,
                    startColumn: 1,
                    xSplit: 1,
                    ySplit: 1,
                });
            });

            it('wrong situation: ', async () => {
                expect(
                    await commandService.executeCommand(SetFrozenCommand.id, {
                        startRow: 100,
                        startColumn: 100,
                        xSplit: 1,
                        ySplit: 1,
                    })
                ).toBeFalsy();
            });
        });
    });
});
