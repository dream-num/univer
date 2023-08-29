import { SetSelectionsOperation } from '@Commands/Operations/selection.operation';
import { IMouseEvent, IPointerEvent, Rect, ScrollTimer, Spreadsheet, SpreadsheetColumnTitle, SpreadsheetRowTitle } from '@univerjs/base-render';
import {
    CommandManager,
    DEFAULT_CELL,
    DEFAULT_SELECTION,
    Direction,
    ICellInfo,
    ICommandService,
    ICurrentUniverService,
    IGridRange,
    IRangeCellData,
    IRangeData,
    ISelection,
    ISelectionData,
    makeCellToSelection,
    Nullable,
    Observer,
    ObserverManager,
    Range,
    RangeList,
    Worksheet,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { ISelectionsConfig, ISheetPluginConfig } from '../../Basics';
import { ISelectionModelValue } from '../../Model/Action/SetSelectionValueAction';
import { SelectionModel } from '../../Model/SelectionModel';
import { SheetView } from '../../View/Views/SheetView';
import { ColumnTitleController } from './ColumnTitleController';
import { DragLineController } from './DragLineController';
import { RowTitleController } from './RowTitleController';
import { SelectionController, SELECTION_TYPE } from './SelectionController';

/**
 * TODO 注册selection拦截，可能在有公式ArrayObject时，fx公式栏显示不同
 *
 * SelectionManager 维护model数据list，action也是修改这一层数据，obs监听到数据变动后，自动刷新（control仍然可以持有数据）
 */
export class SelectionManager {
    hasSelection: boolean = false;

    private _mainComponent: Spreadsheet;

    private _rowComponent: SpreadsheetRowTitle;

    private _columnComponent: SpreadsheetColumnTitle;

    private _leftTopComponent: Rect;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _selectionControls: SelectionController[] = []; // sheetID:Controls

    private _selectionModels = new Map<string, SelectionModel[]>(); // sheetID:Models

    private _startSelectionRange: ISelection;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _worksheet: Nullable<Worksheet>;

    private _previousSelection: ISelectionData;

    constructor(
        /** @deprecated this should be divided into smaller pieces */
        private readonly _sheetView: SheetView,
        private readonly _config: ISheetPluginConfig,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        /** @deprecated use ICommandService instead */
        @Inject(CommandManager) private readonly _commandManager: CommandManager,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        /** @deprecated this should be divided into smaller pieces */
        @Inject(DragLineController) private readonly _dragLineController: DragLineController,
        @Inject(ColumnTitleController) private readonly _columnTitleController: ColumnTitleController,
        @Inject(RowTitleController) private readonly _rowTitleController: RowTitleController
    ) {
        this._initialize();
        this._initializeObserver();

        this._commandService.registerCommand(SetSelectionsOperation);
    }

    /** @deprecated */
    getSheetView() {
        return this._sheetView;
    }

    /** @deprecated */
    getScene() {
        return this._sheetView.getScene();
    }

    /** @deprecated */
    getMainComponent() {
        return this._mainComponent;
    }

    updateToSheet(worksheet: Worksheet) {
        this._worksheet = worksheet;
        const worksheetId = this.getWorksheetId();
        if (worksheetId) {
            const models = this._selectionModels.get(worksheetId);
            if (!models) {
                this._selectionModels.set(worksheetId, []);
            }
        }
    }

    getCurrentControls() {
        return this._selectionControls;
    }

    getCurrentSelections() {
        return this._selectionControls.map((control) => {
            const model = control.model;
            return {
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            };
        });
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

    getCurrentModels() {
        const worksheetId = this.getWorksheetId();
        if (!worksheetId) {
            return;
        }

        const models = this._selectionModels.get(worksheetId);

        if (!models) {
            this._selectionModels.set(worksheetId, []);
        }
        return this._selectionModels.get(worksheetId);
    }

    getCurrentCellModel(): Nullable<ICellInfo> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            for (const model of models) {
                const currentCell = model.currentCell;
                if (currentCell) {
                    return currentCell;
                }
            }
        }
    }

    getCurrentModel(): Nullable<SelectionModel> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            for (const model of models) {
                const currentCell = model.currentCell;
                if (currentCell) {
                    return model;
                }
            }
        }
    }

    getCurrentModelsValue(): ISelectionModelValue[] {
        const models = this.getCurrentModels();
        if (!models) {
            return [];
        }
        const selectionModelsValue = [];
        for (const model of models) {
            selectionModelsValue.push(model.getValue());
        }
        return selectionModelsValue;
    }

    /**
     * Renders all controls of the currently active sheet
     * @returns
     */
    renderCurrentControls(command: boolean = true, models?: SelectionModel[]) {
        const worksheetId = this.getWorksheetId();
        if (worksheetId) {
            if (this._selectionControls) {
                // clear old controls
                for (const control of this._selectionControls) {
                    control.dispose();
                }
            }

            // render current control
            const selectionModels = models || this._selectionModels.get(worksheetId);
            this._selectionControls = [];
            selectionModels?.forEach((model) => {
                const curCellRange = model.currentCell;
                const main = this._mainComponent;

                const control = SelectionController.create(this._injector, this._selectionControls.length);

                let cellInfo = null;
                if (curCellRange) {
                    cellInfo = main.getCellByIndex(curCellRange.row, curCellRange.column);
                }

                const { startRow, startColumn, endRow, endColumn } = model;
                const startCell = main.getNoMergeCellPositionByIndex(startRow, startColumn);
                const endCell = main.getNoMergeCellPositionByIndex(endRow, endColumn);

                // update control model and view
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
                this._selectionControls.push(control);
            });

            command && this.setSelectionModel();
        }
    }

    /**
     * add a selection
     * @param selectionRange
     * @param curCellRange
     * @returns
     */
    addControlToCurrentByRangeData(selectionRange: IRangeData, curCellRange: Nullable<IRangeCellData>, command: boolean = true) {
        const currentControls = this.getCurrentControls();
        if (!currentControls) {
            return;
        }
        const main = this._mainComponent;

        const control = SelectionController.create(this._injector, currentControls.length);

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

        // this.setSelectionModel();

        if (command) {
            this.setSelectionModel();
        } else {
            const models = this._selectionControls.map((control) => control.model.getValue());
            return models;
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
     * Update all current controls data in model
     */
    setSelectionModel(models?: ISelectionModelValue[]) {
        if (!this._worksheet) {
            return;
        }

        if (!models) {
            models = this._selectionControls.map((control) => control.model.getValue());
        }

        this._commandService.executeCommand(SetSelectionsOperation.id, {
            workbookId: this._currentUniverService.getCurrentUniverSheetInstance().getUnitId(),
            sheetId: this._worksheet.getSheetId(),
            selections: models,
        });
    }

    setModels(selections: ISelectionModelValue[]) {
        const worksheetId = this.getWorksheetId();
        if (!worksheetId) {
            return;
        }

        const models = selections.map(({ selection, cell }) => {
            const model = this._injector.createInstance(SelectionModel, SELECTION_TYPE.NORMAL);
            model.setValue(selection, cell);
            return model;
        });

        this._selectionModels.set(worksheetId, models);
    }

    // recreateControlsByRangeData() { }

    /**
     * Move the selection according to different directions, usually used for the shortcut key operation of ↑ ↓ ← →
     * @param direction
     * @returns
     */
    // eslint-disable-next-line max-lines-per-function
    move(direction: Direction): void {
        const currentCell = this.getCurrentCellModel();

        if (!currentCell) return;

        let { startRow: mergeStartRow, startColumn: mergeStartColumn, endRow: mergeEndRow, endColumn: mergeEndColumn } = currentCell.mergeInfo;

        let { row, column } = currentCell;
        const rowCount = this._worksheet?.getRowCount() || 1000;
        const columnCount = this._worksheet?.getColumnCount() || 50;
        switch (direction) {
            case Direction.UP:
                if (currentCell.isMerged || currentCell.isMergedMainCell) {
                    row = --mergeStartRow;
                } else {
                    row--;
                }
                if (row < 0) {
                    row = 0;
                }
                break;
            case Direction.DOWN:
                if (currentCell.isMerged || currentCell.isMergedMainCell) {
                    row = ++mergeEndRow;
                } else {
                    row++;
                }

                if (row > rowCount) {
                    row = rowCount;
                }
                break;
            case Direction.LEFT:
                if (currentCell.isMerged || currentCell.isMergedMainCell) {
                    column = --mergeStartColumn;
                } else {
                    column--;
                }

                if (column < 0) {
                    column = 0;
                }
                break;
            case Direction.RIGHT:
                if (currentCell.isMerged || currentCell.isMergedMainCell) {
                    column = ++mergeEndColumn;
                } else {
                    column++;
                }

                if (column > columnCount) {
                    column = columnCount;
                }
                break;

            default:
                break;
        }

        const cellInfo = this._mainComponent.getCellByIndex(row, column);

        const selectionData = makeCellToSelection(cellInfo);

        if (!selectionData) return;

        const { startRow, endRow, startColumn, endColumn } = selectionData;

        const main = this._mainComponent;
        const newBounding = main.getSelectionBounding(startRow, startColumn, endRow, endColumn);

        if (!newBounding) {
            return;
        }

        const { startRow: finalStartRow, startColumn: finalStartColumn, endRow: finalEndRow, endColumn: finalEndColumn } = newBounding;

        const rangeData: IRangeData = {
            startRow: finalStartRow,
            endRow: finalEndRow,
            startColumn: finalStartColumn,
            endColumn: finalEndColumn,
        };
        const currentCellData: IRangeCellData = {
            row: startRow,
            column: startColumn,
        };

        this.clearSelectionControls();
        this.addControlToCurrentByRangeData(rangeData, currentCellData);
        this.updatePreviousSelection();
    }

    setCurrentCell(gridData: IGridRange): void {
        const { rangeData: girdRangeData, sheetId } = gridData;
        const { startRow: row, startColumn: column } = girdRangeData;

        // active new target sheet
        const currentSheetId = this.getWorksheetId();
        if (sheetId !== currentSheetId) {
            const sheetIndex = this._worksheet?.getIndex();
            if (sheetIndex == null) return;
            this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().activateSheetByIndex(sheetIndex);
        }

        const cellInfo = this._mainComponent.getCellByIndex(row, column);

        const selectionData = makeCellToSelection(cellInfo);

        if (!selectionData) return;

        const { startRow, endRow, startColumn, endColumn } = selectionData;

        const main = this._mainComponent;
        const newBounding = main.getSelectionBounding(startRow, startColumn, endRow, endColumn);

        if (!newBounding) {
            return;
        }

        const { startRow: finalStartRow, startColumn: finalStartColumn, endRow: finalEndRow, endColumn: finalEndColumn } = newBounding;

        const rangeData: IRangeData = {
            startRow: finalStartRow,
            endRow: finalEndRow,
            startColumn: finalStartColumn,
            endColumn: finalEndColumn,
        };
        const currentCellData: IRangeCellData = {
            row: startRow,
            column: startColumn,
        };

        this.clearSelectionControls();
        this.addControlToCurrentByRangeData(rangeData, currentCellData);
        this.updatePreviousSelection();
    }

    /**
     * When mousedown and mouseup need to go to the coordination and undo stack, when mousemove does not need to go to the coordination and undo stack
     * @param moveEvt
     * @param selectionControl
     * @returns
     */
    moving(moveEvt: IPointerEvent | IMouseEvent, selectionControl: Nullable<SelectionController>, setModel: boolean = false) {
        // console.log('moving');
        const main = this._mainComponent;
        const { offsetX: moveOffsetX, offsetY: moveOffsetY, clientX, clientY } = moveEvt;
        const { startRow, startColumn, endRow, endColumn } = this._startSelectionRange;

        // moveOffsetX and moveOffsetY is relative to the top left corner of the canvas
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const moveCellInfo = main.calculateCellIndexByPosition(moveOffsetX, moveOffsetY, scrollXY); // scrollXY is canvas content scrolling
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
        const { startRow: oldStartRow, endRow: oldEndRow, startColumn: oldStartColumn, endColumn: oldEndColumn } = selectionControl?.model || DEFAULT_SELECTION;
        const { row: oldRow, column: oldColumn } = selectionControl?.model.currentCell || DEFAULT_CELL;

        if (oldStartColumn !== finalStartColumn || oldStartRow !== finalStartRow || oldEndColumn !== finalEndColumn || oldEndRow !== finalEndRow) {
            selectionControl && selectionControl.update(newSelectionRange);
            selectionControl && this._observerManager.getObserver('onChangeSelectionObserver')?.notifyObservers(selectionControl);
        }

        if (setModel) {
            if (!this._previousSelection) {
                this.setSelectionModel();
            } else {
                // If it is different from the range when clicked, you need to update the model
                const {
                    startRow: mouseDownStartRow,
                    endRow: mouseDownEndRow,
                    startColumn: mouseDownStartColumn,
                    endColumn: mouseDownEndColumn,
                } = (this._previousSelection.selection as IRangeData) || DEFAULT_SELECTION;
                const { row: mouseDownRow, column: mouseDownColumn } = (this._previousSelection.cell as IRangeCellData) || DEFAULT_CELL;
                if (
                    mouseDownStartColumn !== finalStartColumn ||
                    mouseDownStartRow !== finalStartRow ||
                    mouseDownEndColumn !== finalEndColumn ||
                    mouseDownEndRow !== finalEndRow ||
                    mouseDownRow !== oldRow ||
                    mouseDownColumn !== oldColumn
                ) {
                    this.setSelectionModel();
                }
            }

            this.updatePreviousSelection();
        }
    }

    /**
     * pointer up event
     * @param moveEvt
     * @param selectionControl
     * @returns
     */
    up(upEvt: IPointerEvent | IMouseEvent, selectionControl: Nullable<SelectionController>) {
        // update model

        this.moving(upEvt, selectionControl, true);
    }

    updatePreviousSelection() {
        const selectionControl: Nullable<SelectionController> = this.getCurrentControl();

        if (!selectionControl) return;

        // this.setSelectionModel();
        const { startRow, endRow, startColumn, endColumn } = selectionControl.model;
        const { row, column } = selectionControl.model.currentCell || DEFAULT_CELL;
        this._previousSelection = {
            selection: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
            cell: {
                row,
                column,
            },
        };
    }

    /**
     * Get all range data of the current selection
     * @returns
     */
    getActiveRangeListData(): Nullable<IRangeData[]> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            const selections = models?.map((model: SelectionModel) => ({
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            }));

            return selections;
        }
    }

    /**
     * Returns the list of active ranges in the active sheet or null if there are no active ranges.
     * If there is a single range selected, this behaves as a getActiveRange() call.
     *
     * @returns
     */
    getActiveRangeList(): Nullable<RangeList> {
        const rangeListData = this.getActiveRangeListData();
        return rangeListData && this._worksheet?.getRangeList(rangeListData);
    }

    /**
     * Get the range of the currently active cell
     * @returns
     */
    getActiveRangeData(): Nullable<IRangeData> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            for (const model of models) {
                if (model.currentCell) {
                    return {
                        startRow: model.startRow,
                        startColumn: model.startColumn,
                        endRow: model.endRow,
                        endColumn: model.endColumn,
                    };
                }
            }
        }
    }

    /**
     * Returns the selected range in the active sheet, or null if there is no active range. If multiple ranges are selected this method returns only the last selected range.
     * @returns
     */
    getActiveRange(): Nullable<Range> {
        const rangeData = this.getActiveRangeData();
        return rangeData && this._worksheet?.getRange(rangeData);
    }

    /**
     * get active selection control
     * @returns
     */
    getCurrentCellData(): Nullable<IRangeData> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            for (const model of models) {
                const currentCell = model.currentCell;
                if (currentCell) {
                    return {
                        startRow: currentCell.row,
                        startColumn: currentCell.column,
                        endRow: currentCell.row,
                        endColumn: currentCell.column,
                    };
                }
            }
        }
    }

    /**
     * get active selection control
     * @returns
     */
    getCurrentCell(): Nullable<Range> {
        const rangeData = this.getCurrentCellData();
        return rangeData && this._worksheet?.getRange(rangeData);
    }

    getDragLineControl() {
        return this._dragLineController;
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

        this._worksheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();

        this._initModels();

        const handler = {
            clearSelectionControls: () => this.clearSelectionControls(),
            addControlToCurrentByRangeData: (selectionRange: IRangeData, curCellRange: Nullable<IRangeCellData>, command: boolean = true) =>
                this.addControlToCurrentByRangeData(selectionRange, curCellRange, command),
        };

        this._columnTitleController.setHandlers(handler);
        this._rowTitleController.setHandlers(handler);
    }

    // eslint-disable-next-line max-lines-per-function
    private _mainEventInitial() {
        const main = this._mainComponent;
        // eslint-disable-next-line max-lines-per-function
        main.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            // NOTE: handle mousedown event to update selections
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

            let selectionControl: Nullable<SelectionController> = this.getCurrentControl();

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
                selectionControl = SelectionController.create(this._injector, curControls.length);
                selectionControl.update(startSelectionRange, cellInfo);
                curControls.push(selectionControl);
            }

            this.hasSelection = true;

            const scene = this.getScene();

            scene.disableEvent();

            const scrollTimer = ScrollTimer.create(this.getScene());
            scrollTimer.startScroll(evtOffsetX, evtOffsetY);

            // In edit mode, click other cells, you need to update the current model, otherwise when updating the cell value, the old active range will be redrawn
            const currentModel = selectionControl.getCurrentCellInfo();
            if (!this._previousSelection) {
                // this.setSelectionModel();
                const models = this._selectionControls.map((control) => control.model.getValue());
                this.setModels(models);
            } else {
                // If it is different from the range when clicked, you need to update the model
                const {
                    startRow: mouseDownStartRow,
                    endRow: mouseDownEndRow,
                    startColumn: mouseDownStartColumn,
                    endColumn: mouseDownEndColumn,
                } = (this._previousSelection.selection as IRangeData) || DEFAULT_SELECTION;
                const { row: mouseDownRow, column: mouseDownColumn } = (this._previousSelection.cell as IRangeCellData) || DEFAULT_CELL;
                if (
                    mouseDownStartColumn !== currentModel?.startColumn ||
                    mouseDownStartRow !== currentModel?.startRow ||
                    mouseDownEndColumn !== currentModel?.endColumn ||
                    mouseDownEndRow !== currentModel?.endRow ||
                    mouseDownRow !== currentModel?.startRow ||
                    mouseDownColumn !== currentModel?.startColumn
                ) {
                    // this.setSelectionModel();
                    const models = this._selectionControls.map((control) => control.model.getValue());
                    this.setModels(models);
                }
            }

            // Notification toolbar updates button state and value
            this._observerManager.getObserver('onChangeSelectionObserver')?.notifyObservers(selectionControl);

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                this.moving(moveEvt, selectionControl);
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this.moving(moveEvt, selectionControl);
                });
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                this.up(upEvt, selectionControl);
                scene.onPointerMoveObserver.remove(this._moveObserver);
                scene.onPointerUpObserver.remove(this._upObserver);
                scene.enableEvent();

                scrollTimer.stopScroll();
            });
        });
    }

    private _rowEventInitial() {
        const row = this._rowComponent;
        row.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            // this._rowTitleControl.highlightRowTitle(evt);
        });
    }

    private _columnEventInitial() {
        const column = this._columnComponent;
        column.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            // this._columnTitleControl.highlightColumnTitle(evt);
        });
    }

    private _leftTopEventInitial() {
        const leftTop = this._leftTopComponent;
        leftTop.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            // console.log('leftTop_moveObserver', evt);
        });
    }

    /**
     * Initialize selection model based on user configuration
     * @param selections
     */
    private _initModels() {
        const selections: ISelectionsConfig = this._config.selections;

        Object.keys(selections).forEach((worksheetId) => {
            const selectionsList = selections[worksheetId];
            const currentModels: SelectionModel[] = [];

            selectionsList.forEach((selectionConfig) => {
                const { startColumn, startRow, endColumn, endRow } = selectionConfig.selection;
                const cell = selectionConfig.cell;

                const model = this._injector.createInstance(SelectionModel, SELECTION_TYPE.NORMAL);

                const cellInfo = cell
                    ? {
                          row: cell.row,
                          column: cell.column,
                          isMerged: false,
                          isMergedMainCell: false,
                          startY: 0,
                          endY: 0,
                          startX: 0,
                          endX: 0,
                          mergeInfo: {
                              startColumn,
                              startRow,
                              endColumn,
                              endRow,
                              startY: 0,
                              endY: 0,
                              startX: 0,
                              endX: 0,
                          },
                      }
                    : null;

                // Only update data, not render
                model.setValue(
                    {
                        startColumn,
                        startRow,
                        endColumn,
                        endRow,
                        startY: 0,
                        endY: 0,
                        startX: 0,
                        endX: 0,
                    },
                    cellInfo
                );
                currentModels.push(model);
            });

            this._selectionModels.set(worksheetId, currentModels);
        });
    }

    /**
     * Initialize selection based on user configuration
     * @param selections
     */
    private _initControls() {
        const selections: ISelectionsConfig = this._config.selections;
        Object.keys(selections).forEach((worksheetId) => {
            const selectionsList = selections[worksheetId];
            const currentControls: SelectionController[] = [];

            selectionsList.forEach((selectionConfig) => {
                const selectionRange = selectionConfig.selection;
                const curCellRange = selectionConfig.cell;
                const main = this._mainComponent;

                const control = SelectionController.create(this._injector, currentControls.length);

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
                currentControls.push(control);
            });

            // this._selectionControls.set(worksheetId, currentControls);
        });
    }

    /**
     * Initialize the observer
     */
    private _initializeObserver() {
        // NOTE: on these circumstances should re-render selections controlls
        // kind of verbose to me though
        this._observerManager.requiredObserver('onAfterChangeActiveSheetObservable', 'core').add(() => {
            this.renderCurrentControls();
        });

        this._observerManager.requiredObserver('onSheetRenderDidMountObservable', 'core').add(() => {
            this.renderCurrentControls();
        });
    }

    private getWorksheetId(): string {
        return this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
    }
}