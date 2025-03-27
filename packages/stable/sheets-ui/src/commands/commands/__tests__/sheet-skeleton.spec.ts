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

/* eslint-disable dot-notation */
import type { ISelectionCell, IWorkbookData, Univer, Workbook, Worksheet } from '@univerjs/core';
import { BorderType, ICommandService, IConfigService, IContextService, Injector, LocaleService, RANGE_TYPE } from '@univerjs/core';
import { SpreadsheetSkeleton } from '@univerjs/engine-render';
import {
    SetBorderPositionCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    createSelectionCommandTestBed,
    MERGED_CELLS_DATA,
} from './create-sheet-skeleton-test-bed';

describe('Test commands used for change selections', () => {
    let univer: Univer | null = null;
    let workbook: Workbook;
    let worksheet: Worksheet;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManagerService: SheetsSelectionsService;
    let spreadsheetSkeleton: SpreadsheetSkeleton;
    let localeService: LocaleService;
    let contextService: IContextService;
    let configService: IConfigService;

    function select(selection: ISelectionCell) {
        const { startRow, startColumn, endRow, endColumn } = selection;
        selectionManagerService.setSelections([
            {
                range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                primary: selection,
                style: null,
            },
        ]);
    }

    function disposeTestBed() {
        univer?.dispose();
        univer = null;
    }

    /**
     * Compare whether all the props of the two border configurations exist in each other.
     *
     * @param border1
     * @param border2
     * @returns
     */
    const borderLenEqual = (border1: string[], border2: string[]) => {
        if (border1.length !== border2.length) return false;

        const sortedArr1 = border1.slice().sort();
        const sortedArr2 = border2.slice().sort();

        for (let i = 0; i < sortedArr1.length; i++) {
            if (sortedArr1[i] !== sortedArr2[i]) {
                return false;
            }
        }
        return true;
    };

    function prepareSelectionsTestBed(snapshot?: IWorkbookData) {
        const testBed = createSelectionCommandTestBed(snapshot);
        univer = testBed.univer;
        workbook = testBed.sheet;
        get = testBed.get;

        commandService = get(ICommandService);
        selectionManagerService = get(SheetsSelectionsService);

        localeService = get(LocaleService);
        contextService = get(IContextService);
        configService = get(IConfigService);
        const injector = get(Injector);

        worksheet = workbook.getActiveSheet()!;
        spreadsheetSkeleton = new SpreadsheetSkeleton(
            worksheet,
            workbook.getStyles(),
            localeService,
            contextService,
            configService,
            injector
        );
    }

    afterEach(disposeTestBed);

    describe('_stylesCache.border in skeleton', () => {
        beforeEach(() => prepareSelectionsTestBed(MERGED_CELLS_DATA));

        /**
         * A1 | B1 | C1
         * ---|    |----
         * A2 |    | C2
         *
         * When user clicks on C2 and move cursor left twice, A2 should not selected not A1.
         */
        it('_stylesCache.border should be same as worksheet.getRange', async () => {
            const mergeRangeForB1B3 = { startRow: 0, endRow: 2, startColumn: 1, endColumn: 1 };
            const rangeForA1 = { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 };
            select({ ...mergeRangeForB1B3, actualRow: 0, actualColumn: 1, isMerged: false, isMergedMainCell: true } as ISelectionCell);

            //set BorderType.ALL for B1:B3
            expect(
                await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.ALL })
            ).toBeTruthy();

            spreadsheetSkeleton['_setStylesCacheForOneCell'](mergeRangeForB1B3.startRow, mergeRangeForB1B3.startColumn, {
                mergeRange: mergeRangeForB1B3,
            });

            const borderOfCell01 = spreadsheetSkeleton.stylesCache.border?.getValue(0, 1) || {};
            let actualBorderList = Object.keys(borderOfCell01);
            let borderOfRange = worksheet.getRange(0, 1, 0, 1).getBorder();
            let expectBorderList = Object.keys(borderOfRange);
            expect(borderLenEqual(actualBorderList, expectBorderList)).toBe(true);

            // set BorderType.NONE for A1
            spreadsheetSkeleton.resetCache();
            select({ ...rangeForA1, actualRow: 1, actualColumn: 1, isMerged: false, isMergedMainCell: false } as ISelectionCell);
            expect(
                await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.NONE })
            ).toBeTruthy();

            spreadsheetSkeleton['_setStylesCacheForOneCell'](mergeRangeForB1B3.startRow, mergeRangeForB1B3.startColumn, {
                mergeRange: mergeRangeForB1B3,
            });

            spreadsheetSkeleton['_setStylesCacheForOneCell'](0, 0, { cacheItem: { bg: true, border: true } });
            spreadsheetSkeleton['_setStylesCacheForOneCell'](0, 1, { cacheItem: { bg: true, border: true } });
            spreadsheetSkeleton['_setStylesCacheForOneCell'](1, 0, { cacheItem: { bg: true, border: true } });
            spreadsheetSkeleton['_setStylesCacheForOneCell'](1, 1, { cacheItem: { bg: true, border: true } });
            spreadsheetSkeleton['_setStylesCacheForOneCell'](2, 0, { cacheItem: { bg: true, border: true } });
            spreadsheetSkeleton['_setStylesCacheForOneCell'](2, 1, { cacheItem: { bg: true, border: true } });

            const borderOfCell11 = spreadsheetSkeleton.stylesCache.border?.getValue(1, 1) || {};
            actualBorderList = Object.keys(borderOfCell11);
            borderOfRange = worksheet.getRange(1, 1, 1, 1).getBorder();
            expectBorderList = Object.keys(borderOfRange);
            expect(borderLenEqual(actualBorderList, expectBorderList)).toBe(true);
            expect(actualBorderList.length).toBe(1);
            expect(true).toBe(true);
        });
    });
});
