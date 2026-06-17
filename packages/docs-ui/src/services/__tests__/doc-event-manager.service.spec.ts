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

import { PresetListType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import {
    getListMarkerFallbackBound,
    getListMarkerFallbackHit,
    getListParagraphContextMenuHit,
    getPreferredParagraphBoundsInRange,
    getTableBlockMenuHoverRect,
    getTableHorizontalViewportGeometry,
    isChecklistListType,
} from '../doc-event-manager.service';

describe('DocEventManagerService list marker helpers', () => {
    it('detects list marker fallback hits without treating body text as marker', () => {
        const paragraph = {
            startIndex: 12,
            bullet: {
                listId: 'list-1',
                listType: PresetListType.BULLET_LIST,
                nestingLevel: 0,
            },
        };
        const paragraphBound = {
            firstLine: { bottom: 124, left: 160, right: 460, top: 104 },
            pageIndex: 0,
            rect: { bottom: 128, left: 160, right: 460, top: 100 },
        };

        expect(getListMarkerFallbackBound(paragraphBound, paragraph)).toMatchObject({
            rect: { bottom: 124, left: 160, right: 196, top: 104 },
            segmentPageIndex: 0,
        });
        expect(getListMarkerFallbackHit(paragraphBound, paragraph, { x: 168, y: 112 })).not.toBeNull();
        expect(getListMarkerFallbackHit(paragraphBound, paragraph, { x: 240, y: 112 })).toBeNull();
        expect(getListParagraphContextMenuHit(paragraphBound, paragraph, { x: 260, y: 112 })).toBeNull();
    });

    it('identifies checklist list types', () => {
        expect(isChecklistListType(PresetListType.CHECK_LIST)).toBe(true);
        expect(isChecklistListType(PresetListType.CHECK_LIST_CHECKED)).toBe(true);
        expect(isChecklistListType(PresetListType.BULLET_LIST)).toBe(false);
    });

    it('prefers table paragraph bounds when a text range overlaps table content', () => {
        const bodyParagraph = {
            rect: { bottom: 120, left: 80, right: 420, top: 90 },
            paragraphStart: 10,
            paragraphEnd: 60,
            startIndex: 10,
            rects: [{ bottom: 120, left: 80, right: 420, top: 90 }],
            pageIndex: 0,
            firstLine: { bottom: 110, left: 80, right: 420, top: 90 },
        };
        const tableParagraph = {
            rect: { bottom: 180, left: 120, right: 360, top: 150 },
            paragraphStart: 22,
            paragraphEnd: 36,
            startIndex: 22,
            rects: [{ bottom: 180, left: 120, right: 360, top: 150 }],
            pageIndex: 0,
            firstLine: { bottom: 170, left: 120, right: 360, top: 150 },
        };

        expect(getPreferredParagraphBoundsInRange([bodyParagraph], [tableParagraph], 24, 30)).toEqual([tableParagraph]);
        expect(getPreferredParagraphBoundsInRange([bodyParagraph], [], 24, 30)).toEqual([bodyParagraph]);
        expect(getPreferredParagraphBoundsInRange([bodyParagraph], [tableParagraph], 61, 70)).toEqual([]);
    });

    it('calculates table hover and horizontal viewport geometry for clipped tables', () => {
        expect(getTableBlockMenuHoverRect({ bottom: 320, left: 120, right: 520, top: 160 })).toEqual({
            bottom: 320,
            left: 48,
            right: 520,
            top: 118,
        });

        expect(getTableHorizontalViewportGeometry(100, 400, {
            contentWidth: 800,
            leadingInsetLeft: 24,
            scrollLeft: 72,
            trailingInsetRight: 24,
            viewportWidth: 360,
        })).toEqual({
            scrollLeft: 72,
            visibleLeft: 76,
            visibleRight: 436,
        });

        expect(getTableHorizontalViewportGeometry(100, 400, null)).toEqual({
            scrollLeft: 0,
            visibleLeft: 100,
            visibleRight: 500,
        });
    });
});
