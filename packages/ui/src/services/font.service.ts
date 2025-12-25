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

import type { IDisposable } from '@univerjs/core';
import type { IUniverUIConfig } from '../controllers/config.schema';
import { createIdentifier, IConfigService } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { UI_PLUGIN_CONFIG_KEY } from '../controllers/config.schema';

export const IFontService = createIdentifier<IFontService>('univer.font-service');

/**
 * Font configuration interface
 */
export interface IFontConfig {
    /**
     * Unique identifier, usually also the preferred value for CSS font-family
     * @example 'Microsoft YaHei'
     */
    value: string;

    /**
     * Translation key for i18n
     * @example 'font.microsoft_yahei'
     */
    label: string;

    /**
     * Font category for UI grouping (optional)
     */
    category?: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting';
}

const DEFAULT_FONT_LIST: IFontConfig[] = [{
    value: 'Arial',
    label: 'fontFamily.arial',
    category: 'sans-serif',
}, {
    value: 'Times New Roman',
    label: 'fontFamily.times-new-roman',
    category: 'serif',
}, {
    value: 'Tahoma',
    label: 'fontFamily.tahoma',
    category: 'sans-serif',
}, {
    value: 'Verdana',
    label: 'fontFamily.verdana',
    category: 'sans-serif',
}, {
    value: 'Microsoft YaHei',
    label: 'fontFamily.microsoft-yahei',
    category: 'sans-serif',
}, {
    value: 'SimSun',
    label: 'fontFamily.simsun',
    category: 'serif',
}, {
    value: 'SimHei',
    label: 'fontFamily.simhei',
    category: 'sans-serif',
}, {
    value: 'Kaiti',
    label: 'fontFamily.kaiti',
    category: 'serif',
}, {
    value: 'FangSong',
    label: 'fontFamily.fangsong',
    category: 'serif',
}, {
    value: 'NSimSun',
    label: 'fontFamily.nsimsun',
    category: 'serif',
}, {
    value: 'STXinwei',
    label: 'fontFamily.stxinwei',
    category: 'serif',
}, {
    value: 'STXingkai',
    label: 'fontFamily.stxingkai',
    category: 'serif',
}, {
    value: 'STLiti',
    label: 'fontFamily.stliti',
    category: 'serif',
}];

export interface IFontService {
    /**
     * The data stream of the font list
     * UI components should subscribe to this stream to render dropdown lists
     * When the list changes (add, delete, update), a new value is automatically emitted
     */
    readonly fonts$: BehaviorSubject<IFontConfig[]>;

    /**
     * Get a snapshot of the current font list (synchronously)
     * Suitable for scenarios where subscribing to the stream is not needed,
     * or when obtaining the current state during logic processing
     */
    getFonts(): IFontConfig[];

    /**
     * Get a single font configuration by value
     */
    getFontByValue(value: string): IFontConfig | undefined;

    /**
     * Check if the current browser environment supports the font
     * (Based on document.fonts.check or Canvas fallback)
     */
    isFontSupported(fontValue: string): boolean;

    /**
     * Add a new font
     * @throws Error if the font value already exists
     */
    addFont(font: IFontConfig): void;

    /**
     * Update an existing font configuration
     * Supports partial updates (e.g., only updating stack or label)
     * @param value The unique identifier of the font to update
     * @param updates The fields to update
     */
    updateFont(value: string, updates: Partial<Omit<IFontConfig, 'value'>>): void;

    /**
     * Remove a font
     * @param value The identifier of the font to remove
     * @returns boolean Whether the removal was successful (e.g., built-in fonts may not be allowed to be removed)
     */
    removeFont(value: string): boolean;

    /**
     * Reset to the default built-in font list
     * (Used for the "Restore Defaults" feature)
     */
    resetToDefaults(): void;
}

export class FontService implements IFontService, IDisposable {
    readonly fonts$: BehaviorSubject<IFontConfig[]> = new BehaviorSubject<IFontConfig[]>([]);

    constructor(@IConfigService protected readonly _configService: IConfigService) {
        // Initialize font list from configuration
        const config = this._configService.getConfig<IUniverUIConfig>(UI_PLUGIN_CONFIG_KEY);
        const { customFontFamily } = config ?? {};

        let fonts: IFontConfig[] = [];

        if (customFontFamily) {
            if (Array.isArray(customFontFamily)) {
                fonts = [...DEFAULT_FONT_LIST, ...customFontFamily];
            } else if (customFontFamily.override) {
                fonts = [...customFontFamily.list];
            } else {
                fonts = [...DEFAULT_FONT_LIST, ...customFontFamily.list];
            }
        } else {
            fonts = [...DEFAULT_FONT_LIST];
        }

        this.fonts$.next(fonts);
    }

    dispose() {
        this.resetToDefaults();
        this.fonts$.complete();
    }

    getFonts(): IFontConfig[] {
        return this.fonts$.getValue();
    }

    getFontByValue(value: string): IFontConfig | undefined {
        return this.getFonts().find((font) => font.value === value);
    }

    /**
     * Check if the current browser environment supports the font
     * @param fontValue
     * @returns boolean Whether the font is supported
     */
    isFontSupported(fontValue: string): boolean {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            return false;
        }

        const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
        context.font = '12px monospace';
        const baselineWidth = context.measureText(testString).width;

        context.font = `12px "${fontValue}", monospace`;
        const newWidth = context.measureText(testString).width;

        return newWidth !== baselineWidth;
    }

    addFont(font: IFontConfig): void {
        const existingFont = this.getFontByValue(font.value);
        if (existingFont) {
            throw new Error(`[FontService]: Font with value "${font.value}" already exists.`);
        }

        const updatedFonts = [...this.getFonts(), font].sort();
        this.fonts$.next(updatedFonts);
    }

    updateFont(value: string, updates: Partial<Omit<IFontConfig, 'value'>>): void {
        const fonts = this.getFonts();
        const fontIndex = fonts.findIndex((font) => font.value === value);
        if (fontIndex === -1) {
            throw new Error(`Font with value "${value}" not found.`);
        }

        const updatedFont = { ...fonts[fontIndex], ...updates };
        const updatedFonts = [...fonts];
        updatedFonts[fontIndex] = updatedFont;

        this.fonts$.next(updatedFonts);
    }

    removeFont(value: string): boolean {
        const fonts = this.getFonts();
        const fontIndex = fonts.findIndex((font) => font.value === value);
        if (fontIndex === -1) {
            return false;
        }

        const updatedFonts = fonts.filter((font) => font.value !== value);
        this.fonts$.next(updatedFonts);
        return true;
    }

    resetToDefaults(): void {
        this.fonts$.next([...DEFAULT_FONT_LIST]);
    }
}
