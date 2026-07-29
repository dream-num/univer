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

import {
    BooleanNumber,
    ICommandService,
    type IDisposable,
    type IWorkbookData,
    LocaleType,
    Univer,
    UniverInstanceType,
    type Workbook,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetWorksheetRowHeightMutation } from '../../commands/mutations/set-worksheet-row-height.mutation';
import { SheetSkeletonService } from '../skeleton.service';
import { SpreadsheetSkeleton } from '../spreadsheet-skeleton';

const WORKBOOK_DATA: IWorkbookData = {
    id: 'model-grid-workbook',
    appVersion: '1.0.0',
    locale: LocaleType.EN_US,
    name: 'model grid',
    styles: {},
    sheetOrder: ['sheet-1'],
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'Sheet 1',
            rowCount: 4,
            columnCount: 3,
            defaultRowHeight: 15,
            defaultColumnWidth: 20,
            rowData: {
                0: { h: 20, ah: 30, ia: BooleanNumber.TRUE },
                1: { h: 25 },
                2: { h: 40, hd: BooleanNumber.TRUE },
            },
            columnData: {
                0: { w: 50 },
                1: { w: 40, hd: BooleanNumber.TRUE },
            },
        },
    },
};

describe('SpreadsheetSkeleton model grid coordinates', () => {
    let univer: Univer;
    let skeleton: SpreadsheetSkeleton;
    let rowFilter: IDisposable;

    beforeEach(() => {
        univer = new Univer();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA);
        const worksheet = workbook.getActiveSheet()!;
        worksheet.__interceptViewModel((viewModel) => {
            rowFilter = viewModel.registerRowFilteredInterceptor({
                getRowFiltered: (row) => row === 1,
            });
        });
        skeleton = new SpreadsheetSkeleton(worksheet).calculate();
    });

    afterEach(() => {
        rowFilter.dispose();
        skeleton.dispose();
        univer.dispose();
    });

    it('uses persisted grid sizes without render coordinate state', () => {
        expect(skeleton.rowHeightAccumulation).toEqual([30, 30, 30, 45]);
        expect(skeleton.columnWidthAccumulation).toEqual([50, 50, 70]);
        expect(skeleton.rowTotalHeight).toBe(45);
        expect(skeleton.columnTotalWidth).toBe(70);

        expect(skeleton.getNoMergeCellWithCoordByIndex(3, 2)).toEqual({
            startX: 50,
            endX: 70,
            startY: 30,
            endY: 45,
        });
        expect(skeleton.getCellIndexAndOffsetByPosition(55, 35)).toEqual({
            row: 3,
            rowOffset: 5,
            column: 2,
            columnOffset: 5,
        });
    });

    it('does not recalculate clean geometry', () => {
        const rows = skeleton.rowHeightAccumulation;
        const columns = skeleton.columnWidthAccumulation;

        skeleton.calculate();

        expect(skeleton.rowHeightAccumulation).toBe(rows);
        expect(skeleton.columnWidthAccumulation).toBe(columns);
    });

    it('initializes an existing workbook and refreshes its geometry after a grid mutation', async () => {
        const injector = univer.__getInjector();
        const service = injector.createInstance(SheetSkeletonService);
        const commandService = injector.get(ICommandService);
        commandService.registerCommand(SetWorksheetRowHeightMutation);

        const managedSkeleton = service.getSkeleton('model-grid-workbook', 'sheet-1');
        expect(managedSkeleton?.rowTotalHeight).toBe(45);

        await commandService.executeCommand(SetWorksheetRowHeightMutation.id, {
            unitId: 'model-grid-workbook',
            subUnitId: 'sheet-1',
            ranges: [{ startRow: 3, endRow: 3, startColumn: 0, endColumn: 2 }],
            rowHeight: 45,
        });

        expect(service.getSkeleton('model-grid-workbook', 'sheet-1')).toBe(managedSkeleton);
        expect(managedSkeleton?.rowHeightAccumulation).toEqual([30, 30, 30, 75]);
        expect(service.getSkeletonParam('model-grid-workbook', 'sheet-1')?.commandId).toBe(SetWorksheetRowHeightMutation.id);

        service.dispose();
    });
});
