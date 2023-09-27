import {
    CURSOR_TYPE,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ISelectionRangeWithStyle,
    ISelectionTransformerShapeManager,
    Rect,
    ScrollTimer,
    Vector2,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandService,
    ICurrentUniverService,
    LifecycleStages,
    Nullable,
    Observer,
    ObserverManager,
    OnLifecycle,
    SELECTION_TYPE,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getCoordByOffset, getSheetObject, ISheetObjectParam } from '../Basics/component-tools';
import { CANVAS_VIEW_KEY, SHEET_COMPONENT_HEADER_LAYER_INDEX } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

const HEADER_MOVE_CONTROLLER_BACKGROUND = '__SpreadsheetHeaderMoveControllerBackground__';

const HEADER_MOVE_CONTROLLER_LINE = '__SpreadsheetHeaderMoveControllerShapeLine__';

const HEADER_MOVE_CONTROLLER_BACKGROUND_FILL = 'rgba(0, 0, 0, 0.1)';

const HEADER_MOVE_CONTROLLER_LINE_FILL = 'rgb(119, 119, 119)';

const HEADER_MOVE_CONTROLLER_LINE_SIZE = 4;

enum HEADER_MOVE_TYPE {
    ROW,
    COLUMN,
}

@OnLifecycle(LifecycleStages.Rendered, HeaderMoveController)
export class HeaderMoveController extends Disposable {
    private _startOffsetX: number = -Infinity;

    private _startOffsetY: number = -Infinity;

    private _moveHelperBackgroundShape: Nullable<Rect>;

    private _moveHelperLineShape: Nullable<Rect>;

    private _sheetObject!: ISheetObjectParam;

    private _rowOrColumnDownObservers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _rowOrColumnMoveObservers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _rowOrColumnLeaveObservers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _scrollTimer!: ScrollTimer;

    private _changeToColumn: number = -Infinity;

    private _changeToRow: number = -Infinity;

    override dispose(): void {
        this._moveHelperBackgroundShape?.dispose();
        this._moveHelperLineShape?.dispose();

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { spreadsheetRowHeader, spreadsheetColumnHeader, scene } = sheetObject;

        [
            ...this._rowOrColumnDownObservers,
            ...this._rowOrColumnMoveObservers,
            ...this._rowOrColumnLeaveObservers,
        ].forEach((obs) => {
            spreadsheetRowHeader.onPointerDownObserver.remove(obs);
            spreadsheetColumnHeader.onPointerDownObserver.remove(obs);
        });

        scene.onPointerMoveObserver.remove(this._moveObserver);

        scene.onPointerUpObserver.remove(this._upObserver);

        this._scrollTimer.dispose();
    }

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,

        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            throw new Error('sheetObject is null');
        }

        this._sheetObject = sheetObject;

        this._initialRowOrColumn(HEADER_MOVE_TYPE.ROW);

        this._initialRowOrColumn(HEADER_MOVE_TYPE.COLUMN);
    }

    private _initialRowOrColumn(initialType: HEADER_MOVE_TYPE = HEADER_MOVE_TYPE.ROW) {
        const { spreadsheetColumnHeader, spreadsheetRowHeader, scene } = this._sheetObject;

        const eventBindingObject =
            initialType === HEADER_MOVE_TYPE.ROW ? spreadsheetRowHeader : spreadsheetColumnHeader;

        this._rowOrColumnMoveObservers.push(
            eventBindingObject?.onPointerMoveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null) {
                    return;
                }

                const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                    evt.offsetX,
                    evt.offsetY,
                    scene,
                    skeleton
                );

                const matchSelectionData = this._checkInHeaderRange(
                    initialType === HEADER_MOVE_TYPE.ROW ? row : column,
                    initialType
                );

                if (matchSelectionData === false) {
                    scene.resetCursor();
                    this._selectionTransformerShapeManager.enableSelection();
                    return;
                }

                scene.setCursor(CURSOR_TYPE.GRAB);

                this._selectionTransformerShapeManager.disableSelection();
            })
        );

        this._rowOrColumnLeaveObservers.push(
            eventBindingObject?.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                this._moveHelperBackgroundShape?.hide();
                this._moveHelperLineShape?.hide();
                scene.resetCursor();
                this._selectionTransformerShapeManager.enableSelection();
            })
        );

        this._rowOrColumnDownObservers.push(
            eventBindingObject?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null) {
                    return;
                }

                const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

                const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

                const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

                this._startOffsetX = newEvtOffsetX;

                this._startOffsetY = newEvtOffsetY;

                const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                    evt.offsetX,
                    evt.offsetY,
                    scene,
                    skeleton
                );

                const matchSelectionData = this._checkInHeaderRange(
                    initialType === HEADER_MOVE_TYPE.ROW ? row : column,
                    initialType
                );

                if (matchSelectionData === false) {
                    return;
                }

                this._newBackgroundAndLine();

                scene.setCursor(CURSOR_TYPE.GRABBING);

                scene.disableEvent();

                const scrollTimer = ScrollTimer.create(scene);

                const mainViewport = scene.getViewport(CANVAS_VIEW_KEY.VIEW_MAIN);

                scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY, mainViewport);

                this._scrollTimer = scrollTimer;

                this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                    const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

                    const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(
                        Vector2.FromArray([moveOffsetX, moveOffsetY])
                    );

                    scene.setCursor(CURSOR_TYPE.GRABBING);

                    this._columnMoving(newMoveOffsetX, newMoveOffsetY, matchSelectionData, initialType);

                    scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                        this._columnMoving(newMoveOffsetX, newMoveOffsetY, matchSelectionData, initialType);
                    });
                });

                this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                    this._disposeBackgroundAndLine();
                    scene.resetCursor();
                    scene.enableEvent();
                    this._clearObserverEvent();
                    this._scrollTimer?.dispose();

                    if (initialType === HEADER_MOVE_TYPE.ROW) {
                        alert(`moveColumnTo: ${this._changeToRow}`);
                    } else {
                        alert(`moveColumnTo: ${this._changeToColumn}`);
                    }
                });
            })
        );
    }

    private _columnMoving(
        moveOffsetX: number,
        moveOffsetY: number,
        matchSelectionData: ISelectionRangeWithStyle,
        initialType: HEADER_MOVE_TYPE
    ) {
        const { scene } = this._sheetObject;

        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (skeleton == null) {
            return;
        }

        const { rowHeaderWidth, columnHeaderHeight, rowTotalHeight, columnTotalWidth } = skeleton;

        const scrollXY = scene.getScrollXYByRelativeCoords(Vector2.FromArray([this._startOffsetX, this._startOffsetY]));

        const { scaleX, scaleY } = scene.getAncestorScale();

        const moveActualSelection = skeleton.getCellPositionByOffset(
            moveOffsetX,
            moveOffsetY,
            scaleX,
            scaleY,
            scrollXY
        );

        const { row, column } = moveActualSelection;

        const startCell = skeleton.getNoMergeCellPositionByIndex(row, column, scaleX, scaleY);

        const { startX: cellStartX, startY: cellStartY, endX: cellEndX, endY: cellEndY } = startCell;

        const selectionWithCoord = this._selectionTransformerShapeManager.convertRangeDataToSelection(
            matchSelectionData.rangeData
        );

        if (selectionWithCoord == null) {
            return;
        }

        const {
            startX: selectedStartX,
            endX: selectedEndX,
            startY: selectedStartY,
            endY: selectedEndY,

            startRow: selectedStartRow,
            startColumn: selectedStartColumn,
            endRow: selectedEndRow,
            endColumn: selectedEndColumn,
        } = selectionWithCoord;

        if (initialType === HEADER_MOVE_TYPE.ROW) {
            this._moveHelperBackgroundShape?.transformByState({
                height: selectedEndY - selectedStartY,
                width: columnTotalWidth + rowHeaderWidth,
                left: 0,
                top: selectedStartY + moveOffsetY - this._startOffsetY + scrollXY.y,
            });
        } else {
            this._moveHelperBackgroundShape?.transformByState({
                height: rowTotalHeight + columnHeaderHeight,
                width: selectedEndX - selectedStartX,
                left: selectedStartX + moveOffsetX - this._startOffsetX + scrollXY.x,
                top: 0,
            });
        }

        this._moveHelperBackgroundShape?.show();

        if (initialType === HEADER_MOVE_TYPE.ROW) {
            let top = 0;
            if (row <= selectedStartRow) {
                top = cellStartY - HEADER_MOVE_CONTROLLER_LINE_SIZE / 2;
                this._changeToRow = row;
            } else if (row > selectedEndRow) {
                top = cellEndY - HEADER_MOVE_CONTROLLER_LINE_SIZE / 2;
                this._changeToRow = row + 1;
            } else {
                return;
            }

            this._moveHelperLineShape?.transformByState({
                height: HEADER_MOVE_CONTROLLER_LINE_SIZE,
                width: columnTotalWidth,
                left: rowHeaderWidth,
                top,
            });
        } else {
            let left = 0;
            if (column <= selectedStartColumn) {
                left = cellStartX - HEADER_MOVE_CONTROLLER_LINE_SIZE / 2;
                this._changeToColumn = column;
            } else if (column > selectedEndColumn) {
                left = cellEndX - HEADER_MOVE_CONTROLLER_LINE_SIZE / 2;
                this._changeToColumn = column + 1;
            } else {
                return;
            }

            this._moveHelperLineShape?.transformByState({
                height: rowTotalHeight,
                width: HEADER_MOVE_CONTROLLER_LINE_SIZE,
                left,
                top: columnHeaderHeight,
            });
        }

        this._moveHelperLineShape?.show();
    }

    private _checkInHeaderRange(rowOrColumn: number, type: HEADER_MOVE_TYPE = HEADER_MOVE_TYPE.ROW) {
        const rangeDatas = this._selectionManagerService.getSelectionDatas();

        const matchSelectionData = rangeDatas?.find((data) => {
            const rangeData = data.rangeData;
            const { startRow, endRow, startColumn, endColumn } = rangeData;
            if (type === HEADER_MOVE_TYPE.COLUMN) {
                if (rowOrColumn >= startColumn && rowOrColumn <= endColumn) {
                    return true;
                }
                return false;
            }

            if (rowOrColumn >= startRow && rowOrColumn <= endRow) {
                return true;
            }
            return false;
        });

        if (
            matchSelectionData == null ||
            matchSelectionData.selectionType === SELECTION_TYPE.ALL ||
            matchSelectionData.selectionType === SELECTION_TYPE.NORMAL ||
            (matchSelectionData.selectionType === SELECTION_TYPE.ROW && type !== HEADER_MOVE_TYPE.ROW) ||
            (matchSelectionData.selectionType === SELECTION_TYPE.COLUMN && type !== HEADER_MOVE_TYPE.COLUMN)
        ) {
            return false;
        }

        return matchSelectionData;
    }

    private _clearObserverEvent() {
        const { scene } = this._sheetObject;
        scene.onPointerMoveObserver.remove(this._moveObserver);
        scene.onPointerUpObserver.remove(this._upObserver);
        this._moveObserver = null;
        this._upObserver = null;
    }

    private _newBackgroundAndLine() {
        const { scene } = this._sheetObject;
        this._moveHelperBackgroundShape = new Rect(HEADER_MOVE_CONTROLLER_BACKGROUND, {
            fill: HEADER_MOVE_CONTROLLER_BACKGROUND_FILL,
            evented: false,
            zIndex: 100,
        });

        this._moveHelperLineShape = new Rect(HEADER_MOVE_CONTROLLER_LINE, {
            fill: HEADER_MOVE_CONTROLLER_LINE_FILL,
            evented: false,
            zIndex: 100,
        });
        scene.addObjects(
            [this._moveHelperBackgroundShape, this._moveHelperLineShape],
            SHEET_COMPONENT_HEADER_LAYER_INDEX
        );
    }

    private _disposeBackgroundAndLine() {
        this._moveHelperBackgroundShape?.dispose();
        this._moveHelperLineShape?.dispose();
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
