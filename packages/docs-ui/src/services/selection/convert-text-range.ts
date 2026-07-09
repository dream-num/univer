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

import type { IPosition, ITextRange, Nullable } from '@univerjs/core';
import type {
    DocumentSkeleton,
    IDocsTableRenderViewport,
    IDocumentOffsetConfig,
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonRow,
    IDocumentSkeletonSection,
    INodePosition,
    IPoint,
} from '@univerjs/engine-render';
import { DataStreamTreeTokenType } from '@univerjs/core';
import { shouldUseInlineTextSelectionForDocsCustomBlockDrawing } from '@univerjs/docs';
import {
    compareDocumentSkeletonNestedPagePathOrder,
    DocumentSkeletonPageType,
    getDocsTableRenderViewport,
    getDocumentSkeletonNestedPageOffset,
    getPageFromPath,
    getTableIdAndSliceIndex,
    GlyphType,
    Liquid,
} from '@univerjs/engine-render';

export enum NodePositionStateType {
    NORMAL,
    START,
    END,
}

export enum NodePositionType {
    page,
    section,
    column,
    line,
    divide,
    glyph,
}

export interface ICurrentNodePositionState {
    page: NodePositionStateType;
    section: NodePositionStateType;
    column: NodePositionStateType;
    line: NodePositionStateType;
    divide: NodePositionStateType;
    glyph: NodePositionStateType;
}

export const NodePositionMap = {
    page: 0,
    section: 1,
    column: 2,
    line: 3,
    divide: 4,
    glyph: 5,
};

export function compareNodePositionLogic(pos1: INodePosition, pos2: INodePosition) {
    const nestedPagePathOrder = compareDocumentSkeletonNestedPagePathOrder(pos1, pos2);
    if (nestedPagePathOrder != null) {
        return nestedPagePathOrder;
    }

    if (pos1.page > pos2.page) {
        return false;
    }

    if (pos1.page < pos2.page) {
        return true;
    }

    if (pos1.section > pos2.section) {
        return false;
    }

    if (pos1.section < pos2.section) {
        return true;
    }

    if (pos1.column > pos2.column) {
        return false;
    }

    if (pos1.column < pos2.column) {
        return true;
    }

    if (pos1.line > pos2.line) {
        return false;
    }

    if (pos1.line < pos2.line) {
        return true;
    }

    if (pos1.divide > pos2.divide) {
        return false;
    }

    if (pos1.divide < pos2.divide) {
        return true;
    }

    if (pos1.glyph > pos2.glyph) {
        return false;
    }

    if (pos1.glyph < pos2.glyph) {
        return true;
    }

    return true;
}

export function compareNodePosition(pos1: INodePosition, pos2: INodePosition) {
    const compare = compareNodePositionLogic(pos1, pos2);

    if (compare) {
        return {
            start: pos1,
            end: pos2,
        };
    }

    return {
        start: pos2,
        end: pos1,
    };
}

export function getOneTextSelectionRange(rangeList: ITextRange[]): Nullable<ITextRange> {
    const rangeCount = rangeList.length;
    if (rangeCount === 0) {
        return;
    }

    const firstCursor = rangeList[0];

    const lastCursor = rangeList[rangeCount - 1];

    const collapsed = rangeList.length === 1 && firstCursor.collapsed;

    return {
        startOffset: firstCursor.startOffset,
        endOffset: lastCursor.endOffset,
        collapsed,
    };
}

function getOffsetInDivide(
    glyphGroup: IDocumentSkeletonGlyph[],
    startGlyphIndex: number,
    endGlyphIndex: number,
    st: number
) {
    let startOffset = st;
    let endOffset = st;

    for (let i = 0; i < glyphGroup.length; i++) {
        const glyph = glyphGroup[i];
        const contentLength = glyph.count;

        if (i < startGlyphIndex) {
            startOffset += contentLength;
        }

        if (i < endGlyphIndex) {
            endOffset += contentLength;
        }
    }

    return {
        startOffset,
        endOffset,
    };
}

export function pushToPoints(position: IPosition) {
    const { startX, startY, endX, endY } = position;
    const points: Array<{ x: number; y: number }> = [];

    points.push({
        x: startX,
        y: startY,
    });

    points.push({
        x: endX,
        y: startY,
    });

    points.push({
        x: endX,
        y: endY,
    });

    points.push({
        x: startX,
        y: endY,
    });

    points.push({
        x: startX,
        y: startY,
    });

    return points;
}

export class NodePositionConvertToCursor {
    private _liquid = new Liquid();
    private _horizontalClip: Nullable<{ left: number; right: number }> = null;

    private _currentStartState: ICurrentNodePositionState = {
        page: NodePositionStateType.NORMAL,
        section: NodePositionStateType.NORMAL,
        column: NodePositionStateType.NORMAL,
        line: NodePositionStateType.NORMAL,
        divide: NodePositionStateType.NORMAL,
        glyph: NodePositionStateType.NORMAL,
    };

    private _currentEndState: ICurrentNodePositionState = {
        page: NodePositionStateType.NORMAL,
        section: NodePositionStateType.NORMAL,
        column: NodePositionStateType.NORMAL,
        line: NodePositionStateType.NORMAL,
        divide: NodePositionStateType.NORMAL,
        glyph: NodePositionStateType.NORMAL,
    };

    constructor(
        private _documentOffsetConfig: IDocumentOffsetConfig,
        private _docSkeleton: DocumentSkeleton
    ) {
        // super
    }

    // eslint-disable-next-line max-lines-per-function
    getRangePointData(startOrigin: Nullable<INodePosition>, endOrigin: Nullable<INodePosition>) {
        const borderBoxPointGroup: IPoint[][] = [];
        const contentBoxPointGroup: IPoint[][] = [];
        const cursorList: ITextRange[] = [];

        if (startOrigin == null || endOrigin == null) {
            return {
                borderBoxPointGroup,
                contentBoxPointGroup,
                cursorList,
            };
        }

        const isValid = this._isValidPosition(startOrigin, endOrigin);

        if (!isValid) {
            throw new Error(`
                Invalid positions in NodePositionConvertToCursor,
                they are not in the same segment page when in header or footer.`
            );
        }

        const { start, end } = compareNodePosition(startOrigin, endOrigin);

        // eslint-disable-next-line complexity
        this._selectionIterator(start, end, (start_sp, end_sp, isFirst, isLast, divide, line) => {
            const { lineHeight, asc, paddingTop, paddingBottom, contentHeight, marginTop, marginBottom } = line;
            const { glyphGroup, st } = divide;
            if (glyphGroup.length === 0) {
                // The divide is empty, and no need to set selection.
                // Handle the drawing which split the line, and the second divide is empty.
                return;
            }
            const { x: startX, y: startY } = this._liquid;

            let borderBoxPosition: IPosition;
            let contentBoxPosition: IPosition;

            const firstGlyph = glyphGroup[start_sp];
            const lastGlyph = glyphGroup[end_sp];
            const preGlyph = glyphGroup[start_sp - 1];

            const firstGlyphLeft = firstGlyph?.left || 0;
            const firstGlyphWidth = firstGlyph?.width || 0;

            const lastGlyphLeft = lastGlyph?.left || 0;
            const lastGlyphWidth = lastGlyph?.width || 0;

            const isCurrentList = firstGlyph?.glyphType === GlyphType.LIST;

            const { startOffset, endOffset } = getOffsetInDivide(glyphGroup, start_sp, end_sp, st);

            const isStartBack = start.glyph === start_sp && isFirst ? start.isBack : true;

            const isEndBack = end.glyph === end_sp && isLast ? end.isBack : false;

            const collapsed = start === end;
            const rawAnchorGlyph = isStartBack ? (preGlyph ?? firstGlyph) : firstGlyph;
            const anchorGlyph = this._getCaretGlyph(rawAnchorGlyph, glyphGroup, start_sp);
            const selectedGlyphs = glyphGroup.slice(start_sp, end_sp + 1);
            const isSelectionOnlyNonInlineEmbedBlock = !collapsed &&
                selectedGlyphs.length > 0 &&
                selectedGlyphs.every((glyph) => this._isNonInlineEmbedCustomBlockGlyph(glyph));
            const borderBoxStartY = startY;
            const borderBoxEndY = contentHeight == null
                ? startY + lineHeight - marginTop - marginBottom
                : startY + paddingTop + contentHeight + paddingBottom;

            if (start_sp === 0 && end_sp === glyphGroup.length - 1) {
                borderBoxPosition = {
                    startX: startX + firstGlyphLeft + (isCurrentList ? firstGlyphWidth : 0),
                    startY: borderBoxStartY,
                    endX: startX + lastGlyphLeft + (isEndBack ? 0 : lastGlyphWidth),
                    endY: borderBoxEndY,
                };

                contentBoxPosition = {
                    startX: startX + firstGlyphLeft + (isCurrentList ? firstGlyphWidth : 0),
                    startY: startY + paddingTop + asc - anchorGlyph.bBox.ba,
                    endX: startX + lastGlyphLeft + (isEndBack ? 0 : lastGlyphWidth),
                    endY: startY + paddingTop + asc + anchorGlyph.bBox.bd,
                };
            } else {
                const isStartBackFin = isStartBack && !isCurrentList;

                borderBoxPosition = {
                    startX: startX + firstGlyphLeft + (isStartBackFin ? 0 : firstGlyphWidth),
                    startY: borderBoxStartY,
                    endX: startX + lastGlyphLeft + (isEndBack ? 0 : lastGlyphWidth),
                    endY: borderBoxEndY,
                };

                contentBoxPosition = {
                    startX: startX + firstGlyphLeft + (isStartBackFin ? 0 : firstGlyphWidth),
                    startY: startY + paddingTop + asc - anchorGlyph.bBox.ba,
                    endX: startX + lastGlyphLeft + (isEndBack ? 0 : lastGlyphWidth),
                    endY: startY + paddingTop + asc + anchorGlyph.bBox.bd,
                };
            }

            const clippedBorderBoxPosition = clipPositionToHorizontalRange(borderBoxPosition, this._horizontalClip);
            const clippedContentBoxPosition = clipPositionToHorizontalRange(contentBoxPosition, this._horizontalClip);

            if (clippedBorderBoxPosition && !isSelectionOnlyNonInlineEmbedBlock) {
                borderBoxPointGroup.push(pushToPoints(clippedBorderBoxPosition));
            }
            if (clippedContentBoxPosition && !isSelectionOnlyNonInlineEmbedBlock) {
                contentBoxPointGroup.push(pushToPoints(clippedContentBoxPosition));
            }

            cursorList.push({
                startOffset: isStartBack ? startOffset : startOffset + firstGlyph.count,
                endOffset: isEndBack ? endOffset : endOffset + lastGlyph.count,
                collapsed,
            });
        });

        return {
            borderBoxPointGroup,
            contentBoxPointGroup,
            cursorList,
        };
    }

    private _getCaretGlyph(
        glyph: IDocumentSkeletonGlyph | undefined,
        glyphGroup: IDocumentSkeletonGlyph[],
        glyphIndex: number
    ): IDocumentSkeletonGlyph {
        if (!glyph || !this._isNonInlineEmbedCustomBlockGlyph(glyph)) {
            return glyph!;
        }

        const neighbor = this._findTextLikeGlyph(glyphGroup, glyphIndex - 1, -1) ??
            this._findTextLikeGlyph(glyphGroup, glyphIndex + 1, 1);

        return neighbor ?? {
            ...glyph,
            bBox: getDefaultCaretBoundingBox(glyph),
        };
    }

    private _findTextLikeGlyph(glyphGroup: IDocumentSkeletonGlyph[], startIndex: number, step: 1 | -1): IDocumentSkeletonGlyph | undefined {
        for (let index = startIndex; index >= 0 && index < glyphGroup.length; index += step) {
            const glyph = glyphGroup[index];
            if (!this._isNonInlineEmbedCustomBlockGlyph(glyph)) {
                return glyph;
            }
        }

        return undefined;
    }

    private _isNonInlineEmbedCustomBlockGlyph(glyph: IDocumentSkeletonGlyph | undefined): boolean {
        if (!glyph?.drawingId || glyph.streamType !== DataStreamTreeTokenType.CUSTOM_BLOCK) {
            return false;
        }

        const drawing = this._docSkeleton.getViewModel?.().getDataModel?.().getSnapshot?.().drawings?.[glyph.drawingId];
        return !shouldUseInlineTextSelectionForDocsCustomBlockDrawing(drawing);
    }

    private _isValidPosition(startOrigin: INodePosition, endOrigin: INodePosition) {
        const { segmentPage: startPage, pageType: startPageType } = startOrigin;
        const { segmentPage: endPage, pageType: endPageType } = endOrigin;

        if (startPageType !== endPageType) {
            return false;
        }

        if (startPageType === DocumentSkeletonPageType.HEADER || startPageType === DocumentSkeletonPageType.FOOTER) {
            return startPage === endPage;
        }

        return true;
    }

    private _resetCurrentNodePositionState() {
        this._currentStartState = {
            page: NodePositionStateType.NORMAL,
            section: NodePositionStateType.NORMAL,
            column: NodePositionStateType.NORMAL,
            line: NodePositionStateType.NORMAL,
            divide: NodePositionStateType.NORMAL,
            glyph: NodePositionStateType.NORMAL,
        };

        this._currentEndState = {
            page: NodePositionStateType.NORMAL,
            section: NodePositionStateType.NORMAL,
            column: NodePositionStateType.NORMAL,
            line: NodePositionStateType.NORMAL,
            divide: NodePositionStateType.NORMAL,
            glyph: NodePositionStateType.NORMAL,
        };
    }

    private _setNodePositionState(type = NodePositionType.page, start: number, end: number, current: number) {
        if (current === start) {
            this._currentStartState[type as unknown as keyof ICurrentNodePositionState] = NodePositionStateType.START;
        } else {
            this._currentStartState[type as unknown as keyof ICurrentNodePositionState] = NodePositionStateType.NORMAL;
        }

        if (current === end) {
            this._currentEndState[type as unknown as keyof ICurrentNodePositionState] = NodePositionStateType.END;
        } else {
            this._currentEndState[type as unknown as keyof ICurrentNodePositionState] = NodePositionStateType.NORMAL;
        }
    }

    private _checkPreviousNodePositionState(typeIndex: number, isStart = true) {
        let index = typeIndex;
        let resultState: Nullable<NodePositionStateType>;
        while (index >= 0) {
            const type = NodePositionType[index] as keyof ICurrentNodePositionState;
            let state;
            if (isStart) {
                state = this._currentStartState[type];
            } else {
                state = this._currentEndState[type];
            }

            if (state === undefined) {
                return;
            }
            if (resultState === undefined) {
                resultState = state;
            }
            if (state !== resultState) {
                return NodePositionStateType.NORMAL;
            }

            index--;
        }

        return resultState;
    }

    private _getSelectionRuler(
        typeIndex: number,
        startPosition: INodePosition,
        endPosition: INodePosition,
        nextLength: number,
        current: number
    ) {
        let start_next = 0;
        let end_next = nextLength;

        const type = NodePositionType[typeIndex] as keyof INodePosition;

        const nextType = NodePositionType[typeIndex + 1] as keyof INodePosition;

        if (nextType === null || type === null) {
            return {
                start_next,
                end_next,
            };
        }

        const start = startPosition[type] as number;

        const end = endPosition[type] as number;

        this._setNodePositionState(type as unknown as NodePositionType, start, end, current);

        const preStartNestType = this._checkPreviousNodePositionState(typeIndex);

        const preEndNestType = this._checkPreviousNodePositionState(typeIndex, false);

        if (preStartNestType === NodePositionStateType.START) {
            start_next = startPosition[nextType] as number;
        }

        if (preEndNestType === NodePositionStateType.END) {
            end_next = endPosition[nextType] as number;
        }

        return {
            start_next,
            end_next,
        };
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _selectionIterator(
        startPosition: INodePosition,
        endPosition: INodePosition,
        func: (
            startGlyphIndex: number,
            endGlyphIndex: number,
            isFirst: boolean,
            isLast: boolean,
            divide: IDocumentSkeletonDivide,
            line: IDocumentSkeletonLine,
            column: IDocumentSkeletonColumn,
            section: IDocumentSkeletonSection,
            page: IDocumentSkeletonPage
        ) => void
    ) {
        const skeleton = this._docSkeleton;
        if (!skeleton) {
            return [];
        }

        const { pageType, path } = startPosition; // startPosition and endPosition must has the same pageType, path and in the same segment page.

        this._liquid.reset();

        const skeletonData = skeleton.getSkeletonData();

        if (skeletonData == null) {
            return [];
        }

        const { pages, skeHeaders, skeFooters } = skeletonData;

        const { page: pageIndex, segmentPage } = startPosition;
        const { page: endPageIndex, segmentPage: endSegmentPage } = endPosition;

        this._resetCurrentNodePositionState();

        if (this._documentOffsetConfig == null) {
            return [];
        }

        const { pageLayoutType, pageMarginLeft, pageMarginTop } = this._documentOffsetConfig;

        const startRootPageIndex = pageType === DocumentSkeletonPageType.CELL && pages[pageIndex] == null ? segmentPage : pageIndex;
        const endRootPageIndex = pageType === DocumentSkeletonPageType.CELL && pages[endPageIndex] == null ? endSegmentPage : endPageIndex;
        const skipPageIndex = (pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL) ? startRootPageIndex : segmentPage;
        for (let p = 0; p < skipPageIndex; p++) {
            const page = pages[p];
            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        const endIndex = (pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL) ? endRootPageIndex : endSegmentPage;

        for (let p = skipPageIndex; p <= endIndex; p++) {
            const page = pages[p];
            if (page == null) {
                continue;
            }
            const { headerId, footerId, pageWidth } = page;
            let segmentPage: Nullable<IDocumentSkeletonPage> = page;

            if (pageType === DocumentSkeletonPageType.HEADER) {
                segmentPage = skeHeaders.get(headerId)?.get(pageWidth);
            } else if (pageType === DocumentSkeletonPageType.FOOTER) {
                segmentPage = skeFooters.get(footerId)?.get(pageWidth);
            } else if (pageType === DocumentSkeletonPageType.CELL) {
                segmentPage = path[0] === 'pages'
                    ? getPageFromPath(skeletonData, path)
                    : getCellPageFromSegmentPath(skeletonData, page, path);
            }

            if (segmentPage == null) {
                this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                continue;
            }

            const sections = segmentPage.sections;

            const { start_next: start_s, end_next: end_s } = this._getSelectionRuler(
                NodePositionMap.page,
                startPosition,
                endPosition,
                sections.length - 1,
                pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL ? p : 0
            );
            this._liquid.translateSave();
            const previousHorizontalClip = this._horizontalClip;
            this._horizontalClip = null;

            switch (pageType) {
                case DocumentSkeletonPageType.HEADER:
                    this._liquid.translatePagePadding({
                        ...segmentPage,
                        marginLeft: page.marginLeft, // Because header or footer margin Left is 0.
                    });
                    break;
                case DocumentSkeletonPageType.FOOTER: {
                    const footerTop = page.pageHeight - segmentPage.height - segmentPage.marginBottom;
                    this._liquid.translate(page.marginLeft, footerTop);
                    break;
                }
                case DocumentSkeletonPageType.CELL: {
                    const nestedPageOffset = getDocumentSkeletonNestedPageOffset(segmentPage);
                    if (nestedPageOffset) {
                        this._liquid.translatePagePadding(page);
                        this._liquid.translate(nestedPageOffset.left, nestedPageOffset.top);
                        this._liquid.translatePagePadding(segmentPage);
                        break;
                    }

                    const rowSke = segmentPage.parent as IDocumentSkeletonRow;
                    const tableSke = rowSke.parent!;
                    const tablePage = tableSke.parent as IDocumentSkeletonPage | undefined;
                    const tablePageNestedOffset = tablePage ? getDocumentSkeletonNestedPageOffset(tablePage) : undefined;
                    const { left: cellLeft } = segmentPage;
                    const { top: tableTop, left: tableLeft } = tableSke;
                    const { top: rowTop } = rowSke;
                    const sourceTableId = getTableIdAndSliceIndex(tableSke.tableId).tableId;
                    const viewport = getDocsTableRenderViewport(getDocumentUnitId(skeleton), sourceTableId);
                    const hasHorizontalViewport = hasHorizontalTableViewport(viewport);
                    const scrollLeft = hasHorizontalViewport ? viewport.scrollLeft : 0;

                    if (tablePage?.type === DocumentSkeletonPageType.HEADER) {
                        this._liquid.translatePagePadding({
                            ...tablePage,
                            marginLeft: page.marginLeft,
                        });
                    } else if (tablePage?.type === DocumentSkeletonPageType.FOOTER) {
                        const footerTop = page.pageHeight - tablePage.height - tablePage.marginBottom;
                        this._liquid.translate(page.marginLeft, footerTop);
                    } else {
                        this._liquid.translatePagePadding(page);
                    }

                    if (tablePageNestedOffset) {
                        this._liquid.translate(tablePageNestedOffset.left, tablePageNestedOffset.top);
                        this._liquid.translatePagePadding(tablePage!);
                    }

                    if (hasHorizontalViewport) {
                        const visibleLeft = this._liquid.x + tableLeft - (viewport.leadingInsetLeft ?? 0);
                        this._horizontalClip = {
                            left: visibleLeft,
                            right: visibleLeft + viewport.viewportWidth,
                        };
                    }

                    this._liquid.translate(tableLeft + cellLeft - scrollLeft, tableTop + rowTop);
                    this._liquid.translatePagePadding(segmentPage);
                    break;
                }
                default:
                    this._liquid.translatePagePadding(page);
                    break;
            }

            for (let s = start_s; s <= end_s; s++) {
                const section = sections[s];
                const columns = section.columns;
                const { start_next: start_c, end_next: end_c } = this._getSelectionRuler(
                    NodePositionMap.section,
                    startPosition,
                    endPosition,
                    columns.length - 1,
                    s
                );

                this._liquid.translateSection(section);

                for (let c = start_c; c <= end_c; c++) {
                    const column = columns[c];
                    const lines = column.lines;
                    const { start_next: start_l, end_next: end_l } = this._getSelectionRuler(
                        NodePositionMap.column,
                        startPosition,
                        endPosition,
                        lines.length - 1,
                        c
                    );

                    this._liquid.translateColumn(column);

                    for (let l = start_l; l <= end_l; l++) {
                        const line = lines[l];
                        const { divides } = line;
                        const { start_next: start_d, end_next: end_d } = this._getSelectionRuler(
                            NodePositionMap.line,
                            startPosition,
                            endPosition,
                            divides.length - 1,
                            l
                        );
                        this._liquid.translateSave();
                        this._liquid.translateLine(line, true, false);

                        for (let d = start_d; d <= end_d; d++) {
                            const divide = divides[d];

                            this._liquid.translateSave();
                            this._liquid.translateDivide(divide);

                            const { glyphGroup } = divide;

                            const { start_next: start_sp, end_next: end_sp } = this._getSelectionRuler(
                                NodePositionMap.divide,
                                startPosition,
                                endPosition,
                                glyphGroup.length - 1,
                                d
                            );

                            let isFirst = false;
                            let isLast = false;

                            if (p === skipPageIndex && s === start_s && c === start_c && l === start_l && d === start_d) {
                                isFirst = true;
                            }

                            if (p === endIndex && s === end_s && c === end_c && l === end_l && d === end_d) {
                                isLast = true;
                            }

                            func && func(start_sp, end_sp, isFirst, isLast, divide, line, column, section, segmentPage);

                            this._liquid.translateRestore();
                        }

                        this._liquid.translateRestore();
                    }
                }
            }
            this._liquid.translateRestore();
            this._horizontalClip = previousHorizontalClip;

            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }
    }
}

function hasHorizontalTableViewport(viewport: Nullable<IDocsTableRenderViewport>): viewport is IDocsTableRenderViewport {
    return viewport != null &&
        (viewport.leadingInsetLeft ?? 0) + viewport.contentWidth + (viewport.trailingInsetRight ?? 0) > viewport.viewportWidth;
}

function clipPositionToHorizontalRange(position: IPosition, clip: Nullable<{ left: number; right: number }>): Nullable<IPosition> {
    if (!clip) {
        return position;
    }

    const startX = Math.max(position.startX, clip.left);
    const endX = Math.min(position.endX, clip.right);
    const collapsed = position.startX === position.endX;

    if (collapsed) {
        return position.startX >= clip.left && position.startX <= clip.right ? position : null;
    }

    if (endX <= startX) {
        return null;
    }

    return {
        ...position,
        startX,
        endX,
    };
}

function getCellPageFromSegmentPath(
    skeletonData: Parameters<typeof getPageFromPath>[0],
    rootPage: IDocumentSkeletonPage,
    path: (string | number)[]
): Nullable<IDocumentSkeletonPage> {
    if (path[0] === 'pages') {
        return null;
    }

    const segmentPages: IDocumentSkeletonPage[] = [];
    const { headerId, footerId, pageWidth } = rootPage;
    const headerPage = headerId == null ? null : skeletonData.skeHeaders.get(headerId)?.get(pageWidth);
    const footerPage = footerId == null ? null : skeletonData.skeFooters.get(footerId)?.get(pageWidth);

    if (headerPage != null) {
        segmentPages.push(headerPage);
    }

    if (footerPage != null) {
        segmentPages.push(footerPage);
    }

    for (const segmentPage of segmentPages) {
        const page = getPageFromPath({
            ...skeletonData,
            pages: [segmentPage],
        }, ['pages', 0, ...path]);

        if (page != null) {
            return page;
        }
    }

    return null;
}

function getDefaultCaretBoundingBox(glyph: IDocumentSkeletonGlyph): IDocumentSkeletonGlyph['bBox'] {
    const fontSize = getGlyphFontSize(glyph);
    return {
        ...glyph.bBox,
        ba: fontSize,
        bd: Math.max(2, Math.ceil(fontSize * 0.25)),
    };
}

function getGlyphFontSize(glyph: IDocumentSkeletonGlyph): number {
    const fontSize = glyph.fontStyle?.originFontSize ?? glyph.fontStyle?.fontSize ?? glyph.ts?.fs;
    return typeof fontSize === 'number' && Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
}

function getDocumentUnitId(docSkeleton: DocumentSkeleton): string {
    const viewModel = docSkeleton.getViewModel() as {
        getDataModel?: () => {
            getUnitId?: () => string;
        };
    };

    return viewModel.getDataModel?.().getUnitId?.() ?? '';
}
