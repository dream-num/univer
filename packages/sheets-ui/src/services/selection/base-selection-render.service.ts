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

import type {
    ICellInfo,
    ICellWithCoord,
    IContextService,
    IDisposable,
    IFreeze,
    IInterceptor,
    Injector,
    IRange,
    IRangeWithCoord,
    Nullable,
} from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderModule, Scene, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import type { ISelectionStyle, ISelectionWithCoord, ISelectionWithStyle } from '@univerjs/sheets';
import type { Theme } from '@univerjs/themes';
import type { IShortcutService } from '@univerjs/ui';
import type { Observable, Subscription } from 'rxjs';
import type { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

import {
    convertCellToRange,
    createIdentifier,
    Disposable,
    InterceptorManager,
    RANGE_TYPE,
    ThemeService,
} from '@univerjs/core';
import { ScrollTimer, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { REF_SELECTIONS_ENABLED, SELECTIONS_ENABLED } from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { SHEET_COMPONENT_SELECTION_LAYER_INDEX } from '../../common/keys';
import { genNormalSelectionStyle, RANGE_FILL_PERMISSION_CHECK, RANGE_MOVE_PERMISSION_CHECK } from './const';
import { SelectionControl } from './selection-control';
import { SelectionLayer } from './selection-layer';
import { attachPrimaryWithCoord, attachSelectionWithCoord } from './util';

export interface IControlFillConfig {
    oldRange: IRange;
    newRange: IRange;
}

export interface ISheetSelectionRenderService {
    readonly selectionMoveEnd$: Observable<ISelectionWithCoord[]>;
    readonly controlFillConfig$: Observable<IControlFillConfig | null>;
    readonly selectionMoving$: Observable<ISelectionWithCoord[]>;
    readonly selectionMoveStart$: Observable<ISelectionWithCoord[]>;

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
    attachSelectionWithCoord(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoord;
    /** @deprecated Use the function `attachPrimaryWithCoord` instead`. */
    attachPrimaryWithCoord(primary: Nullable<Partial<ICellInfo>>): Nullable<ICellWithCoord>;

    /**
     * @deprecated Please use `getCellWithCoordByOffset` instead.
     */
    getSelectionCellByPosition(x: number, y: number): ICellWithCoord;

    getCellWithCoordByOffset(x: number, y: number, skeleton?: SpreadsheetSkeleton): Nullable<ICellWithCoord>; // drawing

    setSingleSelectionEnabled(enabled: boolean): void;

    refreshSelectionMoveEnd(): void;

    resetSelectionsByModelData(selectionsWithStyleList: readonly ISelectionWithStyle[]): void;
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

    protected _activeControlIndex = -1;

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

    /**
     * From renderContext.
     */
    protected _scene!: Scene;

    // The type of selector determines the type of data range and the highlighting style of the title bar, now it always true. In future, this could be configurable by user.
    protected _highlightHeader: boolean = true;

    // protected _shouldDetectMergedCells: boolean = true;
    protected _rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL;

    // The style of the selection area, including dashed lines, color, thickness, autofill, other points for modifying the range of the selection area, title highlighting, and so on, can all be customized.
    protected _selectionStyle!: ISelectionStyle;

    // #region ref range selection
    // we put the properties here for simplicity
    // Used in the formula selection feature, a new selection string is added by drawing a box with the mouse.
    protected _remainLastEnabled: boolean = false;
    protected _skipLastEnabled: boolean = false;
    protected _singleSelectionEnabled: boolean = false;
    // #endregion

    /**
     * Mainly emit by pointerup in spreadsheet. (pointerup is handled in _onPointerdown)
     */
    protected readonly _selectionMoveEnd$ = new BehaviorSubject<ISelectionWithCoord[]>([]);
    /**
     * Pointerup in spreadsheet
     */
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();
    /**
     * Mainly emit by pointermove in spreadsheet
     */
    protected readonly _selectionMoving$ = new Subject<ISelectionWithCoord[]>();
    /**
     * Pointermove in spreadsheet
     */
    readonly selectionMoving$ = this._selectionMoving$.asObservable();
    protected readonly _selectionMoveStart$ = new Subject<ISelectionWithCoord[]>();
    readonly selectionMoveStart$ = this._selectionMoveStart$.asObservable();

    private _selectionMoving = false;
    protected _selectionTheme: ThemeService;
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
        protected readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        protected readonly contextService: IContextService

    ) {
        super();
        // this._resetSelectionStyle();
        this._initSelectionThemeFromThemeService();
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

    protected _setSelectionStyle(style: ISelectionStyle): void {
        this._selectionStyle = style;
    }

    /**
     * Reset this._selectionStyle to default normal selection style
     */
    // protected _resetSelectionStyle(): void {
    //     this._setSelectionStyle(genNormalSelectionStyle(this._themeService));
    // }

    /** @deprecated This should not be provided by the selection render service. */
    getViewPort(): Viewport {
        return this._activeViewport!;
    }

    setSingleSelectionEnabled(enabled: boolean = false): void {
        this._singleSelectionEnabled = enabled;
    }

    newSelectionControl(scene: Scene, skeleton: SpreadsheetSkeleton, selection: ISelectionWithStyle): SelectionControl {
        const zIndex = this.getSelectionControls().length;
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        const control = new SelectionControl(scene, zIndex, this._selectionTheme, {
            highlightHeader: this._highlightHeader,
            rowHeaderWidth,
            columnHeaderHeight,
        });
        this._selectionControls.push(control);
        const selectionWithCoord = attachSelectionWithCoord(selection, skeleton);
        control.updateRangeBySelectionWithCoord(selectionWithCoord, skeleton);
        control.setControlExtension({
            skeleton,
            scene,
            themeService: this._selectionTheme,
            injector: this._injector,
            selectionHooks: {
                selectionMoveEnd: (): void => {
                    this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
                },
            },
        });

        return control;
    }

    /**
     * Update the corresponding selectionControl based on selectionsData from WorkbookSelectionModel
     * selectionData[i] --> selectionControls[i]
     * @param selectionsWithStyleList {ISelectionWithStyle[]} selectionsData from WorkbookSelectionModel
     */
    resetSelectionsByModelData(selectionsWithStyleList: readonly ISelectionWithStyle[]): void {
        const allSelectionControls = this.getSelectionControls();
        const skeleton = this._skeleton;
        if (!allSelectionControls || !skeleton) {
            return;
        }

        for (let i = 0, len = selectionsWithStyleList.length; i < len; i++) {
            const selectionWithStyle = selectionsWithStyleList[i];
            const selectionWithCoord = attachSelectionWithCoord(selectionWithStyle, this._skeleton);
            const control = allSelectionControls[i];

            if (control) {
                control.updateRangeBySelectionWithCoord(selectionWithCoord, skeleton);
            } else {
                if (this.isSelectionEnabled()) {
                    this.newSelectionControl(this._scene!, skeleton, selectionWithStyle);
                }
            }
        }
        if (selectionsWithStyleList.length < allSelectionControls.length) {
            const controlsToDestroy = allSelectionControls.splice(selectionsWithStyleList.length);
            controlsToDestroy.forEach((control) => control.dispose());
        }
    }

    refreshSelectionMoveStart(): void {
        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
    }

    refreshSelectionMoveEnd(): void {
        this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
    }

    _initSelectionThemeFromThemeService() {
        const theme = this._themeService.getCurrentTheme();
        this._selectionTheme = new ThemeService();
        this._selectionTheme.setTheme(theme);
    }

    setSelectionTheme(theme: Theme) {
        this._selectionTheme.setTheme(theme);
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
     * @returns {ISelectionWithCoord[]} {range, primary, style}[]
     */
    getSelectionDataWithStyle(): ISelectionWithCoord[] {
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

    /**
     * Add a selection in spreadsheet, create a new SelectionControl and then update this control by range derives from selection.
     * @param {ISelectionWithCoord} selectionWithStyle
     */
    protected _addSelectionControlByModelData(selectionWithStyle: ISelectionWithStyle): SelectionControl {
        const skeleton = this._skeleton;
        const style = selectionWithStyle.style ?? genNormalSelectionStyle(this._selectionTheme);
        const scene = this._scene;

        selectionWithStyle.style = style;
        const control = this.newSelectionControl(scene, skeleton, selectionWithStyle);
        return control;
    }

    protected _clearAllSelectionControls(): void {
        const allSelectionControls = this._selectionControls;
        for (const control of allSelectionControls) {
            control.dispose();
        }

        this._selectionControls.length = 0; // clear currentSelectionControls
    }

    protected _getFreeze(): Nullable<IFreeze> {
        const freeze = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton.getWorksheetConfig().freeze;
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

    setActiveSelectionIndex(index: number) {
        this._activeControlIndex = index;
    }

    resetActiveSelectionIndex(): void {
        this._activeControlIndex = -1;
    }

    /**
     * get active(actually last) selection control
     * @returns T extends SelectionControl
     */
    getActiveSelectionControl<T extends SelectionControl = SelectionControl>(): Nullable<T> {
        const controls = this.getSelectionControls();
        if (controls) {
            if (this._activeControlIndex < 0) {
                return controls[controls.length - 1] as T;
            }

            return controls[this._activeControlIndex] as T;
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
                const crossableViewports = [SHEET_VIEWPORT_KEY.VIEW_MAIN, SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP, SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP, SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT] as string[];
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
    attachSelectionWithCoord(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoord {
        return attachSelectionWithCoord(selectionWithStyle, this._skeleton);
    }

    /** @deprecated Use the function `attachPrimaryWithCoord` instead`. */
    attachPrimaryWithCoord(primary: ICellInfo): ICellWithCoord {
        return attachPrimaryWithCoord(this._skeleton, primary) as unknown as ICellWithCoord;
    }

    /**
     * @deprecated Please use `getCellWithCoordByOffset` instead.
     */
    getSelectionCellByPosition(x: number, y: number): ICellWithCoord {
        return this.getCellWithCoordByOffset(x, y);
    }

    getCellWithCoordByOffset(x: number, y: number, skeletonParam?: SpreadsheetSkeleton): ICellWithCoord {
        const scene = this._scene;
        const skeleton = skeletonParam ?? this._skeleton;
        const scrollXY = scene.getViewportScrollXY(scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!);
        const { scaleX, scaleY } = scene.getAncestorScale();

        return skeleton.getCellWithCoordByOffset(x, y, scaleX, scaleY, scrollXY);
    }

    /**
     * When mousedown and mouseup need to go to the coordination and undo stack, when mousemove does not need to go to the coordination and undo stack
     */

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

        const scrollXY = scene.getScrollXYInfoByViewport(
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

        const currCell = this._skeleton.getCellByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
        if (!currCell) {
            return;
        }

        let newSelectionRange: IRange = {
            startRow: Math.min(currCell.startRow, this._startRangeWhenPointerDown.startRow),
            startColumn: Math.min(currCell.startColumn, this._startRangeWhenPointerDown.startColumn),
            endRow: Math.max(currCell.endRow, this._startRangeWhenPointerDown.endRow),
            endColumn: Math.max(currCell.endColumn, this._startRangeWhenPointerDown.endColumn),
        };

        if (this._shouldDetectMergedCells) {
            newSelectionRange = skeleton.expandRangeByMerge(newSelectionRange);
        }
        const newSelection: ISelectionWithStyle = { range: newSelectionRange, primary: undefined, style: null };
        const newSelectionRangeWithCoord = attachSelectionWithCoord(newSelection, skeleton);
        newSelectionRangeWithCoord.rangeWithCoord.unitId = unitId;
        newSelectionRangeWithCoord.rangeWithCoord.sheetId = sheetId;
        newSelectionRangeWithCoord.rangeWithCoord.rangeType = rangeType;
        // const startCellXY = skeleton.getNoMergeCellPositionByIndex(newSelectionRange.startRow, newSelectionRange.startColumn);
        // const endCellXY = skeleton.getNoMergeCellPositionByIndex(newSelectionRange.endRow, newSelectionRange.endColumn);

        // Only notify when the selection changes
        const rangeChanged =
            currSelectionRange.startRow !== newSelectionRange.startRow ||
            currSelectionRange.startColumn !== newSelectionRange.startColumn ||
            currSelectionRange.endRow !== newSelectionRange.endRow ||
            currSelectionRange.endColumn !== newSelectionRange.endColumn;
        if (activeSelectionControl != null && rangeChanged) {
            activeSelectionControl.updateRangeBySelectionWithCoord(newSelectionRangeWithCoord);
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
        const startCell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
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

        const primaryWithCoord: Nullable<ICellWithCoord> = {
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

    protected _makeSelectionByTwoCells(
        currentCell: ICellWithCoord,
        startSelectionRange: IRangeWithCoord,
        skeleton: SpreadsheetSkeleton,
        rangeType: RANGE_TYPE,
        activeControl: SelectionControl
    ): void {
        const { actualRow, actualColumn, mergeInfo: actualMergeInfo } = currentCell;
        this._startRangeWhenPointerDown = { ...currentCell.mergeInfo };

        // Get the maximum range selected based on the two cells selected with Shift key.
        const newStartRow = Math.min(actualRow, startSelectionRange.startRow, actualMergeInfo.startRow);
        const newEndRow = Math.max(actualRow, startSelectionRange.endRow, actualMergeInfo.endRow);
        const newStartColumn = Math.min(actualColumn, startSelectionRange.startColumn, actualMergeInfo.startColumn);
        const newEndColumn = Math.max(actualColumn, startSelectionRange.endColumn, actualMergeInfo.endColumn);

        /**
         * Calculate whether there are merged cells within the range. If there are, recursively expand the selection again.
         */
        const range = skeleton.expandRangeByMerge({
            startRow: newStartRow,
            startColumn: newStartColumn,
            endRow: newEndRow,
            endColumn: newEndColumn,
        });
        const selectionWithStyle = {
            range,
            primary: null,
            style: null,
        };
        const selectionWithCoord = attachSelectionWithCoord(selectionWithStyle, skeleton);
        activeControl.updateRangeBySelectionWithCoord(selectionWithCoord);
        // const startCell = skeleton.getNoMergeCellPositionByIndex(range.startRow, range.startColumn);
        // const endCell = skeleton.getNoMergeCellPositionByIndex(range.endRow, range.endColumn);
        // const newSelectionRange = {
        //     startColumn: range.startColumn,
        //     startRow: range.startRow,
        //     endColumn: range.endColumn,
        //     endRow: range.endRow,

        //     startY: startCell.startY,
        //     endY: endCell.endY,
        //     startX: startCell.startX,
        //     endX: endCell.endX,

        //     rangeType,
        // };

        /**
         * When expanding the selection with the Shift key,
         * the original highlighted cell should remain unchanged.
         * If the highlighted cell is a merged cell, the selection needs to be expanded.
         */
        // const activeCell = skeleton.getCellWithCoordByIndex(actualRow, actualColumn);

        // activeControl.updateRange(newSelectionRange, currentCell);
    }

    isSelectionEnabled(): boolean {
        return this.contextService.getContextValue(SELECTIONS_ENABLED);
    }

    isSelectionDisabled(): boolean {
        return this.contextService.getContextValue(SELECTIONS_ENABLED) === false;
    }

    inRefSelectionMode(): boolean {
        return this.contextService.getContextValue(REF_SELECTIONS_ENABLED);
    }
}

export function selectionDataForSelectAll(skeleton: SpreadsheetSkeleton): ISelectionWithStyle {
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

/**
 * @deprecated use `getTopLeftSelectionOfCurrSheet` instead
 */
const getTopLeftSelection = getTopLeftSelectionOfCurrSheet;
export { getTopLeftSelection };

export function genSelectionByRange(skeleton: SpreadsheetSkeleton, range: IRange): ISelectionWithStyle {
    const topLeftCell = skeleton.worksheet.getCellInfoInMergeData(range.startRow, range.startColumn);
    const bottomRightCell = skeleton.worksheet.getCellInfoInMergeData(range.endRow, range.endColumn);
    const rs = {
        range: {
            startRow: topLeftCell.startRow,
            startColumn: topLeftCell.startColumn,
            endRow: bottomRightCell.endRow,
            endColumn: bottomRightCell.endColumn,
            rangeType: RANGE_TYPE.NORMAL,
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
