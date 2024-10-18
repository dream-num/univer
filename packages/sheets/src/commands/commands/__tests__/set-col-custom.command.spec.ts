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

import type { BooleanNumber, ICommandService, type Injector, IUniverInstanceService, IWorkbookData, LocaleType, RedoCommand, UndoCommand, type Univer, UniverInstanceType, type Workbook } from '@univerjs/core';
import type { ISetColCustomMutationParams } from '../../mutations/set-col-custom.mutation';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetColCustomMutation } from '../../mutations/set-col-custom.mutation';
import { SetColCustomCommand } from '../set-col-custom.command';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA_DEMO = (): IWorkbookData => {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 'A1',
                        },
                        1: {
                            v: 'A2',
                        },
                    },
                },
                columnData: {
                    1: {
                        hd: BooleanNumber.FALSE,
                    },
                    5: {
                        custom: {
                            key: 'value',
                        },
                    },
                },
                rowData: {
                    1: {
                        hd: BooleanNumber.FALSE,
                    },

                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
    };
};

describe('test set column custom commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getColumnCustom(column: number): any {
        const worksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        const columnManager = worksheet.getColumnManager();
        const columnInfo = columnManager.getColumn(column);

        return columnInfo?.custom;
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA_DEMO());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetColCustomCommand);
        commandService.registerCommand(SetColCustomMutation);
    });

    afterEach(() => univer.dispose());

    it('should set custom properties on columns', async () => {
        expect(getColumnCustom(1)).toBe(undefined);

        const params: ISetColCustomMutationParams = {
            unitId: 'test',
            subUnitId: 'sheet1',
            custom: {
                1: {
                    color: 'red',
                },
                2: {
                    color: 'green',
                },
                5: undefined,
            },
        };
        await commandService.executeCommand(SetColCustomCommand.id, params);

        expect(getColumnCustom(1)).toEqual({ color: 'red' });
        expect(getColumnCustom(2)).toEqual({ color: 'green' });
        expect(getColumnCustom(5)).toEqual({ key: 'value' });

        await commandService.executeCommand(UndoCommand.id);
        expect(getColumnCustom(1)).toBeNull();
        expect(getColumnCustom(2)).toBeNull();
        expect(getColumnCustom(5)).toEqual({ key: 'value' });

        await commandService.executeCommand(RedoCommand.id);
        expect(getColumnCustom(1)).toEqual({ color: 'red' });
        expect(getColumnCustom(2)).toEqual({ color: 'green' });
        expect(getColumnCustom(5)).toEqual({ key: 'value' });
    });
});
