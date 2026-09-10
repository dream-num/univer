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

import { FontCache } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocsLayoutFontLoader } from '../font-loader';

function stubFontPlatform(worker = false, loading: Promise<void> = Promise.resolve()) {
    const faces = new Set<FontFace>();
    class PlatformFontFace {
        constructor(readonly family: string, readonly source: string | ArrayBuffer, readonly descriptors?: FontFaceDescriptors) {}

        async load() {
            await loading;
            return this;
        }
    }
    vi.stubGlobal('FontFace', PlatformFontFace);
    if (worker) {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('fonts', faces);
    } else {
        vi.stubGlobal('document', { fonts: faces });
    }
    return faces;
}

describe('DocsLayoutFontLoader', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        FontCache.invalidateMetrics(() => true);
    });

    it.each([false, true])('loads identical bytes and descriptors in the %s worker realm and drops stale fallback metrics', async (worker) => {
        const faces = stubFontPlatform(worker);
        const loader = new DocsLayoutFontLoader();
        const source = new Uint8Array([1, 2, 3]).buffer;
        FontCache.setFontMeasureCache('11pt MissingFace', 'A', {
            width: 7,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
            actualBoundingBoxAscent: 7,
            actualBoundingBoxDescent: 1,
        });
        await loader.load([{ family: 'Document Face', source, descriptors: { weight: '700', style: 'italic' } }]);
        expect([...faces]).toMatchObject([{ family: 'Document Face', source, descriptors: { weight: '700', style: 'italic' } }]);
        expect(FontCache.getFontMeasureCache('11pt MissingFace', 'A')).toBeUndefined();
        loader.dispose();
        expect(faces.size).toBe(0);
    });

    it('waits for all faces before publishing them and removes only the faces it owns', async () => {
        let finish!: () => void;
        const pending = new Promise<void>((resolve) => {
            finish = resolve;
        });
        const faces = stubFontPlatform(false, pending);
        const externalFace = new FontFace('Existing Face', 'url(existing.woff2)');
        faces.add(externalFace);
        const loader = new DocsLayoutFontLoader();
        const loading = loader.load([{ family: 'New Face', source: 'url(new.woff2)' }]);
        expect([...faces]).toEqual([externalFace]);
        finish();
        await loading;
        expect(faces.size).toBe(2);
        loader.dispose();
        loader.dispose();
        expect([...faces]).toEqual([externalFace]);
    });

    it('does not publish a font after its owner is disposed during loading', async () => {
        let finish!: () => void;
        const pending = new Promise<void>((resolve) => {
            finish = resolve;
        });
        const faces = stubFontPlatform(false, pending);
        const loader = new DocsLayoutFontLoader();
        const loading = loader.load([{ family: 'Pending Face', source: 'url(pending.woff2)' }]);
        loader.dispose();
        finish();
        await expect(loading).rejects.toThrow('disposed');
        expect(faces.size).toBe(0);
    });

    it('does not silently render with fallback metrics after a configured face fails to load', async () => {
        const faces = stubFontPlatform(false, Promise.reject(new Error('Font request failed')));
        const loader = new DocsLayoutFontLoader();
        await expect(loader.load([{ family: 'Missing Face', source: 'url(missing.woff2)' }])).rejects.toThrow('Font request failed');
        expect(faces.size).toBe(0);
    });

    it('requires the platform only when explicit font faces are configured', async () => {
        vi.stubGlobal('FontFace', undefined);
        const emptyLoader = new DocsLayoutFontLoader();
        await expect(emptyLoader.load([])).resolves.toBeUndefined();
        emptyLoader.dispose();
        const loader = new DocsLayoutFontLoader();
        await expect(loader.load([{ family: 'Font', source: 'url(font.woff2)' }])).rejects.toThrow('FontFace support');
        loader.dispose();
    });

    it('rejects empty configured font names and sources', async () => {
        const faces = stubFontPlatform();
        for (const definition of [
            { family: '', source: 'url(font.woff2)' },
            { family: 'Font', source: '' },
            { family: 'Font', source: new ArrayBuffer(0) },
        ]) {
            const loader = new DocsLayoutFontLoader();
            await expect(loader.load([definition])).rejects.toThrow('must not be empty');
            loader.dispose();
        }
        expect(faces.size).toBe(0);
    });
});
