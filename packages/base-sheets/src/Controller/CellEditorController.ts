import { $$, getRefElement, handleDomToJson, handleJsonToDom, IMainProps, ISlotElement, handleStyleToString, handleStringToStyle } from '@univer/base-component';
import { Direction, IDocumentData, IRangeData, IStyleData, Nullable, ICellData, Tools, isKeyPrintable } from '@univer/core';
import { DeviceType, IKeyboardEvent, IMouseEvent, IPointerEvent } from '@univer/base-render';
import { RichText } from '@univer/style-universheet';
import { SpreadsheetPlugin } from '../SpreadsheetPlugin';
import { SheetContainer } from '../View/UI/SheetContainer';
import { CANVAS_VIEW_KEY } from '../View/Render/BaseView';

const CELL_EDIT_HIDDEN_TOP = -10000;

/**
 * Cell Editor
 *
 * TODO:
 *
 * 2. p存储的富文本字符数少于50的情况下，存一份到v，便于vlookup公式计算
 */
export class CellEditorController {
    private _plugin: SpreadsheetPlugin;

    private _sheetContainer: SheetContainer;

    richTextEle: HTMLElement;

    richTextEditEle: HTMLElement;

    richText: RichText;

    // Is it in editing state
    isEditMode: boolean;

    // current edit cell
    currentEditRangeData: IRangeData;

    constructor(plugin: SpreadsheetPlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    private _initialize() {
        this._plugin.getObserver('onSheetContainerDidMountObservable')?.add((sheetContainer: SheetContainer) => {
            this._sheetContainer = sheetContainer;
            const mainItem: IMainProps = {
                name: 'cellEditor',
                type: ISlotElement.JSX_STRING,
                content: 'RichText',
                show: false,
            };

            this._plugin.addMain(mainItem).then(() => {
                const cellEditor = this._sheetContainer.refMap.cellEditor;
                this.richTextEle = getRefElement(cellEditor);
                this.richTextEditEle = $$('div', this.richTextEle);
                this.richText = cellEditor.current as RichText;

                // focus
                this._plugin.showMainByName('cellEditor', true).then(() => {
                    this.richTextEditEle.focus();
                    this.richTextEditEle.tabIndex = 1;

                    this.hideEditContainer();
                });

                // init event
                this._handleKeyboardAction();

                // // set key down hooks
                // this.richText.hooks.set('onKeyDown', (event) => {
                //     let kCode = event.keyCode;
                //     if (kCode === KeyCode.ENTER) {
                //         this.exitEditMode();
                //     }
                // });
            });
        });

        this._plugin.context
            .getObserverManager()
            .getObserver('onAfterChangeUILocaleObservable', 'core')
            ?.add(() => {
                // this._sheetContainer.setToolBar(this._toolBarModel.toolList);
            });

        // If other plugins are loaded asynchronously, they may be initialized after the rendering layer is loaded, and they will not receive obs listeners.
        this._plugin.context
            .getObserverManager()
            .getObserver('onSheetRenderDidMountObservable', 'core')
            ?.add((e) => {
                const main = this._plugin.getMainComponent();

                main.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent) => {
                    this.enterEditMode();
                });
                main.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
                    this.exitEditMode();
                    evt.preventDefault();
                });
            });

        this._plugin.getObserver('onSpreadsheetKeyDownObservable')?.add((evt: IKeyboardEvent) => {
            if (!evt.ctrlKey && isKeyPrintable(evt.key)) {
                // character key
                this.handleEnter();
            } else {
                // control key
                switch (evt.key) {
                    case 'Enter':
                        if (this.isEditMode) {
                            this.exitEditMode();

                            // move to cell below
                            this._plugin.getSelectionManager().move(Direction.BOTTOM);
                        } else {
                            this.enterEditMode();
                        }
                        break;

                    case 'Space':
                        if (!this.isEditMode) {
                            this.enterEditMode();
                        }
                        break;

                    case 'ArrowUp':
                        if (!this.isEditMode) {
                            this._plugin.getSelectionManager().move(Direction.TOP);
                        }
                        break;

                    case 'ArrowDown':
                        if (!this.isEditMode) {
                            this._plugin.getSelectionManager().move(Direction.BOTTOM);
                        }
                        break;

                    case 'ArrowLeft':
                        if (!this.isEditMode) {
                            this._plugin.getSelectionManager().move(Direction.LEFT);
                        }
                        break;

                    case 'ArrowRight':
                        if (!this.isEditMode) {
                            this._plugin.getSelectionManager().move(Direction.RIGHT);
                        }
                        break;

                    case 'Tab':
                        if (!this.isEditMode) {
                            this._plugin.getSelectionManager().move(Direction.RIGHT);
                        }
                        evt.preventDefault();
                        break;

                    default:
                        break;
                }
            }

            // switch (evt.code) {
            //     case 'Enter':
            //         if (this.isEditMode) {
            //             this.exitEditMode();
            //         } else {
            //             this.enterEditMode();
            //         }
            //         break;

            //     case 'Tab':
            //         break;

            //     case ' ':
            //         break;

            //     case 'Shift':
            //         break;

            //     case 'Control':
            //         break;

            //     case 'Meta':
            //         break;

            //     case 'Alt':
            //         break;

            //     default:
            //         // this.enterEditMode();
            //         break;
            // }
        });

        this._plugin.getObserver('onSpreadsheetKeyCompositionStartObservable')?.add((evt: IKeyboardEvent) => {
            if (!this.isEditMode) {
                this.enterEditMode();
            }
        });
        this._plugin.getObserver('onSpreadsheetKeyCompositionUpdateObservable')?.add((evt: IKeyboardEvent) => {});
        this._plugin.getObserver('onSpreadsheetKeyCompositionEndObservable')?.add((evt: IKeyboardEvent) => {});
    }

    /**
     * init keyboard listener
     */
    private _handleKeyboardAction() {
        const keyboardDownEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 0;
            deviceEvent.currentState = 1;

            this._plugin.getObserver('onSpreadsheetKeyDownObservable')?.notifyObservers(deviceEvent);
        };

        const keyboardUpEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 1;
            deviceEvent.currentState = 0;

            this._plugin.getObserver('onSpreadsheetKeyUpObservable')?.notifyObservers(deviceEvent);
        };

        const keyboardCopyEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 1;
            deviceEvent.currentState = 0;

            this._plugin.getObserver('onSpreadsheetKeyCopyObservable')?.notifyObservers(deviceEvent);
        };

        const keyboardPasteEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 1;
            deviceEvent.currentState = 0;

            this._plugin.getObserver('onSpreadsheetKeyPasteObservable')?.notifyObservers(deviceEvent);
        };
        const keyboardCutEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 1;
            deviceEvent.currentState = 0;

            this._plugin.getObserver('onSpreadsheetKeyCutObservable')?.notifyObservers(deviceEvent);
        };
        const keyboardCompositionStartEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 1;
            deviceEvent.currentState = 0;

            this._plugin.getObserver('onSpreadsheetKeyCompositionStartObservable')?.notifyObservers(deviceEvent);
        };
        const keyboardCompositionUpdateEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 1;
            deviceEvent.currentState = 0;

            this._plugin.getObserver('onSpreadsheetKeyCompositionUpdateObservable')?.notifyObservers(deviceEvent);
        };
        const keyboardCompositionEndEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 1;
            deviceEvent.currentState = 0;

            this._plugin.getObserver('onSpreadsheetKeyCompositionEndObservable')?.notifyObservers(deviceEvent);
        };

        this.richTextEditEle.addEventListener('keydown', keyboardDownEvent);
        this.richTextEditEle.addEventListener('keyup', keyboardUpEvent);
        this.richTextEditEle.addEventListener('copy', keyboardCopyEvent);
        this.richTextEditEle.addEventListener('paste', keyboardPasteEvent);
        this.richTextEditEle.addEventListener('cut', keyboardCutEvent);
        this.richTextEditEle.addEventListener('compositionstart', keyboardCompositionStartEvent);
        this.richTextEditEle.addEventListener('compositionupdate', keyboardCompositionUpdateEvent);
        this.richTextEditEle.addEventListener('compositionend', keyboardCompositionEndEvent);
    }

    hideEditContainer() {
        // hidden
        this.richTextEle.style.top = `${CELL_EDIT_HIDDEN_TOP}px`;
    }

    /**
     * 1. When a printable character is entered, trigger editing
     * 2. When CompositionStart, trigger editing
     * @returns
     */
    enterEditMode() {
        this.focusEditEle();

        if (this.isEditMode) return;

        this.isEditMode = true;

        const currentCell = this._plugin.getSelectionManager().getCurrentModel();

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

        const scrollX = this._plugin.getMainScene()?.getViewport(CANVAS_VIEW_KEY.VIEW_TOP)?.actualScrollX || 0;
        const scrollY = this._plugin.getMainScene()?.getViewport(CANVAS_VIEW_KEY.VIEW_LEFT)?.actualScrollY || 0;

        this.richTextEle.style.left = `${startX - scrollX}px`;
        this.richTextEle.style.top = `${startY - scrollY}px`;

        this.richTextEle.style.minWidth = `${endX - startX}px`;
        this.richTextEle.style.minHeight = `${endY - startY}px`;

        const sheetContentRect = getRefElement(this._sheetContainer.contentRef).getBoundingClientRect();

        this.richTextEle.style.maxWidth = `${sheetContentRect.width - startX + scrollX}px`;
        this.richTextEle.style.maxHeight = `${sheetContentRect.height - startY + scrollY}px`;

        // this._plugin.showMainByName('cellEditor', true).then(() => {
        const cellValue = this.getSelectionValue();
        this.richText.setValue(cellValue);

        const style = this.getSelectionStyle();

        this.richTextEditEle.style.cssText = '';

        // set cell style
        if (style) {
            this.richTextEditEle.style.cssText = handleStyleToString(style, true);
        }

        // });
        this.setCurrentEditRangeData();
    }

    exitEditMode() {
        this.focusEditEle();

        if (!this.isEditMode) return;

        this.isEditMode = false;
        // this._plugin.showMainByName('cellEditor', false).then(() => {
        const value = handleDomToJson(this.richTextEditEle);
        const text = this.richTextEditEle.innerText;

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
        const style = handleStringToStyle(this.richTextEditEle);
        if (Tools.isPlainObject(style)) {
            cell.s = style;
        }
        this.setCurrentEditRangeValue(cell);
        this.hideEditContainer();
    }

    focusEditEle() {
        // If there is no settimeout, the first letter will be intercepted in Chinese state
        setTimeout(() => {
            this.richTextEditEle.focus();
        }, 1);
    }

    setCurrentEditRangeData() {
        const model = this._plugin.getSelectionManager().getCurrentModel();
        if (!model) return;

        this.currentEditRangeData = {
            startRow: model.row,
            startColumn: model.column,
            endRow: model.row,
            endColumn: model.column,
        };
    }

    getCurrentEditRangeData() {
        return this.currentEditRangeData;
    }

    setCurrentEditRangeValue(cell: ICellData) {
        // only one selection
        const { startRow, startColumn, endRow, endColumn } = this.currentEditRangeData;
        const range = this._plugin.getContext().getWorkBook().getActiveSheet().getRange(startRow, startColumn, endRow, endColumn);

        range.setRangeData(cell);

        // this._plugin.getMainComponent().makeDirty(true);
    }

    getSelectionValue(): string {
        const range = this._plugin.getSelectionManager().getActiveRange();
        if (!range) return '';

        const value = range && range.getDisplayValue();
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'object' && value !== null) {
            return handleJsonToDom(value);
        }
        return '';
    }

    getSelectionStyle(): Nullable<IStyleData> {
        return this._plugin.getSelectionManager().getActiveRange()?.getTextStyle();
    }

    setSelectionValue(value: IDocumentData | string) {
        const range = this._plugin.getSelectionManager().getActiveRange();
        if (!range) return;

        if (typeof value === 'string') {
            range.setValue(value);
        }
        if (typeof value === 'object') {
            range.setRangeData({ p: value });
        }

        // this._plugin.getMainComponent().makeDirty(true);
    }

    handleEnter() {
        this.enterEditMode();
    }

    handleBackSpace() {}

    handleDirection(direction: Direction) {
        // todo
    }
}
