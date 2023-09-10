import { Engine, IRenderingEngine, ISelectionRangeWithStyle, ISelectionTransformerShapeManager, mergeCellHandler } from '@univerjs/base-render';
import { CANVAS_VIEW_KEY, CanvasView, CellEditorController, SelectionManagerService } from '@univerjs/base-sheets';
import {
    $$,
    CellEditExtensionManager,
    FOCUSING_SHEET,
    handleDomToJson,
    handleStringToStyle,
    IContextService,
    isCtrlPressed,
    KeyboardManager,
    setLastCaretPosition,
} from '@univerjs/base-ui';
import {
    Direction,
    handleStyleToString,
    ICellData,
    ICurrentUniverService,
    IRangeData,
    isKeyPrintable,
    makeCellRangeToRangeData,
    Nullable,
    ObserverManager,
    Tools,
    UIObserver,
} from '@univerjs/core';
import { Inject, SkipSelf } from '@wendellhu/redi';
import { RefObject } from 'react';

import { RichText } from '../View/RichText';

export class CellEditorUIController {
    // Is it in editing state
    isEditMode: boolean;

    _richTextEle: HTMLElement;

    _richTextEditEle: HTMLElement;

    _richText: RichText;

    private _cellEditExtensionManager: CellEditExtensionManager;

    constructor(
        private readonly _currentRefFetcher: () => RefObject<HTMLDivElement>,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @IRenderingEngine private readonly _renderingEngine: Engine,
        @Inject(CanvasView) private readonly _sheetCanvasView: CanvasView,
        @Inject(ObserverManager) private readonly _selfObserverManager: ObserverManager,
        @Inject(CellEditorController) private readonly _cellEditorController: CellEditorController,
        // @ISelectionManager private readonly _selectionManager: SelectionManager,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionTransformerShapeManager private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,
        @Inject(KeyboardManager) private readonly _keyboardManager: KeyboardManager,
        @IContextService private readonly _contextService: IContextService
    ) {
        this._initialize();
    }

    listenEventManager() {
        this._globalObserverManager.requiredObserver<UIObserver<string>>('onUIChangeObservable', 'core').add((msg) => {
            const value = msg.value;
            switch (msg.name) {
                case 'fontWeight':
                    // this.setUndo();
                    console.info('fontWeightfontWeight====', msg);
                    this._richText.cellTextStyle.updateFormat('bl', value ? '1' : '0');
                    break;
                case 'redo':
                    // this.setRedo();
                    break;
            }
        });
    }

    // Get the RichText component
    getComponent = (ref: RichText) => {
        this._richText = ref;
        this.setRichText();
    };

    getCellEditor() {
        return this._richText;
    }

    hideEditContainer() {
        // It cannot be set to 0px, otherwise the paste event cannot be listened
        this._richTextEle.style.maxHeight = '1px';
        this._richTextEle.style.maxWidth = '1px';

        this._richTextEle.style.minWidth = `1px`;
        this._richTextEle.style.minHeight = `1px`;

        this._richTextEle.style.borderWidth = '0px';
        this._richTextEle.style.transform = 'scale(0)';
    }

    /**
     * 1. When a printable character is entered, trigger editing
     * 2. When CompositionStart, trigger editing
     * @param clear Whether to clear the cell
     * @returns
     */
    // eslint-disable-next-line max-lines-per-function
    enterEditMode(clear: boolean = false) {
        this.focusEditEle();
        // setTimeout(() => {
        //     this._richTextEditEle.focus();

        // }, 1);

        if (this.isEditMode) return;

        // set focus to last position
        setTimeout(() => {
            setLastCaretPosition(this._richTextEditEle);
        }, 1);

        this.isEditMode = true;
        this._cellEditorController.setEditMode(this.isEditMode);

        const cellRange = this._selectionManagerService.getLast()?.cellRange;

        const currentCell = this._selectionTransformerShapeManager.convertCellRangeToInfo(cellRange);

        if (!currentCell) {
            return false;
        }

        //#region cell editor position

        let startX: number;
        let endX: number;
        let startY: number;
        let endY: number;

        if (currentCell.isMerged) {
            const mergeInfo = currentCell.mergeInfo;
            startX = mergeInfo.startX;
            endX = mergeInfo.endX;
            startY = mergeInfo.startY;
            endY = mergeInfo.endY;
        } else {
            startX = currentCell.startX;
            endX = currentCell.endX;
            startY = currentCell.startY;
            endY = currentCell.endY;
        }

        const mainScene = this._renderingEngine.getScene(CANVAS_VIEW_KEY.MAIN_SCENE);
        const scrollX = mainScene?.getViewport(CANVAS_VIEW_KEY.VIEW_TOP)?.actualScrollX || 0;
        const scrollY = mainScene?.getViewport(CANVAS_VIEW_KEY.VIEW_LEFT)?.actualScrollY || 0;

        this._richTextEle.style.left = `${startX - scrollX}px`;
        this._richTextEle.style.top = `${startY - scrollY}px`;

        this._richTextEle.style.minWidth = `${endX - startX}px`;
        this._richTextEle.style.minHeight = `${endY - startY}px`;

        this._richTextEle.style.borderWidth = '2px';
        const univerContainerContentRef = this._currentRefFetcher();
        const sheetContentRect = univerContainerContentRef.current?.getBoundingClientRect();

        if (!sheetContentRect) return;

        this._richTextEle.style.maxWidth = `${sheetContentRect.width - startX + scrollX}px`;
        this._richTextEle.style.maxHeight = `${sheetContentRect.height - startY + scrollY}px`;

        this._richTextEle.style.transform = '';

        // #endregion

        // #region get editing cell for values

        // this._plugin.showMainByName('cellEditor', true).then(() => {
        let cellValue = this._cellEditorController.getSelectionValue();

        // Intercept, the formula needs to modify the value of the edit state
        const cell = this._cellEditExtensionManager.handle({
            row: currentCell.row,
            column: currentCell.column,
            value: cellValue,
        });

        if (cell) {
            cellValue = cell.value;
        }

        if (clear) {
            cellValue = '';
        }
        this._richText.setValue(cellValue);

        const style = this._cellEditorController.getSelectionStyle();

        this._richTextEditEle.style.cssText = '';

        // set cell style
        if (style) {
            this._richTextEditEle.style.cssText = handleStyleToString(style, true);
        }

        // });
        this._cellEditorController.setCurrentEditRangeData();

        this._contextService.setContextValue(FOCUSING_SHEET, false);
    }

    exitEditMode() {
        this.focusEditEle();

        if (!this.isEditMode) return;

        this.isEditMode = false;
        this._cellEditorController.setEditMode(this.isEditMode);
        // this._plugin.showMainByName('cellEditor', false).then(() => {
        const value = handleDomToJson(this._richTextEditEle);
        const text = this._richTextEditEle.innerText;

        const cell: ICellData = {};

        // get value
        if (typeof value === 'string') {
            cell.v = value;
            cell.m = value;
        }
        // get rich text
        else if (typeof value === 'object') {
            cell.p = value;
            cell.v = text;
            cell.m = text;
        }

        // get style
        const style = handleStringToStyle(this._richTextEditEle);
        if (Tools.isPlainObject(style)) {
            cell.s = style;
        }
        this._cellEditorController.setCurrentEditRangeValue(cell);
        this.hideEditContainer();

        // NOTE: this is a temporary solution. In the future we would make cell editor a focused UniverDoc instance.
        this._contextService.setContextValue(FOCUSING_SHEET, true);
    }

    focusEditEle() {
        // If there is no settimeout, the first letter will be intercepted in Chinese state
        setTimeout(() => {
            // this._richTextEditEle.focus();
        }, 100);
    }

    getRichTextEle() {
        return this._richTextEle;
    }

    getRichTextEditEle() {
        return this._richTextEditEle;
    }

    private _initialize() {
        // this._initRegisterComponent();
        // If other plugins are loaded asynchronously, they may be initialized after the rendering layer is loaded, and they will not receive obs listeners.

        // const main = this._sheetCanvasView.getSheetView().getSpreadsheet();

        // main.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent) => {
        //     // Prevent left + right double click
        //     if (evt.button !== 2) {
        //         this.enterEditMode();
        //     }
        // });
        // main.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
        //     this.exitEditMode();
        //     evt.preventDefault();
        // });

        this._cellEditExtensionManager = new CellEditExtensionManager();

        this.listenEventManager();
    }

    // TODO: init rich text editor?
    private setRichText() {
        const richText = this._richText.container.current;
        if (!richText) return;
        this._richTextEle = richText;
        this._richTextEditEle = $$('div', this._richTextEle);

        // // focus
        this._richTextEditEle.focus();

        // this.focusEditEle();
        this.hideEditContainer();

        // init event
        this._keyboardManager.handleKeyboardAction(this._richTextEditEle);
        this._handleKeyboardObserver();

        // Get the display status of the formula prompt box
        this._richText.hooks.set('onKeyDown', (event: KeyboardEvent) => {
            this._selfObserverManager.getObserver<Event>('onRichTextKeyDownObservable')?.notifyObservers(event);
        });
        // Get the display status of the formula prompt box
        this._richText.hooks.set('onKeyUp', (event: KeyboardEvent) => {
            this._selfObserverManager.getObserver<Event>('onRichTextKeyUpObservable')?.notifyObservers(event);
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _handleKeyboardObserver() {
        const onKeyDownObservable = this._globalObserverManager.getObserver<KeyboardEvent>('onKeyDownObservable', 'core');
        const onKeyCompositionStartObservable = this._globalObserverManager.getObserver<CompositionEvent>('onKeyCompositionStartObservable', 'core');

        const selectionManager = this._selectionManagerService;
        if (onKeyDownObservable && !onKeyDownObservable.hasObservers()) {
            onKeyDownObservable.add((evt: KeyboardEvent) => {
                if (!isCtrlPressed(evt) && isKeyPrintable(evt.key)) {
                    // character key
                    // Start keyboard manager when input event stroked
                    this.enterEditMode(true);
                } else {
                    // control key
                    switch (evt.key) {
                        case 'Enter':
                            if (this.isEditMode) {
                                this.exitEditMode();

                                this._move(Direction.DOWN);
                            } else {
                                this.enterEditMode();
                            }
                            break;

                        case 'Space':
                            if (!this.isEditMode) {
                                this.enterEditMode(true);
                            }
                            break;
                        default:
                            break;
                    }
                }
            });
        }

        // Enter edit mode when CompositionStartEvent triggers
        if (onKeyCompositionStartObservable && !onKeyCompositionStartObservable.hasObservers()) {
            onKeyCompositionStartObservable.add((evt: CompositionEvent) => {
                if (!this.isEditMode) {
                    this.enterEditMode(true);
                }
            });
        }
    }

    private _move(direction: Direction) {
        const worksheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
        const rowCount = worksheet.getRowCount();
        const columnCount = worksheet.getColumnCount();
        const mergeData = worksheet.getMergeData();
        const selectionData = this._selectionManagerService.getLast();

        const moveSelectionData = this._getMoveCellInfo(direction, rowCount, columnCount, mergeData, selectionData);

        if (moveSelectionData != null) {
            // move to cell below
            this._selectionManagerService.replace([moveSelectionData]);
        }
    }

    /**
     * Move the selection according to different directions, usually used for the shortcut key operation of ↑ ↓ ← →
     * @param direction
     * @returns
     */
    // eslint-disable-next-line max-lines-per-function
    private _getMoveCellInfo(
        direction: Direction,
        rowCount: number,
        columnCount: number,
        mergeData: IRangeData[],
        selectionData: Nullable<ISelectionRangeWithStyle>
    ): Nullable<ISelectionRangeWithStyle> {
        const cellRange = selectionData?.cellRange;

        const style = selectionData?.style;

        if (!cellRange) return;

        let { startRow: mergeStartRow, startColumn: mergeStartColumn, endRow: mergeEndRow, endColumn: mergeEndColumn } = cellRange;

        let { row, column } = cellRange;
        // const rowCount = this._skeleton?.getRowCount() || DEFAULT_WORKSHEET_ROW_COUNT;
        // const columnCount = this._skeleton?.getColumnCount() || DEFAULT_WORKSHEET_COLUMN_COUNT;
        switch (direction) {
            case Direction.UP:
                if (cellRange.isMerged || cellRange.isMergedMainCell) {
                    row = --mergeStartRow;
                } else {
                    row--;
                }
                if (row < 0) {
                    row = 0;
                }
                break;
            case Direction.DOWN:
                if (cellRange.isMerged || cellRange.isMergedMainCell) {
                    row = ++mergeEndRow;
                } else {
                    row++;
                }

                if (row > rowCount) {
                    row = rowCount;
                }
                break;
            case Direction.LEFT:
                if (cellRange.isMerged || cellRange.isMergedMainCell) {
                    column = --mergeStartColumn;
                } else {
                    column--;
                }

                if (column < 0) {
                    column = 0;
                }
                break;
            case Direction.RIGHT:
                if (cellRange.isMerged || cellRange.isMergedMainCell) {
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

        const newCellRange = mergeCellHandler(row, column, mergeData);

        const newSelectionData = makeCellRangeToRangeData(newCellRange);

        if (!newSelectionData) {
            return;
        }

        return {
            rangeData: newSelectionData,
            cellRange: newCellRange,
            style,
        };
    }
}
