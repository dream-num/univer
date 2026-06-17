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
});
