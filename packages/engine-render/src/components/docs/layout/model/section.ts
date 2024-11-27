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

import type { INumberUnit, ISectionColumnProperties } from '@univerjs/core';
import type { IDocumentSkeletonColumn, IDocumentSkeletonSection } from '../../../../basics/i-document-skeleton-cached';
import { BooleanNumber, ColumnSeparatorType } from '@univerjs/core';

export function createSkeletonSection(
    equalWidth: BooleanNumber = BooleanNumber.TRUE,
    numOfEqualWidthColumns: number = 1,
    spaceBetweenEqualWidthColumns: INumberUnit = { v: 10 },
    columnProperties: ISectionColumnProperties[] = [],
    columnSeparatorType: ColumnSeparatorType = ColumnSeparatorType.NONE,
    top: number = 0,
    left: number = 0,
    sectionWidth: number = Number.POSITIVE_INFINITY,
    sectionHeight: number = Number.POSITIVE_INFINITY
): IDocumentSkeletonSection {
    const columns: IDocumentSkeletonColumn[] = [];
    let colWidth = 0;
    let spaceWidth = 0;
    let leftOffset = left;

    if (equalWidth === BooleanNumber.TRUE) {
        colWidth = sectionWidth / numOfEqualWidthColumns;

        for (let i = 0; i < numOfEqualWidthColumns; i++) {
            spaceWidth = i === numOfEqualWidthColumns - 1 ? 0 : spaceBetweenEqualWidthColumns.v;
            columns.push(_getSkeletonColumn(leftOffset, colWidth, spaceWidth, columnSeparatorType));
            leftOffset += colWidth + spaceWidth;
        }
    } else {
        if (columnProperties.length <= 1) {
            columns.push(_getSkeletonColumn(leftOffset, sectionWidth, 0, ColumnSeparatorType.NONE));
        } else {
            for (let i = 0; i < columnProperties.length; i++) {
                const { width, paddingEnd } = columnProperties[i];

                spaceWidth = paddingEnd;
                colWidth = width;

                if (i === columnProperties.length - 1) {
                    spaceWidth = 0;
                }

                columns.push(_getSkeletonColumn(leftOffset, colWidth, spaceWidth, columnSeparatorType));

                leftOffset += colWidth + spaceWidth;
            }
        }
    }

    const newSection = {
        columns,
        colCount: columns.length,
        height: sectionHeight,
        top,
        st: 0,
        ed: 0,
    };

    columns.forEach((column) => {
        column.parent = newSection;
    });

    return newSection;
}

export function setColumnFullState(column: IDocumentSkeletonColumn, state: boolean) {
    column.isFull = state;
}

function _getSkeletonColumn(
    left: number,
    width: number,
    spaceWidth: number,
    columnSeparatorType: ColumnSeparatorType
): IDocumentSkeletonColumn {
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
