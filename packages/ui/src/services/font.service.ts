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
    ['宋体', { category: 'serif' }],
    ['Arial', { category: 'sans-serif' }],
    ['Baskerville', { category: 'serif' }],
    ['Comic Sans MS', { category: 'handwriting' }],
    ['Courier New', { category: 'monospace' }],
    ['Helvetica', { category: 'sans-serif' }],
    ['Times New Roman', { category: 'serif' }],
    ['Verdana', { category: 'sans-serif' }],
    ['Apple LiGothic', { category: 'sans-serif' }],
    ['Apple LiSung', { category: 'serif' }],
    ['Hei', { category: 'sans-serif' }],
    ['Kai', { category: 'handwriting' }],
    ['LiHei Pro', { category: 'sans-serif' }],
    ['LiSong Pro', { category: 'serif' }],
    ['STFangsong', { category: 'serif' }],
    ['STHeiti', { category: 'sans-serif' }],
    ['STKaiti', { category: 'handwriting' }],
    ['STSong', { category: 'serif' }],
    ['报隶-繁', { category: 'handwriting' }],
    ['报隶-简', { category: 'handwriting' }],
    ['冬青黑体简体中文', { category: 'sans-serif' }],
    ['黑体-繁', { category: 'sans-serif' }],
    ['黑体-简', { category: 'sans-serif' }],
    ['华文仿宋', { category: 'serif' }],
    ['华文楷体', { category: 'handwriting' }],
    ['华文宋体', { category: 'serif' }],
    ['楷体-繁', { category: 'handwriting' }],
    ['楷体-简', { category: 'handwriting' }],
    ['兰亭黑-繁', { category: 'sans-serif' }],
    ['兰亭黑-简', { category: 'sans-serif' }],
    ['隶变-繁', { category: 'handwriting' }],
    ['隶变-简', { category: 'handwriting' }],
    ['凌慧体-繁', { category: 'handwriting' }],
    ['凌慧体-简', { category: 'handwriting' }],
    ['翩翩体-繁', { category: 'handwriting' }],
    ['翩翩体-简', { category: 'handwriting' }],
    ['苹方-繁', { category: 'sans-serif' }],
    ['苹方-港', { category: 'sans-serif' }],
    ['苹方-简', { category: 'sans-serif' }],
    ['手札体-繁', { category: 'handwriting' }],
    ['手札体-简', { category: 'handwriting' }],
    ['宋体-繁', { category: 'serif' }],
    ['宋体-简', { category: 'serif' }],
    ['娃娃体-繁', { category: 'handwriting' }],
    ['娃娃体-简', { category: 'handwriting' }],
    ['魏碑-繁', { category: 'handwriting' }],
    ['魏碑-简', { category: 'handwriting' }],
    ['行楷-繁', { category: 'handwriting' }],
    ['行楷-简', { category: 'handwriting' }],
    ['雅痞-繁', { category: 'display' }],
    ['雅痞-简', { category: 'display' }],
    ['圆体-繁', { category: 'sans-serif' }],
    ['圆体-简', { category: 'sans-serif' }],
    ['Arial Black', { category: 'sans-serif' }],
    ['Big Caslon', { category: 'serif' }],
    ['Courier', { category: 'monospace' }],
    ['Didot', { category: 'serif' }],
    ['Futura', { category: 'sans-serif' }],
    ['Georgia', { category: 'serif' }],
    ['Helvetica Neue', { category: 'sans-serif' }],
    ['Optima', { category: 'sans-serif' }],
    ['Times', { category: 'serif' }],
    ['Tahoma', { category: 'sans-serif' }],
    ['BIZ UDGothic', { category: 'monospace' }],
    ['BIZ UDMincho', { category: 'monospace' }],
    ['Hiragino Maru Gothic Pro', { category: 'sans-serif' }],
    ['Hiragino Maru Gothic ProN', { category: 'sans-serif' }],
    ['Hiragino Mincho Pro', { category: 'serif' }],
    ['Hiragino Mincho ProN', { category: 'serif' }],
    ['Hiragino Sans', { category: 'sans-serif' }],
    ['Klee', { category: 'handwriting' }],
    ['Osaka', { category: 'sans-serif' }],
    ['Toppan Bunkyu Gothic', { category: 'sans-serif' }],
    ['Toppan Bunkyu Midashi Gothic', { category: 'sans-serif' }],
    ['Toppan Bunkyu Midashi Mincho', { category: 'serif' }],
    ['Toppan Bunkyu Mincho', { category: 'serif' }],
    ['Tsukushi A Round Gothic', { category: 'sans-serif' }],
    ['Tsukushi B Round Gothic', { category: 'sans-serif' }],
    ['YuKyokasho', { category: 'handwriting' }],
    ['YuKyokasho Yoko', { category: 'handwriting' }],
    ['YuMincho +36p Kana', { category: 'serif' }],
    ['American Typewriter', { category: 'serif' }],
    ['Andale Mono', { category: 'monospace' }],
    ['Apple Chancery', { category: 'handwriting' }],
    ['Apple SD Gothic Neo', { category: 'sans-serif' }],
    ['Apple Symbols', { category: 'display' }],
    ['AppleGothic', { category: 'sans-serif' }],
    ['AppleMyungjo', { category: 'serif' }],
    ['Arial Unicode MS', { category: 'sans-serif' }],
    ['Athelas', { category: 'serif' }],
    ['Avenir', { category: 'sans-serif' }],
    ['Avenir Next', { category: 'sans-serif' }],
    ['Avenir Next Condensed', { category: 'sans-serif' }],
    ['Ayuthaya', { category: 'sans-serif' }],
    ['Bangla MN', { category: 'serif' }],
    ['Bangla Sangam MN', { category: 'sans-serif' }],
    ['Bauhaus 93', { category: 'display' }],
    ['Bodoni 72', { category: 'serif' }],
    ['Bodoni 72 Oldstyle', { category: 'serif' }],
    ['Bodoni 72 Smallcaps', { category: 'serif' }],
    ['Bodoni Ornaments', { category: 'display' }],
    ['Bookshelf Symbol 7', { category: 'display' }],
    ['Bradley Hand', { category: 'handwriting' }],
    ['Chalkboard', { category: 'handwriting' }],
    ['Chalkboard SE', { category: 'handwriting' }],
    ['Chalkduster', { category: 'handwriting' }],
    ['Charter', { category: 'serif' }],
    ['Cochin', { category: 'serif' }],
    ['Copperplate', { category: 'serif' }],
    ['Devanagari Sangam MN', { category: 'sans-serif' }],
    ['Din Alternate', { category: 'sans-serif' }],
    ['Euphemia UCAS', { category: 'sans-serif' }],
    ['Galvji', { category: 'sans-serif' }],
    ['Geneva', { category: 'sans-serif' }],
    ['Gill Sans', { category: 'sans-serif' }],
    ['Gujarati Sangam MN', { category: 'sans-serif' }],
    ['GungSeo', { category: 'handwriting' }],
    ['Gurmukhi MN', { category: 'serif' }],
    ['Gurmukhi Sangam MN', { category: 'sans-serif' }],
    ['HeadLineA', { category: 'display' }],
    ['Herculanum', { category: 'display' }],
    ['Hiragino Kaku Gothic Pro', { category: 'sans-serif' }],
    ['Hiragino Kaku Gothic ProN', { category: 'sans-serif' }],
    ['Hiragino Kaku Gothic Std', { category: 'sans-serif' }],
    ['Hiragino Kaku Gothic StdN', { category: 'sans-serif' }],
    ['Hoefler Text', { category: 'serif' }],
    ['Impact', { category: 'sans-serif' }],
    ['InaiMathi', { category: 'sans-serif' }],
    ['Iowan Old Style', { category: 'serif' }],
    ['Kannada MN', { category: 'serif' }],
    ['Kannada Sangam MN', { category: 'sans-serif' }],
    ['Kefa', { category: 'serif' }],
    ['Khmer MN', { category: 'serif' }],
    ['Khmer Sangam MN', { category: 'sans-serif' }],
    ['Kohinoor Bangla', { category: 'sans-serif' }],
    ['Kohinoor Devanagari', { category: 'sans-serif' }],
    ['Kohinoor Telugu', { category: 'sans-serif' }],
    ['Krungthep', { category: 'sans-serif' }],
    ['Lao MN', { category: 'serif' }],
    ['Lao Sangam MN', { category: 'sans-serif' }],
    ['Lucida Grande', { category: 'sans-serif' }],
    ['Luminari', { category: 'display' }],
    ['Malayalam MN', { category: 'serif' }],
    ['Malayalam Sangam MN', { category: 'sans-serif' }],
    ['Marion', { category: 'serif' }],
    ['Marker Felt', { category: 'handwriting' }],
    ['Menlo', { category: 'monospace' }],
    ['Microsoft Sans Serif', { category: 'sans-serif' }],
    ['Modern No. 20', { category: 'serif' }],
    ['Monaco', { category: 'monospace' }],
    ['Mukta Mahee', { category: 'sans-serif' }],
    ['Nanum Brush Script', { category: 'handwriting' }],
    ['Nanum Gothic', { category: 'sans-serif' }],
    ['Nanum Myeongjo', { category: 'serif' }],
    ['Nanum Pen Script', { category: 'handwriting' }],
    ['Noteworthy', { category: 'handwriting' }],
    ['Oriya MN', { category: 'serif' }],
    ['Oriya Sangam MN', { category: 'sans-serif' }],
    ['Palatino', { category: 'serif' }],
    ['Papyrus', { category: 'display' }],
    ['PCMyungjo', { category: 'monospace' }],
    ['Phosphate', { category: 'display' }],
    ['PilGi', { category: 'handwriting' }],
    ['Plantagenet Cherokee', { category: 'serif' }],
    ['PT Mono', { category: 'monospace' }],
    ['PT Sans', { category: 'sans-serif' }],
    ['PT Sans Caption', { category: 'sans-serif' }],
    ['PT Serif', { category: 'serif' }],
    ['PT Serif Caption', { category: 'serif' }],
    ['Rockwell', { category: 'serif' }],
    ['Sathu', { category: 'sans-serif' }],
    ['Savoye LET', { category: 'handwriting' }],
    ['Seravek', { category: 'sans-serif' }],
    ['Shree Devanagari 714', { category: 'sans-serif' }],
    ['SignPainter', { category: 'handwriting' }],
    ['Silom', { category: 'display' }],
    ['Sinhala MN', { category: 'serif' }],
    ['Sinhala Sangam MN', { category: 'sans-serif' }],
    ['Skia', { category: 'sans-serif' }],
    ['Snell Roundhand', { category: 'handwriting' }],
    ['STIXGeneral', { category: 'serif' }],
    ['Sukhumvit Set', { category: 'sans-serif' }],
    ['Superclarendon', { category: 'serif' }],
    ['Tamil MN', { category: 'serif' }],
    ['Tamil Sangam MN', { category: 'sans-serif' }],
    ['Telugu MN', { category: 'serif' }],
    ['Telugu Sangam MN', { category: 'sans-serif' }],
    ['Trattatello', { category: 'handwriting' }],
    ['Trebuchet MS', { category: 'sans-serif' }],
    ['Webdings', { category: 'display' }],
    ['Wingdings', { category: 'display' }],
    ['Wingdings 2', { category: 'display' }],
    ['Wingdings 3', { category: 'display' }],
    ['YuGothic', { category: 'sans-serif' }],
    ['YuGothic Light', { category: 'sans-serif' }],
    ['YuGothic Medium', { category: 'sans-serif' }],
    ['Zapfino', { category: 'handwriting' }],
] as const satisfies ReadonlyArray<readonly [string, Omit<IFontConfig, 'value' | 'label'>]>;

const DEFAULT_FONT_LIST: IFontConfig[] = DEFAULT_FONTS.map(([value, config]) => ({ value, label: value, ...config }));

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
