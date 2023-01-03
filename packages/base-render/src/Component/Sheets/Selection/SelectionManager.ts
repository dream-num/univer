import { Nullable, Observer, ISelection, makeCellToSelection, IRangeData, IRangeCellData } from '@univer/core';

import { SelectionControl } from './SelectionControl';
import { ScrollTimer } from '../../../ScrollTimer';
import { IMouseEvent, IPointerEvent } from '../../../Basics/IEvents';
import { Spreadsheet } from '../Spreadsheet';
import { SelectionModel } from './SelectionModel';
import { Vector2 } from '../../../Basics/Vector2';
import { Scene } from '../../../Scene';

/**
 * TODO 注册selection拦截，可能在有公式ArrayObject时，fx公式栏显示不同
 *
 * SelectionManager 维护model数据list，action也是修改这一层数据，obs监听到数据变动后，自动刷新（control仍然可以持有数据）
 */
export class SelectionManager {
    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _selectionControls: SelectionControl[] = []; // sheetID:Controls

    private _startSelectionRange: ISelection;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _scrollTimer: ScrollTimer;

    private _cancelDownObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _cancelUpObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    hasSelection: boolean = false;

    constructor(private _spreadsheet: Spreadsheet) {
        this._mainEventInitial();
    }

    /**
     * add a selection
     * @param selectionRange
     * @param curCellRange
     * @returns
     */
    addControlToCurrentByRangeData(selectionRange: IRangeData, curCellRange: Nullable<IRangeCellData>) {
        const currentControls = this.getCurrentControls();
        if (!currentControls) {
            return;
        }
        const main = this._spreadsheet;

        const control = SelectionControl.create(this.getScene(), currentControls.length);

        let cellInfo = null;
        if (curCellRange) {
            cellInfo = main.getCellByIndex(curCellRange.row, curCellRange.column);
        }

        const { startRow, startColumn, endRow, endColumn } = selectionRange;
        const startCell = main.getNoMergeCellPositionByIndex(startRow, startColumn);
        const endCell = main.getNoMergeCellPositionByIndex(endRow, endColumn);

        // update control
        control.update(
            {
                startColumn,
                startRow,
                endColumn,
                endRow,
                startY: startCell?.startY || 0,
                endY: endCell?.endY || 0,
                startX: startCell?.startX || 0,
                endX: endCell?.endX || 0,
            },
            cellInfo
        );

        currentControls.push(control);
    }

    getSpreadsheet() {
        return this._spreadsheet;
    }

    getMaxIndex() {
        return this._spreadsheet.zIndex + 1;
    }

    getScene() {
        return this._spreadsheet.getScene();
    }

    getSkeleton() {
        return this._spreadsheet.getSkeleton();
    }

    getRowAndColumnCount() {
        const skeleton = this.getSkeleton();
        return {
            rowCount: skeleton?.getRowCount() || 1000,
            columnCount: skeleton?.getColumnCount() || 50,
        };
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
        let curControls = this.getCurrentControls();

        if (curControls.length > 0) {
            for (let control of curControls) {
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
    getActiveRangeList(): Nullable<IRangeData[]> {
        const controls = this.getCurrentControls();
        if (controls && controls.length > 0) {
            const selections = controls?.map((control: SelectionControl) => {
                const model: SelectionModel = control.model;
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
    getActiveRange(): Nullable<IRangeData> {
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
    getActiveSelection(): Nullable<SelectionControl> {
        const controls = this.getCurrentControls();
        return controls && controls[controls.length - 1];
    }

    dispose() {
        this.clearSelectionControls();
        this._moveObserver = null;
        this._upObserver = null;
    }

    /**
     * When mousedown and mouseup need to go to the coordination and undo stack, when mousemove does not need to go to the coordination and undo stack
     * @param moveEvt
     * @param selectionControl
     * @returns
     */
    private _moving(moveOffsetX: number, moveOffsetY: number, selectionControl: Nullable<SelectionControl>) {
        // console.log('moving');
        const main = this._spreadsheet;
        // const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
        const { startRow, startColumn, endRow, endColumn } = this._startSelectionRange;

        // const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        // const scene = this.getScene() as Scene;

        // const coord = scene.getRelativeCoord(Vector2.FromArray([moveOffsetX, moveOffsetY]));
        // const { x: newMoveOffsetX, y: newMoveOffsetY } = coord;

        const scrollXY = main.getScrollXYByRelativeCoords(Vector2.FromArray([this._startOffsetX, this._startOffsetY]));

        const moveCellInfo = main.calculateCellIndexByPosition(moveOffsetX, moveOffsetY, scrollXY);
        const moveActualSelection = makeCellToSelection(moveCellInfo);

        if (!moveActualSelection) {
            return false;
        }
        const { startRow: moveStartRow, startColumn: moveStartColumn, endColumn: moveEndColumn, endRow: moveEndRow } = moveActualSelection;

        const newStartRow = Math.min(moveStartRow, startRow);
        const newStartColumn = Math.min(moveStartColumn, startColumn);
        const newEndRow = Math.max(moveEndRow, endRow);
        const newEndColumn = Math.max(moveEndColumn, endColumn);
        const newBounding = main.getSelectionBounding(newStartRow, newStartColumn, newEndRow, newEndColumn);

        if (!newBounding) {
            return false;
        }
        const { startRow: finalStartRow, startColumn: finalStartColumn, endRow: finalEndRow, endColumn: finalEndColumn } = newBounding;

        const startCell = main.getNoMergeCellPositionByIndex(finalStartRow, finalStartColumn);
        const endCell = main.getNoMergeCellPositionByIndex(finalEndRow, finalEndColumn);

        const newSelectionRange: ISelection = {
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

        if (oldStartColumn !== finalStartColumn || oldStartRow !== finalStartRow || oldEndColumn !== finalEndColumn || oldEndRow !== finalEndRow) {
            selectionControl && selectionControl.update(newSelectionRange);
        }
    }

    private _endSelection(scene: Scene) {
        scene.onPointerMoveObserver.remove(this._moveObserver);
        scene.onPointerUpObserver.remove(this._upObserver);
        scene.enableEvent();

        this._scrollTimer?.stopScroll();

        const mainScene = scene.getEngine()?.activeScene;
        mainScene?.onPointerDownObserver.remove(this._cancelDownObserver);
        mainScene?.onPointerUpObserver.remove(this._cancelUpObserver);
    }

    private _addCancelObserver() {
        const scene = this.getScene() as Scene;
        const mainScene = scene.getEngine()?.activeScene;
        if (mainScene == null || mainScene === scene) {
            return;
        }
        mainScene.onPointerDownObserver.remove(this._cancelDownObserver);
        mainScene.onPointerUpObserver.remove(this._cancelUpObserver);
        this._cancelDownObserver = mainScene.onPointerDownObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            this._endSelection(scene);
        });

        this._cancelUpObserver = mainScene.onPointerUpObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            this._endSelection(scene);
        });
    }

    private _mainEventInitial() {
        const main = this._spreadsheet;
        main.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

            const scene = this.getScene() as Scene;

            const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

            const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

            this._startOffsetX = newEvtOffsetX;
            this._startOffsetY = newEvtOffsetY;

            const scrollXY = main.getScrollXYByRelativeCoords(relativeCoords);

            const cellInfo = main.calculateCellIndexByPosition(newEvtOffsetX, newEvtOffsetY, scrollXY);
            const actualSelection = makeCellToSelection(cellInfo);
            if (!actualSelection) {
                return false;
            }

            const { startRow, startColumn, endColumn, endRow, startY, endY, startX, endX } = actualSelection;

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

            let selectionControl: Nullable<SelectionControl> = this.getCurrentControl();

            let curControls = this.getCurrentControls();

            if (!curControls) {
                return false;
            }

            for (let control of curControls) {
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
                for (let control of curControls) {
                    control.dispose();
                }

                curControls.length = 0; // clear currentSelectionControls
            }

            const currentCell = selectionControl && selectionControl.model.currentCell;

            if (selectionControl && evt.shiftKey && currentCell) {
                const { row, column } = currentCell;

                // TODO startCell position calculate error
                const startCell = main.getNoMergeCellPositionByIndex(row, column);
                const endCell = main.getNoMergeCellPositionByIndex(endRow, endColumn);

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
                selectionControl.update(newSelectionRange, currentCell);
            } else {
                selectionControl = SelectionControl.create(scene, curControls.length + this.getMaxIndex());
                selectionControl.update(startSelectionRange, cellInfo);
                curControls.push(selectionControl);
            }

            this.hasSelection = true;

            scene.disableEvent();

            this._endSelection(scene);

            const scrollTimer = ScrollTimer.create(this.getScene());
            scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY);

            this._scrollTimer = scrollTimer;

            this._addCancelObserver();

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

                const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(Vector2.FromArray([moveOffsetX, moveOffsetY]));

                this._moving(newMoveOffsetX, newMoveOffsetY, selectionControl);

                scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                    this._moving(newMoveOffsetX, newMoveOffsetY, selectionControl);
                });
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                this._endSelection(scene);
            });

            state.stopPropagation();
        });
    }

    static create(spreadsheet: Spreadsheet) {
        return new SelectionManager(spreadsheet);
    }
}
