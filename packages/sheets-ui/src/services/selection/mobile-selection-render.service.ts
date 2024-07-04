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
    IRange,
    IRangeWithCoord,
    ISelection,
    ISelectionCell,
    ISelectionCellWithMergeInfo,
    ISelectionWithCoord,
    Nullable,
} from '@univerjs/core';
import { InterceptorManager, makeCellToSelection, RANGE_TYPE, ThemeService, UniverInstanceType } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, Scene, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import { IRenderManagerService, ScrollTimer, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import type { ISelectionStyle, ISelectionWithCoordAndStyle, ISelectionWithStyle } from '@univerjs/sheets';
import { getNormalSelectionStyle } from '@univerjs/sheets';
import { IShortcutService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import type { Subscription } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';

import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import type { SelectionRenderModel } from './selection-render-model';
import type { SelectionControl } from './selection-shape';
import { type IControlFillConfig, type ISelectionRenderService, RANGE_FILL_PERMISSION_CHECK, RANGE_MOVE_PERMISSION_CHECK } from './selection-render.service';
import { MobileSelectionControl } from './mobile-selection-shape';
import { SelectionShapeExtension } from './selection-shape-extension';

enum ExpandingControl {
    BOTTOM_RIGHT = 'bottom-right',
    TOP_LEFT = 'top-left',
    LEFT = 'left',
    RIGHT = 'right',
    TOP = 'top',
    BOTTOM = 'bottom',
}
export class MobileSelectionRenderService implements ISelectionRenderService {
    hasSelection: boolean = false;

    private _pointerdownSub: Nullable<Subscription>;

    private _mainScenePointerUpSub: Nullable<Subscription>;

    private _scenePointerMoveSub: Nullable<Subscription>;

    private _scenePointerUpSub: Nullable<Subscription>;

    private _controlFillConfig$: BehaviorSubject<IControlFillConfig | null> =
        new BehaviorSubject<IControlFillConfig | null>(null);

    readonly controlFillConfig$ = this._controlFillConfig$.asObservable();

    private _selectionControls: SelectionControl[] = []; // sheetID:Controls

    private _activeCellRangeOfCurrSelection: IRangeWithCoord = {
        startY: 0,
        endY: 0,
        startX: 0,
        endX: 0,
        startRow: -1,
        endRow: -1,
        startColumn: -1,
        endColumn: -1,
    };

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _scrollTimer!: ScrollTimer;

    private _skeleton: Nullable<SpreadsheetSkeleton>;

    private _scene: Nullable<Scene>;

    // The type of selector determines the type of data range and the highlighting style of the title bar
    private _isHeaderHighlight: boolean = true;

    // If true, the selector will respond to the range of merged cells and automatically extend the selected range. If false, it will ignore the merged cells.
    private _isDetectMergedCell: boolean = true;

    // The style of the selection area, including dashed lines, color, thickness, autofill, other points for modifying the range of the selection area, title highlighting, and so on, can all be customized.
    private _selectionStyle!: ISelectionStyle;

    // Whether to enable the selection area. If set to false, the user cannot draw a selection area in the content area by clicking with the mouse.
    private _isSelectionEnabled: boolean = true;

    // Used in the format painter feature, similar to ctrl, it can retain the previous selection.
    private _isShowPreviousEnable: boolean | number = 0;

    //Used in the formula selection feature, a new selection string is added by drawing a box with the mouse.
    private _isRemainLastEnable: boolean = true;

    private _isSkipRemainLastEnable: boolean = false;

    private _isSingleSelection: boolean = false; // Multiple selections are prohibited

    private readonly _selectionMoveEnd$ = new BehaviorSubject<ISelectionWithCoordAndStyle[]>([]);

    // When the user draws a selection area in the canvas content area, this event is broadcasted when the drawing ends.
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();

    private readonly _selectionMoving$ = new Subject<ISelectionWithCoordAndStyle[]>();

    /**
     * Triggered during the drawing of the selection area.
     */
    readonly selectionMoving$ = this._selectionMoving$.asObservable();

    private readonly _selectionMoveStart$ = new Subject<ISelectionWithCoordAndStyle[]>();

    /**
     * Triggered during the start draw the selection area.
     */
    readonly selectionMoveStart$ = this._selectionMoveStart$.asObservable();

    private _activeViewport: Nullable<Viewport>;

    /**
     * This service relies on the scene and skeleton to work
     * Use usable$ to check if this service works
     */
    private readonly _usable$ = new BehaviorSubject<boolean>(false);

    readonly usable$ = this._usable$.asObservable();
    public interceptor = new InterceptorManager({ RANGE_MOVE_PERMISSION_CHECK, RANGE_FILL_PERMISSION_CHECK });
    expandingControlMode: ExpandingControl = ExpandingControl.BOTTOM_RIGHT;

    constructor(
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        this._selectionStyle = getNormalSelectionStyle(this._themeService);
    }

    enableHeaderHighlight() {
        this._isHeaderHighlight = true;
    }

    disableHeaderHighlight() {
        this._isHeaderHighlight = false;
    }

    enableDetectMergedCell() {
        this._isDetectMergedCell = true;
    }

    disableDetectMergedCell() {
        this._isDetectMergedCell = false;
    }

    setStyle(style: ISelectionStyle) {
        this._selectionStyle = style;
    }

    resetStyle() {
        this.setStyle(getNormalSelectionStyle(this._themeService));
    }

    enableSelection() {
        this._isSelectionEnabled = true;
    }

    disableSelection() {
        this._isSelectionEnabled = false;
    }

    enableShowPrevious() {
        this._isShowPreviousEnable = true;
    }

    disableShowPrevious() {
        this._isShowPreviousEnable = false;
    }

    enableRemainLast() {
        this._isRemainLastEnable = true;
    }

    disableRemainLast() {
        this._isRemainLastEnable = false;
    }

    enableSkipRemainLast() {
        this._isSkipRemainLastEnable = true;
    }

    disableSkipRemainLast() {
        this._isSkipRemainLastEnable = false;
    }

    enableSingleSelection() {
        this._isSingleSelection = true;
    }

    disableSingleSelection() {
        this._isSingleSelection = false;
    }

    getViewPort() {
        return this._activeViewport!;
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
    addSelectionControlBySelectionData(selectionData: ISelectionWithCoordAndStyle) {
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

    newSelectionControl(scene: Scene, rangeType: RANGE_TYPE) {
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

    refreshSelectionMoveStart() {
        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
    }

    changeRuntime(skeleton: Nullable<SpreadsheetSkeleton>, scene: Nullable<Scene>, viewport?: Viewport) {
        this._skeleton = skeleton;
        this._scene = scene;
        this._activeViewport = viewport || scene?.getViewports()[0];
        this._usable$.next(Boolean(skeleton && scene));
    }

    getSelectionDataWithStyle(): ISelectionWithCoordAndStyle[] {
        const selectionControls = this._selectionControls;
        return selectionControls.map((control) => control.getValue());
    }

    getSelectionControls() {
        return this._selectionControls;
    }

    private _clearSelectionControls() {
        const allSelectionControls = this.getSelectionControls();
        for (const control of allSelectionControls) {
            control.dispose();
        }

        allSelectionControls.length = 0; // clear currentSelectionControls
    }

    private _getFreeze() {
        const freeze = this._renderManagerService.withCurrentTypeOfUnit(UniverInstanceType.UNIVER_SHEET, SheetSkeletonManagerService)
            ?.getCurrent()?.skeleton.getWorksheetConfig().freeze;
        return freeze;
    }

    private _getViewportByCell(row?: number, column?: number) {
        if (!this._scene || row === undefined || column === undefined) {
            return null;
        }
        const freeze = this._getFreeze();
        if (!freeze || (freeze.startRow <= 0 && freeze.startColumn <= 0)) {
            return this._scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        }

        if (row > freeze.startRow && column > freeze.startColumn) {
            return this._scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        }

        if (row <= freeze.startRow && column <= freeze.startColumn) {
            return this._scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP);
        }

        if (row <= freeze.startRow && column > freeze.startColumn) {
            return this._scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP);
        }

        if (row > freeze.startRow && column <= freeze.startColumn) {
            return this._scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT);
        }
    }

    /**
     * Returns the list of active ranges in the active sheet or null if there are no active ranges.
     * If there is a single range selected, this method behaves like a getActiveRange() call.
     */
    getActiveSelections(): Nullable<ISelection[]> {
        const controls = this.getSelectionControls();
        if (controls && controls.length > 0) {
            const selections = controls?.map((control: SelectionControl) => {
                const model: SelectionRenderModel = control.model;
                const currentCell = model.currentCell;
                let primary: Nullable<ISelectionCell> = null;
                if (currentCell) {
                    primary = {
                        actualRow: currentCell.actualRow,
                        actualColumn: currentCell.actualColumn,
                        isMerged: currentCell.isMerged,
                        isMergedMainCell: currentCell.isMergedMainCell,
                        startRow: currentCell.mergeInfo.startRow,
                        startColumn: currentCell.mergeInfo.startColumn,
                        endRow: currentCell.mergeInfo.endRow,
                        endColumn: currentCell.mergeInfo.endColumn,
                    };
                }
                return {
                    range: {
                        startRow: model.startRow,
                        startColumn: model.startColumn,
                        endRow: model.endRow,
                        endColumn: model.endColumn,
                    },
                    primary,
                };
            });
            return selections;
        }
    }

    /**
     * Returns the selected range in the active sheet, or null if there is no active range. If multiple ranges are selected this method returns only the last selected range.
     */
    getActiveRange(): Nullable<IRange> {
        const control = this.getActiveSelectionControl();
        const model = control?.model;
        return (
            model && {
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            }
        );
    }

    /**
     * get last selection control
     */
    getActiveSelectionControl(): Nullable<SelectionControl> {
        const controls = this.getSelectionControls();
        return controls && controls[controls.length - 1];
    }

    endSelection() {
        this._endSelection();
        this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());

        // when selection mouse up, enable the short cut service
        this._shortcutService.setDisable(false);
    }

    reset() {
        this._clearSelectionControls();

        this._scenePointerMoveSub?.unsubscribe();
        this._scenePointerUpSub?.unsubscribe();

        this._scenePointerMoveSub = null;
        this._scenePointerUpSub = null;
    }

    resetAndEndSelection() {
        this.endSelection();
        this.reset();
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
    eventTrigger(
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
        const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        let { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        this._startOffsetX = newEvtOffsetX;
        this._startOffsetY = newEvtOffsetY;

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

        this._startOffsetX = newEvtOffsetX;
        this._startOffsetY = newEvtOffsetY;

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

    getSelectionCellByPosition(x: number, y: number) {
        const scene = this._scene;

        if (scene == null) {
            return;
        }

        const skeleton = this._renderManagerService.withCurrentTypeOfUnit(UniverInstanceType.UNIVER_SHEET, SheetSkeletonManagerService)?.getCurrent()?.skeleton;
        if (skeleton == null) {
            return;
        }

        // const scrollXY = scene.getScrollXYByRelativeCoords(Vector2.FromArray([this._startOffsetX, this._startOffsetY]));
        const scrollXY = scene.getScrollXY(scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!);
        const { scaleX, scaleY } = scene.getAncestorScale();

        return skeleton.calculateCellIndexByPosition(
            x,
            y,
            scaleX,
            scaleY,
            scrollXY
        );
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

        const activeSelectionRange: IRange = {
            startRow: activeSelectionControl?.model.startRow ?? -1,
            endRow: activeSelectionControl?.model.endRow ?? -1,
            startColumn: activeSelectionControl?.model.startColumn ?? -1,
            endColumn: activeSelectionControl?.model.endColumn ?? -1,
        };

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!;

        const targetViewport = this._getViewportByCell(activeSelectionRange.endRow, activeSelectionRange.endColumn) ?? viewportMain;

        const scrollXY = scene.getScrollXYByRelativeCoords(
            Vector2.FromArray([this._startOffsetX, this._startOffsetY]),
            targetViewport
        );

        const { scaleX, scaleY } = scene.getAncestorScale();

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

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

        if (this._isDetectMergedCell) {
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
            activeSelectionRange.startRow !== newSelectionRange.startRow ||
            activeSelectionRange.startColumn !== newSelectionRange.startColumn ||
            activeSelectionRange.endRow !== newSelectionRange.endRow ||
            activeSelectionRange.endColumn !== newSelectionRange.endColumn
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
