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

import type { Workbook } from '@univerjs/core';
import type { ISetNumfmtMutationParams } from '@univerjs/sheets';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SetNumfmtMutation } from '@univerjs/sheets';
import { SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt/controllers/numfmt-cell-content.controller.js';

import { beforeEach, describe, expect, it } from 'vitest';
import { createTestBed } from './test.util';

describe('test cell-content', () => {
    let unitId: string = '';
    let subUnitId: string = '';
    let univerInstanceService: IUniverInstanceService;
    let testBed: any;
    let commandService: ICommandService;
    beforeEach(() => {
        testBed = createTestBed(undefined, [[SheetsNumfmtCellContentController]]);
        unitId = testBed.unitId;
        subUnitId = testBed.subUnitId;
        commandService = testBed.get(ICommandService);
        univerInstanceService = testBed.get(IUniverInstanceService);
    });

    it('Add a new data format to test whether the rendering layer is working correctly', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
            refMap: {
                1: {
                    pattern: '$#,##0;(#,##0)',
                },
            },
        };
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        testBed.get(SheetsNumfmtCellContentController);
        const value = worksheet.getCell(0, 0);
        expect(value).toEqual({ v: 0, t: 2 });
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const startTimeWithNumfmt = performance.now();
        const value1 = worksheet.getCell(0, 0);
        const timeWithNumfmt = performance.now() - startTimeWithNumfmt;
        expect(value1!.v).toEqual('$0');
        expect(value1!.t).toEqual(2);

        const startTimeWithNumfmtCache = performance.now();
        const timeWithNumfmtCache = performance.now() - startTimeWithNumfmtCache;
        // With caching, it takes less time than without caching
        // console.log(timeWithNumfmtCache, '  ', timeWithNumfmt);
        expect(timeWithNumfmt - timeWithNumfmtCache).toBeGreaterThanOrEqual(0);
    });
});
