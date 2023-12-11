/**
 * Copyright 2023-present DreamNum Inc.
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

export function getCurrentScrollXY(scrollTimer: any) {
    const scene = scrollTimer.getScene();
    const viewport = scrollTimer.getViewportByCoord(scene);
    const scrollX = 0;
    const scrollY = 0;
    if (!viewport) {
        return {
            scrollX,
            scrollY,
        };
    }
    const actualScroll = viewport.getActualScroll(viewport.scrollX, viewport.scrollY);
    return {
        scrollX: actualScroll.x,
        scrollY: actualScroll.y,
    };
}
