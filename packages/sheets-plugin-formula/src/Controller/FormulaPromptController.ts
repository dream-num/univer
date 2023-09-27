import { ComponentManager, SlotManager } from '@univerjs/base-ui';
import { ObserverManager } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { FORMULA_PLUGIN_NAME, FunList } from '../Basics';
import { HelpFunction, SearchFunction } from '../View/UI/FormulaPrompt';
import { CellInputHandler } from './CellInputHandler';
import { KeyCode } from './keyCode';

export class FormulaPromptController {
    // FIXME: strict initialization
    cellInputHandler!: CellInputHandler;

    // FIXME: strict initialization
    richTextEle!: HTMLElement;

    // FIXME: strict initialization
    richTextEditEle!: HTMLElement;

    // FIXME: strict initialization
    private _searchFunction!: SearchFunction;

    // FIXME: strict initialization
    private _helpFunction!: HelpFunction;

    constructor(
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(SlotManager) private readonly _slotManager: SlotManager
    ) {
        this._initialize();
    }

    getSearchComponent(ref: SearchFunction) {
        this._searchFunction = ref;
    }

    getHelpComponent(ref: HelpFunction) {
        this._helpFunction = ref;
    }

    private _initialize() {
        this._initRegisterComponent();
        this._mount();
        this._onRichTextKeyDownObservable();
        this._onRichTextKeyUpObservable();
    }

    private _initRegisterComponent() {
        this._componentManager.register(SearchFunction.name, SearchFunction);
        this._slotManager.setSlotComponent('main', {
            name: FORMULA_PLUGIN_NAME + SearchFunction.name,
            component: {
                name: SearchFunction.name,
                props: {
                    getComponent: this.getSearchComponent.bind(this),
                },
            },
        });
        this._componentManager.register(HelpFunction.name, HelpFunction);
        this._slotManager.setSlotComponent('main', {
            name: FORMULA_PLUGIN_NAME + HelpFunction.name,
            component: {
                name: HelpFunction.name,
                props: {
                    getComponent: this.getHelpComponent.bind(this),
                },
            },
        });
    }

    private _mount() {
        // const richTextEle = this._sheetContainerUIController.getCellEditorUIController()._richTextEle;
        // this.richTextEle = richTextEle;
        // this.richTextEditEle = $$('div', this.richTextEle);
        // Register cell input formula support
        // this.cellInputHandler = new CellInputHandler(this.richTextEditEle);
    }

    private _onRichTextKeyDownObservable() {
        this._observerManager.getObserver<KeyboardEvent>('onRichTextKeyDownObservable')?.add((event: KeyboardEvent) => {
            const ctrlKey = event.ctrlKey;
            const altKey = event.altKey;
            const shiftKey = event.shiftKey;
            const kcode = event.keyCode;
            if (
                !(
                    (kcode >= 112 && kcode <= 123) ||
                    kcode <= 46 ||
                    kcode === 144 ||
                    kcode === 108 ||
                    event.ctrlKey ||
                    event.altKey ||
                    (event.shiftKey &&
                        (kcode === 37 ||
                            kcode === 38 ||
                            kcode === 39 ||
                            kcode === 40 ||
                            kcode === KeyCode.WIN ||
                            kcode === KeyCode.WIN_R ||
                            kcode === KeyCode.MENU))
                ) ||
                kcode === 8 ||
                kcode === 32 ||
                kcode === 46 ||
                (event.ctrlKey && kcode === 86)
            ) {
                // handle input
                this.cellInputHandler.functionInputHandler(this.richTextEditEle, kcode);
            }
        });
    }

    private _onRichTextKeyUpObservable() {
        this._observerManager.getObserver<KeyboardEvent>('onRichTextKeyUpObservable')?.add((event: KeyboardEvent) => {
            const kcode = event.keyCode;
            if (kcode === KeyCode.ENTER) {
                this._searchFunction.updateState(false);
                this._helpFunction.updateState(false);
            } else if (
                !(
                    (kcode >= 112 && kcode <= 123) ||
                    kcode <= 46 ||
                    kcode === 144 ||
                    kcode === 108 ||
                    event.ctrlKey ||
                    event.altKey ||
                    (event.shiftKey &&
                        (kcode === 37 ||
                            kcode === 38 ||
                            kcode === 39 ||
                            kcode === 40 ||
                            kcode === KeyCode.WIN ||
                            kcode === KeyCode.WIN_R ||
                            kcode === KeyCode.MENU))
                ) ||
                kcode === 8 ||
                kcode === 32 ||
                kcode === 46 ||
                (event.ctrlKey && kcode === 86)
            ) {
                this._update();
            }
            const value = this.cellInputHandler.getInputValue();
            if (value.length > 0 && value.substr(0, 1) === '=' && (kcode !== 229 || value.length === 1)) {
                if (kcode === 13) {
                    event.preventDefault();
                    event.stopPropagation();
                    const searchFunctionState = this._searchFunction.getState();
                    if (searchFunctionState.searchActive) {
                        const func = searchFunctionState.formula[searchFunctionState.selectIndex] as any;
                        this.cellInputHandler.searchFunctionEnter(func.n);
                    }
                }
            }
        });
    }

    private _update() {
        this.cellInputHandler.searchFunction(this.richTextEditEle);
        const formula = this.cellInputHandler.getFormula();
        const helpFormula = this.cellInputHandler.getHelpFormula();
        const height = parseInt(this.richTextEle.style.minHeight);
        const width = parseInt(this.richTextEle.style.minWidth);
        let left = parseInt(this.richTextEle.style.left);
        let top = parseInt(this.richTextEle.style.top) + height;
        // const sheetContainer = this._sheetContainerUIController.getContentRef().current;
        const sheetContainer: any = null; // FIXME get container position?

        if (!sheetContainer) return;

        const screenW = sheetContainer.offsetWidth;
        const screenH = sheetContainer.offsetHeight;
        const position = { left, top };
        const getPosition = (component: SearchFunction | HelpFunction) => {
            const searchFunctionEle = component.getContentRef().current;

            if (!searchFunctionEle) return { left, top };

            const rootW = searchFunctionEle.offsetWidth;
            const rootH = searchFunctionEle.offsetHeight;
            const right = screenW - left > rootW;
            const bottom = screenH - top > rootH;
            if (!right) {
                left -= rootW - width;
            }
            if (!bottom) {
                top -= rootH + height;
            }
            return { left, top };
        };

        if (formula[0]) {
            this._searchFunction.updateState(true, formula, 0, position, () => {
                const position = getPosition(this._searchFunction);
                this._searchFunction.updateState(true, formula, 0, position);
            });
            this._helpFunction.updateState(false);
        } else if (helpFormula[0]) {
            const functionName = (helpFormula[0] as string).toUpperCase();
            const functionInfo = FunList.find((item: any) => item.n === functionName) || {};
            this._helpFunction.updateState(true, helpFormula[1] as number, functionInfo, position, () => {
                const position = getPosition(this._helpFunction);
                this._helpFunction.updateState(true, helpFormula[1] as number, functionInfo, position);
            });
            this._searchFunction.updateState(false);
        } else {
            this._searchFunction.updateState(false, formula);
            this._helpFunction.updateState(false);
        }
    }
}
