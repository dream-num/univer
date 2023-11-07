import { IPosition, ITextRange, Nullable } from '@univerjs/core';

import {
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSection,
    SpanType,
} from '../../../Basics/IDocumentSkeletonCached';
import { INodePosition } from '../../../Basics/Interfaces';
import { IPoint } from '../../../Basics/Vector2';
import { DocumentSkeleton } from '../DocSkeleton';
import { IDocumentOffsetConfig } from '../Document';
import { Liquid } from './Liquid';

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
    span,
}

export interface ICurrentNodePositionState {
    page: NodePositionStateType;
    section: NodePositionStateType;
    column: NodePositionStateType;
    line: NodePositionStateType;
    divide: NodePositionStateType;
    span: NodePositionStateType;
}

export const NodePositionMap = {
    page: 0,
    section: 1,
    column: 2,
    line: 3,
    divide: 4,
    span: 5,
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

    if (pos1.span > pos2.span) {
        return false;
    }

    if (pos1.span < pos2.span) {
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

export class NodePositionConvertToCursor {
    private _Liquid = new Liquid();

    private _documentOffsetConfig: Nullable<IDocumentOffsetConfig>;

    private _docSkeleton: Nullable<DocumentSkeleton>;

    private _currentStartState: ICurrentNodePositionState = {
        page: NodePositionStateType.NORMAL,
        section: NodePositionStateType.NORMAL,
        column: NodePositionStateType.NORMAL,
        line: NodePositionStateType.NORMAL,
        divide: NodePositionStateType.NORMAL,
        span: NodePositionStateType.NORMAL,
    };

    private _currentEndState: ICurrentNodePositionState = {
        page: NodePositionStateType.NORMAL,
        section: NodePositionStateType.NORMAL,
        column: NodePositionStateType.NORMAL,
        line: NodePositionStateType.NORMAL,
        divide: NodePositionStateType.NORMAL,
        span: NodePositionStateType.NORMAL,
    };

    constructor(documentOffsetConfig: IDocumentOffsetConfig, docSkeleton: DocumentSkeleton) {
        this._documentOffsetConfig = documentOffsetConfig;

        this._docSkeleton = docSkeleton;
    }

    getRangePointData(startOrigin: Nullable<INodePosition>, endOrigin: Nullable<INodePosition>) {
        const pointGroup: IPoint[][] = [];

        const cursorList: ITextRange[] = [];

        if (startOrigin == null || endOrigin == null) {
            return {
                pointGroup,
                cursorList,
            };
        }

        const { start, end } = compareNodePosition(startOrigin, endOrigin);

        // eslint-disable-next-line max-lines-per-function
        this._selectionIterator(start!, end!, (start_sp, end_sp, isFirst, isLast, divide, line) => {
            const { lineHeight } = line;

            const { spanGroup, st } = divide;

            const { x: startX, y: startY } = this._Liquid;

            let position: IPosition;

            const firstSpan = spanGroup[start_sp];
            const lastSpan = spanGroup[end_sp];

            const firstSpanLeft = firstSpan?.left || 0;
            const firstSpanWidth = firstSpan?.width || 0;

            const lastSpanLeft = lastSpan?.left || 0;
            const lastSpanWidth = lastSpan?.width || 0;

            const isCurrentList = firstSpan?.spanType === SpanType.LIST;

            const hasList = spanGroup[0]?.spanType === SpanType.LIST;

            let startOffset = start_sp + st;

            let endOffset = end_sp + st;

            const isStartBack = start.span === start_sp && isFirst ? start.isBack : true;

            const isEndBack = end.span === end_sp && isLast ? end.isBack : false;

            const collapsed = start === end;

            if (start_sp === 0 && end_sp === spanGroup.length - 1) {
                endOffset -= hasList ? 1 : 0;

                position = {
                    startX: startX + firstSpanLeft + (isCurrentList ? firstSpanWidth : 0),
                    startY,
                    endX: startX + lastSpanLeft + lastSpanWidth,
                    endY: startY + lineHeight,
                };
            } else {
                const isStartBackFin = isStartBack && !isCurrentList;

                // isEndBackFin = isEndBack;

                // startOffset += isStartBackFin ? 0 : 1;

                startOffset -= hasList && !isCurrentList ? 1 : 0;

                // endOffset += isEndBackFin ? 0 : 1;

                endOffset -= hasList && !isCurrentList ? 1 : 0;

                position = {
                    startX: startX + firstSpanLeft + (isStartBackFin ? 0 : firstSpanWidth),
                    startY,
                    endX: startX + lastSpanLeft + (isEndBack ? 0 : lastSpanWidth),
                    endY: startY + lineHeight,
                };

                // for (let sp = start_sp; sp <= end_sp; sp++) {
                //     const span = spanGroup[sp];
                //     const { width: spanWidth, left: spanLeft } = span;
                // }
            }

            pointGroup.push(this._pushToPoints(position));

            cursorList.push({
                startOffset: isStartBack ? startOffset : startOffset + 1,
                endOffset: isEndBack ? endOffset : endOffset + 1,
                collapsed,
            });
        });

        return {
            pointGroup,
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
            span: NodePositionStateType.NORMAL,
        };

        this._currentEndState = {
            page: NodePositionStateType.NORMAL,
            section: NodePositionStateType.NORMAL,
            column: NodePositionStateType.NORMAL,
            line: NodePositionStateType.NORMAL,
            divide: NodePositionStateType.NORMAL,
            span: NodePositionStateType.NORMAL,
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

    // eslint-disable-next-line max-lines-per-function
    private _selectionIterator(
        startPosition: INodePosition,
        endPosition: INodePosition,
        func: (
            startSpanIndex: number,
            endSpanIndex: number,
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

        this._Liquid.reset();

        const skeletonData = skeleton.getSkeletonData();

        if (skeletonData == null) {
            return [];
        }

        const pages = skeletonData.pages;

        const { page: pageIndex } = startPosition;

        const { page: endPageIndex } = endPosition;

        this._resetCurrentNodePositionState();

        if (this._documentOffsetConfig == null) {
            return [];
        }

        const { pageLayoutType, pageMarginLeft, pageMarginTop } = this._documentOffsetConfig;

        for (let p = 0; p <= pageIndex - 1; p++) {
            const page = pages[p];
            this._Liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        for (let p = pageIndex; p <= endPageIndex; p++) {
            const page = pages[p];
            const sections = page.sections;

            const { start_next: start_s, end_next: end_s } = this._getSelectionRuler(
                NodePositionMap.page,
                startPosition,
                endPosition,
                sections.length - 1,
                p
            );
            this._Liquid.translateSave();
            this._Liquid.translatePagePadding(page);

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

                this._Liquid.translateSection(section);

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

                    this._Liquid.translateColumn(column);

                    for (let l = start_l; l <= end_l; l++) {
                        const line = lines[l];
                        const { divides, type, lineHeight = 0 } = line;
                        const { start_next: start_d, end_next: end_d } = this._getSelectionRuler(
                            NodePositionMap.line,
                            startPosition,
                            endPosition,
                            divides.length - 1,
                            l
                        );
                        this._Liquid.translateSave();
                        this._Liquid.translateLine(line);

                        for (let d = start_d; d <= end_d; d++) {
                            const divide = divides[d];

                            // console.log('div', divides, divide, startPosition, endPosition, start_d, end_d, d);

                            this._Liquid.translateSave();
                            this._Liquid.translateDivide(divide);

                            const spanGroup = divide.spanGroup;

                            const { start_next: start_sp, end_next: end_sp } = this._getSelectionRuler(
                                NodePositionMap.divide,
                                startPosition,
                                endPosition,
                                spanGroup.length - 1,
                                d
                            );

                            let isFirst = false;

                            let isLast = false;

                            if (p === pageIndex && s === start_s && c === start_c && l === start_l && d === start_d) {
                                isFirst = true;
                            }

                            if (p === endPageIndex && s === end_s && c === end_c && l === end_l && d === end_d) {
                                isLast = true;
                            }

                            func && func(start_sp, end_sp, isFirst, isLast, divide, line, column, section, page);

                            this._Liquid.translateRestore();
                        }

                        this._Liquid.translateRestore();
                    }
                }
            }

            this._Liquid.translateRestore();
            this._Liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }
    }
}
