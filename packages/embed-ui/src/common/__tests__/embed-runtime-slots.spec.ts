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

/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import {
    EMBED_CANVAS_ROOT_ATTRIBUTE,
    EMBED_CONTENT_ROOT_ATTRIBUTE,
    EMBED_OVERLAY_ROOT_ATTRIBUTE,
    EMBED_POPUP_ROOT_ATTRIBUTE,
    ensureEmbedDefaultRuntimeSlots,
    findEmbedRuntimeSlot,
} from '../embed-runtime-slots';

describe('embed runtime slots', () => {
    it('creates independent default slot elements instead of marking the host root as every slot', () => {
        const host = document.createElement('div');

        const disposable = ensureEmbedDefaultRuntimeSlots(host);

        const content = findEmbedRuntimeSlot(host, EMBED_CONTENT_ROOT_ATTRIBUTE);
        const canvas = findEmbedRuntimeSlot(host, EMBED_CANVAS_ROOT_ATTRIBUTE);
        const overlay = findEmbedRuntimeSlot(host, EMBED_OVERLAY_ROOT_ATTRIBUTE);
        const popup = findEmbedRuntimeSlot(host, EMBED_POPUP_ROOT_ATTRIBUTE);

        expect(content).toBeInstanceOf(HTMLElement);
        expect(canvas).toBeInstanceOf(HTMLElement);
        expect(overlay).toBeInstanceOf(HTMLElement);
        expect(popup).toBeInstanceOf(HTMLElement);
        expect(content).not.toBe(host);
        expect(canvas).not.toBe(host);
        expect(overlay).not.toBe(host);
        expect(popup).not.toBe(host);
        expect(new Set([content, canvas, overlay, popup]).size).toBe(4);

        disposable.dispose();

        expect(findEmbedRuntimeSlot(host, EMBED_CONTENT_ROOT_ATTRIBUTE)).toBeUndefined();
        expect(findEmbedRuntimeSlot(host, EMBED_CANVAS_ROOT_ATTRIBUTE)).toBeUndefined();
        expect(findEmbedRuntimeSlot(host, EMBED_OVERLAY_ROOT_ATTRIBUTE)).toBeUndefined();
        expect(findEmbedRuntimeSlot(host, EMBED_POPUP_ROOT_ATTRIBUTE)).toBeUndefined();
    });

    it('preserves host-provided slots', () => {
        const host = document.createElement('div');
        const content = document.createElement('section');
        content.setAttribute(EMBED_CONTENT_ROOT_ATTRIBUTE, 'true');
        host.append(content);

        const disposable = ensureEmbedDefaultRuntimeSlots(host);
        const canvas = findEmbedRuntimeSlot(host, EMBED_CANVAS_ROOT_ATTRIBUTE);

        expect(findEmbedRuntimeSlot(host, EMBED_CONTENT_ROOT_ATTRIBUTE)).toBe(content);
        expect(canvas).toBeInstanceOf(HTMLElement);

        disposable.dispose();

        expect(findEmbedRuntimeSlot(host, EMBED_CONTENT_ROOT_ATTRIBUTE)).toBe(content);
        expect(findEmbedRuntimeSlot(host, EMBED_CANVAS_ROOT_ATTRIBUTE)).toBeUndefined();
    });

    it('adds Tailwind classes for runtime slot layout and pointer behavior', () => {
        const host = document.createElement('div');

        const disposable = ensureEmbedDefaultRuntimeSlots(host);
        const content = findEmbedRuntimeSlot(host, EMBED_CONTENT_ROOT_ATTRIBUTE);
        const canvas = findEmbedRuntimeSlot(host, EMBED_CANVAS_ROOT_ATTRIBUTE);
        const overlay = findEmbedRuntimeSlot(host, EMBED_OVERLAY_ROOT_ATTRIBUTE);
        const popup = findEmbedRuntimeSlot(host, EMBED_POPUP_ROOT_ATTRIBUTE);

        expect(content?.className).toContain('univer-absolute');
        expect(content?.className).toContain('univer-overflow-hidden');
        expect(canvas?.className).toContain('univer-pointer-events-none');
        expect(canvas?.className).toContain('[&>*]:univer-pointer-events-auto');
        expect(overlay?.className).toContain('univer-pointer-events-none');
        expect(popup?.className).toContain('[&>*]:univer-pointer-events-auto');
        expect(document.querySelector('style#univer-embed-runtime-slot-styles')).toBeNull();

        disposable.dispose();
    });
});
