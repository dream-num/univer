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

import type { IBoundRectNoAngle, IDocsTableRenderViewport } from '@univerjs/engine-render';

export function isDocSideMenuTableOverlapping(
    outline: IBoundRectNoAngle,
    table: IBoundRectNoAngle,
    viewport: IDocsTableRenderViewport | null
): boolean {
    if (table.bottom <= outline.top || table.top >= outline.bottom) {
        return false;
    }

    let left = table.left;
    let right = table.right;
    if (viewport && (viewport.leadingInsetLeft ?? 0) + viewport.contentWidth + (viewport.trailingInsetRight ?? 0) > viewport.viewportWidth) {
        const clipLeft = viewport.viewportLeft ?? table.left - (viewport.leadingInsetLeft ?? 0);
        left = Math.max(clipLeft, table.left - viewport.scrollLeft);
        right = Math.min(clipLeft + viewport.viewportWidth, table.left + viewport.contentWidth - viewport.scrollLeft);
    }

    return right > left && left < outline.right && right > outline.left;
}
