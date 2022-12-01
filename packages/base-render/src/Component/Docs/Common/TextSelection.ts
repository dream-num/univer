import { IPosition, Nullable } from '@univer/core';
import { nanoid } from 'nanoid';
import { COLORS } from '../../../Basics/Const';
import { IDocumentSkeletonColumn, IDocumentSkeletonDivide, IDocumentSkeletonLine, IDocumentSkeletonPage, IDocumentSkeletonSection } from '../../../Basics/IDocumentSkeletonCached';
import { getColor } from '../../../Basics/Tools';
import { IPoint } from '../../../Basics/Vector2';
import { Scene } from '../../../Scene';
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

const TEXT_POLYGON_KEY_PREFIX = '__TestSelection__';

export interface INodePosition {
    page: number;
    section: number;
    column: number;
    line: number;
    divide: number;
    span: number;
}

export class TextSelection {
    private _current = false;

    private _Liquid = new Liquid();

    private _polygon: Nullable<RegularPolygon>;

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

    constructor(private _scene: Scene, public startNodePosition?: INodePosition, public endNodePosition?: INodePosition) {}

    isActive() {
        return this._current === true;
    }

    activate() {
        this._current = true;
    }

    deactivate() {
        this._current = false;
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

    isEmpty() {
        return this.startNodePosition === undefined && this.endNodePosition === undefined;
    }

    isCollapsed() {
        if (this.startNodePosition !== undefined && this.endNodePosition === undefined) {
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

        if (start === undefined || end === undefined) {
            return false;
        }

        if (this.isSamePosition()) {
            return false;
        }

        return true;
    }

    dispose() {
        this._polygon?.dispose();
        this._polygon = null;
    }

    isIntersection(textSelection: TextSelection) {
        return false;
    }

    private isSamePosition() {
        const start = this.startNodePosition;

        const end = this.endNodePosition;

        if (start === undefined || end === undefined) {
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

    private _createAndUpdatePolygon(pointsGroup: IPoint[][], left: number, top: number) {
        if (this._polygon) {
            this._polygon.translate(left, top);
            this._polygon.updatePointGroup(pointsGroup);
            return;
        }

        const polygon = new RegularPolygon(TEXT_POLYGON_KEY_PREFIX + nanoid(6), {
            pointsGroup,
            fill: getColor(COLORS.black, 0.2),
            left,
            top,
            evented: false,
        });

        this._polygon = polygon;

        this._scene.addObject(polygon, 2);
    }

    generate(documents: Documents) {
        const skeleton = documents.getSkeleton();

        if (!skeleton) {
            return;
        }

        const pointGroup: IPoint[][] = [];

        const start = this.startNodePosition;

        const end = this.endNodePosition;

        if (this.isEmpty()) {
            return pointGroup;
        }

        if (this.isCollapsed()) {
            return;
        }

        this._selectionIterator(start!, end!, skeleton, (start_sp, end_sp, divide, line) => {
            const { lineHeight } = line;
            const spanGroup = divide.spanGroup;

            const { width: divideWidth } = divide;

            const { x: startX, y: startY } = this._Liquid;

            let position: IPosition;
            if (start_sp === 0 && end_sp === spanGroup.length - 1) {
                position = {
                    startX,
                    startY,
                    endX: startX + divideWidth,
                    endY: startY + lineHeight,
                };
            } else {
                const firstSpan = spanGroup[start_sp];
                const lastSpan = spanGroup[end_sp];

                // console.log('span', firstSpan, lastSpan, start_sp, end_sp);

                position = {
                    startX: startX + firstSpan.left,
                    startY,
                    endX: startX + lastSpan.left + lastSpan.width,
                    endY: startY + lineHeight,
                };

                // for (let sp = start_sp; sp <= end_sp; sp++) {
                //     const span = spanGroup[sp];
                //     const { width: spanWidth, left: spanLeft } = span;
                // }
            }

            pointGroup.push(this._pushToPoints(position));
        });
        // console.log('pointGroup', pointGroup);
        this._createAndUpdatePolygon(pointGroup, documents.left, documents.top);
        return pointGroup;
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
}
