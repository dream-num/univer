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

import type { IDocsLayoutFontFace } from './config/config';
import { Disposable } from '@univerjs/core';
import { FontCache } from '@univerjs/engine-render';

/** Owns the same explicitly supplied font faces in the rendering and layout realms. */
export class DocsLayoutFontLoader extends Disposable {
    private _loading: Promise<void> | null = null;
    private _fontSet: FontFaceSet | undefined;
    private _faces: FontFace[] = [];

    load(fonts: readonly IDocsLayoutFontFace[]): Promise<void> {
        this._loading ??= this._load(fonts);
        return this._loading;
    }

    override dispose(): void {
        for (const face of this._faces) {
            this._fontSet?.delete(face);
        }
        if (this._faces.length > 0) {
            // A face can replace the fallback of any cached font stack.
            FontCache.invalidateMetrics(() => true);
        }
        this._faces = [];
        this._fontSet = undefined;
        super.dispose();
    }

    private async _load(fonts: readonly IDocsLayoutFontFace[]): Promise<void> {
        this.ensureNotDisposed();
        if (fonts.length === 0) {
            return;
        }
        const fontSet = typeof document === 'undefined'
            ? (globalThis as { fonts?: FontFaceSet }).fonts
            : document.fonts;
        if (typeof FontFace === 'undefined' || fontSet == null) {
            throw new Error('Document layout requires FontFace support to load the configured fonts.');
        }

        try {
            const faces = fonts.map(({ family, source, descriptors }) => {
                if (!family.trim() || (typeof source === 'string' ? !source.trim() : source.byteLength === 0)) {
                    throw new TypeError('Document layout font family and source must not be empty.');
                }
                return new FontFace(family, source, descriptors);
            });
            await Promise.all(faces.map((face) => face.load()));
            this.ensureNotDisposed();
            this._fontSet = fontSet;
            this._faces = faces;
            for (const face of faces) {
                fontSet.add(face);
            }
            FontCache.invalidateMetrics(() => true);
        } catch (error) {
            this.dispose();
            throw error;
        }
    }
}
