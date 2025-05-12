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

import type { RGBColorType } from '@univerjs/core';
import { createIdentifier, Disposable, Inject, invertColorByMatrix, ThemeService } from '@univerjs/core';

export const ICanvasColorService = createIdentifier<ICanvasColorService>('univer.engine-render.canvas-color.service');
/**
 * This service maps a color or a theme-token to a color for rendering. Univer supports themes for rendering
 * and dark mode. This services is responsible for abstract this complexity for rendering components.
 */
export interface ICanvasColorService {
    getRenderColor(color: string): string;
}

export class DumbCanvasColorService implements ICanvasColorService {
    getRenderColor(color: string): string {
        return color;
    }
}

/**
 * This service inverts a color for dark mode. This service is exposed
 */
export class CanvasColorService extends Disposable implements ICanvasColorService {
    private readonly _cache = new Map<string, string>();
    private _invertAlgo = invertColorByMatrix;

    constructor(
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();
    }

    getRenderColor(color: string): string {
        if (!this._themeService.darkMode) {
            return color;
        }

        // TODO: if the color is background color from _themeService: do not invert it.
        // Or maybe there should be a whitelist.

        if (this._cache.has(color)) {
            return this._cache.get(color)!;
        }

        let cachedColor = '';
        if (color.startsWith('#')) {
            const invertedColor = this._invertAlgo(hexToRgb(color));
            cachedColor = rgbToHex(invertedColor);

            // append alpha channel if the original has alpha channel
            if (color.length === 4) {
                const alpha = color.charAt(3);
                cachedColor += alpha + alpha;
            }

            // For 8-digit hex (e.g., #RRGGBB[AA]), the alpha is the last two characters
            else if (color.length === 9) {
                const alpha = color.substring(7, 9);
                cachedColor += alpha;
            }
        } else if (color.startsWith('rgba')) {
            const stripped = color.slice(5, -1).split(',');
            const invertedColor = this._invertAlgo(stripped.slice(0, 3).map(Number) as RGBColorType);
            cachedColor = `rgba(${invertedColor[0]},${invertedColor[1]},${invertedColor[2]},${stripped[3]})`;
        } else if (color.startsWith('rgb')) {
            const stripped = color.slice(4, -1).split(',');
            const invertedColor = this._invertAlgo(stripped.map(Number) as RGBColorType);
            cachedColor = `rgb(${invertedColor[0]},${invertedColor[1]},${invertedColor[2]})`;
        } else if (color.includes('.')) {
            cachedColor = this._themeService.getColorFromTheme(color);
        } else {
            throw new Error(`[CanvasColorService]: illegal color ${color}`);
        }

        this._cache.set(color, cachedColor);
        return cachedColor;
    }
}

export function hexToRgb(_hex: string): RGBColorType {
    const hex = _hex.replace(/^#/, '');

    let r;
    let g;
    let b;
    if (hex.length === 3 || hex.length === 4) {
        r = Number.parseInt(hex.charAt(0) + hex.charAt(0), 16);
        g = Number.parseInt(hex.charAt(1) + hex.charAt(1), 16);
        b = Number.parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else {
        r = Number.parseInt(hex.substring(0, 2), 16);
        g = Number.parseInt(hex.substring(2, 4), 16);
        b = Number.parseInt(hex.substring(4, 6), 16);
    }

    // Return normalized RGBA values as an array
    return [r, g, b] as RGBColorType;
}

export function rgbToHex(rgbColor: RGBColorType): string {
    const r = Math.round(rgbColor[0]);
    const g = Math.round(rgbColor[1]);
    const b = Math.round(rgbColor[2]);

    // Convert each component to a 2-digit hex string
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');

    // Combine the components
    const hex = `#${rHex}${gHex}${bHex}`;
    return hex;
}
