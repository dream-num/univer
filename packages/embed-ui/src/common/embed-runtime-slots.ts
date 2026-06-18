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

import type { IDisposable } from '@univerjs/core';
import { toDisposable } from '@univerjs/core';

export const EMBED_CONTENT_ROOT_ATTRIBUTE = 'data-embed-content-root';
export const EMBED_CANVAS_ROOT_ATTRIBUTE = 'data-embed-canvas-root';
export const EMBED_OVERLAY_ROOT_ATTRIBUTE = 'data-embed-overlay-root';
export const EMBED_POPUP_ROOT_ATTRIBUTE = 'data-embed-popup-root';
export const EMBED_MENU_SLOT_ATTRIBUTE = 'data-embed-menu-slot';
export const EMBED_FOOTER_SLOT_ATTRIBUTE = 'data-embed-footer-slot';

const EMBED_RUNTIME_SLOT_STYLE_ID = 'univer-embed-runtime-slot-styles';
const EMBED_RUNTIME_SLOT_OWNER_ATTRIBUTE = 'data-embed-runtime-slot-owner';
const DEFAULT_SLOT_CLASS = 'univer-embed-runtime-slot';

export function findEmbedRuntimeSlot(root: HTMLElement, attribute: string): HTMLElement | undefined {
    if (root.matches(`[${attribute}]`)) {
        return root;
    }

    return root.querySelector<HTMLElement>(`[${attribute}]`) ?? undefined;
}

export function ensureEmbedDefaultRuntimeSlots(root: HTMLElement): IDisposable {
    ensureEmbedRuntimeSlotStyles();

    const created: HTMLElement[] = [];
    ensureSlot(root, EMBED_CONTENT_ROOT_ATTRIBUTE, 'univer-embed-runtime-slot-content', created);
    ensureSlot(root, EMBED_CANVAS_ROOT_ATTRIBUTE, 'univer-embed-runtime-slot-canvas', created);
    ensureSlot(root, EMBED_OVERLAY_ROOT_ATTRIBUTE, 'univer-embed-runtime-slot-overlay', created);
    ensureSlot(root, EMBED_POPUP_ROOT_ATTRIBUTE, 'univer-embed-runtime-slot-popup', created);

    return toDisposable(() => {
        created.forEach((slot) => slot.remove());
    });
}

function ensureSlot(root: HTMLElement, attribute: string, className: string, created: HTMLElement[]): HTMLElement {
    const existing = findEmbedRuntimeSlot(root, attribute);
    if (existing) {
        return existing;
    }

    const slot = document.createElement('div');
    slot.setAttribute(attribute, 'true');
    slot.setAttribute(EMBED_RUNTIME_SLOT_OWNER_ATTRIBUTE, 'embed-ui');
    slot.className = `${DEFAULT_SLOT_CLASS} ${className}`;
    root.appendChild(slot);
    created.push(slot);
    return slot;
}

function ensureEmbedRuntimeSlotStyles(): void {
    if (typeof document === 'undefined' || document.getElementById(EMBED_RUNTIME_SLOT_STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = EMBED_RUNTIME_SLOT_STYLE_ID;
    style.textContent = `
.univer-embed-runtime-slot {
    box-sizing: border-box;
    position: absolute;
    inset: 0;
}
.univer-embed-runtime-slot-content,
.univer-embed-runtime-slot-canvas {
    overflow: hidden;
}
.univer-embed-runtime-slot-canvas {
    pointer-events: none;
}
.univer-embed-runtime-slot-canvas > * {
    pointer-events: auto;
}
.univer-embed-runtime-slot-overlay,
.univer-embed-runtime-slot-popup {
    pointer-events: none;
}
.univer-embed-runtime-slot-overlay > *,
.univer-embed-runtime-slot-popup > * {
    pointer-events: auto;
}
`;
    document.head.appendChild(style);
}
