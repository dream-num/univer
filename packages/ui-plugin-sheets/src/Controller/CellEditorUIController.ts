import { getRefElement, CellEditExtensionManager, KeyboardManager, $$, setLastCaretPosition, handleStringToStyle } from '@univerjs/base-ui';
import { isKeyPrintable, Tools } from '@univerjs/core';
import { SheetUIPlugin } from '../SheetUIPlugin';
import { RichText } from '../View/RichText';

export class CellEditorUIController {
    private _plugin: SheetUIPlugin;

    private _cellEditExtensionManager: CellEditExtensionManager;

    private _keyboardManager: KeyboardManager;

    richTextEle: HTMLElement;

    richTextEditEle: HTMLElement;

    richText: RichText;

    constructor(plugin: SheetUIPlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    private _initialize() {
        // this._initRegisterComponent();
        // If other plugins are loaded asynchronously, they may be initialized after the rendering layer is loaded, and they will not receive obs listeners.

        // this._plugin.context
        //     .getObserverManager()
        //     .getObserver('onSheetRenderDidMountObservable', 'core')
        //     ?.add((e) => {
        //         const main = this._plugin.getMainComponent();

        //         main.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent) => {
        //             // Prevent left + right double click
        //             if (evt.button !== 2) {
        //                 this.enterEditMode();
        //             }
        //         });
        //         main.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
        //             this.exitEditMode();
        //             evt.preventDefault();
        //         });
        //     });

        this._cellEditExtensionManager = new CellEditExtensionManager();

        this._keyboardManager = new KeyboardManager(this._plugin);

        console.log('cell edit--');

        // this.richTextEditEle
    }

    private _initRichText() {
        this.richTextEle = getRefElement(this.richText.container);
        this.richTextEditEle = $$('div', this.richTextEle);

        // // focus
        this.richTextEditEle.focus();

        // this.focusEditEle();
        this.hideEditContainer();

        // init event
        // this._handleKeyboardAction();
        this._keyboardManager.handleKeyboardAction(this.richTextEditEle);
        this._handleKeyboardObserver();

        // Get the display status of the formula prompt box
        this.richText.hooks.set('onKeyDown', (event: KeyboardEvent) => {
            this._plugin.getObserver('onRichTextKeyDownObservable')?.notifyObservers(event);
        });
        // Get the display status of the formula prompt box
        this.richText.hooks.set('onKeyUp', (event: KeyboardEvent) => {
            this._plugin.getObserver('onRichTextKeyUpObservable')?.notifyObservers(event);
        });
    }
    // /**
    //  * Register custom components
    //  */
    // private _initRegisterComponent() {
    //     // this._plugin.registerComponent(PLUGIN_NAMES.SPREADSHEET + RichText.name, RichText, { activeKey: 'cellEdit' });
    //     this._plugin.registerModal(`${PLUGIN_NAMES.SPREADSHEET + RichText.name}formula`, RichText);
    //     this._plugin.registerModal(`${PLUGIN_NAMES.SPREADSHEET + RichText.name}cell`, RichText);
    // }

    private _handleKeyboardObserver() {
        const onKeyDownObservable = this._plugin.getContext().getObserverManager().getObserver<KeyboardEvent>('onKeyDownObservable', 'core');
        const onKeyCompositionStartObservable = this._plugin.getContext().getObserverManager().getObserver<CompositionEvent>('onKeyCompositionStartObservable', 'core');

        if (onKeyDownObservable && !onKeyDownObservable.hasObservers()) {
            onKeyDownObservable.add((evt: KeyboardEvent) => {
                if (!evt.ctrlKey && isKeyPrintable(evt.key)) {
                    // character key
                    this.enterEditMode(true);
                } else {
                    // control key
                    switch (evt.key) {
                        case 'Enter':
                            if (this.isEditMode) {
                                this.exitEditMode();

                                const currentCell = this._plugin.getSelectionManager().getCurrentCellModel();
                                if (!currentCell?.isMerged) {
                                    // move to cell below
                                    this._plugin.getSelectionManager().move(Direction.BOTTOM);
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

    hideEditContainer() {
        // It cannot be set to 0px, otherwise the paste event cannot be listened
        this.richTextEle.style.maxHeight = '1px';
        this.richTextEle.style.maxWidth = '1px';

        this.richTextEle.style.minWidth = `1px`;
        this.richTextEle.style.minHeight = `1px`;

        this.richTextEle.style.borderWidth = '0px';
        this.richTextEle.style.transform = 'scale(0)';
    }

    /**
     * 1. When a printable character is entered, trigger editing
     * 2. When CompositionStart, trigger editing
     * @param clear Whether to clear the cell
     * @returns
     */
    enterEditMode(clear: boolean = false) {
        this.focusEditEle();
        // setTimeout(() => {
        //     this.richTextEditEle.focus();

        // }, 1);

        if (this.isEditMode) return;

        // set focus to last position
        setTimeout(() => {
            setLastCaretPosition(this.richTextEditEle);
        }, 1);

        this.isEditMode = true;

        const currentCell = this._plugin.getSelectionManager().getCurrentCellModel();

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

        this.richTextEle.style.borderWidth = '2px';
        const univerContainerContentRef = this._plugin.getSheetContainerUIController().getContentRef();
        const sheetContentRect = getRefElement(univerContainerContentRef).getBoundingClientRect();

        this.richTextEle.style.maxWidth = `${sheetContentRect.width - startX + scrollX}px`;
        this.richTextEle.style.maxHeight = `${sheetContentRect.height - startY + scrollY}px`;

        this.richTextEle.style.transform = '';

        // this._plugin.showMainByName('cellEditor', true).then(() => {
        let cellValue = this.getSelectionValue();

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
        }, 100);
    }

    // 获取Toolbar组件
    getComponent = (ref: RichText) => {
        this.richText = ref;
        this._initRichText();
    };
}
