/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IStyleBase, Nullable } from '@univerjs/core';

interface IFontData {
    readonly family: string;
    readonly fullName: string;
    readonly postscriptName: string;
    readonly style: string;
}

interface IFontWithBuffer {
    readonly font: IFontData;
    readonly buffer: ArrayBuffer;
}

class FontLibrary {
    isReady = false;
    private _fontBook: Map<string, Map<string, IFontWithBuffer>> = new Map();

    constructor() {
        this._loadFontsToBook();
    }

    private async _loadFontsToBook() {
        if (this.isReady) {
            return;
        }

        try {
            const availableFonts = await (window as any).queryLocalFonts();
            for (const font of availableFonts) {
                const { family, style } = font;
                let fontMap = this._fontBook.get(family);

                if (fontMap == null) {
                    fontMap = new Map();
                    this._fontBook.set(family, fontMap);
                }

                const blob = await font.blob();
                const buffer = await blob.arrayBuffer();

                fontMap.set(style, {
                    font,
                    buffer,
                });
            }

            console.log(this._fontBook);
        } catch (err) {
            console.error(err);
        } finally {
            this.isReady = true;
        }
    }

    getFontByStyle(style: IStyleBase): Nullable<IFontWithBuffer> {
        const ff = style.ff!;
        const fontMap = this._fontBook.get(ff);

        if (fontMap == null) {
            return;
        }

        // TODO: 通过 style 模糊匹配最佳字体
        return fontMap.values().next().value;
    }

    getValidFontFamilies(families: string[]): string[] {
        return families.filter((family) => this._fontBook.has(family));
    }
}

export const fontLibrary = new FontLibrary();
