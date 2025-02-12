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
import { ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    MoveRangeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ISheetClipboardService } from '../clipboard.service';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { clipboardTestBed } from './clipboard-test-bed';
import { plainTextByNotepad } from './constant';

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let sheetSkeletonManagerService: SheetSkeletonManagerService;

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
        commandService.registerCommand(MoveRangeMutation);

        sheetSkeletonManagerService = get(SheetSkeletonManagerService);
        sheetClipboardService = get(ISheetClipboardService);

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

    describe('Test paste from notepad ', () => {
        beforeEach(() => {
            const selectionManager: SheetsSelectionsService = get(SheetsSelectionsService);

            // selectionManager.setSelections({
            //     // pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            //     unitId: 'test',
            //     sheetId: 'sheet1',
            // });
            const startRow = 1;
            const startColumn = 1;
            const endRow = 1;
            const endColumn = 1;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            sheetSkeletonManagerService.setCurrent({
                sheetId: 'sheet1',
            });
        });
        it('test value with paste plain text', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste('', plainTextByNotepad);
            expect(res).toBeTruthy();
            expect(getValues(1, 1, 1, 1)?.[0]?.[0]?.v).toEqual('day');
            expect(getValues(2, 2, 2, 2)?.[0]?.[0]?.v).toEqual(2.1);
            expect(getValues(1, 2, 1, 2)?.[0]?.[0]?.v).toEqual('2024年五一假期：相较23年');
            expect(getValues(7, 3, 7, 3)?.[0]?.[0]?.v).toEqual(-31.3);
        });
    });
});
