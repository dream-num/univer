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
import type { IRotationHandleLayout } from '../transformer-rotation';
import { placeRotationHandle } from '../transformer-rotation';

function createLayout(): IRotationHandleLayout {
    return {
        bounds: { left: 0, top: 0, right: 400, bottom: 400 },
        radius: 22,
        artworkRadius: 10,
        preferred: { center: { x: 200, y: 60 }, attachment: { x: 200, y: 110 }, side: 'top' },
        opposite: { center: { x: 200, y: 290 }, attachment: { x: 200, y: 240 }, side: 'bottom' },
        corners: [{ x: 100, y: 110 }, { x: 300, y: 110 }, { x: 300, y: 240 }, { x: 100, y: 240 }],
        obstacles: [{ x: 200, y: 110, radius: 6 }, { x: 200, y: 240, radius: 6 }],
    };
}

describe('placeRotationHandle', () => {
    it('preserves an unobstructed default position', () => {
        const layout = createLayout();
        expect(placeRotationHandle(layout)).toMatchObject({ ...layout.preferred, adjusted: false });
    });

    it('shortens the stem before changing sides and keeps the full touch target inside', () => {
        const layout = createLayout();
        layout.preferred = { center: { x: 200, y: 20 }, attachment: { x: 200, y: 70 }, side: 'top' };
        layout.obstacles[0].y = 70;
        const placement = placeRotationHandle(layout)!;
        expect(placement.side).toBe('top');
        expect(placement.center.y).toBeGreaterThan(layout.preferred.center.y);
        expect(placement.center.y - layout.radius).toBeGreaterThanOrEqual(8);
        expect(placement.center.y).toBeLessThan(layout.preferred.attachment.y);
    });

    it('switches sides when shortening would overlap a resize handle, and waits for clearance before returning', () => {
        const layout = createLayout();
        layout.preferred = { center: { x: 200, y: -10 }, attachment: { x: 200, y: 40 }, side: 'top' };
        layout.obstacles[0].y = 40;
        expect(placeRotationHandle(layout)?.side).toBe('bottom');
        layout.previousSide = 'bottom';
        layout.preferred.center.y = 35;
        layout.preferred.attachment.y = 85;
        layout.obstacles[0].y = 85;
        expect(placeRotationHandle(layout)?.side).toBe('bottom');
        layout.preferred.center.y = 50;
        layout.preferred.attachment.y = 100;
        layout.obstacles[0].y = 100;
        expect(placeRotationHandle(layout)?.side).toBe('top');
    });

    it('insets a handle for an oversized object and avoids another adjustment control', () => {
        const layout = createLayout();
        layout.preferred = { center: { x: 200, y: -100 }, attachment: { x: 200, y: -50 }, side: 'top' };
        layout.opposite = { center: { x: 200, y: 500 }, attachment: { x: 200, y: 450 }, side: 'bottom' };
        layout.corners = [{ x: -100, y: -50 }, { x: 300, y: -50 }, { x: 300, y: 450 }, { x: -100, y: 450 }];
        layout.obstacles = [{ x: 200, y: 30, radius: 8 }];
        const placement = placeRotationHandle(layout)!;
        expect(placement.side).toBe('inset');
        expect(placement.center.x).toBeGreaterThanOrEqual(30);
        expect(placement.center.x).toBeLessThanOrEqual(370);
        expect(placement.center.y).toBeGreaterThanOrEqual(30);
        expect(placement.center.y).toBeLessThanOrEqual(370);
        expect(Math.hypot(placement.center.x - 200, placement.center.y - 30)).toBeGreaterThanOrEqual(layout.artworkRadius + 8);
        expect(placement.attachment.x === 300 || placement.attachment.y === -50).toBe(true);
    });

    it('keeps the nearest clear inset without scanning every distant candidate against every control', () => {
        const layout = createLayout();
        layout.preferred = { center: { x: 200, y: -100 }, attachment: { x: 200, y: -50 }, side: 'top' };
        layout.opposite = { center: { x: 200, y: 500 }, attachment: { x: 200, y: 450 }, side: 'bottom' };
        let coordinateReads = 0;
        const distantControls = Array.from({ length: 1000 }, (_, index) => ({
            get x() {
                coordinateReads++;
                return 1000 + index * 30;
            },
            y: 1000,
            radius: 6,
        }));
        layout.obstacles = [{ x: 200, y: 30, radius: 8 }, ...distantControls];

        expect(placeRotationHandle(layout)).toMatchObject({ center: { x: 178, y: 30 }, side: 'inset' });
        // Bound collision work independently of machine speed for large drawing selections.
        expect(coordinateReads).toBeLessThan(distantControls.length * 20);
    });

    it('does not expose a clipped interaction target when the viewport is too small', () => {
        const layout = createLayout();
        layout.bounds.right = 40;
        expect(placeRotationHandle(layout)).toBeUndefined();
    });
});
