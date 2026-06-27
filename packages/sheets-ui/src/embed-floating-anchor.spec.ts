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

import { DrawingTypeEnum, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createEmbedSheetsFloatingDrawing, createEmbedSheetsFloatingDrawingFromDescriptor, createEmbedSheetsFloatingObjectData, getEmbedSheetsFloatingObjectData, isEmbedSheetsFloatingDrawing, resolveEmbedSheetsFloatingObjectSize } from './embed-floating-anchor';

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
            hostType: UniverInstanceType.UNIVER_SHEET,
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
            hostType: UniverInstanceType.UNIVER_SHEET,
            hostAnchorId: 'anchor-1',
            runtimeMountMode: 'stage2',
        });
        expect(drawing.data).not.toHaveProperty('stage');
        expect(drawing.data).not.toHaveProperty('isDomMounted');
        expect(drawing.data).not.toHaveProperty('domPortalId');
    });

    it('creates floating drawings from descriptors and host context overrides', () => {
        const sheetTransform = {
            from: { column: 1, columnOffset: 2, row: 3, rowOffset: 4 },
            to: { column: 5, columnOffset: 6, row: 7, rowOffset: 8 },
        };
        const drawing = createEmbedSheetsFloatingDrawingFromDescriptor({
            embedId: 'embed-1',
            hostAnchorId: 'anchor-1',
            hostUnitId: 'host-1',
            childType: UniverInstanceType.UNIVER_SHEET,
        } as never, 'sheet-1', {
            allowTransform: false,
            aspectRatio: 4 / 3,
            componentKey: 'CustomComponent',
            height: 240,
            left: 12,
            resizeBehavior: 'aspect-ratio',
            runtimeMountMode: 'always',
            sheetTransform,
            top: 24,
        });

        expect(drawing).toMatchObject({
            allowTransform: false,
            axisAlignSheetTransform: sheetTransform,
            componentKey: 'CustomComponent',
            data: {
                aspectRatio: 4 / 3,
                childType: UniverInstanceType.UNIVER_SHEET,
                embedId: 'embed-1',
                hostType: UniverInstanceType.UNIVER_SHEET,
                hostAnchorId: 'anchor-1',
                resizeBehavior: 'aspect-ratio',
                runtimeMountMode: 'always',
            },
            drawingId: 'anchor-1',
            sheetTransform,
            transform: {
                height: 240,
                left: 12,
                top: 24,
                width: 320,
            },
        });
    });

    it('guards floating object data and drawing identity', () => {
        const data = createEmbedSheetsFloatingObjectData({
            embedId: 'embed-1',
            hostAnchorId: 'anchor-1',
            hostUnitId: 'host-1',
            resizeBehavior: 'free',
        });

        expect(getEmbedSheetsFloatingObjectData({ data: data as never })).toEqual(data);
        expect(getEmbedSheetsFloatingObjectData({ data: { version: 2 } })).toBeUndefined();
        expect(isEmbedSheetsFloatingDrawing({
            componentKey: 'UniverEmbedSheetsFloatingObject',
            data: data as never,
        })).toBe(true);
        expect(isEmbedSheetsFloatingDrawing({
            componentKey: 'OtherComponent',
            data: data as never,
        })).toBe(false);
    });

    it('uses default size when requested size is invalid or resize behavior is not aspect-ratio', () => {
        expect(resolveEmbedSheetsFloatingObjectSize({
            aspectRatio: 16 / 9,
            height: -1,
            resizeBehavior: 'aspect-ratio',
            width: 0,
        })).toEqual({
            height: 315,
            width: 560,
        });
        expect(resolveEmbedSheetsFloatingObjectSize({
            aspectRatio: 16 / 9,
            height: 200,
            resizeBehavior: 'free',
            width: 300,
        })).toEqual({
            height: 200,
            width: 300,
        });
    });
});
