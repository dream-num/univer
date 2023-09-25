import {
    CURSOR_TYPE,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ISelectionTransformerShapeManager,
    Rect,
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
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getCoordByOffset, getSheetObject, getTransformCoord, ISheetObjectParam } from '../Basics/component-tools';
import { CANVAS_VIEW_KEY, SHEET_COMPONENT_HEADER_LAYER_INDEX } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import {
    HEADER_MENU_SHAPE_THUMB_SIZE,
    HEADER_MENU_SHAPE_WIDTH_HEIGHT,
    HEADER_RESIZE_SHAPE_TYPE,
    HeaderMenuResizeShape,
} from '../View/HeaderResizeShape';

const HEADER_RESIZE_CONTROLLER_SHAPE_ROW = '__SpreadsheetHeaderResizeControllerShapeRow__';

const HEADER_RESIZE_CONTROLLER_SHAPE_COLUMN = '__SpreadsheetHeaderResizeControllerShapeColumn__';

const HEADER_RESIZE_CONTROLLER_SHAPE_HELPER = '__SpreadsheetHeaderResizeControllerShapeHelper__';

const HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR = 'rgb(199, 199, 199)';

@OnLifecycle(LifecycleStages.Rendered, HeaderResizeController)
export class HeaderResizeController extends Disposable {
    private _currentRow: number = 0;

    private _currentColumn: number = 0;

    private _rowResizeRect: Nullable<HeaderMenuResizeShape>;

    private _columnResizeRect: Nullable<HeaderMenuResizeShape>;

    private _rowEnterObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _rowMoveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _rowLeaveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _columnEnterObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _columnMoveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _columnLeaveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _resizeHelperShape: Nullable<Rect>;

    private _startOffsetX: number;

    private _startOffsetY: number;

    private _sheetObject: ISheetObjectParam;

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

    override dispose(): void {
        this._rowResizeRect?.dispose();

        this._rowResizeRect = null;

        this._columnResizeRect?.dispose();

        this._columnResizeRect = null;

        if (this._sheetObject == null) {
            return;
        }

        const { spreadsheetRowHeader, spreadsheetColumnHeader } = this._sheetObject;

        spreadsheetRowHeader.onPointerEnterObserver.remove(this._rowEnterObserver);
        spreadsheetRowHeader.onPointerMoveObserver.remove(this._rowMoveObserver);
        spreadsheetRowHeader.onPointerLeaveObserver.remove(this._rowLeaveObserver);

        spreadsheetColumnHeader.onPointerEnterObserver.remove(this._columnEnterObserver);
        spreadsheetColumnHeader.onPointerMoveObserver.remove(this._columnMoveObserver);
        spreadsheetColumnHeader.onPointerLeaveObserver.remove(this._columnLeaveObserver);

        this._rowEnterObserver = null;
        this._rowMoveObserver = null;
        this._rowLeaveObserver = null;

        this._columnEnterObserver = null;
        this._columnMoveObserver = null;
        this._columnLeaveObserver = null;
    }

    private _initialize() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            throw new Error('sheetObject is null');
        }

        this._sheetObject = sheetObject;

        const { scene } = sheetObject;

        this._rowResizeRect = new HeaderMenuResizeShape(HEADER_RESIZE_CONTROLLER_SHAPE_ROW, {
            visible: false,
            mode: HEADER_RESIZE_SHAPE_TYPE.HORIZONTAL,
            zIndex: 100,
        });

        this._columnResizeRect = new HeaderMenuResizeShape(HEADER_RESIZE_CONTROLLER_SHAPE_COLUMN, {
            visible: false,
            zIndex: 100,
        });

        scene.addObjects([this._rowResizeRect, this._columnResizeRect], SHEET_COMPONENT_HEADER_LAYER_INDEX);

        this._initialRowHover();

        this._initialColumnHover();

        this._initialHoverResizeRow();

        this._initialHoverResizeColumn();
    }

    private _initialRowHover() {
        const { spreadsheetRowHeader, scene } = this._sheetObject;

        this._rowMoveObserver = spreadsheetRowHeader?.onPointerMoveObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null || this._rowResizeRect == null) {
                    return;
                }

                const { rowHeaderWidth, columnHeaderHeight } = skeleton;

                const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                    evt.offsetX,
                    evt.offsetY,
                    scene,
                    skeleton
                );

                const transformCoord = getTransformCoord(evt.offsetX, evt.offsetY, scene, skeleton);

                let top = startY - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2;

                if (transformCoord.y <= startY + HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2 && transformCoord.y >= startY) {
                    this._currentRow = row - 1;
                } else if (transformCoord.y >= endY - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2 && transformCoord.y <= endY) {
                    this._currentRow = row;
                    top = endY - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2;
                } else {
                    this._rowResizeRect.hide();
                    return;
                }

                if (this._currentRow === -1) {
                    return;
                }

                this._rowResizeRect.transformByState({
                    left: rowHeaderWidth / 2 - rowHeaderWidth / 8,
                    top,
                });
                this._rowResizeRect.setShapeProps({
                    size: rowHeaderWidth / 4,
                });
                this._rowResizeRect.show();
            }
        );

        this._rowLeaveObserver = spreadsheetRowHeader?.onPointerLeaveObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                this._rowResizeRect?.hide();
            }
        );
    }

    private _initialColumnHover() {
        const { spreadsheetColumnHeader, scene } = this._sheetObject;

        this._columnMoveObserver = spreadsheetColumnHeader?.onPointerMoveObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null || this._columnResizeRect == null) {
                    return;
                }

                const { rowHeaderWidth, columnHeaderHeight } = skeleton;

                const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                    evt.offsetX,
                    evt.offsetY,
                    scene,
                    skeleton
                );

                const transformCoord = getTransformCoord(evt.offsetX, evt.offsetY, scene, skeleton);

                let left = startX - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2;

                if (transformCoord.x <= startX + HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2 && transformCoord.x >= startX) {
                    this._currentColumn = column - 1;
                } else if (transformCoord.x >= endX - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2 && transformCoord.x <= endX) {
                    this._currentColumn = column;
                    left = endX - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2;
                } else {
                    this._columnResizeRect.hide();
                    return;
                }

                if (this._currentColumn === -1) {
                    return;
                }

                this._columnResizeRect.transformByState({
                    left,
                    top: columnHeaderHeight / 2 - columnHeaderHeight / 4,
                });
                this._columnResizeRect.setShapeProps({
                    size: columnHeaderHeight / 2,
                });
                this._columnResizeRect.show();
            }
        );

        this._columnLeaveObserver = spreadsheetColumnHeader?.onPointerLeaveObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                this._columnResizeRect?.hide();
            }
        );
    }

    private _initialHoverResizeColumn() {
        const { scene, spreadsheet, spreadsheetColumnHeader } = this._sheetObject;
        const engine = scene.getEngine();
        const canvasMaxWidth = engine?.width || 0;
        const canvasMaxHeight = engine?.height || 0;

        if (this._columnResizeRect == null) {
            return;
        }
        this._columnResizeRect.onPointerEnterObserver.add(() => {
            if (this._columnResizeRect == null) {
                return;
            }
            this._columnResizeRect.show();

            scene.setCursor(CURSOR_TYPE.COLUMN_RESIZE);
        });

        this._columnResizeRect.onPointerLeaveObserver.add(() => {
            if (this._columnResizeRect == null) {
                return;
            }
            this._columnResizeRect.hide();

            scene.resetCursor();
        });

        this._columnResizeRect.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;

            if (skeleton == null) {
                return;
            }

            const viewPort = scene.getViewport(CANVAS_VIEW_KEY.VIEW_MAIN);

            const scrollBarVerticalHeight = (viewPort?.getScrollBar()?.verticalBarRect.width || 0) + 10;

            const transformCoord = getTransformCoord(evt.offsetX, evt.offsetY, scene, skeleton);

            const { scaleX, scaleY } = scene.getAncestorScale();

            this._startOffsetX = transformCoord.x;

            this._startOffsetY = transformCoord.y;

            const currentOffsetX = skeleton.getOffsetByPositionX(this._currentColumn);

            const cell = skeleton.getNoMergeCellPositionByIndex(0, this._currentColumn, scaleX, scaleY);

            let moveChangeX = 0;

            const { rowTotalHeight, columnHeaderHeight } = skeleton;

            const shapeHeight =
                canvasMaxHeight > rowTotalHeight + columnHeaderHeight
                    ? canvasMaxHeight
                    : rowTotalHeight + columnHeaderHeight;

            this._resizeHelperShape = new Rect(HEADER_RESIZE_CONTROLLER_SHAPE_HELPER, {
                width: HEADER_MENU_SHAPE_THUMB_SIZE,
                height: shapeHeight,
                fill: HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR,
                left: currentOffsetX - HEADER_MENU_SHAPE_THUMB_SIZE / 2,
                top: 0,
            });

            const rowResizeRectX = this._columnResizeRect?.left || 0;

            scene.addObject(this._resizeHelperShape, SHEET_COMPONENT_HEADER_LAYER_INDEX);

            scene.disableEvent();

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const transformCoord = getTransformCoord(moveEvt.offsetX, moveEvt.offsetY, scene, skeleton);

                const { x: moveOffsetX, y: moveOffsetY } = transformCoord;

                moveChangeX = moveOffsetX - this._startOffsetX - HEADER_MENU_SHAPE_THUMB_SIZE / 2;

                if (moveChangeX < -(cell.endX - cell.startX) + 2) {
                    moveChangeX = -(cell.endX - cell.startX) + 2;
                    return;
                }
                if (currentOffsetX + moveChangeX > canvasMaxWidth - scrollBarVerticalHeight) {
                    moveChangeX = canvasMaxHeight - currentOffsetX - scrollBarVerticalHeight;
                    return;
                }

                this._resizeHelperShape?.transformByState({
                    left: currentOffsetX + moveChangeX,
                });

                this._columnResizeRect?.transformByState({
                    left: rowResizeRectX + moveChangeX + HEADER_MENU_SHAPE_THUMB_SIZE / 2,
                });

                this._columnResizeRect?.show();

                scene.setCursor(CURSOR_TYPE.ROW_RESIZE);
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                const scene = this._sheetObject.scene;
                scene.resetCursor();
                this._clearObserverEvent();
                scene.enableEvent();
                this._resizeHelperShape?.dispose();
                this._resizeHelperShape = null;
                this._columnResizeRect?.hide();
                alert(`${this._currentColumn}:${moveChangeX}`);
            });
        });

        this._columnResizeRect.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            alert(this._currentColumn);
        });
    }

    private _initialHoverResizeRow() {
        const { scene, spreadsheet, spreadsheetColumnHeader } = this._sheetObject;
        const engine = scene.getEngine();
        const canvasMaxWidth = engine?.width || 0;
        const canvasMaxHeight = engine?.height || 0;

        if (this._rowResizeRect == null) {
            return;
        }
        this._rowResizeRect.onPointerEnterObserver.add(() => {
            if (this._rowResizeRect == null) {
                return;
            }
            this._rowResizeRect.show();

            scene.setCursor(CURSOR_TYPE.ROW_RESIZE);
        });

        this._rowResizeRect.onPointerLeaveObserver.add(() => {
            if (this._rowResizeRect == null) {
                return;
            }
            this._rowResizeRect.hide();

            scene.resetCursor();
        });

        this._rowResizeRect.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;

            if (skeleton == null) {
                return;
            }

            const viewPort = scene.getViewport(CANVAS_VIEW_KEY.VIEW_MAIN);

            const scrollBarHorizontalWidth = (viewPort?.getScrollBar()?.horizonBarRect.height || 0) + 10;

            const transformCoord = getTransformCoord(evt.offsetX, evt.offsetY, scene, skeleton);

            const { scaleX, scaleY } = scene.getAncestorScale();

            this._startOffsetX = transformCoord.x;

            this._startOffsetY = transformCoord.y;

            const currentOffsetY = skeleton.getOffsetByPositionY(this._currentRow);

            const cell = skeleton.getNoMergeCellPositionByIndex(this._currentRow, 0, scaleX, scaleY);

            let moveChangeY = 0;

            const { columnTotalWidth, rowHeaderWidth } = skeleton;

            const shapeWidth =
                canvasMaxWidth > columnTotalWidth + rowHeaderWidth ? canvasMaxWidth : columnTotalWidth + rowHeaderWidth;

            this._resizeHelperShape = new Rect(HEADER_RESIZE_CONTROLLER_SHAPE_HELPER, {
                width: shapeWidth,
                height: HEADER_MENU_SHAPE_THUMB_SIZE,
                fill: HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR,
                left: 0,
                top: currentOffsetY - HEADER_MENU_SHAPE_THUMB_SIZE / 2,
            });

            const rowResizeRectY = this._rowResizeRect?.top || 0;

            scene.addObject(this._resizeHelperShape, SHEET_COMPONENT_HEADER_LAYER_INDEX);

            scene.disableEvent();

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const transformCoord = getTransformCoord(moveEvt.offsetX, moveEvt.offsetY, scene, skeleton);

                const { x: moveOffsetX, y: moveOffsetY } = transformCoord;

                moveChangeY = moveOffsetY - this._startOffsetY - HEADER_MENU_SHAPE_THUMB_SIZE / 2;

                if (moveChangeY < -(cell.endY - cell.startY) + 2) {
                    moveChangeY = -(cell.endY - cell.startY) + 2;
                    return;
                }
                if (currentOffsetY + moveChangeY > canvasMaxHeight - scrollBarHorizontalWidth) {
                    moveChangeY = canvasMaxHeight - currentOffsetY - scrollBarHorizontalWidth;
                    return;
                }

                this._resizeHelperShape?.transformByState({
                    top: currentOffsetY + moveChangeY,
                });

                this._rowResizeRect?.transformByState({
                    top: rowResizeRectY + moveChangeY + HEADER_MENU_SHAPE_THUMB_SIZE / 2,
                });

                this._rowResizeRect?.show();

                scene.setCursor(CURSOR_TYPE.ROW_RESIZE);
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                const scene = this._sheetObject.scene;
                scene.resetCursor();
                this._clearObserverEvent();
                scene.enableEvent();
                this._resizeHelperShape?.dispose();
                this._resizeHelperShape = null;
                this._rowResizeRect?.hide();
                alert(`${this._currentRow}:${moveChangeY}`);
            });
        });

        this._rowResizeRect.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            alert(this._currentRow);
        });
    }

    private _clearObserverEvent() {
        const { scene } = this._sheetObject;
        scene.onPointerMoveObserver.remove(this._moveObserver);
        scene.onPointerUpObserver.remove(this._upObserver);
        this._moveObserver = null;
        this._upObserver = null;
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
