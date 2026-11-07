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

import type { IRange } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SHEET_EXTENSION_TYPE } from '../sheets/extensions/sheet-extension';
import type { SpreadsheetSkeleton } from '../sheets/sheet.render-skeleton';
import { RenderComponent } from '../component';
import { ComponentExtension } from '../extension';
import { Font } from '../sheets/extensions/font';

describe('RenderComponent', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('consults current extension eligibility instead of its static opt-in flag', () => {
        class ConditionalExtension extends ComponentExtension<unknown, string, unknown> {
            override viewportCacheReusable = true;
            enabled = false;

            override canReuseViewportCache(): boolean {
                return super.canReuseViewportCache() && this.enabled;
            }
        }
        const component = new RenderComponent<unknown, string, unknown>('conditional-component');
        const extension = new ConditionalExtension();
        component.viewportCacheReusable = true;
        component.register(extension);
        try {
            expect(component.canReuseViewportCache()).toBe(false);
            extension.enabled = true;
            expect(component.canReuseViewportCache()).toBe(true);
            extension.enabled = false;
            expect(component.canReuseViewportCache()).toBe(false);
        } finally {
            component.dispose();
        }
    });

    it.each([undefined, true])('keeps flag-only extensions without a callable eligibility method on the full path (%s)', (method) => {
        const component = new RenderComponent<unknown, string, unknown>('legacy-component');
        component.viewportCacheReusable = true;
        component.register({
            uKey: 'legacy-extension',
            viewportCacheReusable: true,
            canReuseViewportCache: method,
            dispose: vi.fn(),
        } as unknown as ComponentExtension<unknown, string, unknown>);
        try {
            expect(component.canReuseViewportCache()).toBe(false);
        } finally {
            component.dispose();
        }
    });

    it('does not inherit built-in cache eligibility through an unknown replacement subclass', () => {
        class UnknownFont extends Font {}
        const component = new RenderComponent<SpreadsheetSkeleton, SHEET_EXTENSION_TYPE, IRange[]>('replacement-component');
        component.viewportCacheReusable = true;
        const known = new Font();
        component.register(known);
        try {
            expect(component.canReuseViewportCache()).toBe(true);
            component.register(new UnknownFont());
            expect(component.canReuseViewportCache()).toBe(false);
        } finally {
            component.dispose();
            known.dispose();
        }
    });

    it.each([false, true])('disposes owned extensions once and disconnects image loads (loaded: %s)', (loaded) => {
        const image = document.createElement('img');
        vi.stubGlobal('Image', vi.fn(function () {
            return image;
        }));
        const component = new RenderComponent<SpreadsheetSkeleton, SHEET_EXTENSION_TYPE, IRange[]>('component');
        const extension = new Font();
        const dispose = vi.spyOn(extension, 'dispose');
        const dirty = vi.spyOn(component, 'makeDirty');
        component.register(extension);
        if (loaded) {
            image.dispatchEvent(new Event('load'));
            expect(dirty).toHaveBeenCalledExactlyOnceWith(true);
            dirty.mockClear();
        }

        component.dispose();
        expect(dispose).toHaveBeenCalledOnce();
        expect(component.extensions.size).toBe(0);
        expect(extension.parent).toBeNull();
        expect(image.onload).toBeNull();
        dirty.mockClear();
        image.dispatchEvent(new Event('load'));
        expect(dirty).not.toHaveBeenCalled();

        component.dispose();
        expect(dispose).toHaveBeenCalledOnce();
    });
});
