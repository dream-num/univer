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

import type { Univer, Workbook } from '@univerjs/core';
import {
    DisposableCollection,
    ICommandService,
    Injector,
    IUniverInstanceService,
    RANGE_TYPE,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import {
    SetColHiddenCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetRowHiddenCommand,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSelectedColsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SetSelectionsOperation,
    SetSpecificColsVisibleCommand,
    SetSpecificRowsVisibleCommand,
} from '@univerjs/sheets';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ShowColMenuItemFactory, ShowRowMenuItemFactory } from '../menu';
import { createMenuTestBed } from './create-menu-test-bed';

describe('Test row col menu items', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let disposableCollection: DisposableCollection;

    beforeEach(() => {
        const testBed = createMenuTestBed();

        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);

        [
            SetRowHiddenCommand,
            SetRowHiddenMutation,
            SetColHiddenCommand,
            SetColHiddenMutation,
            SetSelectedRowsVisibleCommand,
            SetSelectedColsVisibleCommand,
            SetRowVisibleMutation,
            SetColVisibleMutation,
            SetSelectionsOperation,
            SetSpecificColsVisibleCommand,
            SetSpecificRowsVisibleCommand,
        ].forEach((command) => {
            commandService.registerCommand(command);
        });

        disposableCollection = new DisposableCollection();
    });

    afterEach(() => univer.dispose());

    function getRowCount(): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getRowCount();
    }

    function getColCount(): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getColumnCount();
    }

    async function selectRow(rowStart: number, rowEnd: number): Promise<boolean> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        const endColumn = getColCount() - 1;
        return commandService.executeCommand<ISetSelectionsOperationParams, boolean>(SetSelectionsOperation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),

            selections: [
                {
                    range: { startRow: rowStart, startColumn: 0, endColumn, endRow: rowEnd, rangeType: RANGE_TYPE.ROW },
                    primary: {
                        startRow: rowStart,
                        endRow: rowEnd,
                        startColumn: 0,
                        endColumn,
                        actualColumn: 0,
                        actualRow: rowStart,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ],
        });
    }

    async function selectColumn(columnStart: number, columnEnd: number): Promise<boolean> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        const endRow = getRowCount() - 1;
        return commandService.executeCommand<ISetSelectionsOperationParams, boolean>(SetSelectionsOperation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),

            selections: [
                {
                    range: {
                        startRow: 0,
                        startColumn: columnStart,
                        endColumn: columnEnd,
                        endRow,
                        rangeType: RANGE_TYPE.COLUMN,
                    },
                    primary: {
                        startRow: 0,
                        endRow,
                        startColumn: columnStart,
                        endColumn: columnEnd,
                        actualColumn: columnStart,
                        actualRow: 0,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ],
        });
    }

    describe('Test row col hide/unhide menu items', () => {
        it('Should only show "Show Hidden Rows" when there are hidden rows in current selections', async () => {
            let hidden = false;

            const menuItem = get(Injector).invoke(ShowRowMenuItemFactory);
            disposableCollection.add(toDisposable(menuItem.hidden$!.subscribe((v: boolean) => (hidden = v))));
            expect(hidden).toBeTruthy();

            await selectRow(1, 1);
            await commandService.executeCommand(SetRowHiddenCommand.id);
            await selectRow(0, 2);
            expect(hidden).toBeFalsy();

            await commandService.executeCommand(SetSelectedRowsVisibleCommand.id);
            expect(hidden).toBeTruthy();
        });

        it('Should only show "Show Hidden Cols" when there are hidden cols in current selections', async () => {
            let hidden = false;

            const menuItem = get(Injector).invoke(ShowColMenuItemFactory);
            disposableCollection.add(toDisposable(menuItem.hidden$!.subscribe((v: boolean) => (hidden = v))));
            expect(hidden).toBeTruthy();

            await selectColumn(1, 1);
            await commandService.executeCommand(SetColHiddenCommand.id);
            await selectColumn(0, 2);
            expect(hidden).toBeFalsy();

            await commandService.executeCommand(SetSelectedColsVisibleCommand.id);
            expect(hidden).toBeTruthy();
        });
    });
});
