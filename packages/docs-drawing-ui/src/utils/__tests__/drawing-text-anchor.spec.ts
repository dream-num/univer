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

import type { IDocumentData } from '@univerjs/core';
import { PositionedObjectLayoutType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { findDrawingTextAnchor, getDrawingTextRanges } from '../drawing-text-anchor';

describe('drawing text anchors', () => {
    const snapshot = {
        body: { dataStream: 'text\b\r\n', customBlocks: [{ blockId: 'inline', startIndex: 4 }] },
        headers: { header: { body: { dataStream: '\btext\r\n', customBlocks: [{ blockId: 'float', startIndex: 0 }] } } },
        footers: { footer: { body: { dataStream: 'text\b\r\n', customBlocks: [{ blockId: 'footer-shape', startIndex: 4 }] } } },
        drawings: {
            inline: { layoutType: PositionedObjectLayoutType.INLINE },
            float: { layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM },
        },
    } as unknown as IDocumentData;

    it('resolves object characters in body, header and footer independently of the text cursor', () => {
        expect(findDrawingTextAnchor(snapshot, 'inline')).toEqual({ offset: 4, segmentId: '' });
        expect(findDrawingTextAnchor(snapshot, 'float')).toEqual({ offset: 0, segmentId: 'header' });
        expect(findDrawingTextAnchor(snapshot, 'footer-shape')).toEqual({ offset: 4, segmentId: 'footer' });
        expect(findDrawingTextAnchor(snapshot, 'deleted')).toBeNull();
    });

    it('retains the one-character floating range for deletion/copy but hides its paint', () => {
        const [range] = getDrawingTextRanges(snapshot, ['float']);
        expect(range.startOffset).toBe(0);
        expect(range.endOffset).toBe(1);
        expect(range.style).toMatchObject({ fill: 'transparent', stroke: 'transparent', strokeActive: 'transparent' });
    });

    it('keeps inline text highlighting and drops missing objects in a mixed selection', () => {
        const ranges = getDrawingTextRanges(snapshot, ['inline', 'float', 'deleted']);
        expect(ranges).toHaveLength(2);
        expect(ranges[0]).toEqual({ startOffset: 4, endOffset: 5, segmentId: '' });
        expect(ranges[1].style?.fill).toBe('transparent');
    });

    it('uses the current anchor after a move rather than caching the old range', () => {
        const moved = { ...snapshot, body: { ...snapshot.body!, customBlocks: [{ blockId: 'inline', startIndex: 2 }] } };
        expect(getDrawingTextRanges(moved, ['inline'])).toEqual([{ startOffset: 2, endOffset: 3, segmentId: '' }]);
    });
});
