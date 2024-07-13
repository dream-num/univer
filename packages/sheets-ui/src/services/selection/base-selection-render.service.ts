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

import type {
    IInterceptor,
    Injector,
    IRange,
    IRangeWithCoord,
    ISelectionCell,
    ISelectionCellWithMergeInfo,
    ISelectionWithCoord,
    Nullable,
    ThemeService,
} from '@univerjs/core';
import {
    createIdentifier, Disposable, InterceptorManager, makeCellToSelection, RANGE_TYPE, UniverInstanceType } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderManagerService, IRenderModule, Scene, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import { ScrollTimer, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import type { ISelectionStyle, ISelectionWithCoordAndStyle, ISelectionWithStyle } from '@univerjs/sheets';
import { getNormalSelectionStyle, transformCellDataToSelectionData } from '@univerjs/sheets';
import type { IShortcutService } from '@univerjs/ui';
import type { Observable, Subscription } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';

import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { SHEET_COMPONENT_SELECTION_LAYER_INDEX } from '../../common/keys';
import { RANGE_FILL_PERMISSION_CHECK, RANGE_MOVE_PERMISSION_CHECK } from './const';
import { SelectionControl } from './selection-shape';
import { SelectionShapeExtension } from './selection-shape-extension';
import { attachPrimaryWithCoord, attachSelectionWithCoord } from './util';
import { SelectionLayer } from './selection-layer';

export interface IControlFillConfig {
    oldRange: IRange;
    newRange: IRange;
}

export interface ISheetSelectionRenderService {
    readonly selectionMoveEnd$: Observable<ISelectionWithCoordAndStyle[]>;
    readonly controlFillConfig$: Observable<IControlFillConfig | null>;
    readonly selectionMoving$: Observable<ISelectionWithCoordAndStyle[]>;
    readonly selectionMoveStart$: Observable<ISelectionWithCoordAndStyle[]>;

    interceptor: InterceptorManager<{
        RANGE_MOVE_PERMISSION_CHECK: IInterceptor<boolean, null>;
        RANGE_FILL_PERMISSION_CHECK: IInterceptor<boolean, { x: number; y: number; skeleton: SpreadsheetSkeleton; scene: Scene }>;
    }>;

    /** @deprecated This should not be provided by the selection render service. */
    getViewPort(): Viewport; // AutoFill

    getSkeleton(): SpreadsheetSkeleton;

    getSelectionControls(): SelectionControl[];

    // The following methods are used to get range locations in a worksheet. Though `attachRangeWithCoord` should not happens here.
    // And `attachPrimaryWithCoord` is redundant.

    /** @deprecated Use the function `attachSelectionWithCoord` instead. */
    attachSelectionWithCoord(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoordAndStyle;
    /** @deprecated Use the function `attachPrimaryWithCoord` instead`. */
    attachPrimaryWithCoord(primary: Nullable<Partial<ISelectionCell>>): Nullable<ISelectionCellWithMergeInfo>;

    getSelectionCellByPosition(x: number, y: number): Nullable<ISelectionCellWithMergeInfo>; // drawing

    setSingleSelectionEnabled(enabled: boolean): void;
}

export const ISheetSelectionRenderService = createIdentifier<ISheetSelectionRenderService>('univer.sheet.selection-render-service');

/**
 * The basic implementation of selection rendering logics. It is designed to be reused for different purposes.
 */
export class BaseSelectionRenderService extends Disposable implements ISheetSelectionRenderService, IRenderModule {
    private _downObserver: Nullable<Subscription>;
    protected _scenePointerMoveSub: Nullable<Subscription>;
    protected _scenePointerUpSub: Nullable<Subscription>;

    private _controlFillConfig$: BehaviorSubject<IControlFillConfig | null> =
        new BehaviorSubject<IControlFillConfig | null>(null);

    readonly controlFillConfig$ = this._controlFillConfig$.asObservable();

    protected _selectionControls: SelectionControl[] = []; // sheetID:Controls

    protected _startRangeWhenPointerDown: IRangeWithCoord = {
        startY: 0,
        endY: 0,
        startX: 0,
        endX: 0,
        startRow: -1,
        endRow: -1,
        startColumn: -1,
        endColumn: -1,
    };

    /**
     * the posX of viewport when the pointer down
     */
    protected _startViewportPosX: number = 0;

    /**
     * the posY of viewport when the pointer down
     */
    protected _startViewportPosY: number = 0;

    protected _scrollTimer!: ScrollTimer;

    private _cancelDownSubscription: Nullable<Subscription>;
    private _cancelUpSubscription: Nullable<Subscription>;

    protected _skeleton!: SpreadsheetSkeleton;
    protected _scene!: Scene;

    // The type of selector determines the type of data range and the highlighting style of the title bar
    protected _isHeaderHighlight: boolean = true;

    // If true, the selector will respond to the range of merged cells and automatically extend the selected range. If false, it will ignore the merged cells.
    protected _shouldDetectMergedCells: boolean = true;

    // The style of the selection area, including dashed lines, color, thickness, autofill, other points for modifying the range of the selection area, title highlighting, and so on, can all be customized.
    protected _selectionStyle!: ISelectionStyle;

    // #region ref range selection
    // we put the properties here for simplicity
    // Used in the formula selection feature, a new selection string is added by drawing a box with the mouse.
    protected _remainLastEnabled: boolean = false;
    protected _skipLastEnabled: boolean = false;
    protected _singleSelectionEnabled: boolean = false;
    // #endregion

    protected readonly _selectionMoveEnd$ = new BehaviorSubject<ISelectionWithCoordAndStyle[]>([]);
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();
    protected readonly _selectionMoving$ = new Subject<ISelectionWithCoordAndStyle[]>();
    readonly selectionMoving$ = this._selectionMoving$.asObservable();
    protected readonly _selectionMoveStart$ = new Subject<ISelectionWithCoordAndStyle[]>();
    readonly selectionMoveStart$ = this._selectionMoveStart$.asObservable();

    protected _activeViewport: Nullable<Viewport>;

    readonly interceptor = new InterceptorManager({ RANGE_MOVE_PERMISSION_CHECK, RANGE_FILL_PERMISSION_CHECK });

    constructor(
        protected readonly _injector: Injector,
        protected readonly _themeService: ThemeService,
        // WTF: why shortcutService is injected here?
        protected readonly _shortcutService: IShortcutService,
        protected readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._resetStyle();
    }

    protected _setStyle(style: ISelectionStyle) {
        this._selectionStyle = style;
    }

    protected _resetStyle() {
        this._setStyle(getNormalSelectionStyle(this._themeService));
    }

    /** @deprecated This should not be provided by the selection render service. */
    getViewPort() {
        return this._activeViewport!;
    }

    setSingleSelectionEnabled(enabled: boolean = false): void {
        this._singleSelectionEnabled = enabled;
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
     * columnHeader pointerup$ --> selectionMoveEnd$ --> selectionManagerService@setSelections -->
     * selectionManagerService@_emitOnEnd -->
     * _workbookSelections.selectionMoveEnd$ --> _addSelectionControlBySelectionData
     *
     *
     * @param selectionData
     */
    protected _addSelectionControlBySelectionData(selection: ISelectionWithCoordAndStyle) {
        const { rangeWithCoord, primaryWithCoord } = selection;
        const { rangeType } = rangeWithCoord;
        const skeleton = this._skeleton;
        const style = selection.style ?? getNormalSelectionStyle(this._themeService);

        const scene = this._scene;
        if (!scene || !skeleton) {
            return;
        }

        const control = this.newSelectionControl(scene, rangeType || RANGE_TYPE.NORMAL);

        // TODO: memory leak? This extension seems never released.
        // eslint-disable-next-line no-new
        new SelectionShapeExtension(control, skeleton, scene, this._themeService, this._injector);

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);
    }

    newSelectionControl(scene: Scene, _rangeType: RANGE_TYPE): SelectionControl {
        const selectionControls = this.getSelectionControls();

        const control = new SelectionControl(scene, selectionControls.length, this._isHeaderHighlight, this._themeService);
        this._selectionControls.push(control);

        return control;
    }

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

    protected _changeRuntime(skeleton: SpreadsheetSkeleton, scene: Scene, viewport?: Viewport) {
        this._skeleton = skeleton;
        this._scene = scene;
        this._activeViewport = viewport || scene?.getViewports()[0];

        if (!scene.findLayerByZIndex(SHEET_COMPONENT_SELECTION_LAYER_INDEX)) {
            scene.addLayer(new SelectionLayer(scene, [], SHEET_COMPONENT_SELECTION_LAYER_INDEX));
        }
    }

    getSkeleton() {
        return this._skeleton;
    }

    getSelectionDataWithStyle(): ISelectionWithCoordAndStyle[] {
        const selectionControls = this._selectionControls;
        const [unitId, sheetId] = this._skeleton.getLocation();
        return selectionControls.map((control) => {
            const v = control.getValue();
            v.rangeWithCoord.sheetId = sheetId;
            v.rangeWithCoord.unitId = unitId;
            return v;
        });
    }

    getSelectionControls() {
        return this._selectionControls;
    }

    protected _clearSelectionControls() {
        const allSelectionControls = this._selectionControls;
        for (const control of allSelectionControls) {
            control.dispose();
        }

        this._selectionControls.length = 0; // clear currentSelectionControls
    }

    protected _getFreeze() {
        const freeze = this._renderManagerService.withCurrentTypeOfUnit(UniverInstanceType.UNIVER_SHEET, SheetSkeletonManagerService)
            ?.getCurrent()?.skeleton.getWorksheetConfig().freeze;
        return freeze;
    }

    protected _getViewportByCell(row?: number, column?: number) {
        if (row === undefined || column === undefined) {
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
     * Returns the selected range in the active sheet, or null if there is no active range. If multiple ranges are selected this method returns only the last selected range.
     */
    getActiveRange(): Nullable<IRange> {
        const controls = this.getSelectionControls();
        const model = controls && controls[controls.length - 1].model;
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
     * get active selection control
     * @returns T extends SelectionControl
     */
    getActiveSelectionControl<T extends SelectionControl = SelectionControl>(): Nullable<T> {
        const controls = this.getSelectionControls();
        if (controls) {
            return controls[controls.length - 1] as T;
        }
    }

    endSelection() {
        this._clearUpdatingListeners();

        // ---> _updateSelections --> executeCommand(SetSelectionsOperation.id --> selectionManager.setSelections
        // ---> _selectionMoveEnd$.next --> _initSelectionChangeListener _reset --> _clearSelectionControls

        this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());

        // when selection mouse up, enable the short cut service
        this._shortcutService.setDisable(false);
    }

    protected _reset() {
        this._clearSelectionControls();
        this._downObserver?.unsubscribe();
        this._downObserver = null;
    }

    resetAndEndSelection() {
        this.endSelection();
        this._reset();
    }

    // TODO: @wzhudev: refactor the method to make it more readable

    /**
     *
     * @param evt component point event
     * @param style selection style, Styles for user-customized selectors
     * @param _zIndex Stacking order of the selection object
     * @param rangeType Determines whether the selection is made normally according to the range or by rows and columns
     */
    // eslint-disable-next-line max-lines-per-function, complexity
    protected _onPointerDown(
        evt: IPointerEvent | IMouseEvent,
        _zIndex = 0,
        rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL,
        viewport?: Viewport,
        scrollTimerType: ScrollTimerType = ScrollTimerType.ALL
    ) {
        this._shouldDetectMergedCells = rangeType === RANGE_TYPE.NORMAL;

        const skeleton = this._skeleton;
        const scene = this._scene;
        if (!scene || !skeleton) {
            return;
        }

        if (viewport) {
            this._activeViewport = viewport;
        }

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!viewportMain) return;
        const relativeCoords = scene.getRelativeToViewportCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        let { x: viewportPosX, y: viewportPosY } = relativeCoords;
        this._startViewportPosX = viewportPosX;
        this._startViewportPosY = viewportPosY;

        const scrollXY = scene.getVpScrollXYInfoByPosToVp(relativeCoords);
        const { scaleX, scaleY } = scene.getAncestorScale();
        const cursorCellRangeInfo = this._getCellRangeByCursorPosition(viewportPosX, viewportPosY, scaleX, scaleY, scrollXY);
        if (!cursorCellRangeInfo) return false;

        const { rangeWithCoord: cursorCellRange, primaryWithCoord: primaryCursorCellRange } = cursorCellRangeInfo;
        const cursorCellRangeWithRangeType: IRangeWithCoord = { ...cursorCellRange, rangeType };
        this._startRangeWhenPointerDown = { ...cursorCellRange, rangeType };

        let activeSelectionControl: Nullable<SelectionControl> = this.getActiveSelectionControl();
        const curControls = this.getSelectionControls();
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
            if (!evt.shiftKey) {
                control.clearHighlight();
            }
        }

        this._checkClearPreviousControls(evt);

        const currentCell = activeSelectionControl?.model.currentCell;
        const expandByShiftKey = evt.shiftKey && currentCell;
        const remainLastEnable = this._remainLastEnabled &&
            !evt.ctrlKey &&
            !evt.shiftKey &&
            !this._skipLastEnabled &&
            !this._singleSelectionEnabled;

        //#region update selection control
        if (expandByShiftKey && currentCell) {
            // Perform pointer down selection.
            this._performSelectionByTwoCells(
                currentCell,
                cursorCellRangeWithRangeType,
                skeleton,
                rangeType,
                activeSelectionControl! // Get updated in this method
            );
        } else if (remainLastEnable && activeSelectionControl) {
            // Supports the formula ref text selection feature,
            // under the condition of preserving all previous selections, it modifies the position of the latest selection.
            this._updateSelectionControlRange(
                activeSelectionControl,
                cursorCellRangeWithRangeType,
                primaryCursorCellRange
            );
        } else {
            // Create new control as default
            activeSelectionControl = this.newSelectionControl(scene, rangeType);
            this._updateSelectionControlRange(
                activeSelectionControl,
                cursorCellRangeWithRangeType,
                primaryCursorCellRange
            );
        }
        //#endregion

        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());

        scene.disableEvent();
        this._clearUpdatingListeners();
        this._addEndingListeners();

        scene.getTransformer()?.clearSelectedObjects();

        if (rangeType === RANGE_TYPE.ROW || rangeType === RANGE_TYPE.COLUMN) {
            if (rangeType === RANGE_TYPE.ROW) {
                viewportPosX = 0;
            } else if (rangeType === RANGE_TYPE.COLUMN) {
                viewportPosY = 0;
            }
            this._moving(viewportPosX, viewportPosY, activeSelectionControl, rangeType);
        }

        this._setupPointerMoveListener(viewportMain, activeSelectionControl!, rangeType, scrollTimerType, viewportPosX, viewportPosY);

        this._shortcutService.setDisable(true);
        this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent(() => {
            this._clearUpdatingListeners();
            this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
            this._shortcutService.setDisable(false);
        });
    }

    // eslint-disable-next-line max-lines-per-function
    protected _setupPointerMoveListener(
        viewportMain: Nullable<Viewport>,
        activeSelectionControl: SelectionControl,
        rangeType: RANGE_TYPE,
        scrollTimerType: ScrollTimerType = ScrollTimerType.ALL,
        moveStartPosX: number,
        moveStartPosY: number
    ): void {
        let xCrossTime = 0;
        let yCrossTime = 0;
        let lastX = moveStartPosX;
        let lastY = moveStartPosY;
        this._scrollTimer = ScrollTimer.create(this._scene, scrollTimerType);
        this._scrollTimer.startScroll(viewportMain?.left ?? 0, viewportMain?.top ?? 0, viewportMain);

        const scene = this._scene;
        const startViewport = scene.getActiveViewportByCoord(Vector2.FromArray([moveStartPosX, moveStartPosY]));

        // #region onPointerMove$
        // eslint-disable-next-line max-lines-per-function, complexity
        this._scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeToViewportCoord(Vector2.FromArray([moveOffsetX, moveOffsetY]));

            this._moving(newMoveOffsetX, newMoveOffsetY, activeSelectionControl, rangeType);

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
                        viewportMain.scrollToViewportPos({
                            viewportScrollY: 0,
                        });
                    }
                } else if (startKey === SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT) {
                    if (moveOffsetX < viewportMain.left && (selection?.endColumn ?? 0) < (freeze?.startColumn ?? 0)) {
                        scrollOffsetX = viewportMain.left;
                    } else if (isCrossingX && xCrossTime % 2 === 1) {
                        viewportMain.scrollToViewportPos({
                            viewportScrollX: 0,
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
                    const shouldResetX = startXY.x !== endXY.x && isCrossingX && xCrossTime % 2 === 1;
                    const shouldResetY = startXY.y !== endXY.y && isCrossingY && yCrossTime % 2 === 1;

                    if (shouldResetX || shouldResetY) {
                        viewportMain.scrollToBarPos({
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

            this._scrollTimer.scrolling(scrollOffsetX, scrollOffsetY, () => {
                this._moving(newMoveOffsetX, newMoveOffsetY, activeSelectionControl, rangeType);
            });
        });
        // #endregion
    }

    /** @deprecated Use the function `attachSelectionWithCoord` instead`. */
    attachSelectionWithCoord(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoordAndStyle {
        return attachSelectionWithCoord(selectionWithStyle, this._skeleton);
    }

    /** @deprecated Use the function `attachPrimaryWithCoord` instead`. */
    attachPrimaryWithCoord(primary: ISelectionCell): ISelectionCellWithMergeInfo {
        return attachPrimaryWithCoord(primary, this._skeleton) as unknown as ISelectionCellWithMergeInfo;
    }

    getSelectionCellByPosition(x: number, y: number) {
        const scene = this._scene;
        const skeleton = this._skeleton;
        const scrollXY = scene.getViewportScrollXY(scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!);
        const { scaleX, scaleY } = scene.getAncestorScale();

        return skeleton.calculateCellIndexByPosition(
            x,
            y,
            scaleX,
            scaleY,
            scrollXY
        ) as Nullable<ISelectionCellWithMergeInfo>;
    }

    /**
     * When mousedown and mouseup need to go to the coordination and undo stack, when mousemove does not need to go to the coordination and undo stack
     */
    // eslint-disable-next-line max-lines-per-function
    protected _moving(
        offsetX: number,
        offsetY: number,
        activeSelectionControl: Nullable<SelectionControl>,
        rangeType: RANGE_TYPE
    ) {
        const skeleton = this._skeleton;
        const scene = this._scene;
        const [unitId, sheetId] = skeleton.getLocation();

        const currSelectionRange: IRange = {
            startRow: activeSelectionControl?.model.startRow ?? -1,
            endRow: activeSelectionControl?.model.endRow ?? -1,
            startColumn: activeSelectionControl?.model.startColumn ?? -1,
            endColumn: activeSelectionControl?.model.endColumn ?? -1,
            unitId,
            sheetId,
        };

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!;

        const targetViewport = this._getViewportByCell(currSelectionRange.endRow, currSelectionRange.endColumn) ?? viewportMain;

        const scrollXY = scene.getVpScrollXYInfoByPosToVp(
            Vector2.FromArray([this._startViewportPosX, this._startViewportPosY]),
            targetViewport
        );

        const { scaleX, scaleY } = scene.getAncestorScale();

        if (rangeType === RANGE_TYPE.ROW) {
            offsetX = Number.POSITIVE_INFINITY;
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            offsetY = Number.POSITIVE_INFINITY;
        }

        const cursorCellRangeInfo = this._getCellRangeByCursorPosition(offsetX, offsetY, scaleX, scaleY, scrollXY);
        if (!cursorCellRangeInfo) {
            return false;
        }

        const { rangeWithCoord: cursorCellRange } = cursorCellRangeInfo;
        const activeCellRange = this._startRangeWhenPointerDown;

        let newSelectionRange: IRange = {
            startRow: Math.min(cursorCellRange.startRow, activeCellRange.startRow),
            startColumn: Math.min(cursorCellRange.startColumn, activeCellRange.startColumn),
            endRow: Math.max(cursorCellRange.endRow, activeCellRange.endRow),
            endColumn: Math.max(cursorCellRange.endColumn, activeCellRange.endColumn),
        };

        if (this._shouldDetectMergedCells) {
            newSelectionRange = skeleton.getSelectionMergeBounding(newSelectionRange.startRow, newSelectionRange.startColumn, newSelectionRange.endRow, newSelectionRange.endColumn);
        }

        if (!newSelectionRange) {
            return false;
        }

        const startCellXY = skeleton.getNoMergeCellPositionByIndex(newSelectionRange.startRow, newSelectionRange.startColumn);
        const endCellXY = skeleton.getNoMergeCellPositionByIndex(newSelectionRange.endRow, newSelectionRange.endColumn);

        const newSelectionRangeWithCoord: IRangeWithCoord = {
            startRow: newSelectionRange.startRow,
            startColumn: newSelectionRange.startColumn,
            endRow: newSelectionRange.endRow,
            endColumn: newSelectionRange.endColumn,
            unitId,
            sheetId,
            startY: startCellXY?.startY || 0,
            endY: endCellXY?.endY || 0,
            startX: startCellXY?.startX || 0,
            endX: endCellXY?.endX || 0,
        };
        // Only notify when the selection changes

        const rangeChanged =
            currSelectionRange.startRow !== newSelectionRange.startRow ||
            currSelectionRange.startColumn !== newSelectionRange.startColumn ||
            currSelectionRange.endRow !== newSelectionRange.endRow ||
            currSelectionRange.endColumn !== newSelectionRange.endColumn;
        if (activeSelectionControl != null && rangeChanged) {
            this._updateSelectionControlRange(activeSelectionControl, newSelectionRangeWithCoord);
            this._selectionMoving$.next(this.getSelectionDataWithStyle());
        }
    }

    protected _updateSelectionControlRange(control: SelectionControl, newSelectionRange: IRangeWithCoord, highlight: Nullable<ISelectionCellWithMergeInfo>) {
        const skeleton = this._skeleton;
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        control.update(newSelectionRange, rowHeaderWidth, columnHeaderHeight, this._selectionStyle, !highlight ? null : highlight);
    }

    protected _clearUpdatingListeners() {
        const scene = this._scene;
        scene.enableEvent();

        this._scenePointerMoveSub?.unsubscribe();
        this._scenePointerMoveSub = null;
        this._scenePointerUpSub?.unsubscribe();
        this._scenePointerUpSub = null;
        this._cancelDownSubscription?.unsubscribe();
        this._cancelDownSubscription = null;
        this._cancelUpSubscription?.unsubscribe();
        this._cancelUpSubscription = null;
        this._scrollTimer?.dispose();
    }

    protected _addEndingListeners() {
        const scene = this._scene!;
        const mainScene = scene.getEngine()?.activeScene;
        if (!mainScene || mainScene === scene) {
            return;
        }

        this._cancelDownSubscription?.unsubscribe();
        this._cancelDownSubscription = null;
        this._cancelUpSubscription?.unsubscribe();
        this._cancelUpSubscription = null;

        this._cancelDownSubscription = mainScene.onPointerDown$.subscribeEvent(() => this._clearUpdatingListeners());
        this._cancelUpSubscription = mainScene.onPointerUp$.subscribeEvent(() => this._clearUpdatingListeners());
    }

    protected _getCellRangeByCursorPosition(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number }
    ): Nullable<ISelectionWithCoord> {
        if (this._shouldDetectMergedCells) {
            const primaryWithCoord = this._skeleton?.calculateCellIndexByPosition(
                offsetX,
                offsetY,
                scaleX,
                scaleY,
                scrollXY
            );

            if (!primaryWithCoord) return;

            const rangeWithCoord = makeCellToSelection(primaryWithCoord);
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

    protected _checkClearPreviousControls(evt: IPointerEvent | IMouseEvent) {
        const curControls = this.getSelectionControls();
        if (curControls.length === 0) return;

        // In addition to pressing the ctrl or shift key, we must clear the previous selection.
        if (
            (!evt.ctrlKey && !evt.shiftKey && !this._remainLastEnabled) ||
            (this._singleSelectionEnabled && !evt.shiftKey)
        ) {
            this._clearSelectionControls();
        }
    }

    private _performSelectionByTwoCells(
        currentCell: ISelectionCellWithMergeInfo,
        startSelectionRange: IRangeWithCoord,
        skeleton: SpreadsheetSkeleton,
        rangeType: RANGE_TYPE,
        activeControl: SelectionControl
    ): void {
        const { actualRow, actualColumn, mergeInfo: actualMergeInfo } = currentCell;

        // Get the maximum range selected based on the two cells selected with Shift key.
        const newStartRow = Math.min(actualRow, startSelectionRange.startRow, actualMergeInfo.startRow);
        const newEndRow = Math.max(actualRow, startSelectionRange.endRow, actualMergeInfo.endRow);
        const newStartColumn = Math.min(actualColumn, startSelectionRange.startColumn, actualMergeInfo.startColumn);
        const newEndColumn = Math.max(actualColumn, startSelectionRange.endColumn, actualMergeInfo.endColumn);

        /**
         * Calculate whether there are merged cells within the range. If there are, recursively expand the selection again.
         */
        const bounding = skeleton.getMergeBounding(newStartRow, newStartColumn, newEndRow, newEndColumn);

        const startCell = skeleton.getNoMergeCellPositionByIndex(bounding.startRow, bounding.startColumn);

        const endCell = skeleton.getNoMergeCellPositionByIndex(bounding.endRow, bounding.endColumn);

        const newSelectionRange = {
            startColumn: bounding.startColumn,
            startRow: bounding.startRow,
            endColumn: bounding.endColumn,
            endRow: bounding.endRow,

            startY: startCell.startY,
            endY: endCell.endY,
            startX: startCell.startX,
            endX: endCell.endX,

            rangeType,
        };

        /**
         * When expanding the selection with the Shift key,
         * the original highlighted cell should remain unchanged.
         * If the highlighted cell is a merged cell, the selection needs to be expanded.
         */
        const activeCell = skeleton.getCellByIndex(actualRow, actualColumn);

        this._startRangeWhenPointerDown = {
            startColumn: activeCell.mergeInfo.startColumn,
            startRow: activeCell.mergeInfo.startRow,
            endColumn: activeCell.mergeInfo.endColumn,
            endRow: activeCell.mergeInfo.endRow,
            startY: activeCell.mergeInfo.startY || 0,
            endY: activeCell.mergeInfo.endY || 0,
            startX: activeCell.mergeInfo.startX || 0,
            endX: activeCell.mergeInfo.endX || 0,
            rangeType,
        };
        this._updateSelectionControlRange(activeControl, newSelectionRange, currentCell);
    }
}

export function getAllSelection(skeleton: SpreadsheetSkeleton): ISelectionWithStyle {
    return {
        range: {
            startRow: 0,
            startColumn: 0,
            endRow: skeleton.getRowCount() - 1,
            endColumn: skeleton.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ALL,
        },
        primary: getTopLeftSelection(skeleton).primary,
        style: null,
    };
}

export function getTopLeftSelection(skeleton: SpreadsheetSkeleton) {
    const mergeData = skeleton.mergeData;
    return (
        transformCellDataToSelectionData(0, 0, mergeData) || {
            range: {
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
            },
            primary: {
                actualRow: 0,
                actualColumn: 0,
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }
    );
}
