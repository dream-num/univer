import {
    CURSOR_TYPE,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ISelectionTransformerShapeManager,
    Rect,
} from '@univerjs/base-render';
import { Disposable, ICurrentUniverService, LifecycleStages, Nullable, Observer, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getCoordByOffset, getSheetObject } from '../Basics/component-tools';
import { SHEET_COMPONENT_HEADER_LAYER_INDEX } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { HEADER_MENU_SHAPE_TYPE, HeaderMenuShape } from '../View/header-menu-shape';

const HEADER_MENU_CONTROLLER_SHAPE = '__SpreadsheetHeaderMenuSHAPEControllerShape__';

const HEADER_MENU_CONTROLLER_MENU = '__SpreadsheetHeaderMenuMAINControllerShape__';

const HEADER_MENU_CONTROLLER_SHAPE_COLOR = 'rgba(0, 0, 0, 0.1)';

enum HEADER_HOVER_TYPE {
    ROW,
    COLUMN,
}

/**
 * header highlight
 * column menu: show, hover and mousedown event
 */
@OnLifecycle(LifecycleStages.Rendered, HeaderMenuController)
export class HeaderMenuController extends Disposable {
    private _hoverRect: Nullable<Rect>;

    private _hoverMenu: Nullable<HeaderMenuShape>;

    private _currentColumn: number = Infinity;

    private _observers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionTransformerShapeManager
        @Inject(SelectionManagerService)
        private readonly _selectionManagerService: SelectionManagerService
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

        this._observers.forEach((observer) => {
            spreadsheetRowHeader.onPointerEnterObserver.remove(observer);
            spreadsheetRowHeader.onPointerMoveObserver.remove(observer);
            spreadsheetRowHeader.onPointerLeaveObserver.remove(observer);
            spreadsheetColumnHeader.onPointerEnterObserver.remove(observer);
            spreadsheetColumnHeader.onPointerMoveObserver.remove(observer);
            spreadsheetColumnHeader.onPointerLeaveObserver.remove(observer);
        });
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

        this._initialHover(HEADER_HOVER_TYPE.ROW);

        this._initialHover(HEADER_HOVER_TYPE.COLUMN);

        this._initialHoverMenu();
    }

    private _initialHover(initialType: HEADER_HOVER_TYPE = HEADER_HOVER_TYPE.ROW) {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { spreadsheetColumnHeader, spreadsheetRowHeader, scene } = sheetObject;

        const eventBindingObject =
            initialType === HEADER_HOVER_TYPE.ROW ? spreadsheetRowHeader : spreadsheetColumnHeader;

        this._observers.push(
            eventBindingObject?.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                this._hoverRect?.show();
            })
        );

        this._observers.push(
            eventBindingObject?.onPointerMoveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null) {
                    return;
                }

                const sheetObject = this._getSheetObject();
                if (sheetObject == null) {
                    return;
                }

                const { rowHeaderWidth, columnHeaderHeight } = skeleton;

                const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                    evt.offsetX,
                    evt.offsetY,
                    sheetObject.scene,
                    skeleton
                );

                if (initialType === HEADER_HOVER_TYPE.ROW) {
                    this._hoverRect?.transformByState({
                        width: rowHeaderWidth,
                        height: endY - startY,
                        left: 0,
                        top: startY,
                    });
                } else {
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
            })
        );

        this._observers.push(
            eventBindingObject?.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                this._hoverRect?.hide();
                this._hoverMenu?.hide();
            })
        );
    }

    private _initialHoverMenu() {
        // const { scene, spreadsheet, spreadsheetColumnHeader } = sheetObject;
        if (this._hoverMenu == null) {
            return;
        }
        this._hoverMenu.onPointerEnterObserver.add(() => {
            if (this._hoverMenu == null) {
                return;
            }

            const sheetObject = this._getSheetObject();
            if (sheetObject == null) {
                return;
            }

            this._hoverMenu.setProps({
                mode: HEADER_MENU_SHAPE_TYPE.HIGHLIGHT,
                visible: true,
            });

            sheetObject.scene.setCursor(CURSOR_TYPE.POINTER);
        });

        this._hoverMenu.onPointerLeaveObserver.add(() => {
            if (this._hoverMenu == null) {
                return;
            }

            const sheetObject = this._getSheetObject();
            if (sheetObject == null) {
                return;
            }

            this._hoverMenu.setProps({
                mode: HEADER_MENU_SHAPE_TYPE.NORMAL,
                visible: false,
            });

            sheetObject.scene.resetCursor();
        });

        this._hoverMenu.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const sheetObject = this._getSheetObject();
            if (sheetObject == null) {
                return;
            }

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
                sheetObject.spreadsheetColumnHeader.onPointerDownObserver.notifyObservers(evt);
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
