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

import type { ISectionColumnProperties } from '@univerjs/core';
import type { IDocumentSkeletonColumn } from '../../../../basics/i-document-skeleton-cached';

import { ColumnSeparatorType } from '@univerjs/core';

export function createSkeletonColumn(
    columnIndex: number = 0,
    columnProperties: ISectionColumnProperties[],
    columnSeparatorType: ColumnSeparatorType = ColumnSeparatorType.NONE,
    pageWidth: number = Number.POSITIVE_INFINITY
): IDocumentSkeletonColumn {
    const { left, width, spaceWidth } = _calculateColumnSize(columnIndex, columnProperties, pageWidth);

    return {
        lines: [],
        // column坐标系相对于section
        left,
        width,
        height: 0,
        spaceWidth,
        separator: columnSeparatorType,
        st: 0,
        ed: 0,
        drawingLRIds: [],
        isFull: false,
    };
}

function _calculateColumnSize(
    columnIndex: number = 0,
    columnProperties: ISectionColumnProperties[],
    pageWidth: number
) {
    let colWidth = 0;
    let spaceWidth = 0;
    let left = 0;
    for (let i = 0; i <= columnIndex; i++) {
        const { width, paddingEnd } = columnProperties[i];
        if (i === columnProperties.length - 1) {
            colWidth = pageWidth === Number.POSITIVE_INFINITY ? pageWidth - colWidth : width;
            spaceWidth = 0;
        } else {
            spaceWidth = paddingEnd;
            colWidth = width;
            left += colWidth + spaceWidth;
        }
    }

    return {
        width: colWidth,
        spaceWidth,
        left: left - colWidth - spaceWidth,
    };
}
