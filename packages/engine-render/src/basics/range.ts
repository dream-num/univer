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

import type { ITextRangeParam } from '@univerjs/core';

export interface ITextSelectionStyle {
    strokeWidth: number;
    stroke: string;
    strokeActive: string;
    fill: string;
}

export const NORMAL_TEXT_SELECTION_PLUGIN_STYLE: ITextSelectionStyle = {
    strokeWidth: 1.5,
    stroke: 'rgba(0, 0, 0, 0)',
    strokeActive: 'rgba(0, 0, 0, 1)',
    fill: 'rgba(0, 0, 0, 0.2)',
};

export interface ITextRangeWithStyle extends ITextRangeParam {
    style?: ITextSelectionStyle;
}

// Only use in add/replaceTextRanges methods.
export interface ISuccinctTextRangeParam {
    startOffset: number;
    endOffset: number;
    segmentId?: string; // Header of footer id.
    segmentPage?: number; // Optional, because header and footer are in different pages, so need pageIndex to allocate selection in header or footer.
    style?: ITextSelectionStyle;
}

export enum RANGE_DIRECTION {
    NONE = 'none',
    BACKWARD = 'backward',
    FORWARD = 'forward',
}
