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
    IActualCellWithCoord,
    IDisposable,
    IFreeze,
    IInterceptor,
    Injector,
    IRange,
    IRangeWithCoord,
    ISelectionCell,
    ISelectionWithCoord,
    Nullable,
    ThemeService,
} from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderModule, Scene, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import type { ISelectionWithCoordAndStyle, ISelectionWithStyle, IStyleForSelection } from '@univerjs/sheets';
import type { IShortcutService } from '@univerjs/ui';
import type { Observable, Subscription } from 'rxjs';
import type { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { convertCellToRange, createIdentifier, Disposable, InterceptorManager, RANGE_TYPE } from '@univerjs/core';
import { ScrollTimer, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';

import { BehaviorSubject, Subject } from 'rxjs';
import { SHEET_COMPONENT_SELECTION_LAYER_INDEX } from '../../common/keys';
import { genNormalSelectionStyle, RANGE_FILL_PERMISSION_CHECK, RANGE_MOVE_PERMISSION_CHECK } from './const';
import { SelectionControl } from './selection-control';
import { SelectionLayer } from './selection-layer';
import { SelectionShapeExtension } from './selection-shape-extension';
import { attachPrimaryWithCoord, attachSelectionWithCoord } from './util';

export interface IControlFillConfig {
    oldRange: IRange;
    newRange: IRange;
}

export interface ISheetSelectionRenderService {
    readonly selectionMoveEnd$: Observable<ISelectionWithCoordAndStyle[]>;
    readonly controlFillConfig$: Observable<IControlFillConfig | null>;
    readonly selectionMoving$: Observable<ISelectionWithCoordAndStyle[]>;
    readonly selectionMoveStart$: Observable<ISelectionWithCoordAndStyle[]>;

    get selectionMoving(): boolean;

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
    attachPrimaryWithCoord(primary: Nullable<Partial<ISelectionCell>>): Nullable<IActualCellWithCoord>;

    /**
     * @deprecated Please use `getCellWithCoordByOffset` instead.
     */
    getSelectionCellByPosition(x: number, y: number): IActualCellWithCoord;

    getCellWithCoordByOffset(x: number, y: number): Nullable<IActualCellWithCoord>; // drawing

    setSingleSelectionEnabled(enabled: boolean): void;

    refreshSelectionMoveEnd(): void;
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

    // The type of selector determines the type of data range and the highlighting style of the title bar, now it always true. In future, this could be configurable by user.
    protected _isHeaderHighlight: boolean = true;

    // protected _shouldDetectMergedCells: boolean = true;
    protected _rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL;

    // The style of the selection area, including dashed lines, color, thickness, autofill, other points for modifying the range of the selection area, title highlighting, and so on, can all be customized.
    protected _selectionStyle!: IStyleForSelection;

    // #region ref range selection
    // we put the properties here for simplicity
    // Used in the formula selection feature, a new selection string is added by drawing a box with the mouse.
    protected _remainLastEnabled: boolean = false;
    protected _skipLastEnabled: boolean = false;
    protected _singleSelectionEnabled: boolean = false;
    // #endregion

    /**
     * Mainly emit by pointerup (pointerup is handled in _onPointerdown)
     */
    protected readonly _selectionMoveEnd$ = new BehaviorSubject<ISelectionWithCoordAndStyle[]>([]);
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();
    protected readonly _selectionMoving$ = new Subject<ISelectionWithCoordAndStyle[]>();
    readonly selectionMoving$ = this._selectionMoving$.asObservable();

    /**
     * Mainly emit by pointerdown
     */
    protected readonly _selectionMoveStart$ = new Subject<ISelectionWithCoordAndStyle[]>();
    readonly selectionMoveStart$ = this._selectionMoveStart$.asObservable();

    private _selectionMoving = false;
    get selectionMoving(): boolean {
        return this._selectionMoving;
    }

    protected _activeViewport: Nullable<Viewport>;

    readonly interceptor = new InterceptorManager({ RANGE_MOVE_PERMISSION_CHECK, RANGE_FILL_PERMISSION_CHECK });

    protected _escapeShortcutDisposable: Nullable<IDisposable> = null;

    constructor(
        protected readonly _injector: Injector,
        protected readonly _themeService: ThemeService,
        // WTF: why shortcutService is injected here?
        protected readonly _shortcutService: IShortcutService,
        protected readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();
        this._resetSelectionStyle();
        this._initMoving();
    }

    /**
     * If true, the selector will respond to the range of merged cells and automatically extend the selected range. If false, it will ignore the merged cells.
     */
    private get _shouldDetectMergedCells(): boolean {
        return this._rangeType === RANGE_TYPE.NORMAL;
    }

    private _initMoving(): void {
        this.disposeWithMe(this._selectionMoving$.subscribe(() => {
            this._selectionMoving = true;
        }));

        this.disposeWithMe(this._selectionMoveEnd$.subscribe(() => {
            this._selectionMoving = false;
        }));
    }

    protected _setSelectionStyle(style: IStyleForSelection): void {
        this._selectionStyle = style;
    }

    /**
     * Reset this._selectionStyle to default normal selection style
     */
    protected _resetSelectionStyle(): void {
        this._setSelectionStyle(genNormalSelectionStyle(this._themeService));
    }

    /** @deprecated This should not be provided by the selection render service. */
    getViewPort(): Viewport {
        return this._activeViewport!;
    }

    setSingleSelectionEnabled(enabled: boolean = false): void {
        this._singleSelectionEnabled = enabled;
    }

    /**
     * Add a selection in spreadsheet, create a new SelectionControl and then update this control by range derives from selection.
     * @param {ISelectionWithCoordAndStyle} selectionWithCoord
     */
    protected _addSelectionControlBySelectionData(selectionWithCoord: ISelectionWithCoordAndStyle): void {
        const skeleton = this._skeleton;
        const style = selectionWithCoord.style ?? genNormalSelectionStyle(this._themeService);
        const scene = this._scene;
        if (!scene || !skeleton) {
            return;
        }

        const { rangeWithCoord, primaryWithCoord } = selectionWithCoord;
        const { rangeType } = rangeWithCoord;
        const control = this.newSelectionControl(scene, rangeType || RANGE_TYPE.NORMAL, skeleton);

        // TODO: memory leak? This extension seems never released.
        // eslint-disable-next-line no-new
        new SelectionShapeExtension(control, skeleton, scene, this._themeService, this._injector, {
            selectionMoveEnd: (): void => {
                this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
            },
        });

        control.updateRange(rangeWithCoord, primaryWithCoord);
        control.updateStyle(style);
    }

    newSelectionControl(scene: Scene, _rangeType: RANGE_TYPE, skeleton: SpreadsheetSkeleton): SelectionControl {
        const zIndex = this.getSelectionControls().length;
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        const control = new SelectionControl(scene, zIndex, this._themeService, {
            highlightHeader: this._isHeaderHighlight,
            rowHeaderWidth,
            columnHeaderHeight,
        });
        this._selectionControls.push(control);

        return control;
    }

    /**
     * Update the corresponding selectionControl based on selectionsData.
     * selectionData[i] syncs selectionControls[i]
     * @param selectionsWithCoord
     */
    updateControlForCurrentByRangeData(selectionsWithCoord: ISelectionWithCoordAndStyle[]): void {
        const selectionControls = this.getSelectionControls();
        if (!selectionControls) {
            return;
        }

        const skeleton = this._skeleton;

        if (skeleton == null) {
            return;
        }

        // const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        // TODO @lumixraku This is awful!
        // SelectionControls should create & remove base on selections.
        // If selections is more than selectionControls, create new selectionControl, if selections is less than selectionControls, remove the last one.
        for (let i = 0, len = selectionsWithCoord.length; i < len; i++) {
            const { rangeWithCoord, primaryWithCoord } = selectionsWithCoord[i];

            const control = selectionControls[i];
            if (control) {
                control.updateRange(rangeWithCoord, primaryWithCoord);
            }
            // control && control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);
        }
    }

    refreshSelectionMoveStart(): void {
        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
    }

    refreshSelectionMoveEnd(): void {
        this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
    }

    protected _changeRuntime(skeleton: SpreadsheetSkeleton, scene: Scene, viewport?: Viewport): void {
        this._skeleton = skeleton;
        this._scene = scene;
        this._activeViewport = viewport || scene?.getViewports()[0];

        if (!scene.findLayerByZIndex(SHEET_COMPONENT_SELECTION_LAYER_INDEX)) {
            scene.addLayer(new SelectionLayer(scene, [], SHEET_COMPONENT_SELECTION_LAYER_INDEX));
        }
    }

    getSkeleton(): SpreadsheetSkeleton {
        return this._skeleton;
    }

    /**
     * Generate selectionData from this._selectionControls.model .
     * @returns {ISelectionWithCoordAndStyle[]} {range, primary, style}[]
     */
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

    /**
     * @TODO lumixraku DO NOT expose private props.
     */
    getSelectionControls(): SelectionControl[] {
        return this._selectionControls;
    }

    protected _clearAllSelectionControls(): void {
        const allSelectionControls = this._selectionControls;
        for (const control of allSelectionControls) {
            control.dispose();
        }

        this._selectionControls.length = 0; // clear currentSelectionControls
    }

    protected _getFreeze(): Nullable<IFreeze> {
        const freeze = this._sheetSkeletonManagerService.getCurrent()?.skeleton.getWorksheetConfig().freeze;
        return freeze;
    }

    protected _getViewportByCell(row?: number, column?: number): Nullable<Viewport> {
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
     * get active(actually last) selection control
     * @returns T extends SelectionControl
     */
    getActiveSelectionControl<T extends SelectionControl = SelectionControl>(): Nullable<T> {
        const controls = this.getSelectionControls();
        if (controls) {
            return controls[controls.length - 1] as T;
        }
    }

    endSelection(): void {
        this._clearUpdatingListeners();
        this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());

        // when selection mouse up, enable the short cut service
        this._escapeShortcutDisposable?.dispose();
        this._escapeShortcutDisposable = null;
    }

    /**
     * Clear existed selections by workbookSelections.selectionMoveEnd$
     */
    protected _reset(): void {
        this._clearAllSelectionControls();
        this._downObserver?.unsubscribe();
        this._downObserver = null;
    }

    // resetAndEndSelection(): void {
    //     this.endSelection();
    //     this._reset();
    // }

    // TODO: @wzhudev: refactor the method to make it more readable

    /**
     * Init pointer move listener in each pointer down, unbind in each pointer up.
     * Both cell selections and row-column selections are supported by this method.
     * @param viewportMain
     * @param activeSelectionControl
     * @param rangeType
     * @param scrollTimerType
     * @param moveStartPosX
     * @param moveStartPosY
     */
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

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getCoordRelativeToViewport(Vector2.FromArray([moveOffsetX, moveOffsetY]));

            this._movingHandler(newMoveOffsetX, newMoveOffsetY, activeSelectionControl, rangeType);

            let scrollOffsetX = newMoveOffsetX;
            let scrollOffsetY = newMoveOffsetY;

            //#region selection cross freezing line
            const currentSelection = this.getActiveSelectionControl();
            const freeze = this._getFreeze();

            const selection = currentSelection?.model;
            const endViewport =
                scene.getActiveViewportByCoord(Vector2.FromArray([moveOffsetX, moveOffsetY])) ??
                this._getViewportByCell(selection?.endRow, selection?.endColumn);

            // find viewports that can be crossed by selection.
            const isCrossableViewports = () => {
                if (!startViewport || !endViewport || !viewportMain) {
                    return false;
                }
                const crossableViewports = [SHEET_VIEWPORT_KEY.VIEW_MAIN,
                    SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP,
                    SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP,
                    SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT] as string[];
                return crossableViewports.includes(startViewport.viewportKey) && crossableViewports.includes(endViewport.viewportKey);
            };
            if (isCrossableViewports()) {
                if (!startViewport || !endViewport || !viewportMain) {
                    return false;
                }

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
            //#endregion

            //#region auto scrolling
            this._scrollTimer.scrolling(scrollOffsetX, scrollOffsetY, () => {
                this._movingHandler(newMoveOffsetX, newMoveOffsetY, activeSelectionControl, rangeType);
            });
            //#endregion
        });
        // #endregion
    }

    /** @deprecated Use the function `attachSelectionWithCoord` instead`. */
    attachSelectionWithCoord(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoordAndStyle {
        return attachSelectionWithCoord(selectionWithStyle, this._skeleton);
    }

    /** @deprecated Use the function `attachPrimaryWithCoord` instead`. */
    attachPrimaryWithCoord(primary: ISelectionCell): IActualCellWithCoord {
        return attachPrimaryWithCoord(this._skeleton, primary) as unknown as IActualCellWithCoord;
    }

    /**
     * @deprecated Please use `getCellWithCoordByOffset` instead.
     */
    getSelectionCellByPosition(x: number, y: number): IActualCellWithCoord {
        return this.getCellWithCoordByOffset(x, y);
    }

    getCellWithCoordByOffset(x: number, y: number): IActualCellWithCoord {
        const scene = this._scene;
        const skeleton = this._skeleton;
        const scrollXY = scene.getViewportScrollXY(scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!);
        const { scaleX, scaleY } = scene.getAncestorScale();

        return skeleton.getCellWithCoordByOffset(x, y, scaleX, scaleY, scrollXY);
    }

    /**
     * When mousedown and mouseup need to go to the coordination and undo stack, when mousemove does not need to go to the coordination and undo stack
     */
    // eslint-disable-next-line max-lines-per-function, complexity
    protected _movingHandler(
        offsetX: number,
        offsetY: number,
        activeSelectionControl: Nullable<SelectionControl>,
        rangeType: RANGE_TYPE
    ): void {
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

        const scrollXY = scene.getVpScrollXYInfoByViewport(
            Vector2.FromArray([this._startViewportPosX, this._startViewportPosY]),
            targetViewport
        );

        const { scaleX, scaleY } = scene.getAncestorScale();

        if (rangeType === RANGE_TYPE.ROW) {
            // eslint-disable-next-line no-param-reassign
            offsetX = Number.POSITIVE_INFINITY;
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            // eslint-disable-next-line no-param-reassign
            offsetY = Number.POSITIVE_INFINITY;
        }

        const cursorCellRangeInfo = this._getSelectionWithCoordByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
        if (!cursorCellRangeInfo) {
            return;
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
            newSelectionRange = skeleton.getMergeBounding(newSelectionRange.startRow, newSelectionRange.startColumn, newSelectionRange.endRow, newSelectionRange.endColumn);
        }

        if (!newSelectionRange) {
            return;
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
            activeSelectionControl.updateRange(newSelectionRangeWithCoord);
            this._selectionMoving$.next(this.getSelectionDataWithStyle());
        }
    }

    protected _clearUpdatingListeners(): void {
        const scene = this._scene;
        scene.enableObjectsEvent();

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

    protected _addEndingListeners(): void {
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

    /**
     * Get visible selection range & coord by offset on viewport. Nearly same as skeleton.getCellWithCoordByOffset
     * Returning selection is only one cell. primary and range are same cell.
     *
     * visible selection range means getCellWithCoordByOffset needs first matched row/col in rowHeightAccumulation & colWidthAccumulation.
     * Original name: _getCellRangeByCursorPosition
     *
     * @param offsetX position X in viewport.
     * @param offsetY
     * @param scaleX
     * @param scaleY
     * @param scrollXY
     * @returns {Nullable<ISelectionWithCoord>} selection range with coord.
     */
    protected _getSelectionWithCoordByOffset(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number }
    ): Nullable<ISelectionWithCoord> {
        const skeleton = this._skeleton;
        if (skeleton == null) return null;

        //#region normal selection
        if (this._shouldDetectMergedCells) {
            const primaryWithCoord = skeleton?.getCellWithCoordByOffset(
                offsetX,
                offsetY,
                scaleX,
                scaleY,
                scrollXY,
                { firstMatch: true } // for visible
            );

            if (!primaryWithCoord) return;

            const rangeWithCoord = convertCellToRange(primaryWithCoord);
            return {
                primaryWithCoord,
                rangeWithCoord,
            };
        }
        //#endregion

        //@region other range type
        const { row, column } = skeleton.getCellIndexByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
        const startCell = skeleton.getNoMergeCellPositionByIndex(row, column);
        const { startX, startY, endX, endY } = startCell;

        const rangeWithCoord: IRangeWithCoord = {
            startY,
            endY,
            startX,
            endX,
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
        };

        const primaryWithCoord: Nullable<IActualCellWithCoord> = {
            mergeInfo: rangeWithCoord,
            actualRow: row,
            actualColumn: column,
            isMerged: false,
            isMergedMainCell: false,
            startY,
            endY,
            startX,
            endX,
        };

        return {
            primaryWithCoord,
            rangeWithCoord,
        };
        //#endregion
    }

    protected _checkClearPreviousControls(evt: IPointerEvent | IMouseEvent): void {
        const curControls = this.getSelectionControls();
        if (curControls.length === 0) return;

        // In addition to pressing the ctrl or shift key, we must clear the previous selection.
        if (
            (!evt.ctrlKey && !evt.shiftKey && !this._remainLastEnabled) ||
            (this._singleSelectionEnabled && !evt.shiftKey)
        ) {
            this._clearAllSelectionControls();
        }
    }

    protected _performSelectionByTwoCells(
        currentCell: IActualCellWithCoord,
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
        const activeCell = skeleton.getCellWithCoordByIndex(actualRow, actualColumn);

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
        activeControl.updateRange(newSelectionRange, currentCell);
    }

    /**
     * Reset all this.selectionControls by selectionsData.
     * @param selectionsData
     */
    protected _refreshSelectionControl(selectionsData: readonly ISelectionWithStyle[]): void {
        const selections = selectionsData.map((selectionWithStyle) => {
            const selectionData = attachSelectionWithCoord(selectionWithStyle, this._skeleton);
            selectionData.style = genNormalSelectionStyle(this._themeService);
            return selectionData;
        });
        this.updateControlForCurrentByRangeData(selections);
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
        primary: getTopLeftSelectionOfCurrSheet(skeleton)!.primary,
        style: null,
    };
}

export function getTopLeftSelectionOfCurrSheet(skeleton: SpreadsheetSkeleton): ISelectionWithStyle {
    return genSelectionByRange(skeleton, {
        startRow: 0,
        startColumn: 0,
        endRow: 0,
        endColumn: 0,
    });
}

// same as this._skeleton.getCellWithCoordByIndex(startRow, startColumn);
// export function getTopLeftAsPrimaryOfCurrRange(skeleton: SpreadsheetSkeleton, range: IRange): ISelectionCell {
//     const topLeftCell = skeleton.worksheet.getCellInfoInMergeData(range.startRow, range.startColumn);
//     return {
//         actualRow: topLeftCell.startRow,
//         actualColumn: topLeftCell.startColumn,
//         startRow: topLeftCell.startRow,
//         startColumn: topLeftCell.startColumn,
//         endRow: topLeftCell.endRow,
//         endColumn: topLeftCell.endColumn,
//         isMerged: topLeftCell.isMerged,
//         isMergedMainCell: topLeftCell.isMergedMainCell,
//     };
// }

export function genSelectionByRange(skeleton: SpreadsheetSkeleton, range: IRange): ISelectionWithStyle {
    const topLeftCell = skeleton.worksheet.getCellInfoInMergeData(range.startRow, range.startColumn);
    const bottomRightCell = skeleton.worksheet.getCellInfoInMergeData(range.endRow, range.endColumn);
    const rs = {
        range: {
            startRow: topLeftCell.startRow,
            startColumn: topLeftCell.startColumn,
            endRow: bottomRightCell.endRow,
            endColumn: bottomRightCell.endColumn,
        },
        primary: {
            actualRow: topLeftCell.startRow,
            actualColumn: topLeftCell.startColumn,
            startRow: topLeftCell.startRow,
            startColumn: topLeftCell.startColumn,
            endRow: topLeftCell.endRow,
            endColumn: topLeftCell.endColumn,
            isMerged: topLeftCell.isMerged,
            isMergedMainCell: topLeftCell.isMergedMainCell,
        },
        style: null,
    };
    return rs;
}
