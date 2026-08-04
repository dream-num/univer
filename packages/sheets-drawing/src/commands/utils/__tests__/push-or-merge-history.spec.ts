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

import type { IUndoRedoItem } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { pushOrMergeDrawingHistory } from '../push-or-merge-history';

describe('pushOrMergeDrawingHistory', () => {
    it('groups shape text and its final resize into one undo element', () => {
        const stack: IUndoRedoItem[] = [];
        const service = {
            pitchTopUndoElement: () => stack.at(-1),
            pushUndoRedo: vi.fn((item: IUndoRedoItem) => stack.push(item)),
        };
        const textUndo = { id: 'undo-text', params: {} };
        const sizeUndo = { id: 'undo-size', params: {} };
        const textRedo = { id: 'redo-text', params: {} };
        const sizeRedo = { id: 'redo-size', params: {} };

        pushOrMergeDrawingHistory(service, { unitID: 'sheet', undoMutations: [textUndo], redoMutations: [textRedo] }, 'text-edit');
        pushOrMergeDrawingHistory(service, { unitID: 'sheet', undoMutations: [sizeUndo], redoMutations: [sizeRedo] }, 'text-edit', 'append');

        expect(stack).toHaveLength(1);
        expect(stack[0].undoMutations).toEqual([sizeUndo, textUndo]);
        expect(stack[0].redoMutations).toEqual([textRedo, sizeRedo]);
    });
});
