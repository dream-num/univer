import { ColumnSeparatorType, ISectionColumnProperties } from '@univerjs/core';

import { IDocumentSkeletonColumn, IDocumentSkeletonSection } from '../../../basics/i-document-skeleton-cached';

export function createSkeletonSection(
    columnProperties: ISectionColumnProperties[] = [],
    columnSeparatorType: ColumnSeparatorType = ColumnSeparatorType.NONE,
    top: number = 0,
    left: number = 0,
    sectionWidth: number = Infinity,
    sectionHeight: number = Infinity
): IDocumentSkeletonSection {
    const columns: IDocumentSkeletonColumn[] = [];
    let colWidth = 0;
    let spaceWidth = 0;

    if (columnProperties.length === 0) {
        columns.push(_getSkeletonColumn(left, sectionWidth, 0, ColumnSeparatorType.NONE));
    } else {
        for (let i = 0; i < columnProperties.length; i++) {
            const { width, paddingEnd } = columnProperties[i];

            spaceWidth = paddingEnd;
            colWidth = width;

            columns.push(_getSkeletonColumn(left, colWidth, spaceWidth, columnSeparatorType));

            left += colWidth + spaceWidth;

            if (i === columnProperties.length - 1) {
                colWidth = sectionWidth !== Infinity ? sectionWidth - colWidth : width;
                spaceWidth = 0;
                columns.push(_getSkeletonColumn(left, colWidth, spaceWidth, columnSeparatorType));
            }
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
