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

import { Injector, ThemeService } from '@univerjs/core';
import { Rect } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RangeProtectionCanNotViewRenderExtension, RangeProtectionCanViewRenderExtension } from '../range-protection.render';

describe('range protection assets', () => {
    let image: HTMLImageElement;

    beforeEach(() => {
        vi.spyOn(HTMLImageElement.prototype, 'src', 'set').mockImplementation(function (this: HTMLImageElement) {
            image = this;
        });
    });

    afterEach(() => vi.restoreAllMocks());

    it.each([RangeProtectionCanViewRenderExtension, RangeProtectionCanNotViewRenderExtension])('invalidates cached protection pixels on load for %s', (Extension) => {
        const injector = new Injector([[ThemeService]]);
        const extension = new Extension(injector.get(ThemeService));
        const parent = new Rect('protection-parent');
        const dirty = vi.spyOn(parent, 'makeDirty');
        extension.parent = parent;
        try {
            image.dispatchEvent(new Event('load'));
            expect(dirty).toHaveBeenCalledExactlyOnceWith(true);
            image.dispatchEvent(new Event('load'));
            expect(dirty).toHaveBeenCalledOnce();
        } finally {
            extension.dispose();
            parent.dispose();
            injector.dispose();
        }
    });

    it.each([RangeProtectionCanViewRenderExtension, RangeProtectionCanNotViewRenderExtension])('disconnects pending protection image loads for %s', (Extension) => {
        const injector = new Injector([[ThemeService]]);
        const extension = new Extension(injector.get(ThemeService));
        const parent = new Rect('disposed-protection-parent');
        const dirty = vi.spyOn(parent, 'makeDirty');
        extension.parent = parent;
        extension.dispose();
        try {
            expect(image.onload).toBeNull();
            image.dispatchEvent(new Event('load'));
            expect(dirty).not.toHaveBeenCalled();
        } finally {
            parent.dispose();
            injector.dispose();
        }
    });
});
