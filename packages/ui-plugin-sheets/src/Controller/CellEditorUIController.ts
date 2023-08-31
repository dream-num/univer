import { Inject, SkipSelf } from '@wendellhu/redi';

import { RefObject } from 'preact';
import { IPointerEvent, IMouseEvent, IRenderingEngine, Engine } from '@univerjs/base-render';
import { CANVAS_VIEW_KEY, CanvasView, CellEditorController, ISelectionManager, SelectionManager } from '@univerjs/base-sheets';
import { getRefElement, CellEditExtensionManager, $$, setLastCaretPosition, handleStringToStyle, handleDomToJson, isCtrlPressed, KeyboardManager } from '@univerjs/base-ui';
import { Direction, handleStyleToString, ICellData, isKeyPrintable, ObserverManager, Tools, UIObserver } from '@univerjs/core';

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
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @IRenderingEngine private readonly _renderingEngine: Engine,
        @Inject(CanvasView) private readonly _sheetCanvasView: CanvasView,
        @Inject(ObserverManager) private readonly _selfObserverManager: ObserverManager,
        @Inject(CellEditorController) private readonly _cellEditorContorller: CellEditorController,
        @ISelectionManager private readonly _selectionManager: SelectionManager,
        @Inject(KeyboardManager) private readonly _keyboardManager: KeyboardManager
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
        this._cellEditorContorller.setEditMode(this.isEditMode);

        const currentCell = this._selectionManager.getCurrentCellModel();

        if (!currentCell) {
            return false;
        }

        let startX;
        let endX;
        let startY;
        let endY;

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
        const sheetContentRect = getRefElement(univerContainerContentRef).getBoundingClientRect();

        this._richTextEle.style.maxWidth = `${sheetContentRect.width - startX + scrollX}px`;
        this._richTextEle.style.maxHeight = `${sheetContentRect.height - startY + scrollY}px`;

        this._richTextEle.style.transform = '';

        // this._plugin.showMainByName('cellEditor', true).then(() => {
        let cellValue = this._cellEditorContorller.getSelectionValue();

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

        const style = this._cellEditorContorller.getSelectionStyle();

        this._richTextEditEle.style.cssText = '';

        // set cell style
        if (style) {
            this._richTextEditEle.style.cssText = handleStyleToString(style, true);
        }

        // });
        this._cellEditorContorller.setCurrentEditRangeData();
    }

    exitEditMode() {
        this.focusEditEle();

        if (!this.isEditMode) return;

        this.isEditMode = false;
        this._cellEditorContorller.setEditMode(this.isEditMode);
        // this._plugin.showMainByName('cellEditor', false).then(() => {
        const value = handleDomToJson(this._richTextEditEle);
        const text = this._richTextEditEle.innerText;

        let cell: ICellData = {};

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
        this._cellEditorContorller.setCurrentEditRangeValue(cell);
        this.hideEditContainer();
    }

    focusEditEle() {
        // If there is no settimeout, the first letter will be intercepted in Chinese state
        setTimeout(() => {
            this._richTextEditEle.focus();
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

        const main = this._sheetCanvasView.getSheetView().getSpreadsheet();

        main.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent) => {
            // Prevent left + right double click
            if (evt.button !== 2) {
                this.enterEditMode();
            }
        });
        main.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this.exitEditMode();
            evt.preventDefault();
        });

        this._cellEditExtensionManager = new CellEditExtensionManager();

        this.listenEventManager();
    }

    private setRichText() {
        this._richTextEle = getRefElement(this._richText.container);
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

    private _handleKeyboardObserver() {
        const onKeyDownObservable = this._globalObserverManager.getObserver<KeyboardEvent>('onKeyDownObservable', 'core');
        const onKeyCompositionStartObservable = this._globalObserverManager.getObserver<CompositionEvent>('onKeyCompositionStartObservable', 'core');

        const selectionManager = this._selectionManager;
        if (onKeyDownObservable && !onKeyDownObservable.hasObservers()) {
            onKeyDownObservable.add((evt: KeyboardEvent) => {
                if (!isCtrlPressed(evt) && isKeyPrintable(evt.key)) {
                    // character key
                    this.enterEditMode(true);
                } else {
                    // control key
                    switch (evt.key) {
                        case 'Enter':
                            if (this.isEditMode) {
                                this.exitEditMode();

                                const currentCell = selectionManager.getCurrentCellModel();
                                if (!currentCell?.isMerged) {
                                    // move to cell below
                                    selectionManager.move(Direction.DOWN);
                                }
                            } else {
                                this.enterEditMode();
                            }
                            break;

                        case 'Space':
                            if (!this.isEditMode) {
                                this.enterEditMode(true);
                            }
                            break;

                        case 'ArrowUp':
                            if (!this.isEditMode) {
                                selectionManager.move(Direction.UP);
                            }
                            break;

                        case 'ArrowDown':
                            if (!this.isEditMode) {
                                selectionManager.move(Direction.DOWN);
                            }
                            break;

                        case 'ArrowLeft':
                            if (!this.isEditMode) {
                                selectionManager.move(Direction.LEFT);
                            }
                            break;

                        case 'ArrowRight':
                            if (!this.isEditMode) {
                                selectionManager.move(Direction.RIGHT);
                            }
                            break;

                        case 'Tab':
                            if (!this.isEditMode) {
                                selectionManager.move(Direction.RIGHT);
                            }
                            evt.preventDefault();
                            break;

                        default:
                            break;
                    }
                }
            });
        }

        if (onKeyCompositionStartObservable && !onKeyCompositionStartObservable.hasObservers()) {
            onKeyCompositionStartObservable.add((evt: CompositionEvent) => {
                if (!this.isEditMode) {
                    this.enterEditMode(true);
                }
            });
        }
    }
}
