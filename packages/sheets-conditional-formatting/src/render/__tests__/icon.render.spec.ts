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

import { Rect } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConditionalFormattingIcon } from '../icon.render';

describe('conditional formatting icon assets', () => {
    let images: HTMLImageElement[];

    beforeEach(() => {
        images = [];
        vi.spyOn(HTMLImageElement.prototype, 'src', 'set').mockImplementation(function (this: HTMLImageElement) {
            images.push(this);
        });
    });

    afterEach(() => vi.restoreAllMocks());

    it('invalidates the cached parent when icons finish loading', () => {
        const extension = new ConditionalFormattingIcon();
        const parent = new Rect('icon-parent');
        const dirty = vi.spyOn(parent, 'makeDirty');
        extension.parent = parent;
        try {
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                image.dispatchEvent(new Event('load'));
            }
            expect(dirty).toHaveBeenCalledTimes(images.length);
            expect(dirty).toHaveBeenLastCalledWith(true);
            for (const image of images) {
                image.dispatchEvent(new Event('load'));
            }
            expect(dirty).toHaveBeenCalledTimes(images.length);
        } finally {
            extension.dispose();
            parent.dispose();
        }
    });

    it('disconnects pending image loads when disposed', () => {
        const extension = new ConditionalFormattingIcon();
        const parent = new Rect('disposed-icon-parent');
        const dirty = vi.spyOn(parent, 'makeDirty');
        extension.parent = parent;
        extension.dispose();
        try {
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                expect(image.onload).toBeNull();
                image.dispatchEvent(new Event('load'));
            }
            expect(dirty).not.toHaveBeenCalled();
        } finally {
            parent.dispose();
        }
    });
});
