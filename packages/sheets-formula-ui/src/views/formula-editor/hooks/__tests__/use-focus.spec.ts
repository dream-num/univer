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

// @vitest-environment jsdom

import type { Editor } from '@univerjs/docs-ui';
import { describe, expect, it, vi } from 'vitest';
import { focusFormulaEditor } from '../use-focus';

describe('focusFormulaEditor', () => {
    it('preserves the logical caret when focus transfer publishes an older rendered caret', () => {
        let ranges = [{ startOffset: 1, endOffset: 1, collapsed: true }];
        const setSelectionRanges = vi.fn();
        const editor = {
            getEditorId: () => 'focus-transfer',
            getSelectionRanges: () => ranges,
            setSelectionRanges,
            getDocumentData: () => ({ body: { dataStream: 'E\r\n' } }),
            docSelectionRenderService: { isOnPointerEvent: false },
        } as unknown as Editor;

        focusFormulaEditor({
            focus: () => {
                ranges = [{ startOffset: 0, endOffset: 0, collapsed: true }];
            },
        }, editor);

        expect(setSelectionRanges).toHaveBeenCalledWith([{ startOffset: 1, endOffset: 1, collapsed: true }]);
    });
});
