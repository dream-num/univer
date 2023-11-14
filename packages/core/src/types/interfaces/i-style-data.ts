import { Nullable } from '../../shared/types';
import { BorderStyleTypes } from '../enum/border-style-types';
import {
    BaselineOffset,
    BooleanNumber,
    HorizontalAlign,
    TextDecoration,
    TextDirection,
    VerticalAlign,
    WrapStrategy,
} from '../enum/text-style';
import { ThemeColorType } from '../enum/theme-color-type';

/**
 * Properties of text decoration
 */
export interface ITextDecoration {
    s: BooleanNumber; // show
    cl?: IColorStyle; // color
    t?: TextDecoration; // lineType
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
 */
export interface IBorderData {
    t?: Nullable<IBorderStyleData>;
    r?: Nullable<IBorderStyleData>;
    b?: Nullable<IBorderStyleData>;
    l?: Nullable<IBorderStyleData>;
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
}

/**
 * Properties of cell style
 */
export interface IStyleData extends IStyleBase {
    /**
     * textRotation
     */
    tr?: Nullable<ITextRotation>;
    /** *
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
