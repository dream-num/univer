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

import type { IPosition, ITextRange, Nullable } from '@univerjs/core';

import type {
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSection,
} from '../../../basics/i-document-skeleton-cached';
import { GlyphType } from '../../../basics/i-document-skeleton-cached';
import type { INodePosition } from '../../../basics/interfaces';
import type { IPoint } from '../../../basics/vector2';
import type { DocumentSkeleton } from '../layout/doc-skeleton';
import type { IDocumentOffsetConfig } from '../document';
import { Liquid } from '../liquid';
import { DocumentEditArea } from '../view-model/document-view-model';

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

export class NodePositionConvertToCursor {
    private _liquid = new Liquid();

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

        const { start, end } = compareNodePosition(startOrigin, endOrigin);

        this._selectionIterator(start, end, (start_sp, end_sp, isFirst, isLast, divide, line) => {
            const { lineHeight, marginTop, asc } = line;
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
            const anchorGlyph = isStartBack ? (preGlyph ?? firstGlyph) : firstGlyph;

            if (start_sp === 0 && end_sp === glyphGroup.length - 1) {
                borderBoxPosition = {
                    startX: startX + firstGlyphLeft + (isCurrentList ? firstGlyphWidth : 0),
                    startY,
                    endX: startX + lastGlyphLeft + lastGlyphWidth,
                    endY: startY + lineHeight,
                };

                contentBoxPosition = {
                    startX: startX + firstGlyphLeft + (isCurrentList ? firstGlyphWidth : 0),
                    startY: startY + marginTop + asc - anchorGlyph.bBox.ba,
                    endX: startX + lastGlyphLeft + lastGlyphWidth,
                    endY: startY + marginTop + asc + anchorGlyph.bBox.bd,
                };
            } else {
                const isStartBackFin = isStartBack && !isCurrentList;

                borderBoxPosition = {
                    startX: startX + firstGlyphLeft + (isStartBackFin ? 0 : firstGlyphWidth),
                    startY,
                    endX: startX + lastGlyphLeft + (isEndBack ? 0 : lastGlyphWidth),
                    endY: startY + lineHeight,
                };

                contentBoxPosition = {
                    startX: startX + firstGlyphLeft + (isStartBackFin ? 0 : firstGlyphWidth),
                    startY: startY + marginTop + asc - anchorGlyph.bBox.ba,
                    endX: startX + lastGlyphLeft + (isEndBack ? 0 : lastGlyphWidth),
                    endY: startY + marginTop + asc + anchorGlyph.bBox.bd,
                };
            }

            borderBoxPointGroup.push(this._pushToPoints(borderBoxPosition));
            contentBoxPointGroup.push(this._pushToPoints(contentBoxPosition));

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

    private _pushToPoints(position: IPosition) {
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

        const viewModel = this._docSkeleton.getViewModel();
        const editArea = viewModel.getEditArea();

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

        const skipPageIndex = editArea === DocumentEditArea.BODY ? pageIndex : segmentPage;

        for (let p = 0; p < skipPageIndex; p++) {
            const page = pages[p];
            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        const endIndex = editArea === DocumentEditArea.BODY ? endPageIndex : endSegmentPage;

        for (let p = skipPageIndex; p <= endIndex; p++) {
            const page = pages[p];
            const { headerId, footerId, pageWidth } = page;
            let segmentPage: Nullable<IDocumentSkeletonPage> = page;

            if (editArea === DocumentEditArea.HEADER) {
                segmentPage = skeHeaders.get(headerId)?.get(pageWidth);
            } else if (editArea === DocumentEditArea.FOOTER) {
                segmentPage = skeFooters.get(footerId)?.get(pageWidth);
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
                editArea === DocumentEditArea.BODY ? p : 0
            );
            this._liquid.translateSave();

            switch (editArea) {
                case DocumentEditArea.HEADER:
                    this._liquid.translatePagePadding({
                        ...segmentPage,
                        marginLeft: page.marginLeft, // Because header or footer margin Left is 0.
                    });
                    break;
                case DocumentEditArea.FOOTER: {
                    const footerTop = page.pageHeight - segmentPage.height - segmentPage.marginBottom;
                    this._liquid.translate(page.marginLeft, footerTop);
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
                        this._liquid.translateLine(line);

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

            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }
    }
}
