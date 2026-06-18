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

import { DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createEmbedSheetsFloatingDrawing, resolveEmbedSheetsFloatingObjectSize } from './embed-floating-anchor';

describe('embed floating anchor', () => {
    it('normalizes aspect-ratio floating object size from width', () => {
        expect(resolveEmbedSheetsFloatingObjectSize({
            width: 460,
            height: 290,
            resizeBehavior: 'aspect-ratio',
            aspectRatio: 16 / 9,
        })).toEqual({
            width: 460,
            height: 258.75,
        });
    });

    it('normalizes aspect-ratio floating object size from height when width is absent', () => {
        expect(resolveEmbedSheetsFloatingObjectSize({
            height: 270,
            resizeBehavior: 'aspect-ratio',
            aspectRatio: 16 / 9,
        })).toEqual({
            width: 480,
            height: 270,
        });
    });

    it('stores normalized size in the drawing transform', () => {
        const drawing = createEmbedSheetsFloatingDrawing({
            embedId: 'embed-slide',
            hostUnitId: 'host-sheet',
            hostSubUnitId: 'sheet-1',
            hostAnchorId: 'anchor-1',
            width: 460,
            height: 290,
            resizeBehavior: 'aspect-ratio',
            aspectRatio: 16 / 9,
        });

        expect(drawing.transform?.width).toBe(460);
        expect(drawing.transform?.height).toBe(258.75);
        expect(drawing.drawingType).toBe(DrawingTypeEnum.DRAWING_BLOCK);
        expect(drawing.data).toMatchObject({
            resizeBehavior: 'aspect-ratio',
            aspectRatio: 16 / 9,
            runtimeMountMode: 'stage2',
        });
    });

    it('does not persist transient runtime state in the floating object data', () => {
        const drawing = createEmbedSheetsFloatingDrawing({
            embedId: 'embed-slide',
            hostUnitId: 'host-sheet',
            hostSubUnitId: 'sheet-1',
            hostAnchorId: 'anchor-1',
        });

        expect(drawing.data).toMatchObject({
            embedId: 'embed-slide',
            hostAnchorId: 'anchor-1',
            runtimeMountMode: 'stage2',
        });
        expect(drawing.data).not.toHaveProperty('stage');
        expect(drawing.data).not.toHaveProperty('isDomMounted');
        expect(drawing.data).not.toHaveProperty('domPortalId');
    });
});
