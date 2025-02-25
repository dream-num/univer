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

import type { DOC_RANGE_TYPE, Nullable, RANGE_DIRECTION } from '@univerjs/core';
import type { INodePosition, ITextSelectionStyle } from '@univerjs/engine-render';

export interface IDocRange {
    // RECT OR TEXT.
    rangeType: DOC_RANGE_TYPE;

    anchorNodePosition?: Nullable<INodePosition>;
    focusNodePosition?: Nullable<INodePosition>;
    // The style of selection and cursor.
    style: ITextSelectionStyle;

    // The start of selection in the dataStream.
    get startOffset(): Nullable<number>;
    // The end of selection in the dataStream.
    get endOffset(): Nullable<number>;
    // Whether the selection is collapsed. rect range will never collapsed.
    get collapsed(): boolean;
    get startNodePosition(): Nullable<INodePosition>;
    get endNodePosition(): Nullable<INodePosition>;
    get direction(): RANGE_DIRECTION;
    // Get the segmentId of the range.
    get segmentId(): string;
    // Get the page number of the range when in header or footer.
    get segmentPage(): number;
    // Whether the range is active.
    isActive(): boolean;

    dispose(): void;
    // Refresh the selection shape.
    refresh(): void;
}
