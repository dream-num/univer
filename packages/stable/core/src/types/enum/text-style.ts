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

/**
 * An enum that specifies the text direction of a cell.
 */
export enum TextDirection {
    UNSPECIFIED,
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
}

// 17.18.99 ST_Underline (Underline Patterns)
/**
 * Types of text decoration
 */
export enum TextDecoration {
    DASH,
    DASH_DOT_DOT_HEAVY,
    DASH_DOT_HEAVY,
    DASHED_HEAVY,
    DASH_LONG,
    DASH_LONG_HEAVY,
    DOT_DASH,
    DOT_DOT_DASH,
    DOTTED,
    DOTTED_HEAVY,
    DOUBLE,
    NONE,
    SINGLE,
    THICK,
    WAVE,
    WAVY_DOUBLE,
    WAVY_HEAVY,
    WORDS,
}

/**
 * An enum that specifies the horizontal alignment of text.
 */
export enum HorizontalAlign {
    UNSPECIFIED, // The horizontal alignment is not specified. Do not use this.
    LEFT, // The text is explicitly aligned to the left of the cell.
    CENTER, // text is explicitly aligned to the center of the cell.
    RIGHT, // The text is explicitly aligned to the right of the cell.
    JUSTIFIED, // The paragraph is justified.
    BOTH, // The paragraph is justified.
    DISTRIBUTED, // The text is distributed across the width of the cell.
}

/**
 * An enum that specifies the vertical alignment of text.
 */
export enum VerticalAlign {
    UNSPECIFIED,
    TOP, // The text is explicitly aligned to the top of the cell.
    MIDDLE, // The text is explicitly aligned to the middle of the cell.
    BOTTOM, // The text is explicitly aligned to the bottom of the cell.
}

/**
 * An enumeration of the strategies used to handle cell text wrapping.
 */
export enum WrapStrategy {
    UNSPECIFIED,

    /**
     * Lines that are longer than the cell width will be written in the next cell over, so long as that cell is empty. If the next cell over is non-empty, this behaves the same as CLIP . The text will never wrap to the next line unless the user manually inserts a new line. Example:
     * | First sentence. |
     * | Manual newline that is very long. <- Text continues into next cell
     * | Next newline.   |
     */
    OVERFLOW,

    /**
     * Lines that are longer than the cell width will be clipped. The text will never wrap to the next line unless the user manually inserts a new line. Example:
     * | First sentence. |
     * | Manual newline t| <- Text is clipped
     * | Next newline.   |
     */
    CLIP,

    /**
     * Words that are longer than a line are wrapped at the character level rather than clipped. Example:
     * | Cell has a |
     * | loooooooooo| <- Word is broken.
     * | ong word.  |
     */
    WRAP,
}

/**
 * FontItalic
 */
export enum FontItalic {
    NORMAL,
    ITALIC,
}

/**
 * FontWeight
 */
export enum FontWeight {
    NORMAL,
    BOLD,
}

export enum BaselineOffset {
    NORMAL = 1,
    SUBSCRIPT,
    SUPERSCRIPT,
}

/**
 * General Boolean Enum
 */
export enum BooleanNumber {
    FALSE = 0,
    TRUE = 1,
}

/**
 * General Boolean Enum
 */
export enum CellValueType {
    STRING = 1,
    NUMBER,
    BOOLEAN,
    FORCE_STRING,
}
