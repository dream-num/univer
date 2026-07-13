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

import type { IColumn, IColumnGroup, Nullable } from '@univerjs/core';
import type { IDocumentSkeletonColumnGroup, IDocumentSkeletonColumnGroupColumn, IDocumentSkeletonLine, IDocumentSkeletonPage } from '../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import type { ILayoutContext } from '../tools';
import { ColumnResponsiveType, DataStreamTreeNodeType } from '@univerjs/core';
import { DocumentSkeletonPageType, LineType } from '../../../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy } from '../../document-compatibility';
import { applyTrailingBlockRangeSpaceBelow, createSkeletonPage } from '../model/page';
import { getLastNotFullColumnInfo, updateBlockIndex, updateInlineDrawingCoordsAndBorder } from '../tools';
import { dealWidthParagraph } from './paragraph/paragraph-layout';

interface IColumnGroupLayoutColumn {
    columnId: string;
    left: number;
    top: number;
    width: number;
}

interface IColumnGroupLayout {
    mode: 'horizontal' | 'stack';
    width: number;
    height: number;
    columns: IColumnGroupLayoutColumn[];
}

const EMPTY_COLUMN_GROUP_MIN_HEIGHT = 72;

export function createColumnGroupSkeleton(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    columnGroupNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
): Nullable<IDocumentSkeletonColumnGroup> {
    const columnGroupSource = viewModel.getColumnGroupByStartIndex(columnGroupNode.startIndex)?.columnGroupSource;
    if (columnGroupSource == null) {
        console.warn('Column group not found when creating column group skeleton');
        return null;
    }

    const hostColumn = getLastNotFullColumnInfo(curPage)?.column;
    if (hostColumn == null) {
        return null;
    }

    const columnPages = columnGroupNode.children.map((columnNode, index) => {
        const sourceColumn = columnGroupSource.columns[index];
        const width = Math.max(0, getInitialColumnWidth(columnGroupSource, sourceColumn, hostColumn.width));

        return createColumnContentPage(ctx, viewModel, columnNode, sectionBreakConfig, width);
    });
    const columnHeights = columnPages.map((page) => Math.max(page.height, EMPTY_COLUMN_GROUP_MIN_HEIGHT));
    const layout = calculateColumnGroupLayout(columnGroupSource, hostColumn.width, columnHeights);
    const columns = layout.columns.map((layoutColumn, index): IDocumentSkeletonColumnGroupColumn => {
        const page = columnPages[index];
        page.pageHeight = columnHeights[index];

        return {
            columnId: layoutColumn.columnId,
            left: layoutColumn.left,
            top: layoutColumn.top,
            width: layoutColumn.width,
            height: columnHeights[index],
            st: columnGroupNode.children[index].startIndex,
            ed: columnGroupNode.children[index].endIndex,
            page,
        };
    });

    const columnGroupSkeleton: IDocumentSkeletonColumnGroup = {
        columns,
        width: layout.width,
        height: layout.height,
        top: getNextBlockTop(hostColumn.lines),
        left: hostColumn.left,
        st: columnGroupNode.startIndex,
        ed: columnGroupNode.endIndex,
        columnGroupId: columnGroupSource.columnGroupId,
        columnGroupSource,
    };

    columns.forEach((column) => {
        column.parent = columnGroupSkeleton;
        column.page.parent = column as never;
    });

    return columnGroupSkeleton;
}

export function appendColumnGroupBlockLine(page: IDocumentSkeletonPage, columnGroup: IDocumentSkeletonColumnGroup): boolean {
    const columnInfo = getLastNotFullColumnInfo(page);
    if (columnInfo == null) {
        return false;
    }

    const { column } = columnInfo;
    const line = createColumnGroupBlockLine(columnGroup, column.lines.length);
    line.parent = column;
    column.lines.push(line);

    page.skeColumnGroups.set(columnGroup.columnGroupId, columnGroup);
    columnGroup.parent = page;

    return true;
}

function createColumnContentPage(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    columnNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    width: number
): IDocumentSkeletonPage {
    const columnSectionBreakConfig: ISectionBreakConfig = {
        ...sectionBreakConfig,
        pageSize: {
            width,
            height: Number.POSITIVE_INFINITY,
        },
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        columnProperties: [],
    };
    const page = createSkeletonPage(ctx, columnSectionBreakConfig, ctx.skeletonResourceReference);
    page.type = DocumentSkeletonPageType.CELL;

    for (const paragraphNode of getColumnParagraphNodes(columnNode)) {
        dealWidthParagraph(ctx, viewModel, paragraphNode, page, columnSectionBreakConfig);
    }

    updateInlineDrawingCoordsAndBorder(ctx, [page]);
    updateBlockIndex(
        [page],
        columnNode.startIndex,
        sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy()
    );
    applyTrailingBlockRangeSpaceBelow([page], ctx.dataModel?.getBody?.(), columnNode.endIndex);

    return page;
}

function getColumnParagraphNodes(columnNode: DataStreamTreeNode): DataStreamTreeNode[] {
    const firstChild = columnNode.children[0];
    if (firstChild?.nodeType === DataStreamTreeNodeType.SECTION_BREAK) {
        return firstChild.children;
    }

    return columnNode.children;
}

function createColumnGroupBlockLine(columnGroup: IDocumentSkeletonColumnGroup, lineIndex: number): IDocumentSkeletonLine {
    const top = columnGroup.top;

    return {
        paragraphIndex: columnGroup.ed,
        type: LineType.BLOCK,
        divides: [],
        divideLen: 0,
        lineHeight: columnGroup.height,
        contentHeight: columnGroup.height,
        top,
        asc: 0,
        dsc: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
        spaceBelowApply: 0,
        st: columnGroup.st,
        ed: columnGroup.ed,
        lineIndex,
        paragraphStart: true,
        isBehindTable: false,
        tableId: '',
    };
}

function getNextBlockTop(lines: IDocumentSkeletonLine[]) {
    const lastLine = lines[lines.length - 1];
    if (lastLine == null) {
        return 0;
    }

    return lastLine.top + lastLine.lineHeight;
}

function calculateColumnGroupLayout(source: IColumnGroup, availableWidth: number, columnHeights: number[]): IColumnGroupLayout {
    const width = Math.max(0, availableWidth);
    const gap = Math.max(0, source.gap?.v ?? 0);
    const columns = source.columns;
    if (columns.length === 0) {
        return {
            mode: 'horizontal',
            width,
            height: 0,
            columns: [],
        };
    }

    if (shouldStack(columns, width, gap, source.responsive)) {
        let top = 0;

        return {
            mode: 'stack',
            width,
            height: sumHeights(columnHeights),
            columns: columns.map((column, index) => {
                const layoutColumn = {
                    columnId: column.columnId,
                    left: 0,
                    top,
                    width,
                };
                top += Math.max(0, columnHeights[index] ?? 0);

                return layoutColumn;
            }),
        };
    }

    const contentWidth = Math.max(0, width - gap * (columns.length - 1));
    const widths = allocateHorizontalWidths(columns, contentWidth);
    let left = 0;

    return {
        mode: 'horizontal',
        width,
        height: Math.max(0, ...columnHeights),
        columns: columns.map((column, index) => {
            const layoutColumn = {
                columnId: column.columnId,
                left,
                top: 0,
                width: widths[index],
            };
            left += widths[index] + gap;

            return layoutColumn;
        }),
    };
}

function shouldStack(columns: IColumn[], availableWidth: number, gap: number, responsive: ColumnResponsiveType): boolean {
    if (responsive !== ColumnResponsiveType.STACK) {
        return false;
    }

    const totalMinWidth = columns.reduce((sum, column) => sum + getMinWidth(column), 0) + gap * Math.max(0, columns.length - 1);

    return totalMinWidth > availableWidth;
}

function getInitialColumnWidth(source: IColumnGroup, column: IColumn | undefined, availableWidth: number): number {
    if (column == null) {
        return availableWidth;
    }

    const contentWidth = Math.max(0, availableWidth - Math.max(0, source.gap?.v ?? 0) * Math.max(0, source.columns.length - 1));
    const ratioSum = source.columns.reduce((sum, item) => sum + Math.max(0, item.widthRatio || 0), 0) || source.columns.length;

    return Math.max(getMinWidth(column), contentWidth * (Math.max(0, column.widthRatio || 0) || 1) / ratioSum);
}

function allocateHorizontalWidths(columns: IColumn[], contentWidth: number): number[] {
    const ratioSum = columns.reduce((sum, column) => sum + Math.max(0, column.widthRatio || 0), 0) || columns.length;
    const idealWidths = columns.map((column) => contentWidth * (Math.max(0, column.widthRatio || 0) || 1) / ratioSum);
    const minWidths = columns.map(getMinWidth);
    const widths = idealWidths.map((width, index) => Math.max(width, minWidths[index]));
    const overflow = widths.reduce((sum, width) => sum + width, 0) - contentWidth;

    if (overflow <= 0) {
        return widths;
    }

    return compressToFit(widths, minWidths, overflow);
}

function compressToFit(widths: number[], minWidths: number[], overflow: number): number[] {
    const nextWidths = [...widths];
    let remainingOverflow = overflow;
    let flexibleIndexes = getFlexibleIndexes(nextWidths, minWidths);

    while (remainingOverflow > 0 && flexibleIndexes.length > 0) {
        const totalShrink = flexibleIndexes.reduce((sum, item) => sum + item.shrink, 0);
        for (const item of flexibleIndexes) {
            const shrink = Math.min(item.shrink, remainingOverflow * item.shrink / totalShrink);
            nextWidths[item.index] -= shrink;
            remainingOverflow -= shrink;
        }
        flexibleIndexes = getFlexibleIndexes(nextWidths, minWidths);
    }

    return nextWidths;
}

function getFlexibleIndexes(widths: number[], minWidths: number[]) {
    return widths
        .map((width, index) => ({ index, shrink: Math.max(0, width - minWidths[index]) }))
        .filter((item) => item.shrink > 0);
}

function getMinWidth(column: IColumn): number {
    return Math.max(0, column.minWidth?.v ?? 0);
}

function sumHeights(heights: number[]): number {
    return heights.reduce((sum, height) => sum + Math.max(0, height), 0);
}
