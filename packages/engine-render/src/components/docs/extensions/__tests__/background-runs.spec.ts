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

import type { IDocumentSkeletonGlyph } from '../../../../basics/i-document-skeleton-cached';
import { describe, expect, it } from 'vitest';
import { collectBackgroundGlyphRuns } from '../background-runs';

describe('background glyph runs', () => {
    it.each([false, true])('keeps host paint boundaries without splitting ordinary backgrounds: %s', (routed) => {
        const glyphs = ['A', 'B', 'C'].map((content, index) => ({
            content,
            left: index * 10,
            width: 10,
            ts: { bg: { rgb: '#ff0000' }, customGlyphGroup: routed ? ['first', 'first', 'second'][index] : undefined },
        } as IDocumentSkeletonGlyph));
        const runs = collectBackgroundGlyphRuns(glyphs);
        expect(runs.map(({ left, width }) => [left, width])).toEqual(routed ? [[0, 20], [20, 10]] : [[0, 30]]);
        expect(glyphs.map(({ width }) => width)).toEqual([10, 10, 10]);
    });
});
