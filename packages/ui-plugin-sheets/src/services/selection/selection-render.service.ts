import {
    IMouseEvent,
    IPointerEvent,
    Scene,
    ScrollTimer,
    SpreadsheetSkeleton,
    Vector2,
    Viewport,
} from '@univerjs/base-render';
import {
    getNormalSelectionStyle,
    ISelectionStyle,
    ISelectionWithCoordAndStyle,
    ISelectionWithStyle,
} from '@univerjs/base-sheets';
import {
    IRange,
    IRangeWithCoord,
    ISelectionCell,
    ISelectionCellWithCoord,
    ISelectionWithCoord,
    makeCellToSelection,
    Nullable,
    Observer,
    RANGE_TYPE,
    ThemeService,
} from '@univerjs/core';
import { createIdentifier, Inject } from '@wendellhu/redi';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { SelectionRenderModel } from './selection-render-model';
import { SelectionShape } from './selection-shape';
import { SelectionShapeExtension } from './selection-shape-extension';

export interface IControlFillConfig {
    oldRange: IRange;
    newRange: IRange;
}

export interface ISelectionRenderService {
    readonly selectionRangeWithStyle$: Observable<ISelectionWithCoordAndStyle[]>;
    readonly controlFillConfig$: Observable<IControlFillConfig | null>;
    readonly selectionMoving$: Observable<Nullable<IRange[]>>;
    readonly selectionMoveStart$: Observable<Nullable<IRange[]>>;

    enableHeaderHighlight(): void;
    disableHeaderHighlight(): void;
    enableDetectMergedCell(): void;
    disableDetectMergedCell(): void;
    setStyle(style: ISelectionStyle): void;
    resetStyle(): void;
    enableSelection(): void;
    disableSelection(): void;
    enableShowPrevious(): void;
    disableShowPrevious(): void;
    enableRemainLast(): void;
    disableRemainLast(): void;
    enableSkipRemainLast(): void;
    disableSkipRemainLast(): void;

    addControlToCurrentByRangeData(data: ISelectionWithCoordAndStyle): void;
    changeRuntime(skeleton: SpreadsheetSkeleton, scene: Scene, viewport?: Viewport): void;
    getViewPort(): Viewport;
    getCurrentControls(): SelectionShape[];
    getActiveRangeList(): Nullable<IRange[]>;
    getActiveRange(): Nullable<IRange>;
    getActiveSelection(): Nullable<SelectionShape>;
    convertSelectionRangeToData(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoordAndStyle;
    convertRangeDataToSelection(range: IRange): Nullable<IRangeWithCoord>;
    convertCellRangeToInfo(primary: Nullable<ISelectionCell>): Nullable<ISelectionCellWithCoord>;
    eventTrigger(evt: IPointerEvent | IMouseEvent, zIndex: number, rangeType: RANGE_TYPE, viewport?: Viewport): void;
    // getMoveCellInfo(direction: Direction, selectionData: Nullable<ISelectionWithCoord>): Nullable<ISelectionWithCoord>;
    // transformCellDataToSelectionData(row: number, column: number): Nullable<ISelectionWithCoord>;
    reset(): void;
}

/**
 * TODO 注册selection拦截，可能在有公式ArrayObject时，fx公式栏显示不同
 *
 * SelectionRenderService 维护viewModel数据list，action也是修改这一层数据，obs监听到数据变动后，自动刷新（control仍然可以持有数据）
 *
 * This service is related to the drawing of the selection.
 * By modifying the properties of the service,
 * you can adjust the style and performance of each selection area.
 * This service is used in conjunction with the SelectionManagerService
 * to implement functions related to the selection area in univer.
 */
export class SelectionRenderService implements ISelectionRenderService {
    hasSelection: boolean = false;

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
    private _isDetectMergedCell: Boolean = true;

    // The style of the selection area, including dashed lines, color, thickness, autofill, other points for modifying the range of the selection area, title highlighting, and so on, can all be customized.
    private _selectionStyle!: ISelectionStyle;

    // Whether to enable the selection area. If set to false, the user cannot draw a selection area in the content area by clicking with the mouse.
    private _isSelectionEnabled: boolean = true;

    // Used in the format painter feature, similar to ctrl, it can retain the previous selection.
    private _isShowPreviousEnable: boolean | number = 0;

    //Used in the formula selection feature, a new selection string is added by drawing a box with the mouse.
    private _isRemainLastEnable: boolean = true;

    private _isSkipRemainLastEnable: boolean = false;

    private readonly _selectionRangeWithStyle$ = new BehaviorSubject<ISelectionWithCoordAndStyle[]>([]);

    // When the user draws a selection area in the canvas content area, this event is broadcasted when the drawing ends.
    readonly selectionRangeWithStyle$ = this._selectionRangeWithStyle$.asObservable();

    private readonly _selectionMoving$ = new Subject<Nullable<IRange[]>>();

    /**
     * Triggered during the drawing of the selection area.
     */
    readonly selectionMoving$ = this._selectionMoving$.asObservable();

    private readonly _selectionMoveStart$ = new Subject<Nullable<IRange[]>>();

    /**
     * Triggered during the start draw the selection area.
     */
    readonly selectionMoveStart$ = this._selectionMoveStart$.asObservable();

    private _activeViewport!: Viewport;

    constructor(@Inject(ThemeService) private readonly _themeService: ThemeService) {
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

    getViewPort() {
        return this._activeViewport;
    }

    /**
     * add a selection
     * @param selectionRange
     * @param curCellRange
     * @returns
     */
    addControlToCurrentByRangeData(data: ISelectionWithCoordAndStyle) {
        const currentControls = this.getCurrentControls();
        if (!currentControls) {
            return;
        }
        const { rangeWithCoord, primaryWithCoord } = data;

        const skeleton = this._skeleton;

        let style = data.style;

        if (style == null) {
            style = getNormalSelectionStyle(this._themeService);
        }

        const scene = this._scene;

        if (scene == null || skeleton == null) {
            return;
        }

        const control = new SelectionShape(scene, currentControls.length, this._isHeaderHighlight, this._themeService);

        new SelectionShapeExtension(control, skeleton, scene, this._themeService);

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        // update control
        control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);

        if (this._isHeaderHighlight) {
            control.enableHeaderHighlight();
        } else {
            control.disableHeaderHighlight();
        }
        currentControls.push(control);
    }

    changeRuntime(skeleton: SpreadsheetSkeleton, scene: Scene, viewport?: Viewport) {
        this._skeleton = skeleton;
        this._scene = scene;
        this._activeViewport = viewport || scene.getViewports()[0];
    }

    getSelectionDataWithStyle() {
        const selectionControls = this._selectionControls;
        return selectionControls.map((control) => control.getValue());
    }

    getCurrentControls() {
        return this._selectionControls;
    }

    // private _getCurrentControl() {
    //     const controls = this.getCurrentControls();
    //     if (controls && controls.length > 0) {
    //         for (const control of controls) {
    //             const currentCell = control.model.currentCell;
    //             if (currentCell) {
    //                 return control;
    //             }
    //         }
    //     }
    // }

    private _clearSelectionControls() {
        const curControls = this.getCurrentControls();

        if (curControls.length > 0) {
            for (const control of curControls) {
                control.dispose();
            }

            curControls.length = 0; // clear currentSelectionControls
        }
    }

    /**
     * Returns the list of active ranges in the active sheet or null if there are no active ranges.
     * If there is a single range selected, this behaves as a getActiveRange() call.
     *
     * @returns
     */
    getActiveRangeList(): Nullable<IRange[]> {
        const controls = this.getCurrentControls();
        if (controls && controls.length > 0) {
            const selections = controls?.map((control: SelectionShape) => {
                const model: SelectionRenderModel = control.model;
                return {
                    startRow: model.startRow,
                    startColumn: model.startColumn,
                    endRow: model.endRow,
                    endColumn: model.endColumn,
                };
            });
            return selections;
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
    }

    reset() {
        this._clearSelectionControls();
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
     * @returns
     */
    eventTrigger(
        evt: IPointerEvent | IMouseEvent,
        zIndex = 0,
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
            curControls.length > 0 &&
            !evt.ctrlKey &&
            !evt.shiftKey &&
            !this._isShowPreviousEnable &&
            !this._isRemainLastEnable
        ) {
            for (const control of curControls) {
                control.dispose();
            }

            curControls.length = 0;
        }

        const currentCell = selectionControl && selectionControl.model.currentCell;

        if (selectionControl && evt.shiftKey && currentCell) {
            const { actualRow, actualColumn } = currentCell;

            // TODO startCell position calculate error
            const startCell = skeleton.getNoMergeCellPositionByIndex(actualRow, actualColumn, scaleX, scaleY);
            const endCell = skeleton.getNoMergeCellPositionByIndex(endRow, endColumn, scaleX, scaleY);

            const newSelectionRange = {
                startColumn: actualColumn,
                startRow: actualRow,
                endColumn: startSelectionRange.startColumn,
                endRow: startSelectionRange.startRow,
                startY: startCell?.startY || 0,
                endY: endCell?.endY || 0,
                startX: startCell?.startX || 0,
                endX: endCell?.endX || 0,
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
            !this._isSkipRemainLastEnable
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

            new SelectionShapeExtension(selectionControl, skeleton, scene, this._themeService);

            selectionControl.update(
                startSelectionRange,
                rowHeaderWidth,
                columnHeaderHeight,
                this._selectionStyle,
                primaryWithCoord
            );

            curControls.push(selectionControl);
        }

        this._selectionMoveStart$.next([...(this.getActiveRangeList() || [])]);

        this.hasSelection = true;

        this._endSelection();

        scene.disableEvent();

        const scrollTimer = ScrollTimer.create(this._scene);
        scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY, viewport);

        this._scrollTimer = scrollTimer;

        this._addCancelObserver();

        if (rangeType === RANGE_TYPE.ROW || rangeType === RANGE_TYPE.COLUMN) {
            this._moving(newEvtOffsetX, newEvtOffsetY, selectionControl, rangeType);
        }

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(
                Vector2.FromArray([moveOffsetX, moveOffsetY])
            );

            this._moving(newMoveOffsetX, newMoveOffsetY, selectionControl, rangeType);

            scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                this._moving(newMoveOffsetX, newMoveOffsetY, selectionControl, rangeType);
            });
        });

        this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
            this._endSelection();
            this._selectionRangeWithStyle$.next(this.getSelectionDataWithStyle());
        });
    }

    convertSelectionRangeToData(selectionWithStyle: ISelectionWithStyle): ISelectionWithCoordAndStyle {
        const { range, primary, style } = selectionWithStyle;
        let rangeWithCoord = this.convertRangeDataToSelection(range);
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
            primaryWithCoord: this.convertCellRangeToInfo(primary),
            style,
        };
    }

    convertRangeDataToSelection(range: IRange): Nullable<IRangeWithCoord> {
        const { startRow, startColumn, endRow, endColumn, rangeType } = range;
        const scene = this._scene;
        const skeleton = this._skeleton;
        if (scene == null || skeleton == null) {
            return;
        }
        const { scaleX, scaleY } = scene.getAncestorScale();
        const startCell = skeleton.getNoMergeCellPositionByIndex(startRow, startColumn, scaleX, scaleY);
        const endCell = skeleton.getNoMergeCellPositionByIndex(endRow, endColumn, scaleX, scaleY);

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

    convertCellRangeToInfo(primary: Nullable<ISelectionCell>): Nullable<ISelectionCellWithCoord> {
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
        const { scaleX, scaleY } = scene.getAncestorScale();

        const cellPosition = skeleton.getNoMergeCellPositionByIndex(actualRow, actualColumn, scaleX, scaleY);

        const startCell = skeleton.getNoMergeCellPositionByIndex(startRow, startColumn, scaleX, scaleY);
        const endCell = skeleton.getNoMergeCellPositionByIndex(endRow, endColumn, scaleX, scaleY);

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
     * @param moveEvt
     * @param selectionControl
     * @returns
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

        const scrollXY = scene.getScrollXYByRelativeCoords(
            Vector2.FromArray([this._startOffsetX, this._startOffsetY]),
            this._activeViewport
        );

        const { scaleX, scaleY } = scene.getAncestorScale();

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        if (rangeType === RANGE_TYPE.ROW) {
            moveOffsetX = Infinity;
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            moveOffsetY = Infinity;
        }

        const selectionData = this._getSelectedRangeWithMerge(moveOffsetX, moveOffsetY, scaleX, scaleY, scrollXY);

        if (!selectionData) {
            return false;
        }

        const { rangeWithCoord: moveRangeWithCoord, primaryWithCoord: movePrimaryWithCoord } = selectionData;

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

        const startCell = skeleton.getNoMergeCellPositionByIndex(finalStartRow, finalStartColumn, scaleX, scaleY);
        const endCell = skeleton.getNoMergeCellPositionByIndex(finalEndRow, finalEndColumn, scaleX, scaleY);

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
        const {
            startRow: oldStartRow,
            endRow: oldEndRow,
            startColumn: oldStartColumn,
            endColumn: oldEndColumn,
        } = selectionControl?.model || { startRow: -1, endRow: -1, startColumn: -1, endColumn: -1 };

        if (
            (oldStartColumn !== finalStartColumn ||
                oldStartRow !== finalStartRow ||
                oldEndColumn !== finalEndColumn ||
                oldEndRow !== finalEndRow) &&
            selectionControl != null
        ) {
            selectionControl.update(newSelectionRange, rowHeaderWidth, columnHeaderHeight);

            this._selectionMoving$.next(this.getActiveRangeList());
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
        this._cancelDownObserver = mainScene.onPointerDownObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            this._endSelection();
        });

        this._cancelUpObserver = mainScene.onPointerUpObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            this._endSelection();
        });
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

        const startCell = skeleton.getNoMergeCellPositionByIndex(row, column, scaleX, scaleY);

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

export const ISelectionRenderService = createIdentifier<SelectionRenderService>(
    'deprecated.univer.sheet.selection-render-service'
);
