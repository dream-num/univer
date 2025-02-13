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

import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Injector, Univer, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { HtmlToUSMService } from '../html-to-usm/converter';
import { clipboardTestBed } from './clipboard-test-bed';

function getHTMLString(filePath: string): string {
    return readFileSync(filePath, 'utf-8');
}

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetSkeletonManagerService: SheetSkeletonManagerService;

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
        sheetSkeletonManagerService = get(SheetSkeletonManagerService);
    });

    afterEach(() => {
        univer?.dispose();
    });

    describe('Test paste', () => {
        beforeEach(() => {
            const selectionManager = get(SheetsSelectionsService);

            const startRow = 0;
            const startColumn = 0;
            const endRow = 0;
            const endColumn = 0;

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

        it('test convert util func from excel', async () => {
            const worksheet = get(IUniverInstanceService).getUnit<Workbook>('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const htmlToUSM = new HtmlToUSMService({
                getCurrentSkeleton: () => sheetSkeletonManagerService.getCurrentParam(),
            });
            const htmlPath = path.join(__dirname, 'assets', 'html', 'excel-base-sample.html');
            const html = getHTMLString(htmlPath);
            const cellMatrix = htmlToUSM.convert(html).cellMatrix;
            expect(cellMatrix).toMatchSnapshot();
        });

        it('test convert util func from google', async () => {
            const worksheet = get(IUniverInstanceService).getUnit<Workbook>('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const htmlToUSM = new HtmlToUSMService({
                getCurrentSkeleton: () => sheetSkeletonManagerService.getCurrentParam(),
            });
            const htmlPath = path.join(__dirname, 'assets', 'html', 'google-base-sample.html');
            const html = getHTMLString(htmlPath);
            const cellMatrix = htmlToUSM.convert(html).cellMatrix;
            expect(cellMatrix).toMatchSnapshot();
        });
    });
});
