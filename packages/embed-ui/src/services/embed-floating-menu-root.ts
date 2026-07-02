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

import type { IEmbedFloatingMenuMountContext } from '../types/embed-ui';

export function resolveEmbedFloatingMenuRoot(context: Pick<IEmbedFloatingMenuMountContext, 'renderScope' | 'runtimeScope'>): HTMLElement {
    if (context.renderScope.fullscreen && context.runtimeScope.roots.menuSlot) {
        return context.runtimeScope.roots.menuSlot;
    }

    const overlayRoot = context.runtimeScope.roots.overlay
        ?? context.renderScope.overlayRoot
        ?? context.renderScope.rootElement;
    const chromeRoot = overlayRoot.parentElement?.classList.contains('univer-embed-float-dom__chrome')
        ? overlayRoot.parentElement
        : undefined;

    return chromeRoot ?? overlayRoot;
}
