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

export enum FontCategory {
    SANS_SERIF = 'sans-serif',
    SERIF = 'serif',
    MONOSPACE = 'monospace',
    DISPLAY = 'display',
    HANDWRITING = 'handwriting',
}

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
    category?: FontCategory;
}

const DEFAULT_FONTS = [
    ['宋体', { category: FontCategory.SERIF }],
    ['Arial', { category: FontCategory.SANS_SERIF }],
    ['Baskerville', { category: FontCategory.SERIF }],
    ['Comic Sans MS', { category: FontCategory.HANDWRITING }],
    ['Courier New', { category: FontCategory.MONOSPACE }],
    ['Helvetica', { category: FontCategory.SANS_SERIF }],
    ['Times New Roman', { category: FontCategory.SERIF }],
    ['Verdana', { category: FontCategory.SANS_SERIF }],
    ['Apple LiGothic', { category: FontCategory.SANS_SERIF }],
    ['Apple LiSung', { category: FontCategory.SERIF }],
    ['Hei', { category: FontCategory.SANS_SERIF }],
    ['Kai', { category: FontCategory.HANDWRITING }],
    ['LiHei Pro', { category: FontCategory.SANS_SERIF }],
    ['LiSong Pro', { category: FontCategory.SERIF }],
    ['STFangsong', { category: FontCategory.SERIF }],
    ['STHeiti', { category: FontCategory.SANS_SERIF }],
    ['STKaiti', { category: FontCategory.HANDWRITING }],
    ['STSong', { category: FontCategory.SERIF }],
    ['报隶-繁', { category: FontCategory.HANDWRITING }],
    ['报隶-简', { category: FontCategory.HANDWRITING }],
    ['冬青黑体简体中文', { category: FontCategory.SANS_SERIF }],
    ['黑体-繁', { category: FontCategory.SANS_SERIF }],
    ['黑体-简', { category: FontCategory.SANS_SERIF }],
    ['华文仿宋', { category: FontCategory.SERIF }],
    ['华文楷体', { category: FontCategory.HANDWRITING }],
    ['华文宋体', { category: FontCategory.SERIF }],
    ['楷体-繁', { category: FontCategory.HANDWRITING }],
    ['楷体-简', { category: FontCategory.HANDWRITING }],
    ['兰亭黑-繁', { category: FontCategory.SANS_SERIF }],
    ['兰亭黑-简', { category: FontCategory.SANS_SERIF }],
    ['隶变-繁', { category: FontCategory.HANDWRITING }],
    ['隶变-简', { category: FontCategory.HANDWRITING }],
    ['凌慧体-繁', { category: FontCategory.HANDWRITING }],
    ['凌慧体-简', { category: FontCategory.HANDWRITING }],
    ['翩翩体-繁', { category: FontCategory.HANDWRITING }],
    ['翩翩体-简', { category: FontCategory.HANDWRITING }],
    ['苹方-繁', { category: FontCategory.SANS_SERIF }],
    ['苹方-港', { category: FontCategory.SANS_SERIF }],
    ['苹方-简', { category: FontCategory.SANS_SERIF }],
    ['手札体-繁', { category: FontCategory.HANDWRITING }],
    ['手札体-简', { category: FontCategory.HANDWRITING }],
    ['宋体-繁', { category: FontCategory.SERIF }],
    ['宋体-简', { category: FontCategory.SERIF }],
    ['娃娃体-繁', { category: FontCategory.HANDWRITING }],
    ['娃娃体-简', { category: FontCategory.HANDWRITING }],
    ['魏碑-繁', { category: FontCategory.HANDWRITING }],
    ['魏碑-简', { category: FontCategory.HANDWRITING }],
    ['行楷-繁', { category: FontCategory.HANDWRITING }],
    ['行楷-简', { category: FontCategory.HANDWRITING }],
    ['雅痞-繁', { category: FontCategory.DISPLAY }],
    ['雅痞-简', { category: FontCategory.DISPLAY }],
    ['圆体-繁', { category: FontCategory.SANS_SERIF }],
    ['圆体-简', { category: FontCategory.SANS_SERIF }],
    ['Arial Black', { category: FontCategory.SANS_SERIF }],
    ['Big Caslon', { category: FontCategory.SERIF }],
    ['Courier', { category: FontCategory.MONOSPACE }],
    ['Didot', { category: FontCategory.SERIF }],
    ['Futura', { category: FontCategory.SANS_SERIF }],
    ['Georgia', { category: FontCategory.SERIF }],
    ['Helvetica Neue', { category: FontCategory.SANS_SERIF }],
    ['Optima', { category: FontCategory.SANS_SERIF }],
    ['Times', { category: FontCategory.SERIF }],
    ['Tahoma', { category: FontCategory.SANS_SERIF }],
    ['BIZ UDGothic', { category: FontCategory.MONOSPACE }],
    ['BIZ UDMincho', { category: FontCategory.MONOSPACE }],
    ['Hiragino Maru Gothic Pro', { category: FontCategory.SANS_SERIF }],
    ['Hiragino Maru Gothic ProN', { category: FontCategory.SANS_SERIF }],
    ['Hiragino Mincho Pro', { category: FontCategory.SERIF }],
    ['Hiragino Mincho ProN', { category: FontCategory.SERIF }],
    ['Hiragino Sans', { category: FontCategory.SANS_SERIF }],
    ['Klee', { category: FontCategory.HANDWRITING }],
    ['Osaka', { category: FontCategory.SANS_SERIF }],
    ['Toppan Bunkyu Gothic', { category: FontCategory.SANS_SERIF }],
    ['Toppan Bunkyu Midashi Gothic', { category: FontCategory.SANS_SERIF }],
    ['Toppan Bunkyu Midashi Mincho', { category: FontCategory.SERIF }],
    ['Toppan Bunkyu Mincho', { category: FontCategory.SERIF }],
    ['Tsukushi A Round Gothic', { category: FontCategory.SANS_SERIF }],
    ['Tsukushi B Round Gothic', { category: FontCategory.SANS_SERIF }],
    ['YuKyokasho', { category: FontCategory.HANDWRITING }],
    ['YuKyokasho Yoko', { category: FontCategory.HANDWRITING }],
    ['YuMincho +36p Kana', { category: FontCategory.SERIF }],
    ['American Typewriter', { category: FontCategory.SERIF }],
    ['Andale Mono', { category: FontCategory.MONOSPACE }],
    ['Apple Chancery', { category: FontCategory.HANDWRITING }],
    ['Apple SD Gothic Neo', { category: FontCategory.SANS_SERIF }],
    ['Apple Symbols', { category: FontCategory.DISPLAY }],
    ['AppleGothic', { category: FontCategory.SANS_SERIF }],
    ['AppleMyungjo', { category: FontCategory.SERIF }],
    ['Arial Unicode MS', { category: FontCategory.SANS_SERIF }],
    ['Athelas', { category: FontCategory.SERIF }],
    ['Avenir', { category: FontCategory.SANS_SERIF }],
    ['Avenir Next', { category: FontCategory.SANS_SERIF }],
    ['Avenir Next Condensed', { category: FontCategory.SANS_SERIF }],
    ['Ayuthaya', { category: FontCategory.SANS_SERIF }],
    ['Bangla MN', { category: FontCategory.SERIF }],
    ['Bangla Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Bauhaus 93', { category: FontCategory.DISPLAY }],
    ['Bodoni 72', { category: FontCategory.SERIF }],
    ['Bodoni 72 Oldstyle', { category: FontCategory.SERIF }],
    ['Bodoni 72 Smallcaps', { category: FontCategory.SERIF }],
    ['Bodoni Ornaments', { category: FontCategory.DISPLAY }],
    ['Bookshelf Symbol 7', { category: FontCategory.DISPLAY }],
    ['Bradley Hand', { category: FontCategory.HANDWRITING }],
    ['Chalkboard', { category: FontCategory.HANDWRITING }],
    ['Chalkboard SE', { category: FontCategory.HANDWRITING }],
    ['Chalkduster', { category: FontCategory.HANDWRITING }],
    ['Charter', { category: FontCategory.SERIF }],
    ['Cochin', { category: FontCategory.SERIF }],
    ['Copperplate', { category: FontCategory.SERIF }],
    ['Devanagari Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Din Alternate', { category: FontCategory.SANS_SERIF }],
    ['Euphemia UCAS', { category: FontCategory.SANS_SERIF }],
    ['Galvji', { category: FontCategory.SANS_SERIF }],
    ['Geneva', { category: FontCategory.SANS_SERIF }],
    ['Gill Sans', { category: FontCategory.SANS_SERIF }],
    ['Gujarati Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['GungSeo', { category: FontCategory.HANDWRITING }],
    ['Gurmukhi MN', { category: FontCategory.SERIF }],
    ['Gurmukhi Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['HeadLineA', { category: FontCategory.DISPLAY }],
    ['Herculanum', { category: FontCategory.DISPLAY }],
    ['Hiragino Kaku Gothic Pro', { category: FontCategory.SANS_SERIF }],
    ['Hiragino Kaku Gothic ProN', { category: FontCategory.SANS_SERIF }],
    ['Hiragino Kaku Gothic Std', { category: FontCategory.SANS_SERIF }],
    ['Hiragino Kaku Gothic StdN', { category: FontCategory.SANS_SERIF }],
    ['Hoefler Text', { category: FontCategory.SERIF }],
    ['Impact', { category: FontCategory.SANS_SERIF }],
    ['InaiMathi', { category: FontCategory.SANS_SERIF }],
    ['Iowan Old Style', { category: FontCategory.SERIF }],
    ['Kannada MN', { category: FontCategory.SERIF }],
    ['Kannada Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Kefa', { category: FontCategory.SERIF }],
    ['Khmer MN', { category: FontCategory.SERIF }],
    ['Khmer Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Kohinoor Bangla', { category: FontCategory.SANS_SERIF }],
    ['Kohinoor Devanagari', { category: FontCategory.SANS_SERIF }],
    ['Kohinoor Telugu', { category: FontCategory.SANS_SERIF }],
    ['Krungthep', { category: FontCategory.SANS_SERIF }],
    ['Lao MN', { category: FontCategory.SERIF }],
    ['Lao Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Lucida Grande', { category: FontCategory.SANS_SERIF }],
    ['Luminari', { category: FontCategory.DISPLAY }],
    ['Malayalam MN', { category: FontCategory.SERIF }],
    ['Malayalam Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Marion', { category: FontCategory.SERIF }],
    ['Marker Felt', { category: FontCategory.HANDWRITING }],
    ['Menlo', { category: FontCategory.MONOSPACE }],
    ['Microsoft Sans Serif', { category: FontCategory.SANS_SERIF }],
    ['Modern No. 20', { category: FontCategory.SERIF }],
    ['Monaco', { category: FontCategory.MONOSPACE }],
    ['Mukta Mahee', { category: FontCategory.SANS_SERIF }],
    ['Nanum Brush Script', { category: FontCategory.HANDWRITING }],
    ['Nanum Gothic', { category: FontCategory.SANS_SERIF }],
    ['Nanum Myeongjo', { category: FontCategory.SERIF }],
    ['Nanum Pen Script', { category: FontCategory.HANDWRITING }],
    ['Noteworthy', { category: FontCategory.HANDWRITING }],
    ['Oriya MN', { category: FontCategory.SERIF }],
    ['Oriya Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Palatino', { category: FontCategory.SERIF }],
    ['Papyrus', { category: FontCategory.DISPLAY }],
    ['PCMyungjo', { category: FontCategory.MONOSPACE }],
    ['Phosphate', { category: FontCategory.DISPLAY }],
    ['PilGi', { category: FontCategory.HANDWRITING }],
    ['Plantagenet Cherokee', { category: FontCategory.SERIF }],
    ['PT Mono', { category: FontCategory.MONOSPACE }],
    ['PT Sans', { category: FontCategory.SANS_SERIF }],
    ['PT Sans Caption', { category: FontCategory.SANS_SERIF }],
    ['PT Serif', { category: FontCategory.SERIF }],
    ['PT Serif Caption', { category: FontCategory.SERIF }],
    ['Rockwell', { category: FontCategory.SERIF }],
    ['Sathu', { category: FontCategory.SANS_SERIF }],
    ['Savoye LET', { category: FontCategory.HANDWRITING }],
    ['Seravek', { category: FontCategory.SANS_SERIF }],
    ['Shree Devanagari 714', { category: FontCategory.SANS_SERIF }],
    ['SignPainter', { category: FontCategory.HANDWRITING }],
    ['Silom', { category: FontCategory.DISPLAY }],
    ['Sinhala MN', { category: FontCategory.SERIF }],
    ['Sinhala Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Skia', { category: FontCategory.SANS_SERIF }],
    ['Snell Roundhand', { category: FontCategory.HANDWRITING }],
    ['STIXGeneral', { category: FontCategory.SERIF }],
    ['Sukhumvit Set', { category: FontCategory.SANS_SERIF }],
    ['Superclarendon', { category: FontCategory.SERIF }],
    ['Tamil MN', { category: FontCategory.SERIF }],
    ['Tamil Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Telugu MN', { category: FontCategory.SERIF }],
    ['Telugu Sangam MN', { category: FontCategory.SANS_SERIF }],
    ['Trattatello', { category: FontCategory.HANDWRITING }],
    ['Trebuchet MS', { category: FontCategory.SANS_SERIF }],
    ['Webdings', { category: FontCategory.DISPLAY }],
    ['Wingdings', { category: FontCategory.DISPLAY }],
    ['Wingdings 2', { category: FontCategory.DISPLAY }],
    ['Wingdings 3', { category: FontCategory.DISPLAY }],
    ['YuGothic', { category: FontCategory.SANS_SERIF }],
    ['YuGothic Light', { category: FontCategory.SANS_SERIF }],
    ['YuGothic Medium', { category: FontCategory.SANS_SERIF }],
    ['Zapfino', { category: FontCategory.HANDWRITING }],
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
