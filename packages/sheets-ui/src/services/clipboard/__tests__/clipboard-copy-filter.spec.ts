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

import type { ICellData, Injector, Nullable, Univer } from '@univerjs/core';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import { ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE, set, ThemeService } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SheetCopyCommand, SheetPasteCommand } from '../../../commands/commands/clipboard.command';
import { ISheetClipboardService } from '../clipboard.service';
import { clipboardTestBed } from './clipboard-test-bed';

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let themeService: ThemeService;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(async () => {
        const testBed = clipboardTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    cellData: {
                        0: {
                            0: {
                                v: 1,
                            },
                        },
                        1: {
                            0: {
                                v: 2,
                            },
                        },
                        2: {
                            0: {
                                v: 3,
                            },
                        },
                        3: {
                            0: {
                                v: 4,
                            },
                        },
                    },
                },
            },
            locale: LocaleType.ZH_CN,
            name: '',
            sheetOrder: [],
            styles: {},
        });

        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetColWidthMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(SetSelectionsOperation);

        sheetClipboardService = get(ISheetClipboardService);

        themeService = get(ThemeService);
        const theme = themeService.getCurrentTheme();
        const newTheme = set(theme, 'black', '#35322b');
        themeService.setTheme(newTheme);
        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();
    });

    afterEach(() => {
        univer?.dispose();
    });

    describe('Copy area where have filtered out rows', () => {
        it('Paste content should not have filtered out rows', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')!.getSheetBySheetId('sheet1')!;
            worksheet.__interceptViewModel((viewModel) => {
                viewModel.registerRowFilteredInterceptor({
                    getRowFiltered(row: number): boolean {
                        return row === 2;
                    },
                });
            });
            expect(await commandService.executeCommand(SetSelectionsOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                selections: [
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 3, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: { actualRow: 0, actualColumn: 0, isMerged: false, isMergedMainCell: false },
                        style: null,
                    },
                ],
            } as ISetSelectionsOperationParams)).toBeTruthy();

            expect(await commandService.executeCommand(SheetCopyCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            })).toBeTruthy();

            expect(await commandService.executeCommand(SetSelectionsOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                selections: [
                    {
                        range: { startRow: 10, startColumn: 0, endRow: 10, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: { actualRow: 0, actualColumn: 0, isMerged: false, isMergedMainCell: false },
                        style: null,
                    },
                ],
            })).toBeTruthy();

            // clear cache will use html content
            sheetClipboardService.copyContentCache().clear();

            expect(await commandService.executeCommand(SheetPasteCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            })).toBeTruthy();

            expect(getValues(10, 0, 10, 0)?.[0]?.[0]?.v).toEqual(1);
            expect(getValues(11, 0, 11, 0)?.[0]?.[0]?.v).toEqual(2);
            expect(getValues(12, 0, 12, 0)?.[0]?.[0]?.v).toEqual(4);
        });
    });
});
