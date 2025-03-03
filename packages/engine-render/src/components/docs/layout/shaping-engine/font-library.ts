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

import type { IStyleBase, Nullable } from '@univerjs/core';
import { BooleanNumber } from '@univerjs/core';

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

type FontDistance = [number, number];

enum CompareResult {
    // a is equal to b.
    EQUAL,

    // a is greater than b.
    GREATER,

    // a is less than b.
    LESS,
}

enum FontStyle {
    // The default, typically upright style.
    Normal,

    // A cursive style with custom letterform.
    Italic,

    // Just a slanted version of the normal style.
    Oblique,
}

enum FontWeight {
    // Thin weight (100).
    THIN = 100,

    // Extra light weight (200).
    EXTRALIGHT = 200,

    // Light weight (300).
    LIGHT = 300,

    // Regular weight (400).
    REGULAR = 400,

    // Medium weight (500).
    MEDIUM = 500,

    // Semibold weight (600).
    SEMIBOLD = 600,

    // Bold weight (700).
    BOLD = 700,

    // Extrabold weight (800).
    EXTRABOLD = 800,

    // Black weight (900).
    BLACK = 900,
}

interface IFontVariant {
    // The style of the font (normal / italic).
    style: FontStyle;
    /// How heavy the font is normal / bold.
    weight: FontWeight;
    // How condensed or expanded the font is (0.5 - 2.0).
    // stretch: FontStretch,
}

export interface IFontInfo {
    // The typographic font family this font is part of.
    family: string;
    // Properties that distinguish this font from other fonts in the same family.
    variant: IFontVariant;
}

function getFontInfoFromFontData(fontData: IFontData): IFontInfo {
    const { family, style: styleString } = fontData;

    let style = FontStyle.Normal;
    let weight = FontWeight.REGULAR;

    if (/italic/i.test(styleString)) {
        style = FontStyle.Italic;
    }

    switch (true) {
        case /thin|hairline/i.test(styleString): {
            weight = FontWeight.THIN;
            break;
        }

        case /(extra|ultra) *light/i.test(styleString): {
            weight = FontWeight.EXTRALIGHT;
            break;
        }

        case /light/i.test(styleString): {
            weight = FontWeight.LIGHT;
            break;
        }

        case /medium/i.test(styleString): {
            weight = FontWeight.MEDIUM;
            break;
        }

        case /(semi|demi) *bold/i.test(styleString): {
            weight = FontWeight.SEMIBOLD;
            break;
        }

        case /bold/i.test(styleString): {
            weight = FontWeight.BOLD;
            break;
        }

        case /(extra|ultra) *bold/i.test(styleString): {
            weight = FontWeight.EXTRABOLD;
            break;
        }

        case /black|heavy/i.test(styleString): {
            weight = FontWeight.BLACK;
            break;
        }
    }

    return {
        family,
        variant: {
            style,
            weight,
        },
    };
}

function getFontInfoFromTextStyle(style: IStyleBase): IFontInfo {
    const { ff, bl = BooleanNumber.FALSE, it = BooleanNumber.FALSE } = style;

    return {
        family: ff ?? 'Arial',
        variant: {
            style: it === BooleanNumber.TRUE ? FontStyle.Italic : FontStyle.Normal,
            weight: bl === BooleanNumber.TRUE ? FontWeight.BOLD : FontWeight.REGULAR,
        },
    };
}

function fontInfoDistance(a: IFontInfo, b: IFontInfo): FontDistance {
    let styleDistance = Number.POSITIVE_INFINITY;

    if (a.variant.style === b.variant.style) {
        styleDistance = 0;
    } else if (a.variant.style !== FontStyle.Normal && b.variant.style !== FontStyle.Normal) {
        styleDistance = 1;
    } else {
        styleDistance = 2;
    }

    const weightDistance = Math.abs(a.variant.weight - b.variant.weight);

    return [
        styleDistance,
        weightDistance,
    ];
}

function compareFontInfoDistance(a: FontDistance, b: FontDistance) {
    if (a[0] === b[0] && a[1] === b[1]) {
        return CompareResult.EQUAL;
    }

    if (a[0] === b[0]) {
        return a[1] > b[1] ? CompareResult.GREATER : CompareResult.LESS;
    }

    return a[0] > b[0] ? CompareResult.GREATER : CompareResult.LESS;
}

async function checkLocalFontsPermission() {
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        return false;
    }

    if (typeof window === 'undefined') {
        return false;
    }
    if (window.navigator == null || window.navigator?.permissions == null) {
        return false;
    }

    try {
        const status = await window.navigator.permissions.query({ name: 'local-fonts' as PermissionName });

        return status.state === 'granted';
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (_err) {
        return false;
    }
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

        const permissionStatus = await checkLocalFontsPermission();

        if (!permissionStatus) {
            return;
        }

        if (!('queryLocalFonts' in window)) {
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

            this.isReady = true;
        } catch (err) {
            console.error(err);
        }
    }

    findBestMatchFontByStyle(style: IStyleBase): Nullable<IFontWithBuffer> {
        const ff = style.ff!;
        const fontMap = this._fontBook.get(ff);

        if (fontMap == null) {
            // TODO: @jocs use font family to match the best.
            return;
        }

        let bestFont: Nullable<IFontWithBuffer> = null;
        let bestDistance: FontDistance = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];

        for (const fontWithBuffer of fontMap.values()) {
            const { font } = fontWithBuffer;
            const currentFontInfo = getFontInfoFromFontData(font);
            const targetFontInfo = getFontInfoFromTextStyle(style);
            const distance = fontInfoDistance(currentFontInfo, targetFontInfo);

            if (bestFont == null) {
                bestFont = fontWithBuffer;
                bestDistance = distance;
            } else {
                const result = compareFontInfoDistance(bestDistance, distance);

                if (result === CompareResult.GREATER) {
                    bestFont = fontWithBuffer;
                    bestDistance = distance;
                }
            }
        }

        return bestFont;
    }

    getValidFontFamilies(families: string[]): string[] {
        return families.filter((family) => this._fontBook.has(family));
    }
}

export const fontLibrary = new FontLibrary();
