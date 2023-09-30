import { CURSOR_TYPE, IMouseEvent, IPointerEvent, IRenderManagerService, Rect, Vector2 } from '@univerjs/base-render';
import {
    Disposable,
    ICommandService,
    ICurrentUniverService,
    LifecycleStages,
    Nullable,
    Observer,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getCoordByOffset, getSheetObject, getTransformCoord } from '../Basics/component-tools';
import { CANVAS_VIEW_KEY, SHEET_COMPONENT_HEADER_LAYER_INDEX } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import {
    DeltaColumnWidthCommand,
    IDeltaColumnWidthCommandParams,
} from '../commands/commands/set-worksheet-col-width.command';
import { DeltaRowHeightCommand, IDeltaRowHeightCommand } from '../commands/commands/set-worksheet-row-height.command';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import {
    HEADER_MENU_SHAPE_THUMB_SIZE,
    HEADER_MENU_SHAPE_WIDTH_HEIGHT,
    HEADER_RESIZE_SHAPE_TYPE,
    HeaderMenuResizeShape,
} from '../View/header-resize-shape';

const HEADER_RESIZE_CONTROLLER_SHAPE_ROW = '__SpreadsheetHeaderResizeControllerShapeRow__';

const HEADER_RESIZE_CONTROLLER_SHAPE_COLUMN = '__SpreadsheetHeaderResizeControllerShapeColumn__';

const HEADER_RESIZE_CONTROLLER_SHAPE_HELPER = '__SpreadsheetHeaderResizeControllerShapeHelper__';

const HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR = 'rgb(199, 199, 199)';

enum HEADER_RESIZE_TYPE {
    ROW,
    COLUMN,
}

@OnLifecycle(LifecycleStages.Rendered, HeaderResizeController)
export class HeaderResizeController extends Disposable {
    private _currentRow: number = 0;

    private _currentColumn: number = 0;

    private _rowResizeRect: Nullable<HeaderMenuResizeShape>;

    private _columnResizeRect: Nullable<HeaderMenuResizeShape>;

    private _Observers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _resizeHelperShape: Nullable<Rect>;

    private _startOffsetX: number = Infinity;

    private _startOffsetY: number = Infinity;

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._rowResizeRect?.dispose();

        this._rowResizeRect = null;

        this._columnResizeRect?.dispose();

        this._columnResizeRect = null;

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            throw new Error('sheetObject is null');
        }

        const { spreadsheetRowHeader, spreadsheetColumnHeader } = sheetObject;

        this._Observers.forEach((observer) => {
            spreadsheetRowHeader.onPointerMoveObserver.remove(observer);
            spreadsheetRowHeader.onPointerLeaveObserver.remove(observer);
            spreadsheetColumnHeader.onPointerMoveObserver.remove(observer);
            spreadsheetColumnHeader.onPointerLeaveObserver.remove(observer);
        });

        this._Observers = [];
    }

    private _initialize() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            throw new Error('sheetObject is null');
        }

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

        this._initialHover(HEADER_RESIZE_TYPE.ROW);

        this._initialHover(HEADER_RESIZE_TYPE.COLUMN);

        this._initialHoverResize(HEADER_RESIZE_TYPE.ROW);

        this._initialHoverResize(HEADER_RESIZE_TYPE.COLUMN);
    }

    private _initialHover(initialType: HEADER_RESIZE_TYPE = HEADER_RESIZE_TYPE.ROW) {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        const { spreadsheetRowHeader, spreadsheetColumnHeader, scene } = sheetObject;

        const eventBindingObject =
            initialType === HEADER_RESIZE_TYPE.ROW ? spreadsheetRowHeader : spreadsheetColumnHeader;

        this._Observers.push(
            eventBindingObject?.onPointerMoveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null || this._rowResizeRect == null || this._columnResizeRect == null) {
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

                if (initialType === HEADER_RESIZE_TYPE.ROW) {
                    let top = startY - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2;

                    if (transformCoord.y <= startY + HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2 && transformCoord.y >= startY) {
                        this._currentRow = row - 1;
                    } else if (
                        transformCoord.y >= endY - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2 &&
                        transformCoord.y <= endY
                    ) {
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
                } else {
                    let left = startX - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2;

                    if (transformCoord.x <= startX + HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2 && transformCoord.x >= startX) {
                        this._currentColumn = column - 1;
                    } else if (
                        transformCoord.x >= endX - HEADER_MENU_SHAPE_WIDTH_HEIGHT / 2 &&
                        transformCoord.x <= endX
                    ) {
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
            })
        );

        this._Observers.push(
            eventBindingObject?.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                this._rowResizeRect?.hide();
                this._columnResizeRect?.hide();
            })
        );
    }

    private _initialHoverResize(initialType: HEADER_RESIZE_TYPE = HEADER_RESIZE_TYPE.ROW) {
        const sheetObject = this._getSheetObject();

        if (sheetObject == null) {
            return;
        }

        const { scene } = sheetObject;

        const eventBindingObject =
            initialType === HEADER_RESIZE_TYPE.ROW ? this._rowResizeRect : this._columnResizeRect;

        const engine = scene.getEngine();
        const canvasMaxWidth = engine?.width || 0;
        const canvasMaxHeight = engine?.height || 0;

        if (eventBindingObject == null) {
            return;
        }
        eventBindingObject.onPointerEnterObserver.add(() => {
            if (eventBindingObject == null) {
                return;
            }
            eventBindingObject.show();

            if (initialType === HEADER_RESIZE_TYPE.ROW) {
                scene.setCursor(CURSOR_TYPE.ROW_RESIZE);
            } else {
                scene.setCursor(CURSOR_TYPE.COLUMN_RESIZE);
            }
        });

        eventBindingObject.onPointerLeaveObserver.add(() => {
            if (eventBindingObject == null) {
                return;
            }
            eventBindingObject.hide();

            scene.resetCursor();
        });

        eventBindingObject.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;

            if (skeleton == null) {
                return;
            }

            const sheetObject = this._getSheetObject();

            if (sheetObject == null) {
                return;
            }

            const { scene } = sheetObject;

            const viewPort = scene.getViewport(CANVAS_VIEW_KEY.VIEW_MAIN);

            const scrollBarHorizontalHeight = (viewPort?.getScrollBar()?.horizonBarRect.height || 0) + 10;

            const scrollBarVerticalWidth = (viewPort?.getScrollBar()?.verticalBarRect.width || 0) + 10;

            const transformCoord = getTransformCoord(evt.offsetX, evt.offsetY, scene, skeleton);

            const { scaleX, scaleY } = scene.getAncestorScale();

            this._startOffsetX = transformCoord.x;

            this._startOffsetY = transformCoord.y;

            const currentOffsetX = skeleton.getOffsetByPositionX(this._currentColumn);

            const currentOffsetY = skeleton.getOffsetByPositionY(this._currentRow);

            const cell = skeleton.getNoMergeCellPositionByIndex(this._currentRow, this._currentColumn, scaleX, scaleY);

            let moveChangeX = 0;

            let moveChangeY = 0;

            const { columnTotalWidth, rowHeaderWidth, rowTotalHeight, columnHeaderHeight } = skeleton;

            const shapeWidth =
                canvasMaxWidth > columnTotalWidth + rowHeaderWidth ? canvasMaxWidth : columnTotalWidth + rowHeaderWidth;

            const shapeHeight =
                canvasMaxHeight > rowTotalHeight + columnHeaderHeight
                    ? canvasMaxHeight
                    : rowTotalHeight + columnHeaderHeight;

            if (initialType === HEADER_RESIZE_TYPE.ROW) {
                this._resizeHelperShape = new Rect(HEADER_RESIZE_CONTROLLER_SHAPE_HELPER, {
                    width: shapeWidth,
                    height: HEADER_MENU_SHAPE_THUMB_SIZE,
                    fill: HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR,
                    left: 0,
                    top: currentOffsetY - HEADER_MENU_SHAPE_THUMB_SIZE / 2,
                });
            } else {
                this._resizeHelperShape = new Rect(HEADER_RESIZE_CONTROLLER_SHAPE_HELPER, {
                    width: HEADER_MENU_SHAPE_THUMB_SIZE,
                    height: shapeHeight,
                    fill: HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR,
                    left: currentOffsetX - HEADER_MENU_SHAPE_THUMB_SIZE / 2,
                    top: 0,
                });
            }

            const rowResizeRectX = this._columnResizeRect?.left || 0;

            const rowResizeRectY = this._rowResizeRect?.top || 0;

            scene.addObject(this._resizeHelperShape, SHEET_COMPONENT_HEADER_LAYER_INDEX);

            scene.disableEvent();

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const relativeCoords = scene.getRelativeCoord(
                    Vector2.FromArray([this._startOffsetX, this._startOffsetY])
                );

                const scrollXY = scene.getScrollXYByRelativeCoords(relativeCoords);

                const transformCoord = getTransformCoord(moveEvt.offsetX, moveEvt.offsetY, scene, skeleton);

                const { x: moveOffsetX, y: moveOffsetY } = transformCoord;

                moveChangeX = moveOffsetX - this._startOffsetX - HEADER_MENU_SHAPE_THUMB_SIZE / 2;

                moveChangeY = moveOffsetY - this._startOffsetY - HEADER_MENU_SHAPE_THUMB_SIZE / 2;

                if (initialType === HEADER_RESIZE_TYPE.ROW) {
                    if (moveChangeY < -(cell.endY - cell.startY) + 2) {
                        moveChangeY = -(cell.endY - cell.startY) + 2;
                        return;
                    }
                    if (currentOffsetY + moveChangeY > canvasMaxHeight - scrollBarHorizontalHeight + scrollXY.y) {
                        moveChangeY = canvasMaxHeight - currentOffsetY - scrollBarHorizontalHeight;
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
                } else {
                    if (moveChangeX < -(cell.endX - cell.startX) + 2) {
                        moveChangeX = -(cell.endX - cell.startX) + 2;
                        return;
                    }
                    if (currentOffsetX + moveChangeX > canvasMaxWidth - scrollBarVerticalWidth + scrollXY.x) {
                        moveChangeX = canvasMaxHeight - currentOffsetX - scrollBarVerticalWidth;
                        return;
                    }

                    this._resizeHelperShape?.transformByState({
                        left: currentOffsetX + moveChangeX,
                    });

                    this._columnResizeRect?.transformByState({
                        left: rowResizeRectX + moveChangeX + HEADER_MENU_SHAPE_THUMB_SIZE / 2,
                    });

                    this._columnResizeRect?.show();

                    scene.setCursor(CURSOR_TYPE.COLUMN_RESIZE);
                }
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                const sheetObject = getSheetObject(this._currentUniverService, this._renderManagerService);

                if (sheetObject == null) {
                    return;
                }

                const { scene } = sheetObject;
                scene.resetCursor();
                this._clearObserverEvent();
                scene.enableEvent();
                this._resizeHelperShape?.dispose();
                this._resizeHelperShape = null;
                this._rowResizeRect?.hide();
                this._columnResizeRect?.hide();

                if (initialType === HEADER_RESIZE_TYPE.ROW) {
                    this._commandService.executeCommand<IDeltaRowHeightCommand>(DeltaRowHeightCommand.id, {
                        deltaY: moveChangeY,
                        anchorRow: this._currentRow,
                    });
                } else {
                    this._commandService.executeCommand<IDeltaColumnWidthCommandParams>(DeltaColumnWidthCommand.id, {
                        deltaX: moveChangeX,
                        anchorCol: this._currentColumn,
                    });
                }
            });
        });

        eventBindingObject.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            // if (initialType === HEADER_RESIZE_TYPE.ROW) {
            //     alert(this._currentRow);
            // } else {
            //     alert(this._currentColumn);
            // }
        });
    }

    private _clearObserverEvent() {
        const sheetObject = this._getSheetObject();

        if (sheetObject == null) {
            return;
        }

        const { scene } = sheetObject;
        scene.onPointerMoveObserver.remove(this._moveObserver);
        scene.onPointerUpObserver.remove(this._upObserver);
        this._moveObserver = null;
        this._upObserver = null;
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
