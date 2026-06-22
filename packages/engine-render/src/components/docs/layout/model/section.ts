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
import type { IDocumentSkeletonColumn, IDocumentSkeletonSection } from '../../../../basics/i-document-skeleton-cached';
import { ColumnSeparatorType } from '@univerjs/core';

export function createSkeletonSection(
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

    if (columnProperties.length === 0) {
        columns.push(_getSkeletonColumn(left, sectionWidth, 0, ColumnSeparatorType.NONE));
    } else {
        for (const { width, paddingEnd } of _fitColumnProperties(columnProperties, sectionWidth)) {
            spaceWidth = paddingEnd;
            colWidth = width;

            columns.push(_getSkeletonColumn(left, colWidth, spaceWidth, columnSeparatorType));

            left += colWidth + spaceWidth;
        }
    }
    const newSection = {
        columns,
        colCount: columnProperties?.length || 1,
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

function _fitColumnProperties(
    columnProperties: ISectionColumnProperties[],
    sectionWidth: number
): ISectionColumnProperties[] {
    if (sectionWidth === Number.POSITIVE_INFINITY || columnProperties.length === 0) {
        return columnProperties;
    }

    const safeSectionWidth = Math.max(0, sectionWidth);
    const widths = columnProperties.map(({ width }) => Math.max(0, width));
    const spaces = columnProperties.map(({ paddingEnd }, index) =>
        index === columnProperties.length - 1 ? 0 : Math.max(0, paddingEnd)
    );
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);

    if (safeSectionWidth === 0) {
        return columnProperties.map((columnProperty) => ({
            ...columnProperty,
            width: 0,
            paddingEnd: 0,
        }));
    }

    if (totalWidth <= 0) {
        const equalWidth = safeSectionWidth / columnProperties.length;
        return columnProperties.map((columnProperty, index) => ({
            ...columnProperty,
            width: equalWidth,
            paddingEnd: 0,
        }));
    }

    if (totalWidth > safeSectionWidth) {
        const scale = safeSectionWidth / totalWidth;
        return columnProperties.map((columnProperty, index) => ({
            ...columnProperty,
            width: widths[index] * scale,
            paddingEnd: 0,
        }));
    }

    const spaceBudget = safeSectionWidth - totalWidth;
    const totalSpace = spaces.reduce((sum, space) => sum + space, 0);
    const fittedSpaces = totalSpace > spaceBudget && totalSpace > 0
        ? spaces.map((space) => (space / totalSpace) * spaceBudget)
        : spaces;

    return columnProperties.map((columnProperty, index) => ({
        ...columnProperty,
        width: widths[index],
        paddingEnd: fittedSpaces[index],
    }));
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
        // column coordinate system relative to section
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
