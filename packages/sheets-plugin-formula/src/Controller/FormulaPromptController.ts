import { ComponentManager } from '@univerjs/base-ui';
import { Inject } from '@wendellhu/redi';

import { FunList } from '../Basics';
import { HelpFunction, SearchFunction } from '../View/UI/FormulaPrompt';
import { CellInputHandler } from './CellInputHandler';

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

    constructor(@Inject(ComponentManager) private _componentManager: ComponentManager) {
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
        this._componentManager.register(HelpFunction.name, HelpFunction);
    }

    private _mount() {
        // const richTextEle = this._sheetContainerUIController.getCellEditorUIController()._richTextEle;
        // this.richTextEle = richTextEle;
        // this.richTextEditEle = $$('div', this.richTextEle);
        // Register cell input formula support
        // this.cellInputHandler = new CellInputHandler(this.richTextEditEle);
    }

    private _onRichTextKeyDownObservable() {}

    private _onRichTextKeyUpObservable() {}

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
