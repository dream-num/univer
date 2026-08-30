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
import {
    extractClipboardHtmlImageFiles,
    extractClipboardImageFiles,
    extractClipboardTextImageFile,
    normalizeClipboardImageFile,
    svgImageFileToDataUrl,
    writeImageSourceToClipboard,
} from '../clipboard-image';

describe('writeImageSourceToClipboard', () => {
    const originalClipboardItem = globalThis.ClipboardItem;
    const originalFetch = globalThis.fetch;
    const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, 'clipboard');

    afterEach(() => {
        vi.useRealTimers();
        globalThis.ClipboardItem = originalClipboardItem;
        globalThis.fetch = originalFetch;
        if (originalClipboardDescriptor) {
            Object.defineProperty(globalThis.navigator, 'clipboard', originalClipboardDescriptor);
        } else {
            delete (globalThis.navigator as { clipboard?: Clipboard }).clipboard;
        }
    });

    it('writes a PNG source through the browser clipboard API', async () => {
        const blob = new Blob(['png'], { type: 'image/png' });
        const write = vi.fn(async (_items: ClipboardItem[]) => undefined);
        globalThis.fetch = vi.fn(async () => new Response(blob, { status: 200 })) as typeof fetch;
        globalThis.ClipboardItem = class ClipboardItemMock {
            readonly types = ['image/png'];
            readonly presentationStyle = 'unspecified' as const;

            constructor(readonly data: Record<string, Blob | Promise<Blob>>) {}

            async getType(type: string): Promise<Blob> {
                return this.data[type];
            }
        } as unknown as typeof ClipboardItem;
        Object.defineProperty(globalThis.navigator, 'clipboard', {
            configurable: true,
            value: { write },
        });

        await expect(writeImageSourceToClipboard('data:image/png;base64,cG5n')).resolves.toBe(true);
        const item = write.mock.calls[0][0][0] as unknown as { data: Record<string, Promise<Blob>> };
        const copiedBlob = await item.data['image/png'];
        expect(copiedBlob).toMatchObject({ size: blob.size, type: blob.type });
    });

    it('returns false when binary clipboard writing is unavailable', async () => {
        Object.defineProperty(globalThis.navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        });

        await expect(writeImageSourceToClipboard('data:image/png;base64,cG5n')).resolves.toBe(false);
    });

    it('prefers image item files over the fallback file list', () => {
        const itemImage = new File(['item'], 'item.png', { type: 'image/png' });
        const fallbackImage = new File(['fallback'], 'fallback.png', { type: 'image/png' });
        const clipboardData = {
            files: [fallbackImage],
            items: [{ kind: 'file', type: 'image/png', getAsFile: () => itemImage }],
        } as unknown as DataTransfer;

        expect(extractClipboardImageFiles(clipboardData)).toEqual([itemImage]);
    });

    it('recognizes image files whose clipboard MIME type is missing', () => {
        const image = new File(['image'], 'clipboard-image.PNG');
        const clipboardData = {
            files: [image],
            items: [],
        } as unknown as DataTransfer;

        expect(extractClipboardImageFiles(clipboardData)).toEqual([image]);
    });

    it('deduplicates HTML images and ignores images from hidden content', async () => {
        globalThis.fetch = vi.fn(async () => new Response(new Blob(['png'], { type: 'image/png' }), { status: 200 })) as typeof fetch;

        const files = await extractClipboardHtmlImageFiles(`
            <img src="https://example.com/visible.png">
            <img src="https://example.com/visible.png">
            <div aria-hidden="true"><img src="https://example.com/hidden.png"></div>
        `);

        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(files).toHaveLength(1);
    });

    it('extracts lazy HTML images and inline SVG as image files', async () => {
        globalThis.fetch = vi.fn(async () => new Response(new Blob(['png'], { type: 'image/png' }), { status: 200 })) as typeof fetch;

        const files = await extractClipboardHtmlImageFiles(`
            <img data-src="https://example.com/lazy.png">
            <picture><source srcset="https://example.com/picture.png 1x"><img></picture>
            <svg viewBox="0 0 10 10"><path d="M0 0h10v10z"></path></svg>
        `);

        expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/lazy.png', expect.anything());
        expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/picture.png', expect.anything());
        expect(files).toEqual([
            expect.objectContaining({ type: 'image/png' }),
            expect.objectContaining({ type: 'image/png' }),
            expect.objectContaining({ type: 'image/svg+xml' }),
        ]);
    });

    it('stops waiting for inaccessible HTML images', async () => {
        vi.useFakeTimers();
        globalThis.fetch = vi.fn((_input, init) => new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        })) as typeof fetch;

        const result = extractClipboardHtmlImageFiles('<img src="https://example.com/blocked.png">');
        await vi.advanceTimersByTimeAsync(5_000);

        await expect(result).resolves.toEqual([]);
    });

    it('restores a missing MIME type before image insertion', async () => {
        const image = new File(['image'], 'clipboard-image.png');

        await expect(normalizeClipboardImageFile(image)).resolves.toMatchObject({ type: 'image/png' });
    });

    it('keeps sanitized SVG images as vectors during normalization', async () => {
        const image = new File([
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24z"/></svg>',
        ], 'clipboard-image.svg', { type: 'image/svg+xml' });

        const normalized = await normalizeClipboardImageFile(image);

        expect(normalized).toMatchObject({ name: 'clipboard-image.svg', type: 'image/svg+xml' });
        await expect(normalized?.text()).resolves.toContain('viewBox="0 0 24 24"');
        await expect(svgImageFileToDataUrl(normalized!)).resolves.toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    });

    it('converts a pasted image data URL into a file', async () => {
        const file = await extractClipboardTextImageFile('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=');

        expect(file).toMatchObject({ name: 'pasted-image.svg', type: 'image/svg+xml' });
    });

    it('converts complete SVG text into a sanitized file', async () => {
        const file = await extractClipboardTextImageFile(`
            <svg onload="alert(1)" viewBox="0 0 24 24">
                <script>alert(1)</script>
                <style>.remote { fill: url(https://example.com/pixel.svg) }</style>
                <image href="https://example.com/tracker.png" />
                <use href="#safe-path" />
                <path id="safe-path" onclick="alert(1)" style="fill:url(javascript:alert(1))" d="M0 0h24v24z"/>
            </svg>
        `);

        expect(file).toMatchObject({ name: 'pasted-image.svg', type: 'image/svg+xml' });
        await expect(file?.text()).resolves.not.toMatch(/script|onclick|example\.com|javascript:/);
        await expect(file?.text()).resolves.toContain('href="#safe-path"');
    });

    it('keeps ordinary text as text', async () => {
        await expect(extractClipboardTextImageFile('Use <svg> in this sentence.')).resolves.toBeNull();
    });

    it('rejects oversized raw SVG before parsing it', async () => {
        const oversized = `<svg>${' '.repeat(5_000_000)}</svg>`;

        await expect(extractClipboardTextImageFile(oversized)).resolves.toBeNull();
    });
});
