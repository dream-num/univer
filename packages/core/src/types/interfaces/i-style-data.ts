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
 * RGB color or theme color
 */
export interface IColorStyle {
    // rgb?: Nullable<IColor | string>;
    rgb?: Nullable<string>;
    th?: ThemeColorType;
}

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
 * Top,right,bottom,left padding
 */
export interface IPaddingData {
    t?: number;
    r?: number;
    b?: number;
    l?: number;
}

/**
 * Basics properties of cell style
 */
export interface IStyleBase {
    /**
     * fontFamily
     */
    ff?: Nullable<string>;
    /**
     * fontSize
     *
     * pt
     */
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
    /**
     * textRotation
     */
    tr?: Nullable<ITextRotation>;
    /**
     * textDirection
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
