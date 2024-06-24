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
    IInterceptor,
    IRange,
    IRangeWithCoord,
    ISelectionCell,
    ISelectionCellWithCoord,
    ISelectionWithCoord,
    Nullable,
    Observer,
    Workbook,
} from '@univerjs/core';
import { createInterceptorKey, Disposable, ICommandService, InterceptorManager, makeCellToSelection, RANGE_TYPE, ThemeService, toDisposable, UniverInstanceType } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, Scene, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import { IRenderManagerService, ScrollTimer, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import type { ISelectionStyle, ISelectionWithCoordAndStyle, ISelectionWithStyle } from '@univerjs/sheets';
import { convertSelectionDataToRange, getNormalSelectionStyle, getPrimaryForRange, ScrollToCellOperation, SelectionManagerService, SelectionMoveType, SetSelectionsOperation, SetWorksheetActivateCommand, transformCellDataToSelectionData } from '@univerjs/sheets';
import { IShortcutService } from '@univerjs/ui';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';

import { deserializeRangeWithSheet, IDefinedNamesService, isReferenceStrings, operatorToken } from '@univerjs/engine-formula';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import type { ISheetObjectParam } from '../../controllers/utils/component-tools';
import { getCoordByOffset, getSheetObject } from '../../controllers/utils/component-tools';
import { checkInHeaderRanges } from '../../controllers/utils/selections-tools';
import { SelectionShape } from './selection-shape';
import { SelectionShapeExtension } from './selection-shape-extension';

export interface IControlFillConfig {
    oldRange: IRange;
    newRange: IRange;
}

export interface ISelectionRenderService {
    readonly selectionMoveEnd$: Observable<ISelectionWithCoordAndStyle[]>;
    readonly controlFillConfig$: Observable<IControlFillConfig | null>;
    readonly selectionMoving$: Observable<ISelectionWithCoordAndStyle[]>;
    readonly selectionMoveStart$: Observable<ISelectionWithCoordAndStyle[]>;

    interceptor: InterceptorManager<{
        RANGE_MOVE_PERMISSION_CHECK: IInterceptor<boolean, null>;
        RANGE_FILL_PERMISSION_CHECK: IInterceptor<boolean, { x: number; y: number; skeleton: SpreadsheetSkeleton; scene: Scene }>;
    }>;

    // #region PromptController
    // Methods and properties only used in PromptController. The more methods in this region,
    // the greater the necessity is to create a `PromptSelectionService`.

    // enableSingleSelection(): void;
    // disableSingleSelection(): void;
    // getActiveRange(): Nullable<IRange>;
    // enableSkipRemainLast(): void;
    // enableRemainLast(): void;
    // disableRemainLast(): void;
    // disableSkipRemainLast(): void;

    // #endregion

    /** @deprecated This should not be provided by the selection render service. */
    getViewPort(): Viewport; // AutoFill
    getCurrentControls(): SelectionShape[]; // AutoFill

    // The following methods are used to get range locations in a worksheet. Though `attachRangeWithCoord` should not happens here.
    // And `attachPrimaryWithCoord` is redundant.

    attachSelectionWithCoord(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoordAndStyle;

    /** @deprecated Use `attachSelectionWithCoord instead`. */
    attachPrimaryWithCoord(primary: Nullable<ISelectionCell>): Nullable<ISelectionCellWithCoord>;
    getSelectionCellByPosition(x: number, y: number): Nullable<ISelectionCellWithCoord>; // drawing
}

/**
 * TODO 注册 selection 拦截，可能在有公式 ArrayObject 时，fx 公式栏显示不同
 *
 * SelectionRenderService 维护 viewModel 数据 list，action 也是修改这一层数据，obs 监听到数据变动后，自动刷新（control 仍然可以持有数据）
 *
 * This service is related to the drawing of the selection.
 * By modifying the properties of the service,
 * you can adjust the style and performance of each selection area.
 * This service is used in conjunction with the SelectionManagerService
 * to implement functions related to the selection area in univer.
 *
 * @todo Refactor it to RenderController.
 */

export const RANGE_MOVE_PERMISSION_CHECK = createInterceptorKey<boolean, null>('rangeMovePermissionCheck');
export const RANGE_FILL_PERMISSION_CHECK = createInterceptorKey<boolean, { x: number; y: number; skeleton: SpreadsheetSkeleton; scene: Scene }>('rangeFillPermissionCheck');

export class SelectionRenderService extends Disposable implements ISelectionRenderService, IRenderModule {
    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _controlFillConfig$: BehaviorSubject<IControlFillConfig | null> =
        new BehaviorSubject<IControlFillConfig | null>(null);

    readonly controlFillConfig$ = this._controlFillConfig$.asObservable();

    private _selectionControls: SelectionShape[] = []; // sheetID:Controls

    private _startSelectionRange: IRangeWithCoord = {
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

    private _cancelDownObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _cancelUpObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

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

    public interceptor = new InterceptorManager({ RANGE_MOVE_PERMISSION_CHECK, RANGE_FILL_PERMISSION_CHECK });

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(Injector) private readonly _injector: Injector,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService
    ) {
        super();

        this._selectionStyle = getNormalSelectionStyle(this._themeService);
        this._init();
    }

    override dispose(): void {
        super.dispose();
    }

    private _init() {
        const sheetObject = this._getSheetObject();

        this._initViewMainListener(sheetObject);
        this._initHeaders(sheetObject);
        this._initLeftTop(sheetObject);
        this._initSelectionChangeListener();
        this._initThemeChangeListener();
        this._initSkeletonChangeListener();
        this._initUserActionSyncListener();
        this._initDefinedNameListener();
    }

    private _setStyle(style: ISelectionStyle) {
        this._selectionStyle = style;
    }

    private _resetStyle() {
        this._setStyle(getNormalSelectionStyle(this._themeService));
    }

    getViewPort() {
        return this._activeViewport!;
    }

    /**
     * add a selection
     * @param selectionRange
     * @param curCellRange
     */
    addControlToCurrentByRangeData(data: ISelectionWithCoordAndStyle) {
        const currentControls = this.getCurrentControls();

        if (!currentControls) {
            return;
        }
        const { rangeWithCoord, primaryWithCoord } = data;

        const skeleton = this._skeleton;

        let { style } = data;

        if (style == null) {
            style = getNormalSelectionStyle(this._themeService);
        }

        const scene = this._scene;

        if (scene == null || skeleton == null) {
            return;
        }

        const control = new SelectionShape(scene, currentControls.length, this._isHeaderHighlight, this._themeService);

        // eslint-disable-next-line no-new
        new SelectionShapeExtension(control, skeleton, scene, this._themeService, this._injector);

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        // update control
        control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);

        currentControls.push(control);
    }

    updateControlForCurrentByRangeData(selections: ISelectionWithCoordAndStyle[]) {
        const currentControls = this.getCurrentControls();
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
    }

    getSelectionDataWithStyle(): ISelectionWithCoordAndStyle[] {
        const selectionControls = this._selectionControls;
        return selectionControls.map((control) => control.getValue());
    }

    getCurrentControls() {
        return this._selectionControls;
    }

    private _clearSelectionControls() {
        const curControls = this.getCurrentControls();

        if (curControls.length > 0) {
            for (const control of curControls) {
                control.dispose();
            }

            curControls.length = 0; // clear currentSelectionControls
        }
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
     * Returns the selected range in the active sheet, or null if there is no active range. If multiple ranges are selected this method returns only the last selected range.
     * TODO: 默认最后一个选区为当前激活选区，或者当前激活单元格所在选区为激活选区
     * @returns
     */
    getActiveRange(): Nullable<IRange> {
        const controls = this.getCurrentControls();
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
     * @returns
     */
    getActiveSelection(): Nullable<SelectionShape> {
        const controls = this.getCurrentControls();
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

        this._moveObserver?.dispose();
        this._upObserver?.dispose();
        this._downObserver?.dispose();

        this._moveObserver = null;
        this._upObserver = null;
        this._downObserver = null;
    }

    resetAndEndSelection() {
        this.endSelection();
        this.reset();
    }

    /**
     *
     * @param evt component point event
     * @param style selection style, Styles for user-customized selectors
     * @param zIndex Stacking order of the selection object
     * @param rangeType Determines whether the selection is made normally according to the range or by rows and columns
     */
    private _eventTrigger(
        evt: IPointerEvent | IMouseEvent,
        zIndex = 0,
        rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL,
        viewport?: Viewport,
        scrollTimerType: ScrollTimerType = ScrollTimerType.ALL
    ) {
        if (this._isSelectionEnabled === false) {
            return;
        }

        this._isDetectMergedCell = rangeType === RANGE_TYPE.NORMAL;

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

        const selectionData = this._getSelectedRangeWithMerge(newEvtOffsetX, newEvtOffsetY, scaleX, scaleY, scrollXY);

        if (!selectionData) {
            return false;
        }

        const { rangeWithCoord: actualRangeWithCoord, primaryWithCoord } = selectionData;

        const { startRow, startColumn, endColumn, endRow, startY, endY, startX, endX } = actualRangeWithCoord;

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        const startSelectionRange = {
            startColumn,
            startRow,
            endColumn,
            endRow,
            startY,
            endY,
            startX,
            endX,
            rangeType,
        };

        this._startSelectionRange = startSelectionRange;

        let selectionControl: Nullable<SelectionShape> = this.getActiveSelection();

        const curControls = this.getCurrentControls();

        if (!curControls) {
            return false;
        }

        for (const control of curControls) {
            // right click
            if (evt.button === 2 && control.model.isInclude(startSelectionRange)) {
                selectionControl = control;
                return;
            }
            // Click to an existing selection
            if (control.model.isEqual(startSelectionRange)) {
                selectionControl = control;
                break;
            }

            // There can only be one highlighted cell, so clear the highlighted cell of the existing selection
            if (!evt.shiftKey) {
                control.clearHighlight();
            }
        }

        // In addition to pressing the ctrl or shift key, we must clear the previous selection
        if (
            (curControls.length > 0 &&
                !evt.ctrlKey &&
                !evt.shiftKey &&
                !this._isRemainLastEnable) || (curControls.length > 0 && this._isSingleSelection && !evt.shiftKey)
        ) {
            for (const control of curControls) {
                control.dispose();
            }

            curControls.length = 0;
        }

        const currentCell = selectionControl && selectionControl.model.currentCell;

        if (selectionControl && evt.shiftKey && currentCell) {
            const { actualRow, actualColumn, mergeInfo: actualMergeInfo } = currentCell;

            /**
             * Get the maximum range selected based on the two cells selected with Shift.
             */

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

            this._startSelectionRange = {
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

            selectionControl.update(
                newSelectionRange,
                rowHeaderWidth,
                columnHeaderHeight,
                this._selectionStyle,
                currentCell
            );
        } else if (
            this._isRemainLastEnable &&
            selectionControl &&
            !evt.ctrlKey &&
            !evt.shiftKey &&
            !this._isSkipRemainLastEnable && !this._isSingleSelection
        ) {
            /**
             * Supports the formula ref text selection feature,
             * under the condition of preserving all previous selections, it modifies the position of the latest selection.
             */

            selectionControl.update(
                startSelectionRange,
                rowHeaderWidth,
                columnHeaderHeight,
                this._selectionStyle,
                primaryWithCoord
            );
        } else {
            /**
             * The default behavior is to clear previous selections and always create new selections.
             */
            selectionControl = new SelectionShape(
                scene,
                curControls.length + zIndex,
                this._isHeaderHighlight,
                this._themeService
            );

            // TODO@wzhudev: this will not be disposed?
            // new SelectionShapeExtension(selectionControl, skeleton, scene, this._themeService, this._injector);

            selectionControl.update(
                startSelectionRange,
                rowHeaderWidth,
                columnHeaderHeight,
                this._selectionStyle,
                primaryWithCoord
            );

            curControls.push(selectionControl);
        }

        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());

        // this._endSelection();

        scene.disableEvent();

        const startViewport = scene.getActiveViewportByCoord(Vector2.FromArray([newEvtOffsetX, newEvtOffsetY]));

        const scrollTimer = ScrollTimer.create(this._scene, scrollTimerType);
        scrollTimer.startScroll(viewportMain?.left ?? 0, viewportMain?.top ?? 0, viewportMain);

        this._scrollTimer = scrollTimer;

        this._addCancelObserver();

        scene.getTransformer()?.clearSelectedObjects();

        if (rangeType === RANGE_TYPE.ROW || rangeType === RANGE_TYPE.COLUMN) {
            this._moving(newEvtOffsetX, newEvtOffsetY, selectionControl, rangeType);
        }

        let xCrossTime = 0;
        let yCrossTime = 0;
        let lastX = newEvtOffsetX;
        let lastY = newEvtOffsetY;

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(
                Vector2.FromArray([moveOffsetX, moveOffsetY])
            );

            this._moving(newMoveOffsetX, newMoveOffsetY, selectionControl, rangeType);

            let scrollOffsetX = newMoveOffsetX;
            let scrollOffsetY = newMoveOffsetY;

            const currentSelection = this.getActiveSelection();
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
                    const shouldResetX = startXY.x !== endXY.x && isCrossingX && xCrossTime % 2 === 1;
                    const shouldResetY = startXY.y !== endXY.y && isCrossingY && yCrossTime % 2 === 1;

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
                this._moving(newMoveOffsetX, newMoveOffsetY, selectionControl, rangeType);
            });
        });

        this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
            this._endSelection();
            this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());

            // when selection mouse up, enable the short cut service
            this._shortcutService.setDisable(false);
        });

        // when selection mouse down, disable the short cut service
        this._shortcutService.setDisable(true);
    }

    attachSelectionWithCoord(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoordAndStyle {
        const { range, primary, style } = selectionWithStyle;
        let rangeWithCoord = this._sheetSkeletonManagerService.attachRangeWithCoord(range);
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

    attachPrimaryWithCoord(primary: Nullable<ISelectionCell>): Nullable<ISelectionCellWithCoord> {
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
    private _moving(
        moveOffsetX: number,
        moveOffsetY: number,
        selectionControl: Nullable<SelectionShape>,
        rangeType: RANGE_TYPE
    ) {
        const skeleton = this._skeleton;

        const scene = this._scene;

        if (scene == null || skeleton == null) {
            return false;
        }

        const { startRow, startColumn, endRow, endColumn } = this._startSelectionRange;

        const {
            startRow: oldStartRow,
            endRow: oldEndRow,
            startColumn: oldStartColumn,
            endColumn: oldEndColumn,
        } = selectionControl?.model || { startRow: -1, endRow: -1, startColumn: -1, endColumn: -1 };

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!;

        const targetViewport = this._getViewportByCell(oldEndRow, oldEndColumn) ?? viewportMain;

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

        const selectionData = this._getSelectedRangeWithMerge(moveOffsetX, moveOffsetY, scaleX, scaleY, scrollXY);
        if (!selectionData) {
            return false;
        }

        const { rangeWithCoord: moveRangeWithCoord } = selectionData;

        const {
            startRow: moveStartRow,
            startColumn: moveStartColumn,
            endColumn: moveEndColumn,
            endRow: moveEndRow,
        } = moveRangeWithCoord;

        const newStartRow = Math.min(moveStartRow, startRow);
        const newStartColumn = Math.min(moveStartColumn, startColumn);
        const newEndRow = Math.max(moveEndRow, endRow);
        const newEndColumn = Math.max(moveEndColumn, endColumn);

        let newBounding = {
            startRow: newStartRow,
            startColumn: newStartColumn,
            endRow: newEndRow,
            endColumn: newEndColumn,
        };

        if (this._isDetectMergedCell) {
            newBounding = skeleton.getSelectionBounding(newStartRow, newStartColumn, newEndRow, newEndColumn);
        }

        if (!newBounding) {
            return false;
        }
        const {
            startRow: finalStartRow,
            startColumn: finalStartColumn,
            endRow: finalEndRow,
            endColumn: finalEndColumn,
        } = newBounding;

        const startCell = skeleton.getNoMergeCellPositionByIndex(finalStartRow, finalStartColumn);
        const endCell = skeleton.getNoMergeCellPositionByIndex(finalEndRow, finalEndColumn);

        const newSelectionRange: IRangeWithCoord = {
            startColumn: finalStartColumn,
            startRow: finalStartRow,
            endColumn: finalEndColumn,
            endRow: finalEndRow,
            startY: startCell?.startY || 0,
            endY: endCell?.endY || 0,
            startX: startCell?.startX || 0,
            endX: endCell?.endX || 0,
        };
        // Only notify when the selection changes

        if (
            (oldStartColumn !== finalStartColumn ||
                oldStartRow !== finalStartRow ||
                oldEndColumn !== finalEndColumn ||
                oldEndRow !== finalEndRow) &&
            selectionControl != null
        ) {
            selectionControl.update(newSelectionRange, rowHeaderWidth, columnHeaderHeight);

            this._selectionMoving$.next(this.getSelectionDataWithStyle());
        }
    }

    private _endSelection() {
        const scene = this._scene;
        if (scene == null) {
            return;
        }

        scene.onPointerMoveObserver.remove(this._moveObserver);
        scene.onPointerUpObserver.remove(this._upObserver);
        scene.enableEvent();

        this._scrollTimer?.dispose();

        const mainScene = scene.getEngine()?.activeScene;
        mainScene?.onPointerDownObserver.remove(this._cancelDownObserver);
        mainScene?.onPointerUpObserver.remove(this._cancelUpObserver);
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

        mainScene.onPointerDownObserver.remove(this._cancelDownObserver);
        mainScene.onPointerUpObserver.remove(this._cancelUpObserver);
        this._cancelDownObserver = mainScene.onPointerDownObserver.add(() => this._endSelection());
        this._cancelUpObserver = mainScene.onPointerUpObserver.add(() => this._endSelection());
    }

    private _getSelectedRangeWithMerge(
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

    // #region legacy SelectionRenderController

    private _initDefinedNameListener() {
        this.disposeWithMe(
            this._definedNamesService.focusRange$.subscribe(async (item) => {
                if (item == null) {
                    return;
                }

                const { unitId } = item;
                let { formulaOrRefString } = item;

                const workbook = this._context.unit;

                if (unitId !== workbook.getUnitId()) {
                    return;
                }

                if (formulaOrRefString.substring(0, 1) === operatorToken.EQUALS) {
                    formulaOrRefString = formulaOrRefString.substring(1);
                }

                const result = isReferenceStrings(formulaOrRefString);

                if (!result) {
                    return;
                }

                const selections = await this._getSelections(workbook, unitId, formulaOrRefString);

                this._selectionManagerService.setSelections(selections);

                this._commandService.executeCommand(ScrollToCellOperation.id, selections[0].range);
            })
        );
    }

    private async _getSelections(workbook: Workbook, unitId: string, formulaOrRefString: string) {
        const valueArray = formulaOrRefString.split(',');

        let worksheet = workbook.getActiveSheet();

        if (!worksheet) {
            return [];
        }

        const selections = [];

        for (let i = 0; i < valueArray.length; i++) {
            const refString = valueArray[i].trim();

            const unitRange = deserializeRangeWithSheet(refString.trim());

            if (i === 0) {
                const worksheetCache = workbook.getSheetBySheetName(unitRange.sheetName);
                if (worksheetCache && worksheet.getSheetId() !== worksheetCache.getSheetId()) {
                    worksheet = worksheetCache;
                    await this._commandService.executeCommand(SetWorksheetActivateCommand.id, {
                        subUnitId: worksheet.getSheetId(),
                        unitId,
                    });
                }
            }

            if (worksheet.getName() !== unitRange.sheetName) {
                continue;
            }

            let primary = null;
            if (i === valueArray.length - 1) {
                const range = unitRange.range;
                const { startRow, startColumn, endRow, endColumn } = range;
                primary = getPrimaryForRange({
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,

                }, worksheet);
            }

            selections.push({
                range: unitRange.range,
                style: getNormalSelectionStyle(this._themeService),
                primary,
            });
        }

        return selections;
    }

    private _getActiveViewport(evt: IPointerEvent | IMouseEvent) {
        const sheetObject = this._getSheetObject();

        return sheetObject?.scene.getActiveViewportByCoord(Vector2.FromArray([evt.offsetX, evt.offsetY]));
    }

    private _initViewMainListener(sheetObject: ISheetObjectParam) {
        const { spreadsheet } = sheetObject;

        this.disposeWithMe(
            spreadsheet?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                this._eventTrigger(evt, spreadsheet.zIndex + 1, RANGE_TYPE.NORMAL, this._getActiveViewport(evt));

                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );
    }

    private _initThemeChangeListener() {
        this.disposeWithMe(
            toDisposable(
                this._themeService.currentTheme$.subscribe(() => {
                    this._resetStyle();
                    const param = this._selectionManagerService.getCurrentSelections();
                    if (param == null) {
                        return;
                    }

                    this._refreshSelection(param);
                })
            )
        );
    }

    private _refreshSelection(params: readonly ISelectionWithStyle[]) {
        const selections = params.map((selectionWithStyle) => {
            const selectionData = this.attachSelectionWithCoord(selectionWithStyle);
            selectionData.style = getNormalSelectionStyle(this._themeService);
            return selectionData;
        });

        this.updateControlForCurrentByRangeData(selections);
    }

    private _initHeaders(sheetObject: ISheetObjectParam) {
        const { spreadsheetRowHeader, spreadsheetColumnHeader, spreadsheet } = sheetObject;
        const { scene } = this._context;

        this.disposeWithMe(
            spreadsheetRowHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                // If the pointer down is in the selected range, we shu
                const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
                const { row } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);

                const matchSelectionData = checkInHeaderRanges(this._selectionManagerService, row, RANGE_TYPE.ROW);
                if (matchSelectionData) return;

                this._eventTrigger(
                    evt,
                    (spreadsheet?.zIndex || 1) + 1,
                    RANGE_TYPE.ROW,
                    this._getActiveViewport(evt),
                    ScrollTimerType.Y
                );

                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );

        this.disposeWithMe(
            spreadsheetColumnHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
                const { column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);

                const matchSelectionData = checkInHeaderRanges(this._selectionManagerService, column, RANGE_TYPE.COLUMN);
                if (matchSelectionData) return;

                this._eventTrigger(
                    evt,
                    (spreadsheet?.zIndex || 1) + 1,
                    RANGE_TYPE.COLUMN,
                    this._getActiveViewport(evt),
                    ScrollTimerType.X
                );

                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );
    }

    private _initLeftTop(sheetObject: ISheetObjectParam) {
        const { spreadsheetLeftTopPlaceholder } = sheetObject;
        this.disposeWithMe(
            spreadsheetLeftTopPlaceholder?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null) {
                    return;
                }

                this.reset();

                const selectionWithStyle = this._getAllRange(skeleton);

                const selectionData = this.attachSelectionWithCoord(selectionWithStyle);
                this.addControlToCurrentByRangeData(selectionData);

                this.refreshSelectionMoveStart();

                // this._selectionManagerService.replace([selectionWithStyle]);

                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );
    }

    private _initSelectionChangeListener() {
        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveEnd$.subscribe((params) => {
                    this.reset();

                    for (const selectionWithStyle of params) {
                        if (selectionWithStyle == null) {
                            continue;
                        }
                        const selectionData =
                            this.attachSelectionWithCoord(selectionWithStyle);
                        this.addControlToCurrentByRangeData(selectionData);
                    }

                    this._syncDefinedNameRange(params);
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoving$.subscribe((params) => {
                    if (params == null) {
                        return;
                    }

                    this._syncDefinedNameRange(params);
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveStart$.subscribe((params) => {
                    if (params == null) {
                        return;
                    }

                    this._syncDefinedNameRange(params);
                })
            )
        );
    }

    private _syncDefinedNameRange(params: ISelectionWithStyle[]) {
        if (params.length === 0) {
            return;
        }
        const lastSelection = params[params.length - 1];

        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return;
        }

        this._definedNamesService.setCurrentRange({
            range: lastSelection.range,
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
        });
    }

    private _initUserActionSyncListener() {
        this.disposeWithMe(this.selectionMoveStart$.subscribe((params) => {
            this._move(params, SelectionMoveType.MOVE_START);
        }));

        this.disposeWithMe(this.selectionMoving$.subscribe((params) => {
            this._move(params, SelectionMoveType.MOVING);
        }));

        this.disposeWithMe(this.selectionMoveEnd$.subscribe((params) => {
            this._move(params, SelectionMoveType.MOVE_END);
        }));
    }

    private _move(selectionDataWithStyleList: ISelectionWithCoordAndStyle[], type: SelectionMoveType) {
        const workbook = this._context.unit;
        if (!workbook) return;

        const unitId = workbook.getUnitId();
        const sheetId = workbook.getActiveSheet()?.getSheetId();
        if (!sheetId) return;

        if (selectionDataWithStyleList == null || selectionDataWithStyleList.length === 0) {
            return;
        }

        this._commandService.executeCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: sheetId,
            type,
            selections: selectionDataWithStyleList.map((selectionDataWithStyle) =>
                convertSelectionDataToRange(selectionDataWithStyle)
            ),
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context)!;
    }

    private _initSkeletonChangeListener() {
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                this.changeRuntime(null, null);
                return;
            }

            const unitId = this._context.unitId;
            const { sheetId, skeleton } = param;
            const { scene } = this._context;

            const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

            this.changeRuntime(skeleton, scene, viewportMain);

            // If there is no initial selection, add one by default in the top left corner.
            const last = this._selectionManagerService.getCurrentLastSelection();
            if (last == null) {
                this._selectionManagerService.addSelections(unitId, sheetId, [this._getZeroRange(skeleton)]);
            }
        }));
    }

    private _getAllRange(skeleton: SpreadsheetSkeleton): ISelectionWithStyle {
        return {
            range: {
                startRow: 0,
                startColumn: 0,
                endRow: skeleton.getRowCount() - 1,
                endColumn: skeleton.getColumnCount() - 1,
                rangeType: RANGE_TYPE.ALL,
            },
            primary: this._getZeroRange(skeleton).primary,
            style: null,
        };
    }

    private _getZeroRange(skeleton: SpreadsheetSkeleton) {
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

    // #endregion
}

/**
 * @deprecated Should be refactored to RenderUnit.
 */
export const ISelectionRenderService = createIdentifier<SelectionRenderService>(
    'univer.sheet.selection-render-service'
);
