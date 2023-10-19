import {
    CURSOR_TYPE,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    IScrollObserverParam,
    ISelectionTransformerShapeManager,
    Rect,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    Observer,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getCoordByOffset, getSheetObject } from '../Basics/component-tools';
import { SHEET_COMPONENT_HEADER_LAYER_INDEX, VIEWPORT_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SetFrozenCommand } from '../commands/commands/set-frozen.command';
import { ISetFrozenMutationParams, SetFrozenMutation } from '../commands/mutations/set-frozen.mutation';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { ScrollManagerService } from '../services/scroll-manager.service';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

enum FREEZE_DIRECTION_TYPE {
    ROW,
    COLUMN,
}

const FREEZE_ROW_MAIN_NAME = '__SpreadsheetFreezeRowMainName__';

const FREEZE_ROW_HEADER_NAME = '__SpreadsheetFreezeRowHeaderName__';

const FREEZE_COLUMN_MAIN_NAME = '__SpreadsheetFreezeColumnMainName__';

const FREEZE_COLUMN_HEADER_NAME = '__SpreadsheetFreezeColumnHeaderName__';

const FREEZE_SIZE_NORMAL = 4;

const FREEZE_NORMAL_HEADER_COLOR = 'rgb(199, 199, 199)';

const FREEZE_NORMAL_MAIN_COLOR = 'rgba(199, 199, 199, 0.01)';

const FREEZE_ACTIVE_COLOR = 'rgb(11, 87, 208)';

const FREEZE_HOVER_COLOR = 'rgb(116, 119, 117)';

@OnLifecycle(LifecycleStages.Rendered, FreezeController)
export class FreezeController extends Disposable {
    private _rowFreezeHeaderRect: Nullable<Rect>;

    private _rowFreezeMainRect: Nullable<Rect>;

    private _columnFreezeHeaderRect: Nullable<Rect>;

    private _columnFreezeMainRect: Nullable<Rect>;

    private _freezeDownObservers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _freezeMoveObservers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _freezeLeaveObservers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _viewportObservers: Array<Nullable<Observer<IScrollObserverParam>>> = [];

    private _changeToRow: number = -1;

    private _changeToColumn: number = -1;

    private _changeToOffsetX: number = 0;

    private _changeToOffsetY: number = 0;

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,

        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ScrollManagerService) private readonly _scrollManagerService: ScrollManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        // const sheetObject = this._getSheetObject();
        // if (sheetObject == null) {
        //     return;
        // }

        // this._sheetObject = sheetObject;

        // this._createFreeze(FREEZE_DIRECTION_TYPE.ROW);
        // this._createFreeze(FREEZE_DIRECTION_TYPE.COLUMN);

        this._scrollListener();

        this._commandExecutedListener();
    }

    private _createFreeze(freezeDirectionType: FREEZE_DIRECTION_TYPE = FREEZE_DIRECTION_TYPE.ROW) {
        const config = this._getFreeze();

        if (config == null) {
            return;
        }

        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;

        if (skeleton == null) {
            return;
        }

        const { startRow: freezeRow, startColumn: freezeColumn, ySplit, xSplit } = config;

        const position = this._getPositionByIndex(freezeRow, freezeColumn);

        if (position == null) {
            return;
        }

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const engine = sheetObject.engine;
        const canvasMaxWidth = engine?.width || 0;
        const canvasMaxHeight = engine?.height || 0;

        const scene = sheetObject.scene;

        const { startX, endX, startY, endY } = position;

        const { rowTotalHeight, columnTotalWidth, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } =
            skeleton;

        const shapeWidth =
            canvasMaxWidth > columnTotalWidth + rowHeaderWidthAndMarginLeft
                ? canvasMaxWidth
                : columnTotalWidth + columnHeaderHeightAndMarginTop;

        const shapeHeight =
            canvasMaxHeight > rowTotalHeight + columnHeaderHeightAndMarginTop
                ? canvasMaxHeight
                : rowTotalHeight + columnHeaderHeightAndMarginTop;

        this._changeToRow = freezeRow;

        this._changeToColumn = freezeColumn;

        this._changeToOffsetX = startX;

        this._changeToOffsetY = startY;

        const FREEZE_SIZE = FREEZE_SIZE_NORMAL / Math.max(scene.scaleX, scene.scaleY);

        if (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW) {
            this._rowFreezeHeaderRect = new Rect(FREEZE_ROW_HEADER_NAME, {
                fill: FREEZE_NORMAL_HEADER_COLOR,
                width: rowHeaderWidthAndMarginLeft,
                height: FREEZE_SIZE,
                left: 0,
                top: startY - FREEZE_SIZE,
                zIndex: 3,
            });

            let fill = FREEZE_NORMAL_HEADER_COLOR;
            if (freezeRow === -1 || freezeRow === 0) {
                fill = FREEZE_NORMAL_MAIN_COLOR;
            }

            this._rowFreezeMainRect = new Rect(FREEZE_ROW_MAIN_NAME, {
                fill,
                width: shapeWidth * 2,
                height: FREEZE_SIZE,
                left: rowHeaderWidthAndMarginLeft,
                top: startY - FREEZE_SIZE,
                zIndex: 3,
            });

            scene.addObjects([this._rowFreezeHeaderRect, this._rowFreezeMainRect], SHEET_COMPONENT_HEADER_LAYER_INDEX);
        } else {
            this._columnFreezeHeaderRect = new Rect(FREEZE_COLUMN_HEADER_NAME, {
                fill: FREEZE_NORMAL_HEADER_COLOR,
                width: FREEZE_SIZE,
                height: columnHeaderHeightAndMarginTop,
                left: startX - FREEZE_SIZE,
                top: 0,
                zIndex: 3,
            });

            let fill = FREEZE_NORMAL_HEADER_COLOR;
            if (freezeColumn === -1 || freezeColumn === 0) {
                fill = FREEZE_NORMAL_MAIN_COLOR;
            }

            this._columnFreezeMainRect = new Rect(FREEZE_COLUMN_MAIN_NAME, {
                fill,
                width: FREEZE_SIZE,
                height: shapeHeight * 2,
                left: startX - FREEZE_SIZE,
                top: columnHeaderHeightAndMarginTop,
                zIndex: 3,
            });

            scene.addObjects(
                [this._columnFreezeHeaderRect, this._columnFreezeMainRect],
                SHEET_COMPONENT_HEADER_LAYER_INDEX
            );
        }

        this._eventBinding(freezeDirectionType);
    }

    private _eventBinding(freezeDirectionType: FREEZE_DIRECTION_TYPE = FREEZE_DIRECTION_TYPE.ROW) {
        let freezeObjectHeaderRect = this._rowFreezeHeaderRect;
        let freezeObjectMainRect = this._rowFreezeMainRect;
        if (freezeDirectionType === FREEZE_DIRECTION_TYPE.COLUMN) {
            freezeObjectHeaderRect = this._columnFreezeHeaderRect;
            freezeObjectMainRect = this._columnFreezeMainRect;
        }

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { scene } = sheetObject;

        this._freezeMoveObservers.push(
            freezeObjectHeaderRect?.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                freezeObjectHeaderRect?.setProps({
                    fill: FREEZE_HOVER_COLOR,
                    zIndex: 4,
                });
                scene.setCursor(CURSOR_TYPE.GRAB);
            })
        );

        this._freezeMoveObservers.push(
            freezeObjectMainRect?.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                freezeObjectHeaderRect?.setProps({
                    fill: FREEZE_HOVER_COLOR,
                    zIndex: 4,
                });
                scene.setCursor(CURSOR_TYPE.GRAB);
            })
        );

        this._freezeLeaveObservers.push(
            freezeObjectHeaderRect?.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                freezeObjectHeaderRect?.setProps({
                    fill: FREEZE_NORMAL_HEADER_COLOR,
                    zIndex: 3,
                });
                scene.resetCursor();
            })
        );

        this._freezeLeaveObservers.push(
            freezeObjectMainRect?.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                freezeObjectHeaderRect?.setProps({
                    fill: FREEZE_NORMAL_HEADER_COLOR,
                    zIndex: 3,
                });
                scene.resetCursor();
            })
        );

        this._freezeDownObservers.push(
            freezeObjectHeaderRect?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                this._FreezeDown(evt, freezeObjectHeaderRect!, freezeObjectMainRect!, freezeDirectionType);
            })
        );

        this._freezeDownObservers.push(
            freezeObjectMainRect?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                this._FreezeDown(evt, freezeObjectHeaderRect!, freezeObjectMainRect!, freezeDirectionType);
            })
        );
    }

    private _FreezeDown(
        evt: IPointerEvent | IMouseEvent,
        freezeObjectHeaderRect: Rect,
        freezeObjectMainRect: Rect,
        freezeDirectionType: FREEZE_DIRECTION_TYPE = FREEZE_DIRECTION_TYPE.ROW
    ) {
        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (skeleton == null) {
            return;
        }

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { scene } = sheetObject;

        scene.setCursor(CURSOR_TYPE.GRABBING);

        scene.disableEvent();

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                moveEvt.offsetX,
                moveEvt.offsetY,
                scene,
                skeleton
            );

            scene.setCursor(CURSOR_TYPE.GRABBING);

            const FREEZE_SIZE = FREEZE_SIZE_NORMAL / Math.max(scene.scaleX, scene.scaleY);

            if (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW) {
                freezeObjectHeaderRect
                    .transformByState({
                        top: startY - FREEZE_SIZE / 2,
                    })
                    ?.setProps({
                        fill: FREEZE_ACTIVE_COLOR,
                    });
                freezeObjectMainRect
                    .transformByState({
                        top: startY - FREEZE_SIZE / 2,
                    })
                    ?.setProps({
                        fill: FREEZE_NORMAL_HEADER_COLOR,
                    });
                this._changeToRow = row;
                this._changeToOffsetY = startY;
            } else {
                freezeObjectHeaderRect
                    .transformByState({
                        left: startX - FREEZE_SIZE / 2,
                    })
                    ?.setProps({
                        fill: FREEZE_ACTIVE_COLOR,
                    });
                freezeObjectMainRect
                    .transformByState({
                        left: startX - FREEZE_SIZE / 2,
                    })
                    ?.setProps({
                        fill: FREEZE_NORMAL_HEADER_COLOR,
                    });

                this._changeToColumn = column;
                this._changeToOffsetX = startX;
            }

            // this._columnMoving(newMoveOffsetX, newMoveOffsetY, matchSelectionData, initialType);
        });

        this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
            scene.resetCursor();
            scene.enableEvent();
            this._clearObserverEvent();

            const { rowTotalHeight, columnTotalWidth, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } =
                skeleton;

            if (
                (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW &&
                    (this._changeToRow === 0 || this._changeToRow === -1)) ||
                (freezeDirectionType === FREEZE_DIRECTION_TYPE.COLUMN &&
                    (this._changeToColumn === 0 || this._changeToColumn === -1))
            ) {
                freezeObjectHeaderRect.setProps({
                    fill: FREEZE_NORMAL_HEADER_COLOR,
                });
                freezeObjectMainRect.setProps({
                    fill: FREEZE_NORMAL_MAIN_COLOR,
                });
            } else {
                freezeObjectHeaderRect?.setProps({
                    fill: FREEZE_NORMAL_HEADER_COLOR,
                });
                freezeObjectMainRect?.setProps({
                    fill: FREEZE_NORMAL_HEADER_COLOR,
                });
            }

            const FREEZE_SIZE = FREEZE_SIZE_NORMAL / Math.max(scene.scaleX, scene.scaleY);

            if (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW) {
                if (this._changeToRow === 0 || this._changeToRow === -1) {
                    freezeObjectHeaderRect.transformByState({
                        top: columnHeaderHeightAndMarginTop - FREEZE_SIZE,
                    });

                    freezeObjectMainRect.transformByState({
                        top: columnHeaderHeightAndMarginTop - FREEZE_SIZE,
                    });
                }

                // alert(`moveColumnTo: ${this._changeToRow}`);
            } else {
                if (this._changeToColumn === 0 || this._changeToColumn === -1) {
                    freezeObjectHeaderRect.transformByState({
                        left: rowHeaderWidthAndMarginLeft - FREEZE_SIZE,
                    });

                    freezeObjectMainRect.transformByState({
                        left: rowHeaderWidthAndMarginLeft - FREEZE_SIZE,
                    });
                }

                // alert(`moveColumnTo: ${this._changeToColumn}`);
            }

            const sheetViewScroll = this._scrollManagerService.getCurrentScroll() || {
                sheetViewStartRow: 0,
                sheetViewStartColumn: 0,
            };

            const { sheetViewStartRow, sheetViewStartColumn } = sheetViewScroll;

            // this._updateViewport(
            //     this._changeToRow,
            //     this._changeToColumn,
            //     this._changeToRow - sheetViewStartRow,
            //     this._changeToColumn - sheetViewStartColumn
            // );
            if (sheetViewStartColumn == null || sheetViewStartRow == null) {
                return;
            }

            const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
            const worksheet = workbook.getActiveSheet();
            const oldFreeze = worksheet.getConfig()?.freeze;
            let xSplit = oldFreeze?.xSplit || 0;
            let ySplit = oldFreeze?.ySplit || 0;

            if (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW) {
                ySplit = this._changeToRow - sheetViewStartRow;

                ySplit = ySplit < 0 ? 0 : ySplit;
            }
            if (freezeDirectionType === FREEZE_DIRECTION_TYPE.COLUMN) {
                xSplit = this._changeToColumn - sheetViewStartColumn;

                xSplit = xSplit < 0 ? 0 : xSplit;
            }

            this._commandService.executeCommand(SetFrozenCommand.id, {
                startRow: this._changeToRow,
                startColumn: this._changeToColumn,
                ySplit,
                xSplit,
                workbookId: workbook.getUnitId(),
                worksheetId: worksheet.getSheetId(),
            });
        });
    }

    private _updateViewport(row: number = -1, column: number = -1, ySplit: number = 0, xSplit: number = 0) {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        const { scene } = sheetObject;

        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (skeleton == null) {
            return;
        }

        const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;

        const viewColumnLeft = scene.getViewport(VIEWPORT_KEY.VIEW_COLUMN_LEFT);
        const viewColumnRight = scene.getViewport(VIEWPORT_KEY.VIEW_COLUMN_RIGHT);

        const viewRowTop = scene.getViewport(VIEWPORT_KEY.VIEW_ROW_TOP);
        const viewRowBottom = scene.getViewport(VIEWPORT_KEY.VIEW_ROW_BOTTOM);

        const viewLeftTop = scene.getViewport(VIEWPORT_KEY.VIEW_LEFT_TOP);

        const viewMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        const viewMainLeftTop = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP);
        const viewMainLeft = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN_LEFT);
        const viewMainTop = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN_TOP);

        if (
            viewColumnLeft == null ||
            viewColumnRight == null ||
            viewRowTop == null ||
            viewRowBottom == null ||
            viewLeftTop == null ||
            viewMain == null ||
            viewMainLeftTop == null ||
            viewMainLeft == null ||
            viewMainTop == null
        ) {
            return;
        }

        const { scaleX, scaleY } = scene.getAncestorScale();

        this._viewportObservers.forEach((obs) => {
            viewMain.onScrollAfterObserver.remove(obs);
        });

        viewColumnRight.resize({
            left: rowHeaderWidthAndMarginLeft,
            top: 0,
            height: columnHeaderHeightAndMarginTop,
            right: 0,
        });

        viewRowBottom.resize({
            left: 0,
            top: columnHeaderHeightAndMarginTop,
            bottom: 0,
            width: rowHeaderWidthAndMarginLeft,
        });

        viewLeftTop.resize({
            left: 0,
            top: 0,
            width: rowHeaderWidthAndMarginLeft,
            height: columnHeaderHeightAndMarginTop,
        });

        this._viewportObservers.push(
            viewMain.onScrollAfterObserver.add((param: IScrollObserverParam) => {
                const { scrollX, scrollY, actualScrollX, actualScrollY } = param;

                viewColumnRight
                    .updateScroll({
                        scrollX,
                        actualScrollX,
                    })
                    .makeDirty(true);

                viewRowBottom
                    .updateScroll({
                        scrollY,
                        actualScrollY,
                    })
                    .makeDirty(true);
            })
        );

        let isTopView = true;

        let isLeftView = true;

        viewMainLeftTop.enable();

        if (row === -1 || row === 0) {
            isTopView = false;
        }

        if (column === -1 || column === 0) {
            isLeftView = false;
        }

        const startSheetView = skeleton.getNoMergeCellPositionByIndexWithNoHeader(
            row - ySplit,
            column - xSplit,
            scaleX,
            scaleY
        );
        const endSheetView = skeleton.getNoMergeCellPositionByIndexWithNoHeader(row, column, scaleX, scaleY);

        viewMainLeftTop.disable();
        viewMainTop.disable();
        viewMainLeft.disable();
        viewRowTop.disable();
        viewColumnLeft.disable();

        viewMainLeftTop.resetPadding();
        viewMainTop.resetPadding();
        viewMainLeft.resetPadding();
        viewRowTop.resetPadding();
        viewColumnLeft.resetPadding();

        if (isTopView === false && isLeftView === false) {
            viewMain.resize({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                bottom: 0,
                right: 0,
            });
            viewMain.resetPadding();
            viewMain.scrollTo(
                {
                    x: 0,
                    y: 0,
                },
                false
            );
        } else if (isTopView === true && isLeftView === false) {
            const topGap = endSheetView.startY - startSheetView.startY;
            viewMain.resize({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop + topGap,
                bottom: 0,
                right: 0,
            });
            viewMain.setPadding({
                startY: startSheetView.startY,
                endY: endSheetView.startY,
                startX: 0,
                endX: 0,
            });
            viewMain.scrollTo(
                {
                    y: 0,
                },
                false
            );
            viewMainTop.resize({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                height: topGap,
                right: 0,
            });
            // const config = viewMain.getBarScroll(startSheetView.startX, startSheetView.startY);
            viewMainTop
                .updateScroll({
                    actualScrollY: startSheetView.startY,
                    x: viewMain.scrollX,
                    actualScrollX: viewMain.actualScrollX,
                })
                .makeDirty(true);
            viewRowTop.resize({
                left: 0,
                top: columnHeaderHeightAndMarginTop,
                width: rowHeaderWidthAndMarginLeft,
                height: topGap,
            });
            viewRowTop
                .updateScroll({
                    actualScrollY: startSheetView.startY,
                })
                .makeDirty(true);
            viewRowBottom.resize({
                left: 0,
                top: columnHeaderHeightAndMarginTop + topGap,
                bottom: 0,
                width: rowHeaderWidthAndMarginLeft,
            });
            this._viewportObservers.push(
                viewMain.onScrollAfterObserver.add((param: IScrollObserverParam) => {
                    const { scrollX, scrollY, actualScrollX, actualScrollY } = param;

                    viewMainTop
                        .updateScroll({
                            scrollX,
                            actualScrollX,
                        })
                        .makeDirty(true);
                })
            );

            viewMainTop.enable();
            viewRowTop.enable();
        } else if (isTopView === false && isLeftView === true) {
            const leftGap = endSheetView.startX - startSheetView.startX;
            viewMain.resize({
                left: rowHeaderWidthAndMarginLeft + leftGap,
                top: columnHeaderHeightAndMarginTop,
                bottom: 0,
                right: 0,
            });
            viewMain.setPadding({
                startX: startSheetView.startX,
                endX: endSheetView.startX,
                startY: 0,
                endY: 0,
            });
            viewMain.scrollTo(
                {
                    x: 0,
                },
                false
            );
            viewMainLeft.resize({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                width: leftGap,
                bottom: 0,
                right: 0,
            });
            viewMainLeft
                .updateScroll({
                    actualScrollX: startSheetView.startX,
                    y: viewMain.scrollY,
                    actualScrollY: viewMain.actualScrollY,
                })
                .makeDirty(true);
            viewColumnLeft.resize({
                left: rowHeaderWidthAndMarginLeft,
                top: 0,
                width: leftGap,
                height: columnHeaderHeightAndMarginTop,
            });
            viewColumnLeft
                .updateScroll({
                    actualScrollX: startSheetView.startX,
                })
                .makeDirty(true);
            viewColumnRight.resize({
                left: rowHeaderWidthAndMarginLeft + leftGap,
                top: 0,
                height: columnHeaderHeightAndMarginTop,
                right: 0,
            });

            this._viewportObservers.push(
                viewMain.onScrollAfterObserver.add((param: IScrollObserverParam) => {
                    const { scrollX, scrollY, actualScrollX, actualScrollY } = param;

                    viewMainLeft
                        .updateScroll({
                            scrollY,
                            actualScrollY,
                        })
                        .makeDirty(true);
                })
            );

            viewMainLeft.enable();
            viewColumnLeft.enable();
        } else {
            const leftGap = endSheetView.startX - startSheetView.startX;
            const topGap = endSheetView.startY - startSheetView.startY;
            viewMain.resize({
                left: rowHeaderWidthAndMarginLeft + leftGap,
                top: columnHeaderHeightAndMarginTop + topGap,
                bottom: 0,
                right: 0,
            });
            viewMain.setPadding({
                startY: startSheetView.startY,
                endY: endSheetView.startY,
                startX: startSheetView.startX,
                endX: endSheetView.startX,
            });
            viewMain.scrollTo(
                {
                    x: 0,
                    y: 0,
                },
                false
            );
            viewMainLeft.resize({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop + topGap,
                width: leftGap,
                bottom: 0,
            });
            viewMainLeft
                .updateScroll({
                    actualScrollX: startSheetView.startX,
                    y: viewMain.scrollY,
                    actualScrollY: viewMain.actualScrollY,
                })
                .makeDirty(true);
            viewMainTop.resize({
                left: rowHeaderWidthAndMarginLeft + leftGap,
                top: columnHeaderHeightAndMarginTop,
                height: topGap,
                right: 0,
            });
            viewMainTop
                .updateScroll({
                    actualScrollY: startSheetView.startY,
                    x: viewMain.scrollX,
                    actualScrollX: viewMain.actualScrollX,
                })
                .makeDirty(true);
            viewMainLeftTop.resize({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                width: leftGap,
                height: topGap,
            });

            viewMainLeftTop
                .updateScroll({
                    actualScrollX: startSheetView.startX,
                    actualScrollY: startSheetView.startY,
                })
                .makeDirty(true);

            viewRowTop.resize({
                left: 0,
                top: columnHeaderHeightAndMarginTop,
                width: rowHeaderWidthAndMarginLeft,
                height: topGap,
            });

            viewRowTop
                .updateScroll({
                    actualScrollY: startSheetView.startY,
                })
                .makeDirty(true);

            viewRowBottom.resize({
                left: 0,
                top: columnHeaderHeightAndMarginTop + topGap,
                bottom: 0,
                width: rowHeaderWidthAndMarginLeft,
            });

            viewColumnLeft.resize({
                left: rowHeaderWidthAndMarginLeft,
                top: 0,
                width: leftGap,
                height: columnHeaderHeightAndMarginTop,
            });

            viewColumnLeft
                .updateScroll({
                    actualScrollX: startSheetView.startX,
                })
                .makeDirty(true);

            viewColumnRight.resize({
                left: rowHeaderWidthAndMarginLeft + leftGap,
                top: 0,
                height: columnHeaderHeightAndMarginTop,
                right: 0,
            });

            this._viewportObservers.forEach((obs) => {
                viewMain.onScrollAfterObserver.remove(obs);
            });

            this._viewportObservers.push(
                viewMain.onScrollAfterObserver.add((param: IScrollObserverParam) => {
                    const { scrollX, scrollY, actualScrollX, actualScrollY } = param;

                    viewRowBottom
                        .updateScroll({
                            scrollY,
                            actualScrollY,
                        })
                        .makeDirty(true);

                    viewColumnRight
                        .updateScroll({
                            scrollX,
                            actualScrollX,
                        })
                        .makeDirty(true);

                    viewMainLeft
                        .updateScroll({
                            scrollY,
                            actualScrollY,
                        })
                        .makeDirty(true);

                    viewMainTop
                        .updateScroll({
                            scrollX,
                            actualScrollX,
                        })
                        .makeDirty(true);
                })
            );

            viewMainLeftTop.enable();
            viewMainTop.enable();
            viewMainLeft.enable();
            viewRowTop.enable();
            viewColumnLeft.enable();

            // viewMain.disable();
            // viewRowBottom.disable();
        }
    }

    private _scrollListener() {
        this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
            const worksheet = workbook.getActiveSheet();

            const freeze = worksheet.getConfig().freeze;

            const { startRow = -1, startColumn = -1, ySplit = 0, xSplit = 0 } = freeze;

            this._refreshFreeze(startRow, startColumn, ySplit, xSplit);
        });
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetFrozenMutation.id, SetZoomRatioOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                    const worksheet = workbook.getActiveSheet();

                    const params = command.params as ISetFrozenMutationParams;
                    const { workbookId, worksheetId } = params;
                    if (!(workbookId === workbook.getUnitId() && worksheetId === worksheet.getSheetId())) {
                        return;
                    }

                    const freeze = worksheet.getConfig().freeze;

                    if (freeze == null) {
                        return;
                    }

                    const { startRow = -1, startColumn = -1, ySplit = 0, xSplit = 0 } = worksheet.getConfig().freeze;

                    this._refreshFreeze(startRow, startColumn, ySplit, xSplit);
                }
            })
        );
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

    private _clearFreeze() {
        this._rowFreezeHeaderRect?.dispose();
        this._rowFreezeMainRect?.dispose();
        this._columnFreezeHeaderRect?.dispose();
        this._columnFreezeMainRect?.dispose();

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { scene } = sheetObject;

        [...this._freezeDownObservers, ...this._freezeMoveObservers, ...this._freezeLeaveObservers].forEach((obs) => {
            scene.onPointerDownObserver.remove(obs);
            scene.onPointerMoveObserver.remove(obs);
            scene.onPointerLeaveObserver.remove(obs);
        });

        scene.onPointerEnterObserver.remove(this._moveObserver);
        scene.onPointerMoveObserver.remove(this._upObserver);
    }

    private _getPositionByIndex(row: number, column: number) {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { scaleX, scaleY } = sheetObject.scene.getAncestorScale();

        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        const position = skeleton?.getNoMergeCellPositionByIndex(row, column, scaleX, scaleY);
        if (skeleton == null) {
            return;
        }

        if (position != null && (!isNaN(position.endX) || !isNaN(position.endY))) {
            return position;
        }
        const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;

        return {
            startX: rowHeaderWidthAndMarginLeft,
            endX: rowHeaderWidthAndMarginLeft,
            startY: columnHeaderHeightAndMarginTop,
            endY: columnHeaderHeightAndMarginTop,
        };
    }

    private _getFreeze() {
        const config = this._sheetSkeletonManagerService.getCurrent()?.skeleton.getWorksheetConfig();

        if (config == null) {
            return;
        }

        return config.freeze;
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }

    private _refreshFreeze(startRow: number, startColumn: number, ySplit: number, xSplit: number) {
        this._clearFreeze();

        this._createFreeze(FREEZE_DIRECTION_TYPE.ROW);
        this._createFreeze(FREEZE_DIRECTION_TYPE.COLUMN);

        this._updateViewport(startRow, startColumn, ySplit, xSplit);
    }
}
