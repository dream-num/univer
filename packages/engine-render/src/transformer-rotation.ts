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

import type { IBoundRectNoAngle, IPoint } from './basics/vector2';

export interface IRotationHandleCandidate {
    center: IPoint;
    attachment: IPoint;
    side: 'top' | 'bottom';
}

export interface IRotationHandlePlacement {
    center: IPoint;
    attachment: IPoint;
    side: 'top' | 'bottom' | 'inset';
    adjusted: boolean;
}

export interface IRotationHandleObstacle extends IPoint {
    radius: number;
}

export interface IRotationHandleLayout {
    bounds: IBoundRectNoAngle;
    radius: number;
    artworkRadius: number;
    preferred: IRotationHandleCandidate;
    opposite: IRotationHandleCandidate;
    corners: IPoint[];
    obstacles: IRotationHandleObstacle[];
    previousSide?: IRotationHandlePlacement['side'];
}

const EDGE_GAP = 8;
const RETURN_GAP = 12;
const CONTROL_GAP = 4;

function distanceSquared(a: IPoint, b: IPoint): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function contains(bounds: IBoundRectNoAngle, point: IPoint, margin = 0): boolean {
    return point.x >= bounds.left + margin && point.x <= bounds.right - margin &&
        point.y >= bounds.top + margin && point.y <= bounds.bottom - margin;
}

function isClear(point: IPoint, radius: number, obstacles: IRotationHandleObstacle[]): boolean {
    return obstacles.every((obstacle) => distanceSquared(point, obstacle) >= (radius + obstacle.radius + CONTROL_GAP) ** 2);
}

function shorten(candidate: IRotationHandleCandidate, bounds: IBoundRectNoAngle): IPoint | undefined {
    let start = 0;
    let end = 1;
    for (const axis of ['x', 'y'] as const) {
        const from = candidate.attachment[axis];
        const delta = candidate.center[axis] - from;
        const min = axis === 'x' ? bounds.left : bounds.top;
        const max = axis === 'x' ? bounds.right : bounds.bottom;
        if (Math.abs(delta) < 1e-8) {
            if (from < min || from > max) return;
            continue;
        }
        const first = (min - from) / delta;
        const last = (max - from) / delta;
        start = Math.max(start, Math.min(first, last));
        end = Math.min(end, Math.max(first, last));
    }
    if (start > end) return;
    return {
        x: candidate.attachment.x + (candidate.center.x - candidate.attachment.x) * end,
        y: candidate.attachment.y + (candidate.center.y - candidate.attachment.y) * end,
    };
}

function nearestAttachment(point: IPoint, corners: IPoint[]): IPoint {
    const projections = corners.map((a, index) => {
        const b = corners[(index + 1) % corners.length];
        const length = distanceSquared(a, b);
        const t = length ? Math.max(0, Math.min(1, ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / length)) : 0;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    });
    return projections.reduce((best, next) => distanceSquared(next, point) < distanceSquared(best, point) ? next : best);
}

function insetCandidates(layout: IRotationHandleLayout, bounds: IBoundRectNoAngle): IPoint[] {
    const { preferred, opposite, obstacles, artworkRadius } = layout;
    const clamp = (point: IPoint) => ({
        x: Math.max(bounds.left, Math.min(bounds.right, point.x)),
        y: Math.max(bounds.top, Math.min(bounds.bottom, point.y)),
    });
    const candidates = [preferred.center, opposite.center];
    for (const x of [bounds.left, (bounds.left + bounds.right) / 2, bounds.right]) {
        for (const y of [bounds.top, (bounds.top + bounds.bottom) / 2, bounds.bottom]) {
            candidates.push({ x, y });
        }
    }
    for (const obstacle of obstacles) {
        const gap = artworkRadius + obstacle.radius + CONTROL_GAP;
        candidates.push(
            { x: obstacle.x - gap, y: obstacle.y },
            { x: obstacle.x + gap, y: obstacle.y },
            { x: obstacle.x, y: obstacle.y - gap },
            { x: obstacle.x, y: obstacle.y + gap }
        );
    }
    return candidates.map(clamp);
}

/** Keep the complete interaction target inside the viewport; all distances are screen pixels. */
export function placeRotationHandle(layout: IRotationHandleLayout): IRotationHandlePlacement | undefined {
    const { radius, artworkRadius, preferred, opposite, obstacles, previousSide } = layout;
    const inset = radius + EDGE_GAP;
    const bounds = {
        left: layout.bounds.left + inset,
        top: layout.bounds.top + inset,
        right: layout.bounds.right - inset,
        bottom: layout.bounds.bottom - inset,
    };
    if (bounds.left > bounds.right || bounds.top > bounds.bottom) return;

    const canReturn = !previousSide || previousSide === preferred.side || contains(bounds, preferred.center, RETURN_GAP);
    const candidates = canReturn ? [preferred, opposite] : [opposite, preferred];
    for (const candidate of candidates) {
        const center = shorten(candidate, bounds);
        if (center && isClear(center, artworkRadius, obstacles)) {
            return { ...candidate, center, adjusted: candidate !== preferred || distanceSquared(center, preferred.center) > 0.01 };
        }
    }

    let center: IPoint | undefined;
    let nearestDistance = Infinity;
    for (const point of insetCandidates(layout, bounds)) {
        const distance = distanceSquared(point, preferred.center);
        // A farther candidate cannot improve placement, so skip its collision scan.
        if (distance < nearestDistance && isClear(point, artworkRadius, obstacles)) {
            center = point;
            nearestDistance = distance;
        }
    }
    if (!center) return;
    return { center, attachment: nearestAttachment(center, layout.corners), side: 'inset', adjusted: true };
}
