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

import { describe, expect, it } from 'vitest';
import {
    AlignmentSnapSession,
    getAlignmentRectXAnchors,
    getAlignmentRectYAnchors,
    getClosestAlignmentOffset,
} from '../alignment-snap';

describe('alignment snap', () => {
    it('resolves normalized edge and center anchors', () => {
        const rect = { left: 30, top: 50, width: -20, height: -40 };

        expect(getAlignmentRectXAnchors(rect)).toEqual([10, 20, 30]);
        expect(getAlignmentRectYAnchors(rect)).toEqual([10, 30, 50]);
        expect(getClosestAlignmentOffset([10, 20, 30], [32], 3)).toBe(2);
    });

    it('uses hysteresis and breakaway without accumulating correction', () => {
        const session = new AlignmentSnapSession({
            enterThreshold: 6,
            exitThreshold: 14,
            breakawayThreshold: 4,
            cooldownMs: 250,
        });
        const guide = { id: 'x:100', axis: 'x' as const, position: 100 };

        expect(session.resolveAxisSnap({ axis: 'x', value: 97, guide, now: 0 })).toMatchObject({ snapped: true, value: 100 });
        expect(session.resolveAxisSnap({ axis: 'x', value: 99, guide, now: 1 })).toMatchObject({ snapped: true, value: 100 });
        expect(session.resolveAxisSnap({ axis: 'x', value: 103, guide, now: 2 })).toMatchObject({ snapped: false, value: 103 });
        expect(session.resolveAxisSnap({ axis: 'x', value: 99, guide, now: 100 })).toMatchObject({ snapped: false, value: 99 });
        expect(session.resolveAxisSnap({ axis: 'x', value: 99, guide, now: 300 })).toMatchObject({ snapped: true, value: 100 });
    });
});
