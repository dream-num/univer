/**
 * Copyright 2023 DreamNum Inc.
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

import type { IWorkbookData, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
    CancelFrozenCommand,
    SetColumnFrozenCommand,
    SetRowFrozenCommand,
    SetSelectionFrozenCommand,
} from '../set-frozen.command';
import { createFrozenCommandTestBed } from './create-selection-command-test-bed';

describe('Test commands used for change selections', () => {
    let univer: Univer | null = null;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManagerService: SelectionManagerService;

    function select(
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        actualRow: number,
        actualColumn: number,
        isMerged: boolean,
        isMergedMainCell: boolean
    ) {
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });

        selectionManagerService.add([
            {
                range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,
                    actualRow,
                    actualColumn,
                    isMerged,
                    isMergedMainCell,
                },
                style: null,
            },
        ]);
    }

    const getFreeze = () => {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getConfig().freeze;
    };

    function disposeTestBed() {
        univer?.dispose();
        univer = null;
    }

    function prepareTestBed(snapshot?: IWorkbookData) {
        const testBed = createFrozenCommandTestBed(snapshot);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        selectionManagerService = get(SelectionManagerService);
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
    }

    afterEach(disposeTestBed);

    describe('Freeze', () => {
        beforeEach(() => prepareTestBed());

        it('Should freeze row and col on current cell', async () => {
            select(2, 2, 2, 2, 2, 2, false, false);

            await commandService.executeCommand(SetSelectionFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === 2 && config.startColumn === 2).toBeTruthy();
        });

        it('Should cancel all freeze', async () => {
            await commandService.executeCommand(CancelFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === -1 && config.startColumn === -1).toBeTruthy();
        });

        it('Should freeze current row', async () => {
            select(2, 2, 2, 2, 2, 2, false, false);

            await commandService.executeCommand(SetRowFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === 2 && config.startColumn === -1).toBeTruthy();
        });

        it('Should freeze current column', async () => {
            select(2, 2, 2, 2, 2, 2, false, false);

            await commandService.executeCommand(SetColumnFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === -1 && config.startColumn === 2).toBeTruthy();
        });

        it('Should cancel all freeze', async () => {
            await commandService.executeCommand(CancelFrozenCommand.id);

            const config = getFreeze();
            expect(config?.startRow === -1 && config.startColumn === -1).toBeTruthy();
        });
    });
});
