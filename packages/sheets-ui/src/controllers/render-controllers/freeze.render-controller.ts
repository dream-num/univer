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

import type { ICommandInfo, IFreeze, IRange, IWorksheetData, Nullable, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, Viewport } from '@univerjs/engine-render';
import type {
    IInsertColCommandParams,
    IInsertRowCommandParams,
    IMoveColsCommandParams,
    IMoveRowsCommandParams,
    IRemoveRowColCommandParams,
    ISetColHiddenMutationParams,
    ISetFrozenMutationParams,
    ISetRowHiddenMutationParams,
    ISetWorksheetColWidthMutationParams,
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowHeightMutationParams,
} from '@univerjs/sheets';
import type { Theme } from '@univerjs/themes';
import type { IViewportScrollState } from '../../services/scroll-manager.service';
import {
    ColorKit,
    createInterceptorKey,
    Direction,
    Disposable,
    get,
    ICommandService,
    Inject,
    Injector,
    InterceptorManager,
    RANGE_TYPE,
    ThemeService,
    toDisposable,
} from '@univerjs/core';

import { CURSOR_TYPE, Rect, SHEET_VIEWPORT_KEY, TRANSFORM_CHANGE_OBSERVABLE_TYPE, Vector2 } from '@univerjs/engine-render';
import {
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    MoveColsCommand,
    MoveRowsCommand,
    RemoveColCommand,
    RemoveRowCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetFrozenCommand,
    SetFrozenMutation,
    SetFrozenMutationFactory,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { Subscription } from 'rxjs';
import { SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand } from '../../commands/commands/headersize-changed.command';

import { ScrollCommand } from '../../commands/commands/set-scroll.command';
import { SetZoomRatioOperation } from '../../commands/operations/set-zoom-ratio.operation';
import { SHEET_COMPONENT_HEADER_LAYER_INDEX } from '../../common/keys';
import { SheetScrollManagerService } from '../../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { getCoordByOffset, getSheetObject } from '../utils/component-tools';

enum FREEZE_DIRECTION_TYPE {
    ROW,
    COLUMN,
}

enum ResetScrollType {
    NONE = 0,
    X = 1,
    Y = 2,
    ALL = 3,
}

export const FREEZE_ROW_MAIN_NAME = '__SpreadsheetFreezeRowMainName__';

export const FREEZE_ROW_HEADER_NAME = '__SpreadsheetFreezeRowHeaderName__';

export const FREEZE_COLUMN_MAIN_NAME = '__SpreadsheetFreezeColumnMainName__';

export const FREEZE_COLUMN_HEADER_NAME = '__SpreadsheetFreezeColumnHeaderName__';

const FREEZE_SIZE_NORMAL = 2;

const AUXILIARY_CLICK_HIDDEN_OBJECT_TRANSPARENCY = 0.01;

export const FREEZE_PERMISSION_CHECK = createInterceptorKey<boolean, null>('freezePermissionCheck');

export class HeaderFreezeRenderController extends Disposable implements IRenderModule {
    private _rowFreezeHeaderRect: Nullable<Rect>;

    private _rowFreezeMainRect: Nullable<Rect>;

    private _columnFreezeHeaderRect: Nullable<Rect>;

    private _columnFreezeMainRect: Nullable<Rect>;

    private _freezeDownSubs: Nullable<Subscription>;

    private _freezePointerEnterSubs: Nullable<Subscription>;

    private _freezePointerLeaveSubs: Nullable<Subscription>;

    private _scenePointerMoveSub: Nullable<Subscription>;

    private _scenePointerUpSub: Nullable<Subscription>;

    private _changeToRow: number = -1;

    private _changeToColumn: number = -1;

    private _changeToOffsetX: number = 0;

    private _changeToOffsetY: number = 0;

    private _activeViewport: Nullable<Viewport> = null;

    private _freezeNormalHeaderColor = '';

    private _freezeNormalMainColor = '';

    private _freezeActiveColor = '';

    private _freezeHoverColor = '';

    private _lastFreeze: IFreeze | undefined = undefined;

    public interceptor = new InterceptorManager({ FREEZE_PERMISSION_CHECK });

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        // @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        // @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(SheetScrollManagerService) private readonly _scrollManagerService: SheetScrollManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(Injector) private _injector: Injector
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        // const sheetObject = this._getSheetObject();
        // if (sheetObject == null) {
        //     return;
        // }

        // this._sheetObject = sheetObject;

        // this._createFreeze(FREEZE_DIRECTION_TYPE.ROW);
        // this._createFreeze(FREEZE_DIRECTION_TYPE.COLUMN);

        this._skeletonListener();

        this._commandExecutedListener();

        this._themeChangeListener();

        this._interceptorCommands();

        this._bindViewportScroll();

        this._zoomRefresh();
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _createFreeze(
        freezeDirectionType: FREEZE_DIRECTION_TYPE = FREEZE_DIRECTION_TYPE.ROW,
        freezeConfig?: IFreeze
    ) {
        const config = freezeConfig ?? this._getFreeze();
        if (config == null) return null;

        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;

        const { startRow: freezeRow, startColumn: freezeColumn } = config;
        const position = this._getPositionByIndex(freezeRow, freezeColumn);
        if (position == null || skeleton == null) return null;

        const sheetObject = this._getSheetObject()!;
        const engine = sheetObject.engine;
        const canvasMaxWidth = engine?.width || 0;
        const canvasMaxHeight = engine?.height || 0;
        const scene = sheetObject.scene;
        const { startX, startY } = position;
        const { rowTotalHeight, columnTotalWidth, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;

        const contentWidth = canvasMaxWidth > columnTotalWidth + rowHeaderWidthAndMarginLeft
            ? canvasMaxWidth
            : columnTotalWidth + columnHeaderHeightAndMarginTop;

        const contentHeight = canvasMaxHeight > rowTotalHeight + columnHeaderHeightAndMarginTop
            ? canvasMaxHeight
            : rowTotalHeight + columnHeaderHeightAndMarginTop;

        this._changeToRow = freezeRow;
        this._changeToColumn = freezeColumn;
        this._changeToOffsetX = startX;
        this._changeToOffsetY = startY;

        const scale = Math.max(scene.scaleX, scene.scaleY);

        let freezeSize = FREEZE_SIZE_NORMAL / Math.max(1, scale);

        if (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW) {
            if (freezeRow === -1 || freezeRow === 0) {
                freezeSize = freezeSize * 2;
            }

            const freezeOffset = freezeSize;

            this._rowFreezeHeaderRect = new Rect(FREEZE_ROW_HEADER_NAME, {
                fill: this._freezeNormalHeaderColor,
                width: rowHeaderWidthAndMarginLeft,
                height: freezeSize,
                left: 0,
                top: startY - freezeOffset,
                zIndex: 3,
            });

            let fill = this._freezeNormalHeaderColor;
            if (freezeRow === -1 || freezeRow === 0) {
                fill = this._freezeNormalMainColor;
            }

            this._rowFreezeMainRect = new Rect(FREEZE_ROW_MAIN_NAME, {
                fill,
                width: contentWidth * 2 / scale,
                height: freezeSize,
                left: rowHeaderWidthAndMarginLeft,
                top: startY - freezeOffset,
                zIndex: 3,
            });

            scene.addObjects([this._rowFreezeHeaderRect, this._rowFreezeMainRect], SHEET_COMPONENT_HEADER_LAYER_INDEX);
        } else {
            if (freezeColumn === -1 || freezeColumn === 0) {
                freezeSize = freezeSize * 2;
            }

            const FREEZE_OFFSET = freezeSize;

            this._columnFreezeHeaderRect = new Rect(FREEZE_COLUMN_HEADER_NAME, {
                fill: this._freezeNormalHeaderColor,
                width: freezeSize,
                height: columnHeaderHeightAndMarginTop,
                left: startX - FREEZE_OFFSET,
                top: 0,
                zIndex: 3,
            });

            let fill = this._freezeNormalHeaderColor;
            if (freezeColumn === -1 || freezeColumn === 0) {
                fill = this._freezeNormalMainColor;
            }

            this._columnFreezeMainRect = new Rect(FREEZE_COLUMN_MAIN_NAME, {
                fill,
                width: freezeSize,
                height: contentHeight * 2 / scale,
                left: startX - FREEZE_OFFSET,
                top: columnHeaderHeightAndMarginTop,
                zIndex: 3,
            });

            scene.addObjects([this._columnFreezeHeaderRect, this._columnFreezeMainRect], SHEET_COMPONENT_HEADER_LAYER_INDEX);
        }

        this._eventBinding(freezeDirectionType);
    }

    // eslint-disable-next-line max-lines-per-function
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

        this._freezePointerEnterSubs = new Subscription();
        this._freezePointerLeaveSubs = new Subscription();
        this._freezeDownSubs = new Subscription();

        if (freezeObjectMainRect) {
            const _freezeObjectMainRectEnterSub = freezeObjectMainRect.onPointerEnter$.subscribeEvent(() => {
                const permissionCheck = this.interceptor.fetchThroughInterceptors(FREEZE_PERMISSION_CHECK)(true, null);
                if (!permissionCheck) {
                    return false;
                }
                freezeObjectHeaderRect?.setProps({
                    fill: this._freezeHoverColor,
                    zIndex: 4,
                });
                scene.setCursor(CURSOR_TYPE.GRAB);
            });
            this._freezePointerEnterSubs.add(_freezeObjectMainRectEnterSub);

            const _freezeObjectMainPointerLeaveSub = freezeObjectMainRect.onPointerLeave$.subscribeEvent(() => {
                freezeObjectHeaderRect?.setProps({
                    fill: this._freezeNormalHeaderColor,
                    zIndex: 3,
                });
                scene.resetCursor();
            });

            this._freezePointerLeaveSubs.add(_freezeObjectMainPointerLeaveSub);
        }

        if (freezeObjectHeaderRect) {
            const _freezeObjHeaderPointerEnterSub = freezeObjectHeaderRect.onPointerEnter$.subscribeEvent(() => {
                const permissionCheck = this.interceptor.fetchThroughInterceptors(FREEZE_PERMISSION_CHECK)(true, null);
                if (!permissionCheck) {
                    return false;
                }
                freezeObjectHeaderRect?.setProps({
                    fill: this._freezeHoverColor,
                    zIndex: 4,
                });
                scene.setCursor(CURSOR_TYPE.GRAB);
            });
            this._freezePointerEnterSubs.add(_freezeObjHeaderPointerEnterSub);

            const _freezeObjHeaderPointerLeaveSub = freezeObjectHeaderRect.onPointerLeave$.subscribeEvent(() => {
                freezeObjectHeaderRect?.setProps({
                    fill: this._freezeNormalHeaderColor,
                    zIndex: 3,
                });
                scene.resetCursor();
            });
            this._freezePointerLeaveSubs.add(_freezeObjHeaderPointerLeaveSub);
        }

        const s1 = freezeObjectHeaderRect?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            this._freezeDown(evt, freezeObjectHeaderRect!, freezeObjectMainRect!, freezeDirectionType);
        });
        if (s1) {
            this._freezeDownSubs.add(s1);
        }

        const s2 = freezeObjectMainRect?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            this._freezeDown(evt, freezeObjectHeaderRect!, freezeObjectMainRect!, freezeDirectionType);
        });
        if (s2) {
            this._freezeDownSubs.add(s2);
        }
        // this._freezeMoveObservers.push(
        //     freezeObjectMainRect?.onPointerEnter$.subscribeEvent(() => {
        //         const permissionCheck = this.interceptor.fetchThroughInterceptors(FREEZE_PERMISSION_CHECK)(null, null);
        //         if (!permissionCheck) {
        //             return false;
        //         }
        //         freezeObjectHeaderRect?.setProps({
        //             fill: this._freezeHoverColor,
        //             zIndex: 4,
        //         });
        //         scene.setCursor(CURSOR_TYPE.GRAB);
        //     })
        // );
        // this._freezeLeaveObservers.push(
        //     freezeObjectMainRect?.onPointerLeave$.subscribeEvent(() => {
        //         freezeObjectHeaderRect?.setProps({
        //             fill: this._freezeNormalHeaderColor,
        //             zIndex: 3,
        //         });
        //         scene.resetCursor();
        //     })
        // );
    }

    // eslint-disable-next-line complexity
    private _getCurrentLastVisible() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        if (skeleton == null) {
            return;
        }
        const scene = sheetObject.scene;

        const scale = Math.max(scene.scaleX, scene.scaleY);
        const currentScroll = this._scrollManagerService.getCurrentScrollState();

        const skeletonViewHeight = (sheetObject.engine.height - skeleton.columnHeaderHeight) / scale;
        const skeletonViewWidth = (sheetObject.engine.width - skeleton.rowHeaderWidth) / scale;
        const startRow = currentScroll?.sheetViewStartRow ?? 0;
        const startHeight = startRow === 0
            ? -(currentScroll?.offsetY ?? 0)
            : skeleton.rowHeightAccumulation[startRow - 1] - (currentScroll?.offsetY ?? 0);

        let lastRow = 0;
        let hadFind = false;
        for (let i = startRow, len = skeleton.rowHeightAccumulation.length; i < len; i++) {
            const height = skeleton.rowHeightAccumulation[i];
            if (height - startHeight > skeletonViewHeight) {
                lastRow = i;
                hadFind = true;
                break;
            }
        }

        // row total height smaller than canvas height
        if (!hadFind) {
            lastRow = skeleton.rowHeightAccumulation.length - 1;
        }

        const startColumn = currentScroll?.sheetViewStartColumn ?? 0;
        const startWidth = startColumn === 0
            ? -(currentScroll?.offsetX ?? 0)
            : skeleton.columnWidthAccumulation[startColumn - 1] - (currentScroll?.offsetX ?? 0);

        let lastColumn = 0;
        let hadFindCol = false;
        for (let i = startColumn, len = skeleton.columnWidthAccumulation.length; i < len; i++) {
            const width = skeleton.columnWidthAccumulation[i];
            if (width - startWidth > skeletonViewWidth) {
                lastColumn = i;
                hadFindCol = true;
                break;
            }
        }

        if (!hadFindCol) {
            lastColumn = skeleton.columnWidthAccumulation.length - 1;
        }

        return { lastRow, lastColumn };
    }

    private _getActiveViewport(evt: IPointerEvent | IMouseEvent) {
        const viewports = this._getSheetObject()?.scene.getViewports();
        if (!viewports) {
            return null;
        }

        return viewports.find((i) => i.isHit(new Vector2(evt.offsetX, evt.offsetY))) || null;
    }

    // eslint-disable-next-line max-lines-per-function
    private _freezeDown(
        evt: IPointerEvent | IMouseEvent,
        freezeObjectHeaderRect: Rect,
        freezeObjectMainRect: Rect,
        freezeDirectionType: FREEZE_DIRECTION_TYPE = FREEZE_DIRECTION_TYPE.ROW
    ) {
        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        if (skeleton == null) {
            return;
        }

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const permissionCheck = this.interceptor.fetchThroughInterceptors(FREEZE_PERMISSION_CHECK)(true, null);
        if (!permissionCheck) {
            return false;
        }

        const { scene } = sheetObject;

        scene.setCursor(CURSOR_TYPE.GRABBING);

        scene.disableObjectsEvent();

        const last = this._getCurrentLastVisible();
        const lastRowY = last === undefined ? Number.POSITIVE_INFINITY : skeleton.rowHeightAccumulation[last.lastRow];
        const lastColumnX = last === undefined ? Number.POSITIVE_INFINITY : skeleton.columnWidthAccumulation[last.lastColumn - 1] + skeleton.rowHeaderWidth;
        this._activeViewport = null;
        const oldFreeze = this._getFreeze();

        if (oldFreeze) {
            this._changeToColumn = oldFreeze.startColumn;
            this._changeToRow = oldFreeze.startRow;
        }
        this._scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
            const activeViewport = this._getActiveViewport(moveEvt);

            const { startX, startY, row, column } = getCoordByOffset(
                moveEvt.offsetX,
                moveEvt.offsetY,
                scene,
                skeleton,
                activeViewport || undefined,
                true
            );

            const permissionCheck = this.interceptor.fetchThroughInterceptors(FREEZE_PERMISSION_CHECK)(true, null);
            if (!permissionCheck) {
                return false;
            }

            scene.setCursor(CURSOR_TYPE.GRABBING);

            const FREEZE_SIZE = FREEZE_SIZE_NORMAL / Math.max(scene.scaleX, scene.scaleY);

            if (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW) {
                freezeObjectHeaderRect
                    .transformByState({
                        top: Math.min(startY, lastRowY) - FREEZE_SIZE / 2,
                    })
                    ?.setProps({
                        fill: this._freezeActiveColor,
                    });
                freezeObjectMainRect
                    .transformByState({
                        top: Math.min(startY, lastRowY) - FREEZE_SIZE / 2,
                    })
                    ?.setProps({
                        fill: this._freezeNormalHeaderColor,
                    });
                this._changeToRow = last === undefined ? row : Math.min(row, last.lastRow);
                this._changeToOffsetY = Math.min(startY, lastRowY);
                this._activeViewport = activeViewport;
            } else {
                freezeObjectHeaderRect
                    .transformByState({
                        left: Math.min(startX, lastColumnX) - FREEZE_SIZE / 2,
                    })
                    ?.setProps({
                        fill: this._freezeActiveColor,
                    });
                freezeObjectMainRect
                    .transformByState({
                        left: Math.min(startX, lastColumnX) - FREEZE_SIZE / 2,
                    })
                    ?.setProps({
                        fill: this._freezeNormalHeaderColor,
                    });

                this._changeToColumn = last === undefined ? column : Math.min(column, last.lastColumn);
                this._changeToOffsetX = startX;
                this._activeViewport = activeViewport;
            }

            // this._columnMoving(newMoveOffsetX, newMoveOffsetY, matchSelectionData, initialType);
        });

        // eslint-disable-next-line max-lines-per-function, complexity
        this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent(() => {
            scene.resetCursor();
            scene.enableObjectsEvent();
            this._clearObserverEvent();

            const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;

            if (
                (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW &&
                    (this._changeToRow === 0 || this._changeToRow === -1)) ||
                (freezeDirectionType === FREEZE_DIRECTION_TYPE.COLUMN &&
                    (this._changeToColumn === 0 || this._changeToColumn === -1))
            ) {
                freezeObjectHeaderRect.setProps({
                    fill: this._freezeNormalHeaderColor,
                });
                freezeObjectMainRect.setProps({
                    fill: this._freezeNormalMainColor,
                });
            } else {
                freezeObjectHeaderRect?.setProps({
                    fill: this._freezeNormalHeaderColor,
                });
                freezeObjectMainRect?.setProps({
                    fill: this._freezeNormalHeaderColor,
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

            const sheetViewScroll = this._scrollManagerService.getCurrentScrollState() || {
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

            const workbook = this._context.unit;
            const worksheet = workbook.getActiveSheet();
            if (!worksheet) return;

            const oldFreeze = worksheet.getConfig()?.freeze;
            let xSplit = oldFreeze?.xSplit || 0;
            let ySplit = oldFreeze?.ySplit || 0;
            const viewPortKey = this._activeViewport?.viewportKey;
            if (freezeDirectionType === FREEZE_DIRECTION_TYPE.ROW) {
                if (
                    !viewPortKey ||
                    viewPortKey === SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP ||
                    viewPortKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP ||
                    viewPortKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP ||
                    viewPortKey === SHEET_VIEWPORT_KEY.VIEW_ROW_TOP
                ) {
                    ySplit = this._changeToRow - (oldFreeze.startRow - oldFreeze.ySplit);
                } else {
                    // main viewport
                    ySplit = this._changeToRow - sheetViewStartRow;
                }

                ySplit = ySplit < 0 ? 0 : ySplit;
            }
            if (freezeDirectionType === FREEZE_DIRECTION_TYPE.COLUMN) {
                if (
                    !viewPortKey ||
                    viewPortKey === SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP ||
                    viewPortKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP ||
                    viewPortKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT ||
                    viewPortKey === SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT
                ) {
                    xSplit = this._changeToColumn - (oldFreeze.startColumn - oldFreeze.xSplit);
                } else {
                    xSplit = this._changeToColumn - sheetViewStartColumn;
                }

                xSplit = xSplit < 0 ? 0 : xSplit;
            }

            this._commandService.executeCommand(SetFrozenCommand.id, {
                startRow: ySplit === 0 ? -1 : this._changeToRow,
                startColumn: xSplit === 0 ? -1 : this._changeToColumn,
                ySplit,
                xSplit,
                unitId: workbook.getUnitId(),
                subUnitId: worksheet.getSheetId(),
            });
        });
    }

    private _getViewports() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        const { scene } = sheetObject;

        const viewColumnLeft = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT);
        const viewColumnRight = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT);

        // row header
        const viewRowTop = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP);
        const viewRowBottom = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM);

        const viewLeftTop = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP);

        // skeleton
        const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        const viewMainLeftTop = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP);
        const viewMainLeft = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT);
        const viewMainTop = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP);

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

        return {
            viewMain,
            viewMainLeftTop,
            viewMainLeft,
            viewMainTop,
            viewColumnLeft,
            viewColumnRight,
            viewRowTop,
            viewRowBottom,
            viewLeftTop,
        };
    }

    private _bindViewportScroll() {
        // column header
        const viewports = this._getViewports();
        if (!viewports) {
            return;
        }

        const { viewRowBottom, viewColumnRight, viewMainLeft, viewMainTop } = viewports;

        this.disposeWithMe(
            this._scrollManagerService.validViewportScrollInfo$.subscribe((param: Nullable<IViewportScrollState>) => {
                if (!param) return;

                const { scrollX, scrollY, viewportScrollX, viewportScrollY } = param;

                if (viewRowBottom.isActive) {
                    viewRowBottom
                        .updateScrollVal({
                            scrollY,
                            viewportScrollY,
                        });
                }

                if (viewColumnRight.isActive) {
                    viewColumnRight
                        .updateScrollVal({
                            scrollX,
                            viewportScrollX,
                        });
                }
                if (viewMainLeft.isActive) {
                    viewMainLeft
                        .updateScrollVal({
                            scrollY,
                            viewportScrollY,
                        });
                }

                if (viewMainTop.isActive) {
                    viewMainTop
                        .updateScrollVal({
                            scrollX,
                            viewportScrollX,
                        });
                }
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _updateViewport(
        row: number = -1,
        column: number = -1,
        ySplit: number = 0,
        xSplit: number = 0,
        resetScroll = ResetScrollType.ALL
    ) {
        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        if (skeleton == null) {
            return;
        }

        const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;

        const viewports = this._getViewports();
        if (!viewports) {
            return;
        }

        const {
            viewMain,
            viewMainLeftTop,
            viewMainLeft,
            viewMainTop,
            viewColumnLeft,
            viewColumnRight,
            viewRowTop,
            viewRowBottom,
            viewLeftTop,
        } = viewports;

        viewColumnRight.resizeWhenFreezeChange({
            left: rowHeaderWidthAndMarginLeft,
            top: 0,
            // ctx.clip by the size of viewport, and selection header border is slightly below column header
            // I think it's a bad design, Should not clip for selection rendering in viewport,
            height: columnHeaderHeightAndMarginTop + 1,
            right: 0,
        });

        viewRowBottom.resizeWhenFreezeChange({
            left: 0,
            top: columnHeaderHeightAndMarginTop,
            bottom: 0,
            width: rowHeaderWidthAndMarginLeft + 1,
        });

        viewLeftTop.resizeWhenFreezeChange({
            left: 0,
            top: 0,
            width: rowHeaderWidthAndMarginLeft + 1,
            height: columnHeaderHeightAndMarginTop,
        });

        let isTopView = true;

        let isLeftView = true;

        viewMainLeftTop.enable();

        if (row === -1 || row === 0) {
            isTopView = false;
        }

        if (column === -1 || column === 0) {
            isLeftView = false;
        }

        // freeze start
        const startSheetView = skeleton.getNoMergeCellWithCoordByIndex(row - ySplit, column - xSplit, false);
        // freeze end
        const endSheetView = skeleton.getNoMergeCellWithCoordByIndex(row, column, false);

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

        // cancel freeze
        if (isTopView === false && isLeftView === false) {
            viewMain.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                bottom: 0,
                right: 0,
            });
            viewMain.resetPadding();
            viewMainLeft.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                bottom: 0,
                width: 0,
            });
            viewMainTop.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                height: 0,
                right: 0,
            });
            viewMainLeftTop.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                width: 0,
                height: 0,
            });
            viewRowTop.resizeWhenFreezeChange({
                left: 0,
                top: columnHeaderHeightAndMarginTop,
                width: rowHeaderWidthAndMarginLeft + 1,
                height: 0,
            });
            viewColumnLeft.resizeWhenFreezeChange({
                left: 0,
                top: 0,
                height: columnHeaderHeightAndMarginTop + 1,
                width: 0,
            });
        } else if (isTopView === true && isLeftView === false) {
            // freeze row
            const topGap = endSheetView.startY - startSheetView.startY;
            viewMain.resizeWhenFreezeChange({
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

            if (resetScroll & ResetScrollType.Y) {
                this._commandService.executeCommand(ScrollCommand.id, {
                    sheetViewStartRow: 0,
                    offsetY: 0,
                });
            }

            viewMainTop.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                height: topGap,
                right: 0,
            });
            viewMainTop
                .updateScrollVal({
                    viewportScrollY: startSheetView.startY,
                    rawScrollX: viewMain.scrollX,
                    viewportScrollX: viewMain.viewportScrollX,
                });
            viewRowTop.resizeWhenFreezeChange({
                left: 0,
                top: columnHeaderHeightAndMarginTop,
                width: rowHeaderWidthAndMarginLeft + 1,
                height: topGap,
            });
            viewRowTop
                .updateScrollVal({
                    viewportScrollY: startSheetView.startY,
                });
            viewRowBottom.resizeWhenFreezeChange({
                left: 0,
                top: columnHeaderHeightAndMarginTop + topGap,
                bottom: 0,
                width: rowHeaderWidthAndMarginLeft + 1,
            });

            viewMainTop.enable();
            viewRowTop.enable();
        } else if (isTopView === false && isLeftView === true) {
            // freeze column
            const leftGap = endSheetView.startX - startSheetView.startX;
            viewMain.resizeWhenFreezeChange({
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

            if (resetScroll & ResetScrollType.X) {
                this._commandService.executeCommand(ScrollCommand.id, {
                    sheetViewStartColumn: 0,
                    offsetX: 0,
                });
            }

            viewMainLeft.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                width: leftGap,
                bottom: 0,
                right: 0,
            });
            viewMainLeft
                .updateScrollVal({
                    viewportScrollX: startSheetView.startX,
                    rawScrollY: viewMain.scrollY,
                    viewportScrollY: viewMain.viewportScrollY,
                });
            viewColumnLeft.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: 0,
                width: leftGap,
                height: columnHeaderHeightAndMarginTop + 1,
            });
            viewColumnLeft
                .updateScrollVal({
                    viewportScrollX: startSheetView.startX,
                });
            viewColumnRight.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft + leftGap,
                top: 0,
                height: columnHeaderHeightAndMarginTop + 1,
                right: 0,
            });

            viewMainLeft.enable();
            viewColumnLeft.enable();
        } else {
            const leftGap = endSheetView.startX - startSheetView.startX;
            const topGap = endSheetView.startY - startSheetView.startY;
            viewMain.resizeWhenFreezeChange({
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

            if (resetScroll) {
                this._commandService.executeCommand(ScrollCommand.id, {
                    ...(resetScroll & ResetScrollType.X
                        ? {
                            sheetViewStartColumn: 0,
                            offsetX: 0,
                        }
                        : null),
                    ...(resetScroll & ResetScrollType.Y
                        ? {
                            sheetViewStartRow: 0,
                            offsetY: 0,
                        }
                        : null),
                });
            }

            viewMainLeft.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop + topGap,
                width: leftGap,
                bottom: 0,
            });
            viewMainLeft
                .updateScrollVal({
                    viewportScrollX: startSheetView.startX,
                    rawScrollY: viewMain.scrollY,
                    viewportScrollY: viewMain.viewportScrollY,
                });
            viewMainTop.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft + leftGap,
                top: columnHeaderHeightAndMarginTop,
                height: topGap,
                right: 0,
            });
            viewMainTop
                .updateScrollVal({
                    viewportScrollY: startSheetView.startY,
                    rawScrollX: viewMain.scrollX,
                    viewportScrollX: viewMain.viewportScrollX,
                });
            viewMainLeftTop.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: columnHeaderHeightAndMarginTop,
                width: leftGap,
                height: topGap,
            });

            viewMainLeftTop
                .updateScrollVal({
                    viewportScrollX: startSheetView.startX,
                    viewportScrollY: startSheetView.startY,
                });

            viewRowTop.resizeWhenFreezeChange({
                left: 0,
                top: columnHeaderHeightAndMarginTop,
                width: rowHeaderWidthAndMarginLeft + 1,
                height: topGap,
            });

            viewRowTop
                .updateScrollVal({
                    viewportScrollY: startSheetView.startY,
                });

            viewRowBottom.resizeWhenFreezeChange({
                left: 0,
                top: columnHeaderHeightAndMarginTop + topGap,
                bottom: 0,
                width: rowHeaderWidthAndMarginLeft + 1,
            });

            viewColumnLeft.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft,
                top: 0,
                width: leftGap,
                height: columnHeaderHeightAndMarginTop + 1,
            });

            viewColumnLeft
                .updateScrollVal({
                    viewportScrollX: startSheetView.startX,
                });

            viewColumnRight.resizeWhenFreezeChange({
                left: rowHeaderWidthAndMarginLeft + leftGap,
                top: 0,
                height: columnHeaderHeightAndMarginTop + 1,
                right: 0,
            });

            viewMainLeftTop.enable();
            viewMainTop.enable();
            viewMainLeft.enable();
            viewRowTop.enable();
            viewColumnLeft.enable();

            // viewMain.disable();
            // viewRowBottom.disable();
        }
    }

    /**
     * When switching sheet tabs, it is necessary to update the frozen state of the current view.
     */
    private _skeletonListener() {
        this.disposeWithMe(
            toDisposable(
                this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
                    const allowedCommands = [
                        SetWorksheetActiveOperation.id,
                        InsertRangeMoveDownCommand.id,
                        InsertRangeMoveRightCommand.id,
                    ];

                    if (allowedCommands.includes(param?.commandId || '')) {
                        this._refreshCurrent();
                    }
                })
            )
        );
    }

    private _refreshCurrent() {
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;

        const freeze = worksheet.getConfig().freeze;

        const { startRow = -1, startColumn = -1, ySplit = 0, xSplit = 0 } = freeze;

        this._refreshFreeze(startRow, startColumn, ySplit, xSplit, ResetScrollType.NONE);
    }

    private _themeChangeListener() {
        this._themeChange(this._themeService.getCurrentTheme());
        this.disposeWithMe(
            this._themeService.currentTheme$.subscribe((theme) => {
                this._clearFreeze();
                this._themeChange(theme);
                this._refreshCurrent();
            })
        );
    }

    private _themeChange(theme: Theme) {
        this._freezeNormalHeaderColor = get(theme, 'gray.300');

        this._freezeNormalMainColor = new ColorKit(this._freezeNormalHeaderColor)
            .setAlpha(AUXILIARY_CLICK_HIDDEN_OBJECT_TRANSPARENCY)
            .toRgbString();

        this._freezeActiveColor = get(theme, 'primary.600');

        this._freezeHoverColor = get(theme, 'gray.500');
    }

    // eslint-disable-next-line max-lines-per-function
    private _interceptorCommands() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                // eslint-disable-next-line complexity, max-lines-per-function
                getMutations: (command) => {
                    const empty = {
                        redos: [],
                        undos: [],
                    };

                    const freeze = this._getFreeze();

                    if (!freeze) {
                        return empty;
                    }

                    const createFreezeMutationAndRefresh = (newFreeze: IFreeze) => {
                        const workbook = this._context.unit;
                        const unitId = workbook.getUnitId();
                        const worksheet = workbook.getActiveSheet();
                        if (!worksheet) {
                            return empty;
                        }
                        const subUnitId = worksheet.getSheetId();

                        this._refreshFreeze(
                            newFreeze.startRow,
                            newFreeze.startColumn,
                            newFreeze.ySplit,
                            newFreeze.xSplit,
                            ResetScrollType.NONE
                        );

                        const redoMutationParams = {
                            ...newFreeze,
                            unitId,
                            subUnitId,
                            resetScroll: false,
                        };

                        const undoMutationParams = SetFrozenMutationFactory(this._injector, redoMutationParams);

                        return {
                            undos: [{ id: SetFrozenMutation.id, params: undoMutationParams }],
                            redos: [{ id: SetFrozenMutation.id, params: redoMutationParams }],
                        };
                    };

                    if (command.id === InsertRowCommand.id) {
                        const params = command.params as IInsertRowCommandParams;
                        const { range, direction } = params;
                        const insertCount = range.endRow - range.startRow + 1;
                        if (range.startRow + 1 < freeze.startRow || (range.startRow + 1 === freeze.startRow && direction === Direction.UP)) {
                            const newFreeze: IFreeze = {
                                ...freeze,
                                startRow: Math.max(1, freeze.startRow + insertCount),
                                ySplit: Math.max(1, freeze.ySplit + insertCount),
                            };

                            return createFreezeMutationAndRefresh(newFreeze);
                        }
                    }

                    if (command.id === InsertColCommand.id) {
                        const params = command.params as IInsertColCommandParams;
                        const { range, direction } = params;
                        const insertCount = range.endColumn - range.startColumn + 1;
                        if (range.startColumn + 1 < freeze.startColumn || (range.startColumn + 1 === freeze.startColumn && direction === Direction.LEFT)) {
                            const newFreeze: IFreeze = {
                                ...freeze,
                                startColumn: Math.max(1, freeze.startColumn + insertCount),
                                xSplit: Math.max(1, freeze.xSplit + insertCount),
                            };

                            return createFreezeMutationAndRefresh(newFreeze);
                        }
                    }

                    if (command.id === MoveColsCommand.id) {
                        const selections = this._selectionManagerService.getCurrentSelections();
                        const {
                            fromRange: { startColumn: fromCol },
                            toRange: { startColumn: toCol },
                        } = command.params as IMoveColsCommandParams;
                        const filteredSelections = selections?.filter(
                            (selection) =>
                                selection.range.rangeType === RANGE_TYPE.COLUMN &&
                                selection.range.startColumn <= fromCol &&
                                fromCol <= selection.range.endColumn
                        );

                        if (!filteredSelections?.length) {
                            return empty;
                        }
                        const sourceRange = filteredSelections[0].range;

                        const targetRange: IRange = {
                            ...sourceRange,
                            startColumn: toCol,
                            endColumn: toCol + sourceRange.endColumn - sourceRange.startColumn,
                        };

                        if (
                            !freeze ||
                            freeze.startColumn <= 0 ||
                            // move out of freeze
                            (sourceRange.startColumn >= freeze.startColumn &&
                                targetRange.startColumn >= freeze.startColumn) ||
                            // not move
                            sourceRange.startColumn === targetRange.startColumn ||
                            // move in freeze range
                            (sourceRange.endColumn < freeze.startColumn && targetRange.startColumn < freeze.startColumn)
                        ) {
                            return empty;
                        }

                        const totalColCount = sourceRange.endColumn - sourceRange.startColumn + 1;
                        const moveFreezeColCount = Math.max(
                            Math.min(freeze.startColumn, sourceRange.endColumn + 1) - sourceRange.startColumn,
                            0
                        );

                        let newStartColumn;
                        let newXSplit;

                        if (targetRange.startColumn >= freeze.startColumn) {
                            newStartColumn = Math.max(freeze.startColumn - moveFreezeColCount, 1);
                            newXSplit = Math.max(freeze.xSplit - moveFreezeColCount, 1);
                        } else {
                            newStartColumn = freeze.startColumn + totalColCount - moveFreezeColCount;
                            newXSplit = freeze.xSplit + totalColCount - moveFreezeColCount;
                        }

                        const redoMutationParams = {
                            ...freeze,
                            startColumn: newStartColumn,
                            xSplit: newXSplit,
                        };

                        return createFreezeMutationAndRefresh(redoMutationParams);
                    }

                    if (command.id === MoveRowsCommand.id) {
                        const selections = this._selectionManagerService.getCurrentSelections();
                        const {
                            fromRange: { startRow: fromRow },
                            toRange: { startRow: toRow },
                        } = command.params as IMoveRowsCommandParams;
                        const filteredSelections = selections?.filter(
                            (selection) =>
                                selection.range.rangeType === RANGE_TYPE.ROW &&
                                selection.range.startRow <= fromRow &&
                                fromRow <= selection.range.endRow
                        );

                        if (!filteredSelections?.length) {
                            return empty;
                        }
                        const sourceRange = filteredSelections[0].range;

                        const targetRange: IRange = {
                            ...sourceRange,
                            startRow: toRow,
                            endRow: toRow + sourceRange.endRow - sourceRange.startRow,
                        };

                        if (
                            !freeze ||
                            freeze.startRow <= 0 ||
                            // move out of freeze
                            (sourceRange.startRow >= freeze.startRow && targetRange.startRow >= freeze.startRow) ||
                            // not move
                            sourceRange.startRow === targetRange.startRow ||
                            // move in freeze range
                            (sourceRange.endRow < freeze.startRow && targetRange.startRow < freeze.startRow)
                        ) {
                            return empty;
                        }

                        const totalColCount = sourceRange.endRow - sourceRange.startRow + 1;
                        const moveFreezeColCount = Math.max(
                            Math.min(freeze.startRow, sourceRange.endRow + 1) - sourceRange.startRow,
                            0
                        );

                        let newStartRow;
                        let newYSplit;

                        if (targetRange.startRow >= freeze.startRow) {
                            newStartRow = Math.max(freeze.startRow - moveFreezeColCount, 1);
                            newYSplit = Math.max(freeze.ySplit - moveFreezeColCount, 1);
                        } else {
                            newStartRow = freeze.startRow + totalColCount - moveFreezeColCount;
                            newYSplit = freeze.ySplit + totalColCount - moveFreezeColCount;
                        }

                        const redoMutationParams = {
                            ...freeze,
                            startRow: newStartRow,
                            ySplit: newYSplit,
                        };

                        return createFreezeMutationAndRefresh(redoMutationParams);
                    }

                    if (command.id === RemoveColCommand.id || command.id === RemoveRowCommand.id) {
                        const params = command.params as IRemoveRowColCommandParams;
                        const range = params.range;

                        if (range.rangeType === RANGE_TYPE.COLUMN && range.startColumn < freeze.startColumn) {
                            const deleteFreezeColCount =
                                Math.min(freeze.startColumn, range.endColumn + 1) - range.startColumn;

                            const newFreeze: IFreeze = {
                                ...freeze,
                                startColumn: Math.max(1, freeze.startColumn - deleteFreezeColCount),
                                xSplit: Math.max(1, freeze.xSplit - deleteFreezeColCount),
                            };

                            return createFreezeMutationAndRefresh(newFreeze);
                        }

                        if (params.range.rangeType === RANGE_TYPE.ROW && range.startRow < freeze.startRow) {
                            const deleteFreezeRowCount = Math.min(freeze.startRow, range.endRow + 1) - range.startRow;

                            const newFreeze: IFreeze = {
                                ...freeze,
                                startRow: Math.max(1, freeze.startRow - deleteFreezeRowCount),
                                ySplit: Math.max(1, freeze.ySplit - deleteFreezeRowCount),
                            };

                            return createFreezeMutationAndRefresh(newFreeze);
                        }
                    }

                    return empty;
                },
            })
        );
    }

    /**
     * Update freeze line position when some cmds cause sk change.
     */
    // TODO @lumixraku But there is a _zoomRefresh method? Duplicated?
    private _commandExecutedListener() {
        this.disposeWithMe(
            // eslint-disable-next-line complexity
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                switch (command.id) {
                    case SetFrozenMutation.id:
                    case SetZoomRatioOperation.id:
                        {
                            const lastFreeze = this._lastFreeze;
                            const workbook = this._context.unit;
                            const worksheet = workbook.getActiveSheet();
                            const params = command.params as ISetFrozenMutationParams;
                            const { unitId, subUnitId } = params;
                            if (!(unitId === workbook.getUnitId() && subUnitId === worksheet?.getSheetId())) {
                                return;
                            }

                            const freeze = worksheet.getConfig().freeze;
                            this._lastFreeze = freeze;
                            if (freeze == null) {
                                return;
                            }

                            let resetScroll = ResetScrollType.NONE;

                            const { startRow = -1, startColumn = -1, ySplit = 0, xSplit = 0 } = freeze;
                            if (!lastFreeze || lastFreeze.startRow !== startRow || lastFreeze.ySplit !== ySplit) {
                                resetScroll |= ResetScrollType.Y;
                            }
                            if (!lastFreeze || lastFreeze.startColumn !== startColumn || lastFreeze.xSplit !== xSplit) {
                                resetScroll |= ResetScrollType.X;
                            }
                            if (params.resetScroll === false) {
                                resetScroll = ResetScrollType.NONE;
                            }
                            this._refreshFreeze(startRow, startColumn, ySplit, xSplit, resetScroll);
                        }
                        break;

                    case SetWorksheetRowHeightMutation.id:
                        {
                            const freeze = this._getFreeze();
                            const isRefresh = freeze && (command.params as ISetWorksheetRowHeightMutationParams).ranges.some((i) => i.startRow < freeze.startRow);
                            if (command.params && isRefresh) {
                                this._refreshCurrent();
                            }
                        }
                        break;
                    case SetWorksheetColWidthMutation.id:
                        {
                            const freeze = this._getFreeze();
                            if (command.params && freeze && (command.params as ISetWorksheetColWidthMutationParams).ranges.some(
                                (i) => i.startColumn < freeze.startColumn
                            )) {
                                this._refreshCurrent();
                            }
                        }
                        break;
                    case SetWorksheetRowAutoHeightMutation.id:
                        {
                            const params = command.params as ISetWorksheetRowAutoHeightMutationParams;
                            const freeze = this._getFreeze();

                            if (freeze && freeze.startRow > -1 && params.rowsAutoHeightInfo.some((info) => info.row < freeze.startRow)) {
                                const subscription = this._sheetSkeletonManagerService.currentSkeleton$.subscribe(() => {
                                    this._refreshCurrent();
                                    setTimeout(() => {
                                        subscription.unsubscribe();
                                    });
                                });
                            }
                        }
                        break;
                    case SetColHiddenMutation.id:
                    case SetColVisibleMutation.id:
                        {
                            const params = command.params as ISetColHiddenMutationParams;
                            const freeze = this._getFreeze();
                            const ranges = params.ranges;
                            if (freeze && freeze.startColumn > -1 && ranges.some((range) => range.startColumn < freeze.startColumn)) {
                                this._refreshCurrent();
                            }
                        }
                        break;
                    case SetRowHiddenMutation.id:
                    case SetRowVisibleMutation.id:
                        {
                            const params = command.params as ISetRowHiddenMutationParams;
                            const freeze = this._getFreeze();
                            const ranges = params.ranges;
                            if (freeze && freeze.startRow > -1 && ranges.some((range) => range.startRow < freeze.startRow)) {
                                this._refreshCurrent();
                            }
                        }
                        break;
                    case SetRowHeaderWidthCommand.id:
                    case SetColumnHeaderHeightCommand.id:
                        this._refreshCurrent();
                }
            })
        );
    }

    private _zoomRefresh() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        const { scene } = sheetObject;

        this.disposeWithMe(scene.onTransformChange$.subscribeEvent((state) => {
            if (![TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale, TRANSFORM_CHANGE_OBSERVABLE_TYPE.all].includes(state.type)) {
                return;
            }
            this._refreshCurrent();
        }));
    }

    private _clearObserverEvent() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        // const { scene } = sheetObject;
        // scene.onPointerMove$.remove(this._moveObserver);
        // scene.onPointerUp$.remove(this._scenePointerUpSub);
        this._scenePointerMoveSub?.unsubscribe();
        this._scenePointerUpSub?.unsubscribe();
        this._scenePointerMoveSub = null;
        this._scenePointerUpSub = null;
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

        [this._freezeDownSubs, this._freezePointerEnterSubs, this._freezePointerLeaveSubs].forEach((s) => {
            s?.unsubscribe();
        });
        // TODO @lumixraku
        this._freezeDownSubs = null;
        this._freezePointerEnterSubs = null;
        this._freezePointerLeaveSubs = null;
        this._scenePointerMoveSub?.unsubscribe();
        this._scenePointerUpSub?.unsubscribe();
        this._scenePointerMoveSub = null;
        this._scenePointerUpSub = null;
    }

    private _getPositionByIndex(row: number, column: number) {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        const position = skeleton?.getNoMergeCellWithCoordByIndex(row, column);
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
        const config: IWorksheetData | undefined = this._sheetSkeletonManagerService
            .getCurrentParam()
            ?.skeleton
            .getWorksheetConfig();

        if (config == null) {
            return;
        }

        return config.freeze;
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context);
    }

    /**
     * Core function of _refreshCurrent
     * @param startRow
     * @param startColumn
     * @param ySplit
     * @param xSplit
     * @param resetScroll
     */
    private _refreshFreeze(
        startRow: number,
        startColumn: number,
        ySplit: number,
        xSplit: number,
        resetScroll?: ResetScrollType
    ) {
        const newFreeze = {
            startRow,
            startColumn,
            ySplit,
            xSplit,
        };
        this._clearFreeze();

        this._createFreeze(FREEZE_DIRECTION_TYPE.ROW, newFreeze);
        this._createFreeze(FREEZE_DIRECTION_TYPE.COLUMN, newFreeze);

        this._updateViewport(startRow, startColumn, ySplit, xSplit, resetScroll);
        this._getSheetObject()?.spreadsheet.makeForceDirty();
    }
}
