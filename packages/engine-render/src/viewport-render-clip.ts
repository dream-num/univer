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

import type { UniverRenderingContext } from './context';

interface IViewportRenderClip {
    top: number;
    bottom: number;
}

// Track the actual clip for each context. A renderer may transform or replace its input bounds.
export const viewportRenderClips = new WeakMap<UniverRenderingContext, IViewportRenderClip>();

export function getViewportClipInDevicePixels(ctx: UniverRenderingContext, top: number, height: number): IViewportRenderClip | undefined {
    const { b, c, d, f } = ctx.getTransform();
    if (b !== 0 || c !== 0 || !(d > 0) || !(height > 0)) {
        return;
    }
    return { top: top * d + f, bottom: (top + height) * d + f };
}

export function setViewportRenderClip(ctx: UniverRenderingContext, clip: IViewportRenderClip | undefined): void {
    if (clip) {
        viewportRenderClips.set(ctx, clip);
    } else {
        viewportRenderClips.delete(ctx);
    }
}
