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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { Injector } from '../../../common/di';
import { IImageIoService, ImageSourceType } from '../../../services/image-io/image-io.service';
import { IURLImageService } from '../../../services/image-io/url-image.service';
import { ImageCacheMap } from '../image-cache';

class FakeImage {
    src = '';
    onload: null | (() => void) = null;
    onerror: null | (() => void) = null;
    private _attrs = new Map<string, string>();

    setAttribute(key: string, value: string): void {
        this._attrs.set(key, value);
    }

    removeAttribute(key: string): void {
        this._attrs.delete(key);
    }

    getAttribute(key: string): string | null {
        return this._attrs.get(key) ?? null;
    }
}

const flushTasks = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('ImageCacheMap', () => {
    it('should cache UUID images loaded through the image io service', async () => {
        vi.stubGlobal('Image', FakeImage);

        const injector = new Injector();
        injector.add([IImageIoService, {
            useValue: {
                getImage: async (source: string) => `blob:${source}`,
            },
        }]);

        const cache = new ImageCacheMap(injector);
        const loadEvents: string[] = [];

        expect(cache.getImage(ImageSourceType.UUID, 'uuid-1', () => loadEvents.push('loaded'))).toBeNull();

        await flushTasks();

        const cached = cache.getImage(ImageSourceType.UUID, 'uuid-1', () => loadEvents.push('loaded')) as FakeImage;
        expect(cached.src).toBe('blob:uuid-1');

        cached.onload?.();
        expect(cached.getAttribute('data-error')).toBeNull();
        expect(loadEvents).toEqual(['loaded']);
    });

    it('should fall back to source url on URL image errors and mark error state', async () => {
        vi.stubGlobal('Image', FakeImage);

        const injector = new Injector();
        injector.add([IURLImageService, {
            useValue: {
                getImage: async () => {
                    throw new Error('network');
                },
            },
        }]);

        const cache = new ImageCacheMap(injector);
        const errorEvents: string[] = [];

        expect(cache.getImage(ImageSourceType.URL, 'https://img.test/a.png', undefined, () => errorEvents.push('errored'))).toBeNull();

        await flushTasks();

        const cached = cache.getImage(ImageSourceType.URL, 'https://img.test/a.png') as FakeImage;
        expect(cached.src).toBe('https://img.test/a.png');

        cached.onerror?.();
        expect(cached.getAttribute('data-error')).toBe('true');
        expect(errorEvents).toEqual(['errored']);
    });

    it('should log UUID load failures and use the raw source for base64 images', async () => {
        vi.stubGlobal('Image', FakeImage);

        const injector = new Injector();
        injector.add([IImageIoService, {
            useValue: {
                getImage: async () => {
                    throw new Error('uuid load failed');
                },
            },
        }]);

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const cache = new ImageCacheMap(injector);

        expect(cache.getImage(ImageSourceType.UUID, 'uuid-2')).toBeNull();
        expect(cache.getImage(ImageSourceType.BASE64, 'data:image/png;base64,abc')).toBeNull();

        await flushTasks();

        const uuidCached = cache.getImage(ImageSourceType.UUID, 'uuid-2') as FakeImage;
        const base64Cached = cache.getImage(ImageSourceType.BASE64, 'data:image/png;base64,abc') as FakeImage;

        expect(uuidCached.src).toBe('');
        expect(base64Cached.src).toBe('data:image/png;base64,abc');
        expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });
});
