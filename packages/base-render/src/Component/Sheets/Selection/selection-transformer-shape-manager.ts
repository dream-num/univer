import {
    DEFAULT_WORKSHEET_COLUMN_COUNT,
    DEFAULT_WORKSHEET_ROW_COUNT,
    ISelectionCell,
    ISelectionCellWithCoord,
    ISelectionRange,
    ISelectionRangeWithCoord,
    ISelectionWithCoord,
    makeCellToSelection,
    Nullable,
    Observer,
    SELECTION_TYPE,
} from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { IMouseEvent, IPointerEvent } from '../../../Basics/IEvents';
import {
    ISelectionDataWithStyle,
    ISelectionRangeWithStyle,
    ISelectionStyle,
    NORMAL_SELECTION_PLUGIN_STYLE,
} from '../../../Basics/Selection';
import { Vector2 } from '../../../Basics/Vector2';
import { Scene } from '../../../Scene';
import { ScrollTimer } from '../../../ScrollTimer';
import { SpreadsheetSkeleton } from '../SheetSkeleton';
import { SelectionTransformerModel } from './selection-transformer-model';
import { SelectionTransformerShape } from './selection-transformer-shape';
import { SelectionTransformerShapeEvent } from './selection-transformer-shape-event';

export interface ISelectionTransformerShapeManager {
    readonly selectionRangeWithStyle$: Observable<ISelectionDataWithStyle[]>;
    addControlToCurrentByRangeData(data: ISelectionDataWithStyle): void;
    changeRuntime(skeleton: SpreadsheetSkeleton, scene: Scene): void;
    // getSpreadsheet(): void;
    // getMaxIndex(): void;
    getScene(): void;
    getSkeleton(): void;
    getRowAndColumnCount(): void;
    getCurrentControls(): void;
    getCurrentControl(): void;
    clearSelectionControls(): void;
    getActiveRangeList(): Nullable<ISelectionRange[]>;
    getActiveRange(): Nullable<ISelectionRange>;
    getActiveSelection(): Nullable<SelectionTransformerShape>;
    convertSelectionRangeToData(selectionRange: ISelectionRangeWithStyle): ISelectionDataWithStyle;
    convertRangeDataToSelection(rangeData: ISelectionRange): ISelectionRangeWithCoord;
    convertCellRangeToInfo(cellRange: Nullable<ISelectionCell>): Nullable<ISelectionCellWithCoord>;
    eventTrigger(
        evt: IPointerEvent | IMouseEvent,
        style: ISelectionStyle,
        zIndex: number,
        selectionType: SELECTION_TYPE,
        selectedMode: SELECTION_TYPE,
        isDetectMergedCell: boolean
    ): void;
    // getMoveCellInfo(direction: Direction, selectionData: Nullable<ISelectionWithCoord>): Nullable<ISelectionWithCoord>;
    // transformCellDataToSelectionData(row: number, column: number): Nullable<ISelectionWithCoord>;
    reset(): void;
}

/**
 * TODO 注册selection拦截，可能在有公式ArrayObject时，fx公式栏显示不同
 *
 * SelectionManager 维护model数据list，action也是修改这一层数据，obs监听到数据变动后，自动刷新（control仍然可以持有数据）
 */
export class SelectionTransformerShapeManager implements ISelectionTransformerShapeManager {
    hasSelection: boolean = false;

    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _selectionControls: SelectionTransformerShape[] = []; // sheetID:Controls

    private _startSelectionRange: ISelectionRangeWithCoord;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _scrollTimer: ScrollTimer;

    private _cancelDownObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _cancelUpObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _skeleton: SpreadsheetSkeleton;

    private _scene: Scene;

    private readonly _selectionRangeWithStyle$ = new BehaviorSubject<ISelectionDataWithStyle[]>([]);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    readonly selectionRangeWithStyle$ = this._selectionRangeWithStyle$.asObservable();

    static create() {
        return new SelectionTransformerShapeManager();
    }

    /**
     * add a selection
     * @param selectionRange
     * @param curCellRange
     * @returns
     */
    addControlToCurrentByRangeData(data: ISelectionDataWithStyle) {
        const currentControls = this.getCurrentControls();
        if (!currentControls) {
            return;
        }
        const { selection, cellInfo, selectionType } = data;

        const skeleton = this._skeleton;

        let style = data.style;

        if (style == null) {
            style = NORMAL_SELECTION_PLUGIN_STYLE;
        }

        const scene = this.getScene();

        const control = SelectionTransformerShape.create(this.getScene(), currentControls.length);

        new SelectionTransformerShapeEvent(control, skeleton, scene);

        const { rowTitleWidth, columnTitleHeight } = skeleton;

        // update control
        control.update(selection, rowTitleWidth, columnTitleHeight, style, cellInfo, selectionType);

        currentControls.push(control);
    }

    changeRuntime(skeleton: SpreadsheetSkeleton, scene: Scene) {
        this._skeleton = skeleton;
        this._scene = scene;
    }

    // getSpreadsheet() {
    //     return this._sheetComponent;
    // }

    // getMaxIndex() {
    //     return this._sheetComponent.zIndex + 1;
    // }

    getScene() {
        return this._scene;
    }

    getSkeleton() {
        return this._skeleton;
    }

    getRowAndColumnCount() {
        const skeleton = this.getSkeleton();
        return {
            rowCount: skeleton?.getRowCount() || DEFAULT_WORKSHEET_ROW_COUNT,
            columnCount: skeleton?.getColumnCount() || DEFAULT_WORKSHEET_COLUMN_COUNT,
        };
    }

    getSelectionDataWithStyle() {
        const selectionControls = this._selectionControls;
        return selectionControls.map((control) => control.getValue());
    }

    getCurrentControls() {
        return this._selectionControls;
    }

    getCurrentControl() {
        const controls = this.getCurrentControls();
        if (controls && controls.length > 0) {
            for (const control of controls) {
                const currentCell = control.model.currentCell;
                if (currentCell) {
                    return control;
                }
            }
        }
    }

    clearSelectionControls() {
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
    getActiveRangeList(): Nullable<ISelectionRange[]> {
        const controls = this.getCurrentControls();
        if (controls && controls.length > 0) {
            const selections = controls?.map((control: SelectionTransformerShape) => {
                const model: SelectionTransformerModel = control.model;
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
    getActiveRange(): Nullable<ISelectionRange> {
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
    getActiveSelection(): Nullable<SelectionTransformerShape> {
        const controls = this.getCurrentControls();
        return controls && controls[controls.length - 1];
    }

    endSelection() {
        this._endSelection();
    }

    reset() {
        this.clearSelectionControls();
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
     * @param selectionType The type of selector determines the type of data range and the highlighting style of the title bar
     * @param selectedMode Determines whether the selection is made normally according to the range or by rows and columns
     * @param isDetectMergedCell If true, the selector will respond to the range of merged cells and automatically extend the selected range. If false, it will ignore the merged cells.
     * @returns
     */
    eventTrigger(
        evt: IPointerEvent | IMouseEvent,
        style: ISelectionStyle = NORMAL_SELECTION_PLUGIN_STYLE,
        zIndex = 0,
        selectionType: SELECTION_TYPE = SELECTION_TYPE.NORMAL,
        selectedMode: SELECTION_TYPE = SELECTION_TYPE.NORMAL,
        isDetectMergedCell: boolean = true
    ) {
        const skeleton = this._skeleton;

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const scene = this.getScene();

        const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        let { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        this._startOffsetX = newEvtOffsetX;
        this._startOffsetY = newEvtOffsetY;

        const scrollXY = scene.getScrollXYByRelativeCoords(relativeCoords);

        const { scaleX, scaleY } = scene.getAncestorScale();

        if (selectedMode === SELECTION_TYPE.ROW) {
            newEvtOffsetX = 0;
        } else if (selectedMode === SELECTION_TYPE.COLUMN) {
            newEvtOffsetY = 0;
        }

        const selectionData = this._getSelectedRangeWithMerge(
            newEvtOffsetX,
            newEvtOffsetY,
            scaleX,
            scaleY,
            scrollXY,
            isDetectMergedCell
        );

        if (!selectionData) {
            return false;
        }

        const { selection: actualSelection, cellInfo } = selectionData;

        const { startRow, startColumn, endColumn, endRow, startY, endY, startX, endX } = actualSelection;

        const { rowTitleWidth, columnTitleHeight } = skeleton;

        const startSelectionRange = {
            startColumn,
            startRow,
            endColumn,
            endRow,
            startY,
            endY,
            startX,
            endX,
        };

        this._startSelectionRange = startSelectionRange;

        let selectionControl: Nullable<SelectionTransformerShape> = this.getCurrentControl();

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
        if (curControls.length > 0 && !evt.ctrlKey && !evt.shiftKey) {
            for (const control of curControls) {
                control.dispose();
            }

            curControls.length = 0; // clear currentSelectionControls
        }

        const currentCell = selectionControl && selectionControl.model.currentCell;

        if (selectionControl && evt.shiftKey && currentCell) {
            const { row, column } = currentCell;

            // TODO startCell position calculate error
            const startCell = skeleton.getNoMergeCellPositionByIndex(row, column, scaleX, scaleY);
            const endCell = skeleton.getNoMergeCellPositionByIndex(endRow, endColumn, scaleX, scaleY);

            const newSelectionRange = {
                startColumn: column,
                startRow: row,
                endColumn: startSelectionRange.startColumn,
                endRow: startSelectionRange.startRow,
                startY: startCell?.startY || 0,
                endY: endCell?.endY || 0,
                startX: startCell?.startX || 0,
                endX: endCell?.endX || 0,
            };
            selectionControl.update(
                newSelectionRange,
                rowTitleWidth,
                columnTitleHeight,
                style,
                currentCell,
                selectionType
            );
        } else {
            selectionControl = SelectionTransformerShape.create(scene, curControls.length + zIndex);

            new SelectionTransformerShapeEvent(selectionControl, skeleton, scene);

            selectionControl.update(
                startSelectionRange,
                rowTitleWidth,
                columnTitleHeight,
                style,
                cellInfo,
                selectionType
            );

            curControls.push(selectionControl);
        }

        this.hasSelection = true;

        scene.disableEvent();

        this._endSelection();

        const scrollTimer = ScrollTimer.create(this.getScene());
        scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY);

        this._scrollTimer = scrollTimer;

        this._addCancelObserver();

        if (selectedMode === SELECTION_TYPE.ROW || selectedMode === SELECTION_TYPE.COLUMN) {
            this._moving(newEvtOffsetX, newEvtOffsetY, selectionControl, selectedMode, isDetectMergedCell);
        }

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(
                Vector2.FromArray([moveOffsetX, moveOffsetY])
            );

            this._moving(newMoveOffsetX, newMoveOffsetY, selectionControl, selectedMode, isDetectMergedCell);

            scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                this._moving(newMoveOffsetX, newMoveOffsetY, selectionControl, selectedMode, isDetectMergedCell);
            });
        });

        this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
            this._endSelection();
            this._selectionRangeWithStyle$.next(this.getSelectionDataWithStyle());
        });

        // state.stopPropagation();
    }

    convertSelectionRangeToData(selectionRange: ISelectionRangeWithStyle): ISelectionDataWithStyle {
        const { rangeData, cellRange, style, selectionType } = selectionRange;

        return {
            selection: this.convertRangeDataToSelection(rangeData),
            cellInfo: this.convertCellRangeToInfo(cellRange),
            style,
            selectionType,
        };
    }

    convertRangeDataToSelection(rangeData: ISelectionRange): ISelectionRangeWithCoord {
        const { startRow, startColumn, endRow, endColumn } = rangeData;
        const { scaleX, scaleY } = this._scene.getAncestorScale();
        const startCell = this._skeleton.getNoMergeCellPositionByIndex(startRow, startColumn, scaleX, scaleY);
        const endCell = this._skeleton.getNoMergeCellPositionByIndex(endRow, endColumn, scaleX, scaleY);

        return {
            startRow,
            startColumn,
            endRow,
            endColumn,
            startY: startCell?.startY || 0,
            endY: endCell?.endY || 0,
            startX: startCell?.startX || 0,
            endX: endCell?.endX || 0,
        };
    }

    convertCellRangeToInfo(cellRange: Nullable<ISelectionCell>): Nullable<ISelectionCellWithCoord> {
        if (cellRange == null) {
            return;
        }
        const { row, column, isMerged, isMergedMainCell, startRow, startColumn, endRow, endColumn } = cellRange;
        const { scaleX, scaleY } = this._scene.getAncestorScale();

        const cellPosition = this._skeleton.getNoMergeCellPositionByIndex(row, column, scaleX, scaleY);

        const startCell = this._skeleton.getNoMergeCellPositionByIndex(startRow, startColumn, scaleX, scaleY);
        const endCell = this._skeleton.getNoMergeCellPositionByIndex(endRow, endColumn, scaleX, scaleY);

        return {
            row,
            column,
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
        selectionControl: Nullable<SelectionTransformerShape>,
        selectedMode: SELECTION_TYPE,
        isDetectMergedCell: boolean = true
    ) {
        const skeleton = this._skeleton;

        const scene = this._scene;

        const { startRow, startColumn, endRow, endColumn } = this._startSelectionRange;

        const scrollXY = scene.getScrollXYByRelativeCoords(Vector2.FromArray([this._startOffsetX, this._startOffsetY]));

        const { scaleX, scaleY } = scene.getAncestorScale();

        const { rowTitleWidth, columnTitleHeight } = skeleton;

        if (selectedMode === SELECTION_TYPE.ROW) {
            moveOffsetX = Infinity;
        } else if (selectedMode === SELECTION_TYPE.COLUMN) {
            moveOffsetY = Infinity;
        }

        const selectionData = this._getSelectedRangeWithMerge(
            moveOffsetX,
            moveOffsetY,
            scaleX,
            scaleY,
            scrollXY,
            isDetectMergedCell
        );

        if (!selectionData) {
            return false;
        }

        const { selection: moveActualSelection, cellInfo: moveCellInfo } = selectionData;

        const {
            startRow: moveStartRow,
            startColumn: moveStartColumn,
            endColumn: moveEndColumn,
            endRow: moveEndRow,
        } = moveActualSelection;

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

        if (isDetectMergedCell) {
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

        const newSelectionRange: ISelectionRangeWithCoord = {
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
            oldStartColumn !== finalStartColumn ||
            oldStartRow !== finalStartRow ||
            oldEndColumn !== finalEndColumn ||
            oldEndRow !== finalEndRow
        ) {
            selectionControl && selectionControl.update(newSelectionRange, rowTitleWidth, columnTitleHeight);
        }
    }

    private _endSelection() {
        const scene = this.getScene();
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
        const scene = this.getScene();
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
        scrollXY: { x: number; y: number },
        isDetectMergedCell: boolean = true
    ): Nullable<ISelectionWithCoord> {
        if (isDetectMergedCell) {
            const cellInfo = this._skeleton.calculateCellIndexByPosition(offsetX, offsetY, scaleX, scaleY, scrollXY);
            const selection = makeCellToSelection(cellInfo);
            if (selection == null) {
                return;
            }
            return {
                cellInfo,
                selection,
            };
        }

        const moveActualSelection = this._skeleton.getCellPositionByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);

        const { row, column } = moveActualSelection;

        const startCell = this._skeleton.getNoMergeCellPositionByIndex(row, column, scaleX, scaleY);

        const { startX, startY, endX, endY } = startCell;

        const selection = {
            startY,
            endY,
            startX,
            endX,
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
        };

        const cellInfo = {
            row,
            column,

            isMerged: false,

            isMergedMainCell: false,

            startY,
            endY,
            startX,
            endX,

            mergeInfo: selection,
        };

        return {
            cellInfo,
            selection,
        };
    }
}

export const ISelectionTransformerShapeManager = createIdentifier<SelectionTransformerShapeManager>(
    'deprecated.univer.sheet.selection-transformer-manager'
);
