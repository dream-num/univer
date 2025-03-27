/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Nullable, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, SpreadsheetColumnHeader, SpreadsheetHeader } from '@univerjs/engine-render';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import {
    Disposable,
    ICommandService,
    Inject,
    RANGE_TYPE,
} from '@univerjs/core';
import { CURSOR_TYPE, Rect } from '@univerjs/engine-render';
import { SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { ContextMenuPosition, IContextMenuService } from '@univerjs/ui';
import { Subscription } from 'rxjs';

import { SHEET_COMPONENT_HEADER_LAYER_INDEX, SHEET_VIEW_KEY } from '../../common/keys';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { HEADER_MENU_SHAPE_TYPE, HeaderMenuShape } from '../../views/header-menu-shape';
import { getCoordByOffset } from '../utils/component-tools';

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
export class HeaderMenuRenderController extends Disposable implements IRenderModule {
    private _hoverRect: Nullable<Rect>;

    private _hoverMenu: Nullable<HeaderMenuShape>;

    private _currentColumn: number = Number.POSITIVE_INFINITY;

    // private _rowHeaderPointerMoveSub: Subscription;
    // private _colHeaderPointerMoveSub: Subscription;
    // private _rowHeaderPointerLeaveSub: Subscription;
    // private _colHeaderPointerLeaveSub: Subscription;
    // private _rowHeaderPointerEnterSub: Subscription;
    // private _colHeaderPointerEnterSub: Subscription;
    private _headerPointerSubs: Nullable<Subscription>;
    private _colHeaderPointerSubs: Nullable<Subscription>;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._hoverRect?.dispose();
        this._hoverMenu?.dispose();

        // const spreadsheetColumnHeader = this._context.components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        // const spreadsheetRowHeader = this._context.components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;

        // [...this._headerPointerSubs, ...this._colHeaderPointerSubs].forEach((s) => {
            // s.unsubscribe();
            // spreadsheetRowHeader.onPointerEnterObserver.remove(observer);
            // spreadsheetRowHeader.onPointerMoveObserver.remove(observer);
            // spreadsheetRowHeader.onPointerLeaveObserver.remove(observer);
            // spreadsheetColumnHeader.onPointerEnterObserver.remove(observer);
            // spreadsheetColumnHeader.onPointerMoveObserver.remove(observer);
            // spreadsheetColumnHeader.onPointerLeaveObserver.remove(observer);
        // });
        this._headerPointerSubs?.unsubscribe();
        this._headerPointerSubs = null;
    }

    private _initialize() {
        const scene = this._context.scene;

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

    // eslint-disable-next-line max-lines-per-function
    private _initialHover(initialType: HEADER_HOVER_TYPE = HEADER_HOVER_TYPE.ROW) {
        const spreadsheetColumnHeader = this._context.components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        const spreadsheetRowHeader = this._context.components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;

        const eventBindingObject =
            initialType === HEADER_HOVER_TYPE.ROW ? spreadsheetRowHeader : spreadsheetColumnHeader;

        const pointerMoveHandler = (evt: IPointerEvent | IMouseEvent) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
            if (skeleton == null) {
                return;
            }

            const { rowHeaderWidth, columnHeaderHeight } = skeleton;

            const { startX, startY, endX, endY, column } = getCoordByOffset(
                evt.offsetX,
                evt.offsetY,
                this._context.scene,
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
        };

        const pointerEnterHandler = () => {
            this._hoverRect?.show();
        };

        const pointerLeaveHandler = () => {
            this._hoverRect?.hide();
            this._hoverMenu?.hide();
        };

        this._headerPointerSubs = new Subscription();
        const headerPointerMoveSub = eventBindingObject.onPointerMove$.subscribeEvent(pointerMoveHandler);
        const headerPointerEnterSub = eventBindingObject.onPointerEnter$.subscribeEvent(pointerEnterHandler);
        const headerPointerLeaveSub = eventBindingObject.onPointerLeave$.subscribeEvent(pointerLeaveHandler);
        this._headerPointerSubs?.add(headerPointerMoveSub);
        this._headerPointerSubs?.add(headerPointerEnterSub);
        this._headerPointerSubs?.add(headerPointerLeaveSub);
        // this._observers.push(
        //     eventBindingObject?.onPointerEnter$.subscribeEvent(() => {
        //     })
        // );
        // this._observers.push(
        // eventBindingObject?.onPointerMoveObserver.add(
        // );

        // this._observers.push(
        // eventBindingObject?.onPointerLeave$.subscribeEvent(})
        // );
    }

    private _initialHoverMenu() {
        // const { scene, spreadsheet, spreadsheetColumnHeader } = sheetObject;
        if (this._hoverMenu == null) {
            return;
        }
        this._hoverMenu.onPointerEnter$.subscribeEvent(() => {
            if (this._hoverMenu == null) {
                return;
            }

            this._hoverMenu.setProps({
                mode: HEADER_MENU_SHAPE_TYPE.HIGHLIGHT,
                visible: true,
            });

            this._context.scene.setCursor(CURSOR_TYPE.POINTER);
        });

        this._hoverMenu.onPointerLeave$.subscribeEvent(() => {
            if (this._hoverMenu == null) {
                return;
            }

            this._hoverMenu.setProps({
                mode: HEADER_MENU_SHAPE_TYPE.NORMAL,
                visible: false,
            });

            this._context.scene.resetCursor();
        });

        this._hoverMenu.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            const currentColumn = this._currentColumn;
            const currentSelectionDatas = this._selectionManagerService.getCurrentSelections()?.map((s) => s.range);
            const menuInSelections: boolean = !!currentSelectionDatas
                ?.filter((range) => range.rangeType === RANGE_TYPE.COLUMN)
                .find((data) => {
                    const { startColumn, endColumn } = data;
                    if (currentColumn >= startColumn && currentColumn <= endColumn) {
                        return true;
                    }
                    return false;
                });

            if (!menuInSelections) {
                // Fix #1089
                // Here we just change the selection here without any other operations.
                const selection = this._getSelectionOnColumn(currentColumn);
                this._commandService.syncExecuteCommand(SetSelectionsOperation.id, selection);
            }

            evt.stopPropagation();
            evt.preventDefault();
            this._contextMenuService.triggerContextMenu(evt, ContextMenuPosition.COL_HEADER);
        });
    }

    private _getSelectionOnColumn(column: number): ISetSelectionsOperationParams {
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            throw new Error('No active worksheet');
        }

        return {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),

            selections: [
                {
                    range: {
                        startRow: 0,
                        startColumn: column,
                        endRow: worksheet.getRowCount() - 1,
                        endColumn: column,
                        rangeType: RANGE_TYPE.COLUMN,
                    },
                    primary: {
                        startRow: 0,
                        startColumn: column,
                        endRow: 0,
                        endColumn: column,
                        actualRow: 0,
                        actualColumn: column,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ],
        };
    }
}
