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

import { ICommandService } from '@univerjs/core';
import type { ISetNumfmtMutationParams } from '@univerjs/sheets';
import { SetNumfmtMutation } from '@univerjs/sheets';
import type { ISheetClipboardHook } from '@univerjs/sheets-ui';
import { ISheetClipboardService } from '@univerjs/sheets-ui';
import { beforeEach, describe, expect, it } from 'vitest';

import { SHEET_NUMFMT_PLUGIN } from '../../base/const/PLUGIN_NAME';
import { NumfmtCopyPasteController } from '../numfmt.copy-paste.controller';
import { createTestBed } from './test.util';

class MockSheetClipboardService {
    hooks: ISheetClipboardHook[] = [];
    getHooks = () => this.hooks;
    addClipboardHook = (config: ISheetClipboardHook) => {
        this.hooks.push(config);
    };
}
describe('test copy paste', () => {
    let unitId: string = '';
    let subUnitId: string = '';
    let testBed: any;
    let commandService: ICommandService;
    beforeEach(() => {
        testBed = createTestBed([
            [NumfmtCopyPasteController],
            [ISheetClipboardService, { useClass: MockSheetClipboardService }],
        ]);
        unitId = testBed.unitId;
        subUnitId = testBed.subUnitId;
        testBed.get(NumfmtCopyPasteController);
        commandService = testBed.get(ICommandService);
    });
    it('test', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 4 }],
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
        const sheetClipboardService = testBed.get(ISheetClipboardService) as MockSheetClipboardService;
        const hooks = sheetClipboardService.getHooks();
        const hook = hooks.find((hook) => hook.id === SHEET_NUMFMT_PLUGIN)!;
        expect(!!hook).toBeTruthy();
        hook.onBeforeCopy!(unitId, subUnitId, {
            startRow: 2,
            startColumn: 3,
            endRow: 4,
            endColumn: 4,
        });
        const result = hook.onPasteCells!(
            {
                unitId,
                subUnitId,
                range: {
                    startRow: 2,
                    startColumn: 3,
                    endRow: 4,
                    endColumn: 4,
                },
            },
            {
                range: {
                    startRow: 9,
                    startColumn: 5,
                    endRow: 11,
                    endColumn: 6,
                    rangeType: 0,
                },
                unitId,
                subUnitId,
            },
            {
                0: {
                    0: {
                        p: null,
                        v: 5,
                        s: null,
                        f: null,
                        si: null,
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 6,
                        s: null,
                        f: null,
                        si: null,
                        t: 2,
                    },
                },
                1: {
                    0: {
                        p: null,
                        v: 6,
                        s: null,
                        f: null,
                        si: null,
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 7,
                        s: null,
                        f: null,
                        si: null,
                        t: 2,
                    },
                },
                2: {
                    0: {
                        p: null,
                        v: 7,
                        s: null,
                        f: null,
                        si: null,
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 8,
                        s: null,
                        f: null,
                        si: null,
                        t: 2,
                    },
                },
            } as any,
            {
                copyType: 'COPY',
                copyId: 'asdasd',
                pasteType: 'default-paste',
            } as any
        );
        expect(result).toEqual({
            redos: [
                {
                    id: 'sheet.mutation.remove.numfmt',
                    params: {
                        unitId,
                        subUnitId,
                        ranges: [],
                    },
                },
                {
                    id: 'sheet.mutation.set.numfmt',
                    params: {
                        unitId,
                        subUnitId,
                        refMap: {
                            0: {
                                pattern: '$#,##0;(#,##0)',
                                type: '',
                            },
                        },
                        values: {
                            0: {
                                ranges: [
                                    {
                                        startRow: 9,
                                        endRow: 10,
                                        startColumn: 5,
                                        endColumn: 6,
                                    },
                                ],
                            },
                        },
                    },
                },
            ],
            undos: [
                {
                    id: 'sheet.mutation.remove.numfmt',
                    params: {
                        ranges: [
                            {
                                startRow: 9,
                                endRow: 10,
                                startColumn: 5,
                                endColumn: 6,
                            },
                        ],
                        unitId,
                        subUnitId,
                    },
                },
            ],
        });
    });
});
