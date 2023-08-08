import { $$, getRefElement } from '@univerjs/base-ui';
import { SheetPlugin } from '@univerjs/base-sheets';
import { KeyCode, ObserverManager, PLUGIN_NAMES, SheetContext } from '@univerjs/core';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME, SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { FORMULA_PLUGIN_NAME, FunList } from '../Basics';
import { FormulaPlugin } from '../FormulaPlugin';
import { HelpFunction, SearchFunction } from '../View/UI/FormulaPrompt';
import { CellInputHandler } from './CellInputHandler';
import { Inject } from '@wendellhu/redi';

export class FormulaPromptController {
    cellInputHandler: CellInputHandler;

    richTextEle: HTMLElement;

    richTextEditEle: HTMLElement;

    private _searchFunction: SearchFunction;

    private _helpFunction: HelpFunction;

    constructor(@Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController,@Inject(ObserverManager) private readonly _observerManager: ObserverManager) {

        this._initRegisterComponent();
        this._initialize();
    }

    private _initRegisterComponent() {
        this._sheetContainerUIController
            .getMainSlotController()
            .addSlot(
                FORMULA_PLUGIN_NAME + SearchFunction.name,
                {
                    component: SearchFunction,
                },
                () => {
                    const searchFunction = this._sheetContainerUIController
                        .getMainSlotController()
                        .getSlot(FORMULA_PLUGIN_NAME + SearchFunction.name);
                    this._searchFunction = searchFunction;
                }
            );

            this._sheetContainerUIController
            .getMainSlotController()
            .addSlot(
                FORMULA_PLUGIN_NAME + HelpFunction.name,
                {
                    component: HelpFunction,
                },
                () => {
                    const helpFunction = this._sheetContainerUIController
                        .getMainSlotController()
                        .getSlot(FORMULA_PLUGIN_NAME + HelpFunction.name);
                    this._helpFunction = helpFunction;
                }
            );
    }

    private _initialize() {
        this._sheetContainerUIController.UIDidMount(() => {
            const richTextEle =  this._sheetContainerUIController.getCellEditorUIController()._richTextEle;

            this.richTextEle = richTextEle;
            this.richTextEditEle = $$('div', this.richTextEle);

            // Register cell input formula support
            this.cellInputHandler = new CellInputHandler(this.richTextEditEle);
        });

        this._observerManager.getObserver<KeyboardEvent>('onRichTextKeyDownObservable')?.add((event: KeyboardEvent) => {
            let ctrlKey = event.ctrlKey;
            let altKey = event.altKey;
            let shiftKey = event.shiftKey;
            let kcode = event.keyCode;
            if (
                !(
                    (kcode >= 112 && kcode <= 123) ||
                    kcode <= 46 ||
                    kcode === 144 ||
                    kcode === 108 ||
                    event.ctrlKey ||
                    event.altKey ||
                    (event.shiftKey && (kcode === 37 || kcode === 38 || kcode === 39 || kcode === 40 || kcode === KeyCode.WIN || kcode === KeyCode.WIN_R || kcode === KeyCode.MENU))
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
        this._observerManager.getObserver<KeyboardEvent>('onRichTextKeyUpObservable')?.add((event: KeyboardEvent) => {
            let kcode = event.keyCode;

            // stop edit
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
                    (event.shiftKey && (kcode === 37 || kcode === 38 || kcode === 39 || kcode === 40 || kcode === KeyCode.WIN || kcode === KeyCode.WIN_R || kcode === KeyCode.MENU))
                ) ||
                kcode === 8 ||
                kcode === 32 ||
                kcode === 46 ||
                (event.ctrlKey && kcode === 86)
            ) {
                this.cellInputHandler.searchFunction(this.richTextEditEle);
                const formula = this.cellInputHandler.getFormula();
                let helpFormula = this.cellInputHandler.getHelpFormula();

                let height = parseInt(this.richTextEle.style.minHeight);
                let width = parseInt(this.richTextEle.style.minWidth);
                let left = parseInt(this.richTextEle.style.left);
                let top = parseInt(this.richTextEle.style.top) + height;

                // Get the viewport width/height of the Main SheetContainer
                const sheetContainer = getRefElement( this._sheetContainerUIController.getContentRef());
                const screenW = sheetContainer.offsetWidth;
                const screenH = sheetContainer.offsetHeight;

                // Parse out a reasonable display position, and the list cannot be hidden
                const position = {
                    left,
                    top,
                };

                const getPosition = (component: SearchFunction | HelpFunction) => {
                    // Get the width/height of the list
                    const searchFunctionEle = getRefElement(component.getContentRef());
                    const rootW = searchFunctionEle.offsetWidth;
                    // const rootW = this._searchFunction?.base?.offsetWidth;
                    const rootH = searchFunctionEle.offsetHeight;

                    // right is true, indicating that the width from the lower left corner of the cell to the right border of the browser can hold the SearchFunction. Otherwise, the component is placed on the left.
                    // bottom is true, indicating that the height from the lower left corner of the cell to the lower border of the browser can place the SearchFunction. Otherwise, the component is put on top.
                    const right = screenW - left > rootW;
                    const bottom = screenH - top > rootH;

                    if (!right) {
                        left -= rootW - width;
                    }
                    if (!bottom) {
                        top -= rootH + height;
                    }

                    return {
                        left,
                        top,
                    };
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
            const value = this.cellInputHandler.getInputValue();
            if (value.length > 0 && value.substr(0, 1) === '=' && (kcode !== 229 || value.length === 1)) {
                if (kcode === 13) {
                    event.preventDefault();
                    event.stopPropagation();
                    const searchFunctionState = this._searchFunction.getState();
                    // Select the formula when the search formula box is open, and execute the formula when it is closed
                    if (searchFunctionState.searchActive) {
                        const func = searchFunctionState.formula[searchFunctionState.selectIndex] as any;
                        this.cellInputHandler.searchFunctionEnter(func.n);
                    }
                }
            }
        });
    }
}
