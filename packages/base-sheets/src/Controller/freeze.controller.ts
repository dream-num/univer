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

import { getCoordByOffset, getSheetObject, ISheetObjectParam } from '../Basics/component-tools';
import { SHEET_COMPONENT_HEADER_LAYER_INDEX } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
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

const FREEZE_SIZE = 4;

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

    private _sheetObject!: ISheetObjectParam;

    private _changeToRow: number = -1;

    private _changeToColumn: number = -1;

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
            return;
        }

        this._sheetObject = sheetObject;

        this._createFreeze(FREEZE_DIRECTION_TYPE.ROW);
        this._createFreeze(FREEZE_DIRECTION_TYPE.COLUMN);
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

        const { freezeRow, freezeColumn } = config;

        const position = this._getPositionByIndex(freezeRow, freezeColumn);

        if (position == null) {
            return;
        }

        const engine = this._sheetObject.engine;
        const canvasMaxWidth = engine?.width || 0;
        const canvasMaxHeight = engine?.height || 0;

        const scene = this._sheetObject.scene;

        const { startX, endX, startY, endY } = position;

        const { rowTotalHeight, columnTotalWidth, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } =
            skeleton;

        const shapeWidth =
            canvasMaxWidth > columnTotalWidth + rowHeaderWidthAndMarginLeft
                ? canvasMaxWidth
                : columnTotalWidth + columnHeaderHeightAndMarginTop;

        const shapeHeight =
            canvasMaxWidth > columnTotalWidth + rowHeaderWidthAndMarginLeft
                ? canvasMaxWidth
                : columnTotalWidth + columnHeaderHeightAndMarginTop;

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
                width: shapeWidth,
                height: FREEZE_SIZE,
                left: 0,
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
            if (freezeColumn === -1 || freezeRow === 0) {
                fill = FREEZE_NORMAL_MAIN_COLOR;
            }

            this._columnFreezeMainRect = new Rect(FREEZE_COLUMN_MAIN_NAME, {
                fill,
                width: FREEZE_SIZE,
                height: shapeHeight,
                left: startX - FREEZE_SIZE,
                top: 0,
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

        const { scene } = this._sheetObject;

        scene.setCursor(CURSOR_TYPE.GRABBING);

        scene.disableEvent();

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                moveEvt.offsetX,
                moveEvt.offsetY,
                scene,
                skeleton
            );

            scene.setCursor(CURSOR_TYPE.GRABBING);

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

            if (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW) {
                if (this._changeToRow === 0 || this._changeToRow === -1) {
                    freezeObjectHeaderRect.transformByState({
                        top: columnHeaderHeightAndMarginTop - FREEZE_SIZE,
                    });

                    freezeObjectMainRect.transformByState({
                        top: columnHeaderHeightAndMarginTop - FREEZE_SIZE,
                    });
                }

                alert(`moveColumnTo: ${this._changeToRow}`);
            } else {
                if (this._changeToColumn === 0 || this._changeToColumn === -1) {
                    freezeObjectHeaderRect.transformByState({
                        left: rowHeaderWidthAndMarginLeft - FREEZE_SIZE,
                    });

                    freezeObjectMainRect.transformByState({
                        left: rowHeaderWidthAndMarginLeft - FREEZE_SIZE,
                    });
                }

                alert(`moveColumnTo: ${this._changeToColumn}`);
            }
        });
    }

    private _clearObserverEvent() {
        const { scene } = this._sheetObject;
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

        const sheetObject = this._sheetObject;

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
        const { scaleX, scaleY } = this._sheetObject.scene.getAncestorScale();

        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        const position = skeleton?.getNoMergeCellPositionByIndex(row, column, scaleX, scaleY);
        if (skeleton == null) {
            return;
        }

        if (position != null && !isNaN(position.endX)) {
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

        return {
            freezeRow: config.freezeRow,
            freezeColumn: config.freezeColumn,
        };
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
