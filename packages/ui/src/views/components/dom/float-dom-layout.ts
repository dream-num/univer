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

import type { FloatDomContentBoxMode, IFloatDomLayout } from '../../../services/dom/canvas-dom-layer.service';

export interface IFloatDomLayoutStyle {
    wrapper: {
        top: number;
        left: number;
        width: number;
        height: number;
        transform: string;
        opacity: number;
    };
    inner: {
        width: number;
        height: number;
        left: number | 'auto';
        top: number | 'auto';
        right: number | 'auto';
        bottom: number | 'auto';
    };
}

const LEGACY_WRAPPER_INSET = 2;
const LEGACY_CONTENT_INSET = 4;

export function resolveFloatDomLayout(
    position: IFloatDomLayout,
    contentBoxMode: FloatDomContentBoxMode = 'legacy-inset'
): IFloatDomLayoutStyle {
    const isExactBounds = contentBoxMode === 'exact-bounds';

    return {
        wrapper: {
            top: position.startY,
            left: position.startX,
            width: Math.max(position.endX - position.startX - (isExactBounds ? 0 : LEGACY_WRAPPER_INSET), 0),
            height: Math.max(position.endY - position.startY - (isExactBounds ? 0 : LEGACY_WRAPPER_INSET), 0),
            transform: `rotate(${position.rotate}deg)`,
            opacity: position.opacity ?? 1,
        },
        inner: {
            // Keep the historical negative-size behavior in legacy mode. Some
            // older layers can still emit content smaller than the inset.
            width: position.width - (isExactBounds ? 0 : LEGACY_CONTENT_INSET),
            height: position.height - (isExactBounds ? 0 : LEGACY_CONTENT_INSET),
            left: position.absolute.left ? 0 : 'auto',
            top: position.absolute.top ? 0 : 'auto',
            right: position.absolute.left ? 'auto' : 0,
            bottom: position.absolute.top ? 'auto' : 0,
        },
    };
}
