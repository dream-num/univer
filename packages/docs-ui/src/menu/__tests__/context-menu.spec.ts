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

import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { DOC_RANGE_TYPE, IUniverInstanceService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { InsertRowBeforeMenuItemFactory } from '../context-menu';

describe('doc context menu table predicates', () => {
    it('disables table actions for expanded text selections inside a table cell', () => {
        const harness = createTableMenuHarness({
            activeTextRange: {
                collapsed: false,
                endOffset: 16,
                startOffset: 12,
            },
            rectRanges: [],
        });

        expect(readDisabledState(harness)).toBe(true);
    });

    it('keeps table actions enabled for collapsed cursors inside a table cell', () => {
        const harness = createTableMenuHarness({
            activeTextRange: {
                collapsed: true,
                endOffset: 12,
                startOffset: 12,
            },
            rectRanges: [],
        });

        expect(readDisabledState(harness)).toBe(false);
    });

    it('keeps table actions enabled for table rect selections', () => {
        const harness = createTableMenuHarness({
            activeTextRange: null,
            rectRanges: [{
                endOffset: 16,
                rangeType: DOC_RANGE_TYPE.RECT,
                startOffset: 12,
                tableId: 'table-1',
            }],
        });

        expect(readDisabledState(harness)).toBe(false);
    });
});

function readDisabledState(harness: ReturnType<typeof createTableMenuHarness>) {
    const item = InsertRowBeforeMenuItemFactory(harness.accessor as never);
    const values: boolean[] = [];
    const subscription = item.disabled$!.subscribe((value) => {
        values.push(value);
    });
    subscription.unsubscribe();

    return values.at(-1);
}

function createTableMenuHarness(options: {
    activeTextRange: Pick<ITextRangeWithStyle, 'collapsed' | 'endOffset' | 'startOffset'> | null;
    rectRanges: Array<{ endOffset: number; rangeType: DOC_RANGE_TYPE | string; startOffset: number; tableId: string }>;
}) {
    const selection$ = new Subject<unknown>();
    const selectionManager = {
        getActiveTextRange: () => options.activeTextRange,
        getRectRanges: () => options.rectRanges,
        textSelection$: selection$,
    };
    const univerInstanceService = {
        getCurrentUnitOfType: () => ({
            getSelfOrHeaderFooterModel: () => ({
                getBody: () => ({
                    tables: [{ endIndex: 30, startIndex: 10, tableId: 'table-1' }],
                }),
            }),
        }),
    };

    return {
        accessor: {
            get: (token: unknown) => {
                if (token === DocSelectionManagerService) {
                    return selectionManager;
                }

                if (token === IUniverInstanceService) {
                    return univerInstanceService;
                }

                return null;
            },
        },
        selection$,
    };
}
