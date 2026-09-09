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

import type { IRange } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { createSelectionChangeDuplicateEndGuard, createSelectionChangeHandler } from '../use-sheet-selection-change';

describe('formula reference selection gesture boundaries', () => {
    it.each([false, true])('accepts the same reference in a new editor after the previous gesture ends: %s', (completed) => {
        const duplicateEndGuard = createSelectionChangeDuplicateEndGuard<IRange>();
        const selectedRange = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
        const firstChange = vi.fn();
        const first = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            duplicateEndGuard,
            onSelectionsChange: firstChange,
        });
        first([selectedRange], false, { start: true });
        first(completed ? [selectedRange] : [], true);
        expect(firstChange).toHaveBeenCalledTimes(1);

        const nextChange = vi.fn();
        const commit = vi.fn();
        const next = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            duplicateEndGuard,
            onSelectionsChange: nextChange,
            onDuplicateEnd: commit,
        });
        next([selectedRange], false, { start: true });
        next([selectedRange], false);
        next([selectedRange], true);

        expect(nextChange).toHaveBeenCalledExactlyOnceWith([selectedRange], false, false);
        expect(commit).toHaveBeenCalledExactlyOnceWith([selectedRange]);
    });
});
