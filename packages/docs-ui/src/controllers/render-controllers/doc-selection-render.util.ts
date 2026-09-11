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

import type { IMouseEvent, IPointerEvent } from '@univerjs/engine-render';
import { DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE } from '../../services/doc-embed-integration.service';

export function isEmbedInteractionEvent(evt: IPointerEvent | IMouseEvent): boolean {
    const target = (evt as Event).target;
    if (typeof Element !== 'undefined' && target instanceof Element && target.closest(`[${DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`) != null) {
        return true;
    }

    if (typeof document === 'undefined') {
        return false;
    }

    const point = getEventClientPoint(evt, target);
    const clientX = point?.clientX;
    const clientY = point?.clientY;
    if (typeof clientX !== 'number' || typeof clientY !== 'number' || !Number.isFinite(clientX) || !Number.isFinite(clientY)) {
        return false;
    }

    if (typeof document.elementFromPoint !== 'function') {
        return false;
    }

    return document.elementFromPoint(clientX, clientY)?.closest(`[${DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`) != null;
}

export function getEventClientPoint(evt: IPointerEvent | IMouseEvent, target: EventTarget | null): { clientX: number; clientY: number } | undefined {
    if (Number.isFinite(evt.clientX) && Number.isFinite(evt.clientY)) {
        return { clientX: evt.clientX, clientY: evt.clientY };
    }

    if (typeof Element !== 'undefined' && target instanceof Element && Number.isFinite(evt.offsetX) && Number.isFinite(evt.offsetY)) {
        const rect = target.getBoundingClientRect();
        return {
            clientX: rect.left + evt.offsetX,
            clientY: rect.top + evt.offsetY,
        };
    }

    if (Number.isFinite(evt.x) && Number.isFinite(evt.y)) {
        return { clientX: evt.x, clientY: evt.y };
    }

    return undefined;
}
