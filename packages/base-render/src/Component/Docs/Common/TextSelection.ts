import { IPosition, Nullable } from '@univer/core';
import { nanoid } from 'nanoid';
import { COLORS } from '../../../Basics/Const';
import {
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSection,
    SpanType,
} from '../../../Basics/IDocumentSkeletonCached';
import { getColor } from '../../../Basics/Tools';
import { IPoint } from '../../../Basics/Vector2';
import { Scene } from '../../../Scene';
import { Rect } from '../../../Shape/Rect';
import { RegularPolygon } from '../../../Shape/RegularPolygon';
import { DocumentSkeleton } from '../DocSkeleton';
import { Documents } from '../Document';
import { Liquid } from './Liquid';

enum NodePositionStateType {
    NORMAL,
    START,
    END,
}

enum NodePositionType {
    page,
    section,
    column,
    line,
    divide,
    span,
}

const NodePositionMap = {
    page: 0,
    section: 1,
    column: 2,
    line: 3,
    divide: 4,
    span: 5,
};

interface ICurrentNodePositionState {
    page: NodePositionStateType;
    section: NodePositionStateType;
    column: NodePositionStateType;
    line: NodePositionStateType;
    divide: NodePositionStateType;
    span: NodePositionStateType;
}

const TEXT_RANGE_KEY_PREFIX = '__TestSelectionRange__';

const TEXT_ANCHOR_KEY_PREFIX = '__TestSelectionAnchor__';

interface ISelectionCursor {
    cursorStart: number;
    cursorEnd: number;
    isCollapse: boolean;
}

export interface INodePosition {
    page: number;
    section: number;
    column: number;
    line: number;
    divide: number;
    span: number;
    isBack: boolean;
}

export class TextSelection {
    private _current = false;

    private _Liquid = new Liquid();

    private _rangeShape: Nullable<RegularPolygon>;

    private _anchorShape: Nullable<Rect>;

    private _cursor: number = 0;

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

    constructor(private _scene: Scene, public startNodePosition?: Nullable<INodePosition>, public endNodePosition?: Nullable<INodePosition>) {}

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

    private _compareNodePositionLogic(pos1: INodePosition, pos2: INodePosition) {
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

    private _compareNodePosition(pos1: INodePosition, pos2: INodePosition) {
        const compare = this._compareNodePositionLogic(pos1, pos2);
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

    private _setNodePositionState(type = NodePositionType.page, start: number, end: number, current: number) {
        if (current === start) {
            this._currentStartState[type] = NodePositionStateType.START;
        } else {
            this._currentStartState[type] = NodePositionStateType.NORMAL;
        }

        if (current === end) {
            this._currentEndState[type] = NodePositionStateType.END;
        } else {
            this._currentEndState[type] = NodePositionStateType.NORMAL;
        }
    }

    private _checkPreviousNodePositionState(typeIndex: number, isStart = true) {
        let index = typeIndex;
        let resultState: Nullable<NodePositionStateType>;
        while (index >= 0) {
            const type = NodePositionType[index];
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

    private _getSelectionRuler(typeIndex: number, startPosition: INodePosition, endPosition: INodePosition, nextLength: number, current: number) {
        let start_nest = 0;
        let end_nest = nextLength;

        const type = NodePositionType[typeIndex] as unknown;

        const nextType = NodePositionType[typeIndex + 1];

        if (nextType === null || type === null) {
            return {
                start_nest,
                end_nest,
            };
        }

        const start = startPosition[type as NodePositionType] as number;

        const end = endPosition[type as NodePositionType] as number;

        this._setNodePositionState(type as NodePositionType, start, end, current);

        const preStartNestType = this._checkPreviousNodePositionState(typeIndex);

        const preEndNestType = this._checkPreviousNodePositionState(typeIndex, false);

        if (preStartNestType === NodePositionStateType.START) {
            start_nest = startPosition[nextType] as number;
        }

        if (preEndNestType === NodePositionStateType.END) {
            end_nest = endPosition[nextType] as number;
        }

        return {
            start_nest,
            end_nest,
        };
    }

    private _pushToPoints(position: IPosition) {
        const { startX, startY, endX, endY } = position;
        const points = [];
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

    private isSamePosition() {
        const start = this.startNodePosition;

        const end = this.endNodePosition;

        if (start == null || end == null) {
            return false;
        }

        const keys = Object.keys(NodePositionMap);

        for (let key of keys) {
            const startNodeValue = start[key] as number;
            const endNodeValue = end[key] as number;

            if (startNodeValue !== endNodeValue) {
                return false;
            }
        }

        return true;
    }

    private _createAndUpdateRange(pointsGroup: IPoint[][], left: number, top: number) {
        if (this._rangeShape) {
            this._rangeShape.translate(left, top);
            this._rangeShape.updatePointGroup(pointsGroup);
            this._rangeShape.show();
            return;
        }

        const polygon = new RegularPolygon(TEXT_RANGE_KEY_PREFIX + nanoid(6), {
            pointsGroup,
            fill: getColor(COLORS.black, 0.2),
            left,
            top,
            evented: false,
        });

        this._rangeShape = polygon;

        this._scene.addObject(polygon, 2);
    }

    private _getAnchorBounding(pointsGroup: IPoint[][]) {
        const points = pointsGroup[0];
        const startPoint = points[0];
        const endPoint = points[2];

        const { x: startX, y: startY } = startPoint;

        const { x: endX, y: endY } = endPoint;

        return {
            left: startX,
            top: startY,
            width: endX - startX,
            height: endY - startY,
        };
    }

    private _createAndUpdateAnchor(pointsGroup: IPoint[][], docsLeft: number, docsTop: number) {
        const bounding = this._getAnchorBounding(pointsGroup);
        const { left, top, width, height } = bounding;
        if (this._anchorShape) {
            this._anchorShape.transformByState({ left: left + docsLeft, top: top + docsTop, height });
            this._anchorShape.show();
            return;
        }

        const anchor = new Rect(TEXT_ANCHOR_KEY_PREFIX + nanoid(6), {
            left: left + docsLeft,
            top: top + docsTop,
            height,
            strokeWidth: 1,
            stroke: getColor(COLORS.black),
            evented: false,
        });

        this._anchorShape = anchor;

        this._scene.addObject(anchor, 2);
    }

    private _getRangePointData(startOrigin: INodePosition, endOrigin: INodePosition, skeleton: DocumentSkeleton) {
        const pointGroup: IPoint[][] = [];

        const cursorList: ISelectionCursor[] = [];

        if (startOrigin == null || endOrigin == null) {
            return {
                pointGroup,
                cursorList,
            };
        }

        const { start, end } = this._compareNodePosition(startOrigin, endOrigin);

        const isStartBack = start.isBack;

        const isEndBack = end.isBack;

        this._selectionIterator(start!, end!, skeleton, (start_sp, end_sp, divide, line) => {
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

            let isCurrentList = firstSpan?.spanType === SpanType.LIST;

            let hasList = spanGroup[0]?.spanType === SpanType.LIST;

            let cursorStart = start_sp + st;

            let cursorEnd = end_sp + st;

            const isCollapse = start === end;

            if (start_sp === 0 && end_sp === spanGroup.length - 1) {
                position = {
                    startX: startX + firstSpanLeft + (isCurrentList ? firstSpanWidth : 0),
                    startY,
                    endX: startX + lastSpanLeft + lastSpanWidth,
                    endY: startY + lineHeight,
                };
            } else {
                // console.log('span', firstSpan, lastSpan, start_sp, end_sp);

                const isStartBackFin = (isStartBack || start_sp === 0) && !isCurrentList;

                const isEndBackFin = isEndBack && end_sp !== spanGroup.length - 1;

                cursorStart += isStartBackFin ? 0 : 1;

                cursorStart -= hasList ? 1 : 0;

                cursorEnd += isEndBackFin ? 0 : 1;

                cursorEnd -= hasList ? 1 : 0;

                position = {
                    startX: startX + firstSpanLeft + (isStartBackFin ? 0 : firstSpanWidth),
                    startY,
                    endX: startX + lastSpanLeft + (isEndBackFin ? 0 : lastSpanWidth),
                    endY: startY + lineHeight,
                };

                // for (let sp = start_sp; sp <= end_sp; sp++) {
                //     const span = spanGroup[sp];
                //     const { width: spanWidth, left: spanLeft } = span;
                // }
            }

            pointGroup.push(this._pushToPoints(position));
            cursorList.push({
                cursorStart,
                cursorEnd,
                isCollapse,
            });
        });

        return {
            pointGroup,
            cursorList,
        };
    }

    private _selectionIterator(
        startPosition: INodePosition,
        endPosition: INodePosition,
        skeleton: DocumentSkeleton,
        func: (
            startSpanIndex: number,
            endSpanIndex: number,
            divide: IDocumentSkeletonDivide,
            line: IDocumentSkeletonLine,
            column: IDocumentSkeletonColumn,
            section: IDocumentSkeletonSection,
            page: IDocumentSkeletonPage
        ) => void
    ) {
        if (!skeleton) {
            return [];
        }

        this._Liquid.reset();

        const skeletonData = skeleton.getSkeletonData();

        const pages = skeletonData.pages;

        const { page } = startPosition;

        const { page: endPage } = endPosition;

        this._resetCurrentNodePositionState();

        for (let p = page; p <= endPage; p++) {
            const page = pages[p];
            const sections = page.sections;

            const { start_nest: start_s, end_nest: end_s } = this._getSelectionRuler(NodePositionMap.page, startPosition, endPosition, sections.length - 1, p);

            this._Liquid.translatePagePadding(page);

            for (let s = start_s; s <= end_s; s++) {
                const section = sections[s];
                const columns = section.columns;
                const { start_nest: start_c, end_nest: end_c } = this._getSelectionRuler(NodePositionMap.section, startPosition, endPosition, columns.length - 1, s);

                this._Liquid.translateSection(section);

                for (let c = start_c; c <= end_c; c++) {
                    const column = columns[c];
                    const lines = column.lines;
                    const { start_nest: start_l, end_nest: end_l } = this._getSelectionRuler(NodePositionMap.column, startPosition, endPosition, lines.length - 1, c);

                    this._Liquid.translateColumn(column);

                    for (let l = start_l; l <= end_l; l++) {
                        const line = lines[l];
                        const { divides, type, lineHeight = 0 } = line;
                        const { start_nest: start_d, end_nest: end_d } = this._getSelectionRuler(NodePositionMap.line, startPosition, endPosition, divides.length - 1, l);
                        this._Liquid.translateSave();
                        this._Liquid.translateLine(line);

                        for (let d = start_d; d <= end_d; d++) {
                            const divide = divides[d];

                            // console.log('div', divides, divide, startPosition, endPosition, start_d, end_d, d);

                            this._Liquid.translateSave();
                            this._Liquid.translateDivide(divide);

                            const spanGroup = divide.spanGroup;

                            const { start_nest: start_sp, end_nest: end_sp } = this._getSelectionRuler(NodePositionMap.divide, startPosition, endPosition, spanGroup.length - 1, d);

                            func && func(start_sp, end_sp, divide, line, column, section, page);

                            this._Liquid.translateRestore();
                        }

                        this._Liquid.translateRestore();
                    }
                }
            }
        }
    }

    private _setCursor(cursorList: ISelectionCursor[]) {
        if (cursorList.length === 0) {
            return;
        }

        const firstCursor = cursorList[0];

        this._cursor = firstCursor.cursorStart;

        console.log('this._cursor', this._cursor);
    }

    get cursor() {
        return this._cursor;
    }

    getAnchor() {
        return this._anchorShape;
    }

    activeStatic() {
        this._anchorShape?.setProps({
            stroke: getColor(COLORS.black, 1),
        });
    }

    deactivateStatic() {
        this._anchorShape?.setProps({
            stroke: getColor(COLORS.black, 0),
        });
    }

    isActive() {
        return this._current === true;
    }

    activate() {
        this._current = true;
    }

    deactivate() {
        this._current = false;
    }

    isEmpty() {
        return this.startNodePosition == null && this.endNodePosition == null;
    }

    isCollapsed() {
        if (this.startNodePosition != null && this.endNodePosition == null) {
            return true;
        }

        if (this.isSamePosition()) {
            return true;
        }

        return false;
    }

    isRange() {
        const start = this.startNodePosition;

        const end = this.endNodePosition;

        if (start == null || end == null) {
            return false;
        }

        if (this.isSamePosition()) {
            return false;
        }

        return true;
    }

    dispose() {
        this._rangeShape?.dispose();
        this._rangeShape = null;
        this._anchorShape?.dispose();
        this._anchorShape = null;
    }

    isIntersection(textSelection: TextSelection) {
        return false;
    }

    refresh(documents: Documents) {
        const skeleton = documents.getSkeleton();

        if (!skeleton) {
            return;
        }

        const start = this.startNodePosition;

        const end = this.endNodePosition;

        this._anchorShape?.hide();
        this._rangeShape?.hide();

        if (this.isEmpty()) {
            return;
        }

        if (this.isCollapsed()) {
            const data = this._getRangePointData(start!, start!, skeleton);
            const { pointGroup, cursorList } = data;
            this._setCursor(cursorList);
            pointGroup.length > 0 && this._createAndUpdateAnchor(pointGroup, documents.left, documents.top);
            return;
        }

        const data = this._getRangePointData(start!, end!, skeleton);
        const { pointGroup, cursorList } = data;
        this._setCursor(cursorList);
        pointGroup.length > 0 && this._createAndUpdateRange(pointGroup, documents.left, documents.top);
    }

    getStart() {
        if (this.startNodePosition == null) {
            return this.endNodePosition;
        }

        if (this.endNodePosition == null) {
            return this.startNodePosition;
        }

        const { start } = this._compareNodePosition(this.startNodePosition, this.endNodePosition);

        return start;
    }
}
