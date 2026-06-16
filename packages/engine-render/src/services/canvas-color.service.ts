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
import { ColorKit, createIdentifier, Disposable, Inject, invertColorByMatrix, ThemeService } from '@univerjs/core';

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

const DARK_RENDER_COLOR_OVERRIDES: Record<string, string> = {
    '#17212b': '#e2e8f0',
    '#64748b': '#94a3b8',
    '#d9e0e7': '#253044',
    '#edf1f5': '#1b2535',
    '#eef2f6': '#1b2535',
    '#f2f5f8': '#101827',
    '#f3f6fa': '#18243a',
    '#f4f8ff': '#172a46',
    '#f5f9ff': '#12233a',
    '#f7f9fb': '#0d1422',
    '#f7f9fc': '#0d1422',
    '#f8fafc': '#0f172a',
    '#fbfcfd': '#07111f',
    '#fcfdff': '#050914',
    '#e8f1ff': '#173a69',
    '#eaf5ff': '#12315a',
    '#dbeafe': '#1e3a8a',
    '#bfdbfe': '#60a5fa',
    '#93c5fd': '#60a5fa',
    '#8eb6f5': '#60a5fa',
    '#60a5fa': '#60a5fa',
    '#2563eb': '#60a5fa',
    '#1d64d8': '#93c5fd',
    '#1d5cff': '#60a5fa',
    '#0f766e': '#2dd4bf',
    '#d7f4ef': '#134e4a',
    'rgba(37,99,235,0.05)': 'rgba(96,165,250,0.16)',
    'rgba(37,99,235,0.06)': 'rgba(96,165,250,0.18)',
    'rgba(37,99,235,0.08)': 'rgba(96,165,250,0.22)',
    'rgba(37,99,235,0.12)': 'rgba(96,165,250,0.26)',
    'rgba(37,99,235,0.18)': 'rgba(96,165,250,0.30)',
    'rgba(37,99,235,0.28)': 'rgba(96,165,250,0.38)',
    'rgba(239,246,255,0.88)': 'rgba(30,64,175,0.72)',
    'rgba(148,163,184,0.45)': 'rgba(148,163,184,0.52)',
};

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

        if (this._cache.has(color)) {
            return this._cache.get(color)!;
        }

        if (normalizeRenderColor(color) === 'transparent') {
            this._cache.set(color, 'transparent');
            return 'transparent';
        }

        let cachedColor = '';
        const mappedColor = getDarkRenderColorOverride(color);
        if (mappedColor) {
            cachedColor = mappedColor;
        } else if (color.startsWith('#')) {
            const invertedColor = this._invertAlgo(hexToRgb(color));
            cachedColor = rgbToHex(invertedColor);

            // append alpha channel if the original has alpha channel , such as #cccf
            if (color.length === 5) {
                const alpha = color.charAt(4);
                cachedColor += alpha + alpha;
            } else if (color.length === 9) {
                // For 8-digit hex (e.g., #RRGGBB[AA]), the alpha is the last two characters
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
        } else if (this._themeService.isValidThemeColor(color)) {
            // If the color is a theme token, we can get the color from the theme service
            return this._themeService.getColorFromTheme(color);
        } else if (new ColorKit(color).isValid) {
            // Support X11 color names
            const { r, g, b, a } = new ColorKit(color).toRgb();
            const invertedColor = this._invertAlgo([r, g, b] as RGBColorType);
            cachedColor = `rgba(${invertedColor[0]},${invertedColor[1]},${invertedColor[2]}, ${a})`;
        } else {
            throw new Error(`[CanvasColorService]: illegal color "${color}"`);
        }

        this._cache.set(color, cachedColor);
        return cachedColor;
    }
}

export function getDarkRenderColorOverride(color: string): string | null {
    const normalized = normalizeRenderColor(color);
    return DARK_RENDER_COLOR_OVERRIDES[normalized] ?? null;
}

function normalizeRenderColor(color: string): string {
    const trimmed = color.trim().toLowerCase();
    if (trimmed.startsWith('rgb')) {
        return trimmed.replace(/\s+/g, '');
    }

    return trimmed;
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
