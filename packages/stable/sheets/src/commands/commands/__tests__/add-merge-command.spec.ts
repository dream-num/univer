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

import type { Injector, IWorkbookData } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, LocaleType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import zhCN from '../../../locale/zh-CN';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { AddWorksheetMergeCommand } from '../add-worksheet-merge.command';
import { createCommandTestBed } from './create-command-test-bed';

const WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheetOrder: [
        'sheet1',
    ],
    sheets: {
        sheet1: {
            name: '工作表1',
            id: 'sheet1',
            tabColor: '',
            hidden: 0,
            rowCount: 1000,
            columnCount: 20,
            zoomRatio: 1,
            freeze: {
                xSplit: 0,
                ySplit: 0,
                startRow: -1,
                startColumn: -1,
            },
            scrollTop: 0,
            scrollLeft: 0,
            defaultColumnWidth: 88,
            defaultRowHeight: 24,
            mergeData: [
                {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 8,
                    rangeType: 0,
                    unitId: 'test',
                    sheetId: 'sheet1',
                },
                {
                    startRow: 2,
                    startColumn: 5,
                    endRow: 3,
                    endColumn: 5,
                    rangeType: 0,
                    unitId: 'test',
                    sheetId: 'sheet1',
                },
            ],
            cellData: {
                1: {
                    5: {
                        v: 3,
                        t: 2,
                    },
                },
                2: {
                    5: {
                        v: 1,
                        t: 2,
                    },
                },
                3: {
                    5: {},
                },
            },
            rowData: {
                1: {
                    hd: 0,
                    h: 24,
                    ah: 24,
                },
                2: {
                    hd: 0,
                    h: 24,
                    ah: 24,
                },
                3: {
                    hd: 0,
                    h: 24,
                    ah: 24,
                },
            },
            columnData: {},
            showGridlines: 1,
            rowHeader: {
                width: 46,
                hidden: 0,
            },
            columnHeader: {
                height: 20,
                hidden: 0,
            },
            rightToLeft: 0,
        },
    },

    locale: LocaleType.ZH_CN,
    name: '',
    styles: {},
};

describe('add-merge-command', () => {
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed(WORKBOOK_DATA_DEMO);
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);

        get(LocaleService).load({ zhCN, enUS });
    });
    it('test merge cell contain merge cell', async () => {
        expect(
            await commandService.executeCommand(AddWorksheetMergeCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                selections: [{ startRow: 1, startColumn: 5, endRow: 3, endColumn: 5 }],
            })
        ).toBeTruthy();

        const worksheet = get(IUniverInstanceService)?.getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
        const mergeData = worksheet?.getConfig().mergeData;
        const { startRow, startColumn, endColumn, endRow } = mergeData![0];
        expect({
            startRow,
            startColumn,
            endColumn,
            endRow,
        }).toEqual({
            startRow: 0,
            startColumn: 0,
            endRow: 0,
            endColumn: 8,
        });
        const { startRow: startRow2, startColumn: startColumn2, endColumn: endColumn2, endRow: endRow2 } = mergeData![1];
        expect({
            startRow: startRow2,
            startColumn: startColumn2,
            endColumn: endColumn2,
            endRow: endRow2,
        }).toEqual({
            startRow: 1,
            startColumn: 5,
            endRow: 3,
            endColumn: 5,
        });
    });
});
