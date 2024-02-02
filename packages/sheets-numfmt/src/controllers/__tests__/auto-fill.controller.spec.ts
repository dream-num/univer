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

import type { IRange, Workbook, Worksheet } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { ISetNumfmtMutationParams } from '@univerjs/sheets';
import { SelectionManagerService, SetNumfmtMutation } from '@univerjs/sheets';
import { APPLY_TYPE, AutoFillService, IAutoFillService } from '@univerjs/sheets-ui';
import { beforeEach, describe, expect, it } from 'vitest';

import { SHEET_NUMFMT_PLUGIN } from '../../base/const/PLUGIN_NAME';
import { NumfmtAutoFillController } from '../numfmt.auto-fill.controller';
import { NumfmtCellContent } from '../numfmt.cell-content.controller';
import { createTestBed } from './test.util';

describe('test auto fill', () => {
    let unitId: string = '';
    let subUnitId: string = '';
    let workbook: Workbook;
    let worksheet: Worksheet;
    let testBed: ReturnType<typeof createTestBed>;
    let commandService: ICommandService;

    beforeEach(() => {
        testBed = createTestBed([
            [NumfmtAutoFillController],
            [NumfmtCellContent],
            [SelectionManagerService],
            [IAutoFillService, { useClass: AutoFillService }],
        ]);
        unitId = testBed.unitId;
        subUnitId = testBed.subUnitId;
        commandService = testBed.get(ICommandService);
        const univerInstanceService = testBed.get(IUniverInstanceService);
        testBed.get(NumfmtAutoFillController);
        testBed.get(NumfmtCellContent);
        workbook = univerInstanceService.getCurrentUniverSheetInstance();
        worksheet = workbook.getActiveSheet();
    });
    it('test fill format ,repeat range is divisible', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 5, startColumn: 0, endColumn: 5 }],
                },
            },
            refMap: {
                1: {
                    pattern: '$#,##0;(#,##0)',
                    type: '' as any,
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const autoFillService = testBed.get(IAutoFillService);
        const hooks = autoFillService.getAllHooks();
        const item = hooks.find((ele) => ele.id === SHEET_NUMFMT_PLUGIN)!;
        expect(!!item).toBeTruthy();
        const source: IRange = {
            startRow: 3,
            endRow: 5,
            startColumn: 0,
            endColumn: 1,
        };
        const target: IRange = {
            startRow: 3,
            endRow: 5,
            startColumn: 2,
            endColumn: 9,
        };
        const result =
            item.onFillData &&
            item.onFillData({ source, target, unitId, subUnitId }, '' as any, APPLY_TYPE.ONLY_FORMAT);
        expect(result).toEqual({
            undos: [
                {
                    id: 'sheet.mutation.remove.numfmt',
                    params: {
                        ranges: [
                            {
                                startRow: 3,
                                endRow: 5,
                                startColumn: 6,
                                endColumn: 9,
                            },
                        ],
                        unitId: 'test',
                        subUnitId: 'sheet1',
                    },
                },
                {
                    id: 'sheet.mutation.set.numfmt',
                    params: {
                        values: {
                            1: {
                                ranges: [
                                    {
                                        startRow: 3,
                                        endRow: 5,
                                        startColumn: 2,
                                        endColumn: 5,
                                    },
                                ],
                            },
                        },
                        refMap: {
                            1: {
                                pattern: '$#,##0;(#,##0)',
                                type: '',
                            },
                        },
                        unitId: 'test',
                        subUnitId: 'sheet1',
                    },
                },
            ],
            redos: [
                {
                    id: 'sheet.mutation.set.numfmt',
                    params: {
                        values: {
                            1: {
                                ranges: [
                                    {
                                        startRow: 3,
                                        endRow: 5,
                                        startColumn: 2,
                                        endColumn: 9,
                                    },
                                ],
                            },
                        },
                        refMap: {
                            1: {
                                pattern: '$#,##0;(#,##0)',
                                type: '',
                            },
                        },
                        unitId: 'test',
                        subUnitId: 'sheet1',
                    },
                },
            ],
        });
    });
    // @TODO:YuHong,there are some repeat problems to be solved
    it('test fill format ,repeat range is not divisible', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 5, startColumn: 0, endColumn: 5 }],
                },
            },
            refMap: {
                1: {
                    pattern: '$#,##0;(#,##0)',
                    type: '' as any,
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const autoFillService = testBed.get(IAutoFillService);
        const hooks = autoFillService.getAllHooks();
        const item = hooks.find((ele) => ele.id === SHEET_NUMFMT_PLUGIN)!;
        expect(!!item).toBeTruthy();
        const source: IRange = {
            startRow: 3,
            endRow: 5,
            startColumn: 0,
            endColumn: 1,
        };
        const target: IRange = {
            startRow: 3,
            endRow: 5,
            startColumn: 2,
            endColumn: 10,
        };
        const result =
            item.onFillData &&
            item.onFillData({ source, target, unitId, subUnitId }, '' as any, APPLY_TYPE.ONLY_FORMAT);
        expect(result).toEqual({
            undos: [
                {
                    id: 'sheet.mutation.remove.numfmt',
                    params: {
                        ranges: [
                            {
                                startRow: 3,
                                endRow: 5,
                                startColumn: 6,
                                endColumn: 10,
                            },
                        ],
                        unitId: 'test',
                        subUnitId: 'sheet1',
                    },
                },
                {
                    id: 'sheet.mutation.set.numfmt',
                    params: {
                        values: {
                            1: {
                                ranges: [
                                    {
                                        startRow: 3,
                                        endRow: 5,
                                        startColumn: 2,
                                        endColumn: 5,
                                    },
                                ],
                            },
                        },
                        refMap: {
                            1: {
                                pattern: '$#,##0;(#,##0)',
                                type: '',
                            },
                        },
                        unitId: 'test',
                        subUnitId: 'sheet1',
                    },
                },
            ],
            redos: [
                {
                    id: 'sheet.mutation.set.numfmt',
                    params: {
                        values: {
                            1: {
                                ranges: [
                                    {
                                        startRow: 3,
                                        endRow: 5,
                                        startColumn: 2,
                                        endColumn: 10,
                                    },
                                ],
                            },
                        },
                        refMap: {
                            1: {
                                pattern: '$#,##0;(#,##0)',
                                type: '',
                            },
                        },
                        unitId: 'test',
                        subUnitId: 'sheet1',
                    },
                },
            ],
        });
    });
    it('test fill without format', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 5, startColumn: 0, endColumn: 5 }],
                },
            },
            refMap: {
                1: {
                    pattern: '$#,##0;(#,##0)',
                    type: '' as any,
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const autoFillService = testBed.get(IAutoFillService);
        const hooks = autoFillService.getAllHooks();
        const item = hooks.find((ele) => ele.id === SHEET_NUMFMT_PLUGIN)!;
        expect(!!item).toBeTruthy();
        const source: IRange = {
            startRow: 3,
            endRow: 5,
            startColumn: 0,
            endColumn: 1,
        };
        const target: IRange = {
            startRow: 3,
            endRow: 5,
            startColumn: 2,
            endColumn: 10,
        };
        const result =
            item.onFillData && item.onFillData({ source, target, unitId, subUnitId }, '' as any, APPLY_TYPE.NO_FORMAT);
        expect(result).toEqual({
            undos: [],
            redos: [],
        });
    });
});
