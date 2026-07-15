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

import type { Nullable } from '../../shared/types';
import type { BorderStyleTypes } from '../enum/border-style-types';
import type {
    BaselineOffset,
    BooleanNumber,
    HorizontalAlign,
    TextDecoration,
    TextDirection,
    VerticalAlign,
    WrapStrategy,
} from '../enum/text-style';
import type { ThemeColorType } from '../enum/theme-color-type';

type ExactKeys<T extends object, K extends readonly (keyof T)[]> =
    Exclude<keyof T, K[number]> extends never
        ? Exclude<K[number], keyof T> extends never
            ? K
            : never
        : never;

function defineExactKeys<T extends object>() {
    return <const K extends readonly (keyof T)[]>(keys: ExactKeys<T, K>) => keys;
}

/**
 * Properties of text decoration
 */
export interface ITextDecoration {
    /**
     * show
     */
    s: BooleanNumber;
    /**
     * color is follow the font color. the default value is TRUE, it's also TRUE if it is undefined. the cl has no effect when `c` is TRUE.
     */
    c?: BooleanNumber;
    /**
     * color
     */
    cl?: IColorStyle;
    /**
     * lineType
     */
    t?: TextDecoration;
}

/**
 * Exact keys of {@link ITextDecoration}.
 */
export const TEXT_DECORATION_KEYS = defineExactKeys<ITextDecoration>()(['s', 'c', 'cl', 't'] as const);

/**
 * Key union of {@link ITextDecoration}.
 */
export type TextDecorationKey = (typeof TEXT_DECORATION_KEYS)[number];

/**
 * RGB color or theme color
 */
export interface IColorStyle {
    /**
     * RGB color string, such as `#RRGGBB` or `rgb(r, g, b)`.
     */
    rgb?: Nullable<string>;

    /**
     * Theme color token.
     */
    th?: ThemeColorType;
}

/**
 * Exact keys of {@link IColorStyle}.
 */
export const COLOR_STYLE_KEYS = defineExactKeys<IColorStyle>()(['rgb', 'th'] as const);

/**
 * Key union of {@link IColorStyle}.
 */
export type ColorStyleKey = (typeof COLOR_STYLE_KEYS)[number];

/**
 * Format of RBGA color
 */
export interface IColor {
    r: number; // Red
    g: number; // Green
    b: number; // Blue
    a?: number; // Alpha
}

/**
 * Style properties of border
 */
export interface IBorderStyleData {
    s: BorderStyleTypes;
    cl: IColorStyle;
}

/**
 * Exact keys of {@link IBorderStyleData}.
 */
export const BORDER_STYLE_KEYS = defineExactKeys<IBorderStyleData>()(['s', 'cl'] as const);

/**
 * Key union of {@link IBorderStyleData}.
 */
export type BorderStyleKey = (typeof BORDER_STYLE_KEYS)[number];

/**
 * Style properties of top, bottom, left and right border
 *
 * TLBR = 'tlbr', //START_TOP_LEFT_END_BOTTOM_RIGHT
 * TLBC = 'tlbc', // START_TOP_LEFT_END_BOTTOM_CENTER

 * TLMR = 'tlmr', // START_TOP_LEFT_END_MIDDLE_RIGHT

 * BLTR = 'bltr', // START_BOTTOM_LEFT_END_TOP_RIGHT

 * MLTR = 'mltr', // START_MIDDLE_LEFT_END_TOP_RIGHT

 * BCTR = 'bctr', // START_BOTTOM_CENTER_END_TOP_RIGHT
 */
export interface IBorderData {
    t?: Nullable<IBorderStyleData>;
    r?: Nullable<IBorderStyleData>;
    b?: Nullable<IBorderStyleData>;
    l?: Nullable<IBorderStyleData>;

    tl_br?: Nullable<IBorderStyleData>;
    tl_bc?: Nullable<IBorderStyleData>;
    tl_mr?: Nullable<IBorderStyleData>;

    bl_tr?: Nullable<IBorderStyleData>;
    ml_tr?: Nullable<IBorderStyleData>;
    bc_tr?: Nullable<IBorderStyleData>;
}

/**
 * Exact keys of {@link IBorderData}.
 */
export const BORDER_KEYS = defineExactKeys<IBorderData>()(['t', 'r', 'b', 'l', 'tl_br', 'tl_bc', 'tl_mr', 'bl_tr', 'ml_tr', 'bc_tr'] as const);

/**
 * Key union of {@link IBorderData}.
 */
export type BorderKey = (typeof BORDER_KEYS)[number];

export interface ITextRotation {
    /**
     * angle
     */
    a: number;
    /**
     * vertical
     * true : 1
     * false : 0
     */
    v?: BooleanNumber;
}

/**
 * Exact keys of {@link ITextRotation}.
 */
export const TEXT_ROTATION_KEYS = defineExactKeys<ITextRotation>()(['a', 'v'] as const);

/**
 * Key union of {@link ITextRotation}.
 */
export type TextRotationKey = (typeof TEXT_ROTATION_KEYS)[number];

/**
 * Top,right,bottom,left padding
 */
export interface IPaddingData {
    t?: number;
    r?: number;
    b?: number;
    l?: number;
}

/**
 * Exact keys of {@link IPaddingData}.
 */
export const PADDING_KEYS = defineExactKeys<IPaddingData>()(['t', 'r', 'b', 'l'] as const);

/**
 * Key union of {@link IPaddingData}.
 */
export type PaddingKey = (typeof PADDING_KEYS)[number];

/**
 * Basics properties of cell style
 */
export interface IStyleBase {
    /**
     * fontFamily
     */
    ff?: Nullable<string>;
    /** Font size in points (pt), where 1 pt is 1/72 inch. */
    fs?: number;
    /**
     * italic
     * 0: false
     * 1: true
     */
    it?: BooleanNumber;
    /**
     * bold
     * 0: false
     * 1: true
     */
    bl?: BooleanNumber;

    /**
     * underline
     */
    ul?: ITextDecoration;

    /**
     * bottomBorerLine
     */
    bbl?: ITextDecoration;
    /**
     * strikethrough
     */
    st?: ITextDecoration;
    /**
     * overline
     */
    ol?: ITextDecoration;

    /**
     * background
     */
    bg?: Nullable<IColorStyle>;

    /**
     * border
     */
    bd?: Nullable<IBorderData>;

    /**
     * foreground
     */
    cl?: Nullable<IColorStyle>;

    /**
     * (Subscript 下标 /Superscript上标 Text)
     */
    va?: Nullable<BaselineOffset>;

    /**
     * Numfmt pattern
     */
    n?: Nullable<{ pattern: string }>;
}

/**
 * Properties of cell style
 */
export interface IStyleData extends IStyleBase {
    /** Whether the font size should shrink to fit the cell width. */
    stf?: BooleanNumber;
    /**
     * textRotation
     */
    tr?: Nullable<ITextRotation>;
    /**
     * textDirection @TODO
     * @description The `td` property has not been fully implemented yet.
     */
    td?: Nullable<TextDirection>;
    /**
     * horizontalAlignment
     */
    ht?: Nullable<HorizontalAlign>;
    /**
     * verticalAlignment
     */
    vt?: Nullable<VerticalAlign>;
    /**
     * wrapStrategy
     */
    tb?: Nullable<WrapStrategy>;
    /**
     * padding
     */
    pd?: Nullable<IPaddingData>;
}

/**
 * Exact keys of {@link IStyleData}.
 */
export const STYLE_KEYS = defineExactKeys<IStyleData>()([
    'ff',
    'fs',
    'it',
    'bl',
    'ul',
    'bbl',
    'st',
    'ol',
    'bg',
    'bd',
    'cl',
    'va',
    'n',
    'stf',
    'tr',
    'td',
    'ht',
    'vt',
    'tb',
    'pd',
] as const);

/**
 * Key union of {@link IStyleData}.
 */
export type StyleKey = (typeof STYLE_KEYS)[number];
