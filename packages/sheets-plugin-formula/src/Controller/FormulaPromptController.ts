import { $$, getRefElement } from '@univer/base-component';
import { SheetPlugin } from '@univer/base-sheets';
import { KeyCode, PLUGIN_NAMES, SheetContext } from '@univer/core';
import { FORMULA_PLUGIN_NAME } from '../Basic';
import { FormulaPlugin } from '../FormulaPlugin';
import { HelpFunction, SearchFunction } from '../View/UI/FormulaPrompt';
import { CellInputHandler } from './CellInputHandler';

export class FormulaPromptController {
    private _context: SheetContext;

    private _sheetPlugin: SheetPlugin;

    private _searchFunction: SearchFunction;

    private _helpFunction: HelpFunction;

    cellInputHandler: CellInputHandler;

    richTextEle: HTMLElement;

    richTextEditEle: HTMLElement;

    constructor(private _plugin: FormulaPlugin) {
        this._context = this._plugin.getContext();

        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._initialize();
        this._initRegisterComponent();
    }

    private _initRegisterComponent() {
        this._sheetPlugin.registerModal(FORMULA_PLUGIN_NAME + SearchFunction.name, SearchFunction);
        this._sheetPlugin.registerModal(FORMULA_PLUGIN_NAME + HelpFunction.name, HelpFunction);
    }

    private _initialize() {
        this._sheetPlugin.getObserver('onRichTextDidMountObservable')?.add((cellEditor) => {
            this.richTextEle = getRefElement(cellEditor.container);
            this.richTextEditEle = $$('div', this.richTextEle);

            // Register cell input formula support
            this.cellInputHandler = new CellInputHandler(this.richTextEditEle);
        });

        this._sheetPlugin.getObserver('onRichTextKeyDownObservable')?.add((event: KeyboardEvent) => {
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
        this._sheetPlugin.getObserver('onRichTextKeyUpObservable')?.add((event: KeyboardEvent) => {
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

                const richTextEleRect = this.richTextEle.getBoundingClientRect();
                const position = {
                    left: richTextEleRect.left,
                    top: richTextEleRect.top + richTextEleRect.height,
                };
                if (formula[0]) {
                    this._searchFunction.updateState(true, formula, 0, position);
                    this._helpFunction.updateState(false);
                    // this.setState({
                    //     formula,
                    //     searchActive: true,
                    //     helpFormulaActive: false,
                    // });
                } else if (helpFormula[0]) {
                    this._helpFunction.updateState(true, helpFormula[1] as number, (helpFormula[0] as string).toUpperCase(), position);
                    this._searchFunction.updateState(false);

                    // this.setState({
                    //     formulaName: (helpFormula[0] as string).toUpperCase(),
                    //     paramIndex: helpFormula[1] as number,
                    //     helpFormulaActive: true,
                    //     searchActive: false,
                    // });
                } else {
                    this._searchFunction.updateState(false, formula);
                    this._helpFunction.updateState(false);
                    // this.setState({
                    //     formula,
                    //     searchActive: false,
                    //     helpFormulaActive: false,
                    // });
                }
            }
            const value = this.cellInputHandler.getInputValue();
            if (value.length > 0 && value.substr(0, 1) === '=' && (kcode !== 229 || value.length === 1)) {
                if (kcode === 13) {
                    event.preventDefault();
                    event.stopPropagation();
                    const searchFunctionState = this._searchFunction.getState();
                    // 搜索公式框打开时选择公式，关闭时执行公式
                    if (searchFunctionState.searchActive) {
                        const func = searchFunctionState.formula[searchFunctionState.selectIndex] as any;
                        this.cellInputHandler.searchFunctionEnter(func.n);
                        // this.setState({
                        //     formulaName: this.state.formula[this.state.funIndex].n,
                        //     paramIndex: 0,
                        //     helpFormulaActive: true,
                        //     searchActive: false,
                        // });
                    }
                }
            }
        });

        this._plugin.getObserver('onSearchFunctionDidMountObservable')!.add((component) => {
            this._searchFunction = component;
            console.log('get search function', component);
        });
        this._plugin.getObserver('onHelpFunctionDidMountObservable')!.add((component) => {
            this._helpFunction = component;

            console.log('get help function', component);
        });
    }
}
