/**
 * Copyright 2023-present DreamNum Inc.
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

/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import type {
    EventState,
    IRange,
    IRangeWithCoord,
    ISelectionCell,
    ISelectionCellWithMergeInfo,
    ISelectionWithCoord,
    Nullable,
    Workbook } from '@univerjs/core';
import {
    ICommandService,
    IContextService,
    ILogService, makeCellToSelection, RANGE_TYPE, ThemeService } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, Scene, Viewport } from '@univerjs/engine-render';
import { IRenderManagerService, ScrollTimer, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import type { ISelectionWithCoordAndStyle, ISelectionWithStyle, WorkbookSelections } from '@univerjs/sheets';
import { DISABLE_NORMAL_SELECTIONS, getNormalSelectionStyle, SheetsSelectionsService } from '@univerjs/sheets';
import { IShortcutService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import type { Subscription } from 'rxjs';

import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import type { ISheetObjectParam } from '../../controllers/utils/component-tools';
import { getSheetObject } from '../../controllers/utils/component-tools';
import { MobileSelectionControl } from './mobile-selection-shape';
import { BaseSelectionRenderService } from './base-selection-render.service';
import type { SelectionControl } from './selection-shape';
import { SelectionShapeExtension } from './selection-shape-extension';

enum ExpandingControl {
    BOTTOM_RIGHT = 'bottom-right',
    TOP_LEFT = 'top-left',
    LEFT = 'left',
    RIGHT = 'right',
    TOP = 'top',
    BOTTOM = 'bottom',
}
export class MobileSheetsSelectionRenderService extends BaseSelectionRenderService implements IRenderModule {
    private readonly _workbookSelections: WorkbookSelections;

    hasSelection: boolean = false;

    private _pointerdownSub: Nullable<Subscription>;

    private _mainScenePointerUpSub: Nullable<Subscription>;

    private _scenePointerMoveSub: Nullable<Subscription>;

    private _scenePointerUpSub: Nullable<Subscription>;

    protected override _selectionControls: SelectionControl[] = []; // sheetID:Controls

    expandingControlMode: ExpandingControl = ExpandingControl.BOTTOM_RIGHT;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) injector: Injector,
        @Inject(ThemeService) themeService: ThemeService,
        @IShortcutService shortcutService: IShortcutService,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @Inject(SheetsSelectionsService) selectionManagerService: SheetsSelectionsService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super(
            injector,
            themeService,
            shortcutService,
            renderManagerService
        );
        this._workbookSelections = selectionManagerService.getWorkbookSelections(this._context.unitId);
        this._init();
    }

    private _init() {
        const sheetObject = this._getSheetObject();

        this._initEventListeners(sheetObject);
        // this._initSelectionChangeListener();
        // this._initThemeChangeListener();
        // this._initSkeletonChangeListener();
        // this._initUserActionSyncListener();
    }

    private _initEventListeners(sheetObject: ISheetObjectParam): void {
        const { spreadsheetRowHeader, spreadsheetColumnHeader, spreadsheet, spreadsheetLeftTopPlaceholder } = sheetObject;

        this.disposeWithMe(spreadsheet?.onPointerUp$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state: EventState) => {
            if (this._normalSelectionDisabled()) return;
            this._onPointerUp(evt, spreadsheet.zIndex + 1, RANGE_TYPE.NORMAL, this._getActiveViewport(evt));
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));
    }

    /**
     * add a selection
     *
     * in PC:init & pointerup would call this function.
     *
     * init
     * selectionController@_initSkeletonChangeListener --> selectionManagerService.add --> selectionManagerService._selectionMoveEnd$ --> this.addControlToCurrentByRangeData
     *
     * selectionMoveEnd$ --> this.addSelectionControlBySelectionData
     *
     *
     *
     * pointer
     * engine@_pointerDownEvent --> spreadsheet?.onPointerDownObserve --> eventTrigger --> scene@disableEvent() --> then scene.input-manager currentObject is always scene until scene@enableEvent.
     * engine@_pointerUpEvent --> scene.input-manager@_onPointerUp --> this._selectionMoveEnd$ --> _selectionManagerService.selectionMoveEnd$ --> this.addControlToCurrentByRangeData
     *
     * but in mobile, we do not call disableEvent() in eventTrigger,
     * so pointerup --> scene.input-manager currentObject is spreadsheet --> this.eventTrigger
     *
     *
     *
     * @param selectionData
     */
    protected override _addSelectionControlBySelectionData(selectionData: ISelectionWithCoordAndStyle) {
        // const selectionControls = this.getSelectionControls();

        // if (!selectionControls) {
        //     return;
        // }
        const { rangeWithCoord, primaryWithCoord } = selectionData;
        const { rangeType } = rangeWithCoord;
        const skeleton = this._skeleton;

        let { style } = selectionData;

        if (style == null) {
            style = getNormalSelectionStyle(this._themeService);
        }

        const scene = this._scene;

        if (scene == null || skeleton == null) {
            return;
        }
        const control = this.newSelectionControl(scene, rangeType || RANGE_TYPE.NORMAL);

        // eslint-disable-next-line no-new
        new SelectionShapeExtension(control, skeleton, scene, this._themeService, this._injector);

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        // update control
        control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!viewportMain) return;
        const { viewportScrollX, viewportScrollY } = viewportMain;
        const selectionEndY = rangeWithCoord.endY;
        const selectionEndX = rangeWithCoord.endX;
        control.transformControlPoint(viewportScrollX, viewportScrollY, selectionEndX, selectionEndY);
    }

    // same as PC
    private _getActiveViewport(evt: IPointerEvent | IMouseEvent) {
        const sheetObject = this._getSheetObject();
        return sheetObject?.scene.getActiveViewportByCoord(Vector2.FromArray([evt.offsetX, evt.offsetY]));
    }

    // same as PC
    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context)!;
    }

    // same as PC
    private _normalSelectionDisabled(): boolean {
        return this._contextService.getContextValue(DISABLE_NORMAL_SELECTIONS);
    }

    override newSelectionControl(scene: Scene, rangeType: RANGE_TYPE) {
        const selectionControls = this.getSelectionControls();

        const control = new MobileSelectionControl(scene, selectionControls.length, this._isHeaderHighlight, this._themeService, rangeType);
        this._selectionControls.push(control);

        const { expandingModeForTopLeft, expandingModeForBottomRight } = (() => {
            switch (rangeType) {
                case RANGE_TYPE.NORMAL:
                    return {
                        expandingModeForTopLeft: ExpandingControl.TOP_LEFT,
                        expandingModeForBottomRight: ExpandingControl.BOTTOM_RIGHT,
                    };
                case RANGE_TYPE.ROW:
                    return {
                        expandingModeForTopLeft: ExpandingControl.TOP,
                        expandingModeForBottomRight: ExpandingControl.BOTTOM,
                    };
                case RANGE_TYPE.COLUMN:
                    return {
                        expandingModeForTopLeft: ExpandingControl.LEFT,
                        expandingModeForBottomRight: ExpandingControl.RIGHT,
                    };
                case RANGE_TYPE.ALL:
                    return {
                        expandingModeForTopLeft: ExpandingControl.TOP_LEFT,
                        expandingModeForBottomRight: ExpandingControl.BOTTOM_RIGHT,
                    };
                default:
                    return {
                        expandingModeForTopLeft: ExpandingControl.TOP_LEFT,
                        expandingModeForBottomRight: ExpandingControl.BOTTOM_RIGHT,
                    };
            }
        })();

        control.fillControlTopLeft!.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            this.expandingSelection = true;
            this.expandingControlMode = expandingModeForTopLeft;
            this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
            this._fillControlPointerDownHandler(
                evt,
                rangeType,
                this._activeViewport!
            );
        });
        control.fillControlBottomRight!.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            this.expandingSelection = true;
            this.expandingControlMode = expandingModeForBottomRight;
            this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
            this._fillControlPointerDownHandler(
                evt,
                rangeType,
                this._activeViewport!
            );
        });
        if (rangeType === RANGE_TYPE.ROW || rangeType === RANGE_TYPE.COLUMN) {
            const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
            if (!viewportMain) return control;

            // const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
            // const sheetContentHeight = skeleton?.rowTotalHeight;
            // const sheetContentWidth = skeleton?.columnTotalWidth;

            // const scrollX = viewportMain.viewportScrollX;
            // const scrollY = viewportMain.viewportScrollY;

            // control.transformControlPoint(scrollX, scrollY, sheetContentWidth, sheetContentHeight);
        }

        return control;
    }

    // in dev  branch
    updateControlForCurrentByRangeData(selections: ISelectionWithCoordAndStyle[]) {
        const currentControls = this.getSelectionControls();
        if (!currentControls) {
            return;
        }

        const skeleton = this._skeleton;

        if (skeleton == null) {
            return;
        }

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        for (let i = 0, len = selections.length; i < len; i++) {
            const { rangeWithCoord, primaryWithCoord, style } = selections[i];

            const control = currentControls[i];

            control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);
        }
    }

    expandingSelection: boolean = false;

    /**
     * invoked when pointerup or longpress on spreadsheet, or pointerdown on row&col
     * then move curr selection to cell at cursor
     * Main perpose to create a new selection, or update curr selection to a new range.
     * @param evt
     * @param _zIndex
     * @param rangeType
     * @param viewport
     */
    _pointerUp(
        evt: IPointerEvent | IMouseEvent,
        _zIndex = 0,
        rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL,
        viewport?: Viewport
    ) {
        if (this._isSelectionEnabled === false) {
            return;
        }

        const skeleton = this._skeleton;

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const scene = this._scene;

        if (scene == null || skeleton == null) {
            return;
        }

        if (viewport != null) {
            this._activeViewport = viewport;
        }

        // const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        const relativeCoords = scene.getRelativeToViewportCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        let { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        this._startViewportPosX = newEvtOffsetX;
        this._startViewportPosY = newEvtOffsetY;

        const scrollXY = scene.getVpScrollXYInfoByPosToVp(relativeCoords);

        const { scaleX, scaleY } = scene.getAncestorScale();

        if (rangeType === RANGE_TYPE.ROW) {
            newEvtOffsetX = 0;
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            newEvtOffsetY = 0;
        }

        const cursorCellRangeInfo = this._getCellRangeByCursorPosition(newEvtOffsetX, newEvtOffsetY, scaleX, scaleY, scrollXY);

        if (!cursorCellRangeInfo) {
            return false;
        }

        const { rangeWithCoord: cursorCellRange, primaryWithCoord: primaryCursorCellRange } = cursorCellRangeInfo;

        // const { startRow, startColumn, endColumn, endRow, startY, endY, startX, endX } = cursorCellRange;

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        const cursorCellRangeWithRangeType = this._activeCellRangeOfCurrSelection = { ...cursorCellRange, rangeType };

        // let selectionControl: Nullable<SelectionShape> = this.getActiveSelection();
        let activeSelectionControl: Nullable<SelectionControl> = this.getActiveSelectionControl();

        const curControls = this.getSelectionControls();
        const expandingMode = this.expandingSelection || evt.shiftKey;

        if (!curControls) {
            return false;
        }

        for (const control of curControls) {
            // right click
            if (evt.button === 2 && control.model.isInclude(cursorCellRangeWithRangeType)) {
                activeSelectionControl = control;
                return;
            }
            // Click to an existing selection
            if (control.model.isEqual(cursorCellRangeWithRangeType)) {
                activeSelectionControl = control;
                break;
            }

            // There can only be one highlighted cell, so clear the highlighted cell of the existing selection
            if (!expandingMode) {
                control.clearHighlight();
            }
        }

        // In addition to pressing the ctrl or shift key, we must clear the previous selection
        if (curControls.length > 0 && !expandingMode) {
            const remainPrev = !evt.ctrlKey &&
                !this._isShowPreviousEnable &&
                !this._isRemainLastEnable;
            const isSingle = this._isSingleSelection;

            if (remainPrev || isSingle) {
                this._clearSelectionControls();
            }
        }

        if (activeSelectionControl?.model.rangeType !== rangeType) {
            this._clearSelectionControls();
            activeSelectionControl = this.newSelectionControl(scene, rangeType);
        }

        // const activeCellOfCurrSelection = activeSelectionControl && activeSelectionControl.model.currentCell;

        if (
            activeSelectionControl &&
            this._isRemainLastEnable &&
            !evt.ctrlKey &&
            !expandingMode &&
            !this._isSkipRemainLastEnable &&
            !this._isSingleSelection
        ) {
            /**
             * Supports the formula ref text selection feature,
             * under the condition of preserving all previous selections, it modifies the position of the latest selection.
             */
            // console.log('selectionControl', startSelectionRange);

            this._selectionMoveStart$.next(this.getSelectionDataWithStyle());

            // eslint-disable-next-line no-new
            new SelectionShapeExtension(activeSelectionControl, skeleton, scene, this._themeService, this._injector);

            activeSelectionControl.update(
                cursorCellRangeWithRangeType,
                rowHeaderWidth,
                columnHeaderHeight,
                this._selectionStyle,
                primaryCursorCellRange
            );
        }

        this._selectionMoveStart$.next(this.getSelectionDataWithStyle()); // old function call
        this.hasSelection = true;
        this._endSelection();
        this.expandingSelection = false;

        // old function call
        if (rangeType === RANGE_TYPE.ROW || rangeType === RANGE_TYPE.COLUMN) {
            // _movingHandler would update activeSelectionControl range
            // this update logic should split from _movingHandler!!!
            this._movingHandler(newEvtOffsetX, newEvtOffsetY, activeSelectionControl, rangeType);
        }
    }

    /**
     *
     * @param evt component point event
     * @param style selection style, Styles for user-customized selectors
     * @param zIndex Stacking order of the selection object
     * @param rangeType Determines whether the selection is made normally according to the range or by rows and columns
     *
     * invoked by selection.render-controller@pointerDownObserver
     *
     * derived from eventTrigger
     */
    private _fillControlPointerDownHandler(
        evt: IPointerEvent | IMouseEvent,
        rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL,
        viewport?: Viewport,
        scrollTimerType: ScrollTimerType = ScrollTimerType.ALL
    ) {
        if (this._isSelectionEnabled === false) {
            return;
        }

        const skeleton = this._skeleton;

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const scene = this._scene;

        if (scene == null || skeleton == null) {
            return;
        }

        if (viewport != null) {
            this._activeViewport = viewport;
        }

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        let { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        this._startViewportPosX = newEvtOffsetX;
        this._startViewportPosY = newEvtOffsetY;

        const scrollXY = scene.getScrollXYByRelativeCoords(relativeCoords);

        const { scaleX, scaleY } = scene.getAncestorScale();

        if (rangeType === RANGE_TYPE.ROW) {
            newEvtOffsetX = 0;
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            newEvtOffsetY = 0;
        }

        const cursorCellRangeInfo = this._getCellRangeByCursorPosition(newEvtOffsetX, newEvtOffsetY, scaleX, scaleY, scrollXY);

        if (!cursorCellRangeInfo) {
            return false;
        }

        // rangeByCursor: cursor active cell selection range (range may more than one cell if cursor is at a merged cell)
        // primaryCellRangeByCursor: the primary cell of range (only one cell)
        const { rangeWithCoord: cursorCellRange, primaryWithCoord: _primaryCursorCellRange } = cursorCellRangeInfo;

        // const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        const cursorCellRangeWithRangeType = this._activeCellRangeOfCurrSelection = { ...cursorCellRange, rangeType };

        let activeSelectionControl: Nullable<SelectionControl> = this.getActiveSelectionControl();

        const selectionControls = this.getSelectionControls();
        const expandingMode = this.expandingSelection || evt.shiftKey;

        if (!selectionControls) {
            return false;
        }

        for (const control of selectionControls) {
            // right click
            if (evt.button === 2 && control.model.isInclude(cursorCellRangeWithRangeType)) {
                activeSelectionControl = control;
                return;
            }
            // Click to an existing selection
            if (control.model.isEqual(cursorCellRangeWithRangeType)) {
                activeSelectionControl = control;
                break;
            }

            // There can only be one highlighted cell, so clear the highlighted cell of the existing selection
            if (!expandingMode) {
                control.clearHighlight();
            }
        }

        // In addition to pressing the ctrl or shift key, we must clear the previous selection
        if (selectionControls.length > 0) {
            const remainPrev = !evt.ctrlKey &&
                !this._isShowPreviousEnable &&
                !this._isRemainLastEnable;
            const isSingle = this._isSingleSelection;

            if (remainPrev || isSingle) {
                this._clearSelectionControls();
            }
        }
        if (!activeSelectionControl) return;

        /**
         * getActiveSelectionControl() --> activeSelectionControl.model.currentCell
         */

        // switch active cell when expanding selection!!
        if (activeSelectionControl && expandingMode) {
            const activeCellOfCurrSelectCtrl = activeSelectionControl.model.currentCell;
            if (!activeCellOfCurrSelectCtrl) return;
            let primaryCursorCellRangeByControlShape: ISelectionCellWithMergeInfo;

            const { startRow, startColumn, endRow, endColumn } = activeSelectionControl.model;
            switch (this.expandingControlMode) {
                case ExpandingControl.TOP_LEFT:
                    primaryCursorCellRangeByControlShape = skeleton.getCellByIndex(endRow, endColumn);
                    break;
                case ExpandingControl.BOTTOM_RIGHT:
                    primaryCursorCellRangeByControlShape =
                        skeleton.getCellByIndex(startRow, startColumn);
                    break;
                case ExpandingControl.LEFT:
                    primaryCursorCellRangeByControlShape =
                        skeleton.getCellByIndex(startRow, endColumn);
                    break;
                case ExpandingControl.RIGHT:
                    primaryCursorCellRangeByControlShape =
                        skeleton.getCellByIndex(startRow, startColumn);
                    break;
                case ExpandingControl.TOP:
                    primaryCursorCellRangeByControlShape =
                        skeleton.getCellByIndex(endRow, startColumn);
                    break;
                case ExpandingControl.BOTTOM:
                    primaryCursorCellRangeByControlShape =
                        skeleton.getCellByIndex(startRow, startColumn);
                    break;
                default:
                    primaryCursorCellRangeByControlShape =
                        skeleton.getCellByIndex(startRow, startColumn);
            }
            activeSelectionControl.updateCurrCell(
                primaryCursorCellRangeByControlShape
            );
        }

        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());

        this.hasSelection = true;

        // scene.onPointerUp & scene.onPointerMoveObserver called this method
        // this._endSelection();

        // scene.disableEvent();

        const startViewport = scene.getActiveViewportByCoord(Vector2.FromArray([newEvtOffsetX, newEvtOffsetY]));

        const scrollTimer = ScrollTimer.create(this._scene, scrollTimerType);
        scrollTimer.startScroll(viewportMain?.left ?? 0, viewportMain?.top ?? 0, viewportMain);

        this._scrollTimer = scrollTimer;

        this._addCancelObserver();

        scene.getTransformer()?.clearSelectedObjects();

        // if (rangeType === RANGE_TYPE.ROW || rangeType === RANGE_TYPE.COLUMN) {
        //     this._movingHandler(newEvtOffsetX, newEvtOffsetY, activeSelectionControl, rangeType);
        // }

        let xCrossTime = 0;
        let yCrossTime = 0;
        let lastX = newEvtOffsetX;
        let lastY = newEvtOffsetY;

        //#region  handle pointermove after control pointer has clicked
        this._scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
            if (!this.expandingSelection) return;

            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(
                Vector2.FromArray([moveOffsetX, moveOffsetY])
            );

            this._movingHandler(newMoveOffsetX, newMoveOffsetY, activeSelectionControl, rangeType);

            let scrollOffsetX = newMoveOffsetX;
            let scrollOffsetY = newMoveOffsetY;

            const currentSelection = this.getActiveSelectionControl();
            const freeze = this._getFreeze();

            const selection = currentSelection?.model;
            const endViewport =
                scene.getActiveViewportByCoord(Vector2.FromArray([moveOffsetX, moveOffsetY])) ??
                this._getViewportByCell(selection?.endRow, selection?.endColumn);

            if (startViewport && endViewport && viewportMain) {
                const isCrossingX =
                    (lastX < viewportMain.left && newMoveOffsetX > viewportMain.left) ||
                    (lastX > viewportMain.left && newMoveOffsetX < viewportMain.left);
                const isCrossingY =
                    (lastY < viewportMain.top && newMoveOffsetY > viewportMain.top) ||
                    (lastY > viewportMain.top && newMoveOffsetY < viewportMain.top);

                if (isCrossingX) {
                    xCrossTime += 1;
                }

                if (isCrossingY) {
                    yCrossTime += 1;
                }

                const startKey = startViewport.viewportKey;
                const endKey = endViewport.viewportKey;

                if (startKey === SHEET_VIEWPORT_KEY.VIEW_ROW_TOP) {
                    if (moveOffsetY < viewportMain.top && (selection?.endRow ?? 0) < (freeze?.startRow ?? 0)) {
                        scrollOffsetY = viewportMain.top;
                    } else if (isCrossingY && yCrossTime % 2 === 1) {
                        viewportMain.scrollTo({
                            y: 0,
                        });
                    }
                } else if (startKey === SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT) {
                    if (moveOffsetX < viewportMain.left && (selection?.endColumn ?? 0) < (freeze?.startColumn ?? 0)) {
                        scrollOffsetX = viewportMain.left;
                    } else if (isCrossingX && xCrossTime % 2 === 1) {
                        viewportMain.scrollTo({
                            x: 0,
                        });
                    }
                } else if (startKey === endKey) {
                    let disableX = false;
                    let disableY = false;
                    if (startKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP) {
                        disableX = true;
                        disableY = true;
                    } else if (startKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP) {
                        disableY = true;
                    } else if (startKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT) {
                        disableX = true;
                    }

                    if ((selection?.endRow ?? 0) > (freeze?.startRow ?? 0)) {
                        disableY = false;
                    }

                    if ((selection?.endColumn ?? 0) > (freeze?.startColumn ?? 0)) {
                        disableX = false;
                    }
                    if (disableX) {
                        scrollOffsetX = viewportMain.left;
                    }

                    if (disableY) {
                        scrollOffsetY = viewportMain.top;
                    }
                } else {
                    const startXY = {
                        x: startViewport.scrollX,
                        y: startViewport.scrollY,
                    };
                    const endXY = {
                        x: endViewport.scrollX,
                        y: endViewport.scrollY,
                    };
                    const checkStartViewportType = [
                        SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP,
                        SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP,
                        SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT,
                    ].includes(startViewport.viewportKey as SHEET_VIEWPORT_KEY);
                    const shouldResetX = checkStartViewportType && startXY.x !== endXY.x && isCrossingX && xCrossTime % 2 === 1;
                    const shouldResetY = checkStartViewportType && startXY.y !== endXY.y && isCrossingY && yCrossTime % 2 === 1;

                    if (shouldResetX || shouldResetY) {
                        viewportMain.scrollTo({
                            x: shouldResetX ? startXY.x : undefined,
                            y: shouldResetY ? startXY.y : undefined,
                        });

                        if (!shouldResetX) {
                            scrollOffsetX = viewportMain.left;
                        }

                        if (!shouldResetY) {
                            scrollOffsetY = viewportMain.top;
                        }
                    }

                    if (
                        (startKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP && endKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT) ||
                        (endKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP && startKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT)
                    ) {
                        scrollOffsetX = viewportMain.left;
                    }

                    if (
                        (startKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP && endKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP) ||
                        (endKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP && startKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP)
                    ) {
                        scrollOffsetY = viewportMain.top;
                    }
                }

                lastX = newMoveOffsetX;
                lastY = newMoveOffsetY;
            }
            scrollTimer.scrolling(scrollOffsetX, scrollOffsetY, () => {
                this._movingHandler(newMoveOffsetX, newMoveOffsetY, activeSelectionControl, rangeType);
            });
        });
        //#endregion

        //#region handle pointerup after control pointer has clicked
        this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent((_evt: IPointerEvent | IMouseEvent) => {
            this._endSelection();
            this.expandingSelection = false;
            this.expandingControlMode = ExpandingControl.BOTTOM_RIGHT;
            this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());

            // when selection mouse up, enable the short cut service
            this._shortcutService.setDisable(false);
        });
        //#endregion

        // when selection mouse down, disable the short cut service
        this._shortcutService.setDisable(true);
    }

    attachSelectionWithCoord(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoordAndStyle {
        const { range, primary, style } = selectionWithStyle;
        let rangeWithCoord = this.attachRangeWithCoord(range);
        if (rangeWithCoord == null) {
            rangeWithCoord = {
                startRow: -1,
                startColumn: -1,
                endRow: -1,
                endColumn: -1,
                startY: 0,
                endY: 0,
                startX: 0,
                endX: 0,
                rangeType: RANGE_TYPE.NORMAL,
            };
        }
        return {
            rangeWithCoord,
            primaryWithCoord: this.attachPrimaryWithCoord(primary),
            style,
        };
    }

    attachRangeWithCoord(range: IRange): Nullable<IRangeWithCoord> {
        const { startRow, startColumn, endRow, endColumn, rangeType } = range;
        const scene = this._scene;
        const skeleton = this._skeleton;
        if (scene == null || skeleton == null) {
            return;
        }
        const { scaleX, scaleY } = scene.getAncestorScale();
        const startCell = skeleton.getNoMergeCellPositionByIndex(startRow, startColumn);
        const endCell = skeleton.getNoMergeCellPositionByIndex(endRow, endColumn);

        return {
            startRow,
            startColumn,
            endRow,
            endColumn,
            rangeType,
            startY: startCell?.startY || 0,
            endY: endCell?.endY || 0,
            startX: startCell?.startX || 0,
            endX: endCell?.endX || 0,
        };
    }

    attachPrimaryWithCoord(primary: Nullable<ISelectionCell>): Nullable<ISelectionCellWithMergeInfo> {
        if (primary == null) {
            return;
        }

        const scene = this._scene;
        const skeleton = this._skeleton;
        if (scene == null || skeleton == null) {
            return;
        }
        const { actualRow, actualColumn, isMerged, isMergedMainCell, startRow, startColumn, endRow, endColumn } =
            primary;

        const cellPosition = skeleton.getNoMergeCellPositionByIndex(actualRow, actualColumn);

        const startCell = skeleton.getNoMergeCellPositionByIndex(startRow, startColumn);
        const endCell = skeleton.getNoMergeCellPositionByIndex(endRow, endColumn);

        return {
            actualRow,
            actualColumn,
            isMerged,
            isMergedMainCell,
            startX: cellPosition.startX,
            startY: cellPosition.startY,
            endX: cellPosition.endX,
            endY: cellPosition.endY,
            mergeInfo: {
                startRow,
                startColumn,
                endRow,
                endColumn,
                startY: startCell?.startY || 0,
                endY: endCell?.endY || 0,
                startX: startCell?.startX || 0,
                endX: endCell?.endX || 0,
            },
        };
    }

    /**
     * When mousedown and mouseup need to go to the coordination and undo stack, when mousemove does not need to go to the coordination and undo stack
     */
    private _movingHandler(
        moveOffsetX: number,
        moveOffsetY: number,
        activeSelectionControl: Nullable<SelectionControl>,
        rangeType: RANGE_TYPE
    ) {
        const skeleton = this._skeleton;

        const scene = this._scene;

        if (scene == null || skeleton == null) {
            return false;
        }

        const currSelectionRange: IRange = {
            startRow: activeSelectionControl?.model.startRow ?? -1,
            endRow: activeSelectionControl?.model.endRow ?? -1,
            startColumn: activeSelectionControl?.model.startColumn ?? -1,
            endColumn: activeSelectionControl?.model.endColumn ?? -1,
        };

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!;

        const targetViewport = this._getViewportByCell(currSelectionRange.endRow, currSelectionRange.endColumn) ?? viewportMain;

        const scrollXY = scene.getVpScrollXYInfoByPosToVp(
            Vector2.FromArray([this._startViewportPosX, this._startViewportPosY]),
            targetViewport
        );

        const { scaleX, scaleY } = scene.getAncestorScale();

        // const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        if (rangeType === RANGE_TYPE.ROW) {
            moveOffsetX = Number.POSITIVE_INFINITY;
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            moveOffsetY = Number.POSITIVE_INFINITY;
        }

        const cursorCellRangeInfo = this._getCellRangeByCursorPosition(moveOffsetX, moveOffsetY, scaleX, scaleY, scrollXY);
        if (!cursorCellRangeInfo) {
            return false;
        }

        const { rangeWithCoord: cursorCellRange } = cursorCellRangeInfo;

        const {
            startRow: cursorStartRow,
            startColumn: cursorStartColumn,
            endColumn: cursorEndColumn,
            endRow: cursorEndRow,
        } = cursorCellRange;

        const currCellOfActiveSelctionControl = activeSelectionControl?.model.currentCell;
        const startRowOfActiveCell = currCellOfActiveSelctionControl?.mergeInfo.startRow ?? -1;
        const endRowOfActiveCell = currCellOfActiveSelctionControl?.mergeInfo.endRow ?? -1;
        const startColumnOfActiveCell = currCellOfActiveSelctionControl?.mergeInfo.startColumn ?? -1;
        const endColOfActiveCell = currCellOfActiveSelctionControl?.mergeInfo.endColumn ?? -1;

        // startRowCol  endRowCol from _activeCellRangeOfCurrSelection
        const expandStartRow = Math.min(cursorStartRow, startRowOfActiveCell);
        const expandStartColumn = Math.min(cursorStartColumn, startColumnOfActiveCell);
        const expandEndRow = Math.max(cursorEndRow, endRowOfActiveCell);
        const expandEndColumn = Math.max(cursorEndColumn, endColOfActiveCell);

        // console.log(this.expandingControlMode, 'end col', cursorEndColumn, endColOfActiveCell, currSelCtrlEndRow, cursorEndRow);
        let newSelectionRange: IRange = {
            startRow: expandStartRow,
            startColumn: expandStartColumn,
            endRow: expandEndRow,
            endColumn: expandEndColumn,
        };

        if (this._shouldDetectMergedCells) {
            newSelectionRange = skeleton.getSelectionBounding(expandStartRow, expandStartColumn, expandEndRow, expandEndColumn);
        }

        if (!newSelectionRange) {
            return false;
        }

        const startCellXY = skeleton.getNoMergeCellPositionByIndex(newSelectionRange.startRow, newSelectionRange.startColumn);
        const endCellXY = skeleton.getNoMergeCellPositionByIndex(newSelectionRange.endRow, newSelectionRange.endColumn);

        const newSelectionRangeWithCoord: IRangeWithCoord = {
            startColumn: newSelectionRange.startColumn,
            startRow: newSelectionRange.startRow,
            endColumn: newSelectionRange.endColumn,
            endRow: newSelectionRange.endRow,
            startY: startCellXY?.startY || 0,
            endY: endCellXY?.endY || 0,
            startX: startCellXY?.startX || 0,
            endX: endCellXY?.endX || 0,
        };

        if (
            currSelectionRange.startRow !== newSelectionRange.startRow ||
            currSelectionRange.startColumn !== newSelectionRange.startColumn ||
            currSelectionRange.endRow !== newSelectionRange.endRow ||
            currSelectionRange.endColumn !== newSelectionRange.endColumn
        ) {
            if (activeSelectionControl) {
                // activeSelectionControl.update(newSelectionRangeWithCoord, rowHeaderWidth, columnHeaderHeight, null, null, activeSelectionControl.model.rangeType);
                activeSelectionControl.updateRange(newSelectionRangeWithCoord);
                this._selectionMoving$.next(this.getSelectionDataWithStyle());
            }
        }
    }

    /**
     * rm pointerUp & pointerMove Observer on scene
     */
    private _endSelection() {
        const scene = this._scene;
        if (scene == null) {
            return;
        }

        // scene.onPointerMove$.remove(this._scenePointerMoveSub);
        // scene.onPointerUp$.remove(this._scenePointerUpSub);
        this._scenePointerMoveSub?.unsubscribe();
        this._scenePointerUpSub?.unsubscribe();
        scene.enableEvent();

        this._scrollTimer?.dispose();

        // const mainScene = scene.getEngine()?.activeScene;
        // mainScene?.onPointerUp$.remove(this._mainScenePointerUpSub);
        this._mainScenePointerUpSub?.unsubscribe();

        this._pointerdownSub?.unsubscribe();
        this._pointerdownSub = null;
    }

    private _addCancelObserver() {
        const scene = this._scene;
        if (scene == null) {
            return;
        }

        const mainScene = scene.getEngine()?.activeScene;
        if (mainScene == null || mainScene === scene) {
            return;
        }

        // mainScene.onPointerUp$.remove(this._mainScenePointerUpSub);
        this._mainScenePointerUpSub?.unsubscribe();
        this._mainScenePointerUpSub = mainScene.onPointerUp$.subscribeEvent(() => this._endSelection());

        this._pointerdownSub?.unsubscribe();
        this._pointerdownSub = mainScene.onPointerDown$.subscribeEvent(() => this._endSelection());
    }

    private _getCellRangeByCursorPosition(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number }
    ): Nullable<ISelectionWithCoord> {
        if (this._isDetectMergedCell) {
            const primaryWithCoord = this._skeleton?.calculateCellIndexByPosition(
                offsetX,
                offsetY,
                scaleX,
                scaleY,
                scrollXY
            );
            const rangeWithCoord = makeCellToSelection(primaryWithCoord);
            if (rangeWithCoord == null) {
                return;
            }
            return {
                primaryWithCoord,
                rangeWithCoord,
            };
        }

        const skeleton = this._skeleton;

        if (skeleton == null) {
            return;
        }

        const moveActualSelection = skeleton.getCellPositionByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);

        const { row, column } = moveActualSelection;

        const startCell = skeleton.getNoMergeCellPositionByIndex(row, column);

        const { startX, startY, endX, endY } = startCell;

        const rangeWithCoord = {
            startY,
            endY,
            startX,
            endX,
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
        };

        const primaryWithCoord = {
            actualRow: row,
            actualColumn: column,

            isMerged: false,

            isMergedMainCell: false,

            startY,
            endY,
            startX,
            endX,

            mergeInfo: rangeWithCoord,
        };

        return {
            primaryWithCoord,
            rangeWithCoord,
        };
    }
}
