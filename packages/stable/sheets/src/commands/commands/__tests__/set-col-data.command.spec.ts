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

import type { Injector, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import type { ISetColDataCommandParams } from '../set-col-data.command';
import { BooleanNumber, ICommandService, IUniverInstanceService, LocaleType, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetColDataMutation } from '../../mutations/set-col-data.mutation';
import { SetColDataCommand } from '../set-col-data.command';
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

describe('test set column data commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getColumnData(column: number) {
        const worksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        const columnManager = worksheet.getColumnManager();
        return columnManager.getColumn(column);
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA_DEMO());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetColDataCommand);
        commandService.registerCommand(SetColDataMutation);
    });

    afterEach(() => univer.dispose());

    it('should set custom properties on columns', async () => {
        expect(getColumnData(1)).toEqual({ hd: BooleanNumber.FALSE });

        const params: ISetColDataCommandParams = {
            unitId: 'test',
            subUnitId: 'sheet1',
            columnData: {
                1: {
                    custom: {
                        color: 'red',
                    },
                },
                2: {
                    custom: {
                        color: 'green',
                    },
                },
                5: {
                    custom: undefined,
                },
            },

        };
        await commandService.executeCommand(SetColDataCommand.id, params);

        expect(getColumnData(1)).toEqual({
            hd: BooleanNumber.FALSE,
            custom: {
                color: 'red',
            },
        });
        expect(getColumnData(2)).toEqual({
            custom: {
                color: 'green',
            },
        });
        expect(getColumnData(5)).toEqual({
            custom: undefined,
        });

        await commandService.executeCommand(UndoCommand.id);
        expect(getColumnData(1)).toEqual({
            hd: BooleanNumber.FALSE,
        });
        expect(getColumnData(2)).toBeUndefined();
        expect(getColumnData(5)).toEqual({
            custom: {
                key: 'value',
            },
        });

        await commandService.executeCommand(RedoCommand.id);
        expect(getColumnData(1)).toEqual({
            hd: BooleanNumber.FALSE,
            custom: {
                color: 'red',
            },
        });
        expect(getColumnData(2)).toEqual({
            custom: {
                color: 'green',
            },
        });
        expect(getColumnData(5)).toEqual({
            custom: undefined,
        });
    });
});
