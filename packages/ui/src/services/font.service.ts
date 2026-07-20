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
import type { IUniverUIConfig } from '../config/config';
import { createIdentifier, IConfigService } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
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
     * Font category for UI grouping (optional)
     */
    category?: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting';
}

const DEFAULT_FONT_NAMES = [
    '宋体',
    'Arial',
    'Baskerville',
    'Comic Sans MS',
    'Courier New',
    'Helvetica',
    'Times New Roman',
    'Verdana',
    'Apple LiGothic',
    'Apple LiSung',
    'Hei',
    'Kai',
    'LiHei Pro',
    'LiSong Pro',
    'STFangsong',
    'STHeiti',
    'STKaiti',
    'STSong',
    '报隶-繁',
    '报隶-简',
    '冬青黑体简体中文',
    '黑体-繁',
    '黑体-简',
    '华文仿宋',
    '华文楷体',
    '华文宋体',
    '楷体-繁',
    '楷体-简',
    '兰亭黑-繁',
    '兰亭黑-简',
    '隶变-繁',
    '隶变-简',
    '凌慧体-繁',
    '凌慧体-简',
    '翩翩体-繁',
    '翩翩体-简',
    '苹方-繁',
    '苹方-港',
    '苹方-简',
    '手札体-繁',
    '手札体-简',
    '宋体-繁',
    '宋体-简',
    '娃娃体-繁',
    '娃娃体-简',
    '魏碑-繁',
    '魏碑-简',
    '行楷-繁',
    '行楷-简',
    '雅痞-繁',
    '雅痞-简',
    '圆体-繁',
    '圆体-简',
    'Arial Black',
    'Big Caslon',
    'Courier',
    'Didot',
    'Futura',
    'Georgia',
    'Helvetica Neue',
    'Optima',
    'Times',
    'Tahoma',
    'BIZ UDGothic',
    'BIZ UDMincho',
    'Hiragino Maru Gothic Pro',
    'Hiragino Maru Gothic ProN',
    'Hiragino Mincho Pro',
    'Hiragino Mincho ProN',
    'Hiragino Sans',
    'Klee',
    'Osaka',
    'Toppan Bunkyu Gothic',
    'Toppan Bunkyu Midashi Gothic',
    'Toppan Bunkyu Midashi Mincho',
    'Toppan Bunkyu Mincho',
    'Tsukushi A Round Gothic',
    'Tsukushi B Round Gothic',
    'YuKyokasho',
    'YuKyokasho Yoko',
    'YuMincho +36p Kana',
    'American Typewriter',
    'Andale Mono',
    'Apple Chancery',
    'Apple SD Gothic Neo',
    'Apple Symbols',
    'AppleGothic',
    'AppleMyungjo',
    'Arial Unicode MS',
    'Athelas',
    'Avenir',
    'Avenir Next',
    'Avenir Next Condensed',
    'Ayuthaya',
    'Bangla MN',
    'Bangla Sangam MN',
    'Bauhaus 93',
    'Bodoni 72',
    'Bodoni 72 Oldstyle',
    'Bodoni 72 Smallcaps',
    'Bodoni Ornaments',
    'Bookshelf Symbol 7',
    'Bradley Hand',
    'Chalkboard',
    'Chalkboard SE',
    'Chalkduster',
    'Charter',
    'Cochin',
    'Copperplate',
    'Devanagari Sangam MN',
    'Din Alternate',
    'Euphemia UCAS',
    'Galvji',
    'Geneva',
    'Gill Sans',
    'Gujarati Sangam MN',
    'GungSeo',
    'Gurmukhi MN',
    'Gurmukhi Sangam MN',
    'HeadLineA',
    'Herculanum',
    'Hiragino Kaku Gothic Pro',
    'Hiragino Kaku Gothic ProN',
    'Hiragino Kaku Gothic Std',
    'Hiragino Kaku Gothic StdN',
    'Hoefler Text',
    'Impact',
    'InaiMathi',
    'Iowan Old Style',
    'Kannada MN',
    'Kannada Sangam MN',
    'Kefa',
    'Khmer MN',
    'Khmer Sangam MN',
    'Kohinoor Bangla',
    'Kohinoor Devanagari',
    'Kohinoor Telugu',
    'Krungthep',
    'Lao MN',
    'Lao Sangam MN',
    'Lucida Grande',
    'Luminari',
    'Malayalam MN',
    'Malayalam Sangam MN',
    'Marion',
    'Marker Felt',
    'Menlo',
    'Microsoft Sans Serif',
    'Modern No. 20',
    'Monaco',
    'Mukta Mahee',
    'Nanum Brush Script',
    'Nanum Gothic',
    'Nanum Myeongjo',
    'Nanum Pen Script',
    'Noteworthy',
    'Oriya MN',
    'Oriya Sangam MN',
    'Palatino',
    'Papyrus',
    'PCMyungjo',
    'Phosphate',
    'PilGi',
    'Plantagenet Cherokee',
    'PT Mono',
    'PT Sans',
    'PT Sans Caption',
    'PT Serif',
    'PT Serif Caption',
    'Rockwell',
    'Sathu',
    'Savoye LET',
    'Seravek',
    'Shree Devanagari 714',
    'SignPainter',
    'Silom',
    'Sinhala MN',
    'Sinhala Sangam MN',
    'Skia',
    'Snell Roundhand',
    'STIXGeneral',
    'Sukhumvit Set',
    'Superclarendon',
    'Tamil MN',
    'Tamil Sangam MN',
    'Telugu MN',
    'Telugu Sangam MN',
    'Trattatello',
    'Trebuchet MS',
    'Webdings',
    'Wingdings',
    'Wingdings 2',
    'Wingdings 3',
    'YuGothic',
    'YuGothic Light',
    'YuGothic Medium',
    'Zapfino',
] as const;

const DEFAULT_FONT_LIST: IFontConfig[] = DEFAULT_FONT_NAMES.map((value) => ({ value, label: value }));

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
