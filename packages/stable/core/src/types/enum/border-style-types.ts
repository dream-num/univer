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
 * Border style types enum
 */
export enum BorderStyleTypes {
    NONE,
    THIN,
    HAIR,
    DOTTED,
    DASHED,
    DASH_DOT,
    DASH_DOT_DOT,
    DOUBLE,
    MEDIUM,
    MEDIUM_DASHED,
    MEDIUM_DASH_DOT,
    MEDIUM_DASH_DOT_DOT,
    SLANT_DASH_DOT,
    THICK,
}

export enum BorderType {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
    NONE = 'none',
    ALL = 'all',
    OUTSIDE = 'outside',
    INSIDE = 'inside',
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',

    TLBR = 'tlbr',
    TLBC_TLMR = 'tlbc_tlmr',
    TLBR_TLBC_TLMR = 'tlbr_tlbc_tlmr',
    BLTR = 'bl_tr',
    MLTR_BCTR = 'mltr_bctr',
}
