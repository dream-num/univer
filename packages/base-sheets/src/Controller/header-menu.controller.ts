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
import { HEADER_MENU_SHAPE_TYPE, HeaderMenuShape } from '../View/header-menu-shape';

const HEADER_MENU_CONTROLLER_SHAPE = '__SpreadsheetHeaderMenuSHAPEControllerShape__';

const HEADER_MENU_CONTROLLER_MENU = '__SpreadsheetHeaderMenuMAINControllerShape__';

const HEADER_MENU_CONTROLLER_SHAPE_COLOR = 'rgba(0, 0, 0, 0.1)';

/**
 * header highlight
 * column menu: show, hover and mousedown event
 */
@OnLifecycle(LifecycleStages.Rendered, HeaderMenuController)
export class HeaderMenuController extends Disposable {
    private _hoverRect: Nullable<Rect>;

    private _hoverMenu: Nullable<HeaderMenuShape>;

    private _currentColumn: number = Infinity;

    private _rowEnterObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _rowMoveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _rowLeaveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _columnEnterObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _columnMoveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _columnLeaveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

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
        this._hoverRect?.dispose();
        this._hoverMenu?.dispose();

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { spreadsheetRowHeader, spreadsheetColumnHeader } = sheetObject;

        spreadsheetRowHeader.onPointerEnterObserver.remove(this._rowEnterObserver);
        spreadsheetRowHeader.onPointerMoveObserver.remove(this._rowMoveObserver);
        spreadsheetRowHeader.onPointerLeaveObserver.remove(this._rowLeaveObserver);

        spreadsheetColumnHeader.onPointerEnterObserver.remove(this._columnEnterObserver);
        spreadsheetColumnHeader.onPointerMoveObserver.remove(this._columnMoveObserver);
        spreadsheetColumnHeader.onPointerLeaveObserver.remove(this._columnLeaveObserver);
    }

    private _initialize() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { scene } = sheetObject;

        this._hoverRect = new Rect(HEADER_MENU_CONTROLLER_SHAPE, {
            fill: HEADER_MENU_CONTROLLER_SHAPE_COLOR,
            evented: false,
        });

        this._hoverMenu = new HeaderMenuShape(HEADER_MENU_CONTROLLER_MENU, { zIndex: 100, visible: false });

        scene.addObjects([this._hoverRect, this._hoverMenu], SHEET_COMPONENT_HEADER_LAYER_INDEX);

        this._initialRowHover(sheetObject);

        this._initialColumnHover(sheetObject);

        this._initialHoverMenu(sheetObject);
    }

    private _initialRowHover(sheetObject: ISheetObjectParam) {
        const { spreadsheetRowHeader, scene } = sheetObject;

        this._rowEnterObserver = spreadsheetRowHeader?.onPointerEnterObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                this._hoverRect?.show();
            }
        );

        this._rowMoveObserver = spreadsheetRowHeader?.onPointerMoveObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null) {
                    return;
                }

                const { rowHeaderWidth, columnHeaderHeight } = skeleton;

                const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                    evt.offsetX,
                    evt.offsetY,
                    scene,
                    skeleton
                );

                this._hoverRect?.transformByState({
                    width: rowHeaderWidth,
                    height: endY - startY,
                    left: 0,
                    top: startY,
                });
            }
        );

        this._rowLeaveObserver = spreadsheetRowHeader?.onPointerLeaveObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                this._hoverRect?.hide();
            }
        );
    }

    private _initialColumnHover(sheetObject: ISheetObjectParam) {
        const { spreadsheetColumnHeader, scene } = sheetObject;

        this._columnEnterObserver = spreadsheetColumnHeader?.onPointerEnterObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                this._hoverRect?.show();
            }
        );

        this._columnMoveObserver = spreadsheetColumnHeader?.onPointerMoveObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null) {
                    return;
                }

                const { rowHeaderWidth, columnHeaderHeight } = skeleton;

                const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                    evt.offsetX,
                    evt.offsetY,
                    scene,
                    skeleton
                );

                this._currentColumn = column;

                this._hoverRect?.transformByState({
                    width: endX - startX,
                    height: columnHeaderHeight,
                    left: startX,
                    top: 0,
                });

                if (this._hoverMenu == null) {
                    return;
                }

                if (endX - startX < columnHeaderHeight * 2) {
                    this._hoverMenu.hide();
                    return;
                }

                const menuSize = columnHeaderHeight * 0.8;

                this._hoverMenu.transformByState({
                    left: endX - columnHeaderHeight,
                    top: columnHeaderHeight / 2 - menuSize / 2,
                });

                this._hoverMenu.setShapeProps({ size: menuSize });

                this._hoverMenu.show();
            }
        );

        this._columnLeaveObserver = spreadsheetColumnHeader?.onPointerLeaveObserver.add(
            (evt: IPointerEvent | IMouseEvent, state) => {
                this._hoverRect?.hide();
                this._hoverMenu?.hide();
            }
        );
    }

    private _initialHoverMenu(sheetObject: ISheetObjectParam) {
        const { scene, spreadsheet, spreadsheetColumnHeader } = sheetObject;
        if (this._hoverMenu == null) {
            return;
        }
        this._hoverMenu.onPointerEnterObserver.add(() => {
            if (this._hoverMenu == null) {
                return;
            }
            this._hoverMenu.setProps({
                mode: HEADER_MENU_SHAPE_TYPE.HIGHLIGHT,
                visible: true,
            });

            scene.setCursor(CURSOR_TYPE.POINTER);
        });

        this._hoverMenu.onPointerLeaveObserver.add(() => {
            if (this._hoverMenu == null) {
                return;
            }
            this._hoverMenu.setProps({
                mode: HEADER_MENU_SHAPE_TYPE.NORMAL,
                visible: false,
            });

            scene.resetCursor();
        });

        this._hoverMenu.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            // this._selectionTransformerShapeManager.eventTrigger(
            //     evt,
            //     (spreadsheet?.zIndex || 1) + 1,
            //     SELECTION_TYPE.COLUMN
            // );

            const currentColumn = this._currentColumn;

            const currentSelectionDatas = this._selectionManagerService.getRangeDatas();

            const selectedSelection = currentSelectionDatas?.find((data) => {
                const { startRow, startColumn, endRow, endColumn } = data;
                if (currentColumn >= startColumn && startColumn <= endColumn) {
                    return true;
                }
                return false;
            });

            if (selectedSelection == null) {
                spreadsheetColumnHeader.onPointerDownObserver.notifyObservers(evt);
            } else {
                console.log(
                    `hoverMenu, column${this._currentColumn}, range:${selectedSelection.startColumn}: ${selectedSelection.endColumn}`
                );
            }
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
