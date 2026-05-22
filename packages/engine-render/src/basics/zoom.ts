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

import type { IWheelEvent } from './i-events';
import { EventConstants } from './i-events';

const MIN_ZOOM_RATIO = 0.1;
const MAX_ZOOM_RATIO = 4;
const PIXEL_DELTA_TO_ZOOM_RATIO = 0.008;
const MAX_WHEEL_ZOOM_STEP = 0.14;
const MAX_WHEEL_ZOOM_STEP_BELOW_ONE = 0.07;
const LINE_DELTA_PIXEL_SIZE = 16;
const PAGE_DELTA_PIXEL_SIZE = 800;
const ZOOM_RATIO_PRECISION = 100;

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function normalizeWheelDelta(event: Pick<IWheelEvent, 'deltaMode' | 'deltaX' | 'deltaY' | 'wheelDelta'>): number {
    const deltaY = Number.isFinite(event.deltaY) ? event.deltaY : 0;
    const deltaX = Number.isFinite(event.deltaX) ? event.deltaX : 0;
    let delta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;

    if (delta === 0 && typeof event.wheelDelta === 'number') {
        delta = -event.wheelDelta / 3;
    }

    if (event.deltaMode === EventConstants.DOM_DELTA_LINE) {
        delta *= LINE_DELTA_PIXEL_SIZE;
    } else if (event.deltaMode === EventConstants.DOM_DELTA_PAGE) {
        delta *= PAGE_DELTA_PIXEL_SIZE;
    }

    return delta;
}

export function getNextWheelZoomRatio(currentRatio: number, event: Pick<IWheelEvent, 'deltaMode' | 'deltaX' | 'deltaY' | 'wheelDelta'>): number {
    const validCurrentRatio = Number.isFinite(currentRatio) ? currentRatio : 1;

    const normalizedDelta = normalizeWheelDelta(event);
    if (normalizedDelta === 0) {
        return clamp(validCurrentRatio, MIN_ZOOM_RATIO, MAX_ZOOM_RATIO);
    }

    const maxStep = validCurrentRatio < 1 ? MAX_WHEEL_ZOOM_STEP_BELOW_ONE : MAX_WHEEL_ZOOM_STEP;
    const ratioDelta = clamp(-normalizedDelta * PIXEL_DELTA_TO_ZOOM_RATIO, -maxStep, maxStep);
    const nextRatio = Math.round((validCurrentRatio + ratioDelta) * ZOOM_RATIO_PRECISION) / ZOOM_RATIO_PRECISION;

    return clamp(nextRatio, MIN_ZOOM_RATIO, MAX_ZOOM_RATIO);
}
