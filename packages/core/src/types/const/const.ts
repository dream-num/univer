/**
 * Copyright 2023-present DreamNum Inc.
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

import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY } from '../../common/const';
import {
    BooleanNumber,
    HorizontalAlign,
    TextDirection,
    VerticalAlign,
    WrapStrategy,
} from '../enum';

/**
 * Used as an illegal range array return value
 */
export const DEFAULT_RANGE_ARRAY = {
    sheetId: '',
    range: {
        startRow: -1,
        endRow: -1,
        startColumn: -1,
        endColumn: -1,
    },
};

/**
 * Used as an illegal range return value
 */
export const DEFAULT_RANGE = {
    startRow: -1,
    startColumn: -1,
    endRow: -1,
    endColumn: -1,
};

/**
 * Used as an init selection return value
 */
export const DEFAULT_SELECTION = {
    startRow: 0,
    startColumn: 0,
    endRow: 0,
    endColumn: 0,
};
/**
 * Used as an init cell return value
 */
export const DEFAULT_CELL = {
    row: 0,
    column: 0,
};

/**
 * Default styles.
 */
export const DEFAULT_STYLES = {
    /**
     * fontFamily
     */
    ff: 'Arial',
    /**
     * fontSize
     */
    fs: 11,
    /**
     * italic
     * 0: false
     * 1: true
     */
    it: BooleanNumber.FALSE,
    /**
     * bold
     * 0: false
     * 1: true
     */
    bl: BooleanNumber.FALSE,
    /**
     * underline
     */
    ul: {
        s: BooleanNumber.FALSE,
    },
    /**
     * strikethrough
     */
    st: {
        s: BooleanNumber.FALSE,
    },
    /**
     * overline
     */
    ol: {
        s: BooleanNumber.FALSE,
    },
    /**
     * textRotation
     */
    tr: {
        a: 0,
        /**
         * true : 1
         * false : 0
         */
        v: BooleanNumber.FALSE,
    },
    /**
     * textDirection
     */
    td: TextDirection.UNSPECIFIED,
    /**
     * color
     */
    cl: {
        rgb: '#000',
    },
    /**
     * background
     */
    bg: {
        rgb: '#fff',
    },
    /**
     * horizontalAlignment
     */
    ht: HorizontalAlign.UNSPECIFIED,
    /**
     * verticalAlignment
     */
    vt: VerticalAlign.UNSPECIFIED,
    /**
     * wrapStrategy
     */
    tb: WrapStrategy.UNSPECIFIED,
    /**
     * padding
     */
    pd: {
        t: 0,
        r: 0,
        b: 0,
        l: 0,
    },
    n: null,
    /**
     * border
     */
    bd: {
        b: null,
        l: null,
        r: null,
        t: null,
    },
};

export const DEFAULT_SLIDE = {
    id: 'default_slide',
    title: 'defaultSlide',
    pageSize: {
        width: 300,
        height: 300,
    },
};

export const SHEET_EDITOR_UNITS = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];
