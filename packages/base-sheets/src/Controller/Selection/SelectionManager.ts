import { IMouseEvent, IPointerEvent, Rect, Spreadsheet, SpreadsheetColumnTitle, SpreadsheetRowTitle } from '@univer/base-render';
import { Nullable, Observer, Worksheet, ISelection, makeCellToSelection, IRangeData, RangeList, Range, IRangeCellData } from '@univer/core';
import { SelectionModel } from '../../Model/SelectionModel';
import { ISelectionsConfig, SpreadsheetPlugin } from '../../SpreadsheetPlugin';
import { SheetView } from '../../View/Render/Views/SheetView';
import { ScrollTimer } from '../ScrollTimer';
import { SelectionControl, SELECTION_TYPE } from './SelectionController';

/**
 * TODO 注册selection拦截，可能在有公式ArrayObject时，fx公式栏显示不同
 */
export class SelectionManager {
    private _mainComponent: Spreadsheet;

    private _rowComponent: SpreadsheetRowTitle;

    private _columnComponent: SpreadsheetColumnTitle;

    private _leftTopComponent: Rect;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _selectionControls = new Map<string, SelectionControl[]>(); // sheetID:Controls

    private _plugin: SpreadsheetPlugin;

    private _startSelectionRange: ISelection;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _worksheet: Nullable<Worksheet>;

    hasSelection: boolean = false;

    getScene() {
        return this._sheetView.getScene();
    }

    getContext() {
        return this._sheetView.getContext();
    }

    updateToSheet(worksheet: Worksheet) {
        this._worksheet = worksheet;
        const worksheetId = this.getWorksheetId();
        if (worksheetId) {
            const controls = this._selectionControls.get(worksheetId);
            if (!controls) {
                this._selectionControls.set(worksheetId, []);
            }
        }
    }

    getCurrentControls() {
        const worksheetId = this.getWorksheetId();
        if (worksheetId) {
            const controls = this._selectionControls.get(worksheetId);
            if (!controls) {
                this._selectionControls.set(worksheetId, []);
            }
            return this._selectionControls.get(worksheetId);
        }
    }

    /**
     * Renders all controls of the currently active sheet
     * @returns
     */
    renderCurrentControls() {
        const worksheetId = this.getWorksheetId();
        if (worksheetId) {
            this._selectionControls.forEach((selectionControls, sheetId) => {
                if (worksheetId !== sheetId) {
                    for (let control of selectionControls) {
                        control.dispose();
                    }
                } else {
                    for (let control of selectionControls) {
                        control.render();
                    }
                }
            });
        }
    }

    resetCurrentControls() {
        const worksheetId = this.getWorksheetId();
        if (worksheetId) {
            this._selectionControls.set(worksheetId, []);
        }
    }

    getPlugin() {
        return this._plugin;
    }

    getWorksheetId() {
        return this._worksheet?.getSheetId();
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
        const main = this._mainComponent;

        const control = SelectionControl.create(this, currentControls.length);

        let cellInfo = null;
        if (curCellRange) {
            cellInfo = main.getCellByIndex(curCellRange.row, curCellRange.column);
        }

        const { startRow: finalStartRow, startColumn: finalStartColumn, endRow: finalEndRow, endColumn: finalEndColumn } = selectionRange;
        const startCell = main.getNoMergeCellPositionByIndex(finalStartRow, finalStartColumn);
        const endCell = main.getNoMergeCellPositionByIndex(finalEndRow, finalEndColumn);

        control.update(
            {
                startColumn: finalStartColumn,
                startRow: finalStartRow,
                endColumn: finalEndColumn,
                endRow: finalEndRow,
                startY: startCell?.startY || 0,
                endY: endCell?.endY || 0,
                startX: startCell?.startX || 0,
                endX: endCell?.endX || 0,
            },
            cellInfo
        );
        currentControls.push(control);
    }

    recreateControlsByRangeData() {}

    constructor(private _sheetView: SheetView) {
        this._plugin = this._sheetView.getPlugin() as SpreadsheetPlugin;
        this._initialize();
    }

    private _initialize() {
        this._mainComponent = this._sheetView.getSpreadsheet();
        this._rowComponent = this._sheetView.getSpreadsheetRowTitle();
        this._columnComponent = this._sheetView.getSpreadsheetColumnTitle();
        this._leftTopComponent = this._sheetView.getSpreadsheetLeftTopPlaceholder();

        this._mainEventInitial();

        this._rowEventInitial();

        this._columnEventInitial();

        this._leftTopEventInitial();

        this._worksheet = this.getContext().getWorkBook().getActiveSheet();
        const worksheetId = this.getWorksheetId();
        if (worksheetId) {
            this._selectionControls.set(worksheetId, []);
        }

        this._initControls(this._plugin.config.selections);
        this.renderCurrentControls();
    }

    private _mainEventInitial() {
        const main = this._mainComponent;
        main.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this._startOffsetX = evtOffsetX;
            this._startOffsetY = evtOffsetY;
            const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
            const cellInfo = main.calculateCellIndexByPosition(evtOffsetX, evtOffsetY, scrollXY);
            const actualSelection = makeCellToSelection(cellInfo);
            if (!actualSelection || !this._worksheet) {
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

            let selectionControl: Nullable<SelectionControl> = null;

            let curControls = this.getCurrentControls();

            // console.log('selection', curControls, startSelectionRange);

            if (!curControls) {
                return false;
            }

            for (let control of curControls) {
                // right click
                if (evt.button === 2 && control.model.isInclude(startSelectionRange, SELECTION_TYPE.NORMAL)) {
                    selectionControl = control;
                    return;
                }
                // Click to an existing selection
                if (control.model.isEqual(startSelectionRange, SELECTION_TYPE.NORMAL)) {
                    selectionControl = control;
                    break;
                }

                // There can only be one highlighted cell, so clear the highlighted cell of the existing selection
                control.clearHighlight();
            }

            if (!selectionControl) {
                if (curControls.length > 0 && !evt.ctrlKey) {
                    for (let control of curControls) {
                        control.dispose();
                    }
                    this.resetCurrentControls();
                    curControls = this.getCurrentControls()!;
                }

                selectionControl = SelectionControl.create(this, curControls.length);
                curControls.push(selectionControl);
            }

            selectionControl.update(startSelectionRange, cellInfo);

            this.hasSelection = true;

            const scene = this.getScene();

            scene.disableEvent();

            const scrollTimer = ScrollTimer.create(this.getScene());
            scrollTimer.startScroll(evtOffsetX, evtOffsetY);

            // Notification toolbar updates button state and value
            this._plugin.getObserver('onChangeSelectionObserver')?.notifyObservers(selectionControl);

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                this.moving(moveEvt, selectionControl);
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this.moving(moveEvt, selectionControl);
                });
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                scene.onPointerMoveObserver.remove(this._moveObserver);
                scene.onPointerUpObserver.remove(this._upObserver);
                scene.enableEvent();
                scrollTimer.stopScroll();
            });
        });
    }

    moving(moveEvt: IPointerEvent | IMouseEvent, selectionControl: Nullable<SelectionControl>) {
        const main = this._mainComponent;
        const { offsetX: moveOffsetX, offsetY: moveOffsetY, clientX, clientY } = moveEvt;
        const { startRow, startColumn, endRow, endColumn } = this._startSelectionRange;
        // console.log('_moveObserver', moveOffsetX, moveOffsetY, clientX, clientY);
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const moveCellInfo = main.calculateCellIndexByPosition(moveOffsetX, moveOffsetY, scrollXY);
        const moveActualSelection = makeCellToSelection(moveCellInfo);
        // console.log('onPointerMoveObserver', moveOffsetY, scrollXY, moveCellInfo, moveCellInfo?.endRowIndex, moveActualPos, moveActualPos?.endRowIndex);
        if (!moveActualSelection) {
            return false;
        }
        const { startRow: moveStartRow, startColumn: moveStartColumn, endColumn: moveEndColumn, endRow: moveEndRow } = moveActualSelection;

        const newStartRow = Math.min(moveStartRow, startRow);
        const newStartColumn = Math.min(moveStartColumn, startColumn);
        const newEndRow = Math.max(moveEndRow, endRow);
        const newEndColumn = Math.max(moveEndColumn, endColumn);
        const newBounding = main.getSelectionBounding(newStartRow, newStartColumn, newEndRow, newEndColumn);

        // console.log('_moveObserver', newStartRowIndex, newStartColumnIndex, newEndRowIndex, newEndColumnIndex);
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

        selectionControl && selectionControl.update(newSelectionRange);

        if (oldStartColumn !== finalStartColumn || oldStartRow !== finalStartRow || oldEndColumn !== finalEndColumn || oldEndRow !== finalEndRow) {
            selectionControl && this._plugin.getObserver('onChangeSelectionObserver')?.notifyObservers(selectionControl);
        }
    }

    private _rowEventInitial() {
        const row = this._rowComponent;
        row.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            console.log('rowTitle_moveObserver', evt);
        });
    }

    private _columnEventInitial() {
        const column = this._columnComponent;
        column.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            console.log('columnTitle_moveObserver', evt);
        });
    }

    private _leftTopEventInitial() {
        const leftTop = this._leftTopComponent;
        leftTop.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            console.log('leftTop_moveObserver', evt);
        });
    }

    /**
     * Initialize selection based on user configuration
     * @param selections
     */
    private _initControls(selections: ISelectionsConfig) {
        Object.keys(selections).forEach((worksheetId) => {
            const selectionsList = selections[worksheetId];
            const currentControls: SelectionControl[] = [];

            selectionsList.forEach((selectionConfig) => {
                const selectionRange = selectionConfig.selection;
                const curCellRange = selectionConfig.cell;
                const main = this._mainComponent;

                const control = SelectionControl.create(this, currentControls.length);

                let cellInfo = null;
                if (curCellRange) {
                    cellInfo = main.getCellByIndex(curCellRange.row, curCellRange.column);
                }

                const { startRow: finalStartRow, startColumn: finalStartColumn, endRow: finalEndRow, endColumn: finalEndColumn } = selectionRange;
                const startCell = main.getNoMergeCellPositionByIndex(finalStartRow, finalStartColumn);
                const endCell = main.getNoMergeCellPositionByIndex(finalEndRow, finalEndColumn);

                // Only update data, not render
                control.model.setValue(
                    {
                        startColumn: finalStartColumn,
                        startRow: finalStartRow,
                        endColumn: finalEndColumn,
                        endRow: finalEndRow,
                        startY: startCell?.startY || 0,
                        endY: endCell?.endY || 0,
                        startX: startCell?.startX || 0,
                        endX: endCell?.endX || 0,
                    },
                    cellInfo
                );
                // control.update(
                //     {
                //         startColumn: finalStartColumn,
                //         startRow: finalStartRow,
                //         endColumn: finalEndColumn,
                //         endRow: finalEndRow,
                //         startY: startCell?.startY || 0,
                //         endY: endCell?.endY || 0,
                //         startX: startCell?.startX || 0,
                //         endX: endCell?.endX || 0,
                //     },
                //     cellInfo
                // );
                currentControls.push(control);
            });

            this._selectionControls.set(worksheetId, currentControls);
        });
    }

    /**
     * Returns the list of active ranges in the active sheet or null if there are no active ranges.
     * If there is a single range selected, this behaves as a getActiveRange() call.
     *
     * @returns
     */
    getActiveRangeList(): Nullable<RangeList> {
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
            return this._worksheet?.getRangeList(selections);
        }
    }

    /**
     * Returns the selected range in the active sheet, or null if there is no active range. If multiple ranges are selected this method returns only the last selected range.
     * @returns
     */
    getActiveRange(): Nullable<Range> {
        const controls = this.getCurrentControls();
        if (controls && controls.length > 0) {
            const control = controls?.find((control: SelectionControl) => {
                if (control.getCurrentCellInfo()) {
                    return control;
                }
                return null;
            });
            if (control) {
                const model = control.model;
                const rangeData = {
                    startRow: model.startRow,
                    startColumn: model.startColumn,
                    endRow: model.endRow,
                    endColumn: model.endColumn,
                };
                return this._worksheet?.getRange(rangeData);
            }
        }
        // const model = controls && controls[controls.length - 1].model;
        // return (
        //     model &&
        //     this._worksheet?.getRange({
        //         startRow: model.startRow,
        //         startColumn: model.startColumn,
        //         endRow: model.endRow,
        //         endColumn: model.endColumn,
        //     })
        // );

        // if (controls && controls.length > 0) {
        //     const selections = controls?.map((control: SelectionControl) => {
        //         const model: SelectionModel = control.model;
        //         return {
        //             startRow: model.startRow,
        //             startColumn: model.startColumn,
        //             endRow: model.endRow,
        //             endColumn: model.endColumn,
        //         };
        //     });
        //     return this._worksheet?.getRangeList(selections);
        // }
    }

    /**
     * get active selection control
     * @returns
     */
    getActiveSelection(): Nullable<SelectionControl> {
        const controls = this.getCurrentControls();
        if (controls && controls.length > 0) {
            const control = controls?.find((control: SelectionControl) => {
                if (control.getCurrentCellInfo()) {
                    return control;
                }
                return null;
            });
            if (control) {
                return control;
            }
        }
    }
}
