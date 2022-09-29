import { ColumnSeparatorType, ISectionColumnProperties } from '@univer/core';
import { IDocumentSkeletonColumn } from '../../..';

export function createSkeletonColumn(
    columnIndex: number = 0,
    columnProperties: ISectionColumnProperties[],
    columnSeparatorType: ColumnSeparatorType = ColumnSeparatorType.NONE,
    pageWidth: number = Infinity
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

function _calculateColumnSize(columnIndex: number = 0, columnProperties: ISectionColumnProperties[], pageWidth: number) {
    let colWidth = 0;
    let spaceWidth = 0;
    let left = 0;
    for (let i = 0; i <= columnIndex; i++) {
        const { width, paddingEnd } = columnProperties[i];
        if (i === columnProperties.length - 1) {
            colWidth = pageWidth === Infinity ? pageWidth - colWidth : width;
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
