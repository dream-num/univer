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

import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IEditorService } from '@univerjs/docs-ui';
import { describe, expect, it, vi } from 'vitest';
import { getFontStyleAtCursor } from '../utils';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

describe('menu utils', () => {
    it('returns null when editor model or active range is missing', () => {
        const getUnit = vi.fn();
        getUnit.mockReturnValue(null);
        const getActiveTextRange = vi.fn();
        getActiveTextRange.mockReturnValue({ startOffset: 0, endOffset: 1 });
        const univerInstanceService = { getUnit };
        const textSelectionService = { getActiveTextRange };
        const editorService = { getFocusId: vi.fn(() => 'doc-1') };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [DocSelectionManagerService, textSelectionService],
            [IEditorService, editorService],
        ]);

        expect(getFontStyleAtCursor(accessor)).toBeNull();

        getUnit.mockReturnValue({ getBody: () => ({ textRuns: [] }) });
        getActiveTextRange.mockReturnValue(null);
        expect(getFontStyleAtCursor(accessor)).toBeNull();
    });

    it('returns undefined when editor model body has no textRuns', () => {
        const accessor = createAccessor([
            [IUniverInstanceService, { getUnit: vi.fn(() => ({ getBody: () => ({}) })) }],
            [DocSelectionManagerService, { getActiveTextRange: vi.fn(() => ({ startOffset: 1, endOffset: 2 })) }],
            [IEditorService, { getFocusId: vi.fn(() => 'doc-1') }],
        ]);

        expect(getFontStyleAtCursor(accessor)).toBeUndefined();
    });

    it('uses default editor id and returns the text run at cursor', () => {
        const matchRun = { st: 10, ed: 20, ts: { bl: true } };
        const getUnit = vi.fn(() => ({
            getBody: () => ({
                textRuns: [{ st: 0, ed: 9 }, matchRun, { st: 21, ed: 30 }],
            }),
        }));

        const accessor = createAccessor([
            [IUniverInstanceService, { getUnit }],
            [DocSelectionManagerService, { getActiveTextRange: () => ({ startOffset: 12, endOffset: 18 }) }],
            [IEditorService, { getFocusId: () => undefined }],
        ]);

        expect(getFontStyleAtCursor(accessor)).toBe(matchRun);
        expect(getUnit).toHaveBeenCalledWith(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, UniverInstanceType.UNIVER_DOC);
    });
});
