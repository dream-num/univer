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
import { createIdentifier, IConfigService } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import type { IUniverUIConfig } from '../config/config';
import { UI_PLUGIN_CONFIG_KEY } from '../config/config';

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
     * Font classification. Monospaced fonts are available in code block font pickers.
     */
    category?: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting';
}

const DEFAULT_FONTS = [
    ['宋体', 'serif'],
    ['Arial', 'sans-serif'],
    ['Baskerville', 'serif'],
    ['Comic Sans MS', 'handwriting'],
    ['Courier New', 'monospace'],
    ['Helvetica', 'sans-serif'],
    ['Times New Roman', 'serif'],
    ['Verdana', 'sans-serif'],
    ['Apple LiGothic', 'sans-serif'],
    ['Apple LiSung', 'serif'],
    ['Hei', 'sans-serif'],
    ['Kai', 'handwriting'],
    ['LiHei Pro', 'sans-serif'],
    ['LiSong Pro', 'serif'],
    ['STFangsong', 'serif'],
    ['STHeiti', 'sans-serif'],
    ['STKaiti', 'handwriting'],
    ['STSong', 'serif'],
    ['报隶-繁', 'handwriting'],
    ['报隶-简', 'handwriting'],
    ['冬青黑体简体中文', 'sans-serif'],
    ['黑体-繁', 'sans-serif'],
    ['黑体-简', 'sans-serif'],
    ['华文仿宋', 'serif'],
    ['华文楷体', 'handwriting'],
    ['华文宋体', 'serif'],
    ['楷体-繁', 'handwriting'],
    ['楷体-简', 'handwriting'],
    ['兰亭黑-繁', 'sans-serif'],
    ['兰亭黑-简', 'sans-serif'],
    ['隶变-繁', 'handwriting'],
    ['隶变-简', 'handwriting'],
    ['凌慧体-繁', 'handwriting'],
    ['凌慧体-简', 'handwriting'],
    ['翩翩体-繁', 'handwriting'],
    ['翩翩体-简', 'handwriting'],
    ['苹方-繁', 'sans-serif'],
    ['苹方-港', 'sans-serif'],
    ['苹方-简', 'sans-serif'],
    ['手札体-繁', 'handwriting'],
    ['手札体-简', 'handwriting'],
    ['宋体-繁', 'serif'],
    ['宋体-简', 'serif'],
    ['娃娃体-繁', 'handwriting'],
    ['娃娃体-简', 'handwriting'],
    ['魏碑-繁', 'handwriting'],
    ['魏碑-简', 'handwriting'],
    ['行楷-繁', 'handwriting'],
    ['行楷-简', 'handwriting'],
    ['雅痞-繁', 'display'],
    ['雅痞-简', 'display'],
    ['圆体-繁', 'sans-serif'],
    ['圆体-简', 'sans-serif'],
    ['Arial Black', 'sans-serif'],
    ['Big Caslon', 'serif'],
    ['Courier', 'monospace'],
    ['Didot', 'serif'],
    ['Futura', 'sans-serif'],
    ['Georgia', 'serif'],
    ['Helvetica Neue', 'sans-serif'],
    ['Optima', 'sans-serif'],
    ['Times', 'serif'],
    ['Tahoma', 'sans-serif'],
    ['BIZ UDGothic', 'monospace'],
    ['BIZ UDMincho', 'monospace'],
    ['Hiragino Maru Gothic Pro', 'sans-serif'],
    ['Hiragino Maru Gothic ProN', 'sans-serif'],
    ['Hiragino Mincho Pro', 'serif'],
    ['Hiragino Mincho ProN', 'serif'],
    ['Hiragino Sans', 'sans-serif'],
    ['Klee', 'handwriting'],
    ['Osaka', 'sans-serif'],
    ['Toppan Bunkyu Gothic', 'sans-serif'],
    ['Toppan Bunkyu Midashi Gothic', 'sans-serif'],
    ['Toppan Bunkyu Midashi Mincho', 'serif'],
    ['Toppan Bunkyu Mincho', 'serif'],
    ['Tsukushi A Round Gothic', 'sans-serif'],
    ['Tsukushi B Round Gothic', 'sans-serif'],
    ['YuKyokasho', 'handwriting'],
    ['YuKyokasho Yoko', 'handwriting'],
    ['YuMincho +36p Kana', 'serif'],
    ['American Typewriter', 'serif'],
    ['Andale Mono', 'monospace'],
    ['Apple Chancery', 'handwriting'],
    ['Apple SD Gothic Neo', 'sans-serif'],
    ['Apple Symbols', 'display'],
    ['AppleGothic', 'sans-serif'],
    ['AppleMyungjo', 'serif'],
    ['Arial Unicode MS', 'sans-serif'],
    ['Athelas', 'serif'],
    ['Avenir', 'sans-serif'],
    ['Avenir Next', 'sans-serif'],
    ['Avenir Next Condensed', 'sans-serif'],
    ['Ayuthaya', 'sans-serif'],
    ['Bangla MN', 'serif'],
    ['Bangla Sangam MN', 'sans-serif'],
    ['Bauhaus 93', 'display'],
    ['Bodoni 72', 'serif'],
    ['Bodoni 72 Oldstyle', 'serif'],
    ['Bodoni 72 Smallcaps', 'serif'],
    ['Bodoni Ornaments', 'display'],
    ['Bookshelf Symbol 7', 'display'],
    ['Bradley Hand', 'handwriting'],
    ['Chalkboard', 'handwriting'],
    ['Chalkboard SE', 'handwriting'],
    ['Chalkduster', 'handwriting'],
    ['Charter', 'serif'],
    ['Cochin', 'serif'],
    ['Copperplate', 'serif'],
    ['Devanagari Sangam MN', 'sans-serif'],
    ['Din Alternate', 'sans-serif'],
    ['Euphemia UCAS', 'sans-serif'],
    ['Galvji', 'sans-serif'],
    ['Geneva', 'sans-serif'],
    ['Gill Sans', 'sans-serif'],
    ['Gujarati Sangam MN', 'sans-serif'],
    ['GungSeo', 'handwriting'],
    ['Gurmukhi MN', 'serif'],
    ['Gurmukhi Sangam MN', 'sans-serif'],
    ['HeadLineA', 'display'],
    ['Herculanum', 'display'],
    ['Hiragino Kaku Gothic Pro', 'sans-serif'],
    ['Hiragino Kaku Gothic ProN', 'sans-serif'],
    ['Hiragino Kaku Gothic Std', 'sans-serif'],
    ['Hiragino Kaku Gothic StdN', 'sans-serif'],
    ['Hoefler Text', 'serif'],
    ['Impact', 'sans-serif'],
    ['InaiMathi', 'sans-serif'],
    ['Iowan Old Style', 'serif'],
    ['Kannada MN', 'serif'],
    ['Kannada Sangam MN', 'sans-serif'],
    ['Kefa', 'serif'],
    ['Khmer MN', 'serif'],
    ['Khmer Sangam MN', 'sans-serif'],
    ['Kohinoor Bangla', 'sans-serif'],
    ['Kohinoor Devanagari', 'sans-serif'],
    ['Kohinoor Telugu', 'sans-serif'],
    ['Krungthep', 'sans-serif'],
    ['Lao MN', 'serif'],
    ['Lao Sangam MN', 'sans-serif'],
    ['Lucida Grande', 'sans-serif'],
    ['Luminari', 'display'],
    ['Malayalam MN', 'serif'],
    ['Malayalam Sangam MN', 'sans-serif'],
    ['Marion', 'serif'],
    ['Marker Felt', 'handwriting'],
    ['Menlo', 'monospace'],
    ['Microsoft Sans Serif', 'sans-serif'],
    ['Modern No. 20', 'serif'],
    ['Monaco', 'monospace'],
    ['Mukta Mahee', 'sans-serif'],
    ['Nanum Brush Script', 'handwriting'],
    ['Nanum Gothic', 'sans-serif'],
    ['Nanum Myeongjo', 'serif'],
    ['Nanum Pen Script', 'handwriting'],
    ['Noteworthy', 'handwriting'],
    ['Oriya MN', 'serif'],
    ['Oriya Sangam MN', 'sans-serif'],
    ['Palatino', 'serif'],
    ['Papyrus', 'display'],
    ['PCMyungjo', 'monospace'],
    ['Phosphate', 'display'],
    ['PilGi', 'handwriting'],
    ['Plantagenet Cherokee', 'serif'],
    ['PT Mono', 'monospace'],
    ['PT Sans', 'sans-serif'],
    ['PT Sans Caption', 'sans-serif'],
    ['PT Serif', 'serif'],
    ['PT Serif Caption', 'serif'],
    ['Rockwell', 'serif'],
    ['Sathu', 'sans-serif'],
    ['Savoye LET', 'handwriting'],
    ['Seravek', 'sans-serif'],
    ['Shree Devanagari 714', 'sans-serif'],
    ['SignPainter', 'handwriting'],
    ['Silom', 'display'],
    ['Sinhala MN', 'serif'],
    ['Sinhala Sangam MN', 'sans-serif'],
    ['Skia', 'sans-serif'],
    ['Snell Roundhand', 'handwriting'],
    ['STIXGeneral', 'serif'],
    ['Sukhumvit Set', 'sans-serif'],
    ['Superclarendon', 'serif'],
    ['Tamil MN', 'serif'],
    ['Tamil Sangam MN', 'sans-serif'],
    ['Telugu MN', 'serif'],
    ['Telugu Sangam MN', 'sans-serif'],
    ['Trattatello', 'handwriting'],
    ['Trebuchet MS', 'sans-serif'],
    ['Webdings', 'display'],
    ['Wingdings', 'display'],
    ['Wingdings 2', 'display'],
    ['Wingdings 3', 'display'],
    ['YuGothic', 'sans-serif'],
    ['YuGothic Light', 'sans-serif'],
    ['YuGothic Medium', 'sans-serif'],
    ['Zapfino', 'handwriting'],
] as const satisfies ReadonlyArray<readonly [string, NonNullable<IFontConfig['category']>]>;

const DEFAULT_FONT_LIST: IFontConfig[] = DEFAULT_FONTS.map(([value, category]) => ({ value, label: value, category }));

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
        if (!context) return false;

        const text = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const size = '72px';

        const baseFonts = ['monospace', 'serif', 'sans-serif'];
        const defaultWidths: Record<string, number> = {};

        baseFonts.forEach((base) => {
            context.font = `${size} ${base}`;
            defaultWidths[base] = context.measureText(text).width;
        });

        return baseFonts.some((base) => {
            context.font = `${size} "${fontValue}", ${base}`;
            const width = context.measureText(text).width;
            return width !== defaultWidths[base];
        });
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
