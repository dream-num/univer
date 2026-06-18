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

import type { IEmbedPassiveViewportWheelContext } from '../types/embed-ui';

export function normalizePassiveWheelDelta(event: WheelEvent, scaleX = 1, scaleY = 1): { offsetX: number; offsetY: number } {
    let offsetX = event.deltaX / (Math.abs(scaleX) || 1);
    let offsetY = event.deltaY / (Math.abs(scaleY) || 1);

    if (event.shiftKey) {
        offsetX = ((event.deltaY || event.deltaX) * 3) / (Math.abs(scaleX) || 1);
        offsetY = 0;
    } else {
        const absOffsetX = Math.abs(offsetX);
        const absOffsetY = Math.abs(offsetY);
        if (absOffsetY >= absOffsetX * 2) {
            offsetX = 0;
        } else if (absOffsetX >= absOffsetY * 2) {
            offsetY = 0;
        }
    }

    return { offsetX, offsetY };
}

export function scrollSceneViewportPassive(
    context: IEmbedPassiveViewportWheelContext,
    viewport: {
        viewportScrollX?: number;
        viewportScrollY?: number;
        scrollByViewportDeltaVal?: (delta: { viewportScrollX: number; viewportScrollY: number }) => unknown;
    } | null | undefined,
    scene?: { scaleX?: number; scaleY?: number; makeDirty?: (force?: boolean) => void }
): boolean {
    if (!viewport?.scrollByViewportDeltaVal) {
        return false;
    }

    const { offsetX, offsetY } = normalizePassiveWheelDelta(context.event, scene?.scaleX, scene?.scaleY);
    if (!offsetX && !offsetY) {
        return false;
    }

    const previousX = viewport.viewportScrollX ?? 0;
    const previousY = viewport.viewportScrollY ?? 0;
    viewport.scrollByViewportDeltaVal({
        viewportScrollX: offsetX,
        viewportScrollY: offsetY,
    });
    const changed = (viewport.viewportScrollX ?? 0) !== previousX ||
        (viewport.viewportScrollY ?? 0) !== previousY;
    if (changed) {
        scene?.makeDirty?.(true);
    }

    return changed;
}
