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

import { Injector, IURLImageService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { URLImageService } from '../url-image.service';

describe('URLImageService', () => {
    let service: IURLImageService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IURLImageService, { useClass: URLImageService }]);
        service = injector.get(IURLImageService);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('should use downloader when registered and reset after disposal', async () => {
        const disposable = service.registerURLImageDownloader(async (url) => `base64:${url}`);

        await expect(service.getImage('https://example.com/image.png')).resolves.toBe('base64:https://example.com/image.png');

        disposable.dispose();

        await expect(service.getImage('https://example.com/image.png')).resolves.toBe('https://example.com/image.png');
    });

    it('should fall back to original url when custom downloader fails', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        service.registerURLImageDownloader(async () => {
            throw new Error('downloader failed');
        });

        await expect(service.getImage('https://example.com/image.png')).resolves.toBe('https://example.com/image.png');
        expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should download blob through converted base64 when custom downloader succeeds', async () => {
        const blob = new Blob(['image']);
        const requestedUrls: string[] = [];
        const fetchMock = async (url: string) => {
            requestedUrls.push(url);
            return {
                blob: async () => blob,
            };
        };

        vi.stubGlobal('fetch', fetchMock);
        service.registerURLImageDownloader(async () => 'data:image/png;base64,Zm9v');

        await expect(service.downloadImage('https://example.com/image.png')).resolves.toBe(blob);
        expect(requestedUrls).toEqual(['data:image/png;base64,Zm9v']);
    });

    it('should fall back to the original url when custom blob download fails', async () => {
        const blob = new Blob(['image']);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const requestedUrls: string[] = [];
        const fetchMock = async (url: string) => {
            requestedUrls.push(url);
            return {
                blob: async () => blob,
            };
        };

        vi.stubGlobal('fetch', fetchMock);
        service.registerURLImageDownloader(async () => {
            throw new Error('downloader failed');
        });

        await expect(service.downloadImage('https://example.com/image.png')).resolves.toBe(blob);
        expect(requestedUrls).toEqual(['https://example.com/image.png']);
        expect(errorSpy).toHaveBeenCalledTimes(1);
    });
});
