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

import { ImageSourceType, ImageUploadStatusType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DRAWING_IMAGE_ALLOW_SIZE } from '../../basics/config';
import { ImageIoService } from '../image-io-impl.service';

type MockLoadEvent = ProgressEvent<FileReader> & {
    target: {
        result: string | null;
    };
};

class MockImage {
    src = '';
}

class SuccessFileReader {
    onload: null | ((event: MockLoadEvent) => void) = null;

    readAsDataURL(_file: File) {
        queueMicrotask(() => {
            this.onload?.({
                target: {
                    result: 'data:image/png;base64,Zm9v',
                },
            } as MockLoadEvent);
        });
    }
}

class EmptyFileReader {
    onload: null | ((event: MockLoadEvent) => void) = null;

    readAsDataURL(_file: File) {
        queueMicrotask(() => {
            this.onload?.({
                target: {
                    result: null,
                },
            } as MockLoadEvent);
        });
    }
}

describe('ImageIoService', () => {
    let service: ImageIoService;

    beforeEach(() => {
        service = new ImageIoService();
        vi.stubGlobal('Image', MockImage);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('should emit wait count changes and manage image source cache', () => {
        const counts: number[] = [];
        const cachedImage = new MockImage() as unknown as HTMLImageElement;

        service.change$.subscribe((count) => counts.push(count));
        service.setWaitCount(2);
        service.addImageSourceCache('https://example.com/image.png', ImageSourceType.URL, cachedImage);

        expect(service.getImageSourceCache('https://example.com/image.png', ImageSourceType.URL)).toBe(cachedImage);
        expect(service.getImageSourceCache('data:image/png;base64,Zm9v', ImageSourceType.BASE64)).toMatchObject({
            src: 'data:image/png;base64,Zm9v',
        });
        expect(counts).toEqual([2]);
    });

    it('should ignore invalid cache insertions and resolve image ids directly', async () => {
        service.addImageSourceCache('data:image/png;base64,Zm9v', ImageSourceType.BASE64, new MockImage() as unknown as HTMLImageElement);
        service.addImageSourceCache('https://example.com/image.png', ImageSourceType.URL, null);

        expect(service.getImageSourceCache('https://example.com/image.png', ImageSourceType.URL)).toBeUndefined();
        await expect(service.getImage('image-id')).resolves.toBe('image-id');
    });

    it('should reject unsupported image types and oversized files', async () => {
        const counts: number[] = [];
        service.change$.subscribe((count) => counts.push(count));

        service.setWaitCount(1);
        await expect(service.saveImage(new File(['abc'], 'a.txt', { type: 'text/plain' }))).rejects.toThrow(ImageUploadStatusType.ERROR_IMAGE_TYPE);

        service.setWaitCount(1);
        await expect(service.saveImage(new File(['abc'], 'a.png', { type: 'image/png' }))).resolves.toMatchObject({
            source: expect.any(String),
        });

        service.setWaitCount(1);
        await expect(
            service.saveImage(new File([new Uint8Array(DRAWING_IMAGE_ALLOW_SIZE + 1)], 'big.png', { type: 'image/png' }))
        ).rejects.toThrow(ImageUploadStatusType.ERROR_EXCEED_SIZE);

        expect(counts).toContain(0);
    });

    it('should reject when file reader returns empty result', async () => {
        vi.stubGlobal('FileReader', EmptyFileReader);
        service.setWaitCount(1);

        await expect(service.saveImage(new File(['abc'], 'empty.png', { type: 'image/png' }))).rejects.toThrow(ImageUploadStatusType.ERROR_IMAGE);
    });

    it('should save valid images as base64 payload', async () => {
        vi.stubGlobal('FileReader', SuccessFileReader);
        service.setWaitCount(1);

        await expect(service.saveImage(new File(['abc'], 'ok.png', { type: 'image/png' }))).resolves.toMatchObject({
            imageId: expect.any(String),
            imageSourceType: ImageSourceType.BASE64,
            source: 'data:image/png;base64,Zm9v',
            base64Cache: 'data:image/png;base64,Zm9v',
            status: ImageUploadStatusType.SUCCUSS,
        });
    });
});
