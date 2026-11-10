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
import type { ISuccinctDocRangeParam } from '@univerjs/engine-render';
import { PositionedObjectLayoutType } from '@univerjs/core';
import { findDocDrawing } from '@univerjs/docs-drawing';

/** Locate the persisted object character without consulting the active text selection. */
export function findDrawingTextAnchor(snapshot: IDocumentData, drawingId: string): { offset: number; segmentId: string } | null {
    const segments = [
        { segmentId: '', body: snapshot.body },
        ...Object.entries(snapshot.headers ?? {}).map(([segmentId, segment]) => ({ segmentId, body: segment.body })),
        ...Object.entries(snapshot.footers ?? {}).map(([segmentId, segment]) => ({ segmentId, body: segment.body })),
        ...Object.entries(snapshot.notes ?? {}).map(([segmentId, segment]) => ({ segmentId, body: segment.body })),
    ];
    for (const { segmentId, body } of segments) {
        const block = body?.customBlocks?.find((item) => item.blockId === drawingId);
        if (block) {
            return { offset: block.startIndex, segmentId };
        }
    }
    return null;
}

/** Preserve keyboard/clipboard object ranges while replacing floating selection paint with an anchor icon. */
export function getDrawingTextRanges(snapshot: IDocumentData, drawingIds: string[]): ISuccinctDocRangeParam[] {
    return drawingIds.flatMap((drawingId) => {
        const anchor = findDrawingTextAnchor(snapshot, drawingId);
        if (!anchor) {
            return [];
        }
        const drawing = findDocDrawing(snapshot, drawingId)?.drawing;
        const floating = drawing && drawing.layoutType !== PositionedObjectLayoutType.INLINE;
        return [{
            startOffset: anchor.offset,
            endOffset: anchor.offset + 1,
            segmentId: anchor.segmentId,
            ...(floating ? { style: { fill: 'transparent', stroke: 'transparent', strokeActive: 'transparent', strokeWidth: 1 } } : {}),
        }];
    });
}
