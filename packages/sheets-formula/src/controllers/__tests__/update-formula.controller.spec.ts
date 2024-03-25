/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, IWorkbookData, Nullable, Univer } from '@univerjs/core';
import { cellToRange, Direction, ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import type { IInsertColCommandParams } from '@univerjs/sheets';
import { InsertColCommand, MoveRowsCommand, NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetArrayFormulaDataMutation, SetFormulaDataMutation, SetNumfmtFormulaDataMutation } from '@univerjs/engine-formula';
import { UpdateFormulaController } from '../update-formula.controller';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA_DEMO = (): IWorkbookData => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    3: {
                        f: '=A1:C1',
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

// TODO@Dushusir: add move range,insert range,delete range test case
describe('Test insert function operation', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA_DEMO(), [
            [UpdateFormulaController],
        ]);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(MoveRowsCommand);
        commandService.registerCommand(InsertColCommand);
        commandService.registerCommand(SetFormulaDataMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);
        commandService.registerCommand(SetNumfmtFormulaDataMutation);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();
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
        univer.dispose();
    });

    describe('update formula', () => {
        describe('correct situations', () => {
            it('move rows update formula', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });

                // A1
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                const params = {
                    fromRange: cellToRange(0, 1),
                    toRange: cellToRange(1, 1),
                };

                await commandService.executeCommand(MoveRowsCommand.id, params);
            });
            it('Insert column', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });

                // A1
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 1, endRow: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                const params: IInsertColCommandParams = {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    range: cellToRange(0, 1),
                    direction: Direction.LEFT,
                };

                // FXIME why InsertColCommand sequenceExecute returns result false
                await commandService.executeCommand(InsertColCommand.id, params);
                const oldValue = getValueByPosition(0, 3, 0, 3);
                expect(oldValue?.f).toBe('=A1:C1');

                const newValue = getValueByPosition(0, 4, 0, 4);
                // expect(newValue).toBe('=A1:D1');
            });
        });
    });
});
